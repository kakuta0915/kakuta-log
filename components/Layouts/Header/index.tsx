"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Nav } from "@/components";

export default function Header({
  isAuthenticated,
}: {
  isAuthenticated: boolean;
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <header className="flex p-4 px-6">
        <Link href="/" className="text-2xl font-bold">
          Kakuta Log
        </Link>

        <Nav isAuthenticated={isAuthenticated} variant="desktop" />

        {/* ハンバーガーメニュー */}
        <button
          type="button"
          aria-label={menuOpen ? "メニューを閉じる" : "メニューを開く"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((v) => !v)}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-line text-fg sm:hidden"
        >
          {menuOpen ? <X size={16} /> : <Menu size={16} />}
        </button>

        {menuOpen && (
          <div className="fade-in border-t border-line bg-surface px-4 pb-4 sm:hidden">
            <Nav
              isAuthenticated={isAuthenticated}
              variant="mobile"
              onNavigate={() => setMenuOpen(false)}
            />
          </div>
        )}
      </header>
    </>
  );
}

// 1. ハンバーガーメニュー実装からスタート
// 2. Navコンポーネント
// 3. 認証機能実装
