"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { client } from "@/lib/sanity";

interface Post {
  id: string;
  title: string;
  slug: string;
  description: string;
  thumbnail: string;
  videoId?: string;
  tags: string[];
  publishedAt: string;
  htmlContent?: string;
}

function optimizeSanityImageUrl(url?: string) {
  if (!url) return "";

  if (!url.includes("cdn.sanity.io/images")) return url;

  if (url.includes("auto=format")) return url;

  return `${url}${url.includes("?") ? "&" : "?"}auto=format`;
}

export function LatestPostsSection() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [activeVideo, setActiveVideo] = useState<string | null>(null);

  useEffect(() => {
    async function fetchLatestPosts() {
      setLoadingPosts(true);

      try {
        const result = await client.fetch(
          `*[_type == "post"] | order(_createdAt desc) [0...6] {
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
          {},
          { cache: "no-store" }
        );

        const processedPosts = result.map((post: any) => {
          let extractedImg = "";
          let extractedDesc = post.description || "";

          if (post.htmlContent) {
            const imgMatch = post.htmlContent.match(/<img[^>]+src="([^">]+)"/);

            if (imgMatch && imgMatch[1]) {
              extractedImg = optimizeSanityImageUrl(imgMatch[1]);
            }

            if (!extractedDesc || extractedDesc === "點擊閱讀詳情...") {
              const pureText = post.htmlContent
                .replace(/<[^>]*>?/gm, "")
                .trim();

              extractedDesc =
                pureText.substring(0, 100) +
                (pureText.length > 100 ? "..." : "");
            }
          }

          if (!extractedDesc) extractedDesc = "點擊閱讀詳情...";

          const youtubeThumb = post.videoId
            ? `https://img.youtube.com/vi/${post.videoId}/maxresdefault.jpg`
            : "";

          return {
            ...post,
            thumbnail:
              extractedImg ||
              youtubeThumb ||
              optimizeSanityImageUrl(post.imageUrl) ||
              optimizeSanityImageUrl(post.mainImage) ||
              "",
            description: extractedDesc,
            tags: Array.isArray(post.tags) ? post.tags : [],
          };
        });

        setPosts(processedPosts);
      } catch (err) {
        console.error("首頁文章抓取失敗:", err);
      } finally {
        setLoadingPosts(false);
      }
    }

    fetchLatestPosts();
  }, []);

  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <div className="mb-10 flex flex-col gap-4 text-center md:flex-row md:items-end md:justify-between md:text-left">
        <div>
          <p className="text-sm font-semibold tracking-[0.2em] text-primary">
            LATEST ARTICLES
          </p>

          <h2 className="mt-3 text-2xl font-black text-foreground md:text-4xl">
            最新文章
          </h2>

          <p className="mt-4 max-w-2xl text-base leading-8 text-muted-foreground">
            整理社會住宅包租代管、房東出租、租屋補助與租務管理相關資訊。
          </p>
        </div>

        <Link
          href="/blog"
          className="inline-flex justify-center rounded-full border border-border bg-white/70 px-6 py-3 text-sm font-semibold text-muted-foreground shadow-sm transition-all hover:border-primary/40 hover:text-primary"
        >
          查看全部文章 →
        </Link>
      </div>

      {loadingPosts ? (
        <div className="flex justify-center py-24">
          <div className="h-12 w-12 animate-spin rounded-full border-2 border-primary/20 border-t-primary" />
        </div>
      ) : posts.length > 0 ? (
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {posts.map((post) => (
            <article
              key={post.id}
              className="group overflow-hidden rounded-[2rem] border border-border/70 bg-white/80 shadow-[0_10px_40px_rgba(120,80,70,0.08)] backdrop-blur transition-all duration-500 hover:-translate-y-1.5 hover:border-primary/30 hover:shadow-[0_20px_60px_rgba(217,143,143,0.14)]"
            >
              <div className="relative aspect-video w-full overflow-hidden bg-muted">
                {activeVideo === post.id && post.videoId ? (
                  <iframe
                    src={`https://www.youtube.com/embed/${post.videoId}?autoplay=1`}
                    className="h-full w-full border-none"
                    allow="autoplay; encrypted-media"
                    allowFullScreen
                  />
                ) : (
                  <div className="relative h-full w-full">
                    <Link
                      href={`/blog/${post.slug}`}
                      className="block h-full w-full overflow-hidden"
                    >
                      {post.thumbnail ? (
                        <img
                          src={post.thumbnail}
                          alt={post.title}
                          className="h-full w-full object-cover transition-all duration-700 group-hover:scale-105"
                          loading="lazy"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-secondary text-sm text-muted-foreground">
                          暫無圖片
                        </div>
                      )}
                    </Link>

                    {post.videoId && (
                      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                        <div
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setActiveVideo(post.id);
                          }}
                          className="pointer-events-auto flex h-12 w-16 cursor-pointer items-center justify-center rounded-2xl bg-white/90 shadow-xl backdrop-blur transition-transform duration-300 group-hover:scale-110"
                        >
                          <div className="ml-1 border-y-[10px] border-l-[16px] border-y-transparent border-l-primary" />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex min-h-[260px] flex-col p-6">
                <div className="mb-4 flex flex-wrap gap-2">
                  {post.tags?.map((tag) => (
                    <Link
                      key={tag}
                      href={`/blog?tag=${encodeURIComponent(tag)}`}
                      className="rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary transition-all hover:bg-primary hover:text-primary-foreground"
                    >
                      #{tag}
                    </Link>
                  ))}
                </div>

                <Link href={`/blog/${post.slug}`}>
                  <h2 className="line-clamp-2 text-xl font-bold leading-snug text-foreground transition-colors group-hover:text-primary">
                    {post.title}
                  </h2>
                </Link>

                <p className="mt-4 line-clamp-3 text-sm leading-7 text-muted-foreground">
                  {post.description}
                </p>

                <div className="mt-auto pt-6">
                  <Link
                    href={`/blog/${post.slug}`}
                    className="inline-flex items-center text-sm font-semibold text-primary"
                  >
                    閱讀文章
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
            暫時沒有最新文章
          </p>

          <p className="mt-3 text-sm text-muted-foreground">
            之後會陸續分享社會住宅、包租代管與租屋補助相關內容。
          </p>
        </div>
      )}
    </section>
  );
}