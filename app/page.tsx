import type { Metadata } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"

import { PostThumbnail } from "@/components/post-thumbnail"
import { client } from "@/lib/sanity"

export const revalidate = 60

const SITE_URL = "https://home-design.line88.tw"
const SITE_NAME = "台灣室內設計資訊網"
const ORGANIZATION_ID = `${SITE_URL}/#organization`
const WEBSITE_ID = `${SITE_URL}/#website`
const POSTS_PER_PAGE = 18
const TOP_TAG_LIMIT = 8
const DEFAULT_OG_IMAGE = `${SITE_URL}/images/og-home.jpg`
const LINE_URL = process.env.NEXT_PUBLIC_LINE_URL || "/contact"

interface SearchParams {
  tag?: string
  page?: string
}

interface RawPost {
  id: string
  title: string
  slug: string
  description?: string
  imageUrl?: string
  mainImage?: string
  htmlContent?: string
  videoId?: string
  tags?: string[]
  publishedAt: string
}

interface Post extends RawPost {
  description: string
  thumbnail: string
  tags: string[]
}

interface TagItem {
  name: string
  count: number
}

function normalizeTag(tag?: string) {
  return String(tag || "").trim() || "全部"
}

function normalizePage(page?: string) {
  return Math.max(1, Number.parseInt(page || "1", 10) || 1)
}

function optimizeSanityImageUrl(url?: string) {
  if (!url) return ""

  if (!url.includes("cdn.sanity.io/images")) {
    return url
  }

  let optimizedUrl = url

  if (!optimizedUrl.includes("auto=format")) {
    optimizedUrl += `${optimizedUrl.includes("?") ? "&" : "?"}auto=format`
  }

  if (!optimizedUrl.includes("w=")) {
    optimizedUrl += `${optimizedUrl.includes("?") ? "&" : "?"}w=900`
  }

  if (!optimizedUrl.includes("q=")) {
    optimizedUrl += `${optimizedUrl.includes("?") ? "&" : "?"}q=82`
  }

  return optimizedUrl
}

function extractPlainText(html: string) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, "\"")
    .replace(/&#39;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/\s+/g, " ")
    .trim()
}

function processPost(post: RawPost): Post {
  const htmlContent = post.htmlContent || ""

  const firstImageMatch = htmlContent.match(
    /<img[^>]+src=["']([^"']+)["']/i
  )

  const firstContentImage = optimizeSanityImageUrl(firstImageMatch?.[1])
  const plainText = extractPlainText(htmlContent)
  const currentDescription = String(post.description || "").trim()

  const description =
    currentDescription && currentDescription !== "點擊閱讀詳情..."
      ? currentDescription
      : plainText
        ? `${plainText.slice(0, 120)}${plainText.length > 120 ? "…" : ""}`
        : "閱讀建案室內設計、住宅裝潢、格局規劃與空間風格相關內容。"

  const youtubeThumbnail = post.videoId
    ? `https://img.youtube.com/vi/${post.videoId}/maxresdefault.jpg`
    : ""

  return {
    ...post,
    description,
    thumbnail:
      firstContentImage ||
      optimizeSanityImageUrl(post.imageUrl) ||
      optimizeSanityImageUrl(post.mainImage) ||
      youtubeThumbnail ||
      "",
    tags: Array.isArray(post.tags)
      ? post.tags
          .map((tag) => String(tag).trim())
          .filter(Boolean)
      : [],
  }
}

function buildBlogPath(tag: string, page = 1) {
  const params = new URLSearchParams()

  if (tag !== "全部") {
    params.set("tag", tag)
  }

  if (page > 1) {
    params.set("page", String(page))
  }

  const query = params.toString()

  return query ? `/?${query}` : "/"
}

function buildBlogUrl(tag: string, page = 1) {
  return `${SITE_URL}${buildBlogPath(tag, page)}`
}

function formatPublishedDate(date: string) {
  const parsedDate = new Date(date)

  if (Number.isNaN(parsedDate.getTime())) {
    return ""
  }

  return new Intl.DateTimeFormat("zh-TW", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: "Asia/Taipei",
  }).format(parsedDate)
}

function getVisiblePageNumbers(
  currentPage: number,
  totalPages: number
) {
  const pages = new Set<number>([
    1,
    totalPages,
    currentPage - 1,
    currentPage,
    currentPage + 1,
  ])

  return Array.from(pages)
    .filter((page) => page >= 1 && page <= totalPages)
    .sort((a, b) => a - b)
}

function serializeJsonLd(data: unknown) {
  return JSON.stringify(data).replace(/</g, "\\u003c")
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}): Promise<Metadata> {
  const params = await searchParams
  const selectedTag = normalizeTag(params.tag)
  const page = normalizePage(params.page)

  const baseTitle =
    selectedTag === "全部"
      ? "室內設計與居家裝潢文章"
      : `${selectedTag}室內設計相關文章`

  const title =
    page > 1
      ? `${baseTitle}｜第 ${page} 頁`
      : baseTitle

  const description =
    selectedTag === "全部"
      ? "整理住宅建案、室內設計風格、居家裝潢、格局坪數、空間規劃、收納設計與裝潢預算相關文章。"
      : `瀏覽「${selectedTag}」相關室內設計文章，包含住宅建案、空間規劃、格局坪數、裝潢風格與居家設計提案。`

  const canonicalUrl = buildBlogUrl(selectedTag, page)

  return {
    title,
    description,

    alternates: {
      canonical: canonicalUrl,
    },

    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: SITE_NAME,
      locale: "zh_TW",
      type: "website",
      images: [
        {
          url: DEFAULT_OG_IMAGE,
          width: 1200,
          height: 630,
          alt: `${SITE_NAME}室內設計與居家裝潢文章`,
        },
      ],
    },

    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [DEFAULT_OG_IMAGE],
    },

    robots: {
      index: true,
      follow: true,
    },
  }
}

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams
  const selectedTag = normalizeTag(params.tag)
  const page = normalizePage(params.page)

  const tagFilter =
    selectedTag !== "全部"
      ? "&& $selectedTag in coalesce(tags, categories[]->title, [])"
      : ""

  const start = (page - 1) * POSTS_PER_PAGE
  const end = start + POSTS_PER_PAGE

  const [allTagsRaw, totalPosts, rawPosts] = await Promise.all([
    client.fetch<Array<{ tags?: string[] }>>(
      `*[
        _type == "post" &&
        defined(slug.current) &&
        defined(title)
      ] {
        "tags": coalesce(tags, categories[]->title, [])
      }`,
      {},
      {
        next: {
          revalidate,
        },
      }
    ),

    client.fetch<number>(
      `count(*[
        _type == "post" &&
        defined(slug.current) &&
        defined(title)
        ${tagFilter}
      ])`,
      {
        selectedTag,
      },
      {
        next: {
          revalidate,
        },
      }
    ),

    client.fetch<RawPost[]>(
      `*[
        _type == "post" &&
        defined(slug.current) &&
        defined(title)
        ${tagFilter}
      ]
        | order(coalesce(publishedAt, _createdAt) desc)
        [$start...$end] {
          "id": _id,
          title,
          "slug": slug.current,
          description,
          imageUrl,
          "mainImage": mainImage.asset->url,
          htmlContent,
          "videoId": youtubeVideoId,
          "tags": coalesce(tags, categories[]->title, []),
          "publishedAt": coalesce(publishedAt, _createdAt)
        }`,
      {
        start,
        end,
        selectedTag,
      },
      {
        next: {
          revalidate,
        },
      }
    ),
  ])

  const totalPages = Math.max(
    1,
    Math.ceil(totalPosts / POSTS_PER_PAGE)
  )

  if (totalPosts > 0 && page > totalPages) {
    redirect(buildBlogPath(selectedTag, totalPages))
  }

  const tagCountMap = new Map<string, number>()

  allTagsRaw.forEach((post) => {
    if (!Array.isArray(post.tags)) return

    post.tags.forEach((tag) => {
      const cleanTag = String(tag || "").trim()

      if (!cleanTag) return

      tagCountMap.set(
        cleanTag,
        (tagCountMap.get(cleanTag) || 0) + 1
      )
    })
  })

  const sortedTags: TagItem[] = Array.from(
    tagCountMap.entries()
  )
    .map(([name, count]) => ({
      name,
      count,
    }))
    .sort(
      (a, b) =>
        b.count - a.count ||
        a.name.localeCompare(b.name, "zh-Hant")
    )

  const topTags = sortedTags.slice(0, TOP_TAG_LIMIT)

  const selectedTagItem =
    selectedTag !== "全部" &&
    !topTags.some((tag) => tag.name === selectedTag)
      ? sortedTags.find((tag) => tag.name === selectedTag)
      : undefined

  const visibleTags: TagItem[] = [
    {
      name: "全部",
      count: allTagsRaw.length,
    },
    ...topTags,
    ...(selectedTagItem ? [selectedTagItem] : []),
  ]

  const posts = rawPosts.map(processPost)
  const pageNumbers = getVisiblePageNumbers(page, totalPages)
  const canonicalUrl = buildBlogUrl(selectedTag, page)

  const pageTitle =
    selectedTag === "全部"
      ? "室內設計與裝潢文章"
      : `${selectedTag}相關文章`

  const pageDescription =
    selectedTag === "全部"
      ? "探索住宅建案、設計風格、格局坪數、居家空間、收納規劃與室內裝潢相關內容。"
      : `瀏覽「${selectedTag}」相關的室內設計、住宅裝潢與空間規劃文章。`

  const breadcrumbItems = [
    {
      "@type": "ListItem",
      position: 1,
      name: "首頁",
      item: SITE_URL,
    },
    {
      "@type": "ListItem",
      position: 2,
      name: "室內設計文章",
      item: `${SITE_URL}/blog`,
    },
    ...(selectedTag !== "全部"
      ? [
          {
            "@type": "ListItem",
            position: 3,
            name: selectedTag,
            item: buildBlogUrl(selectedTag),
          },
        ]
      : []),
  ]

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        "@id": `${canonicalUrl}#breadcrumb`,
        itemListElement: breadcrumbItems,
      },
      {
        "@type": "CollectionPage",
        "@id": `${canonicalUrl}#webpage`,
        url: canonicalUrl,
        name: pageTitle,
        description: pageDescription,
        inLanguage: "zh-Hant-TW",
        isPartOf: {
          "@id": WEBSITE_ID,
        },
        about:
          selectedTag === "全部"
            ? [
                {
                  "@type": "Thing",
                  name: "室內設計",
                },
                {
                  "@type": "Thing",
                  name: "住宅裝潢",
                },
                {
                  "@type": "Thing",
                  name: "建案室內設計",
                },
                {
                  "@type": "Thing",
                  name: "空間規劃",
                },
              ]
            : {
                "@type": "Thing",
                name: selectedTag,
              },
        publisher: {
          "@id": ORGANIZATION_ID,
        },
        breadcrumb: {
          "@id": `${canonicalUrl}#breadcrumb`,
        },
        mainEntity: {
          "@id": `${canonicalUrl}#itemlist`,
        },
      },
      {
        "@type": "ItemList",
        "@id": `${canonicalUrl}#itemlist`,
        name: pageTitle,
        numberOfItems: posts.length,
        itemListOrder:
          "https://schema.org/ItemListOrderDescending",
        itemListElement: posts.map((post, index) => ({
          "@type": "ListItem",
          position: start + index + 1,
          item: {
            "@type": "BlogPosting",
            "@id": `${SITE_URL}/blog/${post.slug}#article`,
            url: `${SITE_URL}/blog/${post.slug}`,
            headline: post.title,
            description: post.description,
            datePublished: post.publishedAt,
            inLanguage: "zh-Hant-TW",
            ...(post.thumbnail
              ? {
                  image: post.thumbnail,
                }
              : {}),
            author: {
              "@id": ORGANIZATION_ID,
            },
            publisher: {
              "@id": ORGANIZATION_ID,
            },
          },
        })),
      },
    ],
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd(jsonLd),
        }}
      />

      <main className="px-4 pb-16 pt-6 sm:px-6 md:pt-10">
        <div className="mx-auto max-w-7xl">
          {/* 精簡頁首：保留搜尋引擎需要的主題文字與主要轉換按鈕 */}
          <header className="rounded-3xl border border-border/70 bg-white px-5 py-7 shadow-sm sm:px-8 sm:py-9">
            <nav
              aria-label="麵包屑"
              className="mb-3 text-xs text-muted-foreground"
            >
              <ol className="flex flex-wrap items-center gap-2">
                <li>
                  <Link href="/" className="hover:text-accent">
                    首頁
                  </Link>
                </li>
                <li aria-hidden="true">/</li>
                <li aria-current="page">
                  {selectedTag === "全部"
                    ? "室內設計作品"
                    : selectedTag}
                </li>
              </ol>
            </nav>

            <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
              <div className="max-w-3xl">
                <h1 className="text-3xl font-black tracking-tight md:text-5xl">
                  {selectedTag === "全部"
                    ? "全台建案室內設計提案"
                    : `${selectedTag}室內設計提案`}
                </h1>

                <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
                  快速瀏覽住宅建案、格局規劃與裝潢風格靈感。
                  部分內容為概念模擬，實際設計與施工請以現場條件為準。
                </p>
              </div>

              <a
                href={LINE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-12 shrink-0 items-center justify-center rounded-full bg-[#06C755] px-7 py-3 text-base font-black text-white shadow-sm transition hover:opacity-90"
              >
                LINE 免費諮詢
              </a>
            </div>
          </header>

          {/* 精簡分類：只顯示熱門標籤 */}
          <nav
            aria-label="作品分類"
            className="mt-5 overflow-x-auto pb-1"
          >
            <div className="flex min-w-max gap-2">
              {visibleTags.map((tagItem) => {
                const isActive = selectedTag === tagItem.name

                return (
                  <Link
                    key={tagItem.name}
                    href={buildBlogPath(tagItem.name)}
                    aria-current={isActive ? "page" : undefined}
                    className={`rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
                      isActive
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-white text-muted-foreground hover:border-accent hover:text-accent"
                    }`}
                  >
                    {tagItem.name}
                    <span className="ml-1.5 opacity-60">
                      {tagItem.count}
                    </span>
                  </Link>
                )
              })}
            </div>
          </nav>

          {/* 作品優先：手機兩欄、桌面四欄，快速看到大量內容 */}
          {posts.length > 0 ? (
            <section
              aria-label={pageTitle}
              className="mt-6 grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4"
            >
              {posts.map((post) => (
                <article
                  key={post.id}
                  className="group min-w-0 overflow-hidden rounded-2xl border border-border/70 bg-white shadow-sm transition hover:-translate-y-1 hover:border-accent/40 hover:shadow-lg"
                >
                  <PostThumbnail
                    slug={post.slug}
                    title={post.title}
                    thumbnail={post.thumbnail}
                    videoId={post.videoId}
                  />

                  <div className="p-3 sm:p-4">
                    <h2 className="line-clamp-2 text-sm font-black leading-6 sm:text-base">
                      <Link
                        href={`/blog/${post.slug}`}
                        className="transition-colors group-hover:text-accent"
                      >
                        {post.title}
                      </Link>
                    </h2>

                    {post.tags.length > 0 && (
                      <div className="mt-2 flex min-w-0 gap-1.5 overflow-hidden">
                        {post.tags.map((tag) => (
                          <Link
                            key={tag}
                            href={buildBlogPath(tag)}
                            className="max-w-full truncate rounded-full bg-secondary px-2 py-1 text-[11px] font-medium text-primary"
                          >
                            {tag}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                </article>
              ))}
            </section>
          ) : (
            <section className="mt-8 rounded-3xl border border-dashed border-border bg-white px-6 py-16 text-center">
              <h2 className="text-xl font-black">目前沒有相關作品</h2>
              <p className="mt-3 text-sm text-muted-foreground">
                請返回全部作品瀏覽其他建案與設計風格。
              </p>
              <Link
                href="/blog"
                className="mt-6 inline-flex rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground"
              >
                查看全部作品
              </Link>
            </section>
          )}

          {/* LINE 轉換區：只保留一個明確行動 */}
          <section className="mt-8 rounded-3xl bg-primary px-6 py-8 text-center text-primary-foreground sm:px-10">
            <h2 className="text-2xl font-black">
              找到喜歡的建案風格了嗎？
            </h2>
            <p className="mx-auto mt-2 max-w-xl text-sm leading-7 opacity-80">
              將建案名稱、格局或喜歡的作品傳給我們，直接用 LINE 討論設計方向。
            </p>
            <a
              href={LINE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex min-h-12 items-center justify-center rounded-full bg-[#06C755] px-8 py-3 font-black text-white transition hover:opacity-90"
            >
              加入 LINE 聯絡
            </a>
          </section>

          {/* 分頁 */}
          {totalPages > 1 && (
            <nav
              aria-label="作品分頁"
              className="mt-10 flex flex-wrap items-center justify-center gap-2"
            >
              {page > 1 && (
                <Link
                  href={buildBlogPath(selectedTag, page - 1)}
                  rel="prev"
                  className="rounded-full border border-border bg-white px-5 py-2.5 text-sm font-semibold hover:border-accent hover:text-accent"
                >
                  上一頁
                </Link>
              )}

              {pageNumbers.map((pageNumber, index) => {
                const previousPageNumber = pageNumbers[index - 1]
                const hasGap =
                  previousPageNumber !== undefined &&
                  pageNumber - previousPageNumber > 1

                return (
                  <div key={pageNumber} className="contents">
                    {hasGap && (
                      <span aria-hidden="true" className="px-1 text-muted-foreground">
                        …
                      </span>
                    )}

                    <Link
                      href={buildBlogPath(selectedTag, pageNumber)}
                      aria-current={page === pageNumber ? "page" : undefined}
                      aria-label={`第 ${pageNumber} 頁`}
                      className={`flex h-10 min-w-10 items-center justify-center rounded-full px-3 text-sm font-semibold ${
                        page === pageNumber
                          ? "bg-primary text-primary-foreground"
                          : "border border-border bg-white hover:border-accent hover:text-accent"
                      }`}
                    >
                      {pageNumber}
                    </Link>
                  </div>
                )
              })}

              {page < totalPages && (
                <Link
                  href={buildBlogPath(selectedTag, page + 1)}
                  rel="next"
                  className="rounded-full border border-border bg-white px-5 py-2.5 text-sm font-semibold hover:border-accent hover:text-accent"
                >
                  下一頁
                </Link>
              )}
            </nav>
          )}

          {/* 法律與案例性質說明：精簡但保留必要揭露 */}
          <aside className="mt-10 border-t border-border pt-5 text-xs leading-6 text-muted-foreground">
            本站提供室內設計資訊與概念提案。部分圖片可能為 AI
            生成或情境模擬，不代表實際完工作品；建案名稱僅用於辨識與資訊整理，
            本站與建商、設計師或商標權利人無隸屬或代理關係。實際尺寸、材質、預算與施工內容，
            應由屋主及合法專業人員依現場條件確認。
          </aside>
        </div>
      </main>
    </div>
  )
}
