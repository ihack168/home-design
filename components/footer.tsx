
import Link from "next/link"

import { LineConsultButton } from "@/components/line-consult-button"

const footerLinks = [
  {
    label: "建案作品",
    href: "/projects",
  },
  {
    label: "設計風格",
    href: "/styles",
  },
  {
    label: "關於我們",
    href: "/about",
  },
  {
    label: "隱私權政策",
    href: "/privacy-policy",
  },
]

export function Footer() {
  return (
    <footer className="border-t border-border/70 bg-background px-5 py-8">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <Link
              href="/"
              aria-label="台灣室內設計資訊網首頁"
              className="text-lg font-black tracking-tight text-foreground"
            >
              台灣室內設計資訊網
            </Link>

            <p className="mt-1 text-sm text-muted-foreground">
              全台建案室內設計提案與裝潢靈感
            </p>
          </div>

          <nav
            aria-label="頁尾導覽"
            className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground"
          >
            {footerLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="transition-colors hover:text-accent"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <LineConsultButton className="inline-flex w-fit rounded-full bg-[#06C755] px-5 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:opacity-90">
            LINE 免費諮詢
          </LineConsultButton>
        </div>

        <div className="mt-7 border-t border-border/70 pt-5">
          <p className="max-w-5xl text-xs leading-6 text-muted-foreground">
            本站提供室內設計資訊、裝潢靈感及概念提案，部分圖片可能為 AI
            生成或情境示意，僅供參考，不代表實際完工案例。本站與相關建案、
            建商、設計公司及商標權利人無合作、代理或隸屬關係，相關名稱僅作資訊整理與識別用途。
            實際設計、尺寸、材料、預算、施工及法規，應依現場條件及合法專業人員確認為準。
          </p>

          <p className="mt-3 text-xs text-muted-foreground">
            © {new Date().getFullYear()} 台灣室內設計資訊網
          </p>
        </div>
      </div>
    </footer>
  )
}