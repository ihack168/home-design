"use client"

import { useState } from "react"
import Link from "next/link"

interface PostThumbnailProps {
  slug: string
  title: string
  thumbnail: string
  videoId?: string
}

// 唯一需要留在 client 端的互動：點縮圖上的播放鍵直接內嵌播放 YouTube。
// 其餘資料（文章列表、標籤、分頁）都已經在 page.tsx 的 Server Component
// 裡處理完，這裡只負責這一小塊 UI 狀態，不影響 SSR 內容的完整性。
export function PostThumbnail({ slug, title, thumbnail, videoId }: PostThumbnailProps) {
  const [playing, setPlaying] = useState(false)

  if (playing && videoId) {
    return (
      <div className="relative aspect-video w-full overflow-hidden bg-muted">
        <iframe
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
          className="h-full w-full border-none"
          allow="autoplay; encrypted-media"
          allowFullScreen
        />
      </div>
    )
  }

  return (
    <div className="relative aspect-video w-full overflow-hidden bg-muted">
      <Link href={`/blog/${slug}`} className="block h-full w-full overflow-hidden">
        {thumbnail ? (
          <img
            src={thumbnail}
            alt={title}
            className="h-full w-full object-cover transition-all duration-700 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-secondary text-sm text-muted-foreground">
            暫無圖片
          </div>
        )}
      </Link>

      {videoId && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              setPlaying(true)
            }}
            className="pointer-events-auto flex h-12 w-16 cursor-pointer items-center justify-center rounded-2xl bg-white/90 shadow-xl backdrop-blur transition-transform duration-300 group-hover:scale-110"
          >
            <div className="ml-1 border-y-[10px] border-l-[16px] border-y-transparent border-l-primary" />
          </div>
        </div>
      )}
    </div>
  )
}