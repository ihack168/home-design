"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"

interface SearchableTag {
  name: string
  count: number
}

interface ProjectTagSearchProps {
  tags: SearchableTag[]
  selectedTags: string[]
}

function buildBlogPath(tags: string[]) {
  if (tags.length === 0) return "/blog"

  const query = new URLSearchParams()

  tags.forEach((tag) => {
    query.append("tag", tag)
  })

  return `/blog?${query.toString()}`
}

export function ProjectTagSearch({
  tags,
  selectedTags,
}: ProjectTagSearchProps) {
  const router = useRouter()
  const containerRef = useRef<HTMLDivElement>(null)

  const [keyword, setKeyword] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)

  const matchedTags = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLocaleLowerCase("zh-TW")

    if (!normalizedKeyword) return []

    return tags
      .filter((tag) =>
        tag.name
          .toLocaleLowerCase("zh-TW")
          .includes(normalizedKeyword)
      )
      .sort((a, b) => {
        const aStartsWith = a.name
          .toLocaleLowerCase("zh-TW")
          .startsWith(normalizedKeyword)

        const bStartsWith = b.name
          .toLocaleLowerCase("zh-TW")
          .startsWith(normalizedKeyword)

        if (aStartsWith !== bStartsWith) {
          return aStartsWith ? -1 : 1
        }

        return (
          b.count - a.count ||
          a.name.localeCompare(b.name, "zh-Hant")
        )
      })
      .slice(0, 10)
  }, [keyword, tags])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
        setActiveIndex(-1)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  function selectTag(tagName: string) {
    const nextTags = selectedTags.includes(tagName)
      ? selectedTags
      : [...selectedTags, tagName]

    setKeyword("")
    setIsOpen(false)
    setActiveIndex(-1)

    router.push(buildBlogPath(nextTags))
  }

  function handleKeyDown(
    event: React.KeyboardEvent<HTMLInputElement>
  ) {
    if (!isOpen || matchedTags.length === 0) {
      if (event.key === "ArrowDown" && keyword.trim()) {
        setIsOpen(true)
      }

      return
    }

    if (event.key === "ArrowDown") {
      event.preventDefault()

      setActiveIndex((currentIndex) =>
        currentIndex >= matchedTags.length - 1
          ? 0
          : currentIndex + 1
      )
    }

    if (event.key === "ArrowUp") {
      event.preventDefault()

      setActiveIndex((currentIndex) =>
        currentIndex <= 0
          ? matchedTags.length - 1
          : currentIndex - 1
      )
    }

    if (event.key === "Enter") {
      event.preventDefault()

      const selectedResult =
        activeIndex >= 0
          ? matchedTags[activeIndex]
          : matchedTags[0]

      if (selectedResult) {
        selectTag(selectedResult.name)
      }
    }

    if (event.key === "Escape") {
      setIsOpen(false)
      setActiveIndex(-1)
    }
  }

  function handleKeywordChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const value = event.target.value

    setKeyword(value)
    setIsOpen(Boolean(value.trim()))
    setActiveIndex(-1)
  }

  return (
    <div
      ref={containerRef}
      className="relative flex w-full flex-col gap-2 sm:flex-row sm:items-center"
    >
      <h2 className="shrink-0 text-sm font-black">
        搜尋建案
      </h2>

      <div className="relative w-full">
        <label htmlFor="project-search" className="sr-only">
          搜尋行政區或建案名稱
        </label>

        <input
          id="project-search"
          type="search"
          value={keyword}
          placeholder="輸入第一個字即時搜尋"
          autoComplete="off"
          className="h-10 w-full rounded-xl border border-border bg-background px-3 pr-10 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-accent"
          onChange={handleKeywordChange}
          onFocus={() => {
            if (keyword.trim()) {
              setIsOpen(true)
            }
          }}
          onKeyDown={handleKeyDown}
          aria-autocomplete="list"
          aria-expanded={isOpen}
          aria-controls="project-search-results"
        />

        {keyword && (
          <button
            type="button"
            onClick={() => {
              setKeyword("")
              setIsOpen(false)
              setActiveIndex(-1)
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-lg leading-none text-muted-foreground transition-colors hover:text-foreground"
            aria-label="清除搜尋文字"
          >
            ×
          </button>
        )}

        {isOpen && (
          <div
            id="project-search-results"
            role="listbox"
            className="absolute left-0 right-0 top-full z-50 mt-2 max-h-72 overflow-y-auto rounded-xl border border-border bg-white p-1.5 shadow-xl"
          >
            {matchedTags.length > 0 ? (
              matchedTags.map((tag, index) => {
                const isSelected = selectedTags.includes(tag.name)
                const isActive = activeIndex === index

                return (
                  <button
                    key={tag.name}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onMouseEnter={() => setActiveIndex(index)}
                    onClick={() => selectTag(tag.name)}
                    className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
                      isActive
                        ? "bg-accent text-accent-foreground"
                        : "text-foreground hover:bg-accent/10"
                    }`}
                  >
                    <span className="min-w-0 truncate font-semibold">
                      {tag.name}
                    </span>

                    <span
                      className={`ml-3 shrink-0 rounded-full px-2 py-0.5 text-xs ${
                        isActive
                          ? "bg-white/20"
                          : "bg-background text-muted-foreground"
                      }`}
                    >
                      {isSelected ? "已選" : `${tag.count} 篇`}
                    </span>
                  </button>
                )
              })
            ) : (
              <p className="px-3 py-4 text-sm text-muted-foreground">
                找不到符合的行政區或建案名稱
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}