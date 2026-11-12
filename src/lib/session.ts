// サーバー(Better Auth)でセッション情報の取得を行う関数
import { headers } from "next/headers";
import { auth } from "./auth";

export async function getSessionSafe() {
  // Next.js から現在のリクエストヘッダーを取得
  const h = await headers();
  try {
    // ヘッダー情報を Better Auth に渡してセッションを確認
    // ログイン中：セッション情報を返す・未ログイン：null を返す
    return await auth.api.getSession({ headers: h });
  } catch (e: unknown) {
    console.error("[auth] getSession failed", e);
    return null; // 認証ストレージに繋がらなくても画面は未認証として表示
  }
}

// headers()は、 Next.js が内部エラーを投げることがあるので try の外で呼ぶ
// auth.api.getSession() は Better Auth が提供する関数
