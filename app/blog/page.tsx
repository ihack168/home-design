import type { Metadata } from "next"
import Link from "next/link"

import { PostThumbnail } from "@/components/post-thumbnail"
import { client } from "@/lib/sanity"

export const revalidate = 60

const SITE_URL = "https://home-design.line88.tw"
const SITE_NAME = "台灣室內設計資訊網"
const DEFAULT_OG_IMAGE = `${SITE_URL}/images/og-home.jpg`

interface RawPost {
  _id: string
  title: string
  slug: string
  description?: string
  htmlContent?: string
  mainImageUrl?: string
  youtubeVideoId?: string
  publishedAt?: string
  tags?: string[]
}

interface BlogPageProps {
  searchParams?: Promise<{
    tag?: string
  }>
}

interface TagCount {
  name: string
  count: number
}

export const metadata: Metadata = {
  title: "室內設計與居家裝潢文章",
  description:
    "整理住宅建案、室內設計風格、居家裝潢、格局坪數、空間規劃與收納設計相關文章。",
  alternates: {
    canonical: `${SITE_URL}/blog`,
  },
  openGraph: {
    title: "室內設計與居家裝潢文章",
    description:
      "整理住宅建案、室內設計風格、居家裝潢、格局坪數、空間規劃與收納設計相關文章。",
    url: `${SITE_URL}/blog`,
    siteName: SITE_NAME,
    locale: "zh_TW",
    type: "website",
    images: [
      {
        url: DEFAULT_OG_IMAGE,
        width: 1200,
        height: 630,
        alt: `${SITE_NAME}室內設計文章`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "室內設計與居家裝潢文章",
    description:
      "整理住宅建案、室內設計風格、居家裝潢與空間規劃相關文章。",
    images: [DEFAULT_OG_IMAGE],
  },
}

function extractFirstImage(html?: string) {
  if (!html) return ""

  const match = html.match(
    /<img\b[^>]*\bsrc\s*=\s*["']([^"']+)["'][^>]*>/i
  )

  return match?.[1] || ""
}

function stripHtml(html?: string) {
  if (!html) return ""

  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, " ")
    .trim()
}

function optimizeImage(url?: string) {
  if (!url) return ""

  if (!url.includes("cdn.sanity.io/images")) {
    return url
  }

  const separator = url.includes("?") ? "&" : "?"

  return `${url}${separator}w=900&auto=format&q=82`
}

function formatDate(date?: string) {
  if (!date) return ""

  const parsed = new Date(date)

  if (Number.isNaN(parsed.getTime())) {
    return ""
  }

  return parsed.toLocaleDateString("zh-TW", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: "Asia/Taipei",
  })
}

function normalizeTags(tags?: string[]) {
  if (!Array.isArray(tags)) {
    return []
  }

  return Array.from(
    new Set(
      tags
        .map((tag) => String(tag || "").trim())
        .filter(Boolean)
    )
  )
}

function getTagCounts(posts: RawPost[]) {
  const tagMap = new Map<string, number>()

  posts.forEach((post) => {
    const tags = normalizeTags(post.tags)

    tags.forEach((tag) => {
      tagMap.set(tag, (tagMap.get(tag) || 0) + 1)
    })
  })

  return Array.from(tagMap.entries())
    .map(([name, count]): TagCount => ({
      name,
      count,
    }))
    .sort((a, b) => {
      if (b.count !== a.count) {
        return b.count - a.count
      }

      return a.name.localeCompare(b.name, "zh-Hant")
    })
}

export default async function BlogPage({
  searchParams,
}: BlogPageProps) {
  const resolvedSearchParams = searchParams
    ? await searchParams
    : undefined

  const selectedTag =
    typeof resolvedSearchParams?.tag === "string"
      ? resolvedSearchParams.tag.trim()
      : ""

  const posts = await client.fetch<RawPost[]>(
    `*[
      _type == "post" &&
      defined(title) &&
      defined(slug.current)
    ]
      | order(coalesce(publishedAt, _createdAt) desc) {
        _id,
        title,
        "slug": slug.current,
        description,
        htmlContent,
        "mainImageUrl": mainImage.asset->url,
        youtubeVideoId,
        "publishedAt": coalesce(publishedAt, _createdAt),
        "tags": coalesce(tags, categories[]->title, [])
      }`,
    {},
    {
      next: {
        revalidate,
      },
    }
  )

  const normalizedPosts = posts.map((post) => ({
    ...post,
    tags: normalizeTags(post.tags),
  }))

  const tagCounts = getTagCounts(normalizedPosts)

  const filteredPosts = selectedTag
    ? normalizedPosts.filter((post) =>
        post.tags?.includes(selectedTag)
      )
    : normalizedPosts

  return (
    <main className="min-h-screen bg-background px-4 pb-24 pt-10 text-foreground sm:px-6 md:pt-16">
      <div className="mx-auto max-w-7xl">
        <header className="rounded-[2rem] border border-border/70 bg-white px-5 py-8 shadow-sm sm:px-8 sm:py-10">
          <nav
            aria-label="麵包屑導覽"
            className="mb-4 text-xs text-muted-foreground"
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

              <li aria-hidden="true">/</li>

              <li aria-current="page">
                室內設計文章
              </li>
            </ol>
          </nav>

          <p className="text-sm font-semibold tracking-[0.2em] text-accent">
            INTERIOR DESIGN JOURNAL
          </p>

          <h1 className="mt-3 text-3xl font-black tracking-tight md:text-5xl">
            室內設計與裝潢文章
          </h1>

          <p className="mt-4 max-w-3xl leading-8 text-muted-foreground">
            探索住宅建案、設計風格、格局坪數、居家空間、收納規劃與室內裝潢相關內容。
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-muted-foreground">
            <span>
              全站共 {normalizedPosts.length} 篇文章
            </span>

            {selectedTag && (
              <>
                <span
                  className="text-border"
                  aria-hidden="true"
                >
                  |
                </span>

                <span>
                  「{selectedTag}」共 {filteredPosts.length} 篇
                </span>
              </>
            )}
          </div>
        </header>

        {tagCounts.length > 0 && (
          <section
            aria-labelledby="blog-tag-filter-title"
            className="mt-6 rounded-[2rem] border border-border/70 bg-white px-5 py-6 shadow-sm sm:px-7"
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2
                  id="blog-tag-filter-title"
                  className="text-lg font-black"
                >
                  依主題瀏覽文章
                </h2>

                <p className="mt-1 text-sm text-muted-foreground">
                  選擇建案、地區或設計風格，快速找到相關內容。
                </p>
              </div>

              {selectedTag && (
                <Link
                  href="/blog"
                  className="inline-flex w-fit items-center rounded-full border border-border bg-background px-4 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:border-accent hover:text-accent"
                >
                  清除篩選
                </Link>
              )}
            </div>

            <nav
              aria-label="文章主題分類"
              className="mt-5 overflow-x-auto pb-2"
            >
              <div className="flex min-w-max flex-wrap gap-2">
                <Link
                  href="/blog"
                  aria-current={!selectedTag ? "page" : undefined}
                  className={
                    !selectedTag
                      ? "rounded-full border border-primary bg-primary px-4 py-2 text-sm font-bold text-primary-foreground transition-colors"
                      : "rounded-full border border-border bg-background px-4 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:border-accent hover:text-accent"
                  }
                >
                  全部文章
                  <span className="ml-1.5 opacity-70">
                    {normalizedPosts.length}
                  </span>
                </Link>

                {tagCounts.map((tag) => {
                  const isActive = selectedTag === tag.name

                  return (
                    <Link
                      key={tag.name}
                      href={`/blog?tag=${encodeURIComponent(tag.name)}`}
                      aria-current={isActive ? "page" : undefined}
                      className={
                        isActive
                          ? "rounded-full border border-primary bg-primary px-4 py-2 text-sm font-bold text-primary-foreground transition-colors"
                          : "rounded-full border border-border bg-background px-4 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:border-accent hover:text-accent"
                      }
                    >
                      {tag.name}

                      <span className="ml-1.5 opacity-70">
                        {tag.count}
                      </span>
                    </Link>
                  )
                })}
              </div>
            </nav>
          </section>
        )}

        {selectedTag && (
          <section className="mt-8 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-accent">
                CURRENT TOPIC
              </p>

              <h2 className="mt-1 text-2xl font-black">
                {selectedTag}
              </h2>
            </div>

            <p className="text-sm text-muted-foreground">
              找到 {filteredPosts.length} 篇相關文章
            </p>
          </section>
        )}

        {filteredPosts.length > 0 ? (
          <section
            aria-label={
              selectedTag
                ? `${selectedTag}相關文章`
                : "室內設計與裝潢文章"
            }
            className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3"
          >
            {filteredPosts.map((post) => {
              const firstHtmlImage = extractFirstImage(
                post.htmlContent
              )

              const thumbnail =
                optimizeImage(firstHtmlImage) ||
                optimizeImage(post.mainImageUrl) ||
                (post.youtubeVideoId
                  ? `https://img.youtube.com/vi/${post.youtubeVideoId}/maxresdefault.jpg`
                  : "")

              const plainText = stripHtml(post.htmlContent)

              const description =
                post.description?.trim() ||
                (plainText
                  ? `${plainText.slice(0, 120)}${
                      plainText.length > 120 ? "…" : ""
                    }`
                  : "閱讀住宅室內設計、空間規劃與裝潢風格相關內容。")

              const publishedDate = formatDate(
                post.publishedAt
              )

              return (
                <article
                  key={post._id}
                  className="group flex min-w-0 flex-col overflow-hidden rounded-[2rem] border border-border/70 bg-white shadow-sm transition hover:-translate-y-1 hover:border-accent/40 hover:shadow-lg"
                >
                  <PostThumbnail
                    slug={post.slug}
                    title={post.title}
                    thumbnail={thumbnail}
                    videoId={post.youtubeVideoId}
                  />

                  <div className="flex flex-1 flex-col p-6">
                    {publishedDate && (
                      <time
                        dateTime={post.publishedAt}
                        className="text-xs text-muted-foreground"
                      >
                        {publishedDate}
                      </time>
                    )}

                    <h2 className="mt-3 line-clamp-2 text-xl font-black leading-snug">
                      <Link
                        href={`/blog/${post.slug}`}
                        className="transition-colors group-hover:text-accent"
                      >
                        {post.title}
                      </Link>
                    </h2>

                    {post.tags &&
                      post.tags.length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-2">
                          {post.tags.map((tag) => (
                            <Link
                              key={tag}
                              href={`/blog?tag=${encodeURIComponent(
                                tag
                              )}`}
                              className={
                                selectedTag === tag
                                  ? "rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground"
                                  : "rounded-full border border-accent/15 bg-accent/5 px-3 py-1.5 text-xs font-semibold text-accent transition-colors hover:bg-accent hover:text-accent-foreground"
                              }
                            >
                              #{tag}
                            </Link>
                          ))}
                        </div>
                      )}

                    <p className="mt-4 line-clamp-3 text-sm leading-7 text-muted-foreground">
                      {description}
                    </p>

                    <div className="mt-auto pt-6">
                      <Link
                        href={`/blog/${post.slug}`}
                        className="text-sm font-semibold text-primary transition-colors hover:text-accent"
                      >
                        閱讀完整文章 →
                      </Link>
                    </div>
                  </div>
                </article>
              )
            })}
          </section>
        ) : (
          <section className="mt-8 rounded-[2rem] border border-dashed border-border bg-white/60 px-6 py-20 text-center">
            <h2 className="text-xl font-black">
              找不到相關文章
            </h2>

            <p className="mt-3 text-sm text-muted-foreground">
              目前沒有「{selectedTag}」標籤的文章。
            </p>

            <Link
              href="/blog"
              className="mt-6 inline-flex rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90"
            >
              查看全部文章
            </Link>
          </section>
        )}
      </div>
    </main>
  )
}