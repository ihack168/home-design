```tsx
import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"

import { HeroSection } from "@/components/hero-section"
import { LatestPostsSection } from "@/components/latest-posts-section"
import { LineConsultButton } from "@/components/line-consult-button"
import { ServicesSection } from "@/components/services-section"

const SITE_URL = "https://homedesign.line88.tw"
const SITE_NAME = "台灣室內設計資訊網"

const PAGE_TITLE =
  "台灣室內設計資訊網｜建案室內設計提案與居家裝潢作品"

const PAGE_DESCRIPTION =
  "瀏覽全台住宅建案室內設計提案，依照建案名稱、坪數格局、空間類型與設計風格，尋找客廳、臥室、廚房及全室裝潢規劃靈感。"

const FEATURED_PROJECTS = [
  {
    name: "帝寶",
    location: "台北市大安區",
    style: "現代奢華風",
    layout: "大坪數住宅",
    description:
      "以沉穩石材、柔和燈光與木質元素，規劃兼具質感、收納及生活機能的住宅空間。",
    image: "/images/projects/dibao-modern.jpg",
    href: "/projects/dibao",
  },
  {
    name: "陶朱隱園",
    location: "台北市信義區",
    style: "自然現代風",
    layout: "景觀住宅",
    description:
      "結合自然材質、植栽與開放式空間，打造明亮通透並兼顧隱私的居住環境。",
    image: "/images/projects/tao-zhu-yin-yuan.jpg",
    href: "/projects/tao-zhu-yin-yuan",
  },
  {
    name: "遠雄九五",
    location: "新北市新莊區",
    style: "現代簡約風",
    layout: "高樓景觀宅",
    description:
      "運用俐落線條、低彩度配色與開放式公共空間，延伸高樓住宅的視覺尺度。",
    image: "/images/projects/farglory-95.jpg",
    href: "/projects/farglory-95",
  },
  {
    name: "冠德信義",
    location: "台北市信義區",
    style: "暖灰侘寂風",
    layout: "三房住宅",
    description:
      "透過柔和色調、自然塗料及弧形設計，創造安定舒適且兼具收納機能的居家空間。",
    image: "/images/projects/kindom-xinyi.jpg",
    href: "/projects/kindom-xinyi",
  },
  {
    name: "華固天鑄",
    location: "台北市士林區",
    style: "現代古典風",
    layout: "大坪數住宅",
    description:
      "結合現代比例、線板與石材質感，營造優雅精緻但不過度繁複的住宅氛圍。",
    image: "/images/projects/hwaguh-tianzhu.jpg",
    href: "/projects/hwaguh-tianzhu",
  },
  {
    name: "新店央北重劃區",
    location: "新北市新店區",
    style: "北歐無印風",
    layout: "小家庭三房",
    description:
      "以淺色木質、自然採光及整合式收納，規劃適合小家庭生活的清爽住宅空間。",
    image: "/images/projects/yangbei.jpg",
    href: "/projects/yangbei",
  },
] as const

const BROWSE_CATEGORIES = [
  {
    number: "01",
    title: "依建案名稱找設計",
    description:
      "搜尋住宅社區與建案名稱，查看不同格局、坪數及風格的室內設計提案。",
    href: "/projects",
    linkText: "瀏覽建案設計",
  },
  {
    number: "02",
    title: "依設計風格找靈感",
    description:
      "瀏覽現代風、北歐風、侘寂風、無印風、工業風及美式風等設計方向。",
    href: "/styles",
    linkText: "瀏覽設計風格",
  },
  {
    number: "03",
    title: "依居家空間找作品",
    description:
      "查看客廳、臥室、餐廳、廚房、玄關、書房及更衣室等空間設計提案。",
    href: "/spaces",
    linkText: "瀏覽空間設計",
  },
  {
    number: "04",
    title: "依坪數格局找方案",
    description:
      "從小坪數、兩房、三房到大坪數住宅，尋找適合房屋條件的規劃方向。",
    href: "/layouts",
    linkText: "瀏覽坪數格局",
  },
] as const

const FAQ_ITEMS = [
  {
    question: "網站上的建案室內設計圖片都是實際完工案例嗎？",
    answer:
      "不一定。本站內容可能包含室內設計概念、空間模擬與風格提案，主要用於呈現不同建案、格局與設計風格可能採用的規劃方向。若屬實際完工案例，頁面會另外清楚標示。",
  },
  {
    question: "可以依照我購買的建案提供室內設計方向嗎？",
    answer:
      "可以提供初步規劃方向。你可以準備建案名稱、房屋坪數、格局圖、家庭成員、喜愛風格及預算區間，作為空間規劃與後續諮詢參考。",
  },
  {
    question: "網站可以直接承接室內設計或裝潢工程嗎？",
    answer:
      "本站主要提供住宅室內設計資訊、需求整理及合作服務轉介。實際丈量、設計、報價、簽約、施工與保固內容，應由屋主與實際承接服務的專業單位確認。",
  },
  {
    question: "室內設計提案可以直接拿來施工嗎？",
    answer:
      "不建議直接施工。概念圖片與文字提案不等同正式施工圖，實際工程仍需依現場尺寸、結構、管線及相關法規，由專業人員進行確認與繪製。",
  },
] as const

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
    images: [
      {
        url: "/images/og-home.jpg",
        width: 1200,
        height: 630,
        alt: "台灣室內設計資訊網建案室內設計與居家裝潢提案",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    images: ["/images/og-home.jpg"],
  },

  robots: {
    index: true,
    follow: true,
  },
}

export default function Home() {
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${SITE_URL}/#webpage`,
        url: `${SITE_URL}/`,
        name: PAGE_TITLE,
        description: PAGE_DESCRIPTION,
        inLanguage: "zh-Hant-TW",
        isPartOf: {
          "@id": `${SITE_URL}/#website`,
        },
        about: [
          {
            "@type": "Thing",
            name: "室內設計",
          },
          {
            "@type": "Thing",
            name: "建案室內設計",
          },
          {
            "@type": "Thing",
            name: "居家裝潢",
          },
          {
            "@type": "Thing",
            name: "住宅空間規劃",
          },
        ],
        publisher: {
          "@id": `${SITE_URL}/#organization`,
        },
        mainEntity: {
          "@id": `${SITE_URL}/#featured-projects`,
        },
      },
      {
        "@type": "ItemList",
        "@id": `${SITE_URL}/#featured-projects`,
        name: "精選建案室內設計提案",
        numberOfItems: FEATURED_PROJECTS.length,
        itemListOrder: "https://schema.org/ItemListOrderAscending",
        itemListElement: FEATURED_PROJECTS.map((project, index) => ({
          "@type": "ListItem",
          position: index + 1,
          url: `${SITE_URL}${project.href}`,
          name: `${project.name}室內設計提案`,
          description: project.description,
        })),
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
  }

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-accent/20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
        }}
      />

      {/* 首頁主視覺 */}
      <div className="pb-8 pt-8 md:pb-12 md:pt-14">
        <HeroSection />
      </div>

      {/* 精選建案室內設計 */}
      <section
        aria-labelledby="featured-projects-heading"
        className="relative overflow-hidden px-6 py-16 md:py-24"
      >
        <div className="pointer-events-none absolute left-0 top-20 h-[280px] w-[280px] rounded-full bg-primary/10 blur-[110px]" />

        <div className="pointer-events-none absolute bottom-0 right-0 h-[320px] w-[320px] rounded-full bg-accent/10 blur-[120px]" />

        <div className="relative mx-auto max-w-7xl">
          <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold tracking-[0.2em] text-accent">
                FEATURED PROJECT PROPOSALS
              </p>

              <h2
                id="featured-projects-heading"
                className="mt-3 text-3xl font-black tracking-tight text-foreground md:text-5xl"
              >
                精選建案
                <span className="block text-primary">
                  室內設計作品與空間提案
                </span>
              </h2>

              <p className="mt-5 text-base leading-8 text-muted-foreground">
                從住宅建案名稱出發，依照房屋格局、坪數、設計風格與生活需求，
                呈現不同類型的室內設計與居家裝潢方向。
              </p>
            </div>

            <Link
              href="/projects"
              className="inline-flex shrink-0 items-center justify-center rounded-full border border-border bg-white/80 px-6 py-3 text-sm font-semibold text-foreground shadow-sm transition-all hover:-translate-y-0.5 hover:border-accent hover:text-accent hover:shadow-md"
            >
              查看全部建案設計
              <span className="ml-2" aria-hidden="true">
                →
              </span>
            </Link>
          </div>

          <div className="grid gap-7 md:grid-cols-2 lg:grid-cols-3">
            {FEATURED_PROJECTS.map((project, index) => (
              <article
                key={project.name}
                className={`group overflow-hidden rounded-[2rem] border border-border/70 bg-card shadow-[0_12px_45px_rgba(40,127,140,0.08)] transition-all duration-500 hover:-translate-y-1.5 hover:border-accent/50 hover:shadow-[0_22px_65px_rgba(40,127,140,0.16)] ${
                  index === 0 ? "md:col-span-2 lg:col-span-2" : ""
                }`}
              >
                <Link
                  href={project.href}
                  aria-label={`查看${project.name}室內設計提案`}
                  className="block"
                >
                  <div
                    className={`relative overflow-hidden bg-muted ${
                      index === 0
                        ? "aspect-[16/9] lg:aspect-[2/1]"
                        : "aspect-[4/3]"
                    }`}
                  >
                    <Image
                      src={project.image}
                      alt={`${project.name}${project.style}室內設計提案`}
                      fill
                      sizes={
                        index === 0
                          ? "(max-width: 768px) 100vw, (max-width: 1280px) 66vw, 850px"
                          : "(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 420px"
                      }
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                      priority={index === 0}
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

                    <div className="absolute left-5 top-5 flex flex-wrap gap-2">
                      <span className="rounded-full border border-white/30 bg-black/30 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur">
                        設計提案
                      </span>

                      <span className="rounded-full border border-white/30 bg-black/30 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur">
                        {project.style}
                      </span>
                    </div>

                    <div className="absolute inset-x-0 bottom-0 p-6 text-white md:p-7">
                      <p className="text-xs font-semibold tracking-wide text-white/75">
                        {project.location}・{project.layout}
                      </p>

                      <h3
                        className={`mt-2 font-black ${
                          index === 0
                            ? "text-3xl md:text-4xl"
                            : "text-2xl"
                        }`}
                      >
                        {project.name}室內設計
                      </h3>

                      <p className="mt-3 line-clamp-2 max-w-2xl text-sm leading-7 text-white/80">
                        {project.description}
                      </p>
                    </div>
                  </div>
                </Link>
              </article>
            ))}
          </div>

          <p className="mt-6 text-center text-xs leading-6 text-muted-foreground">
            本區內容為住宅設計概念與空間提案，不一定代表該建案之實際完工作品。
          </p>
        </div>
      </section>

      {/* 快速瀏覽分類 */}
      <section
        aria-labelledby="browse-design-heading"
        className="border-y border-border/70 bg-secondary/60 px-6 py-20"
      >
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-semibold tracking-[0.2em] text-accent">
              EXPLORE DESIGN
            </p>

            <h2
              id="browse-design-heading"
              className="mt-3 text-3xl font-black tracking-tight text-foreground md:text-4xl"
            >
              用適合你的方式尋找室內設計
            </h2>

            <p className="mt-5 text-base leading-8 text-muted-foreground">
              不論你已經知道建案名稱、喜歡的設計風格，
              或只知道房屋坪數及空間需求，都能快速找到相近的規劃方向。
            </p>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-2">
            {BROWSE_CATEGORIES.map((category) => (
              <Link
                key={category.href}
                href={category.href}
                className="group relative overflow-hidden rounded-[2rem] border border-border/70 bg-card p-7 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-accent/50 hover:shadow-[0_18px_50px_rgba(40,127,140,0.12)]"
              >
                <span className="absolute right-5 top-4 text-6xl font-black text-primary/[0.06]">
                  {category.number}
                </span>

                <div className="relative">
                  <h3 className="text-xl font-black text-foreground transition-colors group-hover:text-accent">
                    {category.title}
                  </h3>

                  <p className="mt-3 max-w-xl text-sm leading-7 text-muted-foreground">
                    {category.description}
                  </p>

                  <span className="mt-6 inline-flex items-center text-sm font-semibold text-primary">
                    {category.linkText}

                    <span
                      className="ml-2 transition-transform duration-300 group-hover:translate-x-1"
                      aria-hidden="true"
                    >
                      →
                    </span>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 網站服務與內容主題 */}
      <ServicesSection />

      {/* 最新文章 */}
      <LatestPostsSection />

      {/* 網站介紹與諮詢 */}
      <section
        aria-labelledby="site-introduction-heading"
        className="px-6 py-20 md:py-28"
      >
        <div className="mx-auto grid max-w-6xl gap-10 rounded-[2.5rem] border border-border/70 bg-card p-8 shadow-[0_16px_60px_rgba(40,127,140,0.09)] md:grid-cols-[1.2fr_0.8fr] md:p-12">
          <div>
            <p className="text-sm font-semibold tracking-[0.2em] text-accent">
              ABOUT THIS PLATFORM
            </p>

            <h2
              id="site-introduction-heading"
              className="mt-3 text-3xl font-black tracking-tight text-foreground md:text-4xl"
            >
              從建案名稱開始
              <span className="block text-primary">
                建立住宅室內設計資料庫
              </span>
            </h2>

            <div className="mt-6 space-y-4 text-base leading-8 text-muted-foreground">
              <p>
                台灣室內設計資訊網以住宅建案為核心，
                整理不同社區、坪數、格局、設計風格與居家空間的裝潢提案。
              </p>

              <p>
                你可以從自己購買或關注的建案開始，
                查看適合客廳、臥室、餐廳、廚房及全室空間的設計方向，
                再依生活習慣及預算進一步調整。
              </p>

              <p>
                網站所呈現的部分圖片屬於空間概念與設計模擬，
                主要用於協助屋主確認風格與需求，不應直接視為正式施工圖。
              </p>
            </div>
          </div>

          <div className="flex flex-col justify-center rounded-[2rem] bg-secondary p-7 md:p-8">
            <p className="text-sm font-semibold text-accent">
              開始規劃你的住宅空間
            </p>

            <h3 className="mt-3 text-2xl font-black leading-tight text-foreground">
              提供建案名稱與格局，
              <span className="block">
                先找出適合的設計方向
              </span>
            </h3>

            <p className="mt-4 text-sm leading-7 text-muted-foreground">
              諮詢時可準備建案名稱、坪數、格局圖、家庭成員、
              喜歡的設計圖片及預算範圍。
            </p>

            <LineConsultButton className="mt-7 inline-flex w-fit rounded-full bg-[#06C755] px-7 py-3.5 text-sm font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:opacity-90 hover:shadow-md">
              LINE 詢問室內設計
            </LineConsultButton>
          </div>
        </div>
      </section>

      {/* 常見問題 */}
      <section
        aria-labelledby="home-faq-heading"
        className="px-6 pb-24"
      >
        <div className="mx-auto max-w-4xl">
          <div className="text-center">
            <p className="text-sm font-semibold tracking-[0.2em] text-accent">
              FREQUENTLY ASKED QUESTIONS
            </p>

            <h2
              id="home-faq-heading"
              className="mt-3 text-3xl font-black tracking-tight text-foreground md:text-4xl"
            >
              室內設計提案常見問題
            </h2>
          </div>

          <div className="mt-10 divide-y divide-border/70 border-y border-border/70">
            {FAQ_ITEMS.map((item) => (
              <details key={item.question} className="group py-6">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-5 text-base font-bold text-foreground md:text-lg">
                  <span>{item.question}</span>

                  <span
                    aria-hidden="true"
                    className="text-2xl font-normal text-muted-foreground transition-all duration-300 group-open:rotate-45 group-open:text-accent"
                  >
                    +
                  </span>
                </summary>

                <p className="max-w-3xl pt-4 text-sm leading-7 text-muted-foreground md:text-base md:leading-8">
                  {item.answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
```
