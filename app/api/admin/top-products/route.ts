import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import Product from '@/models/Product'
import Purchase from '@/models/Purchase'

export async function GET(request: NextRequest) {
  try {
    await connectDB()

    // 모든 상품과 구매 내역 가져오기
    const [products, purchases] = await Promise.all([
      Product.find().lean(),
      Purchase.find().lean()
    ])

    // 상품별 매출 및 다운로드 계산
    const productStats = products.map(product => {
      const productPurchases = purchases.filter(
        p => p.productId === product._id.toString()
      )
      
      const revenue = productPurchases.reduce((sum, p) => sum + (p.amount || 0), 0)
      const downloadCount = product.downloadCount || 0

      return {
        _id: product._id.toString(),
        title: product.title,
        price: product.price,
        downloadCount,
        revenue,
        category: product.category
      }
    })

    // 매출 기준으로 정렬하고 상위 5개만
    const topProducts = productStats
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5)

    return NextResponse.json({ products: topProducts })

  } catch (error) {
    console.error('인기 상품 조회 오류:', error)
    return NextResponse.json(
      { error: '인기 상품을 불러올 수 없습니다.' },
      { status: 500 }
    )
  }
}


