import { betterAuth } from "better-auth";
import { LibsqlDialect } from "@libsql/kysely-libsql";

export const auth = betterAuth({
  // データベース接続先（Turso）
  database: {
    //データベースとの接続方式を指定（Better AuthとTursoをつなぐ）
    dialect: new LibsqlDialect({
      url: process.env.AUTH_DATABASE_URL!,
      authToken: process.env.AUTH_DATABASE_AUTH_TOKEN,
    }),
    type: "sqlite", //データベースの種類（SQLite）
  },
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,
  emailAndPassword: {
    enabled: true, // 認証方式（メールアドレス・パスワード）
    disableSignUp: process.env.AUTH_ALLOW_SIGNUP !== "true", // 新規ユーザー登録の許可設定
    minPasswordLength: 8, // パスワードの最低文字数
  },
  session: {
    expiresIn: 60 * 60 * 24 * 30, // セッション有効期限は30日
  },
});
