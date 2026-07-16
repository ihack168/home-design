import { client } from "@/lib/sanity"
import { createImageUrlBuilder } from "@sanity/image-url"
import { PortableText } from "@portabletext/react"
import { Footer } from "@/components/footer"
import { notFound } from "next/navigation"
import { ShareBar } from "@/components/share-bar"
import Link from "next/link"
import type { Metadata } from "next"
import { sanitizePostHtml } from "@/lib/content-cleanup"

export const revalidate = 0
export const dynamic = "force-dynamic"

const siteName = "台灣社會住宅包租代管資訊站"
const shortSiteName = "社會住宅包租代管資訊站"
const siteUrl = "https://home.line88.tw"
const defaultAuthorName = "凌群不動產"

const builder = createImageUrlBuilder(client)

function urlFor(source: unknown) {
  if (!source) return { url: () => "" }
  return builder.image(source)
}

function optimizeSanityImages(html?: string) {
  if (!html) return ""

  return html.replace(
    /(https:\/\/cdn\.sanity\.io\/images\/[^"' )<>]+)/g,
    (url) => {
      if (url.includes("auto=format")) return url
      return `${url}${url.includes("?") ? "&" : "?"}auto=format`
    }
  )
}

function decodeHtmlEntities(value: string) {
  return value
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
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

  return `${imageUrl}${separator}w=1200&h=630&fit=crop&auto=format`
}

function stripHtml(value?: string) {
  if (!value) return ""

  return value
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

function removeRepeatedTitle(text: string, title: string) {
  const normalizedText = text.trim()
  const normalizedTitle = title.trim()

  if (!normalizedText || !normalizedTitle) return normalizedText

  if (normalizedText.startsWith(normalizedTitle)) {
    return normalizedText.slice(normalizedTitle.length).replace(/^[\s：:｜|\-–—]+/, "")
  }

  return normalizedText
}

function removeLeadingDuplicateHeading(htmlContent: string, title: string) {
  if (!htmlContent || !title) return htmlContent

  const normalizedTitle = title
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
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
        .replace(/&quot;/gi, '"')
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
  const supplied = removeRepeatedTitle(stripHtml(description), title)

  if (supplied && supplied !== "點擊閱讀詳情...") {
    return `${supplied.slice(0, 137)}${supplied.length > 137 ? "..." : ""}`
  }

  const fromHtml = removeRepeatedTitle(stripHtml(htmlContent), title)

  if (fromHtml) {
    return `${fromHtml.slice(0, 137)}${fromHtml.length > 137 ? "..." : ""}`
  }

  return `${title}｜${shortSiteName}`
}

function formatDate(date?: string) {
  if (!date) return null

  const parsed = new Date(date)
  if (Number.isNaN(parsed.getTime())) return null

  return parsed.toLocaleDateString("zh-TW", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

function toIsoDate(date?: string) {
  if (!date) return undefined

  const parsed = new Date(date)
  if (Number.isNaN(parsed.getTime())) return undefined

  return parsed.toISOString()
}

interface PostMetadataResult {
  title?: string
  description?: string
  htmlContent?: string
  publishedAt?: string
  _updatedAt?: string
  mainImage?: unknown
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
            alt={value.alt || "文章圖片"}
            className="h-auto w-full rounded-[2rem] border border-border shadow-[0_16px_50px_rgba(120,80,70,0.12)]"
            loading="lazy"
            decoding="async"
          />

          {value.caption && (
            <figcaption className="mt-3 text-center text-sm text-muted-foreground">
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

  const post = await client.fetch<PostMetadataResult | null>(
    `*[_type == "post" && slug.current == $slug][0]{
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
    { slug },
    { cache: "no-store" }
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

  const firstHtmlImage = extractFirstImageFromHtml(post.htmlContent)

  const ogImage = firstHtmlImage
    ? buildSocialImageUrl(firstHtmlImage)
    : post.mainImage
      ? urlFor(post.mainImage)
          .width(1200)
          .height(630)
          .fit("crop")
          .auto("format")
          .url()
      : ""

  const publishedTime = toIsoDate(post.publishedAt)
  const rawModifiedTime = toIsoDate(post._updatedAt || post.publishedAt)
  const modifiedTime =
    publishedTime &&
    rawModifiedTime &&
    new Date(rawModifiedTime).getTime() < new Date(publishedTime).getTime()
      ? publishedTime
      : rawModifiedTime

  const authorName = post.authorName || defaultAuthorName
  const tags = Array.isArray(post.tags) ? post.tags.filter(Boolean) : []

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

    category: tags[0] || "社會住宅包租代管",

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
      section: tags[0] || "社會住宅包租代管",
      tags,
      images: ogImage
        ? [
            {
              url: ogImage,
              width: 1200,
              height: 630,
              alt: post.title,
            },
          ]
        : [],
    },

    twitter: {
      card: "summary_large_image",
      title: post.title,
      description,
      images: ogImage ? [ogImage] : [],
    },
  }
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  const post = await client.fetch<PostResult | null>(
    `*[_type == "post" && slug.current == $slug][0]{
      _id,
      title,
      description,
      "slug": slug.current,
      publishedAt,
      _updatedAt,
      mainImage,
      body,
      htmlContent,
      "authorName": author->name,
      "authorSlug": author->slug.current,
      "tags": coalesce(categories[]->title, tags)
    }`,
    { slug },
    { cache: "no-store" }
  )

  if (!post?.title) notFound()

  const tags = Array.isArray(post.tags) ? post.tags.filter(Boolean) : []
  const displayedTags = tags.slice(0, 2)
  const authorName = post.authorName || defaultAuthorName
  const authorUrl = post.authorSlug
    ? `/authors/${post.authorSlug}`
    : "/"

  const description = buildDescription(
    post.description,
    post.htmlContent,
    post.title
  )

  const publishedIso = toIsoDate(post.publishedAt)

  const rawModifiedIso = toIsoDate(post._updatedAt || post.publishedAt)
  const modifiedIso =
    publishedIso &&
    rawModifiedIso &&
    new Date(rawModifiedIso).getTime() < new Date(publishedIso).getTime()
      ? publishedIso
      : rawModifiedIso

  const publishedDate = formatDate(publishedIso)
  const modifiedDate = formatDate(modifiedIso)
  const canonicalUrl = `${siteUrl}/blog/${slug}`

  const mainImageUrl = post.mainImage
    ? urlFor(post.mainImage)
        .width(1600)
        .fit("max")
        .auto("format")
        .url()
    : undefined

  const firstHtmlImage = extractFirstImageFromHtml(post.htmlContent)

  const structuredImageUrl = firstHtmlImage
    ? buildSocialImageUrl(firstHtmlImage)
    : post.mainImage
      ? urlFor(post.mainImage)
          .width(1200)
          .height(630)
          .fit("crop")
          .auto("format")
          .url()
      : ""

  const optimizedHtml = optimizeSanityImages(post.htmlContent)
  const sanitizedHtml = optimizedHtml
    ? sanitizePostHtml(optimizedHtml, post.title, Boolean(post.mainImage))
    : ""

  const cleanedHtml = sanitizedHtml
    ? removeLeadingDuplicateHeading(sanitizedHtml, post.title)
    : ""

  const relatedPosts = await client.fetch<RelatedPost[]>(
    `*[
      _type == "post"
      && _id != $postId
      && defined(slug.current)
      && count(coalesce(categories[]->title, tags)[@ in $tags]) > 0
    ]
    | order(
        count(coalesce(categories[]->title, tags)[@ in $tags]) desc,
        coalesce(publishedAt, _createdAt) desc
      )[0...3]{
        _id,
        title,
        "slug": slug.current,
        "publishedAt": coalesce(publishedAt, _createdAt)
      }`,
    {
      postId: post._id,
      tags,
    },
    { cache: "no-store" }
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
    ...(structuredImageUrl
      ? {
          image: {
            "@type": "ImageObject",
            url: structuredImageUrl,
            width: 1200,
            height: 630,
          },
        }
      : {}),
    articleSection: tags[0] || "社會住宅包租代管",
    keywords: tags,
    about: tags.map((tag) => ({
      "@type": "Thing",
      name: tag,
    })),
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
        name: "最新文章",
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
          __html: JSON.stringify(blogPostingJsonLd),
        }}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd),
        }}
      />

      <main className="px-5 pb-20 pt-28 md:px-6 md:pt-32">
        <div className="mx-auto max-w-3xl">
          <nav
            aria-label="麵包屑導覽"
            className="mb-7 flex items-center gap-2 overflow-hidden text-xs text-muted-foreground"
          >
            <Link href="/" className="transition-colors hover:text-primary">
              首頁
            </Link>

            <span aria-hidden="true">/</span>

            <Link href="/blog" className="transition-colors hover:text-primary">
              最新文章
            </Link>

            <span aria-hidden="true">/</span>

            <span
              aria-current="page"
              className="truncate text-foreground"
            >
              {post.title}
            </span>
          </nav>

          {displayedTags.length > 0 && (
            <div className="mb-4 flex flex-wrap gap-2">
              {displayedTags.map((tag) => (
                <Link
                  key={tag}
                  href={`/blog?tag=${encodeURIComponent(tag)}`}
                  className="rounded-full bg-primary/8 px-3 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary/15"
                >
                  #{tag}
                </Link>
              ))}
            </div>
          )}

          <h1 className="mb-5 text-4xl font-bold leading-tight tracking-tight text-foreground md:text-5xl">
            {post.title}
          </h1>

          <div className="mb-10 flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-border pb-6 text-sm text-muted-foreground">
            <span>
              撰文者：
              <Link
                href={authorUrl}
                rel="author"
                className="font-medium text-foreground transition-colors hover:text-primary"
              >
                {authorName}
              </Link>
            </span>

            {publishedDate && (
              <>
                <span className="text-border" aria-hidden="true">
                  |
                </span>
                <time dateTime={publishedIso}>發布於 {publishedDate}</time>
              </>
            )}

            {modifiedDate &&
              modifiedIso &&
              publishedIso &&
              modifiedIso !== publishedIso && (
                <>
                  <span className="text-border" aria-hidden="true">
                    |
                  </span>
                  <time dateTime={modifiedIso}>更新於 {modifiedDate}</time>
                </>
              )}
          </div>

          {mainImageUrl && (
            <figure className="mb-16 overflow-hidden rounded-[2rem] border border-border bg-white shadow-[0_20px_70px_rgba(120,80,70,0.12)]">
              <img
                src={mainImageUrl}
                alt={post.title}
                className="h-auto w-full object-cover"
                fetchPriority="high"
                decoding="async"
              />
            </figure>
          )}

          <article
            className="
              prose max-w-none
              prose-lg
              prose-p:mb-5 prose-p:leading-[1.9] prose-p:text-muted-foreground
              prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-foreground
              prose-h2:mt-10 prose-h2:mb-5 prose-h2:border-l-4 prose-h2:border-primary prose-h2:pl-4 prose-h2:text-2xl
              prose-h3:mt-7 prose-h3:text-xl
              prose-strong:font-bold prose-strong:text-foreground
              prose-a:text-primary prose-a:no-underline hover:prose-a:opacity-70
              prose-ul:rounded-2xl prose-ul:border prose-ul:border-border prose-ul:bg-white/60 prose-ul:p-6
              prose-li:text-muted-foreground prose-li:marker:text-primary
              prose-table:my-10 prose-table:block prose-table:overflow-x-auto prose-table:border-collapse
              prose-thead:bg-primary/10 prose-th:border prose-th:border-border prose-th:p-4 prose-th:text-primary
              prose-td:border prose-td:border-border prose-td:p-4 prose-td:text-muted-foreground
              prose-img:rounded-[2rem] prose-img:border prose-img:border-border
              prose-blockquote:rounded-r-2xl prose-blockquote:border-l-primary prose-blockquote:bg-white/70 prose-blockquote:px-6 prose-blockquote:py-3 prose-blockquote:text-muted-foreground
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
                  [&_th]:!bg-primary/10
                  [&_th]:!p-4
                  [&_th]:!text-primary
                  [&_td]:!border
                  [&_td]:!border-border
                  [&_td]:!p-4
                  [&_td]:!text-muted-foreground
                  [&_tr]:!bg-transparent
                  [&_img]:mx-auto
                  [&_img]:my-8
                  [&_img]:block
                  [&_img]:rounded-[2rem]
                  [&_img]:border
                  [&_img]:border-border
                  [&_img]:shadow-[0_16px_50px_rgba(120,80,70,0.12)]
                  [&_p]:mb-5
                  [&_p]:leading-[1.9]
                  [&_p]:text-muted-foreground
                  [&_h2]:mt-10
                  [&_h2]:mb-5
                  [&_h2]:border-l-4
                  [&_h2]:border-primary
                  [&_h2]:pl-4
                  [&_h2]:text-2xl
                  [&_h2]:font-bold
                  [&_h2]:text-foreground
                  [&_h3]:mt-7
                  [&_h3]:text-xl
                  [&_h3]:font-bold
                  [&_h3]:text-foreground
                  [&_li]:mb-1
                  [&_li]:text-muted-foreground
                  [&_strong]:text-foreground
                "
                dangerouslySetInnerHTML={{ __html: cleanedHtml }}
              />
            ) : (
              post.body && (
                <PortableText value={post.body as any} components={ptComponents} />
              )
            )}
          </article>

          <aside
            aria-label="網站資訊聲明"
            className="mt-12 border-t border-border pt-5 text-sm leading-7 text-muted-foreground"
          >
            本站由凌群不動產建立並經營，屬民間資訊網站，並非政府官方網站。
            社會住宅包租代管、租屋補助、公益出租人與相關政策資格，請以中央及地方政府最新公告為準。
          </aside>

          <ShareBar />

          {relatedPosts.length > 0 && (
            <section
              aria-labelledby="related-articles"
              className="mt-14 border-t border-border pt-8"
            >
              <h2
                id="related-articles"
                className="text-2xl font-bold tracking-tight"
              >
                延伸閱讀
              </h2>

              <div className="mt-5 divide-y divide-border rounded-2xl border border-border bg-white/60">
                {relatedPosts.map((relatedPost) => (
                  <article key={relatedPost._id}>
                    <Link
                      href={`/blog/${relatedPost.slug}`}
                      className="flex items-center justify-between gap-5 px-5 py-4 transition-colors hover:bg-primary/5"
                    >
                      <h3 className="font-semibold leading-7 text-foreground">
                        {relatedPost.title}
                      </h3>

                      <span
                        aria-hidden="true"
                        className="flex-shrink-0 text-primary"
                      >
                        →
                      </span>
                    </Link>
                  </article>
                ))}
              </div>
            </section>
          )}

          <div className="mt-12 border-t border-border pt-7">
            <Link
              href="/blog"
              className="text-sm font-semibold text-primary transition-opacity hover:opacity-70"
            >
              ← 返回文章列表
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
