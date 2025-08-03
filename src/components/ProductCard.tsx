"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Star, Heart, ShoppingCart, Download, Eye, Zap, Crown } from "lucide-react"
import Image from "next/image"
import { useState } from "react"

interface ProductCardProps {
  id: number
  title: string
  description: string
  price: number
  originalPrice?: number
  rating: number
  reviewCount: number
  category: string
  thumbnail: string
  author: string
  downloadCount: number
  tags: string[]
  isPopular?: boolean
  isNew?: boolean
}

export default function ProductCard({
  id,
  title,
  description,
  price,
  originalPrice,
  rating,
  reviewCount,
  category,
  thumbnail,
  author,
  downloadCount,
  tags,
  isPopular = false,
  isNew = false,
}: ProductCardProps) {
  const [isLiked, setIsLiked] = useState(false)
  const [isAddedToCart, setIsAddedToCart] = useState(false)
  const discountPercentage = originalPrice ? Math.round((1 - price / originalPrice) * 100) : 0

  const handleAddToCart = () => {
    setIsAddedToCart(true)
    setTimeout(() => setIsAddedToCart(false), 2000)
  }

  return (
    <Card className="group cursor-pointer hover:shadow-lg transition-shadow duration-200 overflow-hidden h-full">
      {/* 메인 이미지 컨테이너 */}
      <div className="relative overflow-hidden aspect-video bg-gray-100">
        <Image
          src={thumbnail || "/api/placeholder/400/225"}
          alt={title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
        
        {/* 간단한 배지들 */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {isNew && (
            <Badge className="bg-green-500 text-white font-medium px-2 py-1 text-xs">
              NEW
            </Badge>
          )}
          {isPopular && (
            <Badge className="bg-orange-500 text-white font-medium px-2 py-1 text-xs">
              인기
            </Badge>
          )}
          {discountPercentage > 0 && (
            <Badge className="bg-red-500 text-white font-medium px-2 py-1 text-xs">
              -{discountPercentage}%
            </Badge>
          )}
        </div>

        {/* 액션 버튼들 */}
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <div className="flex gap-2">
            <Button 
              size="sm" 
              variant="secondary"
              className={`h-8 w-8 p-0 rounded-full ${
                isLiked ? 'bg-red-500 text-white hover:bg-red-600' : ''
              }`}
              onClick={() => setIsLiked(!isLiked)}
            >
              <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
            </Button>
            
            <Button 
              size="sm" 
              variant="secondary"
              className="h-8 w-8 p-0 rounded-full"
            >
              <Eye className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* 카테고리 배지 */}
        <div className="absolute bottom-3 left-3">
          <Badge variant="secondary" className="text-xs">
            {category}
          </Badge>
        </div>
        </div>

      {/* 카드 내용 */}
      <CardContent className="p-6">
        {/* 제목 */}
        <h3 className="font-semibold text-lg mb-2 line-clamp-2 text-gray-900">
          {title}
        </h3>

        {/* 작성자 */}
        <div className="flex items-center gap-2 mb-3">
          <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
            <span className="text-xs text-white font-medium">{author[0]}</span>
          </div>
          <span className="text-sm text-gray-600">by {author}</span>
        </div>

        {/* 설명 */}
        <p className="text-sm text-gray-600 mb-4 line-clamp-2 leading-relaxed">
          {description}
        </p>

        {/* 평점 및 다운로드 */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="font-medium text-sm">{rating}</span>
            <span className="text-gray-500 text-sm">({reviewCount})</span>
          </div>
          <div className="flex items-center gap-1 text-gray-500">
            <Download className="h-4 w-4" />
            <span className="text-sm">{downloadCount.toLocaleString()}</span>
          </div>
        </div>

        {/* 태그 */}
        <div className="flex flex-wrap gap-1 mb-4">
          {tags.slice(0, 3).map((tag, index) => (
            <Badge
              key={index}
              variant="secondary"
              className="text-xs"
            >
              #{tag}
            </Badge>
          ))}
          {tags.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{tags.length - 3}
            </Badge>
          )}
        </div>

        {/* 가격 및 구매 버튼 */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-gray-900">
                {price === 0 ? "무료" : `₩${price.toLocaleString()}`}
              </span>
              {originalPrice && originalPrice > price && (
                <span className="text-sm text-gray-400 line-through">
                  ₩{originalPrice.toLocaleString()}
                </span>
              )}
            </div>
            {discountPercentage > 0 && (
              <span className="text-xs text-green-600 font-medium">
                {discountPercentage}% 할인
              </span>
            )}
          </div>
          
          <Button 
            size="sm" 
            className={`${
              isAddedToCart 
                ? 'bg-green-500 hover:bg-green-600' 
                : 'bg-blue-600 hover:bg-blue-700'
            } transition-colors duration-200`}
            onClick={handleAddToCart}
          >
            {isAddedToCart ? (
              <>
                <span className="mr-1">✓</span>
                추가됨
              </>
            ) : (
              <>
                <ShoppingCart className="h-4 w-4 mr-1" />
                {price === 0 ? "다운로드" : "구매"}
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}