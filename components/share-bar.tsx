"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type ShareBarProps = {
  url?: string;
  title?: string;
  variant?: "light" | "dark";
  contactHref?: string;
};

export function ShareBar({
  url: providedUrl = "",
  title = "",
  variant = "light",
  contactHref = "/line",
}: ShareBarProps) {
  const [currentUrl, setCurrentUrl] = useState(providedUrl);
  const [copied, setCopied] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!providedUrl) {
      setCurrentUrl(window.location.href);
    }
  }, [providedUrl]);

  const isDark = variant === "dark";
  const encodedUrl = encodeURIComponent(currentUrl);
  const encodedTitle = encodeURIComponent(title);

  const handleCopy = async () => {
    if (!currentUrl) return;

    try {
      await navigator.clipboard.writeText(currentUrl);
    } catch {
      const textArea = document.createElement("textarea");

      textArea.value = currentUrl;
      textArea.setAttribute("readonly", "");
      textArea.style.position = "fixed";
      textArea.style.opacity = "0";

      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
    }

    setCopied(true);

    window.setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  const handleContact = () => {
    router.push(contactHref);
  };

  return (
    <div className="fixed bottom-5 left-1/2 z-[9999] w-[calc(100%-1.5rem)] max-w-max -translate-x-1/2 md:bottom-6">
      <div
        className={`flex items-center gap-1.5 rounded-full border px-2 py-2 shadow-2xl backdrop-blur-xl md:gap-2 md:px-4 md:py-3 ${
          isDark
            ? "border-white/10 bg-black/85 text-white shadow-black/40"
            : "border-black/5 bg-white/95 text-gray-900 shadow-black/15"
        }`}
      >
        <span
          className={`hidden whitespace-nowrap pr-1 text-xs font-bold md:block ${
            isDark ? "text-gray-400" : "text-gray-500"
          }`}
        >
          分享
        </span>

        <a
          href={
            currentUrl
              ? `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`
              : undefined
          }
          target="_blank"
          rel="noopener noreferrer"
          aria-label="分享到 Facebook"
          aria-disabled={!currentUrl}
          className={`whitespace-nowrap rounded-full bg-[#1877F2] px-3 py-2 text-[11px] font-bold text-white transition hover:-translate-y-0.5 hover:opacity-90 md:px-4 md:text-xs ${
            !currentUrl ? "pointer-events-none opacity-50" : ""
          }`}
        >
          FB
        </a>

        <a
          href={
            currentUrl
              ? `https://social-plugins.line.me/lineit/share?url=${encodedUrl}${
                  title ? `&text=${encodedTitle}` : ""
                }`
              : undefined
          }
          target="_blank"
          rel="noopener noreferrer"
          aria-label="分享到 LINE"
          aria-disabled={!currentUrl}
          className={`whitespace-nowrap rounded-full bg-[#06C755] px-3 py-2 text-[11px] font-bold text-white transition hover:-translate-y-0.5 hover:bg-[#00B900] md:px-4 md:text-xs ${
            !currentUrl ? "pointer-events-none opacity-50" : ""
          }`}
        >
          LINE
        </a>

        <button
          type="button"
          onClick={handleCopy}
          disabled={!currentUrl}
          aria-live="polite"
          className={`whitespace-nowrap rounded-full px-3 py-2 text-[11px] font-bold transition disabled:cursor-not-allowed disabled:opacity-50 md:px-4 md:text-xs ${
            isDark
              ? "bg-white/10 text-white hover:bg-white/20"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          {copied ? "已複製" : "COPY"}
        </button>

        <div
          aria-hidden="true"
          className={`mx-0.5 h-5 w-px ${
            isDark ? "bg-white/20" : "bg-gray-200"
          }`}
        />

        <button
          type="button"
          onClick={handleContact}
          className="whitespace-nowrap rounded-full bg-[#06C755] px-3 py-2 text-[11px] font-black text-white transition hover:-translate-y-0.5 hover:bg-[#00B900] md:px-4 md:text-xs"
        >
          聯絡我 →
        </button>
      </div>
    </div>
  );
}
