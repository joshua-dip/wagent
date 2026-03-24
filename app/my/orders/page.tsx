"use client"

import { MyPurchasesClient } from "../MyPurchasesClient"

const ordersCopy = {
  loadingText: "주문 내역을 불러오는 중...",
  pageTitle: "주문 내역",
  pageSubtitle: (n: number) => `${n}건의 결제·주문`,
  emptyTitle: "주문 내역이 없습니다",
  emptyDescription: "상품을 구매하면 결제·주문 정보가 여기에 표시됩니다.",
  fetchError: "주문 내역을 불러올 수 없습니다.",
  headerIcon: "card" as const,
}

export default function MyOrdersPage() {
  return <MyPurchasesClient copy={ordersCopy} />
}
