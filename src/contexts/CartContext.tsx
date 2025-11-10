"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

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
  addToCart: (item: Omit<CartItem, 'quantity'>) => void
  removeFromCart: (productId: string) => void
  clearCart: () => void
  isInCart: (productId: string) => boolean
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [isInitialized, setIsInitialized] = useState(false)

  // localStorage에서 장바구니 로드
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('payperic-cart')
      if (savedCart) {
        setCartItems(JSON.parse(savedCart))
      }
    } catch (error) {
      console.error('장바구니 로드 오류:', error)
    } finally {
      setIsInitialized(true)
    }
  }, [])

  // cartItems 변경 시 localStorage에 저장
  useEffect(() => {
    if (isInitialized) {
      try {
        localStorage.setItem('payperic-cart', JSON.stringify(cartItems))
      } catch (error) {
        console.error('장바구니 저장 오류:', error)
      }
    }
  }, [cartItems, isInitialized])

  const addToCart = (item: Omit<CartItem, 'quantity'>) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(i => i.productId === item.productId)
      
      if (existingItem) {
        // 디지털 상품이므로 이미 장바구니에 있으면 추가하지 않음
        return prevItems
      } else {
        // 새 상품 추가 (수량은 항상 1)
        return [...prevItems, { ...item, quantity: 1 }]
      }
    })
  }

  const removeFromCart = (productId: string) => {
    setCartItems(prevItems => prevItems.filter(item => item.productId !== productId))
  }

  const clearCart = () => {
    setCartItems([])
  }

  const isInCart = (productId: string) => {
    return cartItems.some(item => item.productId === productId)
  }

  // 디지털 상품이므로 수량이 아닌 개수로 계산
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
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}

