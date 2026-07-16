"use client"

import {
  MessageCircle,
  Mail,
  MapPin,
  Phone,
} from "lucide-react"

const contacts = [
  {
    label: "LINE 免費諮詢",
    description:
      "加入 LINE 詢問社會住宅包租代管、出租管理與租屋補助相關問題。",
    href: "https://line.me/R/ti/p/0910933178",
    icon: <MessageCircle size={28} />,
  },
  {
    label: "電話諮詢",
    description:
      "提供房東出租與包租代管相關服務說明。",
    href: "tel:0900000000",
    icon: <Phone size={28} />,
  },
  {
    label: "服務地區",
    description:
      "台北市、新北市與周邊地區包租代管服務。",
    href: "https://maps.google.com",
    icon: <MapPin size={28} />,
  },
]

export function ContactSection() {
  return (
    <section
      id="contact"
      className="relative overflow-hidden px-6 py-24"
    >
      {/* 背景光暈 */}
      <div className="absolute left-1/2 top-0 h-[300px] w-[300px] -translate-x-1/2 rounded-full bg-primary/10 blur-[100px]" />

      <div className="relative mx-auto max-w-6xl">

        {/* 標題 */}
        <div className="mx-auto mb-14 max-w-2xl text-center">

          <p className="mb-3 text-sm font-semibold tracking-[0.2em] text-primary">
            CONTACT US
          </p>

          <h2 className="text-3xl font-black tracking-tight text-foreground md:text-5xl">
            免費包租代管諮詢
          </h2>

          <p className="mt-5 text-base leading-8 text-muted-foreground">
            歡迎透過 LINE、電話或 Email 聯繫，
            協助您了解社會住宅包租代管、
            房屋出租管理與租屋補助相關資訊。
          </p>

        </div>

        {/* 卡片 */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">

          {contacts.map((contact) => (

            <a
              key={contact.label}
              href={contact.href}
              target="_blank"
              rel="noopener noreferrer"
              className="
                group relative overflow-hidden rounded-[2rem]
                border border-border/70
                bg-white/85
                p-7
                shadow-[0_10px_40px_rgba(31,78,121,0.08)]
                backdrop-blur
                transition-all duration-500
                hover:-translate-y-1.5
                hover:border-primary/30
                hover:shadow-[0_20px_60px_rgba(31,78,121,0.14)]
              "
            >
              {/* 光暈 */}
              <div className="absolute right-0 top-0 h-28 w-28 rounded-full bg-primary/10 blur-3xl opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

              <div className="relative z-10 flex items-start gap-5">

                {/* icon */}
                <div
                  className="
                    flex h-16 w-16 flex-shrink-0 items-center justify-center
                    rounded-2xl
                    bg-primary/10
                    text-primary
                    transition-transform duration-500
                    group-hover:scale-110
                  "
                >
                  {contact.icon}
                </div>

                {/* text */}
                <div className="flex-1">

                  <h3 className="text-xl font-bold text-foreground">
                    {contact.label}
                  </h3>

                  <p className="mt-2 text-sm leading-7 text-muted-foreground">
                    {contact.description}
                  </p>

                  <div className="mt-5 flex items-center text-sm font-semibold text-primary">
                    立即聯絡

                    <span className="ml-2 transition-transform duration-300 group-hover:translate-x-1">
                      →
                    </span>

                  </div>

                </div>

              </div>

            </a>

          ))}

        </div>

        {/* 底部 CTA */}
        <div className="mt-14 text-center">

          <a
            href="https://line.me/R/ti/p/@你的LINEID"
            target="_blank"
            rel="noopener noreferrer"
            className="
              inline-flex items-center justify-center
              rounded-full
              bg-[#06C755]
              px-8 py-4
              text-sm font-semibold
              text-primary-foreground
              shadow-[0_14px_36px_rgba(31,78,121,0.28)]
              transition-all
              hover:-translate-y-0.5
              hover:shadow-[0_18px_44px_rgba(31,78,121,0.38)]
            "
          >
            加入 LINE 免費諮詢
          </a>

          <p className="mt-5 text-sm leading-7 text-muted-foreground">
            房東出租｜社會住宅｜包租代管｜租屋補助諮詢
          </p>

        </div>

      </div>
    </section>
  )
}