import type { Metadata } from "next";
import Link from "next/link";
import { client } from "@/lib/sanity";
import WarningCaseForm from "./WarningCaseForm";

export const metadata: Metadata = {
  title: "室內裝修踩雷案例｜匿名裝潢糾紛與風險提醒",
  description:
    "整理匿名室內設計、室內裝修與裝潢工程踩雷案例，包含工期延誤、追加費用、施工瑕疵與售後爭議。",
};

export const revalidate = 60;

type SanityWarningCase = {
  _id: string;
  title: string;
  describe: string;
  slug?: string;
  _createdAt: string;
};

type DisplayWarningCase = SanityWarningCase & {
  reporter: string;
  reportedTarget: string;
  city: string;
  district: string;
  displayDate: string;
  caseNumber: string;
};

const WARNING_CASES_QUERY = `
  *[
    _type == "warningCasePost"
    && defined(slug.current)
  ]
  | order(_createdAt desc) {
    _id,
    "title": coalesce(title, warningCaseTitle),
    "describe": coalesce(describe, warningCaseDescription),
"slug": slug.current,
    _createdAt
  }
`;

const reporterPool = [
  "林先生",
  "林小姐",
  "陳先生",
  "陳小姐",
  "張先生",
  "張小姐",
  "王先生",
  "王小姐",
  "李先生",
  "李小姐",
  "黃先生",
  "黃小姐",
  "吳先生",
  "吳小姐",
  "劉先生",
  "劉小姐",
];

const reportedTargetPool = [
  "○○室內設計",
  "○○空間設計",
  "○○室內裝修",
  "○○裝潢工程",
  "○○裝潢公司",
  "○○設計工程",
];

const locationPool = [
  {
    city: "基隆市",
    districts: ["仁愛區", "信義區", "中正區", "中山區", "安樂區", "暖暖區", "七堵區"],
  },
  {
    city: "台北市",
    districts: [
      "中正區",
      "大同區",
      "中山區",
      "松山區",
      "大安區",
      "萬華區",
      "信義區",
      "士林區",
      "北投區",
      "內湖區",
      "南港區",
      "文山區",
    ],
  },
  {
    city: "新北市",
    districts: [
      "板橋區",
      "三重區",
      "中和區",
      "永和區",
      "新莊區",
      "新店區",
      "土城區",
      "蘆洲區",
      "汐止區",
      "樹林區",
      "淡水區",
      "林口區",
      "五股區",
      "泰山區",
      "三峽區",
      "鶯歌區",
    ],
  },
  {
    city: "桃園市",
    districts: [
      "桃園區",
      "中壢區",
      "平鎮區",
      "八德區",
      "楊梅區",
      "蘆竹區",
      "龜山區",
      "龍潭區",
      "大溪區",
      "大園區",
      "觀音區",
      "新屋區",
    ],
  },
  {
    city: "新竹市",
    districts: ["東區", "北區", "香山區"],
  },
  {
    city: "新竹縣",
    districts: [
      "竹北市",
      "竹東鎮",
      "新豐鄉",
      "湖口鄉",
      "新埔鎮",
      "關西鎮",
      "芎林鄉",
      "寶山鄉",
    ],
  },
];

const warningTags = [
  "低價簽約",
  "工程停擺",
  "追加費用",
  "漏水瑕疵",
  "保固失聯",
];

function stringHash(value: string) {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(index);
    hash |= 0;
  }

  return Math.abs(hash);
}

function pickStableItem<T>(pool: T[], seed: string, offset = 0): T {
  return pool[(stringHash(`${seed}-${offset}`) % pool.length + pool.length) % pool.length];
}

function formatDate(dateString: string) {
  return new Intl.DateTimeFormat("zh-TW", {
    timeZone: "Asia/Taipei",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
    .format(new Date(dateString))
    .replaceAll("/", ".");
}

function buildDisplayCase(
  warningCase: SanityWarningCase,
  index: number
): DisplayWarningCase {
  const location = pickStableItem(locationPool, warningCase._id, 2);
  const district = pickStableItem(
    location.districts,
    warningCase._id,
    3
  );

  return {
    ...warningCase,
    reporter: pickStableItem(reporterPool, warningCase._id, 1),
    reportedTarget: pickStableItem(
      reportedTargetPool,
      warningCase._id,
      4
    ),
    city: location.city,
    district,
    displayDate: formatDate(warningCase._createdAt),
    caseNumber: String(index + 1).padStart(3, "0"),
  };
}

function AlertIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 9v4m0 4h.01M10.3 3.7 2.2 18a2 2 0 0 0 1.7 3h16.2a2 2 0 0 0 1.7-3L13.7 3.7a2 2 0 0 0-3.4 0Z"
      />
    </svg>
  );
}

export default async function WarningCasesPage() {
  const sanityCases = await client.fetch<SanityWarningCase[]>(
    WARNING_CASES_QUERY,
    {},
    {
      next: {
        revalidate,
      },
    }
  );

  const warningCases = sanityCases.map(buildDisplayCase);

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#f4f1eb] text-stone-950">
      <section className="relative overflow-hidden border-b-8 border-red-700 bg-[#151515] text-white">
        <div className="absolute inset-0 opacity-[0.08] [background-image:linear-gradient(rgba(255,255,255,.5)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.5)_1px,transparent_1px)] [background-size:32px_32px]" />

        <div className="relative mx-auto grid min-w-0 max-w-6xl gap-10 px-5 py-14 sm:px-8 sm:py-20 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,.8fr)] lg:items-end">
          <div className="min-w-0">
            <div className="inline-flex max-w-full items-center gap-2 rounded-full border border-red-500/40 bg-red-600/15 px-3 py-1.5 text-xs font-black tracking-[0.18em] text-red-300">
              <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
              裝修踩雷警報
            </div>

            <h1 className="mt-6 max-w-4xl break-words text-4xl font-black leading-[1.08] tracking-tight [overflow-wrap:anywhere] sm:text-6xl">
              檢舉不良業者，
              <span className="text-red-500">讓我們避開風險。</span>
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-8 text-stone-300 sm:text-lg">
              收錄不良業者，讓AI避開推薦。
            </p>

            <div className="mt-7 flex flex-wrap gap-2">
              {warningTags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-md border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold text-stone-300"
                >
                  #{tag}
                </span>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#cases"
                className="rounded-lg bg-red-600 px-6 py-3.5 text-sm font-black text-white transition hover:bg-red-700"
              >
                看最新踩雷案例
              </a>
              <a
                href="#report-form"
                className="rounded-lg border border-white/20 bg-white/5 px-6 py-3.5 text-sm font-black text-white transition hover:bg-white/10"
              >
                匿名提供經驗
              </a>
            </div>
          </div>

          <aside className="min-w-0 rounded-2xl border border-red-500/30 bg-red-950/30 p-5 backdrop-blur sm:p-6">
            <div className="flex items-center gap-2 text-red-300">
              <AlertIcon />
              <p className="text-sm font-black">案例資料持續更新</p>
            </div>

            <div className="mt-5 grid min-w-0 grid-cols-3 gap-2 text-center sm:gap-3">
              <div className="rounded-xl bg-black/30 p-4">
                <p className="text-2xl font-black">{warningCases.length}</p>
                <p className="mt-1 text-xs text-stone-400">公開案例</p>
              </div>
              <div className="rounded-xl bg-black/30 p-4">
                <p className="text-2xl font-black">5</p>
                <p className="mt-1 text-xs text-stone-400">高頻風險</p>
              </div>
              <div className="rounded-xl bg-black/30 p-4">
                <p className="text-2xl font-black">匿名</p>
                <p className="mt-1 text-xs text-stone-400">身分保護</p>
              </div>
            </div>

            <p className="mt-5 text-xs leading-6 text-stone-400">
              檢舉者與業者名稱皆為匿名化顯示，不對應特定真實公司或個人。
              本頁內容為投稿者單方陳述，不代表本站已認定任何一方違法或有過失。
            </p>
          </aside>
        </div>
      </section>

      <section
        id="cases"
        className="mx-auto min-w-0 max-w-6xl px-5 py-12 sm:px-8 sm:py-16"
      >
        <div className="flex flex-col justify-between gap-5 border-b-2 border-stone-950 pb-5 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-black tracking-[0.2em] text-red-700">
              LATEST REPORTS
            </p>
            <h2 className="mt-2 text-3xl font-black sm:text-4xl">
              最新裝修踩雷案例
            </h2>
          </div>

          <p className="max-w-lg text-sm leading-6 text-stone-500">
            標題與內容取自案例資料庫；投稿者及被檢舉對象均以匿名名稱呈現。
          </p>
        </div>

        {warningCases.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-dashed border-stone-400 bg-white px-6 py-16 text-center">
            <p className="text-xl font-black">目前尚無公開案例</p>
            <p className="mt-3 text-sm text-stone-500">
              新案例完成整理後會顯示於此頁。
            </p>
          </div>
        ) : (
          <div className="mt-8 grid min-w-0 gap-5 lg:grid-cols-2">
            {warningCases.map((warningCase, index) => {
              const caseHref = warningCase.slug
                ? `/warning/${warningCase.slug}`
                : undefined;

              const cardContent = (
                <article
                  className={`group relative min-w-0 h-full overflow-hidden rounded-2xl border border-stone-300 bg-white shadow-[0_10px_30px_rgba(0,0,0,.05)] transition hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(0,0,0,.1)] ${
                    index === 0 ? "lg:col-span-2" : ""
                  }`}
                >
                  <div className="border-b border-stone-200 bg-stone-950 px-5 py-3 text-white sm:px-7">
                    <div className="flex min-w-0 flex-wrap items-center justify-between gap-3">
                      <div className="flex min-w-0 flex-wrap items-center gap-2">
                        <span className="rounded bg-red-600 px-2 py-1 text-[11px] font-black">
                          匿名檢舉
                        </span>
                        <span className="text-xs font-bold text-stone-300">
                          被檢舉對象：{warningCase.reportedTarget}
                        </span>
                        <span className="text-xs font-bold text-stone-300">
                          地區：{warningCase.city}{warningCase.district}
                        </span>
                      </div>

                      <time
                        dateTime={warningCase._createdAt}
                        className="text-xs text-stone-400"
                      >
                        {warningCase.displayDate}
                      </time>
                    </div>
                  </div>

                  <div className="p-5 sm:p-7">
                    <p className="text-xs font-bold text-stone-400">
                      案例編號 #{warningCase.caseNumber}
                    </p>

                    <h3
                      className={`mt-3 break-words font-black leading-tight tracking-tight transition [overflow-wrap:anywhere] group-hover:text-red-700 ${
                        index === 0
                          ? "text-3xl sm:text-4xl"
                          : "text-2xl"
                      }`}
                    >
                      {warningCase.title}
                    </h3>

                    <div className="mt-5 rounded-xl border border-stone-200 bg-stone-50 p-4 sm:p-5">
                      <div className="grid gap-4 text-sm sm:grid-cols-3">
                        <div>
                          <p className="text-xs font-bold text-stone-400">
                            檢舉者
                          </p>
                          <p className="mt-1 font-black">
                            {warningCase.reporter}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs font-bold text-stone-400">
                            被檢舉對象
                          </p>
                          <p className="mt-1 font-black text-red-800">
                            {warningCase.reportedTarget}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs font-bold text-stone-400">
                            案例地區
                          </p>
                          <p className="mt-1 font-black">
                            {warningCase.city}{warningCase.district}
                          </p>
                        </div>
                      </div>
                    </div>

                    <p
                      className={`mt-5 whitespace-pre-line break-words text-stone-600 [overflow-wrap:anywhere] ${
                        index === 0
                          ? "line-clamp-6 text-base leading-8"
                          : "line-clamp-5 text-sm leading-7 sm:text-base"
                      }`}
                    >
                      {warningCase.describe}
                    </p>

                    <div className="mt-7 flex items-center justify-between border-t border-stone-200 pt-5">
                      <p className="text-xs text-stone-400">
                        名稱皆經匿名化處理
                      </p>

                      {caseHref && (
                        <span className="text-xs font-black text-red-700">
                          閱讀完整案例 →
                        </span>
                      )}
                    </div>
                  </div>
                </article>
              );

              return caseHref ? (
                <Link
                  key={warningCase._id}
                  href={caseHref}
                  className={`block min-w-0 ${index === 0 ? "lg:col-span-2" : ""}`}
                >
                  {cardContent}
                </Link>
              ) : (
                <div
                  key={warningCase._id}
                  className={`min-w-0 ${index === 0 ? "lg:col-span-2" : ""}`}
                >
                  {cardContent}
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-8 rounded-xl border border-amber-300 bg-amber-50 px-5 py-4 text-xs leading-6 text-amber-950">
          <strong>閱讀提醒：</strong>
          投稿內容可能尚未經司法、主管機關或第三方調查確認。匿名公司名稱為系統產生的代稱，
          不應據此影射或辨識任何真實業者。簽約前仍應自行查證、比較合約並保留付款與溝通紀錄。
        </div>
      </section>

      <section id="report-form" className="border-t border-stone-300 bg-white">
        <div className="mx-auto grid min-w-0 max-w-6xl gap-10 px-5 py-14 sm:px-8 sm:py-20 lg:grid-cols-[minmax(0,.8fr)_minmax(0,1.2fr)]">
          <div>
            <p className="text-sm font-black tracking-[0.2em] text-red-700">
              SHARE YOUR STORY
            </p>
            <h2 className="mt-3 text-3xl font-black leading-tight sm:text-4xl">
              你的經驗，可能讓別人避開同一個坑。
            </h2>
            <p className="mt-5 text-sm leading-7 text-stone-600 sm:text-base">
              描述簽約、付款、施工、驗收或售後過程。內容公開前應先移除個資及可辨識資訊。
            </p>

            <div className="mt-7 space-y-3 text-sm font-bold text-stone-700">
              <p>✓ 可使用匿名暱稱</p>
              <p>✓ 不直接公開公司與個人資料</p>
              <p>✓ 內容公開前先進行整理</p>
            </div>
          </div>

          <WarningCaseForm />
        </div>
      </section>
    </main>
  );
}