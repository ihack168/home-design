import type { Metadata } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"

import { PostThumbnail } from "@/components/post-thumbnail"
import { ProjectTagSearch } from "@/components/project-tag-search"
import { client } from "@/lib/sanity"

export const revalidate = 60

const SITE_URL = "https://www.deco77.com"
const SITE_NAME = "台灣室內設計資訊網"
const DEFAULT_OG_IMAGE = `${SITE_URL}/images/og-home.jpg`

/**
 * 請確認這五個名稱與 Sanity 文章實際使用的 tags 完全一致。
 * 例如 Sanity 用「現代風室內設計」，這裡也必須改成同樣名稱。
 */
const DESIGN_STYLES = [
  "現代風室內設計",
  "日式風室內設計",
  "侘寂風室內設計",
  "奶油風室內設計",
  "北歐風室內設計",
] as const

/**
 * 固定縣市名單。
 * 「市」結尾不一定是縣市，因此不使用字尾判斷，而是直接比對這份清單。
 */
const CITIES = [
  "台北市",
  "新北市",
  "桃園市",
  "台中市",
  "台南市",
  "高雄市",
  "基隆市",
  "新竹市",
  "嘉義市",
  "新竹縣",
  "苗栗縣",
  "彰化縣",
  "嘉義縣",
  "宜蘭縣",
] as const

interface SearchParams {
  tag?: string | string[]
  city?: string
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

function isDesignStyle(tag: string) {
  return DESIGN_STYLES.includes(tag as (typeof DESIGN_STYLES)[number])
}

function isCity(tag: string) {
  return CITIES.includes(tag as (typeof CITIES)[number])
}

function buildBlogPath(tags: string[]) {
  if (tags.length === 0) return "/blog"

  const query = new URLSearchParams()

  tags.forEach((tag) => {
    query.append("tag", tag)
  })

  return `/blog?${query.toString()}`
}

function toggleTagPath(selectedTags: string[], tag: string) {
  const nextTags = selectedTags.includes(tag)
    ? selectedTags.filter((item) => item !== tag)
    : [...selectedTags, tag]

  return buildBlogPath(nextTags)
}

/**
 * 風格採單選：
 * 選擇新風格時，會移除原本五種風格中的任何一個，再加入新風格。
 * 再點擊目前風格則取消風格篩選。
 */
function buildStylePath(selectedTags: string[], style: string) {
  const otherTags = selectedTags.filter((tag) => !isDesignStyle(tag))
  const currentStyle = selectedTags.find(isDesignStyle)

  return currentStyle === style
    ? buildBlogPath(otherTags)
    : buildBlogPath([...otherTags, style])
}

/**
 * 縣市採單選：
 * 選擇新縣市時，會移除舊縣市，但保留風格、行政區與建案條件。
 */
function buildCityPath(selectedTags: string[], city: string) {
  const otherTags = selectedTags.filter((tag) => !isCity(tag))

  return city ? buildBlogPath([...otherTags, city]) : buildBlogPath(otherTags)
}

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams
  const selectedTags = normalizeSelectedTags(params.tag)

  /**
   * 縣市下拉表單送出後，由 Server Action 重新導向，
   * 不需要建立額外 Client Component。
   */
  async function changeCity(formData: FormData) {
    "use server"

    const city = String(formData.get("city") || "").trim()
    const submittedTags = formData
      .getAll("selectedTag")
      .map((value) => String(value || "").trim())
      .filter(Boolean)

    redirect(buildCityPath(submittedTags, city))
  }

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

  const allTags: TagItem[] = Array.from(tagCountMap.entries())
    .map(([name, count]) => ({
      name,
      count,
    }))
    .sort(
      (a, b) =>
        b.count - a.count ||
        a.name.localeCompare(b.name, "zh-Hant")
    )

  const availableStyles = DESIGN_STYLES.map((name) => ({
    name,
    count: tagCountMap.get(name) || 0,
  }))

  const availableCities = CITIES.map((name) => ({
    name,
    count: tagCountMap.get(name) || 0,
  })).filter((city) => city.count > 0)

  /**
   * 排除固定風格與縣市後，其餘 tags 視為「行政區／建案／其他搜尋標籤」。
   * 不需要修改 Sanity Schema。
   */
  const searchableTags = allTags.filter(
    (tag) => !isDesignStyle(tag.name) && !isCity(tag.name)
  )

  const filteredPosts =
    selectedTags.length > 0
      ? normalizedPosts.filter((post) =>
          selectedTags.every((tag) => post.tags.includes(tag))
        )
      : normalizedPosts

  const selectedStyle =
    selectedTags.find((tag) => isDesignStyle(tag)) || ""

  const selectedCity =
    selectedTags.find((tag) => isCity(tag)) || ""

  return (
    <main className="min-h-screen bg-background px-4 pb-20 pt-4 text-foreground sm:px-6 md:pt-6">
      <div className="mx-auto max-w-7xl">
        <section className="rounded-2xl border border-border/70 bg-white px-4 py-4 shadow-sm sm:px-5">
          {/* 設計風格 */}
          <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
            <h2 className="shrink-0 text-sm font-black">設計風格</h2>

            <div className="flex flex-wrap gap-2">
              {availableStyles.map((style) => {
                const isActive = selectedStyle === style.name
                const isUnavailable = style.count === 0

                if (isUnavailable) {
                  return (
                    <span
                      key={style.name}
                      className="inline-flex cursor-not-allowed items-center rounded-xl border border-border bg-background/50 px-3 py-2 text-xs font-semibold text-muted-foreground/45"
                      title="目前沒有使用此標籤的文章"
                    >
                      {style.name}
                    </span>
                  )
                }

                return (
                  <Link
                    key={style.name}
                    href={buildStylePath(selectedTags, style.name)}
                    aria-current={isActive ? "page" : undefined}
                    className={
                      isActive
                        ? "inline-flex items-center rounded-xl border border-primary bg-primary px-3 py-2 text-xs font-bold text-primary-foreground shadow-sm"
                        : "inline-flex items-center rounded-xl border border-border bg-background px-3 py-2 text-xs font-semibold text-muted-foreground transition hover:border-accent hover:text-accent"
                    }
                  >
                    {style.name}
                  </Link>
                )
              })}
            </div>
          </div>

          {/* 縣市 */}
          <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
            <h2 className="shrink-0 text-sm font-black">縣市</h2>

            <form
              action={changeCity}
              className="flex w-full gap-2 sm:w-auto"
            >
              {selectedTags.map((tag) => (
                <input
                  key={tag}
                  type="hidden"
                  name="selectedTag"
                  value={tag}
                />
              ))}

              <label htmlFor="city" className="sr-only">
                選擇縣市
              </label>

              <select
                id="city"
                name="city"
                defaultValue={selectedCity}
                className="h-10 min-w-0 flex-1 rounded-xl border border-border bg-background px-3 text-sm font-semibold text-foreground outline-none transition focus:border-accent sm:w-56"
              >
                <option value="">全部縣市</option>

                {availableCities.map((city) => (
                  <option key={city.name} value={city.name}>
                    {city.name}（{city.count}）
                  </option>
                ))}
              </select>

              <button
                type="submit"
                className="inline-flex h-10 shrink-0 items-center justify-center rounded-xl bg-primary px-4 text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90"
              >
                套用
              </button>
            </form>
          </div>

          {/* 搜尋建案：輸入第一個字即時顯示符合標籤 */}
          <div className="mt-3">
            <ProjectTagSearch
              tags={searchableTags}
              selectedTags={selectedTags}
            />
          </div>

          {selectedTags.length > 0 && (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-muted-foreground">
                已選：
              </span>

              {selectedTags.map((tag) => (
                <Link
                  key={tag}
                  href={toggleTagPath(selectedTags, tag)}
                  className="inline-flex items-center rounded-full bg-primary px-2.5 py-1.5 text-xs font-bold text-primary-foreground"
                  aria-label={`移除 ${tag} 篩選`}
                >
                  {tag}
                  <span className="ml-1.5" aria-hidden="true">
                    ×
                  </span>
                </Link>
              ))}

              <Link
                href="/blog"
                className="ml-auto text-xs font-semibold text-muted-foreground transition-colors hover:text-accent"
              >
                清除全部
              </Link>
            </div>
          )}
        </section>

        {filteredPosts.length > 0 ? (
          <section
            aria-label="室內設計文章列表"
            className="mt-5 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
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
                              href={toggleTagPath(selectedTags, tag)}
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
          <section className="mt-5 rounded-[2rem] border border-dashed border-border bg-white/60 px-6 py-16 text-center">
            <h2 className="text-xl font-black">
              找不到符合條件的文章
            </h2>

            <p className="mt-3 text-sm text-muted-foreground">
              目前沒有同時包含「{selectedTags.join("、")}」標籤的文章。
            </p>

            <Link
              href="/blog"
              className="mt-5 inline-flex rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90"
            >
              清除篩選
            </Link>
          </section>
        )}
      </div>
    </main>
  )
}
