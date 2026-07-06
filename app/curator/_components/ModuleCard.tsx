"use client"

import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { useCart } from "@/contexts/CartContext"
import { useSession } from "next-auth/react"
import { useSimpleAuth } from "@/hooks/useSimpleAuth"
import { Check, ShoppingCart } from "lucide-react"

export interface CuratorModuleView {
  code: string
  category: string
  title: string
  description: string
  pages: number
  product: { id: string; price: number; isActive: boolean; title: string } | null
}

export default function ModuleCard({ module: m }: { module: CuratorModuleView }) {
  const router = useRouter()
  const { addToCart, removeFromCart, isInCart } = useCart()
  const { data: session } = useSession()
  const simpleAuth = useSimpleAuth()
  const isAuthenticated = simpleAuth.isAuthenticated || !!session

  const product = m.product && m.product.isActive ? m.product : null
  const inCart = product ? isInCart(product.id) : false
  const isFree = product?.price === 0
  const fmt = (n: number) => new Intl.NumberFormat("ko-KR").format(n)

  const open = () => { if (product) router.push(`/products/${product.id}`) }

  return (
    <div className={cn("rounded-2xl border border-slate-200/80 bg-white p-5 flex flex-col", product && "hover:border-emerald-200 hover:shadow-sm transition-colors cursor-pointer")}
      onClick={product ? open : undefined}>
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="font-mono text-xs font-bold text-emerald-700 bg-emerald-50 rounded px-1.5 py-0.5">{m.code}</span>
        <Badge variant="secondary" className="text-[10px] bg-slate-100 text-slate-500 border-0 rounded-full">{m.category}</Badge>
      </div>
      <p className="font-semibold text-slate-900 leading-snug">{m.title}</p>
      {m.description && <p className="text-xs text-slate-500 mt-1.5 leading-relaxed line-clamp-2">{m.description}</p>}

      <div className="mt-auto pt-4 flex items-center justify-between">
        <span className="text-xs text-slate-400">{m.pages > 0 ? `${m.pages}쪽` : ""}</span>
        {!product ? (
          <span className="text-xs font-medium text-slate-400">준비 중</span>
        ) : (
          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
            <span className={cn("text-sm font-bold tabular-nums", isFree ? "text-emerald-600" : "text-slate-900")}>
              {isFree ? "무료" : `${fmt(product.price)}원`}
            </span>
            <button
              type="button"
              onClick={() => {
                if (!isAuthenticated) { router.push("/auth/simple-signin"); return }
                if (inCart) { removeFromCart(product.id); return }
                addToCart({ productId: product.id, title: m.title, price: product.price, category: m.category })
              }}
              className={cn(
                "flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold transition-all",
                inCart
                  ? "bg-white text-emerald-700 border border-emerald-200 hover:bg-red-50 hover:border-red-200 hover:text-red-700"
                  : "bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-700 hover:to-teal-700"
              )}
            >
              {inCart ? <><Check className="h-3.5 w-3.5" />빼기</> : <><ShoppingCart className="h-3.5 w-3.5" />담기</>}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
