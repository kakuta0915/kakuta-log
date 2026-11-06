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
          ? "flex md:hidden flex-col items-center gap-1"
          : "hidden md:flex flex-row items-center md:max-lg:gap-2 md:max-lg:ml-7 lg:ml-15 lg:gap-3"
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
            className={`flex items-center justify-center ${
              isMobile
                ? `w-full p-3e ${
                    active ? "bg-accent/10 font-bold text-accent" : "text-fg"
                  }`
                : `transition-colors pt-3 pb-0 md:max-lg:px-1 lg:px-2 ${
                    active
                      ? "font-bold text-accent"
                      : "text-fg hover:text-accent"
                  }`
            }`}
          >
            <span className="flex items-center w-30 gap-1 md:w-fit text-base md:max-lg:text-sm lg:text-lg">
              <span className="flex justify-center shrink-0 w-4 md:max-lg:w-3.5 lg:w-4.5">
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
