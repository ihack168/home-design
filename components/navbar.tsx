"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { LineConsultButton } from "@/components/line-consult-button";

const navLinks = [
  { label: "首頁", href: "/" },
  { label: "房東補助", href: "/landlord-subsidies" },
  { label: "公益出租人", href: "/public-landlord" },
  { label: "房東節稅", href: "/landlord-tax" },
  { label: "包租代管", href: "/property-management" },
  { label: "最新文章", href: "/blog" },
];

function isActivePath(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMobileOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 border-b border-border/70 bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 md:px-8">
          <Link
            href="/"
            aria-label="台灣社會住宅包租代管資訊站首頁"
            className="flex min-w-0 items-center gap-3"
          >
            <img
              src="/images/logo.png"
              alt=""
              width={40}
              height={40}
              className="h-10 w-10 shrink-0 rounded-full object-cover"
            />

            <span className="min-w-0">
              <span className="block truncate text-base font-black tracking-tight text-foreground md:text-lg">
                台灣社會住宅包租代管資訊站
              </span>

              <span className="hidden text-xs text-muted-foreground lg:block">
                凌群不動產建立並經營
              </span>
            </span>
          </Link>

          <nav aria-label="主要導覽" className="hidden items-center gap-6 lg:flex">
            {navLinks.map((link) => {
              const active = isActivePath(pathname, link.href);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={`text-sm font-semibold transition-colors ${
                    active
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}

            <LineConsultButton className="rounded-full bg-[#06C755] px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90">
              LINE 免費諮詢
            </LineConsultButton>
          </nav>

          <button
            type="button"
            onClick={() => setMobileOpen((open) => !open)}
            aria-label={mobileOpen ? "關閉選單" : "開啟選單"}
            aria-expanded={mobileOpen}
            aria-controls="mobile-navigation"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-border text-foreground lg:hidden"
          >
            <span className="sr-only">
              {mobileOpen ? "關閉選單" : "開啟選單"}
            </span>

            <span className="relative block h-5 w-6" aria-hidden="true">
              <span
                className={`absolute left-0 top-0.5 h-0.5 w-6 bg-current transition-transform ${
                  mobileOpen ? "translate-y-2 rotate-45" : ""
                }`}
              />

              <span
                className={`absolute left-0 top-2.5 h-0.5 w-6 bg-current transition-opacity ${
                  mobileOpen ? "opacity-0" : ""
                }`}
              />

              <span
                className={`absolute left-0 top-[18px] h-0.5 w-6 bg-current transition-transform ${
                  mobileOpen ? "-translate-y-2 -rotate-45" : ""
                }`}
              />
            </span>
          </button>
        </div>
      </header>

      {mobileOpen && (
        <div
          id="mobile-navigation"
          className="fixed inset-0 z-40 bg-background pt-20 lg:hidden"
        >
          <nav
            aria-label="手機版主要導覽"
            className="flex h-full flex-col overflow-y-auto px-6 pb-8"
          >
            <div className="divide-y divide-border/70 border-t border-border/70">
              {navLinks.map((link) => {
                const active = isActivePath(pathname, link.href);

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    aria-current={active ? "page" : undefined}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center justify-between py-5 text-lg font-bold transition-colors ${
                      active
                        ? "text-primary"
                        : "text-foreground active:text-primary"
                    }`}
                  >
                    {link.label}
                    <span aria-hidden="true">→</span>
                  </Link>
                );
              })}
            </div>

            <div className="mt-auto border-t border-border/70 pt-6">
              <LineConsultButton className="flex w-full items-center justify-center rounded-full bg-[#06C755] px-6 py-4 text-base font-semibold text-white">
                加入 LINE 免費諮詢
              </LineConsultButton>

              <p className="mt-5 text-center text-xs leading-6 text-muted-foreground">
                本站由凌群不動產建立並經營，非政府官方網站。
              </p>
            </div>
          </nav>
        </div>
      )}
    </>
  );
}
