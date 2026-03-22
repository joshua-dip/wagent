"use client"

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  ReactNode,
} from "react"
import { useSession } from "next-auth/react"
import { useSimpleAuth } from "@/hooks/useSimpleAuth"

const LEGACY_CART_KEY = "payperic-cart"

export interface CartItem {
  productId: string
  title: string
  price: number
  originalPrice?: number
  category: string
  thumbnail?: string
  quantity: number
}

interface CartContextType {
  cartItems: CartItem[]
  cartCount: number
  addToCart: (item: Omit<CartItem, "quantity">) => void
  removeFromCart: (productId: string) => void
  clearCart: () => void
  isInCart: (productId: string) => boolean
}

const CartContext = createContext<CartContextType | undefined>(undefined)

/**
 * 로그인 시 이메일 기준으로 한 키만 사용 (JWT/NextAuth 로드 순서가 달라도 같은 장바구니).
 * 비로그인은 게스트 전용 → 회원가입·로그인 후에는 빈 장바구니에서 시작.
 */
function getCartStorageKey(params: {
  authLoading: boolean
  simpleUserId?: string | null
  simpleEmail?: string | null
  sessionEmail?: string | null
}): string | null {
  if (params.authLoading) return null
  const email =
    params.simpleEmail?.toLowerCase() ||
    params.sessionEmail?.toLowerCase() ||
    null
  if (email) return `payperic-cart:email:${email}`
  if (params.simpleUserId) return `payperic-cart:user:${params.simpleUserId}`
  return "payperic-cart:guest"
}

export function CartProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession()
  const simpleAuth = useSimpleAuth()

  const authLoading = simpleAuth.isLoading || status === "loading"

  const storageKey = useMemo(
    () =>
      getCartStorageKey({
        authLoading,
        simpleUserId: simpleAuth.user?.id,
        simpleEmail: simpleAuth.user?.email,
        sessionEmail: session?.user?.email ?? undefined,
      }),
    [
      authLoading,
      simpleAuth.user?.id,
      simpleAuth.user?.email,
      session?.user?.email,
    ]
  )

  const [cartItems, setCartItems] = useState<CartItem[]>([])
  /** storageKey에 맞는 장바구니를 메모리에 반영했을 때만 true → 키 바뀐 직전 저장 방지 */
  const [hydratedForKey, setHydratedForKey] = useState<string | null>(null)

  // 키가 바뀌면 해당 키의 localStorage에서만 로드
  useEffect(() => {
    if (storageKey === null) {
      setCartItems([])
      setHydratedForKey(null)
      return
    }

    try {
      let raw = localStorage.getItem(storageKey)
      if (!raw && storageKey === "payperic-cart:guest") {
        const legacy = localStorage.getItem(LEGACY_CART_KEY)
        if (legacy) {
          raw = legacy
          localStorage.setItem(storageKey, legacy)
          localStorage.removeItem(LEGACY_CART_KEY)
        }
      }
      setCartItems(raw ? JSON.parse(raw) : [])
    } catch (e) {
      console.error("장바구니 로드 오류:", e)
      setCartItems([])
    }
    setHydratedForKey(storageKey)
  }, [storageKey])

  useEffect(() => {
    if (storageKey === null || hydratedForKey !== storageKey) return
    try {
      localStorage.setItem(storageKey, JSON.stringify(cartItems))
    } catch (e) {
      console.error("장바구니 저장 오류:", e)
    }
  }, [cartItems, storageKey, hydratedForKey])

  const addToCart = (item: Omit<CartItem, "quantity">) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((i) => i.productId === item.productId)
      if (existingItem) return prevItems
      return [...prevItems, { ...item, quantity: 1 }]
    })
  }

  const removeFromCart = (productId: string) => {
    setCartItems((prevItems) =>
      prevItems.filter((item) => item.productId !== productId)
    )
  }

  const clearCart = () => {
    setCartItems([])
  }

  const isInCart = (productId: string) => {
    return cartItems.some((item) => item.productId === productId)
  }

  const cartCount = cartItems.length

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartCount,
        addToCart,
        removeFromCart,
        clearCart,
        isInCart,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
