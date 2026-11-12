// セッション情報を取得し、その結果を Header に渡すコンポーネント
import { getSessionSafe } from "@/lib/session";
import { Header } from "@/components";

export default async function SessionHeader() {
  const session = await getSessionSafe();

  // 認証状態を true or false に返還
  return <Header isAuthenticated={!!session} />;
}
