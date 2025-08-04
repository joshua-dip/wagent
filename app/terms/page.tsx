import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Calendar, User, Shield, AlertTriangle } from 'lucide-react'

export default function TermsPage() {
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
                WAgent 이용약관
              </CardTitle>
              <p className="text-gray-600 mt-2">서비스 이용을 위한 필수 약관입니다</p>
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

        {/* 약관 내용 */}
        <Card className="shadow-lg">
          <CardContent className="p-8 space-y-8">
            
            {/* 제1조 */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-600" />
                제1조 (목적)
              </h2>
              <p className="text-gray-700 leading-relaxed">
                이 약관은 WAgent(이하 "회사")가 제공하는 디지털 자료 마켓플레이스 서비스(이하 "서비스")의 이용과 관련하여 
                회사와 이용자 간의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.
              </p>
            </section>

            {/* 제2조 */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">제2조 (정의)</h2>
              <div className="space-y-3 text-gray-700">
                <p><strong>1. "서비스"</strong>란 회사가 제공하는 디지털 자료 판매 및 구매 플랫폼을 의미합니다.</p>
                <p><strong>2. "이용자"</strong>란 이 약관에 따라 회사가 제공하는 서비스를 받는 회원 및 비회원을 의미합니다.</p>
                <p><strong>3. "회원"</strong>이란 회사에 개인정보를 제공하여 회원등록을 한 자를 의미합니다.</p>
                <p><strong>4. "디지털 자료"</strong>란 서비스를 통해 판매되는 모든 디지털 콘텐츠를 의미합니다.</p>
              </div>
            </section>

            {/* 제3조 */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">제3조 (약관의 효력 및 변경)</h2>
              <div className="space-y-3 text-gray-700">
                <p><strong>1.</strong> 이 약관은 서비스 화면에 게시하거나 기타의 방법으로 이용자에게 공지함으로써 효력이 발생합니다.</p>
                <p><strong>2.</strong> 회사는 필요하다고 인정되는 경우 이 약관을 변경할 수 있으며, 변경된 약관은 제1항과 같은 방법으로 공지 또는 통지함으로써 효력이 발생합니다.</p>
                <p><strong>3.</strong> 이용자는 변경된 약관에 동의하지 않을 권리가 있으며, 변경된 약관에 동의하지 않는 경우 서비스 이용을 중단하고 탈퇴할 수 있습니다.</p>
              </div>
            </section>

            {/* 제4조 */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">제4조 (회원가입)</h2>
              <div className="space-y-3 text-gray-700">
                <p><strong>1.</strong> 회원가입은 이용자가 약관의 내용에 대하여 동의를 하고 회원가입신청을 한 후 회사가 이러한 신청에 대하여 승낙함으로써 체결됩니다.</p>
                <p><strong>2.</strong> 회사는 다음 각 호에 해당하는 신청에 대하여는 승낙을 하지 않거나 사후에 이용계약을 해지할 수 있습니다.</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>실명이 아니거나 타인의 명의를 이용한 경우</li>
                  <li>허위의 정보를 기재하거나, 회사가 제시하는 내용을 기재하지 않은 경우</li>
                  <li>관련 법령에 위배되거나 사회의 안녕과 질서, 미풍양속을 저해할 목적으로 신청한 경우</li>
                </ul>
              </div>
            </section>

            {/* 제5조 */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">제5조 (서비스의 제공 및 변경)</h2>
              <div className="space-y-3 text-gray-700">
                <p><strong>1.</strong> 회사는 다음과 같은 업무를 수행합니다.</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>디지털 자료 판매 플랫폼 제공</li>
                  <li>기타 회사가 정하는 업무</li>
                </ul>
                <p><strong>2.</strong> 회사는 운영상, 기술상의 필요에 따라 제공하고 있는 전부 또는 일부 서비스를 변경할 수 있습니다.</p>
              </div>
            </section>

            {/* 제6조 */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">제6조 (서비스의 중단)</h2>
              <div className="space-y-3 text-gray-700">
                <p><strong>1.</strong> 회사는 컴퓨터 등 정보통신설비의 보수점검, 교체 및 고장, 통신의 두절 등의 사유가 발생한 경우에는 서비스의 제공을 일시적으로 중단할 수 있습니다.</p>
                <p><strong>2.</strong> 회사는 국가비상사태, 정전, 서비스 설비의 장애 또는 서비스 이용의 폭주 등으로 정상적인 서비스 이용에 지장이 있는 때에는 서비스의 전부 또는 일부를 제한하거나 정지할 수 있습니다.</p>
              </div>
            </section>

            {/* 제7조 */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">제7조 (이용자의 의무)</h2>
              <div className="space-y-3 text-gray-700">
                <p>이용자는 다음 행위를 하여서는 안 됩니다.</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>신청 또는 변경 시 허위내용의 등록</li>
                  <li>타인의 정보도용</li>
                  <li>회사가 게시한 정보의 변경</li>
                  <li>회사가 금지한 정보(컴퓨터 프로그램 등)의 송신 또는 게시</li>
                  <li>회사와 기타 제3자의 저작권 등 지적재산권에 대한 침해</li>
                  <li>회사와 기타 제3자의 명예를 손상시키거나 업무를 방해하는 행위</li>
                  <li>외설 또는 폭력적인 메시지, 화상, 음성, 기타 공서양속에 반하는 정보를 서비스에 공개 또는 게시하는 행위</li>
                </ul>
              </div>
            </section>

            {/* 제8조 */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">제8조 (저작권의 귀속 및 이용제한)</h2>
              <div className="space-y-3 text-gray-700">
                <p><strong>1.</strong> 회사가 작성한 저작물에 대한 저작권 기타 지적재산권은 회사에 귀속합니다.</p>
                <p><strong>2.</strong> 이용자는 서비스를 이용함으로써 얻은 정보 중 회사에게 지적재산권이 귀속된 정보를 회사의 사전 승낙 없이 복제, 송신, 출판, 배포, 방송 기타 방법에 의하여 영리목적으로 이용하거나 제3자에게 이용하게 하여서는 안됩니다.</p>
              </div>
            </section>

            {/* 제9조 */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">제9조 (분쟁해결)</h2>
              <div className="space-y-3 text-gray-700">
                <p><strong>1.</strong> 회사는 이용자가 제기하는 정당한 의견이나 불만을 반영하고 그 피해를 보상처리하기 위하여 피해보상처리기구를 설치·운영합니다.</p>
                <p><strong>2.</strong> 회사와 이용자 간에 발생한 분쟁은 전자거래기본법 제28조 및 동 시행령 제15조에 의하여 설치된 전자거래분쟁조정위원회의 조정에 따를 수 있습니다.</p>
              </div>
            </section>

            {/* 제10조 */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">제10조 (재판권 및 준거법)</h2>
              <div className="space-y-3 text-gray-700">
                <p><strong>1.</strong> 회사와 이용자 간에 발생한 분쟁에 관한 소송의 관할은 민사소송법상의 관할법원에 따릅니다.</p>
                <p><strong>2.</strong> 회사와 이용자 간에 제기된 전자거래 소송에는 한국법을 적용합니다.</p>
              </div>
            </section>

            {/* 부칙 */}
            <section className="border-t pt-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                부칙
              </h2>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700"><strong>시행일:</strong> 이 약관은 2024년 1월 1일부터 시행됩니다.</p>
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