// 認証リクエストを受け付ける API の窓口を定義
import { toNextJsHandler } from "better-auth/next-js"; //
import { auth } from "@/lib/auth";

export const { GET, POST } = toNextJsHandler(auth);

// toNextJsHandlerは、 Better Authの認証処理を、Next.jsのRoute Handlerで扱える形式に変換する関数
// toNextJsHandler(auth) によって、Better Authの設定をもとにGET・POST用の処理を生成し、それぞれNext.jsに公開している。
// Next.jsでは、この配置によって /api/auth/*vが認証用のエンドポイントになる。
// [...all] はキャッチオールルートと呼ばれ、/api/auth/ 以下のさまざまなパスを受け取る。
// 例えば、ログインやセッション取得など、Better Authが使用する複数のエンドポイントをこの1つのファイルで処理できまる。
