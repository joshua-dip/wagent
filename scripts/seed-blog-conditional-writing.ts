/**
 * '조건영작배열' 서술형 대비 소개 블로그 글 시드
 *
 * 사용법:
 *   npx tsx scripts/seed-blog-conditional-writing.ts
 */

import { config } from "dotenv"
import path from "path"
import mongoose from "mongoose"
import BlogPost from "../src/models/BlogPost"
import { sanitizeHtml } from "../src/lib/sanitizeHtml"

config({ path: path.resolve(process.cwd(), ".env.local") })

const SLUG = "conditional-writing-arrangement"
const COVER_IMAGE = "/blog/conditional-writing/01-basic.png"

function img(src: string, alt: string) {
  return `<figure style="margin:20px 0 28px;"><img src="${src}" alt="${alt}" style="width:100%;height:auto;border-radius:12px;border:1px solid #e2e8f0;" /><figcaption style="margin-top:8px;text-align:center;font-size:13px;color:#64748b;">${alt}</figcaption></figure>`
}

const CTA = `
<div style="border:1px solid #d1fae5;background:#ecfdf5;border-radius:16px;padding:20px 22px;margin:24px 0;">
  <p style="margin:0 0 6px;font-size:12px;font-weight:700;color:#047857;letter-spacing:0.02em;">풀세트 · 전 문항 × 전 난이도</p>
  <p style="margin:0 0 4px;font-size:18px;font-weight:800;color:#0f172a;">26년 5월 고3 영어모의고사 조건영작배열 전체 풀세트</p>
  <p style="margin:0 0 10px;font-size:13px;color:#475569;">18~45번 전 문항 · 4난이도 · 난이도별 4개 PDF + 번호별 25개 PDF ZIP</p>
  <p style="margin:0 0 14px;font-size:14px;color:#0f172a;"><strong style="color:#dc2626;">20% OFF</strong> &nbsp;<strong style="font-size:18px;">14,000원</strong> <span style="color:#94a3b8;text-decoration:line-through;font-size:13px;">17,600원</span></p>
  <a href="https://www.payperic.com/" style="display:inline-block;background:linear-gradient(to right,#10b981,#14b8a6);color:#fff;font-weight:700;font-size:14px;padding:10px 20px;border-radius:9999px;text-decoration:none;">풀세트 보러 가기 →</a>
</div>
`

const CONTENT = `
<p>하나의 지문을 단순히 읽고 끝내는 것이 아니라, 실제 내신 서술형에서 자주 요구되는 방식으로 문장을 다시 구성하도록 설계했습니다. 같은 지문이라도 학생의 수준에 따라 필요한 훈련 방식은 다릅니다. <strong>조건영작배열</strong>은 바로 그 차이를 메우기 위해 만든 단계별 서술형 훈련 자료입니다.</p>

${CTA}

<h2>이 자료의 핵심은 '난도별 훈련'입니다</h2>
<p>같은 지문이라도 학생의 수준에 따라 필요한 훈련 방식은 다릅니다. 그래서 이 자료는 다음과 같이 단계별로 구성되어 있습니다.</p>
<ul>
  <li><strong>기본난도</strong> — 문장 배열의 기본 구조를 익힙니다.</li>
  <li><strong>중난도</strong> — 비교급, 수동태, 수 일치처럼 자주 틀리는 문법 요소를 함께 점검합니다.</li>
  <li><strong>고난도</strong> — 핵심 단어만 보고 문장을 직접 구성하는 연습을 합니다.</li>
  <li><strong>최고난도</strong> — 한국어 해석만 보고 완전한 영어 문장을 작성하도록 훈련합니다.</li>
</ul>
<p>아래는 26년 5월 고3 영어모의고사 24번을 같은 지문으로 난이도만 달리 구성한 예시입니다.</p>
<h3>기본난도</h3>
${img("/blog/conditional-writing/01-basic.png", "26년 5월 고3 영어모의고사 24번 · 조건영작배열 기본난도")}
<h3>중난도</h3>
${img("/blog/conditional-writing/02-intermediate.png", "26년 5월 고3 영어모의고사 24번 · 조건영작배열 중난도")}
<h3>고난도</h3>
${img("/blog/conditional-writing/03-advanced.png", "26년 5월 고3 영어모의고사 24번 · 조건영작배열 고난도")}
<h3>최고난도</h3>
${img("/blog/conditional-writing/04-expert.png", "26년 5월 고3 영어모의고사 24번 · 조건영작배열 최고난도")}
<p>즉, 단순한 영작 문제가 아니라 <strong>문장 구조 이해 → 조건 분석 → 어법 적용 → 완성 문장 작성</strong>까지 이어지는 자료입니다.</p>

<h2>정답 해설도 꼼꼼하게 구성했습니다</h2>
<p>문제를 푸는 것만큼 중요한 것은 학생이 왜 틀렸는지, 어떤 부분을 조심해야 하는지 아는 것입니다. 그래서 정답 및 해설에는 단순 정답만 넣지 않았습니다.</p>
<ul>
  <li>각 문항마다 <strong>문법 포인트</strong>를 정리</li>
  <li><strong>단어 수 검증</strong>으로 조건 충족 여부 확인</li>
  <li>학생들이 자주 실수하는 <strong>감점 포인트</strong>까지 제시</li>
</ul>
<p>특히 주어, 동사, 목적어, 보어, 수식어 등을 구분해 문장 구조를 볼 수 있도록 하여, 학생들이 문장을 감으로 배열하는 것이 아니라 <strong>구조를 근거로 영작</strong>할 수 있게 했습니다.</p>
<p>난이도별 정답 해설에는 문법 포인트, 단어 수 검증, 감점 포인트가 함께 정리되어 있습니다.</p>
<h3>기본난도 해설</h3>
${img("/blog/conditional-writing/05-answer-basic.png", "정답 및 해설 · 기본난도")}
<h3>중난도 해설</h3>
${img("/blog/conditional-writing/06-answer-intermediate.png", "정답 및 해설 · 중난도")}
<h3>고난도 해설</h3>
${img("/blog/conditional-writing/07-answer-advanced.png", "정답 및 해설 · 고난도")}
<h3>최고난도 해설</h3>
${img("/blog/conditional-writing/08-answer-expert.png", "정답 및 해설 · 최고난도")}

<h2>이런 학생에게 특히 좋습니다</h2>
<ul>
  <li>서술형에서 부분점수는 받지만 만점을 받지 못하는 학생</li>
  <li>문장 배열 문제에서 어순을 자주 헷갈리는 학생</li>
  <li>수동태·비교급·분사구문처럼 내신 서술형에 자주 나오는 문법을 지문 안에서 훈련하고 싶은 학생</li>
</ul>
<p>또한 학교 시험에서 조건이 길게 제시되는 서술형 문제를 대비하는 데에도 좋습니다. 조건을 읽고, 필요한 문법 구조를 파악한 뒤, 정확한 문장으로 완성하는 연습을 할 수 있기 때문입니다.</p>

<h2>실제 수업에서 검증하며 만든 자료입니다</h2>
<p>이 자료는 단순히 문제만 만들어 놓은 자료가 아닙니다. 제가 직접 학생들을 지도하면서, 실제 내신 서술형에서 어떤 부분을 어려워하는지 확인하고 반영해 만든 자료입니다.</p>
<p>특히 조건을 보고 문장을 배열하는 문제, 한국어 해석을 바탕으로 영어 문장을 완성하는 문제, 수동태·비교급·분사구문처럼 자주 감점되는 문법 요소들을 반복적으로 훈련할 수 있도록 구성했습니다.</p>
<blockquote><p>실제로 이와 같은 방식의 서술형 훈련을 꾸준히 진행한 학생 중에는 <strong>26년 1학기 중간고사 서술형에서 100점</strong>을 받은 사례도 있습니다.</p></blockquote>

<h2>하나의 지문을 제대로 공부하는 방식</h2>
<p>영어 지문 하나를 공부할 때 단어 뜻과 해석만 확인하고 넘어가면 실제 시험에서 서술형에 대응하기 어렵습니다. 이 자료는 지문 속 핵심 문장을 다시 꺼내어 학생이 직접 <strong>배열하고, 고치고, 작성하게</strong> 만드는 방식입니다.</p>
<p>결국 서술형 실력은 많은 문제를 대충 푸는 것보다 하나의 문장을 정확하게 분석하고 완성하는 연습에서 만들어집니다. 고등부 영어 서술형 대비가 필요한 학생이라면 난도별로 차근차근 풀어보며 문장 구조와 영작 감각을 함께 잡아보시기 바랍니다.</p>

${CTA}

<h2>앞으로의 계획</h2>
<p>앞으로도 서술형 대비 자료는 계속해서 단계별로 확장해 나갈 예정입니다. 현재는 조건영작배열 자료를 중심으로 제작하고 있지만, 추가적으로 <strong>어법 서술형 대비, 문장배열 서술형 대비, 해석 기반 영작 대비, 핵심 구문 변형 대비</strong> 등 실제 학교 시험에서 자주 출제되는 유형들을 중심으로 훈련 자료를 더 만들어가려고 합니다.</p>
<p>제가 직접 수업을 운영하면서 느낀 점은, 서술형은 단순히 문장을 많이 외운다고 해결되는 영역이 아니라는 것입니다. 학생마다 약한 부분이 다릅니다. 어떤 학생은 어순에서 자주 틀리고, 어떤 학생은 수동태나 분사구문에서 감점이 생기며, 또 어떤 학생은 조건을 읽고도 어떤 문법 구조를 써야 하는지 파악하지 못합니다.</p>
<p>그래서 앞으로의 자료는 단순히 문제 수를 늘리는 방향이 아니라, 학생들이 실제로 어려워하는 부분을 더 세밀하게 나누어 단계별로 훈련할 수 있는 자료로 만들어가고자 합니다.</p>
<p>또한 회원분들과 소통하면서 필요한 학교, 학년, 시험 범위, 문제 유형에 맞춘 자료도 함께 만들어 나가고 싶습니다. "이런 유형이 더 필요하다", "우리 학교는 이런 식으로 서술형이 나온다", "어법 중심 자료가 더 있었으면 좋겠다"와 같은 의견을 주시면 실제 자료 제작에 반영해 더 실용적인 콘텐츠로 발전시켜 나가겠습니다.</p>

<h2>문의</h2>
<p>서술형 대비 자료, 내신형 변형문제, 수업용 자료 제작과 관련해 문의가 있으시면 아래 연락처로 편하게 문의해 주세요.</p>
<ul>
  <li>카카오톡 채널: <a href="https://pf.kakao.com/_qxbvtn" target="_blank" rel="noopener noreferrer">@payperic</a></li>
  <li>카카오톡 채팅: <a href="https://pf.kakao.com/_qxbvtn/chat" target="_blank" rel="noopener noreferrer">채널로 문의하기</a></li>
</ul>
`

async function main() {
  const uri = process.env.MONGODB_URI
  if (!uri) {
    console.error("MONGODB_URI가 .env.local에 없습니다.")
    process.exit(1)
  }

  await mongoose.connect(uri)
  console.log("MongoDB 연결됨")

  const title = "내신 서술형 대비, 이제는 '조건영작배열'로 훈련하세요"
  const content = sanitizeHtml(CONTENT.trim())
  const excerpt =
    "하나의 지문을 읽고 끝내는 것이 아니라, 실제 내신 서술형에서 요구되는 방식으로 문장을 다시 구성하도록 설계한 난도별 조건영작배열 훈련 자료를 소개합니다."

  const existing = await BlogPost.findOne({ slug: SLUG })
  if (existing) {
    existing.title = title
    existing.content = content
    existing.excerpt = excerpt
    existing.coverImage = COVER_IMAGE
    existing.tags = ["내신 서술형", "조건영작배열", "고등 영어", "영작", "모의고사"]
    existing.status = "published"
    existing.publishedAt = existing.publishedAt || new Date()
    await existing.save()
    console.log(`기존 글 업데이트 완료: /blog/${SLUG}`)
    await mongoose.disconnect()
    return
  }

  const post = await BlogPost.create({
    title,
    slug: SLUG,
    content,
    excerpt,
    coverImage: COVER_IMAGE,
    tags: ["내신 서술형", "조건영작배열", "고등 영어", "영작", "모의고사"],
    status: "published",
    authorEmail: "blog@payperic.com",
    authorName: "PAYPERIC",
    publishedAt: new Date(),
    views: 0,
  })

  console.log(`블로그 글 생성 완료: /blog/${post.slug}`)
  await mongoose.disconnect()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
