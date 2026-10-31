import { betterAuth } from "better-auth";
import { LibsqlDialect } from "@libsql/kysely-libsql";

export const auth = betterAuth({
  database: {
    dialect: new LibsqlDialect({
      url: process.env.AUTH_DATABASE_URL!,
      authToken: process.env.AUTH_DATABASE_AUTH_TOKEN,
    }),
    type: "sqlite",
  },
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,
  emailAndPassword: {
    enabled: true, //メールアドレスとパスワードによる認証を有効にする
    disableSignUp: process.env.AUTH_ALLOW_SIGNUP !== "true", // 新規ユーザーを許可
    minPasswordLength: 8,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 30, // セッション有効期限は30日
  },
});
