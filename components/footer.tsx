import Link from "next/link"

const footerLinks = [
  { label: "首頁", href: "/" },
  { label: "最新文章", href: "/blog" },
  { label: "隱私權政策", href: "/privacy-policy" },
  { label: "使用條款", href: "/terms" },
]

export function Footer() {
  return (
    <footer className="border-t border-border/70 bg-background">
      <div className="mx-auto max-w-6xl px-6 py-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <Link
              href="/"
              className="text-lg font-black tracking-tight text-foreground"
            >
              台灣室內設計資訊網
            </Link>

            <p className="mt-1 text-sm text-muted-foreground">
              室內設計、建案提案與居家裝潢資訊
            </p>
          </div>

          <nav
            aria-label="頁尾導覽"
            className="flex flex-wrap gap-5 text-sm text-muted-foreground"
          >
            {footerLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="transition-colors hover:text-primary"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="mt-6 border-t border-border/70 pt-4">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} 台灣室內設計資訊網
          </p>
        </div>
      </div>
    </footer>
  )
}