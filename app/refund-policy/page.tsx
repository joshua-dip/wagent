import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Calendar, User, Shield, AlertTriangle, RefreshCw, CheckCircle } from 'lucide-react'

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* 헤더 */}
        <div className="mb-8">
          <Link href="/">
            <Button variant="outline" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              홈으로 돌아가기
            </Button>
          </Link>
          
          <Card className="shadow-xl border-0">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                환불 정책
              </CardTitle>
              <p className="text-gray-600 mt-2">페이퍼릭(PAYPERIC)의 환불 정책입니다</p>
              <div className="flex items-center justify-center gap-4 text-sm text-gray-500 mt-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>시행일: 2025년 11월 10일</span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span>페이퍼릭(PAYPERIC)</span>
                </div>
              </div>
            </CardHeader>
          </Card>
        </div>

        {/* 환불 정책 내용 */}
        <Card className="shadow-lg">
          <CardContent className="p-8 space-y-8">
            
            {/* 제1조 */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-600" />
                제1조 (디지털 콘텐츠의 특성)
              </h2>
              <div className="space-y-3 text-gray-700">
                <p>① 페이퍼릭(PAYPERIC)에서 판매하는 모든 상품은 <strong>디지털 콘텐츠(PDF 파일)</strong>입니다.</p>
                <p>② 디지털 콘텐츠는 구매 즉시 다운로드가 가능하며, 다운로드 완료 시점부터 상품의 <strong>전부를 공급받은 것</strong>으로 간주됩니다.</p>
              </div>
            </section>

            {/* 제2조 */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <RefreshCw className="w-5 h-5 text-green-600" />
                제2조 (환불 가능 사유)
              </h2>
              <div className="space-y-4 text-gray-700">
                <p><strong>① 회원은 구매 후 이용하지 않은 디지털 콘텐츠에 한하여 결제일로부터 7일 이내에 환불을 요청할 수 있습니다.</strong></p>
                
                <p>② 다음 각 호의 경우에는 환불을 요청할 수 있습니다:</p>
                
                <div className="bg-green-50 p-4 rounded-lg space-y-3">
                  <div>
                    <h3 className="font-semibold mb-1 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      1. 결제 오류로 인한 환불
                    </h3>
                    <p className="ml-6 text-sm">• 결제는 완료되었으나 파일이 다운로드되지 않은 경우</p>
                    <p className="ml-6 text-sm">• 동일 상품에 대해 중복 결제가 발생한 경우</p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-1 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      2. 상품 하자로 인한 환불
                    </h3>
                    <p className="ml-6 text-sm">• 파일이 손상되어 정상적으로 열리지 않는 경우</p>
                    <p className="ml-6 text-sm">• 상품 설명과 실제 내용이 현저히 다른 경우</p>
                    <p className="ml-6 text-sm">• 기술적 문제로 상품 이용이 어려운 경우</p>
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg mt-4">
                  <p className="text-sm">
                    <strong>※ 상품 하자의 경우:</strong> 위 사유에 해당하는 경우 고객센터로 문의하시면 환불 가능 여부를 확인해드립니다.
                  </p>
                </div>
              </div>
            </section>

            {/* 제3조 */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                제3조 (환불 불가 사유)
              </h2>
              <div className="space-y-4 text-gray-700">
                <p><strong>① 다음 각 호의 경우에는 환불이 불가능합니다:</strong></p>
                
                <div className="bg-red-50 p-4 rounded-lg border-l-4 border-red-400">
                  <div className="space-y-3">
                    <div>
                      <p className="font-semibold text-red-700 mb-1">1. 디지털 콘텐츠를 이용한 경우</p>
                      <ul className="list-disc list-inside ml-4 space-y-1 text-sm">
                        <li><strong>파일을 다운로드한 경우</strong> (전자상거래법 제17조 제2항 제5호)</li>
                        <li>온라인 뷰어로 파일을 열람한 경우</li>
                      </ul>
                    </div>
                    
                    <div>
                      <p className="font-semibold text-red-700 mb-1">2. 결제일로부터 7일이 경과한 경우</p>
                      <ul className="list-disc list-inside ml-4 space-y-1 text-sm">
                        <li>다운로드 여부와 관계없이 환불 불가</li>
                      </ul>
                    </div>
                    
                    <div>
                      <p className="font-semibold text-red-700 mb-1">3. 단순 변심 또는 착오로 인한 구매</p>
                    </div>
                    
                    <div>
                      <p className="font-semibold text-red-700 mb-1">4. 자료 내용이 기대와 다르다는 사유</p>
                      <ul className="list-disc list-inside ml-4 space-y-1 text-sm">
                        <li>상품 설명을 확인한 후 구매했으나 내용이 마음에 들지 않는 경우</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <p><strong>② 디지털 콘텐츠의 특성상 다운로드가 완료된 시점부터 상품의 전부를 공급받은 것으로 간주됩니다.</strong></p>

                <div className="bg-blue-50 p-4 rounded-lg mt-4">
                  <p className="text-sm">
                    <strong>※ 법적 근거:</strong> 「전자상거래 등에서의 소비자보호에 관한 법률」 제17조 제2항 제5호<br />
                    "디지털 콘텐츠의 제공이 개시된 경우(소비자가 가분적 용역 또는 가분적 디지털콘텐츠 중 일부에 대한 청약철회등을 행사한 경우는 제외한다)"
                  </p>
                </div>
              </div>
            </section>

            {/* 제4조 */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">제4조 (환불 신청 방법)</h2>
              <div className="space-y-3 text-gray-700">
                <p>① 환불을 원하시는 경우 다음의 방법으로 신청하실 수 있습니다:</p>
                
                <div className="bg-indigo-50 p-4 rounded-lg space-y-2">
                  <p><strong>• 이메일:</strong> payperic@naver.com</p>
                  <p><strong>• 전화:</strong> 010-7927-0806 (평일 09:00-18:00)</p>
                  <p><strong>• 카카오톡:</strong> @페이퍼릭</p>
                </div>

                <p>② 환불 신청 시 다음 정보를 포함해 주시기 바랍니다:</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>구매자 이름 및 이메일</li>
                  <li>주문번호 또는 결제일시</li>
                  <li>상품명</li>
                  <li>환불 사유</li>
                </ul>
              </div>
            </section>

            {/* 제5조 */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">제5조 (환불 처리 기간 및 절차)</h2>
              <div className="space-y-3 text-gray-700">
                <p>① 페이퍼릭은 회원이 환불을 신청한 날로부터 <strong>영업일 기준 3일 이내</strong>에 환불 신청 내역을 확인합니다.</p>
                
                <p>② 환불 가능 여부 확인을 위해 추가 정보가 필요한 경우 회원에게 이를 요청할 수 있으며, 추가 정보 확인 요청일로부터 영업일 기준 3일 이내에 답변을 받지 못한 경우 해당 환불 요청은 자동으로 취소됩니다.</p>

                <p>③ 환불이 승인된 경우, 승인 시점으로부터 <strong>영업일 기준 3일 이내</strong>에 환불이 처리됩니다.</p>
                
                <p>④ 환불은 원결제 수단으로만 가능하며, 결제 수단별 처리 기간은 다음과 같습니다:</p>
                
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <div>
                    <p className="font-semibold">신용/체크카드 결제</p>
                    <p className="text-sm ml-4">• 카드 승인 취소 요청 후 카드사 반영까지 영업일 기준 2~5일 소요</p>
                    <p className="text-sm ml-4">• 카드 대금 청구 완료 후 취소 시 익월 환급 처리 가능</p>
                  </div>
                  
                  <div>
                    <p className="font-semibold">간편결제 (토스, 카카오페이 등)</p>
                    <p className="text-sm ml-4">• 영업일 기준 2~5일 내 환불 완료</p>
                    <p className="text-sm ml-4">• 환불 내역은 해당 간편결제 앱에서 확인 가능</p>
                  </div>
                  
                  <div>
                    <p className="font-semibold">가상계좌 결제</p>
                    <p className="text-sm ml-4">• 회원이 제공한 계좌로 영업일 기준 2~3일 이내 입금</p>
                    <p className="text-sm ml-4">• 잘못된 계좌 정보 제공 시 환불 지연 가능</p>
                  </div>
                </div>
              </div>
            </section>

            {/* 제6조 */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">제6조 (부분 환불)</h2>
              <div className="space-y-3 text-gray-700">
                <p>① 디지털 콘텐츠의 특성상 부분 환불은 원칙적으로 불가능합니다.</p>
                <p>② 다만, 파일의 일부만 손상되어 사용이 제한되는 경우, 손상되지 않은 부분의 가치를 평가하여 부분 환불을 고려할 수 있습니다.</p>
              </div>
            </section>

            {/* 제7조 */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">제7조 (서비스 제공 완료 시점)</h2>
              <div className="space-y-3 text-gray-700">
                <p>① 디지털 콘텐츠의 서비스 제공은 <strong className="text-blue-600">다운로드가 완료된 즉시</strong> 완료된 것으로 간주됩니다.</p>
                <p>② 구매 후 최대 다운로드 가능 횟수는 <strong>10회</strong>이며, 다운로드 기간은 <strong>구매일로부터 1년</strong>입니다.</p>
                <p>③ 따라서 본 서비스의 최대 서비스 제공 기간은 <strong>즉시 제공 완료 (다운로드 완료 시)</strong>이며, 다운로드 권한 유효기간은 <strong>1년</strong>입니다.</p>
              </div>
            </section>

            {/* 제8조 */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">제8조 (고객센터 안내)</h2>
              <div className="space-y-3 text-gray-700">
                <p>환불 및 상품 관련 문의사항은 아래로 연락 주시기 바랍니다:</p>
                
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg">
                  <h3 className="font-semibold mb-3 text-lg">페이퍼릭(PAYPERIC) 고객센터</h3>
                  <div className="space-y-2">
                    <p><strong>상호명:</strong> 페이퍼릭(Payperic)</p>
                    <p><strong>대표자:</strong> 박준규</p>
                    <p><strong>이메일:</strong> payperic@naver.com</p>
                    <p><strong>연락처:</strong> 010-7927-0806</p>
                    <p><strong>운영시간:</strong> 평일 09:00 - 18:00 (주말 및 공휴일 휴무)</p>
                  </div>
                </div>
              </div>
            </section>

            {/* 부칙 */}
            <section className="border-t pt-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                부칙
              </h2>
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <p className="text-gray-700"><strong>시행일:</strong> 이 환불 정책은 2025년 11월 10일부터 시행됩니다.</p>
                <p className="text-sm text-gray-600">본 정책은 쏠북(주식회사 북아이피스) 등 디지털 콘텐츠 플랫폼의 환불 정책을 참고하여 작성되었으며, 전자상거래 등에서의 소비자보호에 관한 법률을 준수합니다.</p>
              </div>
            </section>

          </CardContent>
        </Card>

        {/* 하단 링크 */}
        <div className="mt-8 text-center space-y-4">
          <Link href="/">
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
              홈으로 돌아가기
            </Button>
          </Link>
          <div className="flex justify-center gap-4 text-sm text-gray-600">
            <Link href="/terms" className="hover:text-blue-600 underline">이용약관</Link>
            <Link href="/privacy" className="hover:text-blue-600 underline">개인정보처리방침</Link>
          </div>
        </div>
      </div>
    </div>
  )
}



