import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { Footer } from "@/components/footer";
import { PostThumbnail } from "@/components/post-thumbnail";
import { client } from "@/lib/sanity";

export const revalidate = 300;

const SITE_URL = "https://home.line88.tw";
const SITE_NAME = "台灣社會住宅包租代管資訊站";
const ORGANIZATION_ID = `${SITE_URL}/#organization`;
const WEBSITE_ID = `${SITE_URL}/#website`;
const POSTS_PER_PAGE = 9;
const TOP_TAG_LIMIT = 10;
const DEFAULT_OG_IMAGE = `${SITE_URL}/images/og-home.jpg`;

interface SearchParams {
  tag?: string;
  page?: string;
}

interface RawPost {
  id: string;
  title: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  mainImage?: string;
  htmlContent?: string;
  videoId?: string;
  tags?: string[];
  publishedAt: string;
}

interface Post extends RawPost {
  description: string;
  thumbnail: string;
  tags: string[];
}

interface TagItem {
  name: string;
  count: number;
}

function normalizeTag(tag?: string) {
  return String(tag || "").trim() || "全部";
}

function normalizePage(page?: string) {
  return Math.max(1, Number.parseInt(page || "1", 10) || 1);
}

function optimizeSanityImageUrl(url?: string) {
  if (!url) return "";
  if (!url.includes("cdn.sanity.io/images")) return url;
  if (url.includes("auto=format")) return url;

  return `${url}${url.includes("?") ? "&" : "?"}auto=format`;
}

function extractPlainText(html: string) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function processPost(post: RawPost): Post {
  const htmlContent = post.htmlContent || "";
  const firstImageMatch = htmlContent.match(
    /<img[^>]+src=["']([^"']+)["']/i,
  );
  const firstContentImage = optimizeSanityImageUrl(firstImageMatch?.[1]);

  const plainText = extractPlainText(htmlContent);
  const currentDescription = String(post.description || "").trim();
  const description =
    currentDescription && currentDescription !== "點擊閱讀詳情..."
      ? currentDescription
      : plainText
        ? `${plainText.slice(0, 110)}${plainText.length > 110 ? "…" : ""}`
        : "閱讀社會住宅包租代管、房東出租管理與租屋補助相關資訊。";

  const youtubeThumbnail = post.videoId
    ? `https://img.youtube.com/vi/${post.videoId}/maxresdefault.jpg`
    : "";

  return {
    ...post,
    description,
    thumbnail:
      firstContentImage ||
      youtubeThumbnail ||
      optimizeSanityImageUrl(post.imageUrl) ||
      optimizeSanityImageUrl(post.mainImage) ||
      "",
    tags: Array.isArray(post.tags)
      ? post.tags.map((tag) => String(tag).trim()).filter(Boolean)
      : [],
  };
}

function buildBlogPath(tag: string, page = 1) {
  const params = new URLSearchParams();

  if (tag !== "全部") {
    params.set("tag", tag);
  }

  if (page > 1) {
    params.set("page", String(page));
  }

  const query = params.toString();

  return query ? `/blog?${query}` : "/blog";
}

function buildBlogUrl(tag: string, page = 1) {
  return `${SITE_URL}${buildBlogPath(tag, page)}`;
}

function formatPublishedDate(date: string) {
  return new Intl.DateTimeFormat("zh-TW", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: "Asia/Taipei",
  }).format(new Date(date));
}

function getVisiblePageNumbers(currentPage: number, totalPages: number) {
  const pages = new Set<number>([
    1,
    totalPages,
    currentPage - 1,
    currentPage,
    currentPage + 1,
  ]);

  return Array.from(pages)
    .filter((page) => page >= 1 && page <= totalPages)
    .sort((a, b) => a - b);
}

function serializeJsonLd(data: unknown) {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}): Promise<Metadata> {
  const params = await searchParams;
  const selectedTag = normalizeTag(params.tag);
  const page = normalizePage(params.page);

  const baseTitle =
    selectedTag === "全部"
      ? "社會住宅包租代管文章"
      : `${selectedTag}相關文章`;

  const title = page > 1 ? `${baseTitle}｜第 ${page} 頁` : baseTitle;

  const description =
    selectedTag === "全部"
      ? "整理社會住宅包租代管、公益出租人、房東出租、租屋補助、租客權益與房屋出租管理相關文章。"
      : `整理「${selectedTag}」相關資訊，包含社會住宅包租代管、房東出租管理、租屋補助與租客權益文章。`;

  const canonicalUrl = buildBlogUrl(selectedTag, page);

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
          alt: SITE_NAME,
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
  };
}

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const selectedTag = normalizeTag(params.tag);
  const page = normalizePage(params.page);
  const tagFilter = selectedTag !== "全部" ? "&& $selectedTag in tags" : "";
  const start = (page - 1) * POSTS_PER_PAGE;
  const end = start + POSTS_PER_PAGE;

  const [allTagsRaw, totalPosts, rawPosts] = await Promise.all([
    client.fetch<Array<{ tags?: string[] }>>(
      `*[_type == "post"]{ tags }`,
      {},
      { next: { revalidate } },
    ),
    client.fetch<number>(
      `count(*[_type == "post" ${tagFilter}])`,
      { selectedTag },
      { next: { revalidate } },
    ),
    client.fetch<RawPost[]>(
      `*[_type == "post" ${tagFilter}]
        | order(coalesce(publishedAt, _createdAt) desc)
        [$start...$end] {
          "id": _id,
          title,
          "slug": slug.current,
          description,
          "imageUrl": imageUrl,
          "mainImage": mainImage.asset->url,
          htmlContent,
          "videoId": youtubeVideoId,
          "tags": tags,
          "publishedAt": coalesce(publishedAt, _createdAt)
        }`,
      { start, end, selectedTag },
      { next: { revalidate } },
    ),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalPosts / POSTS_PER_PAGE));

  if (totalPosts > 0 && page > totalPages) {
    redirect(buildBlogPath(selectedTag, totalPages));
  }

  const tagCountMap = new Map<string, number>();

  allTagsRaw.forEach((post) => {
    if (!Array.isArray(post.tags)) return;

    post.tags.forEach((tag) => {
      const cleanTag = String(tag || "").trim();

      if (!cleanTag) return;

      tagCountMap.set(cleanTag, (tagCountMap.get(cleanTag) || 0) + 1);
    });
  });

  const sortedTags: TagItem[] = Array.from(tagCountMap.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, "zh-Hant"));

  const topTags = sortedTags.slice(0, TOP_TAG_LIMIT);
  const selectedTagItem =
    selectedTag !== "全部" && !topTags.some((tag) => tag.name === selectedTag)
      ? sortedTags.find((tag) => tag.name === selectedTag)
      : undefined;

  const visibleTags: TagItem[] = [
    { name: "全部", count: allTagsRaw.length },
    ...topTags,
    ...(selectedTagItem ? [selectedTagItem] : []),
  ];

  const posts = rawPosts.map(processPost);
  const pageNumbers = getVisiblePageNumbers(page, totalPages);
  const canonicalUrl = buildBlogUrl(selectedTag, page);
  const pageTitle =
    selectedTag === "全部" ? "最新文章" : `${selectedTag}相關文章`;
  const pageDescription =
    selectedTag === "全部"
      ? "社會住宅包租代管、公益出租人、房東出租、租屋補助、租客權益與房屋出租管理資訊。"
      : `瀏覽「${selectedTag}」相關的社會住宅包租代管與住宅租賃文章。`;

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
      name: "文章",
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
  ];

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
        inLanguage: "zh-Hant",
        isPartOf: {
          "@id": WEBSITE_ID,
        },
        about: {
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
        itemListOrder: "https://schema.org/ItemListOrderDescending",
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
            inLanguage: "zh-Hant",
            ...(post.thumbnail ? { image: post.thumbnail } : {}),
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
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }}
      />

      <main className="px-6 pb-20 pt-28 md:pt-36">
        <div className="mx-auto max-w-6xl">
          <header className="max-w-3xl">
            <nav aria-label="麵包屑" className="mb-5 text-sm text-muted-foreground">
              <ol className="flex flex-wrap items-center gap-2">
                <li>
                  <Link href="/" className="transition-colors hover:text-primary">
                    首頁
                  </Link>
                </li>
                <li aria-hidden="true">/</li>
                <li>
                  {selectedTag === "全部" ? (
                    <span aria-current="page">文章</span>
                  ) : (
                    <Link
                      href="/blog"
                      className="transition-colors hover:text-primary"
                    >
                      文章
                    </Link>
                  )}
                </li>
                {selectedTag !== "全部" && (
                  <>
                    <li aria-hidden="true">/</li>
                    <li aria-current="page">{selectedTag}</li>
                  </>
                )}
              </ol>
            </nav>

            <h1 className="text-3xl font-black tracking-tight md:text-5xl">
              {pageTitle}
            </h1>

            <p className="mt-4 max-w-2xl leading-8 text-muted-foreground">
              {pageDescription}
            </p>

            <p className="mt-3 text-sm text-muted-foreground">
              共 {totalPosts} 篇
              {page > 1 ? `，目前第 ${page} 頁` : ""}
            </p>
          </header>

          <nav
            aria-label="文章主題"
            className="mt-10 border-y border-border/70 py-5"
          >
            <div className="flex flex-wrap gap-x-5 gap-y-3">
              {visibleTags.map((tagItem) => {
                const isActive = selectedTag === tagItem.name;

                return (
                  <Link
                    key={tagItem.name}
                    href={buildBlogPath(tagItem.name)}
                    aria-current={isActive ? "page" : undefined}
                    className={`text-sm font-semibold transition-colors ${
                      isActive
                        ? "text-primary"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {tagItem.name}
                    <span className="ml-1 font-normal opacity-60">
                      {tagItem.count}
                    </span>
                  </Link>
                );
              })}
            </div>
          </nav>

          {posts.length > 0 ? (
            <section
              aria-label={pageTitle}
              className="mt-10 grid grid-cols-1 gap-x-7 gap-y-12 md:grid-cols-2 lg:grid-cols-3"
            >
              {posts.map((post) => (
                <article key={post.id} className="group min-w-0">
                  <PostThumbnail
                    slug={post.slug}
                    title={post.title}
                    thumbnail={post.thumbnail}
                    videoId={post.videoId}
                  />

                  <div className="pt-5">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-muted-foreground">
                      <time dateTime={post.publishedAt}>
                        {formatPublishedDate(post.publishedAt)}
                      </time>

                      {post.tags.slice(0, 2).map((tag) => (
                        <Link
                          key={tag}
                          href={buildBlogPath(tag)}
                          className="font-medium text-primary transition-opacity hover:opacity-70"
                        >
                          {tag}
                        </Link>
                      ))}
                    </div>

                    <h2 className="mt-3 line-clamp-2 text-xl font-black leading-snug">
                      <Link
                        href={`/blog/${post.slug}`}
                        className="transition-colors group-hover:text-primary"
                      >
                        {post.title}
                      </Link>
                    </h2>

                    <p className="mt-3 line-clamp-3 text-sm leading-7 text-muted-foreground">
                      {post.description}
                    </p>

                    <Link
                      href={`/blog/${post.slug}`}
                      aria-label={`閱讀：${post.title}`}
                      className="mt-4 inline-flex text-sm font-semibold text-primary"
                    >
                      閱讀全文
                      <span aria-hidden="true" className="ml-1">
                        →
                      </span>
                    </Link>
                  </div>
                </article>
              ))}
            </section>
          ) : (
            <section className="mt-12 border-y border-border/70 py-20 text-center">
              <h2 className="text-xl font-black">目前沒有相關文章</h2>

              <p className="mt-3 text-sm leading-7 text-muted-foreground">
                可返回全部文章，瀏覽社會住宅包租代管、房東出租與租屋補助資訊。
              </p>

              {selectedTag !== "全部" && (
                <Link
                  href="/blog"
                  className="mt-6 inline-flex font-semibold text-primary"
                >
                  查看全部文章
                </Link>
              )}
            </section>
          )}

          {totalPages > 1 && (
            <nav
              aria-label="文章分頁"
              className="mt-16 flex flex-wrap items-center justify-center gap-2"
            >
              {page > 1 && (
                <Link
                  href={buildBlogPath(selectedTag, page - 1)}
                  rel="prev"
                  className="rounded-full border border-border px-5 py-2.5 text-sm font-semibold transition-colors hover:border-primary hover:text-primary"
                >
                  上一頁
                </Link>
              )}

              {pageNumbers.map((pageNumber, index) => {
                const previousPageNumber = pageNumbers[index - 1];
                const hasGap =
                  previousPageNumber !== undefined &&
                  pageNumber - previousPageNumber > 1;

                return (
                  <div key={pageNumber} className="contents">
                    {hasGap && (
                      <span
                        aria-hidden="true"
                        className="px-1 text-muted-foreground"
                      >
                        …
                      </span>
                    )}

                    <Link
                      href={buildBlogPath(selectedTag, pageNumber)}
                      aria-current={page === pageNumber ? "page" : undefined}
                      aria-label={`第 ${pageNumber} 頁`}
                      className={`flex h-10 min-w-10 items-center justify-center rounded-full px-3 text-sm font-semibold transition-colors ${
                        page === pageNumber
                          ? "bg-primary text-primary-foreground"
                          : "border border-border hover:border-primary hover:text-primary"
                      }`}
                    >
                      {pageNumber}
                    </Link>
                  </div>
                );
              })}

              {page < totalPages && (
                <Link
                  href={buildBlogPath(selectedTag, page + 1)}
                  rel="next"
                  className="rounded-full border border-border px-5 py-2.5 text-sm font-semibold transition-colors hover:border-primary hover:text-primary"
                >
                  下一頁
                </Link>
              )}
            </nav>
          )}

          <aside className="mt-16 border-t border-border/70 pt-6 text-sm leading-7 text-muted-foreground">
            本站為凌群不動產建立並經營的民間資訊網站，非政府官方網站。
            政策資格、補助金額與申請辦法，請以中央及地方政府最新公告為準。
          </aside>
        </div>
      </main>

      <Footer />
    </div>
  );
}
