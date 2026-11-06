/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Menu, X, LogIn, LogOut } from "lucide-react";
import { Nav } from "@/components";
import LoginDialog from "@/components/LoginDialog";

export default function Header({
  isAuthenticated,
}: {
  isAuthenticated: boolean;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false); // ログインダイアログの表示状態

  useEffect(() => setMounted(true), []);
  useEffect(() => setMenuOpen(false), [pathname]);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  // ログインダイアログを閉じる処理
  const closeLoginDialog = useCallback(() => setIsLoginDialogOpen(false), []);

  async function logout() {
    await authClient.signOut();
    setMenuOpen(false);
    setToast("ログアウトしました");
    if (pathname.startsWith("/tasks")) router.push("/");
    router.refresh();
  }

  const btnCls =
    "flex items-center gap-1 rounded-full border border-accent p-3 text-base font-bold text-accent transition-colors hover:bg-accent hover:text-bg md:max-lg:text-sm md:max-lg:py-1 px-2.5 lg:text-lg lg:py-1.5 px-3";

  // PC 用とモバイル用のボタンで id が重複しないように、モバイル用には "-mobile" を付けられるようにする
  const authBtn = (suffix = "") =>
    isAuthenticated ? (
      <button
        id={`logout-btn${suffix}`}
        type="button"
        onClick={logout}
        className={btnCls}
      >
        <LogOut size={16} /> ログアウト
      </button>
    ) : (
      <button
        id={`login-btn${suffix}`}
        type="button"
        onClick={() => {
          setMenuOpen(false);
          setIsLoginDialogOpen(true);
        }}
        className={btnCls}
      >
        <LogIn size={16} /> ログイン
      </button>
    );

  return (
    <>
      <header className="sticky top-0 z-40 flex items-center border-b border-line bg-surface backdrop-blur p-4 px-6">
        <Link
          href="/"
          className="font-bold text-2xl md:max-lg:text-2xl lg:text-3xl"
        >
          Kakuta Log
        </Link>

        <Nav isAuthenticated={isAuthenticated} variant="desktop" />

        {/* PC 用ログイン・ログアウトボタン */}
        <div className="hidden md:block">{authBtn()}</div>

        {/* Mobile Size  */}
        <div className="ml-auto md:hidden">
          <button
            type="button"
            aria-label={menuOpen ? "メニューを閉じる" : "メニューを開く"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)} // ボタンをクリックすると、現在の menuOpen の値を反転
            className="flex justify-center items-center h-8 w-8 rounded-full border border-line text-fg"
          >
            {menuOpen ? <X size={16} /> : <Menu size={16} />}
          </button>

          {/* menuOpen が true のときだけ、メニューを表示 */}
          {menuOpen && (
            <div className="absolute left-0 top-full w-full border-b border-line border-t bg-surface2 px-8 py-6 md:hidden">
              <Nav
                isAuthenticated={isAuthenticated}
                variant="mobile"
                onNavigate={() => setMenuOpen(false)}
              />
              <div className="my-2 border-t border-line" />
              <div className="[&>button]:w-full [&>button]:justify-center [&>button]:py-3">
                {authBtn("-mobile")}
              </div>
            </div>
          )}
        </div>
      </header>
      <LoginDialog
        open={loginOpen}
        onClose={closeLoginDialog}
        onSuccess={() => {
          setLoginOpen(false);
          router.push("/tasks");
          router.refresh();
        }}
      />
    </>
  );
}
