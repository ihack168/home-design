"use client"

import { ReactNode, useEffect, useId, useState } from "react"
import { createPortal } from "react-dom"

const GOOGLE_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbwFpZDhMveHhdOYdDkh02JpWk28jUCBqikyM-Urg_6Uw2jTH7d8ZluKxinKTWh5_20N/exec"

const LINE_ID = "@line88.tw"
const LINE_ADD_URL = "https://line.me/R/ti/p/~line88.tw"

const VENDOR_ID = "home-design"
const VENDOR_NAME = "台灣室內設計資訊網"

const DESIGN_STYLES = [
  { id: "modern", name: "現代簡約", icon: "◻" },
  { id: "japanese", name: "日式無印", icon: "木" },
  { id: "wabi-sabi", name: "侘寂風", icon: "◯" },
  { id: "nordic", name: "北歐風", icon: "△" },
  { id: "american-country", name: "美式鄉村", icon: "⌂" },
] as const

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

type ModalStep = "form" | "analyzing" | "result"

interface LineConsultButtonProps {
  children: ReactNode
  className?: string
  onClick?: () => void
}

interface FormErrors {
  district?: string
  designStyle?: string
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

  const [mounted, setMounted] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [step, setStep] = useState<ModalStep>("form")

  const [district, setDistrict] = useState("")
  const [designStyle, setDesignStyle] = useState("")
  const [lastName, setLastName] = useState("")
  const [phoneLast3, setPhoneLast3] = useState("")
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [errors, setErrors] = useState<FormErrors>({})

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!showModal) return

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !loading && step !== "analyzing") {
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
  }, [showModal, loading, step])

  useEffect(() => {
    if (step !== "analyzing") return

    setProgress(8)

    const startedAt = Date.now()
    const duration = 5000

    const timer = window.setInterval(() => {
      const elapsed = Date.now() - startedAt
      const ratio = Math.min(elapsed / duration, 1)
      const easedProgress = 8 + Math.round(92 * (1 - Math.pow(1 - ratio, 2.2)))

      setProgress(Math.min(easedProgress, 100))

      if (ratio >= 1) {
        window.clearInterval(timer)
        setProgress(100)
        setStep("result")
        setLoading(false)
      }
    }, 80)

    return () => window.clearInterval(timer)
  }, [step])

  const resetModal = () => {
    setShowModal(false)
    setStep("form")
    setDistrict("")
    setDesignStyle("")
    setLastName("")
    setPhoneLast3("")
    setProgress(0)
    setErrors({})
    setLoading(false)
  }

  const handleOpenModal = () => {
    setStep("form")
    setDistrict("")
    setDesignStyle("")
    setLastName("")
    setPhoneLast3("")
    setProgress(0)
    setErrors({})
    setLoading(false)
    setShowModal(true)
  }

  const validateForm = () => {
    const nextErrors: FormErrors = {}

    if (!district.trim()) {
      nextErrors.district = "請選擇需要服務的縣市"
    }

    if (!designStyle.trim()) {
      nextErrors.designStyle = "請選擇喜歡的設計風格"
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
    const cleanDesignStyle = designStyle.trim()
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
          designStyle: cleanDesignStyle,
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
        setLoading(false)
        return
      }

      setStep("analyzing")
    } catch (error) {
      console.error("LINE consult submit error:", error)
      setErrors({
        submit: "目前無法送出資料，請稍後再試。",
      })
      setLoading(false)
    }
  }

  const selectedStyleName =
    DESIGN_STYLES.find((style) => style.id === designStyle)?.name || designStyle

  const analysisMessage =
    progress < 35
      ? "正在分析您的服務區域與需求條件"
      : progress < 70
        ? `正在比對「${selectedStyleName}」相關設計條件`
        : progress < 95
          ? "正在整理適合您的諮詢窗口"
          : "推薦結果即將完成"

  const modalContent = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center overflow-y-auto bg-black/60 px-4 py-6 backdrop-blur-[3px] sm:py-10"
      onMouseDown={(event) => {
        if (
          event.target === event.currentTarget &&
          !loading &&
          step !== "analyzing"
        ) {
          resetModal()
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={modalTitleId}
        className="relative my-auto w-full max-w-xl overflow-hidden rounded-[28px] border border-black/5 bg-[#fbfaf7] shadow-[0_30px_90px_rgba(0,0,0,0.28)]"
      >
        {step !== "analyzing" && (
          <button
            type="button"
            onClick={resetModal}
            disabled={loading}
            aria-label="關閉諮詢視窗"
            className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-white/90 text-xl text-foreground shadow-sm transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            ×
          </button>
        )}

        {step === "form" && (
          <>
            <div className="border-b border-black/5 bg-white px-6 pb-6 pt-7 sm:px-8 sm:pb-7 sm:pt-8">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#06C755]/10">
                  <span className="text-xl" aria-hidden="true">
                    ✦
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
                    尋找適合您的設計諮詢
                  </h3>
                </div>
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
                      服務地區<span className="ml-1 text-red-500">*</span>
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
                      className={`min-h-[52px] w-full appearance-none rounded-2xl border bg-white px-4 py-3.5 pr-11 text-sm text-foreground outline-none transition ${
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

                <fieldset>
                  <legend className="flex w-full items-center justify-between text-sm font-bold text-foreground">
                    <span>
                      我喜歡的設計風格
                      <span className="ml-1 text-red-500">*</span>
                    </span>
                    <span className="text-xs font-normal text-muted-foreground">
                      請選擇一種
                    </span>
                  </legend>

                  <div className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-5">
                    {DESIGN_STYLES.map((style) => {
                      const selected = designStyle === style.id

                      return (
                        <button
                          key={style.id}
                          type="button"
                          onClick={() => {
                            setDesignStyle(style.id)
                            if (errors.designStyle) {
                              setErrors((current) => ({
                                ...current,
                                designStyle: undefined,
                              }))
                            }
                          }}
                          aria-pressed={selected}
                          disabled={loading}
                          className={`flex min-h-[88px] flex-col items-center justify-center gap-2 rounded-2xl border px-2 py-3 text-center transition ${
                            selected
                              ? "border-[#06C755] bg-[#06C755]/10 text-[#058a3b] ring-2 ring-[#06C755]/20"
                              : "border-black/10 bg-white text-foreground hover:-translate-y-0.5 hover:border-black/20 hover:shadow-sm"
                          } disabled:cursor-not-allowed disabled:opacity-60`}
                        >
                          <span
                            className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-black ${
                              selected ? "bg-[#06C755] text-white" : "bg-black/5"
                            }`}
                            aria-hidden="true"
                          >
                            {selected ? "✓" : style.icon}
                          </span>
                          <span className="text-xs font-bold leading-4">
                            {style.name}
                          </span>
                        </button>
                      )
                    })}
                  </div>

                  {errors.designStyle && (
                    <p className="mt-2 text-xs font-medium text-red-500">
                      {errors.designStyle}
                    </p>
                  )}
                </fieldset>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="consult-last-name"
                      className="text-sm font-bold text-foreground"
                    >
                      貴姓<span className="ml-1 text-red-500">*</span>
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
                      className={`mt-2 min-h-[52px] w-full rounded-2xl border bg-white px-4 py-3.5 text-sm text-foreground outline-none transition placeholder:text-muted-foreground/70 ${
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
                      className={`mt-2 min-h-[52px] w-full rounded-2xl border bg-white px-4 py-3.5 text-sm tracking-[0.2em] text-foreground outline-none transition placeholder:tracking-normal placeholder:text-muted-foreground/70 ${
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
                    開始推薦分析<span aria-hidden="true">→</span>
                  </span>
                )}
              </button>

              <div className="mt-4 flex items-center justify-center gap-2 text-center text-[11px] leading-5 text-muted-foreground">
                <span aria-hidden="true">🔒</span>
                <span>送出即表示您同意本站使用資料聯繫本次諮詢</span>
              </div>
            </div>
          </>
        )}

        {step === "analyzing" && (
          <div className="relative overflow-hidden bg-[#07110c] px-6 py-12 text-white sm:px-10 sm:py-14">
            <div className="pointer-events-none absolute inset-0 opacity-30 [background-image:radial-gradient(circle_at_20%_20%,rgba(6,199,85,.45),transparent_30%),radial-gradient(circle_at_80%_70%,rgba(38,166,255,.35),transparent_35%)]" />
            <div className="relative mx-auto max-w-md text-center">
              <div className="relative mx-auto flex h-24 w-24 items-center justify-center">
                <span className="absolute inset-0 animate-ping rounded-full border border-[#06C755]/30" />
                <span className="absolute inset-2 animate-spin rounded-full border border-transparent border-r-[#06C755] border-t-[#06C755]" />
                <span className="absolute inset-5 animate-[spin_2.4s_linear_infinite_reverse] rounded-full border border-transparent border-b-cyan-300 border-l-cyan-300" />
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-2xl backdrop-blur">
                  ✦
                </span>
              </div>

              <p className="mt-7 text-xs font-bold tracking-[0.25em] text-[#55e891]">
                SMART MATCHING
              </p>
              <h3
                id={modalTitleId}
                className="mt-3 text-2xl font-black leading-tight sm:text-3xl"
              >
                正在根據您的區域與喜好進行推薦
              </h3>
              <p className="mt-3 min-h-12 text-sm leading-6 text-white/65">
                {analysisMessage}
              </p>

              <div className="mt-8 overflow-hidden rounded-full bg-white/10 p-1">
                <div
                  className="h-3 rounded-full bg-gradient-to-r from-[#06C755] via-emerald-300 to-cyan-300 transition-[width] duration-150 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>

              <div className="mt-3 flex items-center justify-between text-xs text-white/50">
                <span>條件分析中</span>
                <span className="font-mono text-white/80">{progress}%</span>
              </div>

              <div className="mt-7 grid grid-cols-3 gap-2 text-left text-[11px] text-white/60">
                <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-3">
                  <span className="block text-white/35">AREA</span>
                  <strong className="mt-1 block truncate text-white">
                    {district}
                  </strong>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-3">
                  <span className="block text-white/35">STYLE</span>
                  <strong className="mt-1 block truncate text-white">
                    {selectedStyleName}
                  </strong>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-3">
                  <span className="block text-white/35">STATUS</span>
                  <strong className="mt-1 block text-[#55e891]">MATCHING</strong>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === "result" && (
          <div className="bg-white px-6 py-9 sm:px-10 sm:py-11">
            <div className="mx-auto max-w-md text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#06C755]/10 text-3xl text-[#06A947]">
                ✓
              </div>
              <p className="mt-5 text-xs font-bold tracking-[0.2em] text-[#06A947]">
                RECOMMENDATION READY
              </p>
              <h3
                id={modalTitleId}
                className="mt-2 text-2xl font-black tracking-tight text-foreground sm:text-3xl"
              >
                已為您找到適合的諮詢窗口
              </h3>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                依據您位於「{district}」且偏好「{selectedStyleName}」的條件，
                可透過下方 LINE 進一步確認空間需求與服務內容。
              </p>

              <div className="mt-7 rounded-[24px] border border-black/10 bg-[#fbfaf7] p-5 text-left shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#06C755] text-2xl font-black text-white">
                    L
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold tracking-[0.14em] text-muted-foreground">
                      LINE CONTACT
                    </p>
                    <p className="mt-1 truncate text-xl font-black text-foreground">
                      {LINE_ID}
                    </p>
                  </div>
                </div>

                <a
                  href={LINE_ADD_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 flex min-h-14 w-full items-center justify-center rounded-2xl bg-[#06C755] px-5 py-4 text-base font-black text-white shadow-[0_12px_30px_rgba(6,199,85,0.25)] transition hover:-translate-y-0.5 hover:bg-[#05b94e]"
                >
                  加入 LINE 開始諮詢
                  <span className="ml-2" aria-hidden="true">
                    →
                  </span>
                </a>
              </div>

              <button
                type="button"
                onClick={resetModal}
                className="mt-5 text-sm font-bold text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
              >
                稍後再聯絡
              </button>
            </div>
          </div>
        )}
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
