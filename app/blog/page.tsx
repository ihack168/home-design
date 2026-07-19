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

export default async function BlogPage() {
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

  return (
    <main className="min-h-screen bg-background px-6 pb-24 pt-12 text-foreground md:pt-20">
      <div className="mx-auto max-w-7xl">
        <header className="mb-10">
          <p className="text-sm font-semibold tracking-[0.2em] text-accent">
            INTERIOR DESIGN JOURNAL
          </p>

          <h1 className="mt-3 text-3xl font-black tracking-tight md:text-5xl">
            室內設計與裝潢文章
          </h1>

          <p className="mt-4 max-w-2xl leading-8 text-muted-foreground">
            探索住宅建案、設計風格、格局坪數、居家空間與室內裝潢相關內容。
          </p>

          <p className="mt-3 text-sm text-muted-foreground">
            共 {posts.length} 篇文章
          </p>
        </header>

        {posts.length > 0 ? (
          <section className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => {
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
          <section className="rounded-[2rem] border border-dashed border-border bg-white/60 px-6 py-20 text-center">
            <h2 className="text-xl font-black">目前沒有文章</h2>
          </section>
        )}
      </div>
    </main>
  )
}
