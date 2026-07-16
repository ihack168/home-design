import { createClient } from "next-sanity";

export const client = createClient({
  projectId: "no0ub4vm", // 去 Sanity Manage 頁面找
  dataset: "production",      // 通常是 production
  apiVersion: "2024-03-11",    // 使用當前的日期
  useCdn: false,               // 開發或需要即時更新時設為 false
});