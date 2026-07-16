import Image from "next/image"
import { LineConsultButton } from "@/components/line-consult-button"

export function HeroSection() {
  return (
    <section className="relative overflow-hidden px-6 py-12 md:py-20">
      {/* 背景裝飾 */}
      <div className="absolute left-1/2 top-0 -z-10 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-primary/10 blur-[110px]" />

      <div className="absolute right-0 top-32 -z-10 h-[260px] w-[260px] rounded-full bg-accent/10 blur-[100px]" />

      <div className="mx-auto grid max-w-6xl items-center gap-12 md:grid-cols-2">
        {/* 左側內容 */}
        <div className="text-center md:text-left">
          <p className="mb-5 inline-flex rounded-full border border-primary/20 bg-white/90 px-4 py-2 text-sm font-semibold text-primary shadow-sm">
            建案設計提案｜空間風格規劃｜裝潢需求諮詢
          </p>

          <h1 className="text-4xl font-black leading-tight tracking-tight text-foreground md:text-6xl">
            找到適合你家的
            <span className="block text-primary">
              室內設計與裝潢提案
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-base leading-8 text-muted-foreground md:mx-0 md:text-lg">
            收錄全台住宅建案、室內設計風格與空間規劃提案，
            從客廳、臥室、廚房到完整居家裝潢，
            幫助屋主快速找到符合坪數、格局與生活需求的設計方向。
          </p>

          {/* CTA */}
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row md:justify-start">
            <LineConsultButton
              className="
                rounded-full
                bg-[#06C755]
                px-7 py-3.5
                text-sm font-semibold
                text-white
                shadow-[0_14px_36px_rgba(53,51,46,0.22)]
                transition-all
                hover:-translate-y-0.5
                hover:shadow-[0_18px_44px_rgba(53,51,46,0.32)]
              "
            >
              LINE 免費諮詢
            </LineConsultButton>
          </div>

          {/* 資訊卡 */}
          <div className="mt-10 grid grid-cols-3 gap-3 rounded-3xl border border-border/70 bg-white/80 p-4 shadow-sm backdrop-blur">
            <div>
              <p className="text-xl font-black text-foreground">
                建案
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                設計提案
              </p>
            </div>

            <div>
              <p className="text-xl font-black text-foreground">
                風格
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                多元選擇
              </p>
            </div>

            <div>
              <p className="text-xl font-black text-foreground">
                空間
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                格局規劃
              </p>
            </div>
          </div>
        </div>

        {/* 右側圖片 */}
        <div className="relative">
          <div className="absolute -inset-6 -z-10 rounded-[3rem] bg-gradient-to-br from-primary/20 via-white to-accent/20 blur-2xl" />

          <div className="relative overflow-hidden rounded-[2.5rem] border border-white bg-white p-3 shadow-[0_24px_80px_rgba(53,51,46,0.16)]">
            <Image
              src="https://cdn.sanity.io/images/gq4nr57o/production/3178f26ac20422ee0cce1d5837a3cab26028fb2c-1122x1402.png?auto=format"
              alt="現代住宅室內設計與居家裝潢提案"
              width={720}
              height={860}
              className="h-[420px] w-full rounded-[2rem] object-cover md:h-[560px]"
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
            />

            {/* 浮動資訊卡 */}
            <div className="absolute bottom-8 left-8 right-8 rounded-3xl border border-white/70 bg-white/90 p-5 shadow-lg backdrop-blur-xl">
              <p className="text-sm font-bold text-foreground">
                從建案開始找設計靈感
              </p>

              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                依照建案、坪數、格局與喜愛風格，
                查看適合不同住宅空間的室內設計與裝潢規劃方向。
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}