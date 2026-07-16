import type { Metadata } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"

import { PostThumbnail } from "@/components/post-thumbnail"
import { client } from "@/lib/sanity"

export const revalidate = 300

const SITE_URL = "https://home-design.line88.tw"
const SITE_NAME = "台灣室內設計資訊網"
const ORGANIZATION_ID = `${SITE_URL}/#organization`
const WEBSITE_ID = `${SITE_URL}/#website`
const POSTS_PER_PAGE = 9
const TOP_TAG_LIMIT = 12
const DEFAULT_OG_IMAGE = `${SITE_URL}/images/og-home.jpg`

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

  return query ? `/blog?${query}` : "/blog"
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
      ? "&& $selectedTag in tags"
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
        tags
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
          tags,
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

      <div className="px-6 pb-24 pt-12 md:pt-20">
        <div className="mx-auto max-w-7xl">
          {/* 頁首 */}
          <header className="relative overflow-hidden rounded-[2.5rem] border border-border/70 bg-white px-7 py-10 shadow-[0_16px_60px_rgba(53,51,46,0.08)] md:px-12 md:py-14">
            <div className="pointer-events-none absolute right-0 top-0 h-64 w-64 rounded-full bg-accent/10 blur-[90px]" />

            <div className="pointer-events-none absolute bottom-0 left-0 h-48 w-48 rounded-full bg-primary/10 blur-[80px]" />

            <div className="relative max-w-3xl">
              <nav
                aria-label="麵包屑"
                className="mb-5 text-sm text-muted-foreground"
              >
                <ol className="flex flex-wrap items-center gap-2">
                  <li>
                    <Link
                      href="/"
                      className="transition-colors hover:text-accent"
                    >
                      首頁
                    </Link>
                  </li>

                  <li aria-hidden="true">
                    /
                  </li>

                  <li>
                    {selectedTag === "全部" ? (
                      <span aria-current="page">
                        室內設計文章
                      </span>
                    ) : (
                      <Link
                        href="/blog"
                        className="transition-colors hover:text-accent"
                      >
                        室內設計文章
                      </Link>
                    )}
                  </li>

                  {selectedTag !== "全部" && (
                    <>
                      <li aria-hidden="true">
                        /
                      </li>

                      <li aria-current="page">
                        {selectedTag}
                      </li>
                    </>
                  )}
                </ol>
              </nav>

              <p className="text-sm font-semibold tracking-[0.2em] text-accent">
                INTERIOR DESIGN JOURNAL
              </p>

              <h1 className="mt-3 text-3xl font-black tracking-tight text-foreground md:text-5xl">
                {pageTitle}
              </h1>

              <p className="mt-5 max-w-2xl text-base leading-8 text-muted-foreground">
                {pageDescription}
              </p>

              <p className="mt-4 text-sm font-medium text-muted-foreground">
                共 {totalPosts} 篇文章
                {page > 1
                  ? `，目前第 ${page} 頁`
                  : ""}
              </p>
            </div>
          </header>

          {/* 標籤分類 */}
          <nav
            aria-label="文章主題"
            className="mt-10 rounded-[2rem] border border-border/70 bg-white/70 p-5 shadow-sm"
          >
            <div className="flex flex-wrap gap-2.5">
              {visibleTags.map((tagItem) => {
                const isActive =
                  selectedTag === tagItem.name

                return (
                  <Link
                    key={tagItem.name}
                    href={buildBlogPath(tagItem.name)}
                    aria-current={
                      isActive ? "page" : undefined
                    }
                    className={`inline-flex items-center rounded-full border px-4 py-2 text-sm font-semibold transition-all ${
                      isActive
                        ? "border-accent bg-accent text-accent-foreground shadow-sm"
                        : "border-border bg-white text-muted-foreground hover:border-accent/40 hover:text-accent"
                    }`}
                  >
                    {tagItem.name}

                    <span
                      className={`ml-2 text-xs ${
                        isActive
                          ? "text-white/75"
                          : "text-muted-foreground/60"
                      }`}
                    >
                      {tagItem.count}
                    </span>
                  </Link>
                )
              })}
            </div>
          </nav>

          {/* 文章列表 */}
          {posts.length > 0 ? (
            <section
              aria-label={pageTitle}
              className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3"
            >
              {posts.map((post) => {
                const publishedDate =
                  formatPublishedDate(post.publishedAt)

                return (
                  <article
                    key={post.id}
                    className="group flex min-w-0 flex-col overflow-hidden rounded-[2rem] border border-border/70 bg-white shadow-[0_10px_40px_rgba(53,51,46,0.07)] transition-all duration-500 hover:-translate-y-1.5 hover:border-accent/40 hover:shadow-[0_20px_60px_rgba(53,51,46,0.14)]"
                  >
                    <PostThumbnail
                      slug={post.slug}
                      title={post.title}
                      thumbnail={post.thumbnail}
                      videoId={post.videoId}
                    />

                    <div className="flex flex-1 flex-col p-6">
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-muted-foreground">
                        {publishedDate && (
                          <time dateTime={post.publishedAt}>
                            {publishedDate}
                          </time>
                        )}

                        {post.tags
                          .slice(0, 2)
                          .map((tag) => (
                            <Link
                              key={tag}
                              href={buildBlogPath(tag)}
                              className="rounded-full bg-secondary px-2.5 py-1 font-medium text-primary transition-colors hover:bg-accent hover:text-accent-foreground"
                            >
                              {tag}
                            </Link>
                          ))}
                      </div>

                      <h2 className="mt-4 line-clamp-2 text-xl font-black leading-snug text-foreground">
                        <Link
                          href={`/blog/${post.slug}`}
                          className="transition-colors group-hover:text-accent"
                        >
                          {post.title}
                        </Link>
                      </h2>

                      <p className="mt-4 line-clamp-3 text-sm leading-7 text-muted-foreground">
                        {post.description}
                      </p>

                      <div className="mt-auto pt-6">
                        <Link
                          href={`/blog/${post.slug}`}
                          aria-label={`閱讀完整文章：${post.title}`}
                          className="inline-flex items-center text-sm font-semibold text-primary transition-colors hover:text-accent"
                        >
                          閱讀完整文章

                          <span
                            aria-hidden="true"
                            className="ml-2 transition-transform duration-300 group-hover:translate-x-1"
                          >
                            →
                          </span>
                        </Link>
                      </div>
                    </div>
                  </article>
                )
              })}
            </section>
          ) : (
            <section className="mt-12 rounded-[2rem] border border-dashed border-border bg-white/60 px-6 py-20 text-center shadow-sm">
              <h2 className="text-xl font-black text-foreground">
                目前沒有相關文章
              </h2>

              <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-muted-foreground">
                目前尚未發布這個主題的內容，可以返回全部文章，
                瀏覽建案室內設計、空間規劃、設計風格與居家裝潢資訊。
              </p>

              {selectedTag !== "全部" && (
                <Link
                  href="/blog"
                  className="mt-6 inline-flex rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
                >
                  查看全部文章
                </Link>
              )}
            </section>
          )}

          {/* 分頁 */}
          {totalPages > 1 && (
            <nav
              aria-label="文章分頁"
              className="mt-16 flex flex-wrap items-center justify-center gap-2"
            >
              {page > 1 && (
                <Link
                  href={buildBlogPath(
                    selectedTag,
                    page - 1
                  )}
                  rel="prev"
                  className="rounded-full border border-border bg-white px-5 py-2.5 text-sm font-semibold transition-colors hover:border-accent hover:text-accent"
                >
                  上一頁
                </Link>
              )}

              {pageNumbers.map(
                (pageNumber, index) => {
                  const previousPageNumber =
                    pageNumbers[index - 1]

                  const hasGap =
                    previousPageNumber !== undefined &&
                    pageNumber -
                      previousPageNumber >
                      1

                  return (
                    <div
                      key={pageNumber}
                      className="contents"
                    >
                      {hasGap && (
                        <span
                          aria-hidden="true"
                          className="px-1 text-muted-foreground"
                        >
                          …
                        </span>
                      )}

                      <Link
                        href={buildBlogPath(
                          selectedTag,
                          pageNumber
                        )}
                        aria-current={
                          page === pageNumber
                            ? "page"
                            : undefined
                        }
                        aria-label={`第 ${pageNumber} 頁`}
                        className={`flex h-10 min-w-10 items-center justify-center rounded-full px-3 text-sm font-semibold transition-colors ${
                          page === pageNumber
                            ? "bg-primary text-primary-foreground"
                            : "border border-border bg-white hover:border-accent hover:text-accent"
                        }`}
                      >
                        {pageNumber}
                      </Link>
                    </div>
                  )
                }
              )}

              {page < totalPages && (
                <Link
                  href={buildBlogPath(
                    selectedTag,
                    page + 1
                  )}
                  rel="next"
                  className="rounded-full border border-border bg-white px-5 py-2.5 text-sm font-semibold transition-colors hover:border-accent hover:text-accent"
                >
                  下一頁
                </Link>
              )}
            </nav>
          )}

          {/* 說明 */}
          <aside className="mt-16 rounded-[2rem] bg-secondary/60 px-6 py-7 text-sm leading-7 text-muted-foreground">
            本站內容包含住宅室內設計資訊、建案空間提案、
            裝潢風格整理與居家規劃靈感。部分設計圖片可能為概念模擬，
            不一定代表實際完工案例；實際尺寸、材質、預算及施工內容，
            應由屋主與專業設計或室內裝修服務單位進一步確認。
          </aside>
        </div>
      </div>
    </div>
  )
}