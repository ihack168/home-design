import type { Metadata } from "next";

import { Footer } from "@/components/footer";
import { HeroSection } from "@/components/hero-section";
import { LatestPostsSection } from "@/components/latest-posts-section";
import { LineConsultButton } from "@/components/line-consult-button";

const SITE_URL = "https://home.line88.tw";
const SITE_NAME = "台灣社會住宅包租代管資訊站";
const COMPANY_NAME = "凌群不動產";

const PAGE_TITLE =
  "台灣社會住宅包租代管資訊站｜房東出租、公益出租人與租屋補助";

const PAGE_DESCRIPTION =
  "由凌群不動產建立並經營，整理台灣社會住宅包租代管、公益出租人、房東出租、租屋補助、租客權益與房屋出租管理資訊。本站為民間資訊網站，非政府官方網站。";

const FAQ_ITEMS = [
  {
    question: "什麼是社會住宅包租代管？",
    answer:
      "社會住宅包租代管是由專業業者協助房東出租房屋、媒合租客及處理租務管理的住宅服務方案；實際方案內容與資格，應以政府最新公告及承辦單位說明為準。",
  },
  {
    question: "房東加入包租代管有什麼好處？",
    answer:
      "房東可減少自行刊登、帶看、簽約、收租及處理租務問題的時間成本，並依適用方案了解稅賦、修繕或相關補助措施。",
  },
  {
    question: "什麼是公益出租人？",
    answer:
      "公益出租人通常是指將住宅出租給符合租金補貼申請資格者，並符合相關認定條件的房東；認定方式與優惠內容應以主管機關最新規定為準。",
  },
  {
    question: "租客可以申請租屋補助嗎？",
    answer:
      "符合所得、家庭成員、住宅持有及租賃契約等條件的租客，可依政府規定申請租金補貼；實際資格、金額與申請期間以中央及地方政府最新公告為準。",
  },
] as const;

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    url: SITE_URL,
    siteName: SITE_NAME,
    locale: "zh_TW",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function Home() {
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": ["Organization", "RealEstateAgent"],
        "@id": `${SITE_URL}/#organization`,
        name: COMPANY_NAME,
        url: SITE_URL,
        description:
          "凌群不動產建立並經營台灣社會住宅包租代管資訊站，提供社會住宅包租代管、房東出租與房屋出租管理相關資訊及諮詢。",
        areaServed: {
          "@type": "Country",
          name: "Taiwan",
        },
        knowsAbout: [
          "社會住宅包租代管",
          "公益出租人",
          "房東出租",
          "房屋出租管理",
          "租屋補助",
          "租客權益",
          "住宅租賃",
        ],
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: SITE_URL,
        name: SITE_NAME,
        alternateName: "社會住宅包租代管資訊站",
        description: PAGE_DESCRIPTION,
        inLanguage: "zh-Hant-TW",
        publisher: {
          "@id": `${SITE_URL}/#organization`,
        },
      },
      {
        "@type": "WebPage",
        "@id": `${SITE_URL}/#webpage`,
        url: SITE_URL,
        name: PAGE_TITLE,
        description: PAGE_DESCRIPTION,
        inLanguage: "zh-Hant-TW",
        isPartOf: {
          "@id": `${SITE_URL}/#website`,
        },
        about: [
          {
            "@type": "Thing",
            name: "社會住宅包租代管",
          },
          {
            "@type": "Thing",
            name: "公益出租人",
          },
          {
            "@type": "Thing",
            name: "租屋補助",
          },
        ],
        publisher: {
          "@id": `${SITE_URL}/#organization`,
        },
      },
      {
        "@type": "Service",
        "@id": `${SITE_URL}/#service`,
        name: "社會住宅包租代管資訊與諮詢",
        serviceType: "社會住宅包租代管與房屋出租管理資訊",
        description:
          "提供社會住宅包租代管、公益出租人、房東出租、租屋補助、租客權益與房屋出租管理相關資訊及諮詢。",
        provider: {
          "@id": `${SITE_URL}/#organization`,
        },
        areaServed: {
          "@type": "Country",
          name: "Taiwan",
        },
        audience: [
          {
            "@type": "Audience",
            audienceType: "有房屋出租或租務管理需求的房東",
          },
          {
            "@type": "Audience",
            audienceType: "查詢租屋補助與租客權益資訊的租客",
          },
        ],
      },
      {
        "@type": "FAQPage",
        "@id": `${SITE_URL}/#faq`,
        mainEntity: FAQ_ITEMS.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: item.answer,
          },
        })),
      },
    ],
  };

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
        }}
      />

      <main>
        <div className="pb-6 pt-24 md:pt-32">
          <HeroSection />
        </div>

        <LatestPostsSection />

        <section
          aria-labelledby="site-introduction-title"
          className="mx-auto max-w-3xl px-6 py-14 text-center md:py-20"
        >
          <h2
            id="site-introduction-title"
            className="text-2xl font-black tracking-tight text-foreground md:text-4xl"
          >
            社會住宅包租代管、房東出租與租屋資訊
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-muted-foreground">
            本站由凌群不動產建立並經營，整理社會住宅包租代管、公益出租人、
            房東出租、租屋補助、租客權益與房屋出租管理資訊，協助房東及租客快速理解相關制度與流程。
          </p>

          <p className="mt-3 text-sm leading-7 text-muted-foreground">
            本站為民間資訊網站，非政府官方網站；政策資格與申請內容請以主管機關最新公告為準。
          </p>

          <LineConsultButton className="mt-7 inline-flex rounded-full bg-[#06C755] px-7 py-3.5 text-sm font-semibold text-white transition-opacity hover:opacity-90">
            LINE 諮詢包租代管
          </LineConsultButton>
        </section>

        <section
          aria-labelledby="home-faq-title"
          className="mx-auto max-w-3xl px-6 pb-20"
        >
          <div className="border-t border-border/70 pt-10">
            <h2
              id="home-faq-title"
              className="text-center text-2xl font-black tracking-tight text-foreground md:text-3xl"
            >
              社會住宅包租代管常見問題
            </h2>

            <div className="mt-7 divide-y divide-border/70 border-y border-border/70">
              {FAQ_ITEMS.map((item) => (
                <details key={item.question} className="group py-5">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-5 font-bold text-foreground">
                    <span>{item.question}</span>
                    <span
                      aria-hidden="true"
                      className="text-xl font-normal text-muted-foreground transition-transform group-open:rotate-45"
                    >
                      +
                    </span>
                  </summary>

                  <p className="max-w-2xl pt-3 text-sm leading-7 text-muted-foreground md:text-base">
                    {item.answer}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
