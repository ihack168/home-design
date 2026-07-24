
import { defineField, defineType } from "sanity"

export default defineType({
  name: "warningCasePost",
  title: "裝潢踩雷案例",
  type: "document",

  fields: [
    defineField({
      name: "title",
      title: "踩雷案例標題",
      type: "string",
      description: "對應 Google Sheet Z 欄：踩雷標題",
      validation: (Rule) =>
        Rule.required()
          .min(5)
          .max(120)
          .error("踩雷案例標題為必填，建議控制在 5～120 個字"),
    }),

    defineField({
      name: "slug",
      title: "網址代稱 Slug",
      type: "slug",
      description: "用於建立每一則踩雷案例的獨立網址",
      options: {
        source: "title",
        maxLength: 150,
        slugify: (input) =>
          input
            .toLowerCase()
            .trim()
            .replace(/\s+/g, "-")
            .replace(/[^\w\u4e00-\u9fff-]+/g, "")
            .replace(/-+/g, "-")
            .replace(/^-|-$/g, ""),
      },
      validation: (Rule) => Rule.required().error("Slug 不能空白"),
    }),

    defineField({
      name: "describe",
      title: "踩雷內容",
      type: "text",
      rows: 18,
      description: "對應 Google Sheet AA 欄：踩雷內容／事情經過",
      validation: (Rule) =>
        Rule.required()
          .min(20)
          .error("踩雷內容為必填，至少需要 20 個字"),
    }),

    defineField({
      name: "publishedAt",
      title: "發文時間",
      type: "datetime",
      description: "文章實際顯示的發布日期與時間，可手動修改",
      options: {
        dateFormat: "YYYY-MM-DD",
        timeFormat: "HH:mm",
        timeStep: 15,
      },
      initialValue: () => new Date().toISOString(),
      validation: (Rule) => Rule.required().error("請設定發文時間"),
    }),
  ],

  orderings: [
    {
      title: "發文時間：新到舊",
      name: "publishedAtDesc",
      by: [
        {
          field: "publishedAt",
          direction: "desc",
        },
      ],
    },
    {
      title: "發文時間：舊到新",
      name: "publishedAtAsc",
      by: [
        {
          field: "publishedAt",
          direction: "asc",
        },
      ],
    },
    {
      title: "建立時間：新到舊",
      name: "createdAtDesc",
      by: [
        {
          field: "_createdAt",
          direction: "desc",
        },
      ],
    },
    {
      title: "案例標題",
      name: "titleAsc",
      by: [
        {
          field: "title",
          direction: "asc",
        },
      ],
    },
  ],

  preview: {
    select: {
      title: "title",
      describe: "describe",
      publishedAt: "publishedAt",
      createdAt: "_createdAt",
    },

    prepare({
      title,
      describe,
      publishedAt,
      createdAt,
    }: {
      title?: string
      describe?: string
      publishedAt?: string
      createdAt?: string
    }) {
      const cleanDescription = String(describe || "")
        .replace(/\s+/g, " ")
        .trim()

      const displayDate = publishedAt || createdAt

      const dateText = displayDate
        ? new Date(displayDate).toLocaleString("zh-TW", {
            timeZone: "Asia/Taipei",
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          })
        : "尚未設定時間"

      return {
        title: title || "尚未填寫踩雷案例標題",
        subtitle: cleanDescription
          ? `${dateText}｜${cleanDescription.slice(0, 55)}${
              cleanDescription.length > 55 ? "…" : ""
            }`
          : `${dateText}｜尚未填寫踩雷內容`,
      }
    },
  },
})