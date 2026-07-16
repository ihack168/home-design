"use client";

import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { LineConsultButton } from "@/components/line-consult-button";

export default function LandlordSubsidiesPage() {
  const subsidyTags = [
    "租屋補助申請",
    "租屋補助資格",
    "青年租屋補助",
    "房屋修繕補助",
    "老屋修繕補助",
    "社會住宅補助",
    "房東補助",
    "公益出租人",
    "房東節稅",
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      <main className="pt-28 md:pt-36">
        {/* Hero */}
        <section className="mx-auto max-w-5xl px-6 text-center">
          <p className="text-sm font-semibold tracking-[0.2em] text-primary">
            LANDLORD SUBSIDIES
          </p>

          <h1 className="mt-3 text-3xl font-black md:text-5xl">
            房東補助懶人包
          </h1>

          <p className="mx-auto mt-6 max-w-3xl text-base leading-8 text-muted-foreground">
            房東出租房屋後，除了租金收入之外，還有機會申請租屋補助、
            公益出租人優惠、社會住宅房東補助與房屋修繕補助等政府資源。
            本頁整理房東最常見的補助資訊與申請方向。
          </p>
        </section>

        {/* 補助分類 */}
        <section className="mx-auto mt-16 max-w-6xl px-6">
          <h2 className="text-center text-2xl font-black">
            房東補助熱門主題
          </h2>

          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {subsidyTags.map((tag) => (
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
            房東補助常見問題
          </h2>

          <div className="mt-10 space-y-6">
            <div className="rounded-2xl border border-border p-6">
              <h3 className="font-bold">
                房東可以申請哪些補助？
              </h3>

              <p className="mt-3 leading-7 text-muted-foreground">
                常見包含公益出租人優惠、房屋修繕補助、
                社會住宅房東補助與相關租稅優惠。
              </p>

              <Link
                href="/blog?tag=房東補助"
                className="mt-3 inline-block font-semibold text-primary"
              >
                查看相關文章 →
              </Link>
            </div>

            <div className="rounded-2xl border border-border p-6">
              <h3 className="font-bold">
                房東出租房屋可以節稅嗎？
              </h3>

              <p className="mt-3 leading-7 text-muted-foreground">
                可透過公益出租人資格、合法申報與相關稅務規定進行節稅規劃。
              </p>

              <Link
                href="/blog?tag=房東節稅"
                className="mt-3 inline-block font-semibold text-primary"
              >
                查看相關文章 →
              </Link>
            </div>

            <div className="rounded-2xl border border-border p-6">
              <h3 className="font-bold">
                房東加入社會住宅有補助嗎？
              </h3>

              <p className="mt-3 leading-7 text-muted-foreground">
                符合資格的房東可享有政府提供的相關補助與稅務優惠。
              </p>

              <Link
                href="/blog?tag=社會住宅補助"
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
            不確定自己能申請哪些補助？
          </h2>

          <p className="mx-auto mt-4 max-w-2xl leading-8 text-muted-foreground">
            歡迎加入 LINE 免費諮詢，協助了解房屋是否適合申請補助、
            公益出租人或加入包租代管方案。
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