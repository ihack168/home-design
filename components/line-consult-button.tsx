"use client"

import { ReactNode, useEffect, useState } from "react"
import { createPortal } from "react-dom"

const GOOGLE_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbwFpZDhMveHhdOYdDkh02JpWk28jUCBqikyM-Urg_6Uw2jTH7d8ZluKxinKTWh5_20N/exec"

const LINE_ADD_URL = "https://line.me/R/ti/p/~0910933178"

const VENDOR_ID = "home-design"
const VENDOR_NAME = "台灣室內設計資訊網"

const TAIWAN_CITIES = [
  "基隆市",
  "台北市",
  "新北市",
  "桃園市",
  "新竹市",
  "台中市",
  "彰化縣",
  "雲林縣",
  "嘉義市",
  "台南市",
  "高雄市",
  "宜蘭縣",
]

interface LineConsultButtonProps {
  children: ReactNode
  className?: string
  onClick?: () => void
}

export function LineConsultButton({
  children,
  className = "",
  onClick,
}: LineConsultButtonProps) {
  const [mounted, setMounted] = useState(false)
  const [showModal, setShowModal] = useState(false)

  const [district, setDistrict] = useState("")
  const [lastName, setLastName] = useState("")
  const [phoneLast3, setPhoneLast3] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!showModal) return

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !loading) {
        resetModal()
      }
    }

    document.body.style.overflow = "hidden"
    window.addEventListener("keydown", handleEscape)

    return () => {
      document.body.style.overflow = ""
      window.removeEventListener("keydown", handleEscape)
    }
  }, [showModal, loading])

  const resetModal = () => {
    setShowModal(false)
    setDistrict("")
    setLastName("")
    setPhoneLast3("")
    setLoading(false)
  }

  const handleOpenModal = () => {
    setDistrict("")
    setLastName("")
    setPhoneLast3("")
    setLoading(false)
    setShowModal(true)
  }

  const handleSubmitLineConsult = async () => {
    const cleanDistrict = district.trim()
    const cleanLastName = lastName.trim()
    const cleanPhoneLast3 = phoneLast3.trim()

    if (!cleanDistrict) {
      alert("請選擇需要服務的地區")
      return
    }

    if (!cleanLastName) {
      alert("請輸入貴姓")
      return
    }

    if (!/^\d{3}$/.test(cleanPhoneLast3)) {
      alert("請輸入手機後 3 碼")
      return
    }

    try {
      setLoading(true)

      const res = await fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        body: JSON.stringify({
          action: "lineConsult",
          vendorId: VENDOR_ID,
          vendorName: VENDOR_NAME,

          // 對應 GAS 的 district 欄位
          district: cleanDistrict,

          lastName: cleanLastName,
          phoneLast3: cleanPhoneLast3,
          sourcePage: window.location.href,
        }),
      })

      const result = await res.json()

      if (!result.success) {
        alert(result.message || "送出失敗，請稍後再試")
        return
      }

      resetModal()

      window.open(LINE_ADD_URL, "_blank", "noopener,noreferrer")
    } catch (error) {
      console.error("LINE consult submit error:", error)
      alert("送出失敗，請稍後再試")
    } finally {
      setLoading(false)
    }
  }

  const modalContent = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center overflow-y-auto bg-black/55 px-4 py-8 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !loading) {
          resetModal()
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="line-consult-title"
        className="my-auto w-full max-w-md overflow-hidden rounded-[2rem] border border-white/20 bg-white shadow-2xl"
      >
        <div className="bg-gradient-to-br from-primary to-primary/80 px-6 py-7 text-primary-foreground">
          <h3
            id="line-consult-title"
            className="mt-2 text-2xl font-black tracking-tight"
          >
            預約室內設計諮詢
          </h3>
        </div>

        <div className="p-6">
          <div>
            <label
              htmlFor="district"
              className="text-sm font-bold text-foreground"
            >
              需要服務的地區
              <span className="ml-1 text-red-500">*</span>
            </label>

            <select
              id="district"
              value={district}
              onChange={(event) => setDistrict(event.target.value)}
              disabled={loading}
              className="mt-2 w-full appearance-none rounded-xl border border-border bg-white px-4 py-3.5 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <option value="">請選擇縣市</option>

              {TAIWAN_CITIES.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-5">
            <label
              htmlFor="last-name"
              className="text-sm font-bold text-foreground"
            >
              貴姓
              <span className="ml-1 text-red-500">*</span>
            </label>

            <input
              id="last-name"
              type="text"
              value={lastName}
              onChange={(event) => {
                setLastName(event.target.value.slice(0, 10))
              }}
              placeholder="例如：王"
              autoComplete="family-name"
              disabled={loading}
              className="mt-2 w-full rounded-xl border border-border px-4 py-3.5 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/15 disabled:cursor-not-allowed disabled:opacity-60"
            />
          </div>

          <div className="mt-5">
            <label
              htmlFor="phone-last-3"
              className="text-sm font-bold text-foreground"
            >
              手機後 3 碼
              <span className="ml-1 text-red-500">*</span>
            </label>

            <input
              id="phone-last-3"
              type="text"
              value={phoneLast3}
              onChange={(event) => {
                const value = event.target.value
                  .replace(/\D/g, "")
                  .slice(0, 3)

                setPhoneLast3(value)
              }}
              placeholder="例如：168"
              inputMode="numeric"
              autoComplete="off"
              maxLength={3}
              disabled={loading}
              className="mt-2 w-full rounded-xl border border-border px-4 py-3.5 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/15 disabled:cursor-not-allowed disabled:opacity-60"
            />

            <p className="mt-2 text-xs leading-5 text-muted-foreground">
              手機後 3 碼僅用於 LINE 加好友後辨識您的諮詢資料。
            </p>
          </div>

          <div className="mt-7 flex gap-3">
            <button
              type="button"
              onClick={resetModal}
              disabled={loading}
              className="flex-1 rounded-xl border border-border px-4 py-3.5 text-sm font-bold text-foreground transition hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-60"
            >
              取消
            </button>

            <button
              type="button"
              onClick={handleSubmitLineConsult}
              disabled={loading}
              className="flex-[1.4] rounded-xl bg-primary px-4 py-3.5 text-sm font-bold text-primary-foreground shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "資料送出中..." : "送出並加 LINE"}
            </button>
          </div>

          <p className="mt-4 text-center text-xs leading-5 text-muted-foreground">
            送出即表示您同意本站使用上述資料聯繫本次諮詢。
          </p>
        </div>
      </div>
    </div>
  )

  return (
    <>
      <button
        type="button"
        onClick={() => {
          onClick?.()
          handleOpenModal()
        }}
        className={className}
      >
        {children}
      </button>

      {mounted && showModal && createPortal(modalContent, document.body)}
    </>
  )
}