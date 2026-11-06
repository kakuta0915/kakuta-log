/* eslint-disable react-hooks/set-state-in-effect */
"use client";
import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { authClient } from "@/lib/auth-client";

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
    "w-full rounded-lg border border-line bg-surface2 px-3 py-2.5 text-fg outline-none transition-colors placeholder:text-muted focus:border-accent";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="login-title"
      className="fade-in w-full max-w-sm rounded-card border border-line bg-surface p-6 shadow-2xl"
      onMouseDown={(e) => e.stopPropagation()}
    >
      <div className="mb-5 flex items-senter justify-between">
        <h2 id="login-title" className="">
          ログイン
        </h2>
        ここからスタート🔥🔥🔥🔥
      </div>
    </div>
  );
}

// KeyboardEvent: キーボード操作によって発生するイベントの情報を扱う型
// keydown: キーが押されたときにイベントを発生させる
// e.key: 実際に何のキーが押されたのかを取得する
// onMouseDown: マウスのボタンが押されたときに処理を実行する、React のイベント属性
// stopPropagation() : イベントが親要素へ伝わることを止めます
