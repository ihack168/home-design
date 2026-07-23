"use client";

import { FormEvent, useMemo, useState } from "react";

type WarningCase = {
  id: number;
  reporter: string;
  company: string;
  location: string;
  category: string;
  date: string;
  title: string;
  content: string;
  tags: string[];
};

const warningCases: WarningCase[] = [
  {
    id: 1,
    reporter: "林先生",
    company: "北部某室內設計公司",
    location: "台北市",
    category: "工程延誤",
    date: "2026-07-18",
    title: "收取工程款後進度一再拖延，聯絡也沒有明確回覆",
    content:
      "簽約時承諾三個月內完工，前兩期款項支付後，現場施工進度開始停滯。期間多次詢問完工時間，對方都只說正在安排工班，後來甚至超過一週沒有回覆。最後工程延誤將近四個月，嚴重影響原本的入住計畫。",
    tags: ["工期延誤", "溝通困難", "付款爭議"],
  },
  {
    id: 2,
    reporter: "王小姐",
    company: "中部某設計工作室",
    location: "台中市",
    category: "追加預算",
    date: "2026-07-12",
    title: "原本報價與實際費用差距過大，施工後不斷要求追加",
    content:
      "最初討論的預算約為一百二十萬元，簽約後才陸續表示部分工程不包含在原報價內。水電、木作與油漆都有額外追加，最後總金額高出原預算將近五十萬元。許多追加項目只有透過通訊軟體告知，沒有提供完整明細。",
    tags: ["追加工程款", "報價不透明", "合約問題"],
  },
  {
    id: 3,
    reporter: "陳先生",
    company: "南部某裝修工程公司",
    location: "高雄市",
    category: "施工品質",
    date: "2026-07-05",
    title: "完工後短期內出現漏水與牆面龜裂，售後處理消極",
    content:
      "完工入住不到兩個月，浴室外牆便開始出現水痕，部分油漆也有剝落情況。通知公司後，對方第一次有派人查看，但之後遲遲沒有安排修繕。多次聯絡都表示要再確認工班時間，問題至今仍未完全處理。",
    tags: ["漏水", "施工瑕疵", "售後服務"],
  },
  {
    id: 4,
    reporter: "張小姐",
    company: "北部某空間設計公司",
    location: "新北市",
    category: "設計落差",
    date: "2026-06-28",
    title: "完工成果與設計圖落差明顯，現場尺寸也多處不符",
    content:
      "設計階段提供的模擬圖看起來很完整，但實際完工後，櫃體比例、燈光配置與材質顏色都有明顯差異。部分收納櫃因為尺寸計算錯誤，開門時還會碰到旁邊家具。反映後對方表示現場施工本來就會有誤差。",
    tags: ["設計圖落差", "尺寸錯誤", "驗收爭議"],
  },
  {
    id: 5,
    reporter: "黃先生",
    company: "北部某室內裝修團隊",
    location: "桃園市",
    category: "中途停工",
    date: "2026-06-19",
    title: "工程做到一半突然停工，屋主無法掌握後續安排",
    content:
      "拆除及水電工程完成後，現場將近一個月沒有工人進場。設計師最初表示材料尚未到貨，後來又說工班臨時調度，但始終無法提出新的施工排程。因為房屋已經拆除，屋主也無法自行入住或交給其他團隊接手。",
    tags: ["中途停工", "工班調度", "工程排程"],
  },
  {
    id: 6,
    reporter: "李小姐",
    company: "中部某室內設計公司",
    location: "彰化縣",
    category: "保固爭議",
    date: "2026-06-08",
    title: "簽約時承諾提供保固，完工後卻找不到負責窗口",
    content:
      "簽約前表示完工後有一年保固，但實際入住後發現櫃門歪斜、插座鬆動及浴室排水不順。原本負責的設計師已經離職，公司客服則表示要先確認責任歸屬，等待數週仍沒有收到明確的處理方式。",
    tags: ["保固問題", "售後失聯", "修繕爭議"],
  },
];

const categories = [
  "全部案例",
  "工程延誤",
  "追加預算",
  "施工品質",
  "設計落差",
  "中途停工",
  "保固爭議",
];

function WarningIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-6 w-6"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.8}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 9v4m0 4h.01M10.3 3.84 2.23 17.82A2 2 0 0 0 3.96 20.8h16.08a2 2 0 0 0 1.73-2.98L13.7 3.84a2 2 0 0 0-3.4 0Z"
      />
    </svg>
  );
}

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
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
    </svg>
  );
}

export default function WarningCasesPage() {
  const [selectedCategory, setSelectedCategory] = useState("全部案例");
  const [nickname, setNickname] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [incidentContent, setIncidentContent] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredCases = useMemo(() => {
    if (selectedCategory === "全部案例") {
      return warningCases;
    }

    return warningCases.filter(
      (warningCase) => warningCase.category === selectedCategory,
    );
  }, [selectedCategory]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");

    const cleanedNickname = nickname.trim();
    const cleanedContent = incidentContent.trim();

    if (cleanedNickname.length < 2) {
      setFormError("請填寫至少 2 個字的檢舉人匿稱。");
      return;
    }

    if (cleanedContent.length < 30) {
      setFormError("請較完整描述事發過程，內容至少需要 30 個字。");
      return;
    }

    if (!agreed) {
      setFormError("送出前請先確認並同意投稿說明。");
      return;
    }

    setIsSubmitting(true);

    try {
      /*
       * 日後串接 API 時，可將下方延遲替換成：
       *
       * const response = await fetch("/api/warning-cases", {
       *   method: "POST",
       *   headers: {
       *     "Content-Type": "application/json",
       *   },
       *   body: JSON.stringify({
       *     nickname: cleanedNickname,
       *     companyName: companyName.trim(),
       *     content: cleanedContent,
       *   }),
       * });
       *
       * if (!response.ok) {
       *   throw new Error("投稿失敗");
       * }
       */

      await new Promise((resolve) => setTimeout(resolve, 700));

      setShowSuccessModal(true);
      setNickname("");
      setCompanyName("");
      setIncidentContent("");
      setAgreed(false);
    } catch {
      setFormError("目前無法送出資料，請稍後再試。");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-stone-50 text-stone-900">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-stone-200 bg-stone-950 text-white">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-red-600 blur-3xl" />
          <div className="absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-amber-500 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-24 lg:px-10">
          <div className="max-w-4xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-red-400/30 bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-100">
              <WarningIcon />
              裝修消費警示
            </div>

            <h1 className="text-4xl font-black leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              裝修踩雷警示案例
              <span className="mt-2 block text-red-400">別讓下一個受害者是你</span>
            </h1>

            <p className="mt-6 max-w-3xl text-base leading-8 text-stone-300 sm:text-lg">
              彙整常見的工程延誤、惡意追加、施工瑕疵、停工失聯與保固爭議，
              透過案例分析協助屋主在簽約與付款前辨識可能的裝修風險。
            </p>

            <div className="mt-8 flex flex-wrap gap-3 text-sm text-stone-300">
              <span className="rounded-full border border-white/15 bg-white/5 px-4 py-2">
                案例均隱藏可識別資訊
              </span>
              <span className="rounded-full border border-white/15 bg-white/5 px-4 py-2">
                投稿內容須經人工審核
              </span>
              <span className="rounded-full border border-white/15 bg-white/5 px-4 py-2">
                不公開未經查證的公司名稱
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Notice */}
      <section className="border-b border-amber-200 bg-amber-50">
        <div className="mx-auto flex max-w-7xl gap-3 px-5 py-5 text-sm leading-6 text-amber-950 sm:px-8 lg:px-10">
          <div className="mt-0.5 shrink-0 text-amber-700">
            <WarningIcon />
          </div>

          <p>
            <strong>案例說明：</strong>
            本頁內容以常見裝修糾紛情境、匿名投稿與公開案例類型進行去識別化整理，
            僅作為裝修風險提醒，不代表對任何特定個人或公司的事實認定。
          </p>
        </div>
      </section>

      {/* Cases */}
      <section className="mx-auto max-w-7xl px-5 py-14 sm:px-8 lg:px-10">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-red-700">
              Warning cases
            </p>

            <h2 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
              最近公開的匿名案例
            </h2>

            <p className="mt-3 max-w-2xl leading-7 text-stone-600">
              以下案例已隱藏公司名稱、聯絡方式、地址及其他可識別資訊。
            </p>
          </div>

          <div className="rounded-2xl border border-stone-200 bg-white px-5 py-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-stone-500">
              目前顯示
            </p>
            <p className="mt-1 text-2xl font-black text-stone-900">
              {filteredCases.length}
              <span className="ml-1 text-sm font-medium text-stone-500">則案例</span>
            </p>
          </div>
        </div>

        {/* Category buttons */}
        <div className="mt-8 flex gap-2 overflow-x-auto pb-2">
          {categories.map((category) => {
            const isActive = selectedCategory === category;

            return (
              <button
                key={category}
                type="button"
                onClick={() => setSelectedCategory(category)}
                className={`shrink-0 rounded-full px-4 py-2.5 text-sm font-bold transition ${
                  isActive
                    ? "bg-stone-950 text-white shadow-md"
                    : "border border-stone-200 bg-white text-stone-600 hover:border-stone-400 hover:text-stone-950"
                }`}
              >
                {category}
              </button>
            );
          })}
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          {filteredCases.map((warningCase) => (
            <article
              key={warningCase.id}
              className="group overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="border-b border-stone-100 px-6 py-5 sm:px-7">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-stone-900 text-sm font-black text-white">
                      {warningCase.reporter.slice(0, 1)}
                    </div>

                    <div className="min-w-0">
                      <p className="font-bold text-stone-900">
                        {warningCase.reporter}
                      </p>
                      <p className="mt-0.5 text-xs text-stone-500">
                        匿名投稿者・身分未公開
                      </p>
                    </div>
                  </div>

                  <time
                    dateTime={warningCase.date}
                    className="shrink-0 text-xs text-stone-400"
                  >
                    {warningCase.date.replaceAll("-", ".")}
                  </time>
                </div>
              </div>

              <div className="px-6 py-6 sm:px-7">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-700">
                    {warningCase.category}
                  </span>

                  <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-medium text-stone-600">
                    {warningCase.location}
                  </span>

                  <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-medium text-stone-600">
                    公司資訊已隱藏
                  </span>
                </div>

                <h3 className="mt-5 text-xl font-black leading-8 text-stone-950">
                  {warningCase.title}
                </h3>

                <div className="mt-4 rounded-2xl border border-stone-100 bg-stone-50 p-5">
                  <p className="mb-2 text-xs font-bold uppercase tracking-wider text-stone-400">
                    事發過程
                  </p>

                  <p className="text-sm leading-7 text-stone-700">
                    {warningCase.content}
                  </p>
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  {warningCase.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs font-semibold text-stone-500"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-stone-100 bg-stone-50/70 px-6 py-4 text-xs text-stone-500 sm:px-7">
                <span>案件編號 WC-{String(warningCase.id).padStart(4, "0")}</span>
                <span className="font-semibold text-amber-700">資料審核整理中</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Submission form */}
      <section
        id="report-form"
        className="border-t border-stone-200 bg-white py-16 sm:py-20"
      >
        <div className="mx-auto grid max-w-7xl gap-10 px-5 sm:px-8 lg:grid-cols-[0.85fr_1.15fr] lg:px-10">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-red-700">
              Share your experience
            </p>

            <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
              提供您的裝修經驗
            </h2>

            <p className="mt-5 leading-8 text-stone-600">
              您提供的內容將由管理人員進行初步檢視、去識別化及分類。
              經確認具有公共提醒價值後，可能整理為匿名案例，協助更多屋主辨識常見裝修風險。
            </p>

            <div className="mt-8 space-y-4">
              {[
                "不會公開您的真實姓名及聯絡資訊",
                "未經查證前不會公開特定公司名稱",
                "內容可能經過刪減、匿名化與文字整理",
                "請避免填寫身分證、電話或完整地址",
              ].map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <div className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-100 text-xs font-black text-green-700">
                    ✓
                  </div>
                  <p className="text-sm leading-6 text-stone-600">{item}</p>
                </div>
              ))}
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            className="rounded-3xl border border-stone-200 bg-stone-50 p-6 shadow-sm sm:p-8"
          >
            <div>
              <label
                htmlFor="nickname"
                className="block text-sm font-bold text-stone-900"
              >
                檢舉人匿稱
                <span className="ml-1 text-red-600">*</span>
              </label>

              <p className="mt-1 text-xs leading-5 text-stone-500">
                例如：林先生、北部屋主、第一次裝修的屋主。
              </p>

              <input
                id="nickname"
                name="nickname"
                type="text"
                value={nickname}
                onChange={(event) => setNickname(event.target.value)}
                maxLength={30}
                autoComplete="nickname"
                placeholder="請輸入公開顯示的匿稱"
                className="mt-3 w-full rounded-xl border border-stone-300 bg-white px-4 py-3.5 text-sm outline-none transition placeholder:text-stone-400 focus:border-stone-900 focus:ring-4 focus:ring-stone-900/5"
              />
            </div>

            <div className="mt-6">
              <label
                htmlFor="companyName"
                className="block text-sm font-bold text-stone-900"
              >
                被反映的公司名稱
                <span className="ml-2 text-xs font-medium text-stone-400">
                  選填
                </span>
              </label>

              <p className="mt-1 text-xs leading-5 text-stone-500">
                僅供後台查核使用，前台不會直接顯示未經確認的名稱。
              </p>

              <input
                id="companyName"
                name="companyName"
                type="text"
                value={companyName}
                onChange={(event) => setCompanyName(event.target.value)}
                maxLength={80}
                placeholder="請輸入公司或工作室名稱"
                className="mt-3 w-full rounded-xl border border-stone-300 bg-white px-4 py-3.5 text-sm outline-none transition placeholder:text-stone-400 focus:border-stone-900 focus:ring-4 focus:ring-stone-900/5"
              />
            </div>

            <div className="mt-6">
              <div className="flex items-end justify-between gap-4">
                <label
                  htmlFor="incidentContent"
                  className="block text-sm font-bold text-stone-900"
                >
                  檢舉內容與事發過程
                  <span className="ml-1 text-red-600">*</span>
                </label>

                <span className="shrink-0 text-xs text-stone-400">
                  {incidentContent.length}/2000
                </span>
              </div>

              <p className="mt-1 text-xs leading-5 text-stone-500">
                建議說明簽約時間、工程內容、付款情況、發生的問題及目前處理進度。
              </p>

              <textarea
                id="incidentContent"
                name="incidentContent"
                value={incidentContent}
                onChange={(event) => setIncidentContent(event.target.value)}
                minLength={30}
                maxLength={2000}
                rows={10}
                placeholder="請依照實際情況，完整描述事發經過……"
                className="mt-3 w-full resize-y rounded-xl border border-stone-300 bg-white px-4 py-3.5 text-sm leading-7 outline-none transition placeholder:text-stone-400 focus:border-stone-900 focus:ring-4 focus:ring-stone-900/5"
              />
            </div>

            <label className="mt-6 flex cursor-pointer items-start gap-3 rounded-2xl border border-stone-200 bg-white p-4">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(event) => setAgreed(event.target.checked)}
                className="mt-1 h-4 w-4 rounded border-stone-300 accent-stone-950"
              />

              <span className="text-xs leading-6 text-stone-600">
                我確認以上內容為本人所知悉的經驗或事實陳述，並同意網站進行必要的
                去識別化、分類、摘要與文字整理。投稿不代表內容一定會公開。
              </span>
            </label>

            {formError && (
              <div
                role="alert"
                className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
              >
                {formError}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-6 flex w-full items-center justify-center rounded-xl bg-red-700 px-5 py-4 text-sm font-black text-white shadow-lg shadow-red-900/10 transition hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "正在送出資料…" : "送出裝修經驗"}
            </button>

            <p className="mt-4 text-center text-xs leading-5 text-stone-400">
              請勿提交惡意攻擊、無法佐證或包含第三人敏感個資的內容。
            </p>
          </form>
        </div>
      </section>

      {/* Success modal */}
      {showSuccessModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/70 px-5 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="success-modal-title"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setShowSuccessModal(false);
            }
          }}
        >
          <div className="relative w-full max-w-lg rounded-3xl bg-white p-7 shadow-2xl sm:p-9">
            <button
              type="button"
              aria-label="關閉視窗"
              onClick={() => setShowSuccessModal(false)}
              className="absolute right-5 top-5 rounded-full p-2 text-stone-400 transition hover:bg-stone-100 hover:text-stone-900"
            >
              <CloseIcon />
            </button>

            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-2xl font-black text-green-700">
              ✓
            </div>

            <h2
              id="success-modal-title"
              className="mt-6 text-2xl font-black text-stone-950"
            >
              感謝您提供相關資訊
            </h2>

            <p className="mt-4 leading-8 text-stone-600">
              我們已收到您提供的裝修經驗，後續將針對內容進行初步檢視、
              資料查核及去識別化處理。
            </p>

            <p className="mt-3 leading-8 text-stone-600">
              若內容具備可驗證性及公共提醒價值，我們可能將其整理為匿名案例，
              納入本站的裝修風險知識庫，作為 AI 分析常見裝修問題與風險模式的參考資料，
              協助更多有裝修需求的屋主降低踩雷風險。
            </p>

            <div className="mt-5 rounded-2xl bg-stone-50 p-4 text-xs leading-6 text-stone-500">
              為保障投稿者及相關當事人權益，未經確認的公司名稱與可識別資訊不會直接公開。
              投稿內容是否刊登，將視資料完整度與審核結果決定。
            </div>

            <button
              type="button"
              onClick={() => setShowSuccessModal(false)}
              className="mt-7 w-full rounded-xl bg-stone-950 px-5 py-3.5 text-sm font-black text-white transition hover:bg-stone-800"
            >
              我知道了
            </button>
          </div>
        </div>
      )}
    </main>
  );
}