/* eslint-disable react-hooks/set-state-in-effect */
"use client";
import { useEffect, useRef, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { X } from "lucide-react";

const MSG_EMAIL = "メールアドレスを正しく入力してください。";
const MSG_PASSWORD = "パスワードを入力してください。";
const MSG_FAILED = "メースアドレスまたはパスワードが正しくありません。";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// 認証エラーを画面メッセージに分類（設定ミスを【パスワード誤り】と誤認させない）
function authErrorMessage(error: { status?: number; code?: string }): string {
  if (error.code === "INVALID_ORIGIN")
    return "このURLからのログインは許可されていません。BETTER_AUTH_URLの設定を確認してください。";
  if (error.status === 420)
    return "リクエスト制限に達しました。しばらくしてから再度お試しください。";
  // リクエストを送りすぎた場合
  if (error.status && error.status >= 500)
    return "予期しないエラーが発生しました。";
  return MSG_FAILED; // サーバー側でエラーが発生した場合
}

export default function LoginDialog({
  open,
  onClose,
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    form?: string;
  }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const emailRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setErrors({});
    setPassword("");
    // 入力欄を参照できる場合だけ focus() を実行
    emailRef.current?.focus();
    // Escape キーで閉じれるようにする・押された Key が Escape と一致したときに、 onClose を実行
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    // キーが押されたときにイベントを発生させる
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const next: typeof errors = {};

    if (!EMAIL_RE.test(email.trim())) next.email = MSG_EMAIL;
    if (!password) next.password = MSG_PASSWORD;
    setErrors(next);

    if (next.email || next.password) return;

    setIsSubmitting(true);

    try {
      // メールアドレスとパスワードを Better Auth に渡して、ログイン認証を実行
      const { error } = await authClient.signIn.email({
        email: email.trim(),
        password,
      });
      if (error) {
        setErrors({ form: authErrorMessage(error) });
        return;
      }
      onSuccess();
    } catch {
      setErrors({ form: "通信に失敗しました。" });
    } finally {
      setIsSubmitting(false);
    }
  }

  const inputCls =
    "w-full rounded-lg border border-line bg-surface2 p-2.5 text-fg outline-none transition-colors placeholder:text-placeholder focus:border-accent";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4"
      onMouseDown={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="login-title"
        className="fade-in w-full max-w-sm md:max-lg:max-w-md lg:max-w-lg rounded-card border border-line bg-surface p-6 shadow-2xl"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-senter justify-between">
          <h2
            id="login-title"
            className="font-bold text-lg md:max-lg:text-lg lg:text-xl"
          >
            ログイン
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="閉じる"
            className="rounded-full p-1.5 md:max-lg:p-2 lg:p-2 text-muted border border-line hover:text-fg"
          >
            <X size={18} />
          </button>
        </div>

        <form action="post" onSubmit={submit} noValidate className="space-y-4">
          <div>
            <label
              htmlFor="login-email"
              className="mb-1.5 block p-1 text-muted"
            >
              メールアドレス
            </label>
            <input
              id="login-email"
              ref={emailRef}
              type="email"
              autoComplete="username"
              placeholder="example@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputCls}
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? "login-email-err" : undefined}
            />
            {errors.email && (
              <p id="login-email-err" className="mt-1.5 text-sm text-danger">
                {errors.email}
              </p>
            )}
          </div>
          <div>
            <label
              htmlFor="login-password"
              className="mb-1.5 block p-1 text-muted"
            >
              パスワード
            </label>
            <input
              id="login-password"
              type="password"
              autoComplete="current-password"
              placeholder="abcde1234"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputCls}
              aria-invalid={Boolean(errors.password)}
              aria-describedby={
                errors.password ? "login-password-err" : undefined
              }
            />
            {errors.password && (
              <p id="login-password-err" className="mt-1.5 text-sm text-danger">
                {errors.password}
              </p>
            )}
          </div>
          {errors.form && (
            <p role="alert" className="text-sm text-danger">
              {errors.form}
            </p>
          )}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg bg-accent py-2.5 md:max-lg:py-3 lg:py-3.5 mt-4 md:max-lg:mt-5 lg:mt-6  font-bold text-bg transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {isSubmitting ? "確認中..." : "ログイン"}
          </button>
        </form>
      </div>
    </div>
  );
}

// KeyboardEvent: キーボード操作によって発生するイベントの情報を扱う型
// keydown: キーが押されたときにイベントを発生させる
// e.key: 実際に何のキーが押されたのかを取得する
// onMouseDown: マウスのボタンが押されたときに処理を実行する、React のイベント属性
// stopPropagation() : イベントが親要素へ伝わることを止めます
