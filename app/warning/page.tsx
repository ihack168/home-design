"use client";

import { FormEvent, useState } from "react";

type WarningCase = {
  id: number;
  reporter: string;
  date: string;
  category: string;
  severity: "高風險" | "爭議" | "待釐清";
  title: string;
  excerpt: string;
  content: string;
};

const warningCases: WarningCase[] = [
  {
    id: 1,
    reporter: "林先生",
    date: "2026-07-18",
    category: "工期拖延",
    severity: "高風險",
    title: "付完第二期款後，工地突然停擺了四個月",
    excerpt: "原本承諾三個月完工，付款後卻反覆以缺工、排程為由拖延。",
    content:
      "原本說三個月可以完工，支付第二期款後施工進度就開始停滯。每次詢問都說正在安排工班，最後延誤將近四個月，嚴重影響入住時間。",
  },
  {
    id: 2,
    reporter: "王小姐",
    date: "2026-07-12",
    category: "預算追加",
    severity: "爭議",
    title: "報價 120 萬，做到一半竟被要求再加 50 萬",
    excerpt: "多項工程在開工後才被告知不包含，屋主陷入停工或加價的兩難。",
    content:
      "最初談好的預算約一百二十萬元，施工後才陸續表示水電、木作及油漆都不包含在原報價內，最後比原預算多出將近五十萬元。",
  },
  {
    id: 3,
    reporter: "陳先生",
    date: "2026-07-05",
    category: "漏水保固",
    severity: "高風險",
    title: "入住不到兩個月就漏水，報修後只剩已讀",
    excerpt: "浴室外牆出現水痕與油漆剝落，業者查看後遲遲未安排修繕。",
    content:
      "浴室外牆開始出現水痕，部分油漆也有剝落。公司第一次有派人查看，但之後一直沒有安排修繕，多次聯絡也只說還在確認。",
  },
  {
    id: 4,
    reporter: "張小姐",
    date: "2026-06-28",
    category: "成果落差",
    severity: "待釐清",
    title: "3D 圖像精品宅，完工後連櫃門都打不開",
    excerpt: "櫃體比例、燈光與材質明顯不同，部分尺寸甚至影響正常使用。",
    content:
      "實際完工後，櫃體比例、燈光配置及材質顏色都和當初的設計圖不同，部分櫃體還因尺寸錯誤影響正常使用。",
  },
];

const warningTags = ["低價簽約", "工程停擺", "追加費用", "漏水瑕疵", "保固失聯"];

function CloseIcon() {
  return (
    <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
    </svg>
  );
}

function AlertIcon() {
  return (
    <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.3 3.7 2.2 18a2 2 0 0 0 1.7 3h16.2a2 2 0 0 0 1.7-3L13.7 3.7a2 2 0 0 0-3.4 0Z" />
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
      setFormError("請填寫投稿暱稱。");
      return;
    }

    if (content.trim().length < 20) {
      setFormError("請稍微完整描述事發經過。");
      return;
    }

    setIsSubmitting(true);

    try {
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
    <main className="min-h-screen bg-[#f4f1eb] text-stone-950">
      <section className="relative overflow-hidden border-b-8 border-red-700 bg-[#151515] text-white">
        <div className="absolute inset-0 opacity-[0.08] [background-image:linear-gradient(rgba(255,255,255,.5)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.5)_1px,transparent_1px)] [background-size:32px_32px]" />

        <div className="relative mx-auto grid max-w-6xl gap-10 px-5 py-14 sm:px-8 sm:py-20 lg:grid-cols-[1.2fr_.8fr] lg:items-end">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-red-500/40 bg-red-600/15 px-3 py-1.5 text-xs font-black tracking-[0.18em] text-red-300">
              <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
              裝修踩雷警報
            </div>

            <h1 className="mt-6 max-w-4xl text-4xl font-black leading-[1.08] tracking-tight sm:text-6xl">
              花了百萬裝潢，
              <span className="text-red-500">最後卻不敢回家看。</span>
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-8 text-stone-300 sm:text-lg">
              真實屋主匿名投稿，整理工程拖延、惡意追加、施工瑕疵與售後失聯等高風險情境。每一則經驗，都可能替下一位屋主少賠一筆錢。
            </p>

            <div className="mt-7 flex flex-wrap gap-2">
              {warningTags.map((tag) => (
                <span key={tag} className="rounded-md border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold text-stone-300">
                  #{tag}
                </span>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#cases" className="rounded-lg bg-red-600 px-6 py-3.5 text-sm font-black text-white transition hover:bg-red-700">
                看最新踩雷案例
              </a>
              <a href="#report-form" className="rounded-lg border border-white/20 bg-white/5 px-6 py-3.5 text-sm font-black text-white transition hover:bg-white/10">
                匿名提供經驗
              </a>
            </div>
          </div>

          <aside className="rounded-2xl border border-red-500/30 bg-red-950/30 p-5 backdrop-blur sm:p-6">
            <div className="flex items-center gap-2 text-red-300">
              <AlertIcon />
              <p className="text-sm font-black">投稿資料正在持續增加</p>
            </div>
            <div className="mt-5 grid grid-cols-3 gap-3 text-center">
              <div className="rounded-xl bg-black/30 p-4">
                <p className="text-2xl font-black">{warningCases.length}</p>
                <p className="mt-1 text-xs text-stone-400">已公開案例</p>
              </div>
              <div className="rounded-xl bg-black/30 p-4">
                <p className="text-2xl font-black">5</p>
                <p className="mt-1 text-xs text-stone-400">高頻風險</p>
              </div>
              <div className="rounded-xl bg-black/30 p-4">
                <p className="text-2xl font-black">匿名</p>
                <p className="mt-1 text-xs text-stone-400">隱藏身分</p>
              </div>
            </div>
            <p className="mt-5 text-xs leading-6 text-stone-400">
              本站呈現投稿者單方陳述與匿名化整理內容，不代表已認定任何特定業者違法或有過失。
            </p>
          </aside>
        </div>
      </section>

      <section id="cases" className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
        <div className="flex flex-col justify-between gap-5 border-b-2 border-stone-950 pb-5 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-black tracking-[0.2em] text-red-700">LATEST REPORTS</p>
            <h2 className="mt-2 text-3xl font-black sm:text-4xl">最新匿名踩雷投稿</h2>
          </div>
          <p className="max-w-lg text-sm leading-6 text-stone-500">
            案例將不定期更新；標題經編輯整理，內文保留投稿原意並移除可識別個資。
          </p>
        </div>

        <div className="mt-8 grid gap-5 lg:grid-cols-2">
          {warningCases.map((warningCase, index) => (
            <article key={warningCase.id} className={`group relative overflow-hidden rounded-2xl border border-stone-300 bg-white shadow-[0_10px_30px_rgba(0,0,0,.05)] transition hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(0,0,0,.1)] ${index === 0 ? "lg:col-span-2" : ""}`}>
              <div className="border-b border-stone-200 bg-stone-950 px-5 py-3 text-white sm:px-7">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-red-600 px-2 py-1 text-[11px] font-black">{warningCase.severity}</span>
                    <span className="text-xs font-bold text-stone-300">{warningCase.category}</span>
                  </div>
                  <time dateTime={warningCase.date} className="text-xs text-stone-400">
                    {warningCase.date.replaceAll("-", ".")}
                  </time>
                </div>
              </div>

              <div className="p-5 sm:p-7">
                <p className="text-xs font-bold text-stone-400">匿名投稿 #{String(warningCase.id).padStart(3, "0")}</p>
                <h3 className={`mt-3 font-black leading-tight tracking-tight group-hover:text-red-700 ${index === 0 ? "text-3xl sm:text-4xl" : "text-2xl"}`}>
                  {warningCase.title}
                </h3>
                <p className="mt-4 border-l-4 border-red-600 pl-4 text-sm font-bold leading-7 text-stone-700 sm:text-base">
                  {warningCase.excerpt}
                </p>
                <p className="mt-5 text-sm leading-7 text-stone-600 sm:text-base">{warningCase.content}</p>

                <div className="mt-7 flex items-center justify-between border-t border-stone-200 pt-5">
                  <div>
                    <p className="text-sm font-black">{warningCase.reporter}</p>
                    <p className="text-xs text-stone-400">投稿者姓名已部分隱藏</p>
                  </div>
                  <span className="text-xs font-black text-red-700">完整案例紀錄 →</span>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-8 rounded-xl border border-amber-300 bg-amber-50 px-5 py-4 text-xs leading-6 text-amber-950">
          <strong>閱讀提醒：</strong> 投稿內容可能尚未經司法、主管機關或第三方調查確認。請勿僅憑單一案例判斷特定公司，簽約前仍應自行查證、比較合約與保留付款紀錄。
        </div>
      </section>

      <section id="report-form" className="border-t border-stone-300 bg-white">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 sm:px-8 sm:py-20 lg:grid-cols-[.8fr_1.2fr]">
          <div>
            <p className="text-sm font-black tracking-[0.2em] text-red-700">SHARE YOUR STORY</p>
            <h2 className="mt-3 text-3xl font-black leading-tight sm:text-4xl">你的經驗，可能讓別人避開同一個坑。</h2>
            <p className="mt-5 text-sm leading-7 text-stone-600 sm:text-base">
              描述簽約、付款、施工、驗收或售後過程。我們會先移除個資、檢視內容，再決定是否公開為風險教育案例。
            </p>
            <div className="mt-7 space-y-3 text-sm font-bold text-stone-700">
              <p>✓ 可使用匿名暱稱</p>
              <p>✓ 不直接公開公司與個人資料</p>
              <p>✓ 內容會先經人工整理</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="rounded-2xl border border-stone-300 bg-[#f7f5f0] p-5 shadow-sm sm:p-8">
            <div>
              <label htmlFor="nickname" className="block text-sm font-black">投稿暱稱</label>
              <input id="nickname" type="text" value={nickname} onChange={(event) => setNickname(event.target.value)} maxLength={30} placeholder="例如：台北第一次裝潢的屋主" className="mt-3 w-full rounded-xl border border-stone-300 bg-white px-4 py-3.5 text-sm outline-none transition placeholder:text-stone-400 focus:border-red-600 focus:ring-4 focus:ring-red-100" />
            </div>

            <div className="mt-6">
              <div className="flex items-center justify-between gap-4">
                <label htmlFor="content" className="block text-sm font-black">發生了什麼事？</label>
                <span className="text-xs text-stone-400">{content.length}/1500</span>
              </div>
              <textarea id="content" value={content} onChange={(event) => setContent(event.target.value)} maxLength={1500} rows={9} placeholder="建議包含：原本承諾、付款方式、施工問題、溝通紀錄、目前結果，以及你最希望提醒其他屋主的事情。" className="mt-3 w-full resize-y rounded-xl border border-stone-300 bg-white px-4 py-3.5 text-sm leading-7 outline-none transition placeholder:text-stone-400 focus:border-red-600 focus:ring-4 focus:ring-red-100" />
            </div>

            {formError && <p role="alert" className="mt-4 text-sm font-bold text-red-700">{formError}</p>}

            <button type="submit" disabled={isSubmitting} className="mt-6 w-full rounded-xl bg-red-700 px-5 py-4 text-sm font-black text-white transition hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-60">
              {isSubmitting ? "正在送出…" : "匿名送出我的經驗"}
            </button>
            <p className="mt-4 text-center text-xs leading-5 text-stone-400">請勿填寫電話、地址、身分證字號或其他敏感資料</p>
          </form>
        </div>
      </section>

      {showSuccessModal && (
        <div role="dialog" aria-modal="true" aria-labelledby="success-title" className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/70 px-5 backdrop-blur-sm" onMouseDown={(event) => { if (event.target === event.currentTarget) setShowSuccessModal(false); }}>
          <div className="relative w-full max-w-md rounded-2xl bg-white p-7 shadow-2xl sm:p-8">
            <button type="button" aria-label="關閉視窗" onClick={() => setShowSuccessModal(false)} className="absolute right-4 top-4 rounded-full p-2 text-stone-400 transition hover:bg-stone-100 hover:text-stone-900"><CloseIcon /></button>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-xl font-black text-red-700">✓</div>
            <h2 id="success-title" className="mt-5 text-2xl font-black">投稿已送出</h2>
            <p className="mt-4 leading-7 text-stone-600">我們會先檢視內容、移除可識別資訊，並評估是否納入裝修風險案例資料庫。內容公開不代表本站已認定任何特定業者違法或有過失。</p>
            <button type="button" onClick={() => setShowSuccessModal(false)} className="mt-7 w-full rounded-xl bg-stone-950 px-5 py-3.5 text-sm font-black text-white transition hover:bg-stone-800">確定</button>
          </div>
        </div>
      )}
    </main>
  );
}
