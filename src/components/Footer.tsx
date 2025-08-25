"use client"

import Link from "next/link"
import { 
  Mail, 
  Phone, 
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  Youtube
} from "lucide-react"

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gray-900 text-white">
      {/* 메인 푸터 콘텐츠 */}
      <div className="px-6 sm:px-8 lg:px-12 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* 회사 정보 */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">P</span>
              </div>
              <h3 className="text-xl font-bold">Payperic</h3>
            </div>
            <p className="text-gray-300 leading-relaxed">
              현직 교사들이 만든 검증된 영어 교육 자료로 더 효과적인 수업을 만들어보세요.
            </p>
            <div className="space-y-2 text-sm text-gray-400">
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4" />
                <span>서울특별시 강남구 테헤란로 123</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4" />
                <span>02-1234-5678</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4" />
                <span>contact@deepthink.co.kr</span>
              </div>
            </div>
          </div>

          {/* 서비스 */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">서비스</h4>
            <ul className="space-y-2 text-gray-300">
              <li>
                <Link href="/products/2025-english-mock" className="hover:text-white transition-colors">
                  2025 영어모의고사
                </Link>
              </li>
              <li>
                <Link href="/products/2024-english-mock" className="hover:text-white transition-colors">
                  2024 영어모의고사
                </Link>
              </li>
              <li>
                <Link href="/products/ebs-special-english" className="hover:text-white transition-colors">
                  EBS수능특강영어
                </Link>
              </li>
              <li>
                <Link href="/products/free" className="hover:text-white transition-colors">
                  무료 자료
                </Link>
              </li>
              <li>
                <Link href="/custom-order" className="hover:text-white transition-colors">
                  주문 제작
                </Link>
              </li>
            </ul>
          </div>

          {/* 고객 지원 */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">고객 지원</h4>
            <ul className="space-y-2 text-gray-300">
              <li>
                <Link href="/auth/simple-signup" className="hover:text-white transition-colors">
                  회원가입
                </Link>
              </li>
              <li>
                <Link href="/auth/simple-signin" className="hover:text-white transition-colors">
                  로그인
                </Link>
              </li>
              <li>
                <a href="mailto:support@deepthink.co.kr" className="hover:text-white transition-colors">
                  고객 문의
                </a>
              </li>
              <li>
                <a href="tel:02-1234-5678" className="hover:text-white transition-colors">
                  전화 상담
                </a>
              </li>
            </ul>
          </div>

          {/* 법적 정보 */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">법적 정보</h4>
            <ul className="space-y-2 text-gray-300">
              <li>
                <Link href="/terms" className="hover:text-white transition-colors">
                  이용약관
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-white transition-colors">
                  개인정보처리방침
                </Link>
              </li>
            </ul>
            
            {/* 소셜 미디어 */}
            <div className="pt-4">
              <h5 className="text-sm font-medium mb-3">소셜 미디어</h5>
              <div className="flex space-x-3">
                <a 
                  href="#" 
                  className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors"
                  aria-label="Facebook"
                >
                  <Facebook className="h-4 w-4" />
                </a>
                <a 
                  href="#" 
                  className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-400 transition-colors"
                  aria-label="Twitter"
                >
                  <Twitter className="h-4 w-4" />
                </a>
                <a 
                  href="#" 
                  className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center hover:bg-pink-600 transition-colors"
                  aria-label="Instagram"
                >
                  <Instagram className="h-4 w-4" />
                </a>
                <a 
                  href="#" 
                  className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                  aria-label="YouTube"
                >
                  <Youtube className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 하단 저작권 */}
      <div className="border-t border-gray-800">
        <div className="px-6 sm:px-8 lg:px-12 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-gray-400 text-sm">
              <p>© {currentYear} <span className="font-semibold text-white">deepthink</span>. All rights reserved.</p>
              <p className="mt-1">
                사업자등록번호: 123-45-67890 | 대표: 김대표 | 통신판매업신고: 2024-서울강남-1234
              </p>
            </div>
            <div className="flex items-center space-x-6 text-sm text-gray-400">
              <Link href="/terms" className="hover:text-white transition-colors">
                이용약관
              </Link>
              <Link href="/privacy" className="hover:text-white transition-colors">
                개인정보처리방침
              </Link>
              <span className="text-gray-600">|</span>
              <span>deepthink Co., Ltd.</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
