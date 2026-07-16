"use client";

import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { LineConsultButton } from "@/components/line-consult-button";

export default function PublicLandlordPage() {
  const tags = [
    "公益出租人",
    "公益出租人資格",
    "公益出租人申請",
    "公益出租人減稅",
    "公益出租人優惠",
    "公益出租人房屋稅",
    "公益出租人地價稅",
    "公益出租人所得稅",
    "公益出租人常見問題",
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      <main className="pt-28 md:pt-36">
        {/* Hero */}
        <section className="mx-auto max-w-5xl px-6 text-center">
          <p className="text-sm font-semibold tracking-[0.2em] text-primary">
            PUBLIC LANDLORD
          </p>

          <h1 className="mt-3 text-3xl font-black md:text-5xl">
            公益出租人完整指南
          </h1>

          <p className="mx-auto mt-6 max-w-3xl text-base leading-8 text-muted-foreground">
            公益出租人制度讓房東在合法出租的同時，
            有機會享有房屋稅、地價稅與所得稅等優惠。
            本頁整理公益出租人資格、申請方式與節稅重點。
          </p>
        </section>

        {/* Tags 主分類 */}
        <section className="mx-auto mt-16 max-w-6xl px-6">
          <h2 className="text-center text-2xl font-black">
            公益出租人熱門主題
          </h2>

          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {tags.map((tag) => (
              <Link
                key={tag}
                href={`/blog?tag=${encodeURIComponent(tag)}`}
                className="rounded-2xl border border-border bg-white p-6 shadow-sm transition hover:-translate-y-1"
              >
                <h3 className="text-lg font-bold">{tag}</h3>

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
            公益出租人常見問題
          </h2>

          <div className="mt-10 space-y-6">
            <div className="rounded-2xl border border-border p-6">
              <h3 className="font-bold">什麼是公益出租人？</h3>
              <p className="mt-3 leading-7 text-muted-foreground">
                將住宅出租給符合資格租客並符合政府規定的房東制度。
              </p>

              <Link
                href="/blog?tag=公益出租人"
                className="mt-3 inline-block font-semibold text-primary"
              >
                查看相關文章 →
              </Link>
            </div>

            <div className="rounded-2xl border border-border p-6">
              <h3 className="font-bold">如何取得公益出租人資格？</h3>
              <p className="mt-3 leading-7 text-muted-foreground">
                需符合政府規定並完成申請程序。
              </p>

              <Link
                href="/blog?tag=公益出租人資格"
                className="mt-3 inline-block font-semibold text-primary"
              >
                查看相關文章 →
              </Link>
            </div>

            <div className="rounded-2xl border border-border p-6">
              <h3 className="font-bold">公益出租人有什麼稅務優惠？</h3>
              <p className="mt-3 leading-7 text-muted-foreground">
                可享房屋稅、地價稅與所得稅等相關優惠。
              </p>

              <Link
                href="/blog?tag=公益出租人減稅"
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
            想知道自己是否符合公益出租人資格？
          </h2>

          <p className="mx-auto mt-4 max-w-2xl leading-8 text-muted-foreground">
            歡迎加入 LINE 免費諮詢，協助評估房屋是否符合公益出租人資格與節稅方案。
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