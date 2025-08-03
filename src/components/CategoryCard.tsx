"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { LucideIcon, ArrowRight, TrendingUp } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

interface CategoryCardProps {
  title: string
  description: string
  icon: LucideIcon
  href: string
  productCount: number
  gradient: string
}

export default function CategoryCard({
  title,
  description,
  icon: Icon,
  href,
  productCount,
  gradient,
}: CategoryCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <Link href={href}>
      <Card 
        className="group cursor-pointer hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 border-0 shadow-lg bg-white/90 backdrop-blur-sm h-full overflow-hidden relative"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* 배경 그라디언트 오버레이 */}
        <div className={`absolute inset-0 ${gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}></div>
        
        <CardContent className="p-6 relative z-10">
          {/* 아이콘과 트렌딩 표시 */}
          <div className="flex items-center justify-between mb-4">
            <div className={`w-14 h-14 rounded-2xl ${gradient} flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-lg`}>
              <Icon className="h-7 w-7 text-white" />
            </div>
            {productCount > 1000 && (
              <Badge variant="success" className="animate-pulse">
                <TrendingUp className="h-3 w-3 mr-1" />
                인기
              </Badge>
            )}
          </div>
          
          {/* 제목 */}
          <h3 className="font-bold text-xl mb-3 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 transition-all duration-300">
            {title}
          </h3>
          
          {/* 설명 */}
          <p className="text-sm text-gray-600 mb-4 line-clamp-2 leading-relaxed">
            {description}
          </p>
          
          {/* 상품 수와 더보기 */}
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {productCount.toLocaleString()}
              </span>
              <span className="text-xs text-gray-500">개 상품</span>
            </div>
            
            <div className={`flex items-center gap-1 transition-all duration-300 ${isHovered ? 'translate-x-1' : ''}`}>
              <span className="text-blue-600 font-semibold text-sm">더보기</span>
              <ArrowRight className={`h-4 w-4 text-blue-600 transition-transform duration-300 ${isHovered ? 'translate-x-1' : ''}`} />
            </div>
          </div>

          {/* 프로그레스 인디케이터 */}
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-gray-500">활성도</span>
              <span className="text-xs text-green-600 font-medium">높음</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div 
                className={`${gradient} h-1.5 rounded-full transition-all duration-1000 ease-out`}
                style={{ width: isHovered ? '85%' : '60%' }}
              ></div>
            </div>
          </div>
        </CardContent>

        {/* 호버 시 글로우 효과 */}
        <div className={`absolute inset-0 rounded-xl ${gradient} opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500 -z-10`}></div>
      </Card>
    </Link>
  )
}