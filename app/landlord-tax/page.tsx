"use client";

import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { LineConsultButton } from "@/components/line-consult-button";

export default function LandlordTaxPage() {
  const taxTags = [
    "房東節稅",
    "出租所得稅",
    "房東報稅",
    "出租房屋節稅",
    "房東如何節稅",
    "出租房子要繳稅嗎",
    "出租所得申報",
    "租金收入報稅",
    "公益出租人減稅",
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      <main className="pt-28 md:pt-36">
        {/* Hero */}
        <section className="mx-auto max-w-5xl px-6 text-center">
          <p className="text-sm font-semibold tracking-[0.2em] text-primary">
            LANDLORD TAX GUIDE
          </p>

          <h1 className="mt-3 text-3xl font-black md:text-5xl">
            房東節稅與報稅懶人包
          </h1>

          <p className="mx-auto mt-6 max-w-3xl text-base leading-8 text-muted-foreground">
            房東出租房屋後，租金收入需依法申報所得稅，
            但也能透過合法費用列舉、公益出租人優惠、
            社會住宅包租代管與相關稅務規定進行節稅規劃。
            本頁整理房東最常搜尋的稅務問題與節稅資訊。
          </p>
        </section>

        {/* 主題分類 */}
        <section className="mx-auto mt-16 max-w-6xl px-6">
          <h2 className="text-center text-2xl font-black">
            房東節稅熱門主題
          </h2>

          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {taxTags.map((tag) => (
              <Link
                key={tag}
                href={`/blog?tag=${encodeURIComponent(tag)}`}
                className="rounded-2xl border border-border bg-white p-6 shadow-sm transition hover:-translate-y-1"
              >
                <h3 className="text-lg font-bold">
                  {tag}
                </h3>

                <p className="mt-2 text-sm text-muted-foreground">
                  查看所有「{tag}」相關文章
                </p>
              </Link>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="mx-auto mt-20 max-w-4xl px-6">
          <h2 className="text-center text-2xl font-black">
            房東稅務常見問題
          </h2>

          <div className="mt-10 space-y-6">
            <div className="rounded-2xl border border-border p-6">
              <h3 className="font-bold">
                房東出租房屋一定要報稅嗎？
              </h3>

              <p className="mt-3 leading-7 text-muted-foreground">
                是，租金收入屬於租賃所得，
                應依法申報綜合所得稅。
              </p>

              <Link
                href="/blog?tag=房東報稅"
                className="mt-3 inline-block font-semibold text-primary"
              >
                查看相關文章 →
              </Link>
            </div>

            <div className="rounded-2xl border border-border p-6">
              <h3 className="font-bold">
                房東可以扣除哪些費用？
              </h3>

              <p className="mt-3 leading-7 text-muted-foreground">
                可依規定扣除必要費用、
                修繕支出、折舊或採標準費用率申報。
              </p>

              <Link
                href="/blog?tag=出租所得稅"
                className="mt-3 inline-block font-semibold text-primary"
              >
                查看相關文章 →
              </Link>
            </div>

            <div className="rounded-2xl border border-border p-6">
              <h3 className="font-bold">
                房東如何合法節稅？
              </h3>

              <p className="mt-3 leading-7 text-muted-foreground">
                可透過公益出租人資格、
                社會住宅包租代管方案及合法費用列舉，
                降低實際課稅所得。
              </p>

              <Link
                href="/blog?tag=房東節稅"
                className="mt-3 inline-block font-semibold text-primary"
              >
                查看相關文章 →
              </Link>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="mx-auto mt-20 mb-24 max-w-4xl px-6 text-center">
          <h2 className="text-3xl font-black">
            不確定出租所得該如何申報？
          </h2>

          <p className="mx-auto mt-4 max-w-2xl leading-8 text-muted-foreground">
            歡迎加入 LINE 免費諮詢，
            協助了解房東報稅規定、
            出租所得計算方式與節稅規劃方向。
          </p>

          <LineConsultButton className="mt-8 inline-flex rounded-full bg-[#06C755] px-8 py-4 text-sm font-semibold text-primary-foreground shadow-[0_14px_36px_rgba(31,78,121,0.28)]">
            加入 LINE 免費諮詢
          </LineConsultButton>
        </section>
      </main>

      <Footer />
    </div>
  );
}