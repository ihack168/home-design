import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "服務條款｜台灣室內設計資訊網",
  description:
    "台灣室內設計資訊網服務條款，說明網站使用規範、AI 推薦服務、使用者責任及智慧財產權。",
};

export default function TermsPage() {
  return (
    <main className="bg-[#f8f7f3]">
      <div className="mx-auto max-w-4xl px-6 py-16">
        <p className="text-sm font-bold tracking-[0.2em] text-[#2f7a55]">
          TERMS OF SERVICE
        </p>

        <h1 className="mt-4 text-4xl font-black">服務條款</h1>

        <p className="mt-6 leading-8 text-black/70">
          歡迎使用台灣室內設計資訊網（以下簡稱「本網站」）。
          使用本網站即表示您已閱讀、理解並同意遵守本服務條款。
        </p>

        <section className="mt-10 space-y-8">
          <div>
            <h2 className="text-2xl font-bold">一、服務內容</h2>
            <p className="mt-3 leading-8 text-black/70">
              本網站提供室內設計資訊、裝潢靈感、AI 推薦、設計團隊資訊及相關內容，
              所有資訊僅供參考，不保證適用於所有個案。
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold">二、AI 推薦服務</h2>
            <p className="mt-3 leading-8 text-black/70">
              AI 推薦會依據使用者提供的地區、風格、預算等條件分析，
              推薦結果僅供進一步比較與洽詢，不代表品質保證、合作承諾或施工保證。
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold">三、使用者責任</h2>
            <ul className="mt-3 list-disc space-y-2 pl-6 leading-8 text-black/70">
              <li>提供真實且合法的資料。</li>
              <li>不得利用本網站從事違法、侵權或干擾網站運作之行為。</li>
              <li>與第三方業者之交易、合約及付款應自行確認。</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-bold">四、智慧財產權</h2>
            <p className="mt-3 leading-8 text-black/70">
              本網站之文字、版面、程式、AI 生成內容、圖片及其他素材，
              除另有說明外，均受相關智慧財產權法令保護，未經授權不得重製、
              散布、修改或商業使用。
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold">五、服務變更</h2>
            <p className="mt-3 leading-8 text-black/70">
              本網站得視營運需求新增、修改、暫停或終止部分服務內容，
              恕不另行通知。
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold">六、聯絡我們</h2>
            <div className="mt-4 rounded-2xl border bg-white p-6">
              <p><strong>網站：</strong>台灣室內設計資訊網</p>
              <p className="mt-2"><strong>Email：</strong>（請填入您的 Email）</p>
            </div>
          </div>
        </section>

        <p className="mt-12 text-sm text-black/50">
          本服務條款將依網站營運需求適時更新，最新版本以本頁公告內容為準。
        </p>
      </div>
    </main>
  );
}
