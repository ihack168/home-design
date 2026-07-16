import {defineCliConfig} from 'sanity/cli'

export default defineCliConfig({
  api: {
    projectId: 'no0ub4vm', // 這是你的新專案 ID
    dataset: 'production'
  },
  deployment: {
    // 刪除原本的 appId 行位，讓 Sanity 自動處理新部署
    autoUpdates: true,
  }
})