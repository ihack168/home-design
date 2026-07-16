"use client"

import Image from "next/image"
import Link from "next/link"
import { LineConsultButton } from "@/components/line-consult-button"

export function HeroSection() {
  return (
    <section className="relative overflow-hidden px-6">
      {/* 背景裝飾 */}
      <div className="absolute left-1/2 top-0 -z-10 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-primary/10 blur-[110px]" />

      <div className="absolute right-0 top-32 -z-10 h-[260px] w-[260px] rounded-full bg-accent/10 blur-[100px]" />

      <div className="mx-auto grid max-w-6xl items-center gap-12 md:grid-cols-2">
        {/* 左側內容 */}
        <div className="text-center md:text-left">
          <p className="mb-5 inline-flex rounded-full border border-primary/20 bg-white/90 px-4 py-2 text-sm font-semibold text-primary shadow-sm">
            社會住宅｜包租代管｜房東安心出租
          </p>

          <h1 className="text-4xl font-black leading-tight tracking-tight text-foreground md:text-6xl">
            社會住宅
            <span className="block text-primary">
              包租代管服務
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-base leading-8 text-muted-foreground md:mx-0 md:text-lg">
            協助房東了解政府包租代管方案，
            提供房屋出租管理、租客媒合、
            租務協調與租屋補助相關諮詢，
            讓出租更穩定、更省時、更安心。
          </p>

          {/* CTA */}
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row md:justify-start">
            <LineConsultButton
              className="
                rounded-full
                bg-[#06C755]
                px-7 py-3.5
                text-sm font-semibold
                text-primary-foreground
                shadow-[0_14px_36px_rgba(31,78,121,0.28)]
                transition-all
                hover:-translate-y-0.5
                hover:shadow-[0_18px_44px_rgba(31,78,121,0.38)]
              "
            >
              LINE 免費諮詢
            </LineConsultButton>

          </div>

          {/* 資訊卡 */}
          <div className="mt-10 grid grid-cols-3 gap-3 rounded-3xl border border-border/70 bg-white/80 p-4 shadow-sm backdrop-blur">
            <div>
              <p className="text-xl font-black text-foreground">
                專人
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                一對一諮詢
              </p>
            </div>

            <div>
              <p className="text-xl font-black text-foreground">
                穩定
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                出租管理
              </p>
            </div>

            <div>
              <p className="text-xl font-black text-foreground">
                安心
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                租務協助
              </p>
            </div>
          </div>
        </div>

        {/* 右側圖片 */}
        <div className="relative">
          <div className="absolute -inset-6 -z-10 rounded-[3rem] bg-gradient-to-br from-primary/20 via-white to-accent/20 blur-2xl" />

          <div className="relative overflow-hidden rounded-[2.5rem] border border-white bg-white p-3 shadow-[0_24px_80px_rgba(31,78,121,0.16)]">
            <Image
              src="/images/hero.png"
              alt="社會住宅包租代管服務"
              width={720}
              height={860}
              className="h-[420px] w-full rounded-[2rem] object-cover md:h-[560px]"
              priority
            />

            {/* 浮動資訊卡 */}
            <div className="absolute bottom-8 left-8 right-8 rounded-3xl border border-white/70 bg-white/90 p-5 shadow-lg backdrop-blur-xl">
              <p className="text-sm font-bold text-foreground">
                社會住宅包租代管
              </p>

              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                協助房東更有效率地出租房屋，
                降低空租風險，
                提升租務管理效率與居住品質。
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}