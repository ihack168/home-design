"use client";

import { FormEvent, useState } from "react";

type WarningCase = {
  id: number;
  reporter: string;
  date: string;
  title: string;
  content: string;
};

const warningCases: WarningCase[] = [
  {
    id: 1,
    reporter: "林先生",
    date: "2026-07-18",
    title: "付款後工程一直拖延，後來幾乎聯絡不到人",
    content:
      "原本說三個月可以完工，支付第二期款後施工進度就開始停滯。每次詢問都說正在安排工班，最後延誤將近四個月，嚴重影響入住時間。",
  },
  {
    id: 2,
    reporter: "王小姐",
    date: "2026-07-12",
    title: "簽約後持續追加費用，最後超出原預算很多",
    content:
      "最初談好的預算約一百二十萬元，施工後才陸續表示水電、木作及油漆都不包含在原報價內，最後比原預算多出將近五十萬元。",
  },
  {
    id: 3,
    reporter: "陳先生",
    date: "2026-07-05",
    title: "入住不到兩個月就漏水，售後處理非常消極",
    content:
      "浴室外牆開始出現水痕，部分油漆也有剝落。公司第一次有派人查看，但之後一直沒有安排修繕，多次聯絡也只說還在確認。",
  },
  {
    id: 4,
    reporter: "張小姐",
    date: "2026-06-28",
    title: "完工成果與設計圖落差很大",
    content:
      "實際完工後，櫃體比例、燈光配置及材質顏色都和當初的設計圖不同，部分櫃體還因尺寸錯誤影響正常使用。",
  },
];

function CloseIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6 18 18 6M6 6l12 12"
      />
    </svg>
  );
}

export default function WarningCasesPage() {
  const [nickname, setNickname] = useState("");
  const [content, setContent] = useState("");
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");

    if (nickname.trim().length < 2) {
      setFormError("請填寫檢舉人匿稱。");
      return;
    }

    if (content.trim().length < 20) {
      setFormError("請稍微完整描述事發過程。");
      return;
    }

    setIsSubmitting(true);

    try {
      /*
       * 日後串接資料庫時，可改為：
       *
       * await fetch("/api/warning-cases", {
       *   method: "POST",
       *   headers: { "Content-Type": "application/json" },
       *   body: JSON.stringify({
       *     nickname: nickname.trim(),
       *     content: content.trim(),
       *   }),
       * });
       */

      await new Promise((resolve) => setTimeout(resolve, 600));

      setNickname("");
      setContent("");
      setShowSuccessModal(true);
    } catch {
      setFormError("目前無法送出，請稍後再試。");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f7f7f5] text-stone-900">
      {/* 頁首 */}
      <section className="bg-stone-950 text-white">
        <div className="mx-auto max-w-4xl px-5 py-16 sm:px-8 sm:py-20">
         <p className="text-sm font-bold text-red-400">
  裝修踩雷警示
</p>

<h1 className="mt-3 text-4xl font-black leading-tight tracking-tight sm:text-5xl">
  檢舉不良設計公司
</h1>

<p className="mt-5 max-w-2xl text-base leading-7 text-stone-300 sm:text-lg">
  分享您的裝修糾紛與不良經驗，協助我們完善 AI 裝修風險辨識模型，
  提供更精準的公司推薦與踩雷提醒。
</p>

<div className="mt-6 flex flex-wrap gap-2">
  <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-stone-300">
    分析常見裝修爭議
  </span>

  <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-stone-300">
    辨識高風險模式
  </span>

  <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-stone-300">
    優化 AI 推薦結果
  </span>
</div>

          <a
            href="#report-form"
            className="mt-8 inline-flex rounded-full bg-red-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-red-700"
          >
            我要提供經驗
          </a>
        </div>
      </section>

      {/* 案例列表 */}
      <section className="mx-auto max-w-4xl px-5 py-12 sm:px-8 sm:py-16">
        <div className="flex items-end justify-between gap-5">
          <div>
            <h2 className="text-2xl font-black sm:text-3xl">匿名投稿</h2>
            <p className="mt-2 text-sm text-stone-500">
              公司與個人資訊均已隱藏
            </p>
          </div>

          <span className="shrink-0 text-sm text-stone-400">
            共 {warningCases.length} 則
          </span>
        </div>

        <div className="mt-8 divide-y divide-stone-200 overflow-hidden rounded-2xl border border-stone-200 bg-white">
          {warningCases.map((warningCase) => (
            <article
              key={warningCase.id}
              className="px-5 py-7 sm:px-8 sm:py-8"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-stone-900 text-sm font-bold text-white">
                    {warningCase.reporter.slice(0, 1)}
                  </div>

                  <div>
                    <p className="font-bold">{warningCase.reporter}</p>
                    <p className="text-xs text-stone-400">匿名投稿者</p>
                  </div>
                </div>

                <time
                  dateTime={warningCase.date}
                  className="text-xs text-stone-400"
                >
                  {warningCase.date.replaceAll("-", ".")}
                </time>
              </div>

              <h3 className="mt-5 text-lg font-black leading-7 sm:text-xl">
                {warningCase.title}
              </h3>

              <p className="mt-3 text-sm leading-7 text-stone-600 sm:text-base">
                {warningCase.content}
              </p>

              <p className="mt-5 text-xs text-stone-400">
                被檢舉公司：名稱已隱藏
              </p>
            </article>
          ))}
        </div>

        <p className="mt-5 text-xs leading-6 text-stone-400">
          本頁內容經匿名化整理，僅供裝修風險提醒，不代表對特定公司的事實認定。
        </p>
      </section>

      {/* 投稿表單 */}
      <section
        id="report-form"
        className="border-t border-stone-200 bg-white"
      >
        <div className="mx-auto max-w-3xl px-5 py-14 sm:px-8 sm:py-20">
          <div className="text-center">
            <p className="text-sm font-bold text-red-700">提供您的經驗</p>

            <h2 className="mt-3 text-3xl font-black tracking-tight">
              你也曾經遇到裝修問題嗎？
            </h2>

            <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-stone-500">
              您提供的內容會先經過檢視及匿名化處理，不會直接公開個人資料。
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="mt-10 rounded-2xl border border-stone-200 bg-[#f7f7f5] p-5 sm:p-8"
          >
            <div>
              <label
                htmlFor="nickname"
                className="block text-sm font-bold"
              >
                檢舉人匿稱
              </label>

              <input
                id="nickname"
                type="text"
                value={nickname}
                onChange={(event) => setNickname(event.target.value)}
                maxLength={30}
                placeholder="例如：林先生"
                className="mt-3 w-full rounded-xl border border-stone-300 bg-white px-4 py-3.5 text-sm outline-none transition placeholder:text-stone-400 focus:border-stone-900"
              />
            </div>

            <div className="mt-6">
              <div className="flex items-center justify-between gap-4">
                <label
                  htmlFor="content"
                  className="block text-sm font-bold"
                >
                  檢舉內容與事發過程
                </label>

                <span className="text-xs text-stone-400">
                  {content.length}/1500
                </span>
              </div>

              <textarea
                id="content"
                value={content}
                onChange={(event) => setContent(event.target.value)}
                maxLength={1500}
                rows={8}
                placeholder="請描述事情發生的經過，例如付款、施工進度、溝通狀況及目前處理情形。"
                className="mt-3 w-full resize-y rounded-xl border border-stone-300 bg-white px-4 py-3.5 text-sm leading-7 outline-none transition placeholder:text-stone-400 focus:border-stone-900"
              />
            </div>

            {formError && (
              <p
                role="alert"
                className="mt-4 text-sm font-medium text-red-700"
              >
                {formError}
              </p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-6 w-full rounded-xl bg-stone-950 px-5 py-4 text-sm font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "正在送出…" : "送出"}
            </button>

            <p className="mt-4 text-center text-xs leading-5 text-stone-400">
              請勿填寫電話、地址或其他敏感個人資料
            </p>
          </form>
        </div>
      </section>

      {/* 成功視窗 */}
      {showSuccessModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="success-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/60 px-5 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setShowSuccessModal(false);
            }
          }}
        >
          <div className="relative w-full max-w-md rounded-2xl bg-white p-7 shadow-2xl sm:p-8">
            <button
              type="button"
              aria-label="關閉視窗"
              onClick={() => setShowSuccessModal(false)}
              className="absolute right-4 top-4 rounded-full p-2 text-stone-400 transition hover:bg-stone-100 hover:text-stone-900"
            >
              <CloseIcon />
            </button>

            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-xl font-black text-green-700">
              ✓
            </div>

            <h2
              id="success-title"
              className="mt-5 text-2xl font-black"
            >
              感謝您提供資訊
            </h2>

            <p className="mt-4 leading-7 text-stone-600">
              我們會針對您提供的內容進行檢視與查核。若內容具有參考價值，
              將經過匿名化整理後納入裝修風險案例資料庫，協助 AI
              分析常見裝修問題，提醒更多屋主降低踩雷風險。
            </p>

            <button
              type="button"
              onClick={() => setShowSuccessModal(false)}
              className="mt-7 w-full rounded-xl bg-stone-950 px-5 py-3.5 text-sm font-bold text-white transition hover:bg-stone-800"
            >
              確定
            </button>
          </div>
        </div>
      )}
    </main>
  );
}