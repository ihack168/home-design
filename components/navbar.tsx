"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"

import { LineConsultButton } from "@/components/line-consult-button"

const navLinks = [
  { label: "首頁", href: "/" },
  { label: "建案作品", href: "/projects" },
  { label: "設計風格", href: "/styles" },
  { label: "裝潢知識", href: "/blog" },
]

function isActivePath(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/"
  }

  return pathname === href || pathname.startsWith(`${href}/`)
}

export function Navbar() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : ""

    return () => {
      document.body.style.overflow = ""
    }
  }, [mobileOpen])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMobileOpen(false)
      }
    }

    document.addEventListener("keydown", handleKeyDown)

    return () => {
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [])

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 border-b border-border/70 bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-24 max-w-7xl items-center justify-between px-5 md:px-8">
          {/* 品牌 */}
          <Link
            href="/"
            aria-label="台灣室內設計資訊網首頁"
            className="flex min-w-0 items-center gap-4"
          >
            <Image
              src="/images/logo.png"
              alt=""
              width={60}
              height={60}
              className="h-14 w-14 shrink-0 rounded-full object-cover"
              priority
            />

            <span className="min-w-0">
              <span className="block truncate text-2xl font-black tracking-tight text-foreground md:text-2xl">
                台灣室內設計資訊網
              </span>

              <span className="hidden text-sm text-muted-foreground lg:block">
                建案設計提案與居家裝潢靈感
              </span>
            </span>
          </Link>

          {/* 桌面版導覽 */}
          <nav
            aria-label="主要導覽"
            className="hidden items-center gap-5 lg:flex"
          >
            {navLinks.map((link) => {
              const active = isActivePath(pathname, link.href)

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={`relative whitespace-nowrap py-2 text-lg font-semibold transition-colors ${
                    active
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {link.label}

                  {active && (
                    <span
                      aria-hidden="true"
                      className="absolute inset-x-0 -bottom-0.5 mx-auto h-0.5 rounded-full bg-accent"
                    />
                  )}
                </Link>
              )
            })}

            <LineConsultButton className="whitespace-nowrap rounded-full bg-[#06C755] px-6 py-3 text-lg font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:opacity-90 hover:shadow-md">
              LINE 免費諮詢
            </LineConsultButton>
          </nav>

          {/* 手機版選單按鈕 */}
          <button
            type="button"
            onClick={() => setMobileOpen((open) => !open)}
            aria-label={mobileOpen ? "關閉選單" : "開啟選單"}
            aria-expanded={mobileOpen}
            aria-controls="mobile-navigation"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-border bg-white/70 text-foreground transition-colors hover:bg-secondary lg:hidden"
          >
            <span className="sr-only">
              {mobileOpen ? "關閉選單" : "開啟選單"}
            </span>

            <span
              className="relative block h-5 w-6"
              aria-hidden="true"
            >
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

      {/* 手機版選單 */}
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
                const active = isActivePath(pathname, link.href)

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    aria-current={active ? "page" : undefined}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center justify-between py-5 text-lg font-bold transition-colors ${
                      active
                        ? "text-accent"
                        : "text-foreground active:text-primary"
                    }`}
                  >
                    <span>{link.label}</span>

                    <span
                      aria-hidden="true"
                      className={`transition-transform ${
                        active ? "translate-x-1 text-accent" : ""
                      }`}
                    >
                      →
                    </span>
                  </Link>
                )
              })}
            </div>

            <div className="mt-auto border-t border-border/70 pt-6">
              <LineConsultButton className="flex w-full items-center justify-center rounded-full bg-[#06C755] px-6 py-4 text-base font-semibold text-white shadow-sm">
                加入 LINE 免費諮詢
              </LineConsultButton>
            </div>
          </nav>
        </div>
      )}
    </>
  )
}
