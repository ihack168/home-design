"use client"

import { ReactNode, useEffect, useState } from "react"
import { createPortal } from "react-dom"

const GOOGLE_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbwFpZDhMveHhdOYdDkh02JpWk28jUCBqikyM-Urg_6Uw2jTH7d8ZluKxinKTWh5_20N/exec"

const LINE_ADD_URL = "https://line.me/R/ti/p/~0910933178"

const VENDOR_ID = "linkrich"
const VENDOR_NAME = "台灣社會住宅包租代管資訊站"

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
  const [modalStep, setModalStep] = useState<"role" | "form">("role")
  const [role, setRole] = useState("")
  const [lastName, setLastName] = useState("")
  const [phoneLast3, setPhoneLast3] = useState("")
  const [tenantBlocked, setTenantBlocked] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const resetModal = () => {
    setShowModal(false)
    setModalStep("role")
    setRole("")
    setLastName("")
    setPhoneLast3("")
    setTenantBlocked(false)
    setLoading(false)
  }

  const handleOpenModal = () => {
    setShowModal(true)
    setModalStep("role")
    setRole("")
    setLastName("")
    setPhoneLast3("")
    setTenantBlocked(false)
  }

  const handleSelectRole = (selectedRole: string) => {
    setRole(selectedRole)

    if (selectedRole === "tenant") {
      setTenantBlocked(true)
      return
    }

    setTenantBlocked(false)
    setModalStep("form")
  }

  const handleSubmitLineConsult = async () => {
    const cleanLastName = lastName.trim()
    const cleanPhoneLast3 = phoneLast3.trim()

    if (role !== "landlord") {
      alert("請先選擇房東")
      return
    }

    if (!cleanLastName) {
      alert("請輸入貴姓")
      return
    }

    if (!/^\d{3}$/.test(cleanPhoneLast3)) {
      alert("請輸入手機末 3 碼")
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
          role,
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
      alert("送出失敗，請稍後再試")
    } finally {
      setLoading(false)
    }
  }

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center overflow-y-auto bg-black/50 px-4 py-8">
      <div className="my-auto w-full max-w-sm rounded-2xl bg-white p-6 text-left shadow-xl">
        {modalStep === "role" && (
          <>
            <h3 className="text-center text-3xl font-black tracking-wide text-red-600 animate-pulse">
              你是房東還是房客？
            </h3>

            <div className="mt-8 grid grid-cols-2 gap-4">
              <label
                className={`flex cursor-pointer items-center justify-center gap-2 rounded-2xl border px-4 py-5 text-lg font-black transition-all ${
                  role === "landlord"
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-foreground"
                }`}
              >
                <input
                  type="radio"
                  name="role-line-consult"
                  checked={role === "landlord"}
                  onChange={() => handleSelectRole("landlord")}
                  className="h-5 w-5"
                />
                房東
              </label>

              <label
                className={`flex cursor-pointer items-center justify-center gap-2 rounded-2xl border px-4 py-5 text-lg font-black transition-all ${
                  role === "tenant"
                    ? "border-red-600 bg-red-100 text-red-700 shadow-md"
                    : "border-border text-foreground"
                }`}
              >
                <input
                  type="radio"
                  name="role-line-consult"
                  checked={role === "tenant"}
                  onChange={() => handleSelectRole("tenant")}
                  className="h-5 w-5"
                />
                房客
              </label>
            </div>

            {tenantBlocked && (
              <p className="mt-5 rounded-2xl border-2 border-red-500 bg-red-50 px-4 py-4 text-center text-base font-black text-red-700 shadow-sm">
                很抱歉，我們僅提供房東咨詢
              </p>
            )}

            <button
              type="button"
              onClick={resetModal}
              className="mt-6 w-full rounded-xl border border-border px-4 py-3 text-sm font-semibold text-foreground"
            >
              取消
            </button>
          </>
        )}

        {modalStep === "form" && (
          <>
            <h3 className="text-xl font-black text-foreground">
              LINE 免費諮詢
            </h3>

            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              請留下貴姓與手機末 3 碼，送出後會自動開啟 LINE 加好友。
            </p>

            <div className="mt-5">
              <label className="text-sm font-semibold text-foreground">
                貴姓
              </label>

              <input
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="例如：王"
                className="mt-2 w-full rounded-xl border border-border px-4 py-3 text-sm outline-none focus:border-primary"
              />
            </div>

            <div className="mt-4">
              <label className="text-sm font-semibold text-foreground">
                手機末 3 碼
              </label>

              <input
                value={phoneLast3}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "").slice(0, 3)
                  setPhoneLast3(value)
                }}
                placeholder="例如：168"
                inputMode="numeric"
                maxLength={3}
                className="mt-2 w-full rounded-xl border border-border px-4 py-3 text-sm outline-none focus:border-primary"
              />
            </div>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setModalStep("role")
                  setRole("")
                  setLastName("")
                  setPhoneLast3("")
                  setTenantBlocked(false)
                }}
                disabled={loading}
                className="flex-1 rounded-xl border border-border px-4 py-3 text-sm font-semibold text-foreground"
              >
                上一步
              </button>

              <button
                type="button"
                onClick={handleSubmitLineConsult}
                disabled={loading}
                className="flex-1 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground"
              >
                {loading ? "送出中..." : "送出並加 LINE"}
              </button>
            </div>
          </>
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