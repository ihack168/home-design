import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { client } from "@/lib/sanity";

export const revalidate = 0;
export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

type SanityWarningCase = {
  _id: string;
  title: string;
  describe: string;
  slug: string;
  publishedAt?: string;
  _createdAt: string;
};

type WarningCaseQueryResult = {
  warningCase: SanityWarningCase | null;
  orderedIds: string[];
};

type DisplayWarningCase = SanityWarningCase & {
  reporter: string;
  reportedTarget: string;
  city: string;
  district: string;
  displayDate: string;
  caseNumber: string;
};

const WARNING_CASE_QUERY = `
{
  "warningCase": *[
    _type == "warningCasePost"
    && slug.current in $slugCandidates
  ][0] {
    _id,
    "title": coalesce(title, warningCaseTitle),
    "describe": coalesce(describe, warningCaseDescription),
    "slug": slug.current,
    publishedAt,
    _createdAt
  },

  "orderedIds": *[
    _type == "warningCasePost"
    && defined(slug.current)
  ]
  | order(coalesce(publishedAt, _createdAt) desc)._id
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
    districts: [
      "仁愛區",
      "信義區",
      "中正區",
      "中山區",
      "安樂區",
      "暖暖區",
      "七堵區",
    ],
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

function stringHash(value: string) {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(index);
    hash |= 0;
  }

  return Math.abs(hash);
}

function pickStableItem<T>(pool: T[], seed: string, offset = 0): T {
  return pool[
    (stringHash(`${seed}-${offset}`) % pool.length + pool.length) % pool.length
  ];
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
  orderedIds: string[]
): DisplayWarningCase {
  const location = pickStableItem(locationPool, warningCase._id, 2);
  const district = pickStableItem(
    location.districts,
    warningCase._id,
    3
  );

  const caseIndex = orderedIds.indexOf(warningCase._id);

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
    displayDate: formatDate(
      warningCase.publishedAt || warningCase._createdAt
    ),
    caseNumber: String(caseIndex >= 0 ? caseIndex + 1 : 1).padStart(3, "0"),
  };
}

function buildSlugCandidates(rawSlug: string) {
  let decodedSlug = rawSlug;

  try {
    decodedSlug = decodeURIComponent(rawSlug);
  } catch {
    decodedSlug = rawSlug;
  }

  const encodedSlug = encodeURIComponent(decodedSlug);

  return Array.from(
    new Set([
      rawSlug,
      decodedSlug,
      encodedSlug,
    ])
  );
}

async function getWarningCase(slug: string) {
  const slugCandidates = buildSlugCandidates(slug);

  return client.fetch<WarningCaseQueryResult>(
    WARNING_CASE_QUERY,
    {
      slugCandidates,
    },
    {
      cache: "no-store",
    }
  );
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const result = await getWarningCase(slug);
  const warningCase = result.warningCase;

  if (!warningCase) {
    return {
      title: "找不到踩雷案例",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const description = warningCase.describe
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 150);

  return {
    title: `${warningCase.title}｜裝修踩雷案例`,
    description:
      description ||
      "匿名整理室內設計、室內裝修與裝潢工程爭議案例，提醒消費者留意裝修風險。",
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

export default async function WarningCasePage({ params }: PageProps) {
  const { slug } = await params;
  const result = await getWarningCase(slug);

  if (!result.warningCase) {
    notFound();
  }

  const warningCase = buildDisplayCase(
    result.warningCase,
    result.orderedIds
  );

  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="relative overflow-hidden border-b border-primary/15 bg-primary text-primary-foreground">
        <div className="absolute inset-0 opacity-[0.09] [background-image:linear-gradient(rgba(255,255,255,.45)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.45)_1px,transparent_1px)] [background-size:32px_32px]" />
        <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-accent/20 blur-3xl" />
        <div className="absolute -bottom-28 left-8 h-64 w-64 rounded-full bg-white/10 blur-3xl" />

        <div className="relative mx-auto max-w-5xl px-5 py-12 sm:px-8 sm:py-16">
          <Link
            href="/warning"
            className="inline-flex items-center gap-2 text-sm font-bold text-white/75 transition hover:text-white"
          >
            ← 返回裝修踩雷案例
          </Link>

          <div className="mt-8 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-black tracking-[0.16em] text-white backdrop-blur">
              <span className="h-2 w-2 animate-pulse rounded-full bg-red-400" />
              裝修踩雷警報
            </span>

            <span className="rounded-full bg-red-600 px-3 py-1.5 text-xs font-black text-white shadow-sm">
              匿名檢舉
            </span>
          </div>

          <h1 className="mt-6 max-w-4xl break-words text-3xl font-black leading-tight tracking-tight [overflow-wrap:anywhere] sm:text-5xl">
            {warningCase.title}
          </h1>

          <div className="mt-7 flex flex-wrap gap-x-6 gap-y-3 text-sm text-white/75">
            <p>
              被檢舉對象：
              <strong className="ml-1 text-red-200">
                {warningCase.reportedTarget}
              </strong>
            </p>

            <p>
              案例地區：
              <strong className="ml-1 text-white">
                {warningCase.city}
                {warningCase.district}
              </strong>
            </p>

            <time
              dateTime={warningCase.publishedAt || warningCase._createdAt}
            >
              發布日期：
              <strong className="ml-1 text-white">
                {warningCase.displayDate}
              </strong>
            </time>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-5xl gap-8 px-5 py-10 sm:px-8 sm:py-14 lg:grid-cols-[minmax(0,1fr)_280px]">
        <article className="overflow-hidden rounded-[28px] border border-border/80 bg-card shadow-[0_16px_50px_rgba(40,127,140,.08)]">
          <div className="border-b border-border/70 bg-secondary px-5 py-4 sm:px-8">
            <div className="flex items-center gap-2 text-primary">
              <AlertIcon />
              <p className="text-sm font-black tracking-wide">
                案例完整內容
              </p>
            </div>
          </div>

          <div className="p-5 sm:p-8">
            <div className="whitespace-pre-wrap break-words text-base leading-9 text-foreground/85 [overflow-wrap:anywhere]">
              {warningCase.describe}
            </div>
          </div>
        </article>

        <aside className="space-y-5">
          <section className="rounded-[24px] border border-border/80 bg-card p-5 shadow-[0_12px_35px_rgba(40,127,140,.06)]">
            <div className="inline-flex rounded-full bg-secondary px-3 py-1 text-xs font-black text-secondary-foreground">
              案例資訊
            </div>

            <h2 className="mt-3 text-xl font-black">
              匿名案例摘要
            </h2>

            <dl className="mt-5 space-y-4 text-sm">
              <div className="border-b border-border/70 pb-4">
                <dt className="text-xs font-bold text-muted-foreground">
                  檢舉者
                </dt>
                <dd className="mt-1 font-black">
                  {warningCase.reporter}
                </dd>
              </div>

              <div className="border-b border-border/70 pb-4">
                <dt className="text-xs font-bold text-muted-foreground">
                  被檢舉對象
                </dt>
                <dd className="mt-1 font-black text-red-700">
                  {warningCase.reportedTarget}
                </dd>
              </div>

              <div className="border-b border-border/70 pb-4">
                <dt className="text-xs font-bold text-muted-foreground">
                  案例地區
                </dt>
                <dd className="mt-1 font-black">
                  {warningCase.city}
                  {warningCase.district}
                </dd>
              </div>

              <div>
                <dt className="text-xs font-bold text-muted-foreground">
                  發布日期
                </dt>
                <dd className="mt-1 font-black">
                  {warningCase.displayDate}
                </dd>
              </div>
            </dl>
          </section>

          <section className="rounded-[22px] border border-amber-300 bg-amber-50 p-5 text-xs leading-6 text-amber-950">
            <p className="font-black">閱讀提醒</p>
            <p className="mt-2">
              公司名稱為系統產生的匿名代稱，不應據此影射或辨識任何真實業者。
              簽約前仍應自行查證、比較合約，並保留付款及溝通紀錄。
            </p>
          </section>

          <Link
            href="/warning#report-form"
            className="block rounded-[20px] bg-primary px-5 py-4 text-center text-sm font-black text-primary-foreground shadow-[0_10px_24px_rgba(40,127,140,.2)] transition hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-[0_14px_30px_rgba(40,127,140,.26)]"
          >
            匿名提供裝修經驗
          </Link>
        </aside>
      </section>
    </main>
  );
}
