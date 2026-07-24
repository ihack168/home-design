import Link from "next/link"
import { notFound } from "next/navigation"

import { client } from "@/lib/sanity"

export const dynamic = "force-dynamic"
export const revalidate = 0

interface WarningCasePost {
  _id: string
  title: string
  describe: string
  slug: string
  publishedAt: string
}

const WARNING_CASE_QUERY = `
  *[
    _type == "warningCasePost" &&
    slug.current == $slug
  ][0] {
    _id,
    "title": coalesce(title, warningCaseTitle),
    "describe": coalesce(describe, warningCaseDescription),
    "slug": slug.current,
    "publishedAt": coalesce(publishedAt, _createdAt)
  }
`

function formatDate(date?: string) {
  if (!date) return ""

  const parsed = new Date(date)

  if (Number.isNaN(parsed.getTime())) {
    return ""
  }

  return parsed.toLocaleDateString("zh-TW", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: "Asia/Taipei",
  })
}

export default async function WarningCasePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  const warningCase = await client.fetch<WarningCasePost | null>(
    WARNING_CASE_QUERY,
    {
      slug,
    }
  )

  console.log("WARNING CASE DETAIL:", warningCase)

  if (!warningCase) {
    notFound()
  }

  return (
    <main style={{ maxWidth: "800px", margin: "40px auto", padding: "0 20px" }}>
      <p>
        <Link href="/warning">← 返回踩雷案例列表</Link>
      </p>

      <h1>{warningCase.title}</h1>

      <p>
        發布日期：{formatDate(warningCase.publishedAt) || "沒有日期"}
      </p>

      <p>Slug：{warningCase.slug}</p>

      <hr />

      <div style={{ whiteSpace: "pre-wrap", lineHeight: 1.8 }}>
        {warningCase.describe}
      </div>

      <hr />

      <details>
        <summary>查看 Sanity 原始資料</summary>

        <pre
          style={{
            overflowX: "auto",
            whiteSpace: "pre-wrap",
            background: "#f4f4f4",
            padding: "16px",
          }}
        >
          {JSON.stringify(warningCase, null, 2)}
        </pre>
      </details>
    </main>
  )
}