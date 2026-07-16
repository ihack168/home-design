import React, {useState} from 'react'
import {defineField, defineType, set} from 'sanity'
import {
  Box,
  Button,
  Card,
  Flex,
  Stack,
  Text,
  TextArea,
} from '@sanity/ui'

function TagsInput(props: any) {
  const {value = [], onChange} = props
  const [input, setInput] = useState('')

  const parseTags = (text: string) => {
    return text
      .replace(/[()（）]/g, '')
      .split(/,|，|\n/)
      .map((tag) => tag.trim())
      .filter(Boolean)
  }

  const addTags = (text: string) => {
    const tags = parseTags(text)

    if (!tags.length) return

    const merged = Array.from(
      new Set([...value, ...tags])
    )

    onChange(set(merged))
    setInput('')
  }

  const removeTag = (tag: string) => {
    onChange(
      set(
        value.filter(
          (item: string) => item !== tag
        )
      )
    )
  }

  return React.createElement(
    Stack,
    {space: 3},

    React.createElement(TextArea, {
      value: input,
      rows: 3,
      placeholder:
        '可直接貼上：仁愛帝寶,台北市,大安區,侘寂風室內設計',
      onChange: (event: any) =>
        setInput(event.currentTarget.value),
      onPaste: (event: any) => {
        const text =
          event.clipboardData.getData('text')

        event.preventDefault()
        addTags(text)
      },
      onKeyDown: (event: any) => {
        if (event.key === 'Enter') {
          event.preventDefault()
          addTags(input)
        }
      },
    }),

    React.createElement(Button, {
      text: '新增 Tags',
      tone: 'primary',
      onClick: () => addTags(input),
    }),

    React.createElement(
      Flex,
      {
        wrap: 'wrap',
        gap: 2,
      },

      value.map((tag: string) =>
        React.createElement(
          Card,
          {
            key: tag,
            padding: 2,
            radius: 2,
            tone: 'primary',
            shadow: 1,
          },

          React.createElement(
            Flex,
            {
              align: 'center',
              gap: 2,
            },

            React.createElement(
              Text,
              {size: 1},
              tag
            ),

            React.createElement(Button, {
              text: '×',
              mode: 'bleed',
              tone: 'critical',
              onClick: () => removeTag(tag),
            })
          )
        )
      )
    ),

    value.length === 0 &&
      React.createElement(
        Box,
        null,

        React.createElement(
          Text,
          {
            size: 1,
            muted: true,
          },
          '尚未新增標籤'
        )
      )
  )
}

function createEightDigitId() {
  return Math.floor(
    10000000 + Math.random() * 90000000
  ).toString()
}

export default defineType({
  name: 'post',
  title: '室內設計文章',
  type: 'document',

  fields: [
    defineField({
      name: 'title',
      title: '文章標題',
      type: 'string',
      validation: (Rule) =>
        Rule.required().error('文章標題是必填項目'),
    }),

    defineField({
      name: 'slug',
      title: '文章網址 Slug',
      type: 'slug',

      description:
        '自動產生文章網址，結尾會加入 8 碼識別碼，方便日後依圖片檔名批次補圖。',

      options: {
        source: 'title',
        maxLength: 120,

        slugify: (input) => {
          const cleanTitle = input
            .toLowerCase()
            .replace(/\s+/g, '-')
            .replace(
              /[^\u4e00-\u9fa5a-z0-9-]/g,
              ''
            )
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '')
            .substring(0, 15)

          const uniqueId =
            createEightDigitId()

          return (
            encodeURIComponent(cleanTitle) +
            `-${uniqueId}`
          )
        },
      },

      validation: (Rule) =>
        Rule.required().error(
          'Slug 是必填項目，否則前台無法顯示文章網址'
        ),
    }),

    defineField({
      name: 'htmlContent',
      title: 'HTML 文章內容（Excel 自動發文）',
      type: 'text',

      description:
        '存放自動發文產生的 HTML 原始碼。前端文章頁會優先顯示此欄位內容。',

      rows: 20,
    }),

    defineField({
      name: 'tags',
      title: '標籤／關鍵字',
      type: 'array',

      description:
        '建議固定使用：建案名稱、縣市、行政區、設計風格。可直接貼上逗號分隔內容。',

      of: [
        {
          type: 'string',
        },
      ],

      components: {
        input: TagsInput,
      },
    }),

    defineField({
      name: 'mainImage',
      title: '文章封面圖',
      type: 'image',

      description:
        '可作為文章列表、首頁作品卡片或社群分享封面。若第一張圖片已直接寫入 HTML，此欄位可暫時留空。',

      options: {
        hotspot: true,
      },

      fields: [
        defineField({
          name: 'alt',
          title: '圖片替代文字 Alt',
          type: 'string',

          description:
            '例如：仁愛帝寶侘寂風客廳室內設計提案',
        }),
      ],
    }),

    defineField({
      name: 'diningRoomImage',
      title: '餐廳圖片',
      type: 'image',

      description:
        '目前可留空。日後補上圖片後，前端會自動顯示在餐廳設計段落。',

      options: {
        hotspot: true,
      },

      fields: [
        defineField({
          name: 'alt',
          title: '圖片替代文字 Alt',
          type: 'string',

          description:
            '例如：仁愛帝寶侘寂風餐廳室內設計',
        }),
      ],
    }),

    defineField({
      name: 'masterBedroomImage',
      title: '主臥圖片',
      type: 'image',

      description:
        '目前可留空。日後補上圖片後，前端會自動顯示在主臥設計段落。',

      options: {
        hotspot: true,
      },

      fields: [
        defineField({
          name: 'alt',
          title: '圖片替代文字 Alt',
          type: 'string',

          description:
            '例如：仁愛帝寶侘寂風主臥室內設計',
        }),
      ],
    }),

    defineField({
      name: 'secondBedroomImage',
      title: '次臥圖片',
      type: 'image',

      description:
        '目前可留空。日後補上圖片後，前端會自動顯示在次臥設計段落。',

      options: {
        hotspot: true,
      },

      fields: [
        defineField({
          name: 'alt',
          title: '圖片替代文字 Alt',
          type: 'string',

          description:
            '例如：仁愛帝寶侘寂風次臥室內設計',
        }),
      ],
    }),

    defineField({
      name: 'author',
      title: '作者',
      type: 'reference',
      to: {
        type: 'author',
      },
    }),

    defineField({
      name: 'categories',
      title: '文章分類',
      type: 'array',

      of: [
        {
          type: 'reference',
          to: {
            type: 'category',
          },
        },
      ],
    }),

    defineField({
      name: 'publishedAt',
      title: '發布時間',
      type: 'datetime',
    }),

    defineField({
      name: 'body',
      title: '一般文章編輯器',
      type: 'blockContent',

      description:
        '手動撰寫文章時使用。若 HTML 文章內容已有資料，前端會優先顯示 HTML。',
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
      title: '建立時間：新到舊',
      name: 'createdAtDesc',
      by: [
        {
          field: '_createdAt',
          direction: 'desc',
        },
      ],
    },
  ],

  preview: {
    select: {
      title: 'title',
      author: 'author.name',
      mainImage: 'mainImage',
      diningRoomImage: 'diningRoomImage',
      masterBedroomImage:
        'masterBedroomImage',
      secondBedroomImage:
        'secondBedroomImage',
      publishedAt: 'publishedAt',
    },

    prepare(selection) {
      const {
        title,
        author,
        mainImage,
        diningRoomImage,
        masterBedroomImage,
        secondBedroomImage,
        publishedAt,
      } = selection

      const media =
        mainImage ||
        diningRoomImage ||
        masterBedroomImage ||
        secondBedroomImage

      const subtitleParts: string[] = []

      if (author) {
        subtitleParts.push(`作者：${author}`)
      }

      if (publishedAt) {
        subtitleParts.push(
          new Date(
            publishedAt
          ).toLocaleDateString('zh-TW')
        )
      }

      return {
        title:
          title || '尚未填寫文章標題',

        subtitle:
          subtitleParts.join('｜') ||
          '室內設計作品文章',

        media,
      }
    },
  },
})