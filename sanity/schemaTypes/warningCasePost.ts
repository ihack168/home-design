
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
      validation: (Rule) =>
        Rule.required().error("Slug 不能空白"),
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
  ],

  orderings: [
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
      title: "建立時間：舊到新",
      name: "createdAtAsc",
      by: [
        {
          field: "_createdAt",
          direction: "asc",
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
      createdAt: "_createdAt",
    },

    prepare({
      title,
      describe,
      createdAt,
    }: {
      title?: string
      describe?: string
      createdAt?: string
    }) {
      const cleanDescription = String(describe || "")
        .replace(/\s+/g, " ")
        .trim()

      const dateText = createdAt
        ? new Date(createdAt).toLocaleDateString("zh-TW", {
            timeZone: "Asia/Taipei",
          })
        : "尚未建立"

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
