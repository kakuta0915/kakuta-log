// 認証テーブル作成・管理ユーザー作成を行う
for (const f of [".env.local", ".env"]) {
  try {
    process.loadEnvFile(f);
  } catch {
    // ファイルが無ければ無視
  }
}

async function main() {
  const email = process.env.AUTH_ADMIN_EMAIL;
  const password = process.env.AUTH_ADMIN_PASSWORD;
  if (!email || !password) {
    console.error(
      "AUTH_ADMIN_EMAIL と AUTH_ADMIN_PASSWORD を設定してください。",
    );
    process.exit(1);
  }

  // Turso の接続情報を確認
  if (!process.env.AUTH_DATABASE_URL || !process.env.AUTH_DATABASE_AUTH_TOKEN) {
    console.error(
      "AUTH_DATABASE_URL と AUTH_DATABASE_AUTH_TOKEN を設定してください。",
    );
    process.exit(1);
  }

  // このスクリプトの間だけサインアップを許可
  process.env.AUTH_ALLOW_SIGNUP = "true";

  const { auth } = await import("@/lib/auth");
  const { getMigrations } = await import("better-auth/db/migration");

  const { runMigrations } = await getMigrations(auth.options);
  await runMigrations();
  console.log("✔ 認証テーブルを作成/更新しました");

  // 指定したメールアドレスのユーザーが既に存在するか確認し、存在しなければ新しいユーザーを登録
  const ctx = await auth.$context;
  const existing = await ctx.internalAdapter.findUserByEmail(email);
  if (existing) {
    console.log(`${email}はすでに登録済みです（変更なし）`);
    return;
  }
  await auth.api.signUpEmail({ body: { email, password, name: "Kakuta" } });
  console.log(`✓ 管理ユーザーを作成しました: ${email}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

// runMigrations: Better Auth が用意している関数
// 動的インポート: 自分で runMigrations をインポートするのではなく、getMigrations の戻り値から取得している
// auth: Better Auth のインスタンス
// $context: Better Auth が用意しているプロパティで、認証処理に必要な内部情報や機能にアクセスするためのもの
// findUserByEmail(): 指定したメールアドレスのユーザーがデータベースに存在するか確認
