"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function ProductCardSkeleton() {
  return (
    <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
      <div className="relative overflow-hidden rounded-t-xl">
        {/* 이미지 스켈레톤 */}
        <Skeleton className="aspect-video w-full bg-gradient-to-br from-gray-200 to-gray-300" />
        
        {/* 배지 스켈레톤 */}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          <Skeleton className="h-6 w-12 rounded-full" />
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>

        {/* 카테고리 스켈레톤 */}
        <div className="absolute bottom-4 left-4">
          <Skeleton className="h-6 w-20 rounded-md" />
        </div>
      </div>

      <CardContent className="p-6 space-y-4">
        {/* 제목 스켈레톤 */}
        <div className="space-y-2">
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-3/4" />
        </div>

        {/* 작성자 스켈레톤 */}
        <div className="flex items-center gap-2">
          <Skeleton className="w-6 h-6 rounded-full" />
          <Skeleton className="h-4 w-24" />
        </div>

        {/* 설명 스켈레톤 */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>

        {/* 평점 및 다운로드 스켈레톤 */}
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-24 rounded-full" />
          <Skeleton className="h-8 w-20 rounded-full" />
        </div>

        {/* 태그 스켈레톤 */}
        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-6 w-14 rounded-full" />
        </div>

        {/* 가격 및 버튼 스켈레톤 */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <div className="space-y-1">
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-3 w-16" />
          </div>
          <Skeleton className="h-10 w-24 rounded-md" />
        </div>
      </CardContent>
    </Card>
  )
}