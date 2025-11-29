"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { CreditCard, Loader2 } from 'lucide-react'

interface PaymentButtonProps {
  productId: string
  productTitle: string
  price: number
  isAuthenticated: boolean
}

export default function PaymentButton({ 
  productId, 
  productTitle, 
  price, 
  isAuthenticated 
}: PaymentButtonProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handlePayment = async () => {
    if (!isAuthenticated) {
      router.push('/auth/simple-signin')
      return
    }

    // 개별 상품 결제는 전용 결제 페이지로 리다이렉트
    router.push(`/products/${productId}/checkout`)
  }

  return (
    <Button
      className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-6 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
      onClick={handlePayment}
      disabled={loading}
    >
      {loading ? (
        <>
          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
          결제 준비 중...
        </>
      ) : (
        <>
          <CreditCard className="w-5 h-5 mr-2" />
          {new Intl.NumberFormat('ko-KR').format(price)}원 결제하기
        </>
      )}
    </Button>
  )
}

