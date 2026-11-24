// microCMS からブログ記事を取得し、アプリで扱いやすいデータ形式に変換
import { addMonthsStart, startOfMonth, toJstYmd, type Ymd } from "./date";
import { HttpError } from "./errors";
import type { BlogArticle } from "./types";

// microCMS 側のフィールド名。ブログのスキーマに合わせてここだけ変更すればよい。
const FIELDS = {
  title: "title",
  publishedAt: "publishedAt",
  categories: "categories",
  domain: "field",
};

// microCMS から取得した値を、文字列に統一
function nameOf(v: unknown): string {
  if (!v) return "";
  if (typeof v === "string") return v;
  if (Array.isArray(v)) return nameOf(v[0]);
  if (typeof v === "object") {
    const o = v as Record<string, unknown>;
    return nameOf(o.name ?? o.title ?? ""); // name がなければ title を使い、どちらもなければ空文字列を使う。
  }
  return "";
}

// microCMS の記事一覧 API から返ってくるデータの構造を定義
interface ListResponse {
  contents: Record<string, unknown>[]; // 取得した記事の一覧
  totalCount: number; // 該当する記事の総数
  offset: number; // 取得開始位置
  limit: number; // 	1 回に取得する件数
}

// 直近 13 ヶ月分の記事を取得する（月次グラフ + 今日/今週/今月の集計に必要な範囲）
export async function fetchBlogArticles(today: Ymd): Promise<BlogArticle[]> {
  const domainName = process.env.MICROCMS_SERVICE_DOMAIN!;
  const endpoint = process.env.MICROCMS_BLOG_ENDPOINT;
  const since = `${addMonthsStart(startOfMonth(today), -12)}T00:00:00.000+09:00`;
  const items: BlogArticle[] = []; // 取得した記事を格納
  let offset = 0; // 記事を取得するときの開始位置

  for (;;) {
    // API に渡す検索条件
    const qs = new URLSearchParams({
      limit: "100",
      offlet: String(offset),
      orders: `-${FIELDS.publishedAt}`,
      filters: `${FIELDS.publishedAt}[greater_than]${since}`,
    });

    // microCMS にリクエストを送信
    const res = await fetch(
      `https://${domainName}.microcms.io/api/v1/${endpoint}?${qs}`,
      {
        headers: {
          "X-MICROCMS-API-KEY": process.env.MICROCMS_API_KEY!,
        },
        next: { revalidate: 300 },
        signal: AbortSignal.timeout(20_000),
      },
    );

    if (!res.ok) throw new HttpError(res.status);

    // 取得した JSON をデータとして扱う
    const json = (await res.json()) as ListResponse;

    // 記事ごとに必要な情報を取り出す
    for (const c of json.contents) {
      const published = (c[FIELDS.publishedAt] ?? c.createdAt) as
        | string
        | undefined;

      if (!published) continue;

      const category = nameOf(c[FIELDS.categories]);

      items.push({
        id: String(c.id),
        title: String(c[FIELDS.title] ?? ""),
        category: category || "未分類",
        domain: nameOf(c[FIELDS.domain]),
        date: toJstYmd(published),
      });
    }

    offset += json.contents.length;

    if (json.contents.length === 0 || offset >= json.totalCount) break;
  }

  return items;
}

/* 補足
・for (;;) は、終了条件を指定せずに繰り返すループ
  後続の処理で終了条件を判定する。
・orders: `-${FIELDS.publishedAt}`, の - は、降順（新しいものから古いものへ）を指している。
・of は、配列などの中に入っている要素を 1つずつ取り出す ために使う。
・?? は Null 合体演算子で、左側の値が null または undefined の場合に、右側の値を使用する
・if (!published) continue; の continue は、現在の繰り返し処理をそこで終了し、次の繰り返しに進むという意味
*/
