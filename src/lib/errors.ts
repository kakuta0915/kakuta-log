// JavaScript 標準の Error クラスを継承
export class HttpError extends Error {
  constructor(
    public status: number,
    message?: string,
  ) {
    // super()：親クラスである Error のコンストラクタを呼び出す
    super(message ?? `HTTP ${status}`);
    this.name = "HttpError";
  }
}

// 外部 API のエラーを画面表示用のメッセージに分類
export function toMessage(e: unknown): string {
  // 受け取ったエラーが HttpError かどうかを確認
  if (e instanceof HttpError) {
    const s = e.status;

    if (s === 401 || s === 403) return "認証に失敗しました。";
    if (s === 404) return "データが見つかりませんでした。";
    if (s === 429)
      return "リクエスト制限に達しました。しばらくしてから再度お試しください。";
    if (s >= 500 && s < 600) return "外部サービスで問題が発生しています。";
    return "予期しないエラーが発生しました。";
  }

  // HTTP ステータスコード以外の通信関連エラーを判定
  if (
    e instanceof Error &&
    (e.name === "TimeoutError" ||
      e.name === "AbortError" ||
      e instanceof TypeError)
  ) {
    return "通信に失敗しました。";
  }

  return "予期しないエラーが発生しました。";
}

// データ取得結果の型を定義
// ok: データ取得の成功・失敗 / data: T：取得したデータを保存 / message: string：エラーメッセージを保存
export type Loaded<T> = { ok: true; data: T } | { ok: false; message: string };

// データ取得とエラー処理をまとめる
export async function loadWith<T>(
  source: string, // エラー発生元を識別する名前
  run: () => Promise<T>, // 実行するデータ取得処理
): Promise<Loaded<T>> {
  try {
    const data = await run();
    return { ok: true, data };
  } catch (e) {
    console.error(`[${source}]`, e);
    return { ok: false, message: toMessage(e) };
  }
}

// API から JSON データを取得
export async function fetchJson<T>(
  url: string, // API の URL
  init: RequestInit & { next?: { revalidate?: number } } = {}, // 通信に関する設定
): Promise<T> {
  // 指定された URL に HTTP リクエストを送る
  const res = await fetch(url, {
    ...init,
    signal: AbortSignal.timeout(20_000), // 通信が 20,000 ミリ秒（20 秒）を超えた場合に中断
  });

  // res.ok は、HTTP ステータスコードが成功を示す範囲（200〜299）かどうかを表す
  if (!res.ok) throw new HttpError(res.status);

  // レスポンスの JSON データを JavaScript で扱える形式に変換し、T 型に変換
  return (await res.json()) as T;
}

/* 補足
・RequestInit は fetch の通信設定に使えるプロパティをまとめた型
・RequestInit: TypeScript に用意されている型
・{ next?: { revalidate?: number } }: Next.js で用意されている独自のキャッシュ設定
  ・next: Next.js の追加設定
  ・revalidate: キャッシュを再検証する間隔
  ・number: 数値を指定する
*/
