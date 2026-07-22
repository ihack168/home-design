import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { PortableText } from "@portabletext/react"
import { createImageUrlBuilder } from "@sanity/image-url"

import { ShareBar } from "@/components/share-bar"
import { YouTubeCoverPlayer } from "@/components/youtube-cover-player"
import { sanitizePostHtml } from "@/lib/content-cleanup"
import { client } from "@/lib/sanity"

export const revalidate = 0
export const dynamic = "force-dynamic"

const siteName = "台灣室內設計資訊網"
const shortSiteName = "室內設計資訊網"
const siteUrl = "https://www.deco77.com"
const defaultAuthorName = "台灣室內設計資訊網編輯部"
const defaultArticleCategory = "室內設計與居家裝潢"

const builder = createImageUrlBuilder(client)

function urlFor(source: unknown) {
  if (!source) {
    return {
      url: () => "",
    }
  }

  return builder.image(source)
}

function optimizeSanityImages(html?: string) {
  if (!html) return ""

  return html.replace(
    /(https:\/\/cdn\.sanity\.io\/images\/[^"' )<>]+)/g,
    (url) => {
      let optimizedUrl = url

      if (!optimizedUrl.includes("auto=format")) {
        optimizedUrl += `${
          optimizedUrl.includes("?") ? "&" : "?"
        }auto=format`
      }

      if (!optimizedUrl.includes("q=")) {
        optimizedUrl += `${
          optimizedUrl.includes("?") ? "&" : "?"
        }q=85`
      }

      return optimizedUrl
    }
  )
}

function decodeHtmlEntities(value: string) {
  return value
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, "\"")
    .replace(/&#39;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
}

function extractFirstImageFromHtml(htmlContent?: string) {
  if (!htmlContent) return ""

  const match = htmlContent.match(
    /<img\b[^>]*\bsrc\s*=\s*["']([^"']+)["'][^>]*>/i
  )

  if (!match?.[1]) return ""

  return decodeHtmlEntities(match[1].trim())
}

function buildSocialImageUrl(imageUrl: string) {
  if (!imageUrl) return ""

  if (!imageUrl.includes("cdn.sanity.io/images/")) {
    return imageUrl
  }

  const separator = imageUrl.includes("?") ? "&" : "?"

  return `${imageUrl}${separator}w=1200&h=630&fit=crop&auto=format&q=85`
}

function stripHtml(value?: string) {
  if (!value) return ""

  return value
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

function removeRepeatedTitle(text: string, title: string) {
  const normalizedText = text.trim()
  const normalizedTitle = title.trim()

  if (!normalizedText || !normalizedTitle) {
    return normalizedText
  }

  if (normalizedText.startsWith(normalizedTitle)) {
    return normalizedText
      .slice(normalizedTitle.length)
      .replace(/^[\s：:｜|\-–—]+/, "")
  }

  return normalizedText
}

function removeLeadingDuplicateHeading(
  htmlContent: string,
  title: string
) {
  if (!htmlContent || !title) return htmlContent

  const normalizedTitle = title
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, "\"")
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, " ")
    .trim()

  let removed = false

  return htmlContent.replace(
    /<h2\b[^>]*>([\s\S]*?)<\/h2>/i,
    (fullMatch, headingContent: string) => {
      if (removed) return fullMatch

      const normalizedHeading = headingContent
        .replace(/<[^>]+>/g, "")
        .replace(/&nbsp;/gi, " ")
        .replace(/&amp;/gi, "&")
        .replace(/&quot;/gi, "\"")
        .replace(/&#39;/gi, "'")
        .replace(/\s+/g, " ")
        .trim()

      if (normalizedHeading === normalizedTitle) {
        removed = true
        return ""
      }

      return fullMatch
    }
  )
}

function buildDescription(
  description: string | undefined,
  htmlContent: string | undefined,
  title: string
) {
  const supplied = removeRepeatedTitle(
    stripHtml(description),
    title
  )

  if (
    supplied &&
    supplied !== "點擊閱讀詳情..."
  ) {
    return `${supplied.slice(0, 150)}${
      supplied.length > 150 ? "…" : ""
    }`
  }

  const fromHtml = removeRepeatedTitle(
    stripHtml(htmlContent),
    title
  )

  if (fromHtml) {
    return `${fromHtml.slice(0, 150)}${
      fromHtml.length > 150 ? "…" : ""
    }`
  }

  return `${title}｜${shortSiteName}`
}

function formatDate(date?: string) {
  if (!date) return null

  const parsed = new Date(date)

  if (Number.isNaN(parsed.getTime())) {
    return null
  }

  return parsed.toLocaleDateString("zh-TW", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "Asia/Taipei",
  })
}

function toIsoDate(date?: string) {
  if (!date) return undefined

  const parsed = new Date(date)

  if (Number.isNaN(parsed.getTime())) {
    return undefined
  }

  return parsed.toISOString()
}

function serializeJsonLd(data: unknown) {
  return JSON.stringify(data).replace(/</g, "\\u003c")
}

function escapeHtmlAttribute(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
}

function insertImageAfterHeading(
  html: string,
  headingText: string,
  imageUrl?: string,
  alt?: string
) {
  if (!html || !imageUrl) return html

  const escapedHeading = headingText.replace(
    /[.*+?^${}()|[\]\\]/g,
    "\\$&"
  )

  const headingRegex = new RegExp(
    `(<h2\\b[^>]*>\\s*${escapedHeading}\\s*<\\/h2>)`,
    "i"
  )

  if (!headingRegex.test(html)) {
    return html
  }

  const safeUrl = escapeHtmlAttribute(imageUrl)
  const safeAlt = escapeHtmlAttribute(
    alt || headingText
  )

  return html.replace(
    headingRegex,
    `$1
<figure class="article-space-image">
  <img
    src="${safeUrl}"
    alt="${safeAlt}"
    loading="lazy"
    decoding="async"
  />
</figure>`
  )
}

interface PostMetadataResult {
  title?: string
  description?: string
  htmlContent?: string
  publishedAt?: string
  _updatedAt?: string
  mainImage?: unknown
  livingRoomImage?: any
  diningRoomImage?: any
  masterBedroomImage?: any
  secondBedroomImage?: any
  authorName?: string
  authorSlug?: string
  tags?: string[]
}

interface RelatedPost {
  _id: string
  title: string
  slug: string
  publishedAt?: string
}

interface PostResult extends PostMetadataResult {
  _id: string
  slug: string
  body?: unknown
  youtubeVideoId?: string
}

const ptComponents = {
  types: {
    image: ({ value }: { value: any }) => {
      if (!value?.asset?._ref) return null

      const imageUrl = urlFor(value)
        .width(1400)
        .fit("max")
        .auto("format")
        .url()

      return (
        <figure className="my-10 flex flex-col items-center">
          <img
            src={imageUrl}
            alt={value.alt || "住宅室內設計文章圖片"}
            className="h-auto w-full rounded-[2rem] border border-border shadow-[0_16px_50px_rgba(53,51,46,0.12)]"
            loading="lazy"
            decoding="async"
          />

          {value.caption && (
            <figcaption className="mt-3 text-center text-sm leading-6 text-muted-foreground">
              {value.caption}
            </figcaption>
          )}
        </figure>
      )
    },
  },
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params

  const post =
    await client.fetch<PostMetadataResult | null>(
      `*[
        _type == "post" &&
        slug.current == $slug
      ][0] {
        title,
        description,
        htmlContent,
        publishedAt,
        _updatedAt,
        mainImage,
        "authorName": author->name,
        "authorSlug": author->slug.current,
        "tags": coalesce(categories[]->title, tags)
      }`,
      {
        slug,
      },
      {
        cache: "no-store",
      }
    )

  if (!post?.title) {
    return {
      title: "找不到文章",
      robots: {
        index: false,
        follow: false,
      },
    }
  }

  const description = buildDescription(
    post.description,
    post.htmlContent,
    post.title
  )

  const canonicalUrl = `${siteUrl}/blog/${slug}`
  const firstHtmlImage = extractFirstImageFromHtml(
    post.htmlContent
  )

  const ogImage = firstHtmlImage
    ? buildSocialImageUrl(firstHtmlImage)
    : post.mainImage
      ? urlFor(post.mainImage)
          .width(1200)
          .height(630)
          .fit("crop")
          .auto("format")
          .url()
      : `${siteUrl}/images/og-home.jpg`

  const publishedTime = toIsoDate(post.publishedAt)
  const rawModifiedTime = toIsoDate(
    post._updatedAt || post.publishedAt
  )

  const modifiedTime =
    publishedTime &&
    rawModifiedTime &&
    new Date(rawModifiedTime).getTime() <
      new Date(publishedTime).getTime()
      ? publishedTime
      : rawModifiedTime

  const authorName =
    post.authorName || defaultAuthorName

  const tags = Array.isArray(post.tags)
    ? post.tags.filter(Boolean)
    : []

  return {
    title: post.title,
    description,

    alternates: {
      canonical: canonicalUrl,
    },

    authors: [
      {
        name: authorName,
        url: post.authorSlug
          ? `${siteUrl}/authors/${post.authorSlug}`
          : siteUrl,
      },
    ],

    category:
      tags[0] || defaultArticleCategory,

    keywords: tags,

    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },

    openGraph: {
      title: post.title,
      description,
      url: canonicalUrl,
      siteName,
      locale: "zh_TW",
      type: "article",
      publishedTime,
      modifiedTime,
      authors: [authorName],
      section:
        tags[0] || defaultArticleCategory,
      tags,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },

    twitter: {
      card: "summary_large_image",
      title: post.title,
      description,
      images: [ogImage],
    },
  }
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  const post =
    await client.fetch<PostResult | null>(
      `*[
        _type == "post" &&
        slug.current == $slug
      ][0] {
        _id,
        title,
        description,
        "slug": slug.current,
        publishedAt,
        _updatedAt,
        mainImage,
        livingRoomImage,
        diningRoomImage,
        masterBedroomImage,
        secondBedroomImage,
        youtubeVideoId,
        body,
        htmlContent,
        "authorName": author->name,
        "authorSlug": author->slug.current,
        "tags": coalesce(categories[]->title, tags)
      }`,
      {
        slug,
      },
      {
        cache: "no-store",
      }
    )

  if (!post?.title) {
    notFound()
  }

  const tags = Array.isArray(post.tags)
    ? post.tags.filter(Boolean)
    : []

  const displayedTags = tags

  const authorName =
    post.authorName || defaultAuthorName

  const authorUrl = post.authorSlug
    ? `/authors/${post.authorSlug}`
    : "/"

  const description = buildDescription(
    post.description,
    post.htmlContent,
    post.title
  )

  const publishedIso = toIsoDate(
    post.publishedAt
  )

  const rawModifiedIso = toIsoDate(
    post._updatedAt || post.publishedAt
  )

  const modifiedIso =
    publishedIso &&
    rawModifiedIso &&
    new Date(rawModifiedIso).getTime() <
      new Date(publishedIso).getTime()
      ? publishedIso
      : rawModifiedIso

  const publishedDate =
    formatDate(publishedIso)

  const modifiedDate =
    formatDate(modifiedIso)

  const canonicalUrl =
    `${siteUrl}/blog/${slug}`

  const youtubeVideoId =
    typeof post.youtubeVideoId === "string" &&
    /^[a-zA-Z0-9_-]{11}$/.test(
      post.youtubeVideoId.trim()
    )
      ? post.youtubeVideoId.trim()
      : undefined

  const mainImageUrl = post.mainImage
    ? urlFor(post.mainImage)
        .width(1600)
        .fit("max")
        .auto("format")
        .url()
    : undefined

  const livingRoomImageUrl =
    post.livingRoomImage
      ? urlFor(post.livingRoomImage)
          .width(1600)
          .fit("max")
          .auto("format")
          .url()
      : undefined

  const diningRoomImageUrl =
    post.diningRoomImage
      ? urlFor(post.diningRoomImage)
          .width(1600)
          .fit("max")
          .auto("format")
          .url()
      : undefined

  const masterBedroomImageUrl =
    post.masterBedroomImage
      ? urlFor(post.masterBedroomImage)
          .width(1600)
          .fit("max")
          .auto("format")
          .url()
      : undefined

  const secondBedroomImageUrl =
    post.secondBedroomImage
      ? urlFor(post.secondBedroomImage)
          .width(1600)
          .fit("max")
          .auto("format")
          .url()
      : undefined

  const firstHtmlImage =
    extractFirstImageFromHtml(
      post.htmlContent
    )

  const videoPosterImage =
    firstHtmlImage || mainImageUrl

  const structuredImageUrl = firstHtmlImage
    ? buildSocialImageUrl(firstHtmlImage)
    : post.mainImage
      ? urlFor(post.mainImage)
          .width(1200)
          .height(630)
          .fit("crop")
          .auto("format")
          .url()
      : `${siteUrl}/images/og-home.jpg`

  /*
   * HTML Pipeline：
   * 圖片最佳化
   * → sanitizePostHtml 移除重複 H1、首圖及異常內容
   * → 移除與文章主標題重複的第一個 H2
   * → Render
   */
  const optimizedHtml =
    optimizeSanityImages(post.htmlContent)

  const sanitizedHtml = optimizedHtml
    ? sanitizePostHtml(
        optimizedHtml,
        post.title,
        Boolean(
          post.mainImage ||
          (youtubeVideoId && firstHtmlImage)
        )
      )
    : ""

  let cleanedHtml = sanitizedHtml
    ? removeLeadingDuplicateHeading(
        sanitizedHtml,
        post.title
      )
    : ""

  cleanedHtml = insertImageAfterHeading(
    cleanedHtml,
    "客廳設計",
    livingRoomImageUrl,
    post.livingRoomImage?.alt ||
      `${post.title}－客廳設計`
  )

  cleanedHtml = insertImageAfterHeading(
    cleanedHtml,
    "餐廳設計",
    diningRoomImageUrl,
    post.diningRoomImage?.alt ||
      `${post.title}－餐廳設計`
  )

  cleanedHtml = insertImageAfterHeading(
    cleanedHtml,
    "主臥設計",
    masterBedroomImageUrl,
    post.masterBedroomImage?.alt ||
      `${post.title}－主臥設計`
  )

  cleanedHtml = insertImageAfterHeading(
    cleanedHtml,
    "次臥設計",
    secondBedroomImageUrl,
    post.secondBedroomImage?.alt ||
      `${post.title}－次臥設計`
  )

  const relatedPosts =
    await client.fetch<RelatedPost[]>(
      `*[
        _type == "post" &&
        _id != $postId &&
        defined(slug.current) &&
        defined(title) &&
        count(
          coalesce(
            categories[]->title,
            tags
          )[@ in $tags]
        ) > 0
      ]
      | order(
          count(
            coalesce(
              categories[]->title,
              tags
            )[@ in $tags]
          ) desc,
          coalesce(
            publishedAt,
            _createdAt
          ) desc
        )[0...3] {
          _id,
          title,
          "slug": slug.current,
          "publishedAt": coalesce(
            publishedAt,
            _createdAt
          )
        }`,
      {
        postId: post._id,
        tags,
      },
      {
        cache: "no-store",
      }
    )

  const blogPostingJsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `${canonicalUrl}#article`,
    url: canonicalUrl,
    headline: post.title,
    description,
    inLanguage: "zh-Hant-TW",

    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": canonicalUrl,
    },

    isPartOf: {
      "@id": `${siteUrl}/#website`,
    },

    author: post.authorSlug
      ? {
          "@type": "Person",
          "@id": `${siteUrl}/authors/${post.authorSlug}#person`,
          name: authorName,
          url: `${siteUrl}/authors/${post.authorSlug}`,
        }
      : {
          "@type": "Organization",
          "@id": `${siteUrl}/#organization`,
          name: defaultAuthorName,
          url: siteUrl,
        },

    publisher: {
      "@id": `${siteUrl}/#organization`,
    },

    datePublished: publishedIso,
    dateModified: modifiedIso,

    image: {
      "@type": "ImageObject",
      url: structuredImageUrl,
      width: 1200,
      height: 630,
    },

    articleSection:
      tags[0] || defaultArticleCategory,

    keywords: tags,

    about:
      tags.length > 0
        ? tags.map((tag) => ({
            "@type": "Thing",
            name: tag,
          }))
        : [
            {
              "@type": "Thing",
              name: "室內設計",
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
  }

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "@id": `${canonicalUrl}#breadcrumb`,

    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "首頁",
        item: `${siteUrl}/`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "室內設計文章",
        item: `${siteUrl}/blog`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: post.title,
        item: canonicalUrl,
      },
    ],
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html:
            serializeJsonLd(
              blogPostingJsonLd
            ),
        }}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html:
            serializeJsonLd(
              breadcrumbJsonLd
            ),
        }}
      />

      <div className="px-5 pb-24 pt-12 md:px-6 md:pt-20">
        <div className="mx-auto max-w-4xl">
          {/* 麵包屑 */}
          <nav
            aria-label="麵包屑導覽"
            className="mb-7 flex items-center gap-2 overflow-hidden text-xs text-muted-foreground"
          >
            <Link
              href="/"
              className="shrink-0 transition-colors hover:text-accent"
            >
              首頁
            </Link>

            <span aria-hidden="true">
              /
            </span>

            <Link
              href="/blog"
              className="shrink-0 transition-colors hover:text-accent"
            >
              室內設計文章
            </Link>

            <span aria-hidden="true">
              /
            </span>

            <span
              aria-current="page"
              className="truncate text-foreground"
            >
              {post.title}
            </span>
          </nav>

          {/* 文章標籤 */}
          {displayedTags.length > 0 && (
            <div className="mb-5 flex flex-wrap gap-2">
              {displayedTags.map((tag) => (
                <Link
                  key={tag}
                  href={`/blog?tag=${encodeURIComponent(
                    tag
                  )}`}
                  className="rounded-full border border-accent/20 bg-accent/5 px-3 py-1.5 text-xs font-semibold text-accent transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                  #{tag}
                </Link>
              ))}
            </div>
          )}

          {/* 文章標題 */}
          <header>
            <h1 className="text-4xl font-black leading-tight tracking-tight text-foreground md:text-5xl md:leading-[1.15]">
              {post.title}
            </h1>

            <div className="mt-7 flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-border pb-7 text-sm text-muted-foreground">
              <span>
                撰文者：
                <Link
                  href={authorUrl}
                  rel="author"
                  className="font-semibold text-foreground transition-colors hover:text-accent"
                >
                  {authorName}
                </Link>
              </span>

              {publishedDate && (
                <>
                  <span
                    className="text-border"
                    aria-hidden="true"
                  >
                    |
                  </span>

                  <time
                    dateTime={publishedIso}
                  >
                    發布於 {publishedDate}
                  </time>
                </>
              )}

              {modifiedDate &&
                modifiedIso &&
                publishedIso &&
                modifiedIso !==
                  publishedIso && (
                  <>
                    <span
                      className="text-border"
                      aria-hidden="true"
                    >
                      |
                    </span>

                    <time
                      dateTime={modifiedIso}
                    >
                      更新於 {modifiedDate}
                    </time>
                  </>
                )}
            </div>
          </header>

          {/* 文章主視覺：先顯示高畫質首圖，點擊後原位置播放 YouTube */}
          {youtubeVideoId ? (
            <YouTubeCoverPlayer
              videoId={youtubeVideoId}
              posterImage={videoPosterImage}
              title={post.title}
            />
          ) : (
            mainImageUrl && (
              <figure className="mb-14 mt-10 overflow-hidden rounded-[2rem] border border-border bg-white shadow-[0_20px_70px_rgba(53,51,46,0.12)]">
                <img
                  src={mainImageUrl}
                  alt={`${post.title}室內設計與空間提案`}
                  className="h-auto w-full object-cover"
                  fetchPriority="high"
                  decoding="async"
                />
              </figure>
            )
          )}

          {/* 文章內容 */}
          <article
            className="
              prose max-w-none
              prose-lg
              prose-p:mb-5
              prose-p:leading-[1.9]
              prose-p:text-muted-foreground
              prose-headings:font-black
              prose-headings:tracking-tight
              prose-headings:text-foreground
              prose-h2:mb-5
              prose-h2:mt-12
              prose-h2:border-l-4
              prose-h2:border-accent
              prose-h2:pl-4
              prose-h2:text-2xl
              prose-h3:mt-8
              prose-h3:text-xl
              prose-strong:font-bold
              prose-strong:text-foreground
              prose-a:text-accent
              prose-a:no-underline
              hover:prose-a:opacity-75
              prose-ul:rounded-2xl
              prose-ul:border
              prose-ul:border-border
              prose-ul:bg-white/70
              prose-ul:p-6
              prose-ol:rounded-2xl
              prose-ol:border
              prose-ol:border-border
              prose-ol:bg-white/70
              prose-ol:p-6
              prose-li:text-muted-foreground
              prose-li:marker:text-accent
              prose-table:my-10
              prose-table:block
              prose-table:overflow-x-auto
              prose-table:border-collapse
              prose-thead:bg-secondary
              prose-th:border
              prose-th:border-border
              prose-th:p-4
              prose-th:text-primary
              prose-td:border
              prose-td:border-border
              prose-td:p-4
              prose-td:text-muted-foreground
              prose-img:rounded-[2rem]
              prose-img:border
              prose-img:border-border
              prose-blockquote:rounded-r-2xl
              prose-blockquote:border-l-accent
              prose-blockquote:bg-secondary/60
              prose-blockquote:px-6
              prose-blockquote:py-3
              prose-blockquote:text-muted-foreground
            "
          >
            {cleanedHtml ? (
              <div
                className="
                  [&_table]:!my-10
                  [&_table]:!w-full
                  [&_table]:!border-collapse
                  [&_table]:!overflow-hidden
                  [&_table]:!rounded-2xl
                  [&_th]:!border
                  [&_th]:!border-border
                  [&_th]:!bg-secondary
                  [&_th]:!p-4
                  [&_th]:!text-primary
                  [&_td]:!border
                  [&_td]:!border-border
                  [&_td]:!p-4
                  [&_td]:!text-muted-foreground
                  [&_tr]:!bg-transparent
                  [&_img]:mx-auto
                  [&_img]:my-9
                  [&_img]:block
                  [&_img]:h-auto
                  [&_img]:max-w-full
                  [&_img]:rounded-[2rem]
                  [&_img]:border
                  [&_img]:border-border
                  [&_img]:shadow-[0_16px_50px_rgba(53,51,46,0.12)]
                  [&_p]:mb-5
                  [&_p]:leading-[1.9]
                  [&_p]:text-muted-foreground
                  [&_h2]:mb-5
                  [&_h2]:mt-12
                  [&_h2]:border-l-4
                  [&_h2]:border-accent
                  [&_h2]:pl-4
                  [&_h2]:text-2xl
                  [&_h2]:font-black
                  [&_h2]:text-foreground
                  [&_h3]:mt-8
                  [&_h3]:text-xl
                  [&_h3]:font-bold
                  [&_h3]:text-foreground
                  [&_li]:mb-2
                  [&_li]:leading-7
                  [&_li]:text-muted-foreground
                  [&_strong]:text-foreground
                  [&_a]:text-accent
                "
                dangerouslySetInnerHTML={{
                  __html: cleanedHtml,
                }}
              />
            ) : (
              post.body && (
                <PortableText
                  value={post.body as any}
                  components={ptComponents}
                />
              )
            )}
          </article>

          {/* 資訊聲明 */}
          <aside
            aria-label="網站內容聲明"
            className="mt-14 rounded-[2rem] border border-border/70 bg-secondary/60 px-6 py-6 text-sm leading-7 text-muted-foreground"
          >
            本站內容包含住宅室內設計資訊、空間規劃概念、
            裝潢風格提案與設計模擬圖片，主要供屋主尋找設計方向與裝潢靈感。
            部分圖片與內容不一定代表該建案之實際完工案例，也不等同正式施工圖。
            實際尺寸、材質、預算、法規、設計與施工內容，
            應由屋主與依法執業的設計、建築或室內裝修專業人員進一步確認。
          </aside>

          <ShareBar />

          {/* 延伸閱讀 */}
          {relatedPosts.length > 0 && (
            <section
              aria-labelledby="related-articles"
              className="mt-14 border-t border-border pt-10"
            >
              <p className="text-sm font-semibold tracking-[0.2em] text-accent">
                RELATED ARTICLES
              </p>

              <h2
                id="related-articles"
                className="mt-2 text-2xl font-black tracking-tight text-foreground"
              >
                延伸閱讀
              </h2>

              <div className="mt-6 divide-y divide-border overflow-hidden rounded-[2rem] border border-border bg-white/70 shadow-sm">
                {relatedPosts.map(
                  (relatedPost) => (
                    <article
                      key={relatedPost._id}
                    >
                      <Link
                        href={`/blog/${relatedPost.slug}`}
                        className="group flex items-center justify-between gap-5 px-6 py-5 transition-colors hover:bg-secondary/70"
                      >
                        <div>
                          <h3 className="font-semibold leading-7 text-foreground transition-colors group-hover:text-accent">
                            {relatedPost.title}
                          </h3>

                          {relatedPost.publishedAt && (
                            <time
                              dateTime={
                                relatedPost.publishedAt
                              }
                              className="mt-1 block text-xs text-muted-foreground"
                            >
                              {formatDate(
                                relatedPost.publishedAt
                              )}
                            </time>
                          )}
                        </div>

                        <span
                          aria-hidden="true"
                          className="shrink-0 text-accent transition-transform group-hover:translate-x-1"
                        >
                          →
                        </span>
                      </Link>
                    </article>
                  )
                )}
              </div>
            </section>
          )}

          {/* 返回文章列表 */}
          <div className="mt-12 border-t border-border pt-8">
            <Link
              href="/blog"
              className="inline-flex items-center text-sm font-semibold text-primary transition-colors hover:text-accent"
            >
              <span
                aria-hidden="true"
                className="mr-2"
              >
                ←
              </span>

              返回室內設計文章列表
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}