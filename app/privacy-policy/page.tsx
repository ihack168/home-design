import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy｜台灣室內設計資訊網",
  description: "台灣室內設計資訊網隱私權政策。",
};

export default function PrivacyPolicyPage() {
  return (
    <main className="bg-[#f8f7f3]">
      <div className="mx-auto max-w-4xl px-6 py-16">
        <h1 className="text-4xl font-black">隱私權政策（Privacy Policy）</h1>

        <p className="mt-6 leading-8 text-black/70">
          本網站重視您的個人資料與隱私安全。本政策說明我們蒐集、使用及保護資料的方式。
        </p>

        <section className="mt-10 space-y-8">
          <div>
            <h2 className="text-2xl font-bold">資料蒐集</h2>
            <p className="mt-3 leading-8 text-black/70">
              當您使用 AI 推薦、聯絡表單或瀏覽網站時，我們可能蒐集姓名、聯絡資訊、地區、設計風格、預算、IP、瀏覽器及 Cookie 等必要資訊。
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold">資料用途</h2>
            <ul className="mt-3 list-disc pl-6 leading-8 text-black/70">
              <li>提供 AI 推薦與網站服務</li>
              <li>回覆您的諮詢</li>
              <li>改善網站內容與使用體驗</li>
              <li>網站流量分析與安全維護</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-bold">Cookie 與第三方服務</h2>
            <p className="mt-3 leading-8 text-black/70">
              本網站可能使用 Cookie、分析工具及第三方雲端服務，以提升網站功能與效能。
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold">聯絡我們</h2>
            <div className="mt-4 rounded-2xl border bg-white p-6">
              <p><strong>網站：</strong>台灣室內設計資訊網</p>
              <p><strong>Email：</strong>（請填入您的 Email）</p>
            </div>
          </div>
        </section>

        <p className="mt-10 text-sm text-black/50">
          本政策將依網站營運需求更新，最新版本以本頁公告為準。
        </p>
      </div>
    </main>
  );
}
