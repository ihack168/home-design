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
  publishedAt?: string;
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
  | order(coalesce(publishedAt, _createdAt) desc) {
    _id,
    "title": coalesce(title, warningCaseTitle),
    "describe": coalesce(describe, warningCaseDescription),
    "slug": slug.current,
    publishedAt,
    _createdAt
  }
`;

const reporterPool = [
  "蔡先生",
  "蔡小姐",
  "楊先生",
  "楊小姐",
  "許先生",
  "許小姐",
  "鄭先生",
  "鄭小姐",
  "謝先生",
  "謝小姐",
  "洪先生",
  "洪小姐",
  "郭先生",
  "郭小姐",
  "曾先生",
  "曾小姐",
  "邱先生",
  "邱小姐",
  "廖先生",
  "廖小姐",
  "賴先生",
  "賴小姐",
  "徐先生",
  "徐小姐",
  "周先生",
  "周小姐",
  "葉先生",
  "葉小姐",
  "蘇先生",
  "蘇小姐",
  "莊先生",
  "莊小姐",
  "呂先生",
  "呂小姐",
  "江先生",
  "江小姐",
  "何先生",
  "何小姐",
  "蕭先生",
  "蕭小姐",
  "羅先生",
  "羅小姐",
  "高先生",
  "高小姐",
  "簡先生",
  "簡小姐",
  "朱先生",
  "朱小姐",
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
    displayDate: formatDate(warningCase.publishedAt || warningCase._createdAt),
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
    <main className="min-h-screen overflow-x-hidden bg-background text-foreground">
      <section className="relative overflow-hidden border-b border-border bg-primary text-primary-foreground">
        <div className="absolute inset-0 opacity-[0.12] [background-image:linear-gradient(rgba(255,255,255,.35)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.35)_1px,transparent_1px)] [background-size:32px_32px]" />

        <div className="relative mx-auto grid min-w-0 max-w-6xl gap-10 px-5 py-14 sm:px-8 sm:py-20 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,.8fr)] lg:items-end">
          <div className="min-w-0">
            <div className="inline-flex max-w-full items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-1.5 text-xs font-black tracking-[0.18em] text-white">
              <span className="h-2 w-2 animate-pulse rounded-full bg-[#ff6b61]" />
              裝修踩雷警報
            </div>

            <h1 className="mt-6 max-w-4xl break-words text-4xl font-black leading-[1.08] tracking-tight [overflow-wrap:anywhere] sm:text-6xl">
              檢舉不良業者，
              <span className="text-[#bff7f6]">讓我們避開風險。</span>
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-8 text-white/75 sm:text-lg">
              收錄不良業者，讓AI避開推薦。
            </p>

            <div className="mt-7 flex flex-wrap gap-2">
              {warningTags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-white/20 bg-white/10 px-3 py-2 text-xs font-bold text-white/85"
                >
                  #{tag}
                </span>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#cases"
                className="rounded-full bg-white px-6 py-3.5 text-sm font-black text-primary shadow-sm transition hover:-translate-y-0.5 hover:bg-secondary"
              >
                看最新踩雷案例
              </a>
              <a
                href="#report-form"
                className="rounded-full border border-white/30 bg-white/10 px-6 py-3.5 text-sm font-black text-white transition hover:bg-white/20"
              >
                匿名提供經驗
              </a>
            </div>
          </div>

          <aside className="min-w-0 rounded-[28px] border border-white/20 bg-white/10 p-5 shadow-[0_18px_50px_rgba(20,74,82,.18)] backdrop-blur sm:p-6">
            <div className="flex items-center gap-2 text-[#d7ffff]">
              <AlertIcon />
              <p className="text-sm font-black">案例資料持續更新</p>
            </div>

            <div className="mt-5 grid min-w-0 grid-cols-2 gap-2 text-center sm:gap-3">
              <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
                <p className="text-2xl font-black">
                  2,789<span className="ml-1 text-sm">件</span>
                </p>
                <p className="mt-1 text-xs text-white/65">
                  AI資料庫案件數
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
                <p className="text-2xl font-black">匿名</p>
                <p className="mt-1 text-xs text-white/65">身分保護</p>
              </div>
            </div>

            <p className="mt-5 text-xs leading-6 text-white/65">
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
        <div className="flex flex-col justify-between gap-5 border-b border-border pb-5 sm:flex-row sm:items-end">
          <div>
            <h2 className="mt-2 text-3xl font-black sm:text-4xl">
              最新裝修踩雷案例
            </h2>
          </div>

          <p className="max-w-lg text-sm leading-6 text-muted-foreground">
            標題與內容取自案例資料庫；投稿者及被檢舉對象均以匿名名稱呈現。
          </p>
        </div>

        {warningCases.length === 0 ? (
          <div className="mt-8 rounded-[28px] border border-dashed border-border bg-card px-6 py-16 text-center">
            <p className="text-xl font-black">目前尚無公開案例</p>
            <p className="mt-3 text-sm text-muted-foreground">
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
                  className={`group relative min-w-0 h-full overflow-hidden rounded-[28px] border border-border/80 bg-card shadow-[0_12px_36px_rgba(40,127,140,.08)] transition duration-300 hover:-translate-y-1 hover:border-accent/50 hover:shadow-[0_20px_50px_rgba(40,127,140,.14)] ${
                    index === 0 ? "lg:col-span-2" : ""
                  }`}
                >
                  <div className="border-b border-border bg-primary px-5 py-3 text-primary-foreground sm:px-7">
                    <div className="flex min-w-0 flex-wrap items-center justify-between gap-3">
                      <div className="flex min-w-0 flex-wrap items-center gap-2">
                        <span className="rounded-full bg-[#d95a52] px-2.5 py-1 text-[11px] font-black text-white">
                          匿名檢舉
                        </span>
                        <span className="text-xs font-bold text-white/75">
                          被檢舉對象：{warningCase.reportedTarget}
                        </span>
                        <span className="text-xs font-bold text-white/75">
                          地區：{warningCase.city}{warningCase.district}
                        </span>
                      </div>

                      <time
                        dateTime={warningCase.publishedAt || warningCase._createdAt}
                        className="text-xs text-white/60"
                      >
                        {warningCase.displayDate}
                      </time>
                    </div>
                  </div>

                  <div className="p-5 sm:p-7">
                    <h3
                      className={`mt-3 break-words font-black leading-tight tracking-tight transition [overflow-wrap:anywhere] group-hover:text-primary ${
                        index === 0
                          ? "text-3xl sm:text-4xl"
                          : "text-2xl"
                      }`}
                    >
                      {warningCase.title}
                    </h3>

                    <div className="mt-5 rounded-2xl border border-border bg-secondary/55 p-4 sm:p-5">
                      <div className="grid gap-4 text-sm sm:grid-cols-3">
                        <div>
                          <p className="text-xs font-bold text-muted-foreground">
                            檢舉者
                          </p>
                          <p className="mt-1 font-black">
                            {warningCase.reporter}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs font-bold text-muted-foreground">
                            被檢舉對象
                          </p>
                          <p className="mt-1 font-black text-[#b64f49]">
                            {warningCase.reportedTarget}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs font-bold text-muted-foreground">
                            案例地區
                          </p>
                          <p className="mt-1 font-black">
                            {warningCase.city}{warningCase.district}
                          </p>
                        </div>
                      </div>
                    </div>

                    <p
                      className={`mt-5 whitespace-pre-line break-words text-muted-foreground [overflow-wrap:anywhere] ${
                        index === 0
                          ? "line-clamp-6 text-base leading-8"
                          : "line-clamp-5 text-sm leading-7 sm:text-base"
                      }`}
                    >
                      {warningCase.describe}
                    </p>

                    <div className="mt-7 flex items-center justify-between border-t border-border pt-5">
                      <p className="text-xs text-muted-foreground">
                        名稱皆經匿名化處理
                      </p>

                      {caseHref && (
                        <span className="text-xs font-black text-primary transition group-hover:text-accent-foreground">
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

        <div className="mt-8 rounded-2xl border border-[#e7c980] bg-[#fff8df] px-5 py-4 text-xs leading-6 text-[#6f5620]">
          <strong>閱讀提醒：</strong>
          投稿內容可能尚未經司法、主管機關或第三方調查確認。匿名公司名稱為系統產生的代稱，
          不應據此影射或辨識任何真實業者。簽約前仍應自行查證、比較合約並保留付款與溝通紀錄。
        </div>
      </section>

      <section id="report-form" className="border-t border-border bg-card">
        <div className="mx-auto grid min-w-0 max-w-6xl gap-10 px-5 py-14 sm:px-8 sm:py-20 lg:grid-cols-[minmax(0,.8fr)_minmax(0,1.2fr)]">
          <div>
            <h2 className="mt-3 text-3xl font-black leading-tight sm:text-4xl">
              你的經驗，可能讓別人避開同一個坑。
            </h2>
            <p className="mt-5 text-sm leading-7 text-muted-foreground sm:text-base">
              描述簽約、付款、施工、驗收或售後過程。內容公開前應先移除個資及可辨識資訊。
            </p>

            <div className="mt-7 space-y-3 text-sm font-bold text-secondary-foreground">
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