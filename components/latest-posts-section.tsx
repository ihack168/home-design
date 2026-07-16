import Link from "next/link"
import { client } from "@/lib/sanity"

interface SanityPost {
  id: string
  title?: string
  slug?: string
  description?: string
  imageUrl?: string
  mainImage?: string
  videoId?: string
  tags?: string[]
  publishedAt?: string
  htmlContent?: string
}

interface Post {
  id: string
  title: string
  slug: string
  description: string
  thumbnail: string
  videoId?: string
  tags: string[]
  publishedAt: string
}

function optimizeSanityImageUrl(url?: string) {
  if (!url) return ""

  if (!url.includes("cdn.sanity.io/images")) {
    return url
  }

  const separator = url.includes("?") ? "&" : "?"

  let optimizedUrl = url

  if (!optimizedUrl.includes("auto=format")) {
    optimizedUrl += `${separator}auto=format`
  }

  if (!optimizedUrl.includes("w=")) {
    optimizedUrl += `${optimizedUrl.includes("?") ? "&" : "?"}w=900`
  }

  if (!optimizedUrl.includes("q=")) {
    optimizedUrl += `${optimizedUrl.includes("?") ? "&" : "?"}q=82`
  }

  return optimizedUrl
}

function extractFirstImage(htmlContent?: string) {
  if (!htmlContent) return ""

  const imgMatch = htmlContent.match(
    /<img[^>]+src=["']([^"']+)["']/i
  )

  return imgMatch?.[1]
    ? optimizeSanityImageUrl(imgMatch[1])
    : ""
}

function extractDescription(htmlContent?: string) {
  if (!htmlContent) return ""

  const pureText = htmlContent
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim()

  if (!pureText) return ""

  return pureText.length > 110
    ? `${pureText.substring(0, 110)}...`
    : pureText
}

function processPost(post: SanityPost): Post | null {
  if (!post.id || !post.title || !post.slug) {
    return null
  }

  const extractedImage = extractFirstImage(post.htmlContent)

  const extractedDescription =
    !post.description ||
    post.description.trim() === "" ||
    post.description === "點擊閱讀詳情..."
      ? extractDescription(post.htmlContent)
      : post.description.trim()

  const youtubeThumbnail = post.videoId
    ? `https://img.youtube.com/vi/${post.videoId}/maxresdefault.jpg`
    : ""

  return {
    id: post.id,
    title: post.title,
    slug: post.slug,
    description:
      extractedDescription ||
      "查看完整室內設計、住宅裝潢與空間規劃內容。",
    thumbnail:
      extractedImage ||
      optimizeSanityImageUrl(post.imageUrl) ||
      optimizeSanityImageUrl(post.mainImage) ||
      youtubeThumbnail,
    videoId: post.videoId,
    tags: Array.isArray(post.tags) ? post.tags : [],
    publishedAt: post.publishedAt || "",
  }
}

async function getLatestPosts(): Promise<Post[]> {
  try {
    const result = await client.fetch<SanityPost[]>(
      `*[
        _type == "post" &&
        defined(slug.current) &&
        defined(title)
      ] | order(coalesce(publishedAt, _createdAt) desc) [0...6] {
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
      {},
      {
        next: {
          revalidate: 3600,
        },
      }
    )

    return result
      .map(processPost)
      .filter((post): post is Post => post !== null)
  } catch (error) {
    console.error("首頁文章抓取失敗:", error)

    return []
  }
}

export async function LatestPostsSection() {
  const posts = await getLatestPosts()

  return (
    <section
      aria-labelledby="latest-posts-heading"
      className="mx-auto max-w-6xl px-6 py-16"
    >
      <div className="mb-10 flex flex-col gap-4 text-center md:flex-row md:items-end md:justify-between md:text-left">
        <div>
          <p className="text-sm font-semibold tracking-[0.2em] text-accent">
            LATEST DESIGN ARTICLES
          </p>

          <h2
            id="latest-posts-heading"
            className="mt-3 text-2xl font-black text-foreground md:text-4xl"
          >
            最新室內設計與裝潢文章
          </h2>

          <p className="mt-4 max-w-2xl text-base leading-8 text-muted-foreground">
            整理住宅建案、室內設計風格、格局規劃、空間收納與居家裝潢相關資訊，
            幫助你找到適合自己房子的設計方向。
          </p>
        </div>

        <Link
          href="/blog"
          className="inline-flex justify-center rounded-full border border-border bg-white/70 px-6 py-3 text-sm font-semibold text-muted-foreground shadow-sm transition-all hover:border-accent/50 hover:text-accent"
        >
          查看全部文章 →
        </Link>
      </div>

      {posts.length > 0 ? (
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <article
              key={post.id}
              className="group flex h-full flex-col overflow-hidden rounded-[2rem] border border-border/70 bg-white/80 shadow-[0_10px_40px_rgba(53,51,46,0.08)] backdrop-blur transition-all duration-500 hover:-translate-y-1.5 hover:border-accent/40 hover:shadow-[0_20px_60px_rgba(53,51,46,0.14)]"
            >
              <Link
                href={`/blog/${post.slug}`}
                aria-label={`閱讀文章：${post.title}`}
                className="relative block aspect-video w-full overflow-hidden bg-muted"
              >
                {post.thumbnail ? (
                  <img
                    src={post.thumbnail}
                    alt={post.title}
                    width={900}
                    height={506}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-secondary px-6 text-center text-sm text-muted-foreground">
                    室內設計與住宅裝潢提案
                  </div>
                )}

                {post.videoId && (
                  <span
                    aria-hidden="true"
                    className="absolute inset-0 flex items-center justify-center bg-black/5"
                  >
                    <span className="flex h-12 w-16 items-center justify-center rounded-2xl bg-white/90 shadow-xl backdrop-blur transition-transform duration-300 group-hover:scale-110">
                      <span className="ml-1 border-y-[10px] border-l-[16px] border-y-transparent border-l-primary" />
                    </span>
                  </span>
                )}
              </Link>

              <div className="flex flex-1 flex-col p-6">
                {post.tags.length > 0 && (
                  <div className="mb-4 flex flex-wrap gap-2">
                    {post.tags.slice(0, 3).map((tag) => (
                      <Link
                        key={tag}
                        href={`/blog?tag=${encodeURIComponent(tag)}`}
                        className="rounded-full border border-accent/20 bg-accent/5 px-3 py-1 text-xs font-medium text-accent transition-all hover:bg-accent hover:text-accent-foreground"
                      >
                        #{tag}
                      </Link>
                    ))}
                  </div>
                )}

                <Link href={`/blog/${post.slug}`}>
                  <h3 className="line-clamp-2 text-xl font-bold leading-snug text-foreground transition-colors group-hover:text-accent">
                    {post.title}
                  </h3>
                </Link>

                <p className="mt-4 line-clamp-3 text-sm leading-7 text-muted-foreground">
                  {post.description}
                </p>

                <div className="mt-auto pt-6">
                  <Link
                    href={`/blog/${post.slug}`}
                    className="inline-flex items-center text-sm font-semibold text-primary"
                  >
                    閱讀完整文章

                    <span className="ml-2 transition-transform group-hover:translate-x-1">
                      →
                    </span>
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="rounded-[2rem] border border-dashed border-border bg-white/60 py-24 text-center shadow-sm backdrop-blur">
          <p className="text-xl font-bold text-foreground">
            室內設計文章正在準備中
          </p>

          <p className="mt-3 px-6 text-sm leading-7 text-muted-foreground">
            之後會陸續整理建案室內設計、住宅裝潢、格局規劃與空間風格相關內容。
          </p>
        </div>
      )}
    </section>
  )
}