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
      {/* タブレッドサイズ・デスクトップサイズで各設定が行なわれていない❌️❌️❌️ */}
      <header className="sticky top-0 z-40 flex items-center border-b border-line bg-surface backdrop-blur p-4 px-6">
        <Link href="/" className="text-2xl font-bold">
          Kakuta Log
        </Link>

        <Nav isAuthenticated={isAuthenticated} variant="desktop" />

        {/* Mobile Size  */}
        <div className="ml-auto md:hidden">
          <button
            type="button"
            aria-label={menuOpen ? "メニューを閉じる" : "メニューを開く"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
            className="flex justify-center items-center ml-auto h-8 w-8 rounded-full border border-line text-fg"
          >
            {menuOpen ? <X size={16} /> : <Menu size={16} />}
          </button>

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

// 1. ハンバーガーメニュー実装からスタート
// 2. Navコンポーネント
// 3. 認証機能実装
