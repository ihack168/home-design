
"use client"

import { ReactNode, useEffect, useId, useState } from "react"
import { createPortal } from "react-dom"

const GOOGLE_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbwFpZDhMveHhdOYdDkh02JpWk28jUCBqikyM-Urg_6Uw2jTH7d8ZluKxinKTWh5_20N/exec"

const LINE_ADD_URL = "https://line.me/R/ti/p/~line88.tw"

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

interface FormErrors {
  district?: string
  lastName?: string
  phoneLast3?: string
  submit?: string
}

export function LineConsultButton({
  children,
  className = "",
  onClick,
}: LineConsultButtonProps) {
  const modalTitleId = useId()
  const modalDescriptionId = useId()

  const [mounted, setMounted] = useState(false)
  const [showModal, setShowModal] = useState(false)

  const [district, setDistrict] = useState("")
  const [lastName, setLastName] = useState("")
  const [phoneLast3, setPhoneLast3] = useState("")
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})

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

    const originalOverflow = document.body.style.overflow

    document.body.style.overflow = "hidden"
    window.addEventListener("keydown", handleEscape)

    return () => {
      document.body.style.overflow = originalOverflow
      window.removeEventListener("keydown", handleEscape)
    }
  }, [showModal, loading])

  const resetModal = () => {
    setShowModal(false)
    setDistrict("")
    setLastName("")
    setPhoneLast3("")
    setErrors({})
    setLoading(false)
  }

  const handleOpenModal = () => {
    setDistrict("")
    setLastName("")
    setPhoneLast3("")
    setErrors({})
    setLoading(false)
    setShowModal(true)
  }

  const validateForm = () => {
    const nextErrors: FormErrors = {}

    if (!district.trim()) {
      nextErrors.district = "請選擇需要服務的縣市"
    }

    if (!lastName.trim()) {
      nextErrors.lastName = "請輸入您的姓氏"
    }

    if (!/^\d{3}$/.test(phoneLast3.trim())) {
      nextErrors.phoneLast3 = "請輸入 3 位數字"
    }

    setErrors(nextErrors)

    return Object.keys(nextErrors).length === 0
  }

  const handleSubmitLineConsult = async () => {
    if (!validateForm()) return

    const cleanDistrict = district.trim()
    const cleanLastName = lastName.trim()
    const cleanPhoneLast3 = phoneLast3.trim()

    try {
      setLoading(true)
      setErrors({})

      const res = await fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        body: JSON.stringify({
          action: "lineConsult",
          vendorId: VENDOR_ID,
          vendorName: VENDOR_NAME,
          district: cleanDistrict,
          lastName: cleanLastName,
          phoneLast3: cleanPhoneLast3,
          sourcePage: window.location.href,
        }),
      })

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`)
      }

      const result = await res.json()

      if (!result.success) {
        setErrors({
          submit: result.message || "資料送出失敗，請稍後再試。",
        })
        return
      }

      resetModal()
      window.open(LINE_ADD_URL, "_blank", "noopener,noreferrer")
    } catch (error) {
      console.error("LINE consult submit error:", error)

      setErrors({
        submit: "目前無法送出資料，請稍後再試。",
      })
    } finally {
      setLoading(false)
    }
  }

  const modalContent = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center overflow-y-auto bg-black/60 px-4 py-6 backdrop-blur-[3px] sm:py-10"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !loading) {
          resetModal()
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={modalTitleId}
        aria-describedby={modalDescriptionId}
        className="relative my-auto w-full max-w-lg overflow-hidden rounded-[28px] border border-black/5 bg-[#fbfaf7] shadow-[0_30px_90px_rgba(0,0,0,0.28)]"
      >
        <button
          type="button"
          onClick={resetModal}
          disabled={loading}
          aria-label="關閉諮詢表單"
          className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-white/90 text-xl text-foreground shadow-sm transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          ×
        </button>

        <div className="border-b border-black/5 bg-white px-6 pb-6 pt-7 sm:px-8 sm:pb-7 sm:pt-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#06C755]/10">
              <span className="text-xl" aria-hidden="true">
                💬
              </span>
            </div>

            <div>
              <p className="text-xs font-bold tracking-[0.18em] text-[#06A947]">
                DESIGN CONSULTATION
              </p>

              <h3
                id={modalTitleId}
                className="mt-1 text-2xl font-black tracking-tight text-foreground sm:text-[28px]"
              >
                預約室內設計諮詢
              </h3>
            </div>
          </div>

          <p
            id={modalDescriptionId}
            className="mt-4 max-w-md text-sm leading-7 text-muted-foreground"
          >
            填寫簡單資料後將帶您前往 LINE。加入好友後，請傳送您的建案名稱、格局或喜歡的設計圖片。
          </p>

          <div className="mt-5 flex flex-wrap gap-2">
            <span className="rounded-full bg-secondary px-3 py-1.5 text-xs font-semibold text-muted-foreground">
              免費初步諮詢
            </span>
            <span className="rounded-full bg-secondary px-3 py-1.5 text-xs font-semibold text-muted-foreground">
              不需填寫完整電話
            </span>
            <span className="rounded-full bg-secondary px-3 py-1.5 text-xs font-semibold text-muted-foreground">
              LINE 直接討論
            </span>
          </div>
        </div>

        <div className="px-6 py-6 sm:px-8 sm:py-7">
          <div className="space-y-5">
            <div>
              <label
                htmlFor="consult-district"
                className="flex items-center justify-between text-sm font-bold text-foreground"
              >
                <span>
                  服務地區
                  <span className="ml-1 text-red-500">*</span>
                </span>

                <span className="text-xs font-normal text-muted-foreground">
                  請選擇縣市
                </span>
              </label>

              <div className="relative mt-2">
                <select
                  id="consult-district"
                  value={district}
                  onChange={(event) => {
                    setDistrict(event.target.value)

                    if (errors.district) {
                      setErrors((current) => ({
                        ...current,
                        district: undefined,
                      }))
                    }
                  }}
                  disabled={loading}
                  aria-invalid={Boolean(errors.district)}
                  className={`min-h-13 w-full appearance-none rounded-2xl border bg-white px-4 py-3.5 pr-11 text-sm text-foreground outline-none transition ${
                    errors.district
                      ? "border-red-400 ring-2 ring-red-100"
                      : "border-black/10 focus:border-primary focus:ring-4 focus:ring-primary/10"
                  } disabled:cursor-not-allowed disabled:opacity-60`}
                >
                  <option value="">選擇需要服務的縣市</option>

                  {TAIWAN_CITIES.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>

                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs text-muted-foreground"
                >
                  ▼
                </span>
              </div>

              {errors.district && (
                <p className="mt-2 text-xs font-medium text-red-500">
                  {errors.district}
                </p>
              )}
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="consult-last-name"
                  className="text-sm font-bold text-foreground"
                >
                  貴姓
                  <span className="ml-1 text-red-500">*</span>
                </label>

                <input
                  id="consult-last-name"
                  type="text"
                  value={lastName}
                  onChange={(event) => {
                    setLastName(event.target.value.slice(0, 10))

                    if (errors.lastName) {
                      setErrors((current) => ({
                        ...current,
                        lastName: undefined,
                      }))
                    }
                  }}
                  placeholder="例如：王"
                  autoComplete="family-name"
                  disabled={loading}
                  aria-invalid={Boolean(errors.lastName)}
                  className={`mt-2 min-h-13 w-full rounded-2xl border bg-white px-4 py-3.5 text-sm text-foreground outline-none transition placeholder:text-muted-foreground/70 ${
                    errors.lastName
                      ? "border-red-400 ring-2 ring-red-100"
                      : "border-black/10 focus:border-primary focus:ring-4 focus:ring-primary/10"
                  } disabled:cursor-not-allowed disabled:opacity-60`}
                />

                {errors.lastName && (
                  <p className="mt-2 text-xs font-medium text-red-500">
                    {errors.lastName}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="consult-phone-last-3"
                  className="text-sm font-bold text-foreground"
                >
                  手機後 3 碼
                  <span className="ml-1 text-red-500">*</span>
                </label>

                <input
                  id="consult-phone-last-3"
                  type="text"
                  value={phoneLast3}
                  onChange={(event) => {
                    const value = event.target.value
                      .replace(/\D/g, "")
                      .slice(0, 3)

                    setPhoneLast3(value)

                    if (errors.phoneLast3) {
                      setErrors((current) => ({
                        ...current,
                        phoneLast3: undefined,
                      }))
                    }
                  }}
                  placeholder="例如：168"
                  inputMode="numeric"
                  autoComplete="off"
                  maxLength={3}
                  disabled={loading}
                  aria-invalid={Boolean(errors.phoneLast3)}
                  className={`mt-2 min-h-13 w-full rounded-2xl border bg-white px-4 py-3.5 text-sm tracking-[0.2em] text-foreground outline-none transition placeholder:tracking-normal placeholder:text-muted-foreground/70 ${
                    errors.phoneLast3
                      ? "border-red-400 ring-2 ring-red-100"
                      : "border-black/10 focus:border-primary focus:ring-4 focus:ring-primary/10"
                  } disabled:cursor-not-allowed disabled:opacity-60`}
                />

                {errors.phoneLast3 && (
                  <p className="mt-2 text-xs font-medium text-red-500">
                    {errors.phoneLast3}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="mt-5 rounded-2xl border border-black/5 bg-white/70 px-4 py-3.5">
            <p className="text-xs leading-6 text-muted-foreground">
              手機後 3 碼僅用於您加入 LINE
              後，辨識本次諮詢資料，不需提供完整手機號碼。
            </p>
          </div>

          {errors.submit && (
            <div
              role="alert"
              className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600"
            >
              {errors.submit}
            </div>
          )}

          <button
            type="button"
            onClick={handleSubmitLineConsult}
            disabled={loading}
            className="mt-6 flex min-h-14 w-full items-center justify-center rounded-2xl bg-[#06C755] px-5 py-4 text-base font-black text-white shadow-[0_12px_30px_rgba(6,199,85,0.25)] transition hover:-translate-y-0.5 hover:bg-[#05b94e] hover:shadow-[0_16px_35px_rgba(6,199,85,0.3)] disabled:cursor-not-allowed disabled:translate-y-0 disabled:opacity-60"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                資料送出中
              </span>
            ) : (
              <span className="flex items-center gap-2">
                送出資料並加入 LINE
                <span aria-hidden="true">→</span>
              </span>
            )}
          </button>

          <div className="mt-4 flex items-center justify-center gap-2 text-center text-[11px] leading-5 text-muted-foreground">
            <span aria-hidden="true">🔒</span>
            <span>送出即表示您同意本站使用資料聯繫本次諮詢</span>
          </div>
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