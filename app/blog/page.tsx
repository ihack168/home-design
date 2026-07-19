import type { Metadata } from "next"
import Link from "next/link"

import { PostThumbnail } from "@/components/post-thumbnail"
import { client } from "@/lib/sanity"

export const revalidate = 60

const SITE_URL = "https://home-design.line88.tw"
const SITE_NAME = "台灣室內設計資訊網"
const DEFAULT_OG_IMAGE = `${SITE_URL}/images/og-home.jpg`

interface SearchParams {
  tag?: string | string[]
}

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

interface TagItem {
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
  if (!Array.isArray(tags)) return []

  return Array.from(
    new Set(
      tags
        .map((tag) => String(tag || "").trim())
        .filter(Boolean)
    )
  )
}

function normalizeSelectedTags(tag?: string | string[]) {
  const values = Array.isArray(tag) ? tag : tag ? [tag] : []

  return Array.from(
    new Set(
      values
        .map((value) => String(value || "").trim())
        .filter(Boolean)
    )
  )
}

function buildTagPath(selectedTags: string[], toggledTag?: string) {
  if (!toggledTag) return "/blog"

  const nextTags = selectedTags.includes(toggledTag)
    ? selectedTags.filter((tag) => tag !== toggledTag)
    : [...selectedTags, toggledTag]

  if (nextTags.length === 0) return "/blog"

  const query = new URLSearchParams()

  nextTags.forEach((tag) => {
    query.append("tag", tag)
  })

  return `/blog?${query.toString()}`
}

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams
  const selectedTags = normalizeSelectedTags(params.tag)

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

  const tagCountMap = new Map<string, number>()

  normalizedPosts.forEach((post) => {
    post.tags.forEach((tag) => {
      tagCountMap.set(tag, (tagCountMap.get(tag) || 0) + 1)
    })
  })

  const tags: TagItem[] = Array.from(tagCountMap.entries())
    .map(([name, count]) => ({
      name,
      count,
    }))
    .sort(
      (a, b) =>
        b.count - a.count ||
        a.name.localeCompare(b.name, "zh-Hant")
    )

  const filteredPosts =
    selectedTags.length > 0
      ? normalizedPosts.filter((post) =>
          selectedTags.every((tag) => post.tags.includes(tag))
        )
      : normalizedPosts

  return (
    <main className="min-h-screen bg-background px-4 pb-24 pt-6 text-foreground sm:px-6 md:pt-10">
      <div className="mx-auto max-w-7xl">
        {tags.length > 0 && (
          <section className="rounded-[2rem] border border-border/70 bg-white px-5 py-6 shadow-sm sm:px-7 sm:py-7">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h1 className="text-2xl font-black tracking-tight md:text-3xl">
                  室內設計與裝潢文章
                </h1>

                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  可複選建案、縣市、行政區或設計風格；系統會顯示同時符合所有標籤的文章。
                </p>

                <p className="mt-2 text-sm text-muted-foreground">
                  共 {normalizedPosts.length} 篇文章
                  {selectedTags.length > 0 && (
                    <>
                      <span aria-hidden="true">・</span>
                      已篩選 {filteredPosts.length} 篇
                    </>
                  )}
                </p>
              </div>

              {selectedTags.length > 0 && (
                <Link
                  href="/blog"
                  className="inline-flex w-fit items-center rounded-full border border-border bg-background px-4 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:border-accent hover:text-accent"
                >
                  清除全部篩選
                </Link>
              )}
            </div>

            {selectedTags.length > 0 && (
              <div className="mt-5 flex flex-wrap items-center gap-2">
                <span className="text-sm font-semibold text-foreground">
                  已選條件：
                </span>

                {selectedTags.map((tag) => (
                  <Link
                    key={tag}
                    href={buildTagPath(selectedTags, tag)}
                    className="inline-flex items-center rounded-full bg-primary px-3 py-1.5 text-sm font-bold text-primary-foreground"
                    aria-label={`移除 ${tag} 篩選`}
                  >
                    {tag}
                    <span className="ml-2" aria-hidden="true">
                      ×
                    </span>
                  </Link>
                ))}
              </div>
            )}

            <nav
              aria-label="文章主題複選篩選"
              className="mt-5"
            >
              <div className="flex flex-wrap gap-2.5">
                <Link
                  href="/blog"
                  aria-current={
                    selectedTags.length === 0 ? "page" : undefined
                  }
                  className={
                    selectedTags.length === 0
                      ? "inline-flex items-center rounded-2xl border border-primary bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground shadow-sm"
                      : "inline-flex items-center rounded-2xl border border-border bg-background px-4 py-2.5 text-sm font-semibold text-muted-foreground transition hover:-translate-y-0.5 hover:border-accent hover:text-accent"
                  }
                >
                  全部文章
                  <span
                    className={
                      selectedTags.length === 0
                        ? "ml-2 rounded-full bg-white/20 px-2 py-0.5 text-xs"
                        : "ml-2 rounded-full bg-white px-2 py-0.5 text-xs text-muted-foreground"
                    }
                  >
                    {normalizedPosts.length}
                  </span>
                </Link>

                {tags.map((tag) => {
                  const isActive = selectedTags.includes(tag.name)

                  return (
                    <Link
                      key={tag.name}
                      href={buildTagPath(selectedTags, tag.name)}
                      aria-current={isActive ? "page" : undefined}
                      className={
                        isActive
                          ? "inline-flex items-center rounded-2xl border border-primary bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground shadow-sm"
                          : "inline-flex items-center rounded-2xl border border-border bg-background px-4 py-2.5 text-sm font-semibold text-muted-foreground transition hover:-translate-y-0.5 hover:border-accent hover:text-accent"
                      }
                    >
                      {isActive && (
                        <span className="mr-1.5" aria-hidden="true">
                          ✓
                        </span>
                      )}
                      {tag.name}
                      <span
                        className={
                          isActive
                            ? "ml-2 rounded-full bg-white/20 px-2 py-0.5 text-xs"
                            : "ml-2 rounded-full bg-white px-2 py-0.5 text-xs text-muted-foreground"
                        }
                      >
                        {tag.count}
                      </span>
                    </Link>
                  )
                })}
              </div>
            </nav>
          </section>
        )}

        {selectedTags.length > 0 && (
          <div className="mt-7 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-bold tracking-[0.18em] text-accent">
                篩選結果
              </p>

              <h2 className="mt-1 text-xl font-black md:text-2xl">
                {selectedTags.join(" ＋ ")}
              </h2>
            </div>

            <p className="text-sm text-muted-foreground">
              顯示 {filteredPosts.length} 篇同時符合條件的文章
            </p>
          </div>
        )}

        {filteredPosts.length > 0 ? (
          <section
            aria-label="室內設計文章列表"
            className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3"
          >
            {filteredPosts.map((post) => {
              const firstHtmlImage = extractFirstImage(post.htmlContent)

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

              const publishedDate = formatDate(post.publishedAt)

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

                    {post.tags.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {post.tags.map((tag) => {
                          const isActive = selectedTags.includes(tag)

                          return (
                            <Link
                              key={tag}
                              href={buildTagPath(selectedTags, tag)}
                              className={
                                isActive
                                  ? "rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground"
                                  : "rounded-full border border-accent/15 bg-accent/5 px-3 py-1.5 text-xs font-semibold text-accent transition-colors hover:bg-accent hover:text-accent-foreground"
                              }
                            >
                              #{tag}
                            </Link>
                          )
                        })}
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
              找不到同時符合條件的文章
            </h2>

            <p className="mt-3 text-sm text-muted-foreground">
              目前沒有同時包含「{selectedTags.join("、")}」標籤的文章。
            </p>

            <Link
              href="/blog"
              className="mt-6 inline-flex rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90"
            >
              清除篩選並查看全部文章
            </Link>
          </section>
        )}
      </div>
    </main>
  )
}
