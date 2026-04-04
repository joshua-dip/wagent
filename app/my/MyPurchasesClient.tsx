"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import Layout from "@/components/Layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useSimpleAuth } from "@/hooks/useSimpleAuth"
import {
  Download,
  FileText,
  Calendar,
  DollarSign,
  Package,
  Loader2,
  AlertCircle,
  CheckCircle,
  ArrowLeft,
  CreditCard,
} from "lucide-react"
import Link from "next/link"

export interface Purchase {
  _id: string
  productId: string
  productTitle: string
  amount: number
  purchaseDate: string
  downloadCount: number
  maxDownloads: number
  paymentMethod: string
  paymentStatus: string
}

export type MyPurchasesCopy = {
  loadingText: string
  pageTitle: string
  pageSubtitle: (count: number) => string
  emptyTitle: string
  emptyDescription: string
  fetchError: string
  headerIcon: "package" | "card"
}

const defaultCopy: MyPurchasesCopy = {
  loadingText: "구매 내역을 불러오는 중...",
  pageTitle: "구매 내역",
  pageSubtitle: (n) => `${n}개의 구매 상품`,
  emptyTitle: "구매 내역이 없습니다",
  emptyDescription: "다양한 디지털 자료를 구매해보세요!",
  fetchError: "구매 내역을 불러올 수 없습니다.",
  headerIcon: "package",
}

export function MyPurchasesClient({ copy = defaultCopy }: { copy?: MyPurchasesCopy }) {
  const router = useRouter()
  const { data: session, status } = useSession({ required: false })
  const simpleAuth = useSimpleAuth()

  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const isAuthenticated = simpleAuth.isAuthenticated || !!session
  const isAuthLoading = simpleAuth.isLoading || status === "loading"

  useEffect(() => {
    if (isAuthLoading) return
    if (!isAuthenticated) {
      router.push("/auth/simple-signin")
      return
    }
    fetchPurchases()
  }, [isAuthLoading, isAuthenticated, router])

  const fetchPurchases = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/purchases/my-purchases")
      if (!response.ok) {
        throw new Error(copy.fetchError)
      }
      const data = await response.json()
      setPurchases(data.purchases || [])
    } catch (err) {
      console.error("구매/주문 내역 조회 오류:", err)
      setError(err instanceof Error ? err.message : "오류가 발생했습니다.")
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async (productId: string) => {
    try {
      const response = await fetch(`/api/products/${productId}/download`, {
        method: "POST",
      })
      if (!response.ok) {
        const data = await response.json()
        alert(data.error || "다운로드에 실패했습니다.")
        return
      }
      const data = await response.json()
      let opened = 0
      if (data.pdfDownloadUrl) {
        window.open(data.pdfDownloadUrl, "_blank")
        opened++
      }
      if (data.hwpDownloadUrl) {
        setTimeout(() => window.open(data.hwpDownloadUrl, "_blank"), 250)
        opened++
      }
      if (opened === 0 && data.downloadUrl) {
        window.open(data.downloadUrl, "_blank")
        opened++
      }
      if (opened > 0) fetchPurchases()
      else alert("다운로드 링크를 받지 못했습니다.")
    } catch {
      alert("다운로드 중 오류가 발생했습니다.")
    }
  }

  if (isAuthLoading || loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-emerald-500" />
            <p className="text-gray-600">{copy.loadingText}</p>
          </div>
        </div>
      </Layout>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  const HeaderIcon = copy.headerIcon === "card" ? CreditCard : Package

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50/50 py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <Link href="/user-dashboard">
              <Button variant="ghost" className="mb-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                마이페이지로 돌아가기
              </Button>
            </Link>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
                <HeaderIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{copy.pageTitle}</h1>
                <p className="text-gray-600 mt-1">{copy.pageSubtitle(purchases.length)}</p>
              </div>
            </div>
          </div>

          {error && (
            <Card className="mb-6 border-red-200 bg-red-50">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 text-red-800">
                  <AlertCircle className="w-5 h-5" />
                  <p>{error}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {purchases.length === 0 ? (
            <Card className="shadow-lg">
              <CardContent className="text-center py-16">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Package className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{copy.emptyTitle}</h3>
                <p className="text-gray-600 mb-6">{copy.emptyDescription}</p>
                <Link href="/products">
                  <Button className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700">
                    <FileText className="w-4 h-4 mr-2" />
                    상품 둘러보기
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {purchases.map((purchase) => (
                <Card key={purchase._id} className="shadow-md hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-start gap-3 mb-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <FileText className="w-6 h-6 text-emerald-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-lg text-gray-900 mb-1">
                              {purchase.productTitle}
                            </h3>
                            <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
                              <div className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                <span>
                                  {new Date(purchase.purchaseDate).toLocaleDateString("ko-KR")}
                                </span>
                              </div>
                              <span className="text-gray-400">•</span>
                              <div className="flex items-center gap-1">
                                <DollarSign className="w-4 h-4" />
                                <span className="font-semibold text-emerald-600">
                                  {new Intl.NumberFormat("ko-KR").format(purchase.amount)}원
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          <Badge
                            variant={
                              purchase.paymentStatus === "COMPLETED" ? "default" : "secondary"
                            }
                            className={
                              purchase.paymentStatus === "COMPLETED"
                                ? "bg-green-100 text-green-700"
                                : ""
                            }
                          >
                            <CheckCircle className="w-3 h-3 mr-1" />
                            {purchase.paymentStatus === "COMPLETED"
                              ? "결제완료"
                              : purchase.paymentStatus}
                          </Badge>
                          <Badge variant="outline">{purchase.paymentMethod}</Badge>
                          <Badge variant="outline" className="text-xs">
                            다운로드: {purchase.downloadCount}/{purchase.maxDownloads}
                          </Badge>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 md:w-48">
                        <Button
                          onClick={() => handleDownload(purchase.productId)}
                          disabled={purchase.downloadCount >= purchase.maxDownloads}
                          className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          다운로드
                        </Button>
                        <Link href={`/products/${purchase.productId}`} className="w-full">
                          <Button variant="outline" className="w-full">
                            상품 보기
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {purchases.length > 0 && (
            <Card className="mt-6 bg-emerald-50 border-emerald-200">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-emerald-800">
                    <p className="font-semibold mb-1">다운로드 안내</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>
                        각 상품은 최대 {purchases[0]?.maxDownloads || 10}회까지 다운로드
                        가능합니다.
                      </li>
                      <li>다운로드 제한에 도달하면 추가 다운로드가 불가능합니다.</li>
                      <li>문제가 있으면 고객센터로 문의해주세요.</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  )
}
