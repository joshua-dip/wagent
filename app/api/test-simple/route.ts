// 가장 간단한 API - 어떤 dependency도 사용하지 않음
export async function GET() {
  return new Response(JSON.stringify({
    message: "최소한의 API 작동",
    time: new Date().toISOString(),
    ok: true
  }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

export async function POST() {
  return new Response(JSON.stringify({
    message: "POST 요청 처리됨",
    time: new Date().toISOString(),
    ok: true
  }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}