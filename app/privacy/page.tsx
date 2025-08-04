import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Calendar, User, Shield, Lock, Eye, Database, AlertTriangle } from 'lucide-react'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* 헤더 */}
        <div className="mb-8">
          <Link href="/auth/signup">
            <Button variant="outline" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              회원가입으로 돌아가기
            </Button>
          </Link>
          
          <Card className="shadow-xl border-0">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                개인정보처리방침
              </CardTitle>
              <p className="text-gray-600 mt-2">개인정보 보호에 관한 WAgent의 정책입니다</p>
              <div className="flex items-center justify-center gap-4 text-sm text-gray-500 mt-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>시행일: 2024년 1월 1일</span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span>WAgent</span>
                </div>
              </div>
            </CardHeader>
          </Card>
        </div>

        {/* 개인정보처리방침 내용 */}
        <Card className="shadow-lg">
          <CardContent className="p-8 space-y-8">
            
            {/* 제1조 */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-600" />
                제1조 (개인정보의 처리목적)
              </h2>
              <div className="space-y-3 text-gray-700">
                <p>WAgent는 다음의 목적을 위하여 개인정보를 처리하고 있으며, 다음의 목적 이외의 용도로는 이용하지 않습니다.</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>회원가입 및 관리: 회원 가입의사 확인, 회원제 서비스 제공에 따른 본인 식별·인증</li>
                  <li>재화 또는 서비스 제공: 디지털 콘텐츠 제공, 콘텐츠 제공, 요금결제·정산</li>
                  <li>고충처리: 민원인의 신원 확인, 민원사항 확인, 사실조사를 위한 연락·통지</li>
                </ul>
              </div>
            </section>

            {/* 제2조 */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Database className="w-5 h-5 text-green-600" />
                제2조 (개인정보의 처리 및 보유기간)
              </h2>
              <div className="space-y-4 text-gray-700">
                <p>① WAgent는 정보주체로부터 개인정보를 수집할 때 동의받은 개인정보 보유·이용기간 또는 법령에 따른 개인정보 보유·이용기간 내에서 개인정보를 처리·보유합니다.</p>
                
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">② 구체적인 개인정보 처리 및 보유기간은 다음과 같습니다.</h3>
                  <div className="space-y-2">
                    <p><strong>• 회원가입 및 관리:</strong> 회원탈퇴 시까지</p>
                    <p><strong>• 재화 또는 서비스 제공:</strong> 재화·서비스 공급완료 및 요금결제·정산 완료시까지</p>
                    <p><strong>• 불만처리 등:</strong> 처리완료일로부터 3년</p>
                  </div>
                </div>
              </div>
            </section>

            {/* 제3조 */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Eye className="w-5 h-5 text-purple-600" />
                제3조 (개인정보의 제3자 제공)
              </h2>
              <div className="space-y-3 text-gray-700">
                <p>① WAgent는 개인정보를 제1조(개인정보의 처리목적)에서 명시한 범위 내에서만 처리하며, 정보주체의 동의, 법률의 특별한 규정 등 개인정보 보호법 제17조 및 제18조에 해당하는 경우에만 개인정보를 제3자에게 제공합니다.</p>
                <div className="bg-red-50 p-4 rounded-lg border-l-4 border-red-400">
                  <p className="font-semibold">② WAgent는 원칙적으로 이용자의 개인정보를 외부에 제공하지 않습니다.</p>
                </div>
              </div>
            </section>

            {/* 제4조 */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">제4조 (개인정보처리 위탁)</h2>
              <div className="space-y-3 text-gray-700">
                <p>① WAgent는 원활한 개인정보 업무처리를 위하여 다음과 같이 개인정보 처리업무를 위탁하고 있습니다.</p>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p><strong>현재 위탁 업체:</strong> 없음</p>
                  <p className="text-sm text-gray-600 mt-2">※ 향후 위탁 시 관련 내용을 업데이트하겠습니다.</p>
                </div>
              </div>
            </section>

            {/* 제5조 */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Lock className="w-5 h-5 text-indigo-600" />
                제5조 (정보주체의 권리·의무 및 행사방법)
              </h2>
              <div className="space-y-3 text-gray-700">
                <p>① 정보주체는 WAgent에 대해 언제든지 다음 각 호의 개인정보 보호 관련 권리를 행사할 수 있습니다.</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>개인정보 처리현황 통지요구</li>
                  <li>개인정보 처리정지 요구</li>
                  <li>개인정보의 정정·삭제 요구</li>
                  <li>손해배상 청구</li>
                </ul>
                <p>② 제1항에 따른 권리 행사는 개인정보 보호법 시행령 제41조제1항에 따라 서면, 전자우편, 모사전송(FAX) 등을 통하여 하실 수 있으며 WAgent는 이에 대해 지체없이 조치하겠습니다.</p>
              </div>
            </section>

            {/* 제6조 */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">제6조 (처리하는 개인정보의 항목)</h2>
              <div className="space-y-4 text-gray-700">
                <p>① WAgent는 다음의 개인정보 항목을 처리하고 있습니다.</p>
                
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">회원가입 및 관리</h3>
                  <div className="space-y-1">
                    <p><strong>• 필수항목:</strong> 이메일, 비밀번호, 이름</p>
                    <p><strong>• 선택항목:</strong> 닉네임, 휴대폰번호, 생년월일, 성별</p>
                  </div>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">인터넷 서비스 이용과정에서 자동으로 생성되어 수집되는 정보</h3>
                  <p>IP주소, 쿠키, MAC주소, 서비스 이용기록, 방문기록, 불량 이용기록 등</p>
                </div>
              </div>
            </section>

            {/* 제7조 */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">제7조 (개인정보의 파기)</h2>
              <div className="space-y-3 text-gray-700">
                <p>① WAgent는 개인정보 보유기간의 경과, 처리목적 달성 등 개인정보가 불필요하게 되었을 때에는 지체없이 해당 개인정보를 파기합니다.</p>
                <p>② 파기절차 및 파기방법은 다음과 같습니다.</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li><strong>파기절차:</strong> 별도의 DB에 옮겨져(종이의 경우 별도의 서류함) 내부 방침 및 기타 관련 법령에 따라 일정기간 저장된 후 혹은 즉시 파기됩니다.</li>
                  <li><strong>파기방법:</strong> 전자적 파일 형태의 정보는 기록을 재생할 수 없는 기술적 방법을 사용하여 삭제합니다.</li>
                </ul>
              </div>
            </section>

            {/* 제8조 */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">제8조 (개인정보의 안전성 확보조치)</h2>
              <div className="space-y-3 text-gray-700">
                <p>WAgent는 개인정보보호법 제29조에 따라 다음과 같이 안전성 확보에 필요한 기술적/관리적 및 물리적 조치를 하고 있습니다.</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>개인정보 취급 직원의 최소화 및 교육</li>
                  <li>개인정보에 대한 접근 제한</li>
                  <li>개인정보의 암호화</li>
                  <li>해킹 등에 대비한 기술적 대책</li>
                  <li>개인정보처리시스템 등의 접근권한 관리</li>
                  <li>접근통제시스템 설치</li>
                </ul>
              </div>
            </section>

            {/* 제9조 */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">제9조 (개인정보 보호책임자)</h2>
              <div className="space-y-3 text-gray-700">
                <p>① WAgent는 개인정보 처리에 관한 업무를 총괄해서 책임지고, 개인정보 처리와 관련한 정보주체의 불만처리 및 피해구제 등을 위하여 아래와 같이 개인정보 보호책임자를 지정하고 있습니다.</p>
                
                <div className="bg-indigo-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">▶ 개인정보 보호책임자</h3>
                  <div className="space-y-1">
                    <p><strong>성명:</strong> WAgent 관리자</p>
                    <p><strong>연락처:</strong> wnsbr2898@naver.com</p>
                  </div>
                </div>

                <p>② 정보주체께서는 WAgent의 서비스를 이용하시면서 발생한 모든 개인정보 보호 관련 문의, 불만처리, 피해구제 등에 관한 사항을 개인정보 보호책임자에게 문의하실 수 있습니다.</p>
              </div>
            </section>

            {/* 제10조 */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">제10조 (개인정보 처리방침 변경)</h2>
              <div className="space-y-3 text-gray-700">
                <p>① 이 개인정보처리방침은 시행일로부터 적용되며, 법령 및 방침에 따른 변경내용의 추가, 삭제 및 정정이 있는 경우에는 변경사항의 시행 7일 전부터 공지사항을 통하여 고지할 것입니다.</p>
              </div>
            </section>

            {/* 부칙 */}
            <section className="border-t pt-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                부칙
              </h2>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700"><strong>시행일:</strong> 이 개인정보처리방침은 2024년 1월 1일부터 시행됩니다.</p>
              </div>
            </section>

          </CardContent>
        </Card>

        {/* 하단 링크 */}
        <div className="mt-8 text-center">
          <Link href="/auth/signup">
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
              회원가입 계속하기
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}