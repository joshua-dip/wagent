"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { CreditCard, Loader2 } from 'lucide-react'
import { loadTossPayments } from '@tosspayments/payment-sdk'

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

    try {
      setLoading(true)

      // 결제 요청 정보 가져오기
      const response = await fetch('/api/payments/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productId }),
      })

      const data = await response.json()

      if (!response.ok) {
        alert(data.error || '결제 요청에 실패했습니다.')
        setLoading(false)
        return
      }

      const { paymentData, clientKey } = data

      if (!clientKey) {
        alert('결제 시스템 설정이 올바르지 않습니다.')
        setLoading(false)
        return
      }

      // 토스페이먼츠 결제창 호출
      const tossPayments = await loadTossPayments(clientKey)
      
      await tossPayments.requestPayment('카드', {
        amount: paymentData.amount,
        orderId: paymentData.orderId,
        orderName: paymentData.orderName,
        customerName: paymentData.customerName,
        customerEmail: paymentData.customerEmail,
        successUrl: `${paymentData.successUrl}?productId=${productId}`,
        failUrl: paymentData.failUrl,
      })

    } catch (error) {
      console.error('결제 오류:', error)
      alert('결제 중 오류가 발생했습니다.')
      setLoading(false)
    }
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

