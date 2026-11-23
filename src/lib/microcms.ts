// microCMS からブログ記事を取得し、アプリで扱いやすいデータ形式に変換
import { addMonthsStart, startOfMonth, toJstYmd, type Ymd } from "./date";
import { HttpError } from "./errors";
import type { BlogArticle } from "./types";

// microCMS 側のフィールド名。ブログのスキーマに合わせてここだけ変更すればよい。
const FIELDS = {
  title: "title",
  publishedAt: "publishedAt",
  categories: "categories",
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
}
