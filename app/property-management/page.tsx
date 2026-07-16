"use client";

import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { LineConsultButton } from "@/components/line-consult-button";

export default function PropertyManagementPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      <main className="pt-28 md:pt-36">
        {/* Hero */}
        <section className="mx-auto max-w-5xl px-6 text-center">
          <p className="text-sm font-semibold tracking-[0.2em] text-primary">
            PROPERTY MANAGEMENT
          </p>

          <h1 className="mt-3 text-3xl font-black md:text-5xl">
            包租代管服務完整指南
          </h1>

          <p className="mx-auto mt-6 max-w-3xl text-base leading-8 text-muted-foreground">
            提供專業包租代管服務，協助房東處理招租、租客管理、
            租金收取與房屋維護，並整合租屋補助與稅務規劃資訊。
          </p>
        </section>

        {/* TAG 導流區（SEO核心） */}
        <section className="mx-auto mt-16 max-w-6xl px-6">
          <h2 className="text-center text-2xl font-black">
            相關主題文章
          </h2>

          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">

            <Link href="/blog?tag=包租代管服務" className="rounded-2xl border bg-white p-6 shadow-sm hover:-translate-y-1 transition">
              <h3 className="font-bold">包租代管服務</h3>
              <p className="mt-2 text-sm text-muted-foreground">了解完整包租代管流程與服務內容</p>
            </Link>

            <Link href="/blog?tag=包租代管流程" className="rounded-2xl border bg-white p-6 shadow-sm hover:-translate-y-1 transition">
              <h3 className="font-bold">包租代管流程</h3>
              <p className="mt-2 text-sm text-muted-foreground">從委託到出租完整流程解析</p>
            </Link>

            <Link href="/blog?tag=包租代管費用" className="rounded-2xl border bg-white p-6 shadow-sm hover:-translate-y-1 transition">
              <h3 className="font-bold">包租代管費用</h3>
              <p className="mt-2 text-sm text-muted-foreground">費用計算方式與收費標準</p>
            </Link>

            <Link href="/blog?tag=包租代管優缺點" className="rounded-2xl border bg-white p-6 shadow-sm hover:-translate-y-1 transition">
              <h3 className="font-bold">包租代管優缺點</h3>
              <p className="mt-2 text-sm text-muted-foreground">適合誰？優勢與風險分析</p>
            </Link>

            <Link href="/blog?tag=包租代管房東收益" className="rounded-2xl border bg-white p-6 shadow-sm hover:-translate-y-1 transition">
              <h3 className="font-bold">房東收益分析</h3>
              <p className="mt-2 text-sm text-muted-foreground">包租代管 vs 自租收益比較</p>
            </Link>

            <Link href="/blog?tag=社會住宅包租代管" className="rounded-2xl border bg-white p-6 shadow-sm hover:-translate-y-1 transition">
              <h3 className="font-bold">社會住宅包租代管</h3>
              <p className="mt-2 text-sm text-muted-foreground">政府社宅方案與申請條件</p>
            </Link>

            <Link href="/blog?tag=公益出租人" className="rounded-2xl border bg-white p-6 shadow-sm hover:-translate-y-1 transition">
              <h3 className="font-bold">公益出租人</h3>
              <p className="mt-2 text-sm text-muted-foreground">稅務優惠與申請方式</p>
            </Link>

            <Link href="/blog?tag=房東節稅" className="rounded-2xl border bg-white p-6 shadow-sm hover:-translate-y-1 transition">
              <h3 className="font-bold">房東節稅</h3>
              <p className="mt-2 text-sm text-muted-foreground">合法節稅與報稅技巧</p>
            </Link>

            <Link href="/blog?tag=租屋補助" className="rounded-2xl border bg-white p-6 shadow-sm hover:-translate-y-1 transition">
              <h3 className="font-bold">租屋補助</h3>
              <p className="mt-2 text-sm text-muted-foreground">租屋補助與房東影響</p>
            </Link>

          </div>
        </section>

        {/* 服務介紹 */}
        <section className="mx-auto mt-20 max-w-6xl px-6">
          <h2 className="text-center text-2xl font-black">
            包租代管服務內容
          </h2>

          <div className="mt-10 grid gap-6 md:grid-cols-2">
            <div className="rounded-3xl border bg-white p-8 shadow-sm">
              <h3 className="text-xl font-bold">招租與租客篩選</h3>
              <p className="mt-3 text-muted-foreground">
                協助刊登房源、帶看與租客審核。
              </p>
            </div>

            <div className="rounded-3xl border bg-white p-8 shadow-sm">
              <h3 className="text-xl font-bold">租約與收租管理</h3>
              <p className="mt-3 text-muted-foreground">
                租金收取、合約管理與續約安排。
              </p>
            </div>

            <div className="rounded-3xl border bg-white p-8 shadow-sm">
              <h3 className="text-xl font-bold">房屋維護</h3>
              <p className="mt-3 text-muted-foreground">
                報修處理與租客溝通。
              </p>
            </div>

            <div className="rounded-3xl border bg-white p-8 shadow-sm">
              <h3 className="text-xl font-bold">補助與稅務評估</h3>
              <p className="mt-3 text-muted-foreground">
                協助申請補助與節稅規劃。
              </p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="mx-auto mt-20 mb-24 max-w-4xl px-6 text-center">
          <h2 className="text-3xl font-black">
            想了解包租代管是否適合你的房屋？
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            可透過 LINE 免費諮詢，協助評估最適合的出租方案。
          </p>

          <LineConsultButton className="mt-8 inline-flex rounded-full bg-[#06C755] px-8 py-4 text-sm font-semibold text-primary-foreground">
            加入 LINE 免費諮詢
          </LineConsultButton>
        </section>
      </main>

      <Footer />
    </div>
  );
}