import { Client } from "@notionhq/client";
import { addMonthsStart, startOfMonth, toJstYmd, type Ymd } from "./date";
// import type {
//   CategoryInfo,
//   ChildTask,
//   ParentTask,
//   LearnSession,
// } from "./types";

// Notion API クライアント
export const notion = new Client({
  auth: process.env.NOTION_API_KEY,
  notionVersion: "2025-09-03",
});

// Notion のプロパティ名
export const NOTION_SCHEMA = {
  category: {
    name: "カテゴリ名",
    domain: "学習分野",
  },
  learn: {
    title: "タイトル",
    category: "カテゴリ DB",
    date: "日付",
    start: "学習・作業開始",
    end: "学習・作業終了",
    minutes: "学習時間（分）",
  },
  parent: {
    name: "学習親タスク名",
    progress: "進捗",
    priority: "優先度",
    children: "学習子タスク DB",
    category: "カテゴリ DB",
    period: "実行日・実行期間",
    completed: "親タスク完了日",
  },
  child: {
    name: "学習子タスク名",
    progress: "進捗",
    parent: "学習親タスク DB",
    category: "カテゴリ DB",
    period: "実行日・実行期間",
    completed: "子タスク完了日",
  },
};

// Notion のプロパティ型
type Prop = {
  type: string;
  [key: string]: unknown;
};

interface Page {
  id: string;
  properties: Record<string, Prop | undefined>;
}

// データソース ID のキャッシュ
const dataSourceCache = new Map<string, string>();

// データベース ID からデータソース ID を取得
async function getDataSourceId(databaseId: string): Promise<string> {
  const cached = dataSourceCache.get(databaseId);

  if (cached) return cached;

  const database = await notion.databases.retrieve({
    database_id: databaseId,
  });

  const dataSources = (database as { data_sources?: { id: string }[] })
    .data_sources;

  const id = dataSources?.[0]?.id;

  if (!id) {
    throw new Error(`データソースが見つかりません: ${databaseId}`);
  }

  dataSourceCache.set(databaseId, id);

  return id;
}

// データベースの全データを取得
async function queryAll(databaseId: string, filter?: unknown): Promise<Page[]> {
  const dataSourceId = await getDataSourceId(databaseId);

  const pages: Page[] = [];
  let cursor: string | undefined;

  do {
    const response = await notion.dataSources.query({
      data_source_id: dataSourceId,
      page_size: 100,
      start_cursor: cursor,
      ...(filter
        ? {
            filter: filter as Parameters<
              typeof notion.dataSources.query
            >[0]["filter"],
          }
        : {}),
    });

    pages.push(...(response.results as unknown as Page[]));

    cursor = response.has_more
      ? (response.next_cursor ?? undefined)
      : undefined;
  } while (cursor);

  return pages;
}

// ---- プロパティ読み取りヘルパ ----

// タイトル
const title = (p?: Prop): string =>
  p?.type === "title" && Array.isArray(p.title)
    ? p.title
        .map((t) => {
          if (
            typeof t === "object" &&
            t !== null &&
            "plain_text" in t &&
            typeof t.plain_text === "string"
          ) {
            return t.plain_text;
          }

          return "";
        })
        .join("")
    : "";

// セレクト・ステータス
const select = (p?: Prop): string =>
  p?.type === "select"
    ? typeof p.select === "object" &&
      p.select !== null &&
      "name" in p.select &&
      typeof p.select.name === "string"
      ? p.select.name
      : ""
    : p?.type === "status"
      ? typeof p.status === "object" &&
        p.status !== null &&
        "name" in p.status &&
        typeof p.status.name === "string"
        ? p.status.name
        : ""
      : "";

// リレーション
const relationIds = (p?: Prop): string[] =>
  p?.type === "relation" && Array.isArray(p.relation)
    ? p.relation.flatMap((r) =>
        typeof r === "object" &&
        r !== null &&
        "id" in r &&
        typeof r.id === "string"
          ? [r.id]
          : [],
      )
    : [];

// 数値・数式
const formulaNumber = (p?: Prop): number | null =>
  p?.type === "formula" &&
  typeof p.formula === "object" &&
  p.formula !== null &&
  "type" in p.formula &&
  p.formula.type === "number" &&
  "number" in p.formula &&
  (typeof p.formula.number === "number" || p.formula.number === null)
    ? p.formula.number
    : p?.type === "number" &&
        (typeof p.number === "number" || p.number === null)
      ? p.number
      : null;

// 日付
const dateRange = (
  p?: Prop,
): {
  start?: Ymd;
  end?: Ymd;
  startRaw?: string;
  endRaw?: string;
} => {
  if (
    p?.type !== "date" ||
    typeof p.date !== "object" ||
    p.date === null ||
    !("start" in p.date) ||
    typeof p.date.start !== "string"
  ) {
    return {};
  }

  const start = p.date.start;
  const end =
    "end" in p.date && typeof p.date.end === "string" ? p.date.end : undefined;

  return {
    start: toJstYmd(start),
    end: end ? toJstYmd(end) : undefined,
    startRaw: start,
    endRaw: end,
  };
};

// 優先度
const priorityOf = (name: string): number =>
  [...name].filter((c) => c === "☆" || c === "★").length;

// ---- カテゴリ ----

export async function fetchCategories(): Promise<Map<string, CategoryInfo>> {
  const S = NOTION_SCHEMA.category;

  const pages = await queryAll(process.env.NOTION_CATEGORY_DB_ID!);

  const map = new Map<string, CategoryInfo>();

  for (const p of pages) {
    map.set(p.id, {
      id: p.id,
      name: title(p.properties[S.name]),
      domain: select(p.properties[S.domain]) || "その他",
    });
  }

  return map;
}

// ---- 学習時間（直近 13 ヶ月分）----

export async function fetchLearnSessions(today: Ymd): Promise<{
  categories: CategoryInfo[];
  sessions: LearnSession[];
}> {
  const S = NOTION_SCHEMA.learn;

  const since = addMonthsStart(startOfMonth(today), -12);

  const [categories, pages] = await Promise.all([
    fetchCategories(),
    queryAll(process.env.NOTION_Learn_TIME_DB_ID!, {
      property: S.date,
      date: { on_or_after: since },
    }),
  ]);

  const sessions: LearnSession[] = [];

  for (const p of pages) {
    const d = dateRange(p.properties[S.date]);

    if (!d.start) continue;

    let minutes = formulaNumber(p.properties[S.minutes]);

    if (minutes == null) {
      const st = dateRange(p.properties[S.start]);
      const en = dateRange(p.properties[S.end]);

      minutes =
        st.startRaw && en.startRaw
          ? Math.max(
              0,
              (new Date(en.startRaw).getTime() -
                new Date(st.startRaw).getTime()) /
                60000,
            )
          : 0;
    }

    const cat = categories.get(relationIds(p.properties[S.category])[0] ?? "");

    sessions.push({
      id: p.id,
      title: title(p.properties[S.title]),
      domain: cat?.domain ?? "その他",
      category: cat?.name ?? "未分類",
      date: d.start,
      minutes: Math.round(minutes),
    });
  }

  return {
    categories: [...categories.values()],
    sessions,
  };
}

// ---- タスク（親 + 子）----

export async function fetchTasks(): Promise<ParentTask[]> {
  const P = NOTION_SCHEMA.parent;
  const C = NOTION_SCHEMA.child;

  const [categories, parentPages, childPages] = await Promise.all([
    process.env.NOTION_CATEGORY_DB_ID
      ? fetchCategories()
      : Promise.resolve(new Map<string, CategoryInfo>()),
    queryAll(process.env.NOTION_PARENT_TASK_DB_ID!),
    queryAll(process.env.NOTION_CHILD_TASK_DB_ID!),
  ]);

  // 親・子タスク共通のデータ変換
  const toBase = (p: Page, S: typeof P | typeof C) => {
    const period = dateRange(p.properties[S.period]);
    const completed = dateRange(p.properties[S.completed]).start;

    const cat = categories.get(relationIds(p.properties[S.category])[0] ?? "");

    return {
      id: p.id,
      name: title(p.properties[S.name]),
      progress: select(p.properties[S.progress]),
      priority:
        "priority" in S ? priorityOf(select(p.properties[S.priority])) : 0,
      start: period.start,
      end: period.end,
      completed,
      category: cat?.name,
      domain: cat?.domain,
    };
  };

  // 子タスクの取得・変換
  const children: ChildTask[] = childPages.map((p) => ({
    ...toBase(p, C),
    parentId: relationIds(p.properties[C.parent])[0],
  }));

  // 親タスクごとに子タスクをまとめる
  const byParent = new Map<string, ChildTask[]>();

  for (const child of children) {
    if (!child.parentId) continue;

    byParent.set(child.parentId, [
      ...(byParent.get(child.parentId) ?? []),
      child,
    ]);
  }

  // 親タスクに子タスクを紐付ける
  return parentPages.map((p) => ({
    ...toBase(p, P),
    children: byParent.get(p.id) ?? [],
  }));
}
