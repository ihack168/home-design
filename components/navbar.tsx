"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"

import { LineConsultButton } from "@/components/line-consult-button"

type NavLink = {
  label: string
  href: string
  danger?: boolean
}

const navLinks: NavLink[] = [
  { label: "首頁", href: "/" },
  { label: "居家設計", href: "/blog" },
  { label: "商業設計", href: "/blog" },
  { label: "套房設計", href: "/blog" },
  { label: "檢舉業者", href: "/warning", danger: true },
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
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = mobileOpen ? "hidden" : originalOverflow

    return () => {
      document.body.style.overflow = originalOverflow
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

  /*
   * 「建案設計、商業設計、套房設計」目前都連到 /blog。
   * 為避免三個項目同時顯示為選取狀態，只讓第一個相同網址的項目顯示 active。
   * 未來若建立不同頁面，請把三個 href 改成各自的網址。
   */
  const getIsActive = (link: NavLink, index: number) => {
    const firstSameHrefIndex = navLinks.findIndex(
      (item) => item.href === link.href
    )

    return index === firstSameHrefIndex && isActivePath(pathname, link.href)
  }

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 border-b border-border/70 bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 xl:h-24 xl:px-8">
          <Link
            href="/"
            aria-label="台灣室內設計資訊網首頁"
            className="flex min-w-0 items-center gap-3 xl:gap-4"
          >
            <Image
              src="/images/logo.png"
              alt="台灣室內設計資訊網 Logo"
              width={72}
              height={72}
              className="h-12 w-12 shrink-0 rounded-full object-cover sm:h-14 sm:w-14 xl:h-16 xl:w-16"
              priority
            />

            <span className="min-w-0">
              <span className="block truncate text-lg font-black tracking-tight text-foreground sm:text-xl xl:text-2xl">
                台灣室內設計資訊網
              </span>

              <span className="hidden text-sm text-muted-foreground xl:block">
                建案設計提案與居家裝潢靈感
              </span>
            </span>
          </Link>

          <nav
            aria-label="主要導覽"
            className="hidden shrink-0 items-center gap-4 xl:flex 2xl:gap-5"
          >
            {navLinks.map((link, index) => {
              const active = getIsActive(link, index)
              const danger = link.danger === true

              return (
                <Link
                  key={`${link.href}-${link.label}`}
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={`relative whitespace-nowrap py-2 text-base font-semibold transition-colors 2xl:text-lg ${
                    danger
                      ? "text-red-600 hover:text-red-700"
                      : active
                        ? "text-primary"
                        : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {link.label}

                  {active && (
                    <span
                      aria-hidden="true"
                      className={`absolute inset-x-0 -bottom-0.5 mx-auto h-0.5 rounded-full ${
                        danger ? "bg-red-600" : "bg-accent"
                      }`}
                    />
                  )}
                </Link>
              )
            })}

            <LineConsultButton className="whitespace-nowrap rounded-full bg-[#06C755] px-5 py-2.5 text-base font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:opacity-90 hover:shadow-md 2xl:px-6 2xl:py-3 2xl:text-lg">
              LINE 免費諮詢
            </LineConsultButton>
          </nav>

          <button
            type="button"
            onClick={() => setMobileOpen((open) => !open)}
            aria-label={mobileOpen ? "關閉選單" : "開啟選單"}
            aria-expanded={mobileOpen}
            aria-controls="mobile-navigation"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-border bg-background/80 text-foreground transition-colors hover:bg-secondary xl:hidden"
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
          className="fixed inset-0 z-40 bg-background pt-16 xl:hidden"
        >
          <nav
            aria-label="手機版主要導覽"
            className="flex h-full flex-col overflow-y-auto px-6 pb-8"
          >
            <div className="divide-y divide-border/70 border-t border-border/70">
              {navLinks.map((link, index) => {
                const active = getIsActive(link, index)
                const danger = link.danger === true

                return (
                  <Link
                    key={`${link.href}-${link.label}`}
                    href={link.href}
                    aria-current={active ? "page" : undefined}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center justify-between py-5 text-lg font-bold transition-colors ${
                      danger
                        ? "text-red-600 active:text-red-700"
                        : active
                          ? "text-accent"
                          : "text-foreground active:text-primary"
                    }`}
                  >
                    <span>{link.label}</span>

                    <span
                      aria-hidden="true"
                      className={`transition-transform ${
                        active ? "translate-x-1" : ""
                      } ${danger ? "text-red-600" : active ? "text-accent" : ""}`}
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