import React, {useState} from 'react'
import {defineField, defineType, set} from 'sanity'
import {Box, Button, Card, Flex, Stack, Text, TextArea} from '@sanity/ui'

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

    const merged = Array.from(new Set([...value, ...tags]))

    onChange(set(merged))
    setInput('')
  }

  const removeTag = (tag: string) => {
    onChange(set(value.filter((item: string) => item !== tag)))
  }

  return React.createElement(
    Stack,
    {space: 3},

    React.createElement(TextArea, {
      value: input,
      rows: 3,
      placeholder: '可直接貼上：週纖達,減重針,減肥療程,減重門診,減重醫學,減肥診所',
      onChange: (event: any) => setInput(event.currentTarget.value),
      onPaste: (event: any) => {
        const text = event.clipboardData.getData('text')
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
      {wrap: 'wrap', gap: 2},
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
            {align: 'center', gap: 2},
            React.createElement(Text, {size: 1}, tag),
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
        React.createElement(Text, {size: 1, muted: true}, '尚未新增標籤')
      )
  )
}

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
        slugify: (input) => {
          const cleanTitle = input
            .toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^\u4e00-\u9fa5a-z0-9-]/g, '')
            .substring(0, 15)

          const uniqueId = Math.floor(Date.now() / 1000).toString().slice(-6)

          return encodeURIComponent(cleanTitle) + `-${uniqueId}`
        },
      },
      validation: (Rule) =>
        Rule.required().error('Slug 是必填項目，否則前台無法點擊'),
    }),

    defineField({
      name: 'htmlContent',
      title: 'HTML Content (Excel Auto-post)',
      type: 'text',
      description:
        '這裡是存放原始 HTML 代碼。如果此欄位有內容，前端將優先顯示此處。',
    }),

    defineField({
      name: 'tags',
      title: '標籤 / 關鍵字',
      type: 'array',
      description:
        '可直接貼上tags',
      of: [{type: 'string'}],
      components: {
        input: TagsInput,
      },
    }),

    defineField({
      name: 'author',
      title: 'Author',
      type: 'reference',
      to: {type: 'author'},
    }),

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