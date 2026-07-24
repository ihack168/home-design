"use client";

import { FormEvent, useState } from "react";

function CloseIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6 18 18 6M6 6l12 12"
      />
    </svg>
  );
}

export default function WarningCaseForm() {
  const [nickname, setNickname] = useState("");
  const [content, setContent] = useState("");
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");

    if (nickname.trim().length < 2) {
      setFormError("請填寫投稿暱稱。");
      return;
    }

    if (content.trim().length < 20) {
      setFormError("請稍微完整描述事發經過。");
      return;
    }

    setIsSubmitting(true);

    try {
      // TODO：改成你真正的 API 或 Google Apps Script 投稿端點。
      await new Promise((resolve) => setTimeout(resolve, 600));

      setNickname("");
      setContent("");
      setShowSuccessModal(true);
    } catch {
      setFormError("目前無法送出，請稍後再試。");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-stone-300 bg-[#f7f5f0] p-5 shadow-sm sm:p-8"
      >
        <div>
          <label htmlFor="nickname" className="block text-sm font-black">
            投稿暱稱
          </label>
          <input
            id="nickname"
            type="text"
            value={nickname}
            onChange={(event) => setNickname(event.target.value)}
            maxLength={30}
            placeholder="例如：台北第一次裝潢的屋主"
            className="mt-3 w-full rounded-xl border border-stone-300 bg-white px-4 py-3.5 text-sm outline-none transition placeholder:text-stone-400 focus:border-red-600 focus:ring-4 focus:ring-red-100"
          />
        </div>

        <div className="mt-6">
          <div className="flex items-center justify-between gap-4">
            <label htmlFor="content" className="block text-sm font-black">
              發生了什麼事？
            </label>
            <span className="text-xs text-stone-400">
              {content.length}/1500
            </span>
          </div>

          <textarea
            id="content"
            value={content}
            onChange={(event) => setContent(event.target.value)}
            maxLength={1500}
            rows={9}
            placeholder="建議包含：原本承諾、付款方式、施工問題、溝通紀錄、目前結果，以及你最希望提醒其他屋主的事情。"
            className="mt-3 w-full resize-y rounded-xl border border-stone-300 bg-white px-4 py-3.5 text-sm leading-7 outline-none transition placeholder:text-stone-400 focus:border-red-600 focus:ring-4 focus:ring-red-100"
          />
        </div>

        {formError && (
          <p role="alert" className="mt-4 text-sm font-bold text-red-700">
            {formError}
          </p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-6 w-full rounded-xl bg-red-700 px-5 py-4 text-sm font-black text-white transition hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "正在送出…" : "匿名送出我的經驗"}
        </button>

        <p className="mt-4 text-center text-xs leading-5 text-stone-400">
          請勿填寫電話、地址、身分證字號或其他敏感資料
        </p>
      </form>

      {showSuccessModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="success-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/70 px-5 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setShowSuccessModal(false);
            }
          }}
        >
          <div className="relative w-full max-w-md rounded-2xl bg-white p-7 shadow-2xl sm:p-8">
            <button
              type="button"
              aria-label="關閉視窗"
              onClick={() => setShowSuccessModal(false)}
              className="absolute right-4 top-4 rounded-full p-2 text-stone-400 transition hover:bg-stone-100 hover:text-stone-900"
            >
              <CloseIcon />
            </button>

            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-xl font-black text-red-700">
              ✓
            </div>

            <h2 id="success-title" className="mt-5 text-2xl font-black">
              投稿已送出
            </h2>

            <p className="mt-4 leading-7 text-stone-600">
              內容公開前應先移除可識別資訊，並確認不會使讀者直接辨識特定個人或公司。
            </p>

            <button
              type="button"
              onClick={() => setShowSuccessModal(false)}
              className="mt-7 w-full rounded-xl bg-stone-950 px-5 py-3.5 text-sm font-black text-white transition hover:bg-stone-800"
            >
              確定
            </button>
          </div>
        </div>
      )}
    </>
  );
}