/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Menu, X } from "lucide-react";
import { Nav } from "@/components";
import router from "next/router";

export default function Header({
  isAuthenticated,
}: {
  isAuthenticated: boolean;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [loginOpen, setLoginOpen] = useState(false);

  useEffect(() => setMounted(true), []);
  useEffect(() => setMenuOpen(false), [pathname]);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  const closeLogin = useCallback(() => setLoginOpen(false), []);

  async function logout() {
    await authClient.signOut();
    setMenuOpen(false);
    setToast("ログアウトしました");
    if (pathname.startsWith("/tasks")) router.push("/");
    router.refresh();
  }

  // 🔥🔥🔥🔥🔥ここに実装する🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥

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
            </div>
          )}
        </div>
      </header>
    </>
  );
}
