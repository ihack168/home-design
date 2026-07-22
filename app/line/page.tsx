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
        {/* 室內設計諮詢圖片 */}
        <div className="relative overflow-hidden">
          <Image
            src="/images/line-consultant.png"
            alt="台灣室內設計資訊網空間規劃諮詢"
            width={800}
            height={1000}
            priority
            className="
              h-[300px]
              w-full
              object-cover
              object-top
              md:h-[360px]
            "
          />

          {/* 底部漸層 */}
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-white via-white/80 to-transparent" />
        </div>

        {/* 內容 */}
        <div className="px-6 pb-7 pt-1">
          <p className="text-xs font-semibold tracking-[0.25em] text-primary">
            INTERIOR DESIGN CONSULTATION
          </p>

          <h1 className="mt-3 text-3xl font-black leading-tight text-foreground md:text-5xl">
            室內設計免費諮詢
          </h1>

          <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-muted-foreground md:text-base">
            告訴我們您的裝修地區、喜愛風格與預算，
            系統將依照需求協助媒合適合的室內設計服務。
          </p>

          {/* 服務提示 */}
          <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-primary/10 bg-primary/5 px-4 py-2 text-sm text-primary">
            ✨ 免費需求評估・專人協助回覆
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
                text-white
                shadow-[0_18px_44px_rgba(6,199,85,0.28)]
                transition-all
                hover:-translate-y-1
                hover:bg-[#05b94e]
                hover:shadow-[0_22px_54px_rgba(6,199,85,0.36)]
              "
            >
              立即加入 LINE 免費諮詢
            </LineConsultButton>
          </div>

          {/* 服務項目 */}
          <div className="mt-8 grid grid-cols-3 gap-3 text-sm">
            <div className="flex min-h-20 items-center justify-center rounded-2xl border border-border/60 bg-secondary/30 p-3 font-medium">
              風格規劃
            </div>

            <div className="flex min-h-20 items-center justify-center rounded-2xl border border-border/60 bg-secondary/30 p-3 font-medium">
              預算評估
            </div>

            <div className="flex min-h-20 items-center justify-center rounded-2xl border border-border/60 bg-secondary/30 p-3 font-medium">
              設計媒合
            </div>
          </div>

          <p className="mt-5 text-xs leading-5 text-muted-foreground">
            實際服務內容、費用與合作方式，將由服務人員依個別需求進一步說明。
          </p>
        </div>
      </div>
    </main>
  )
}