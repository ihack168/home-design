import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "關於我們｜台灣室內設計資訊網",
  description:
    "AI 室內設計資訊平台，提供室內設計作品、裝潢靈感、AI 智慧推薦與設計團隊媒合服務。",
};

export default function AboutPage() {
  return (
    <main className="bg-[#f8f7f3]">
      <section className="mx-auto max-w-5xl px-6 py-16">
        <p className="text-sm font-bold tracking-[0.2em] text-[#2f7a55]">
          ABOUT US
        </p>

        <h1 className="mt-4 text-4xl font-black leading-tight">
          AI 室內設計資訊平台
        </h1>

        <p className="mt-6 max-w-3xl text-lg leading-8 text-black/70">
          我們專注於 AI 技術與室內設計資訊整合，蒐集大量裝潢案例、設計風格與空間靈感，
          協助使用者快速找到符合需求的設計方向，並透過 AI 分析地區、風格與預算，
          提供適合進一步洽詢的室內設計團隊參考。
        </p>
      </section>

      <section className="border-y bg-white">
        <div className="mx-auto grid max-w-5xl gap-6 px-6 py-14 md:grid-cols-3">
          <div className="rounded-2xl border p-6">
            <h2 className="font-bold text-lg">AI 智慧分析</h2>
            <p className="mt-3 text-sm leading-7 text-black/65">
              根據地區、設計風格與預算整理需求，提高配對效率。
            </p>
          </div>

          <div className="rounded-2xl border p-6">
            <h2 className="font-bold text-lg">設計作品參考</h2>
            <p className="mt-3 text-sm leading-7 text-black/65">
              提供多元室內設計案例與裝潢靈感，協助找到喜歡的風格。
            </p>
          </div>

          <div className="rounded-2xl border p-6">
            <h2 className="font-bold text-lg">快速媒合</h2>
            <p className="mt-3 text-sm leading-7 text-black/65">
              簡化尋找設計公司的流程，節省比較與搜尋時間。
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-16">
        <h2 className="text-3xl font-black">聯絡資訊-平臺系統商</h2>

        <div className="mt-8 overflow-hidden rounded-3xl border bg-white">
          <div className="grid divide-y md:grid-cols-2 md:divide-x md:divide-y-0">
            <div className="p-7">
              <p className="text-sm font-bold text-[#2f7a55]">聯絡電話</p>
              <p className="mt-2 text-lg font-semibold">(650) 253-0000 美國矽谷辦公室</p>
            </div>

            <div className="p-7">
              <p className="text-sm font-bold text-[#2f7a55]">營業時間</p>
              <p className="mt-2 text-lg font-semibold">MON-FRI (8:00-5:00)</p>
            </div>

            <div className="p-7">
              <p className="text-sm font-bold text-[#2f7a55]">詳細地址</p>
              <p className="mt-2 leading-7">
                1600 Amphitheatre Pkwy.<br />
                Mountain View, CA 94043
              </p>
            </div>

            <div className="p-7">
              <p className="text-sm font-bold text-[#2f7a55]">E-mail</p>
              <p className="mt-2 text-lg font-semibold text-black/45">
                deco77.com@gmail.com
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}