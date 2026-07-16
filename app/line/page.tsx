"use client"

import Image from "next/image"
import { useEffect } from "react"
import { LineConsultButton } from "@/components/line-consult-button"

export default function LinePage() {
  useEffect(() => {
    document.body.style.background = "#f8fafc"

    return () => {
      document.body.style.background = ""
    }
  }, [])

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-4">
      <div className="w-full max-w-xl overflow-hidden rounded-[2rem] border border-border/70 bg-white/90 text-center shadow-[0_20px_80px_rgba(31,78,121,0.12)] backdrop-blur">

        {/* 真人服務照片 */}
        <div className="relative overflow-hidden">
          <Image
            src="/images/line-consultant.png"
            alt="凌群包租代管服務專員"
            width={800}
            height={1000}
            priority
            className="
              h-[300px]
              md:h-[360px]
              w-full
              object-cover
              object-top
            "
          />

          {/* 底部漸層 */}
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-white via-white/80 to-transparent" />
        </div>

        {/* 內容 */}
        <div className="px-6 pb-7 pt-1">

          <p className="text-xs font-semibold tracking-[0.25em] text-primary">
            LINE CONSULTATION
          </p>

          <h1 className="mt-3 text-3xl font-black leading-tight text-foreground md:text-5xl">
            房東 LINE 免費諮詢
          </h1>

          {/* 真人感提示 */}
          <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-primary/10 bg-primary/5 px-4 py-2 text-sm text-primary">
            👋 專人即時回覆・可先免費諮詢
          </div>

          {/* LINE 按鈕 */}
          <div className="mt-8">
            <LineConsultButton
              className="
                inline-flex
                items-center
                justify-center
                rounded-full
                bg-[#06C755]
                px-10
                py-5
                text-base
                font-black
                text-primary-foreground
                shadow-[0_18px_44px_rgba(31,78,121,0.28)]
                transition-all
                hover:-translate-y-1
                hover:shadow-[0_22px_54px_rgba(31,78,121,0.36)]
              "
            >
              立即加入 LINE 諮詢
            </LineConsultButton>
          </div>

          {/* 賣點 */}
          <div className="mt-8 grid grid-cols-3 gap-3 text-sm">
            <div className="rounded-2xl border border-border/60 bg-secondary/30 p-4">
              房東出租
            </div>

            <div className="rounded-2xl border border-border/60 bg-secondary/30 p-4">
              包租代管
            </div>

            <div className="rounded-2xl border border-border/60 bg-secondary/30 p-4">
              租屋補助
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}