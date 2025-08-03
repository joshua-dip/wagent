"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Shield, Zap, HeadphonesIcon, Award } from "lucide-react"

const features = [
  {
    icon: Shield,
    title: "안전한 거래",
    description: "모든 거래는 안전하게 보호되며, 구매 후 즉시 다운로드 가능합니다.",
    gradient: "bg-gradient-to-br from-green-500 to-emerald-600"
  },
  {
    icon: Zap,
    title: "즉시 다운로드",
    description: "결제 완료 후 바로 다운로드하여 시간을 절약하세요.",
    gradient: "bg-gradient-to-br from-yellow-500 to-orange-600"
  },
  {
    icon: HeadphonesIcon,
    title: "24/7 고객지원",
    description: "언제든지 도움이 필요하시면 고객지원팀이 도와드립니다.",
    gradient: "bg-gradient-to-br from-blue-500 to-indigo-600"
  },
  {
    icon: Award,
    title: "품질 보증",
    description: "엄선된 고품질 자료만을 제공하여 만족도를 보장합니다.",
    gradient: "bg-gradient-to-br from-purple-500 to-pink-600"
  }
]

export default function FeatureSection() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            왜 더블유마켓을 선택해야 할까요?
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            수천 명의 사용자가 신뢰하는 더블유마켓에서 최고의 디지털 자료를 만나보세요
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="border-0 shadow-sm hover:shadow-lg transition-shadow duration-300">
              <CardContent className="p-6 text-center">
                <div className={`w-16 h-16 rounded-2xl ${feature.gradient} flex items-center justify-center mx-auto mb-4`}>
                  <feature.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-600">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}