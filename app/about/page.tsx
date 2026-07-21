import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "關於我們｜台灣室內設計資訊網",
  description:
    "我們透過網站內容、設計作品與使用者偏好，結合 AI 分析技術，協助使用者找到更符合需求的室內設計團隊。",
}

const features = [
  {
    title: "以作品偏好為基礎",
    description:
      "從使用者瀏覽的設計風格、空間作品與內容偏好出發，理解真正重視的居住美感與空間需求。",
  },
  {
    title: "AI 智慧分析",
    description:
      "透過資料整理與 AI 分析技術，將地區、風格、預算與需求進行綜合比對，提升推薦的參考價值。",
  },
  {
    title: "減少搜尋成本",
    description:
      "不必在大量資訊中反覆比較，透過簡單填寫需求，即可更快速地找到適合進一步洽詢的設計團隊。",
  },
]

const steps = [
  {
    number: "01",
    title: "瀏覽作品",
    description: "從網站內容與案例中，找出喜歡的空間風格與設計方向。",
  },
  {
    number: "02",
    title: "填寫需求",
    description: "提供所在地區、偏好風格、預算範圍與基本聯絡資訊。",
  },
  {
    number: "03",
    title: "AI 分析",
    description: "系統依照使用者提供的條件，進行需求整理與適配分析。",
  },
  {
    number: "04",
    title: "取得推薦",
    description: "提供適合進一步洽詢的室內設計團隊資訊，作為規劃參考。",
  },
]

export default function AboutPage() {
  return (
    <main className="bg-[#f8f7f3] text-[#1f2a24]">
      <section className="relative overflow-hidden border-b border-black/5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(30,112,74,0.12),transparent_36%)]" />

        <div className="relative mx-auto max-w-6xl px-6 py-20 sm:px-8 sm:py-28 lg:px-10">
          <div className="max-w-3xl">
            <p className="mb-5 text-sm font-semibold tracking-[0.22em] text-[#2f7a55]">
              ABOUT US
            </p>

            <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              用 AI 技術，
              <br />
              讓設計需求更容易被理解
            </h1>

            <p className="mt-8 max-w-2xl text-lg leading-9 text-black/65 sm:text-xl">
              我們是一個專注於 AI 技術應用與數位內容整合的團隊，
              希望透過更直覺的方式，協助使用者從眾多室內設計資訊中，
              找到更符合自身需求與喜好的設計方向。
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16 sm:px-8 sm:py-24 lg:px-10">
        <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
          <div>
            <p className="text-sm font-semibold tracking-[0.2em] text-[#2f7a55]">
              OUR MISSION
            </p>

            <h2 className="mt-4 text-3xl font-bold leading-tight sm:text-4xl">
              讓推薦不只是廣告，
              <br />
              而是更貼近需求的選擇
            </h2>
          </div>

          <div className="space-y-6 text-base leading-8 text-black/65 sm:text-lg">
            <p>
              傳統尋找室內設計公司的方式，往往需要花費大量時間搜尋、
              比較作品、閱讀介紹，再逐一聯絡確認。資訊很多，
              但真正適合自己的選擇，未必容易判斷。
            </p>

            <p>
              因此，我們將網站內容、設計作品、風格偏好與使用者提供的需求，
              透過 AI 分析技術進行整理與比對，協助使用者更有效率地找到
              適合進一步洽詢的室內設計團隊。
            </p>

            <p>
              我們相信，好的推薦不應只是提供一個名稱，
              而是建立在需求、風格、預算與地區等條件之上的綜合判斷。
              透過科技降低資訊落差，讓每一次選擇都更有方向。
            </p>
          </div>
        </div>
      </section>

      <section className="border-y border-black/5 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-16 sm:px-8 sm:py-24 lg:px-10">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold tracking-[0.2em] text-[#2f7a55]">
              WHAT WE DO
            </p>

            <h2 className="mt-4 text-3xl font-bold sm:text-4xl">
              從喜好出發，找到更適合的設計團隊
            </h2>

            <p className="mt-5 text-base leading-8 text-black/60 sm:text-lg">
              我們將內容、作品與 AI 分析整合成更簡單的使用流程，
              讓使用者不必具備專業背景，也能清楚表達自己的需求。
            </p>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {features.map((feature) => (
              <article
                key={feature.title}
                className="rounded-3xl border border-black/5 bg-[#f8f7f3] p-7"
              >
                <div className="mb-6 h-1 w-10 rounded-full bg-[#2f7a55]" />

                <h3 className="text-xl font-bold">{feature.title}</h3>

                <p className="mt-4 leading-7 text-black/60">
                  {feature.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16 sm:px-8 sm:py-24 lg:px-10">
        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="text-sm font-semibold tracking-[0.2em] text-[#2f7a55]">
              HOW IT WORKS
            </p>

            <h2 className="mt-4 text-3xl font-bold sm:text-4xl">
              簡單四個步驟
            </h2>

            <p className="mt-5 max-w-md leading-8 text-black/60">
              從瀏覽喜歡的作品開始，到取得適合的設計團隊資訊，
              整個流程都以簡單、快速與容易理解為核心。
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {steps.map((step) => (
              <article
                key={step.number}
                className="rounded-3xl border border-black/5 bg-white p-6"
              >
                <span className="text-sm font-bold tracking-[0.16em] text-[#2f7a55]">
                  {step.number}
                </span>

                <h3 className="mt-5 text-xl font-bold">{step.title}</h3>

                <p className="mt-3 leading-7 text-black/60">
                  {step.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#203a2e] text-white">
        <div className="mx-auto max-w-6xl px-6 py-16 text-center sm:px-8 sm:py-20 lg:px-10">
          <p className="text-sm font-semibold tracking-[0.2em] text-white/60">
            FIND YOUR STYLE
          </p>

          <h2 className="mx-auto mt-4 max-w-3xl text-3xl font-bold leading-tight sm:text-4xl">
            從喜歡的作品開始，
            找到更適合您的設計方向
          </h2>

          <p className="mx-auto mt-5 max-w-2xl leading-8 text-white/70">
            瀏覽網站中的室內設計內容與作品，
            讓我們透過 AI 技術協助整理您的需求與偏好。
          </p>

          <Link
            href="/"
            className="mt-9 inline-flex h-12 items-center justify-center rounded-full bg-white px-7 text-sm font-bold text-[#203a2e] transition hover:bg-white/90"
          >
            開始瀏覽設計作品
          </Link>
        </div>
      </section>

      <section className="border-t border-black/5 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-8 sm:px-8 lg:px-10">
          <p className="text-center text-xs leading-6 text-black/45">
            本網站提供之推薦資訊係依使用者填寫內容與系統分析結果整理，
            僅供室內設計需求洽詢與比較參考。實際服務內容、報價、合約與施工責任，
            應由使用者與相關業者另行確認。
          </p>
        </div>
      </section>
    </main>
  )
}