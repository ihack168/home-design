import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'warningCasePost',
  title: '裝潢踩雷案例',
  type: 'document',

  fields: [
    defineField({
      name: 'warningCaseTitle',
      title: '踩雷案例標題',
      type: 'string',
      description: '對應 Google Sheet Z 欄：踩雷標題',
      validation: (Rule) =>
        Rule.required()
          .min(5)
          .max(120)
          .error('踩雷案例標題為必填，建議控制在 5～120 個字'),
    }),

    defineField({
      name: 'slug',
      title: '網址代稱 Slug',
      type: 'slug',
      description: '用於建立每一則踩雷案例的獨立網址',
      options: {
        source: 'warningCaseTitle',
        maxLength: 150,
        slugify: (input) =>
          input
            .toLowerCase()
            .trim()
            .replace(/\s+/g, '-')
            .replace(/[^\w\u4e00-\u9fff-]+/g, '')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, ''),
      },
      validation: (Rule) =>
        Rule.required().error('Slug 不能空白'),
    }),

    defineField({
      name: 'warningCaseDescription',
      title: '踩雷內容',
      type: 'text',
      rows: 18,
      description: '對應 Google Sheet AA 欄：踩雷內容／事情經過',
      validation: (Rule) =>
        Rule.required()
          .min(20)
          .error('踩雷內容為必填，至少需要 20 個字'),
    }),

    defineField({
      name: 'publishedAt',
      title: '發布時間',
      type: 'datetime',
      description: '案例建立至 Sanity 時的發布時間',
      initialValue: () => new Date().toISOString(),
      validation: (Rule) =>
        Rule.required().error('發布時間不能空白'),
    }),
  ],

  orderings: [
    {
      title: '發布時間：新到舊',
      name: 'publishedAtDesc',
      by: [
        {
          field: 'publishedAt',
          direction: 'desc',
        },
      ],
    },
    {
      title: '發布時間：舊到新',
      name: 'publishedAtAsc',
      by: [
        {
          field: 'publishedAt',
          direction: 'asc',
        },
      ],
    },
    {
      title: '案例標題',
      name: 'warningCaseTitleAsc',
      by: [
        {
          field: 'warningCaseTitle',
          direction: 'asc',
        },
      ],
    },
  ],

  preview: {
    select: {
      title: 'warningCaseTitle',
      description: 'warningCaseDescription',
      publishedAt: 'publishedAt',
    },

    prepare({
      title,
      description,
      publishedAt,
    }: {
      title?: string
      description?: string
      publishedAt?: string
    }) {
      const cleanDescription = String(description || '')
        .replace(/\s+/g, ' ')
        .trim()

      const dateText = publishedAt
        ? new Date(publishedAt).toLocaleDateString('zh-TW', {
            timeZone: 'Asia/Taipei',
          })
        : '尚未設定發布時間'

      return {
        title: title || '尚未填寫踩雷案例標題',
        subtitle: cleanDescription
          ? `${dateText}｜${cleanDescription.slice(0, 55)}${
              cleanDescription.length > 55 ? '…' : ''
            }`
          : `${dateText}｜尚未填寫踩雷內容`,
      }
    },
  },
})