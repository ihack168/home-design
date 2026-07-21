import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "免責聲明｜台灣室內設計資訊網",
  description:
    "台灣室內設計資訊網免責聲明，說明網站內容、AI 推薦、第三方業者資訊與服務責任範圍。",
};

export default function DisclaimerPage() {
  return (
    <main className="bg-[#f8f7f3]">
      <div className="mx-auto max-w-4xl px-6 py-16">
        <p className="text-sm font-bold tracking-[0.2em] text-[#2f7a55]">
          DISCLAIMER
        </p>

        <h1 className="mt-4 text-4xl font-black">免責聲明</h1>

        <p className="mt-6 leading-8 text-black/70">
          歡迎使用台灣室內設計資訊網。使用本網站前，請詳閱以下說明。
          您繼續瀏覽或使用本網站，即表示您理解並同意本免責聲明。
        </p>

        <section className="mt-10 space-y-8">
          <div>
            <h2 className="text-2xl font-bold">一、網站資訊僅供參考</h2>
            <p className="mt-3 leading-8 text-black/70">
              本網站提供之室內設計、裝潢風格、作品圖片、建案資訊、預算規劃與相關內容，
              僅供一般資訊、靈感與比較參考，不構成專業設計、工程、法律、財務或其他形式之建議。
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold">二、AI 推薦說明</h2>
            <p className="mt-3 leading-8 text-black/70">
              本網站可能依據使用者提供的地區、設計風格、預算及其他偏好，
              透過 AI 或系統分析提供設計團隊或相關業者資訊。
              推薦結果僅供使用者進一步洽詢與比較，不代表本網站保證該業者之服務品質、
              報價、施工結果、履約能力或適合所有使用者。
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold">三、第三方業者與服務</h2>
            <p className="mt-3 leading-8 text-black/70">
              使用者與第三方設計公司、施工團隊、供應商或其他業者之間的諮詢、報價、
              簽約、付款、設計、施工、保固及爭議，均由雙方自行確認並負責。
              本網站不參與實際契約關係，亦不承擔第三方服務所產生的損失或責任。
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold">四、內容與圖片</h2>
            <p className="mt-3 leading-8 text-black/70">
              本網站部分圖片、設計示意或內容可能由 AI 生成、數位模擬或重新編排，
              不一定代表實際完工作品、真實空間或特定建案現況。
              實際尺寸、材質、色彩、格局與施工結果，仍應以現場條件及專業人員評估為準。
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold">五、外部連結</h2>
            <p className="mt-3 leading-8 text-black/70">
              本網站可能提供第三方網站、LINE、社群平台或其他外部連結。
              外部網站之內容、隱私政策、安全性與服務品質，均由該第三方自行負責。
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold">六、資訊正確性與更新</h2>
            <p className="mt-3 leading-8 text-black/70">
              我們會盡力維持資訊的正確與更新，但不保證所有內容皆完整、即時或無誤。
              建案資料、價格、服務範圍、聯絡方式及業者資訊，可能隨時間變更，
              使用者應於做出決定前自行查證。
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold">七、聯絡我們</h2>
            <div className="mt-4 rounded-2xl border bg-white p-6">
              <p>
                <strong>網站：</strong>台灣室內設計資訊網
              </p>
              <p className="mt-2">
                <strong>Email：</strong>（請填入您的 Email）
              </p>
            </div>
          </div>
        </section>

        <p className="mt-12 text-sm leading-7 text-black/50">
          本網站保留隨時修改本免責聲明之權利，更新後將公布於本頁面，
          並以最新版本為準。
        </p>
      </div>
    </main>
  );
}
