/** 토스페이먼츠 서버 호출 헬퍼. */

function tossSecretKey(): string {
  return process.env.TOSS_SECRET_KEY || 'live_gsk_QbgMGZzorzjKRv65Mjljrl5E1em4';
}

function authHeader(): string {
  return `Basic ${Buffer.from(tossSecretKey() + ':').toString('base64')}`;
}

/** 결제 취소(환불). 이미 취소된 결제면 Toss 가 에러를 주므로 code 로 멱등 처리. */
export async function tossCancel(
  paymentKey: string,
  cancelReason: string,
): Promise<{ ok: boolean; alreadyCanceled: boolean; data: any }> {
  const res = await fetch(`https://api.tosspayments.com/v1/payments/${encodeURIComponent(paymentKey)}/cancel`, {
    method: 'POST',
    headers: { Authorization: authHeader(), 'Content-Type': 'application/json' },
    body: JSON.stringify({ cancelReason }),
  });
  const data = await res.json();
  // 이미 취소된 결제: ALREADY_CANCELED_PAYMENT 등 → 멱등 성공으로 간주
  const alreadyCanceled = !res.ok && typeof data?.code === 'string' && /CANCEL/i.test(data.code);
  return { ok: res.ok || alreadyCanceled, alreadyCanceled, data };
}
