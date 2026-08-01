"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import type { TouchEvent } from "react"
import Image from "next/image"
import Link from "next/link"

interface FeaturedCarouselPost {
  id: string
  title: string
  slug: string
  diningRoomImage?: string
  masterBedroomImage?: string
}

interface HomeFeaturedCarouselProps {
  posts: FeaturedCarouselPost[]
}

interface CarouselSlide {
  id: string
  postId: string
  title: string
  slug: string
  imageUrl: string
  roomType: "餐廳" | "主臥"
}

/**
 * Hero 專用圖片網址。
 *
 * 移除 Sanity 圖片網址上的 auto=format、w、q 等參數，
 * 直接載入原始上傳圖片。
 */
function getOriginalHeroImageUrl(url?: string) {
  const cleanUrl = String(url || "").trim()

  if (!cleanUrl) return ""

  if (!cleanUrl.includes("cdn.sanity.io/images")) {
    return cleanUrl
  }

  return cleanUrl.split("?")[0]
}

/**
 * 只顯示第一個半形或全形分隔線左邊的標題。
 *
 * 例如：
 * 陶朱隱園現代風室內設計｜台北市信義區住宅裝潢提案
 *
 * 顯示：
 * 陶朱隱園現代風室內設計
 */
function getShortHeroTitle(title: string) {
  const cleanTitle = String(title || "").trim()

  if (!cleanTitle) return ""

  return cleanTitle.split(/[|｜]/)[0].trim()
}

export function HomeFeaturedCarousel({
  posts,
}: HomeFeaturedCarouselProps) {
  /**
   * 每篇文章拆成餐廳與主臥兩張輪播圖片。
   * 缺少的圖片會自動略過。
   */
  const carouselSlides = useMemo<CarouselSlide[]>(() => {
    return posts.flatMap((post) => {
      const slides: CarouselSlide[] = []

      const diningRoomImage = getOriginalHeroImageUrl(
        post.diningRoomImage
      )

      const masterBedroomImage = getOriginalHeroImageUrl(
        post.masterBedroomImage
      )

      if (diningRoomImage) {
        slides.push({
          id: `${post.id}-dining-room`,
          postId: post.id,
          title: post.title,
          slug: post.slug,
          imageUrl: diningRoomImage,
          roomType: "餐廳",
        })
      }

      if (masterBedroomImage) {
        slides.push({
          id: `${post.id}-master-bedroom`,
          postId: post.id,
          title: post.title,
          slug: post.slug,
          imageUrl: masterBedroomImage,
          roomType: "主臥",
        })
      }

      return slides
    })
  }, [posts])

  const [activeIndex, setActiveIndex] = useState(0)
  const touchStartX = useRef<number | null>(null)

  useEffect(() => {
    setActiveIndex(0)
  }, [carouselSlides.length])

  useEffect(() => {
    if (carouselSlides.length <= 1) return

    const timer = window.setInterval(() => {
      setActiveIndex(
        (current) =>
          (current + 1) % carouselSlides.length
      )
    }, 5500)

    return () => window.clearInterval(timer)
  }, [carouselSlides.length])

  if (carouselSlides.length === 0) {
    return null
  }

  function goTo(index: number) {
    setActiveIndex(
      (index + carouselSlides.length) %
        carouselSlides.length
    )
  }

  function handleTouchEnd(
    event: TouchEvent<HTMLElement>
  ) {
    if (touchStartX.current === null) return

    const distance =
      event.changedTouches[0].clientX -
      touchStartX.current

    touchStartX.current = null

    if (Math.abs(distance) < 45) return

    goTo(activeIndex + (distance < 0 ? 1 : -1))
  }

  return (
    <section
      aria-label="最新室內設計作品精選"
      className="relative left-1/2 w-screen -translate-x-1/2 overflow-hidden bg-[#181816]"
      onTouchStart={(event) => {
        touchStartX.current =
          event.touches[0].clientX
      }}
      onTouchEnd={handleTouchEnd}
    >
      <div className="relative h-[54vh] min-h-[430px] max-h-[720px] sm:h-[66vh] lg:h-[76vh]">
        {carouselSlides.map((slide, index) => {
          const isActive = index === activeIndex
          const shortTitle = getShortHeroTitle(
            slide.title
          )

          return (
            <article
              key={slide.id}
              aria-hidden={!isActive}
              className={`absolute inset-0 transition-opacity duration-1000 ease-out ${
                isActive
                  ? "z-10 opacity-100"
                  : "pointer-events-none opacity-0"
              }`}
            >
              <Image
                src={slide.imageUrl}
                alt={`${shortTitle}${slide.roomType}室內設計`}
                fill
                priority={index === 0}
                unoptimized
                sizes="100vw"
                className={`object-cover transition-transform duration-[6500ms] ease-out ${
                  isActive
                    ? "scale-[1.025] sm:scale-[1.035]"
                    : "scale-100"
                }`}
              />

              {/* 手機版只做極淡壓暗，盡量保留圖片 */}
              <div className="absolute inset-0 bg-black/[0.06] sm:bg-black/10" />

              {/* 手機版只在最底部加短漸層；桌面版維持較完整漸層 */}
              <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/45 via-black/10 to-transparent sm:h-64 sm:from-black/45 sm:via-black/10" />

              {/* 手機版：低高度霧面資訊列 */}
              <div className="absolute inset-x-0 bottom-0 z-10 px-3 pb-3 sm:hidden">
                <Link
                  href={`/blog/${slide.slug}`}
                  tabIndex={isActive ? 0 : -1}
                  className="flex min-h-14 items-center gap-3 rounded-2xl border border-white/25 bg-black/30 px-4 py-2.5 text-white shadow-[0_10px_30px_rgba(0,0,0,0.18)] backdrop-blur-xl transition active:scale-[0.99]"
                >
                  <h2 className="min-w-0 flex-1 truncate text-[16px] font-semibold leading-6 tracking-[0.01em]">
                    {shortTitle}
                  </h2>

                  <span
                    aria-hidden="true"
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/35 bg-white/10 text-base"
                  >
                    →
                  </span>
                </Link>
              </div>

              {/* 桌面版：保留精品雜誌風資訊卡 */}
              <div className="relative z-10 mx-auto hidden h-full max-w-7xl items-end px-8 pb-12 sm:flex lg:px-10 lg:pb-14">
                <Link
                  href={`/blog/${slide.slug}`}
                  tabIndex={isActive ? 0 : -1}
                  className="group inline-flex max-w-3xl items-center gap-4 rounded-md border border-white/40 bg-[#eee9df]/90 px-7 py-5 text-[#262520] shadow-[0_16px_45px_rgba(0,0,0,0.18)] backdrop-blur-md transition duration-300 hover:bg-[#f7f3eb]"
                >
                  <span className="block h-14 w-px shrink-0 bg-[#9b8466]" />

                  <span className="min-w-0">
                    <span className="block text-xs font-bold tracking-[0.28em] text-[#8d7658]">
                      {slide.roomType} DESIGN
                    </span>

                    <h2 className="mt-1.5 text-3xl font-medium leading-snug tracking-[0.03em] lg:text-4xl">
                      {shortTitle}
                    </h2>
                  </span>

                  <span
                    aria-hidden="true"
                    className="ml-auto flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#262520]/25 text-lg transition duration-300 group-hover:translate-x-1 group-hover:border-[#262520]/60"
                  >
                    →
                  </span>
                </Link>
              </div>
            </article>
          )
        })}

        {carouselSlides.length > 1 && (
          <>
            <button
              type="button"
              aria-label="上一張作品"
              onClick={() => goTo(activeIndex - 1)}
              className="absolute left-3 top-1/2 z-30 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/40 bg-black/15 text-2xl text-white backdrop-blur-md transition hover:bg-black/40 sm:flex"
            >
              ‹
            </button>

            <button
              type="button"
              aria-label="下一張作品"
              onClick={() => goTo(activeIndex + 1)}
              className="absolute right-3 top-1/2 z-30 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/40 bg-black/15 text-2xl text-white backdrop-blur-md transition hover:bg-black/40 sm:flex"
            >
              ›
            </button>

            {/* 手機版：精簡圓點 */}
            <div className="absolute right-3 top-3 z-30 flex items-center gap-1 rounded-full border border-white/20 bg-black/15 px-2.5 py-2 backdrop-blur-md sm:hidden">
              {carouselSlides.map((slide, index) => (
                <button
                  key={slide.id}
                  type="button"
                  aria-label={`顯示第 ${index + 1} 張作品`}
                  aria-current={
                    index === activeIndex
                      ? "true"
                      : undefined
                  }
                  onClick={() => goTo(index)}
                  className={`h-1 rounded-full transition-all duration-300 ${
                    index === activeIndex
                      ? "w-5 bg-white"
                      : "w-1.5 bg-white/45"
                  }`}
                />
              ))}
            </div>

            {/* 桌面版：完整指示器 */}
            <div className="absolute right-8 top-8 z-30 hidden items-center gap-2 rounded-full border border-white/25 bg-black/15 px-3 py-2 backdrop-blur-md sm:flex">
              {carouselSlides.map((slide, index) => (
                <button
                  key={slide.id}
                  type="button"
                  aria-label={`顯示第 ${index + 1} 張作品`}
                  aria-current={
                    index === activeIndex
                      ? "true"
                      : undefined
                  }
                  onClick={() => goTo(index)}
                  className={`h-1 rounded-full transition-all duration-300 ${
                    index === activeIndex
                      ? "w-8 bg-white"
                      : "w-3 bg-white/45 hover:bg-white/75"
                  }`}
                />
              ))}
            </div>

            {/* 桌面版頁碼 */}
            <div className="absolute bottom-8 right-8 z-30 hidden rounded-full border border-white/25 bg-black/15 px-3 py-1.5 text-xs font-semibold tracking-widest text-white backdrop-blur-md sm:block">
              {String(activeIndex + 1).padStart(2, "0")}
              <span className="mx-1.5 text-white/50">/</span>
              {String(carouselSlides.length).padStart(
                2,
                "0"
              )}
            </div>
          </>
        )}
      </div>
    </section>
  )
}
