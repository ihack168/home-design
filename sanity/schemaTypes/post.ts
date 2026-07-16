import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'post',
  title: 'Post',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
        // 關鍵修正：讓後台手動生成格式 = 自動發文腳本格式
        slugify: (input) => {
          const cleanTitle = input
            .toLowerCase()
            .replace(/\s+/g, '-') // 空格換橫槓
            .replace(/[^\u4e00-\u9fa5a-z0-9-]/g, '') // 刪除特殊符號
            .substring(0, 15) // 與 auto-post.mjs 同步取前 15 字，避免切斷中文字元編碼

          const uniqueId = Math.floor(Date.now() / 1000).toString().slice(-6)
          
          // 強制進行 URL 編碼，確保前台能用舊有的邏輯抓到文章
          return encodeURIComponent(cleanTitle) + `-${uniqueId}`
        },
      },
      validation: (Rule) => Rule.required().error('Slug 是必填項目，否則前台無法點擊'),
    }),
    defineField({
      name: 'author',
      title: 'Author',
      type: 'reference',
      to: {type: 'author'},
    }),
    // --- 新增：外部圖片網址欄位 ---
    defineField({
      name: 'imageUrl',
      title: 'External Image URL (外部圖片網址)',
      type: 'url',
      description: '直接貼上外部網站的圖片連結 (例如 https://...)，這將作為列表頁的封面圖。',
    }),
    // 原有的 Sanity 上傳圖片欄位
    defineField({
      name: 'mainImage',
      title: 'Main image (Sanity Upload)',
      type: 'image',
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: 'categories',
      title: 'Categories',
      type: 'array',
      of: [{type: 'reference', to: {type: 'category'}}],
    }),
    defineField({
      name: 'publishedAt',
      title: 'Published at',
      type: 'datetime',
    }),
    defineField({
      name: 'body',
      title: 'Body (Standard Editor)',
      type: 'blockContent',
    }),
    // --- HTML 專用欄位 ---
    defineField({
      name: 'htmlContent',
      title: 'HTML Content (Excel Auto-post)',
      type: 'text',
      description: '這裡是存放原始 HTML 代碼。如果此欄位有內容，前端將優先顯示此處。',
    }),
    // --- 新增：YouTube 影片 ID 欄位 ---
    defineField({
      name: 'youtubeVideoId',
      title: 'YouTube Video ID',
      type: 'string',
      description: '輸入 YouTube 影片 ID (例如: dQw4w9WgXcQ)，前端會自動顯示播放按鈕。',
    }),
    // --- 新增：標籤 / 關鍵字欄位 (用於 SEO/AEO) ---
defineField({
  name: 'tags',
  title: '標籤 / 關鍵字',
  type: 'array',
  description: '每個標籤請分開新增，例如：猛健樂、週纖達、瑞倍適',
  of: [
    {
      type: 'string',
    },
  ],
}),
  ],

  preview: {
    select: {
      title: 'title',
      author: 'author.name',
      media: 'mainImage',
    },
    prepare(selection) {
      const {author} = selection
      return {...selection, subtitle: author && `by ${author}`}
    },
  },
})