"use client"

import Link from "next/link"
import { Mail, Phone, MessageCircle } from "lucide-react"

const KAKAO_URL =
  process.env.NEXT_PUBLIC_KAKAO_CHANNEL_CHAT_URL ?? "https://pf.kakao.com/_qxbvtn/chat"

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t border-slate-200 bg-slate-50 text-slate-600">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-10 sm:py-12">
        {/* 상단: 브랜드 + 링크 */}
        <div className="flex flex-col sm:flex-row sm:items-start gap-8 sm:gap-12 mb-8">
          {/* 브랜드 */}
          <div className="shrink-0">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                P
              </div>
              <span className="font-bold text-slate-900 text-lg tracking-tight">PAYPERIC</span>
            </div>
            <p className="text-sm text-slate-500 max-w-[240px] leading-relaxed">
              고등 영어 서술형 자료를 한곳에서 구매하고 바로 다운로드하세요.
            </p>
          </div>

          {/* 링크 그룹 */}
          <div className="flex flex-wrap gap-x-12 gap-y-6 text-sm">
            <div>
              <h4 className="font-semibold text-slate-900 mb-2.5">서비스</h4>
              <ul className="space-y-1.5">
                <li>
                  <Link href="/" className="hover:text-emerald-700 transition-colors">서술형 자료</Link>
                </li>
                <li>
                  <Link href="/products/free" className="hover:text-emerald-700 transition-colors">무료 자료</Link>
                </li>
                <li>
                  <Link href="/my/purchases" className="hover:text-emerald-700 transition-colors">구매 내역</Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-slate-900 mb-2.5">고객 지원</h4>
              <ul className="space-y-1.5">
                <li>
                  <a
                    href={KAKAO_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 hover:text-emerald-700 transition-colors"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    카카오톡 문의
                  </a>
                </li>
                <li>
                  <a href="mailto:payperic@naver.com" className="inline-flex items-center gap-1.5 hover:text-emerald-700 transition-colors">
                    <Mail className="w-3.5 h-3.5" />
                    payperic@naver.com
                  </a>
                </li>
                <li>
                  <a href="tel:010-7927-0806" className="inline-flex items-center gap-1.5 hover:text-emerald-700 transition-colors">
                    <Phone className="w-3.5 h-3.5" />
                    010-7927-0806
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-slate-900 mb-2.5">정책</h4>
              <ul className="space-y-1.5">
                <li>
                  <Link href="/terms" className="hover:text-emerald-700 transition-colors">이용약관</Link>
                </li>
                <li>
                  <Link href="/privacy" className="hover:text-emerald-700 transition-colors">개인정보처리방침</Link>
                </li>
                <li>
                  <Link href="/refund-policy" className="hover:text-emerald-700 transition-colors">환불정책</Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* 구분선 + 사업자 정보 */}
        <div className="border-t border-slate-200 pt-6 text-xs text-slate-400 space-y-1">
          <p>
            © {currentYear} 페이퍼릭 (Payperic). All rights reserved.
          </p>
          <p>
            대표자: 박준규 · 사업자등록번호: 246-47-01070 · 통신판매업신고: 제 2025-부산해운대-1495호
          </p>
          <p>
            부산광역시 해운대구 센텀중앙로 48, 1304호(우동, 에이스하이테크21)
          </p>
        </div>
      </div>
    </footer>
  )
}
