import Link from "next/link"

export interface LatestPost {
  id: string
  title: string
  slug: string
  description: string
  thumbnail: string
  videoId?: string
  tags: string[]
  publishedAt: string
}

interface LatestPostCardProps {
  post: LatestPost
}

export function LatestPostCard({ post }: LatestPostCardProps) {
  const articleUrl = `/blog/${post.slug}`

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-[2rem] border border-border/70 bg-white/80 shadow-[0_10px_40px_rgba(53,51,46,0.08)] backdrop-blur transition-all duration-500 hover:-translate-y-1.5 hover:border-accent/40 hover:shadow-[0_20px_60px_rgba(53,51,46,0.14)]">
      {/* 文章圖片 */}
      <Link
        href={articleUrl}
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

        {/* 圖片漸層 */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-white/5"
        />

        {/* 影片文章標誌 */}
        {post.videoId && (
          <span
            aria-hidden="true"
            className="absolute inset-0 flex items-center justify-center"
          >
            <span className="flex h-12 w-16 items-center justify-center rounded-2xl bg-white/90 shadow-xl backdrop-blur transition-transform duration-300 group-hover:scale-110">
              <span className="ml-1 border-y-[10px] border-l-[16px] border-y-transparent border-l-accent" />
            </span>
          </span>
        )}
      </Link>

      {/* 文章內容 */}
      <div className="flex min-h-[250px] flex-1 flex-col p-6">
        {post.tags.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-2">
            {post.tags.slice(0, 3).map((tag) => (
              <Link
                key={tag}
                href={`/blog?tag=${encodeURIComponent(tag)}`}
                className="rounded-full border border-accent/20 bg-accent/5 px-3 py-1 text-xs font-semibold text-accent transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                #{tag}
              </Link>
            ))}
          </div>
        )}

        <Link href={articleUrl}>
          <h3 className="line-clamp-2 text-xl font-bold leading-snug text-foreground transition-colors group-hover:text-accent">
            {post.title}
          </h3>
        </Link>

        <p className="mt-4 line-clamp-3 text-sm leading-7 text-muted-foreground">
          {post.description}
        </p>

        <div className="mt-auto pt-6">
          <Link
            href={articleUrl}
            className="inline-flex items-center text-sm font-semibold text-primary transition-colors hover:text-accent"
            aria-label={`閱讀完整文章：${post.title}`}
          >
            閱讀完整文章

            <span className="ml-2 transition-transform duration-300 group-hover:translate-x-1">
              →
            </span>
          </Link>
        </div>
      </div>
    </article>
  )
}