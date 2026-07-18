"use client"

import { useState } from "react"

interface YouTubeCoverPlayerProps {
  videoId: string
  posterImage?: string
  title: string
}

export function YouTubeCoverPlayer({
  videoId,
  posterImage,
  title,
}: YouTubeCoverPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)

  const fallbackPoster =
    `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`

  return (
    <section
      aria-label={`${title}室內設計展示影片`}
      className="mb-14 mt-10"
    >
      <div className="relative aspect-video overflow-hidden rounded-[2rem] border border-border bg-black shadow-[0_20px_70px_rgba(53,51,46,0.12)]">
        {isPlaying ? (
          <iframe
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&playsinline=1&controls=1&rel=0`}
            title={`${title}室內設計展示影片`}
            className="absolute inset-0 h-full w-full"
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
          />
        ) : (
          <button
            type="button"
            onClick={() => setIsPlaying(true)}
            aria-label={`播放${title}空間導覽影片`}
            className="group absolute inset-0 h-full w-full cursor-pointer overflow-hidden text-left"
          >
            <img
              src={posterImage || fallbackPoster}
              alt={`${title}室內設計與空間提案`}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.015]"
              fetchPriority="high"
              decoding="async"
            />

            <span
              aria-hidden="true"
              className="absolute inset-0 bg-black/10 transition-colors duration-300 group-hover:bg-black/20"
            />

            <span
              aria-hidden="true"
              className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/40 bg-black/65 shadow-2xl backdrop-blur-sm transition-transform duration-300 group-hover:scale-110 md:h-20 md:w-20"
            >
              <svg
                viewBox="0 0 24 24"
                className="ml-1 h-7 w-7 fill-white md:h-9 md:w-9"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
            </span>

            <span className="absolute bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border border-white/20 bg-black/65 px-4 py-2 text-xs font-semibold tracking-wide text-white shadow-lg backdrop-blur-sm md:bottom-6 md:text-sm">
              點擊觀看空間導覽
            </span>
          </button>
        )}
      </div>
    </section>
  )
}