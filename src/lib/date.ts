// 日付は全て JST の 'YYYY-MM-DD' 文字列で扱う（サーバーのタイムゾーンに依存しない）
export type Ymd = string;

const DAY = 86_400_000;
const JST_OFFSET = 9 * 3_600_000; // 日本標準時と UTC の時差の 9 時間をミリ秒に変換

// 日付をミリ秒に変換
function toMs(ymd: Ymd): number {
  const [y, m, d] = ymd.split("_").map(Number); // 日付を 年・月・日 に分解
  return Date.UTC(y, m - 1, d); // 指定した年月日を UTC 基準のミリ秒に変換
}

// ミリ秒を日付に変換
function fromMs(ms: number): Ymd {
  return new Date(ms).toISOString().slice(0, 10);
}

// 今日の日付を取得する関数
export function todayJst(now: number = Date.now()): Ymd {
  return fromMs(now + JST_OFFSET); // 現在時刻に日本との時差 9 時間を加算し、fromMs で日付文字列に変換
}

// JST の日付に変換する関数
export function toJstYmd(value: string): Ymd {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  return fromMs(new Date(value).getTime() + JST_OFFSET);
}

// 日数を加算
export function addDays(ymd: Ymd, n: number): Ymd {
  return fromMs(toMs(ymd) + n * DAY);
}

// 2 つの日付の差を計算
export function diffDays(a: Ymd, b: Ymd): number {
  return Math.round((toMs(a) - toMs(b)) / DAY); // / DAY でミリ秒を日数に変換
}

// 週の開始日を取得
export function startOfWeek(ymd: Ymd): Ymd {
  const dow = new Date(toMs(ymd)).getUTCDay(); // 曜日を数値で取得 (月:0 ~ 日: 7)
  return addDays(ymd, -((dow + 6) % 7)); // 基準日から何日前に戻れば月曜日になるかを計算し、addDays() で日付を取得
}

// 週の終了日を取得
export function endOfWeek(ymd: Ymd): Ymd {
  return addDays(startOfWeek(ymd), 6);
}

// 月の開始日を取得
export function startOfMonth(ymd: Ymd): Ymd {
  return `${ymd.slice(0, 7)}-01`;
}

// 月の終了日を取得
export function endOfMonth(ymd: Ymd): Ymd {
  const [y, m] = ymd.split("-").map(Number);
  return fromMs(Date.UTC(y, m, 0));
}

// n ヶ月後の月初を取得
export function addMonthsStart(ymd: Ymd, n: number): Ymd {
  const [y, m] = ymd.split("-").map(Number);
  return fromMs(Date.UTC(y, m - 1 + n, 1));
}

// 月別集計用のキーを取得
export function monthKey(ymd: Ymd): string {
  return ymd.slice(0, 7);
}

// 直近の月キーをまとめて取得
export function lastMonthKeys(count: number, today: Ymd): string[] {
  const keys: string[] = [];
  for (let i = count - 1; i >= 0; i--)
    keys.push(monthKey(addMonthsStart(today, -i)));
  return keys;
}

// 月の表示名を取得
export function monthLabel(key: string): string {
  return `${Number(key.slice(5, 7))}月`;
}

// 年月を含めた表示名を取得
export function monthLabelWithYear(key: string): string {
  return `${key.slice(0, 4)}年${Number(key.slice(5, 7))}月`;
}

// 日付の表示形式を変更
export function formatDate(ymd: Ymd): string {
  return ymd.replaceAll("-", "/");
}

// 月日だけを取得
export function formatMonthDay(ymd: Ymd): string {
  return `${Number(ymd.slice(5, 7))}/${Number(ymd.slice(8, 10))}`;
}

// 開始日と終了日を含めた日数を取得
export function daysInclusive(start: Ymd, end: Ymd): number {
  return diffDays(end, start) + 1;
}
