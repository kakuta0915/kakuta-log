"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Clock, ListChecks, Upload } from "lucide-react";

const NAV = [
  {
    id: "output-link",
    href: "/output",
    label: "アウトプット",
    Icon: Upload,
    authOnly: false,
  },
  {
    id: "learning-time-link",
    href: "/learning-time",
    label: "学習時間",
    Icon: Clock,
    authOnly: false,
  },
  {
    id: "task-link",
    href: "/tasks",
    label: "タスク",
    Icon: ListChecks,
    authOnly: true,
  },
];

type NavProps = {
  isAuthenticated: boolean;
  variant: "desktop" | "mobile";
  onNavigate?: () => void;
};

export default function Nav({
  isAuthenticated,
  variant,
  onNavigate,
}: NavProps) {
  const pathname = usePathname();
  const items = NAV.filter((item) => !item.authOnly || isAuthenticated);
  const isMobile = variant === "mobile";

  return (
    <nav
      aria-label={isMobile ? "モバイルメニュー" : "メイン"}
      className={
        isMobile
          ? "flex flex-col"
          : "ml-2 hidden items-center gap-0.5 sm:flex lg:ml-6 lg:gap-2"
      }
    >
      {items.map(({ id, href, label, Icon }) => {
        const active = pathname === href;

        return (
          <Link
            key={id}
            id={isMobile ? undefined : id}
            href={href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={
              isMobile
                ? `flex w-full items-center justify-center gap-1 px-3 py-3 text-base ${
                    // 🔥🔥🔥🔥🔥🔥🔥🔥ここから下のレイアウトを確認する 🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥
                    active ? "bg-accent/10 font-bold text-accent" : "text-fg"
                  }`
                : `flex items-center gap-1.5 rounded-md px-2.5 py-2 text-xs transition-colors lg:px-3 lg:text-sm ${
                    active
                      ? "font-bold text-accent"
                      : "text-fg hover:text-accent"
                  }`
            }
          >
            <span className="flex items-center w-[120px]  gap-1">
              <span className="flex w-4 justify-center shrink-0">
                <Icon size={16} />
              </span>
              {label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
