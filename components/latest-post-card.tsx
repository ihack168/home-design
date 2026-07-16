"use client";

import { useState } from "react";
import Link from "next/link";

export interface LatestPost {
  id: string;
  title: string;
  slug: string;
  description: string;
  thumbnail: string;
  videoId?: string;
  tags: string[];
  publishedAt: string;
}

interface LatestPostCardProps {
  post: LatestPost;
}

export function LatestPostCard({ post }: LatestPostCardProps) {
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  const articleUrl = `/blog/${post.slug}`;

  return (
    <article className="group overflow-hidden rounded-3xl border border-white/10 bg-white/[0.055] backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-[#ff8800]/60 hover:shadow-[0_0_34px_rgba(255,136,0,0.18)]">
      <div className="relative h-[160px] w-full overflow-hidden bg-black md:h-[175px]">
        {isVideoPlaying && post.videoId ? (
          <iframe
            src={`https://www.youtube.com/embed/${post.videoId}?autoplay=1`}
            title={`${post.title} 影片`}
            className="h-full w-full border-none"
            allow="autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <div className="relative h-full w-full">
            <Link
              href={articleUrl}
              className="block h-full w-full overflow-hidden"
              aria-label={`閱讀文章：${post.title}`}
            >
              {post.thumbnail ? (
                <img
                  src={post.thumbnail}
                  alt={post.title}
                  width={600}
                  height={350}
                  className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                  loading="lazy"
                  decoding="async"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-white/5 text-sm text-white/40">
                  暫無圖片
                </div>
              )}
            </Link>

            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-white/5" />

            {post.videoId && (
              <button
                type="button"
                onClick={() => setIsVideoPlaying(true)}
                className="absolute inset-0 m-auto flex h-11 w-14 items-center justify-center rounded-2xl bg-white/90 shadow-xl backdrop-blur transition duration-300 hover:scale-110"
                aria-label={`播放影片：${post.title}`}
              >
                <span className="ml-1 border-y-[9px] border-l-[15px] border-y-transparent border-l-[#ff8800]" />
              </button>
            )}
          </div>
        )}
      </div>

      <div className="flex min-h-[210px] flex-col p-5">
        {post.tags.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-2">
            {post.tags.slice(0, 2).map((tag) => (
              <Link
                key={tag}
                href={`/blog?tag=${encodeURIComponent(tag)}`}
                className="rounded-full border border-[#ff8800]/25 bg-[#ff8800]/10 px-2.5 py-1 text-xs font-bold text-[#ff8800] transition hover:bg-[#ff8800] hover:text-black"
              >
                #{tag}
              </Link>
            ))}
          </div>
        )}

        <Link href={articleUrl}>
          <h3 className="line-clamp-2 text-lg font-black leading-snug text-white transition group-hover:text-[#ff8800]">
            {post.title}
          </h3>
        </Link>

        <p className="mt-2 line-clamp-2 text-sm leading-6 text-gray-400">
          {post.description}
        </p>

        <div className="mt-auto pt-4">
          <Link
            href={articleUrl}
            className="inline-flex items-center text-sm font-bold text-[#ff8800]"
            aria-label={`閱讀完整文章：${post.title}`}
          >
            閱讀文章

            <span className="ml-2 transition group-hover:translate-x-1">
              →
            </span>
          </Link>
        </div>
      </div>
    </article>
  );
}