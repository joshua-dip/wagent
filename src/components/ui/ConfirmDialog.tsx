"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { AlertTriangle } from "lucide-react"

interface ConfirmDialogProps {
  open: boolean
  title: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: "default" | "danger"
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "확인",
  cancelLabel = "취소",
  variant = "default",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel()
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [open, onCancel])

  if (!open) return null

  const isDanger = variant === "danger"

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
    >
      <button
        type="button"
        aria-label="닫기"
        onClick={onCancel}
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-150"
      />
      <div className="relative w-full max-w-sm rounded-2xl bg-white shadow-2xl border border-slate-200/80 animate-in fade-in zoom-in-95 duration-150">
        <div className="p-6">
          <div className="flex items-start gap-3 mb-2">
            <div
              className={cn(
                "shrink-0 mt-0.5 w-9 h-9 rounded-full flex items-center justify-center",
                isDanger ? "bg-rose-100 text-rose-600" : "bg-emerald-100 text-emerald-700"
              )}
            >
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h2
                id="confirm-dialog-title"
                className="text-base font-semibold text-slate-900 leading-snug"
              >
                {title}
              </h2>
              {description && (
                <p className="text-sm text-slate-500 mt-1 leading-relaxed">
                  {description}
                </p>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-2 px-6 pb-6">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="flex-1 border-slate-200 text-slate-700 hover:bg-slate-50"
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            onClick={onConfirm}
            className={cn(
              "flex-1 text-white shadow-sm",
              isDanger
                ? "bg-rose-600 hover:bg-rose-700"
                : "bg-emerald-600 hover:bg-emerald-700"
            )}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}
