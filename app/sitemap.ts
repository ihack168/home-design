import type { MetadataRoute } from "next"

import { client } from "@/lib/sanity"

export const revalidate = 3600

const baseUrl = "https://www.deco77.com"

type SanityPost = {
  slug: string
  publishedAt?: string
}

function toValidDate(value?: string) {
  if (!value) return undefined

  const date = new Date(value)

  return Number.isNaN(date.getTime()) ? undefined : date
}

function buildPostUrl(slug: string) {
  return new URL(`/blog/${slug}`, baseUrl).toString()
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await client.fetch<SanityPost[]>(
    `*[
      _type == "post" &&
      defined(slug.current)
    ]
      | order(coalesce(publishedAt, _createdAt) desc) {
        "slug": slug.current,
        "publishedAt": coalesce(publishedAt, _createdAt)
      }`,
    {},
    {
      next: {
        revalidate: 3600,
      },
    }
  )

  const validPosts = posts.filter(
    (post) =>
      typeof post.slug === "string" &&
      post.slug.trim().length > 0
  )

  const newestPublishedDate = validPosts
    .map((post) => toValidDate(post.publishedAt))
    .filter((date): date is Date => Boolean(date))
    .sort((a, b) => b.getTime() - a.getTime())[0]

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/`,
      ...(newestPublishedDate
        ? { lastModified: newestPublishedDate }
        : {}),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${baseUrl}/blog`,
      ...(newestPublishedDate
        ? { lastModified: newestPublishedDate }
        : {}),
      changeFrequency: "daily",
      priority: 0.9,
    },
  ]

  const blogRoutes: MetadataRoute.Sitemap = validPosts.map(
    (post) => {
      const lastModified = toValidDate(post.publishedAt)

      return {
        url: buildPostUrl(post.slug.trim()),
        ...(lastModified ? { lastModified } : {}),
        changeFrequency: "monthly" as const,
        priority: 0.8,
      }
    }
  )

  return [...staticRoutes, ...blogRoutes]
}