"use client";

import Link from "next/link";

import { LineConsultButton } from "@/components/line-consult-button";

export function Footer() {
  return (
    <footer className="border-t border-border/70 bg-background px-6 py-10">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-8 md:grid-cols-[1.4fr_1fr_auto] md:items-start">
          <div>
            <Link
              href="/"
              aria-label="台灣社會住宅包租代管資訊站首頁"
              className="inline-flex items-center gap-3"
            >
              <img
                src="/images/logo.png"
                alt=""
                width={44}
                height={44}
                className="h-11 w-11 rounded-full object-cover"
              />

              <span>
                <span className="block text-lg font-black tracking-tight text-foreground">
                  台灣社會住宅包租代管資訊站
                </span>

                <span className="mt-1 block text-xs text-muted-foreground">
                  凌群不動產建立並經營
                </span>
              </span>
            </Link>

            <p className="mt-4 max-w-xl text-sm leading-7 text-muted-foreground">
              整理社會住宅包租代管、公益出租人、房東出租、
              租屋補助、租客權益與房屋出租管理相關資訊。
            </p>
          </div>

          <nav aria-label="網站政策" className="text-sm">
            <p className="font-bold text-foreground">網站政策</p>

            <div className="mt-3 flex flex-col gap-2 text-muted-foreground">
              <Link
                href="/privacy-policy"
                className="transition-colors hover:text-primary"
              >
                隱私權政策
              </Link>

              <Link
                href="/terms"
                className="transition-colors hover:text-primary"
              >
                使用條款
              </Link>

              <Link
                href="/blog"
                className="transition-colors hover:text-primary"
              >
                最新文章
              </Link>
            </div>
          </nav>

          <div className="md:text-right">
            <p className="text-sm font-bold text-foreground">
              房東出租與包租代管諮詢
            </p>

            <LineConsultButton className="mt-3 inline-flex rounded-full bg-[#06C755] px-5 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90">
              加入 LINE 免費諮詢
            </LineConsultButton>
          </div>
        </div>

        <div className="mt-8 border-t border-border/70 pt-6">
          <p className="text-xs leading-6 text-muted-foreground">
            本站由凌群不動產建立並經營，屬民間資訊網站，並非政府官方網站。
            網站內容僅供一般資訊參考，不構成法律、稅務、不動產、租賃或補助申請建議；
            社會住宅包租代管、租屋補助、公益出租人及相關政策資格，
            請以中央與地方政府最新公告為準。
          </p>

          <p className="mt-4 text-xs text-muted-foreground">
            © 2026 凌群不動產. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
