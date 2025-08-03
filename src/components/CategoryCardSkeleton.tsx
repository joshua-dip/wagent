"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function CategoryCardSkeleton() {
  return (
    <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm h-full">
      <CardContent className="p-6">
        {/* 아이콘과 배지 스켈레톤 */}
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="w-14 h-14 rounded-2xl" />
          <Skeleton className="h-6 w-12 rounded-full" />
        </div>
        
        {/* 제목 스켈레톤 */}
        <div className="space-y-2 mb-3">
          <Skeleton className="h-6 w-3/4" />
        </div>
        
        {/* 설명 스켈레톤 */}
        <div className="space-y-2 mb-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
        
        {/* 상품 수와 더보기 스켈레톤 */}
        <div className="flex items-center justify-between mb-4">
          <div className="space-y-1">
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-3 w-12" />
          </div>
          <Skeleton className="h-4 w-16" />
        </div>

        {/* 프로그레스 스켈레톤 */}
        <div className="pt-4 border-t border-gray-100">
          <div className="flex justify-between items-center mb-2">
            <Skeleton className="h-3 w-12" />
            <Skeleton className="h-3 w-8" />
          </div>
          <Skeleton className="w-full h-1.5 rounded-full" />
        </div>
      </CardContent>
    </Card>
  )
}