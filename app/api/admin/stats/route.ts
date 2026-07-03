import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import User from '@/models/User'
import Product from '@/models/Product'
import Purchase from '@/models/Purchase'
import PricCharge from '@/models/PricCharge'
import { requireAdmin } from '@/lib/adminAuth'

export async function GET(request: NextRequest) {
  const gate = await requireAdmin()
  if (!gate.ok) return gate.response

  try {
    await connectDB()

    // 현재 날짜 기준
    const now = new Date()
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())
    const twoMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2, now.getDate())

    // 병렬로 데이터 가져오기
    const [
      totalUsers,
      lastMonthUsers,
      twoMonthsAgoUsers,
      totalProducts,
      activeProducts,
      allPurchases,
      lastMonthPurchases,
      twoMonthsAgoPurchases
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ createdAt: { $gte: lastMonth } }),
      User.countDocuments({ 
        createdAt: { $gte: twoMonthsAgo, $lt: lastMonth } 
      }),
      Product.countDocuments(),
      Product.countDocuments({ isActive: true }),
      Purchase.find(),
      Purchase.find({ createdAt: { $gte: lastMonth } }),
      Purchase.find({ 
        createdAt: { $gte: twoMonthsAgo, $lt: lastMonth } 
      })
    ])

    // 매출 계산 (정가 기준 gross)
    const totalRevenue = allPurchases.reduce((sum, p) => sum + (p.amount || 0), 0)
    const lastMonthRevenue = lastMonthPurchases.reduce((sum, p) => sum + (p.amount || 0), 0)
    const twoMonthsAgoRevenue = twoMonthsAgoPurchases.reduce((sum, p) => sum + (p.amount || 0), 0)

    // 프릭 분리: 전액 프릭으로 결제된 상품(비현금) + 프릭 충전으로 들어온 현금
    const pricPaidRevenue = allPurchases.reduce((sum, p) => sum + (p.paymentMethod === 'PRIC' ? (p.amount || 0) : 0), 0)
    const pricChargeDocs = await PricCharge.find({ status: 'CONFIRMED' }).select('payAmount').lean()
    const pricChargeRevenue = (pricChargeDocs as Array<{ payAmount?: number }>).reduce((sum, c) => sum + (c.payAmount || 0), 0)
    const cashProductRevenue = totalRevenue - pricPaidRevenue // 카드 상품매출(≈현금, 부분 프릭 사용분은 정가 포함)

    // 성장률 계산
    const revenueGrowth = twoMonthsAgoRevenue > 0 
      ? ((lastMonthRevenue - twoMonthsAgoRevenue) / twoMonthsAgoRevenue * 100)
      : 0

    const userGrowth = twoMonthsAgoUsers > 0
      ? ((lastMonthUsers - twoMonthsAgoUsers) / twoMonthsAgoUsers * 100)
      : 0

    const orderGrowth = twoMonthsAgoPurchases.length > 0
      ? ((lastMonthPurchases.length - twoMonthsAgoPurchases.length) / twoMonthsAgoPurchases.length * 100)
      : 0

    // 다운로드 통계
    const totalDownloads = allPurchases.reduce((sum, p) => sum + (p.downloadCount || 0), 0)
    const lastMonthDownloads = lastMonthPurchases.reduce((sum, p) => sum + (p.downloadCount || 0), 0)
    const twoMonthsAgoDownloads = twoMonthsAgoPurchases.reduce((sum, p) => sum + (p.downloadCount || 0), 0)

    const downloadGrowth = twoMonthsAgoDownloads > 0
      ? ((lastMonthDownloads - twoMonthsAgoDownloads) / twoMonthsAgoDownloads * 100)
      : 0

    return NextResponse.json({
      stats: {
        totalRevenue: Math.round(totalRevenue),
        pricPaidRevenue: Math.round(pricPaidRevenue),
        cashProductRevenue: Math.round(cashProductRevenue),
        pricChargeRevenue: Math.round(pricChargeRevenue),
        revenueGrowth: Math.round(revenueGrowth * 10) / 10,
        totalUsers,
        userGrowth: Math.round(userGrowth * 10) / 10,
        totalProducts,
        activeProducts,
        totalOrders: allPurchases.length,
        orderGrowth: Math.round(orderGrowth * 10) / 10,
        totalDownloads,
        downloadGrowth: Math.round(downloadGrowth * 10) / 10
      }
    })

  } catch (error) {
    console.error('통계 데이터 조회 오류:', error)
    return NextResponse.json(
      { error: '통계 데이터를 불러올 수 없습니다.' },
      { status: 500 }
    )
  }
}


