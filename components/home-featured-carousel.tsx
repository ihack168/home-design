"use client"

import { useEffect, useRef, useState } from "react"
import type { TouchEvent } from "react"
import Image from "next/image"
import Link from "next/link"

interface FeaturedCarouselPost {
  id: string
  title: string
  slug: string
  description: string
  thumbnail: string
}

interface HomeFeaturedCarouselProps {
  posts: FeaturedCarouselPost[]
}

/**
 * Hero 輪播專用：
 * 移除 Sanity 圖片網址上的所有轉檔與壓縮參數，
 * 直接載入原始上傳圖片。
 */
function getOriginalHeroImageUrl(url: string) {
  const cleanUrl = String(url || "").trim()

  if (!cleanUrl) return ""

  if (!cleanUrl.includes("cdn.sanity.io/images")) {
    return cleanUrl
  }

  return cleanUrl.split("?")[0]
}

/**
 * 只取得文章標題第一個「|」或「｜」左邊的文字。
 *
 * 例如：
 * 台北住宅設計｜30 坪現代風裝潢案例
 *
 * 顯示：
 * 台北住宅設計
 */
function getShortHeroTitle(title: string) {
  const cleanTitle = String(title || "").trim()

  if (!cleanTitle) return ""

  return cleanTitle.split(/[|｜]/)[0].trim()
}

export function HomeFeaturedCarousel({
  posts,
}: HomeFeaturedCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const touchStartX = useRef<number | null>(null)

  useEffect(() => {
    if (posts.length <= 1) return

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % posts.length)
    }, 5500)

    return () => window.clearInterval(timer)
  }, [posts.length])

  if (posts.length === 0) return null

  function goTo(index: number) {
    setActiveIndex((index + posts.length) % posts.length)
  }

  function handleTouchEnd(event: TouchEvent<HTMLElement>) {
    if (touchStartX.current === null) return

    const distance =
      event.changedTouches[0].clientX - touchStartX.current

    touchStartX.current = null

    if (Math.abs(distance) < 45) return

    goTo(activeIndex + (distance < 0 ? 1 : -1))
  }

  return (
    <section
      aria-label="最新室內設計作品精選"
      className="relative left-1/2 w-screen -translate-x-1/2 overflow-hidden bg-black"
      onTouchStart={(event) => {
        touchStartX.current = event.touches[0].clientX
      }}
      onTouchEnd={handleTouchEnd}
    >
      <div className="relative h-[54vh] min-h-[430px] max-h-[720px] sm:h-[66vh] lg:h-[76vh]">
        {posts.map((post, index) => {
          const isActive = index === activeIndex
          const originalHeroImage = getOriginalHeroImageUrl(
            post.thumbnail
          )
          const shortTitle = getShortHeroTitle(post.title)

          return (
            <article
              key={post.id}
              aria-hidden={!isActive}
              className={`absolute inset-0 transition-opacity duration-1000 ease-out ${
                isActive
                  ? "z-10 opacity-100"
                  : "pointer-events-none opacity-0"
              }`}
            >
              <Image
                src={originalHeroImage}
                alt={post.title}
                fill
                priority={index === 0}
                unoptimized
                sizes="100vw"
                className={`object-cover transition-transform duration-[6500ms] ease-out ${
                  isActive ? "scale-105" : "scale-100"
                }`}
              />

              <div className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/20 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/10" />

              <div className="relative z-10 mx-auto flex h-full max-w-7xl items-end px-5 pb-16 sm:px-8 sm:pb-20 lg:px-10 lg:pb-24">
                <div className="max-w-4xl text-white">
                  <h1 className="text-3xl font-black leading-tight tracking-tight drop-shadow-lg sm:text-5xl lg:text-6xl">
                    <Link
                      href={`/blog/${post.slug}`}
                      tabIndex={isActive ? 0 : -1}
                      className="transition-opacity hover:opacity-80"
                    >
                      {shortTitle}
                    </Link>
                  </h1>
                </div>
              </div>
            </article>
          )
        })}

        {posts.length > 1 && (
          <>
            <button
              type="button"
              aria-label="上一張作品"
              onClick={() => goTo(activeIndex - 1)}
              className="absolute left-3 top-1/2 z-30 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/35 bg-black/20 text-2xl text-white backdrop-blur-md transition hover:bg-black/45 sm:flex"
            >
              ‹
            </button>

            <button
              type="button"
              aria-label="下一張作品"
              onClick={() => goTo(activeIndex + 1)}
              className="absolute right-3 top-1/2 z-30 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/35 bg-black/20 text-2xl text-white backdrop-blur-md transition hover:bg-black/45 sm:flex"
            >
              ›
            </button>

            <div className="absolute bottom-5 right-5 z-30 flex items-center gap-2 sm:bottom-8 sm:right-8">
              {posts.map((post, index) => (
                <button
                  key={post.id}
                  type="button"
                  aria-label={`顯示第 ${index + 1} 張作品`}
                  aria-current={
                    index === activeIndex ? "true" : undefined
                  }
                  onClick={() => goTo(index)}
                  className={`h-1.5 rounded-full transition-all ${
                    index === activeIndex
                      ? "w-10 bg-white"
                      : "w-4 bg-white/45 hover:bg-white/75"
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  )
}