import Image from "next/image"
import Link from "next/link"

import { LineConsultButton } from "@/components/line-consult-button"

const navigationLinks = [
  {
    label: "建案設計",
    href: "/projects",
  },
  {
    label: "設計風格",
    href: "/styles",
  },
  {
    label: "空間設計",
    href: "/spaces",
  },
  {
    label: "格局坪數",
    href: "/layouts",
  },
  {
    label: "裝潢知識",
    href: "/renovation",
  },
  {
    label: "最新文章",
    href: "/blog",
  },
]

const policyLinks = [
  {
    label: "隱私權政策",
    href: "/privacy-policy",
  },
  {
    label: "使用條款",
    href: "/terms",
  },
]

export function Footer() {
  return (
    <footer className="border-t border-border/70 bg-background px-6 py-12">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_auto]">
          {/* 網站介紹 */}
          <div>
            <Link
              href="/"
              aria-label="台灣室內設計資訊網首頁"
              className="inline-flex items-center gap-3"
            >
              <Image
                src="/images/logo.png"
                alt=""
                width={44}
                height={44}
                className="h-11 w-11 rounded-full object-cover"
              />

              <span>
                <span className="block text-lg font-black tracking-tight text-foreground">
                  台灣室內設計資訊網
                </span>

                <span className="mt-1 block text-xs text-muted-foreground">
                  建案設計提案與居家裝潢靈感
                </span>
              </span>
            </Link>

            <p className="mt-4 max-w-xl text-sm leading-7 text-muted-foreground">
              整理全台住宅建案、室內設計風格、空間規劃、
              格局坪數與居家裝潢相關資訊，
              幫助屋主尋找適合房屋條件與生活需求的設計方向。
            </p>
          </div>

          {/* 內容分類 */}
          <nav aria-label="內容分類" className="text-sm">
            <p className="font-bold text-foreground">
              內容分類
            </p>

            <div className="mt-4 flex flex-col gap-3 text-muted-foreground">
              {navigationLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="transition-colors hover:text-accent"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </nav>

          {/* 網站政策 */}
          <nav aria-label="網站政策" className="text-sm">
            <p className="font-bold text-foreground">
              網站政策
            </p>

            <div className="mt-4 flex flex-col gap-3 text-muted-foreground">
              {policyLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="transition-colors hover:text-accent"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </nav>

          {/* 聯絡按鈕 */}
          <div className="lg:text-right">
            <p className="text-sm font-bold text-foreground">
              室內設計與裝潢需求諮詢
            </p>

            <p className="mt-2 max-w-xs text-xs leading-6 text-muted-foreground lg:ml-auto">
              提供建案、格局、坪數、設計風格與預算需求的初步諮詢。
            </p>

            <LineConsultButton className="mt-4 inline-flex rounded-full bg-[#06C755] px-5 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:opacity-90 hover:shadow-md">
              加入 LINE 免費諮詢
            </LineConsultButton>
          </div>
        </div>

        {/* 聲明與版權 */}
        <div className="mt-10 border-t border-border/70 pt-7">
          <p className="text-xs leading-6 text-muted-foreground">
            本站為住宅室內設計與裝潢資訊平台，網站所呈現之設計內容、
            示意圖片與空間提案主要供風格參考及規劃靈感使用，
            不一定代表實際完工案例。實際設計內容、尺寸、材質、預算、
            工程施作、法規適用與報價，應由屋主與依法執業之設計、
            建築或室內裝修專業人員進一步確認。
          </p>

          <p className="mt-3 text-xs leading-6 text-muted-foreground">
            本站可能依使用者需求提供合作服務單位之聯絡或轉介資訊，
            實際承攬、簽約、設計、施工、保固與付款關係，
            以使用者和實際服務提供者之間的約定為準。
          </p>

          <p className="mt-5 text-xs text-muted-foreground">
            © 2026 台灣室內設計資訊網. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}