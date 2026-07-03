/**
 * 프릭 충전 할인 — 많이 충전할수록 결제 원화가 할인된다.
 * 충전되는 프릭 수는 그대로(1:1), 대신 내는 돈이 tier 할인율만큼 깎인다.
 * 예) 50,000 프릭 충전 → 10% 할인 → 45,000원 결제 → 50,000 프릭 적립.
 *
 * 클라이언트(표시)와 서버(create/confirm 검증)가 이 한 파일을 공유해 항상 동일 계산.
 */
export interface DiscountTier {
  min: number; // 이 프릭 이상이면
  rate: number; // 이 할인율
}

/** 높은 tier 부터. 필요하면 이 표만 고치면 됨. */
export const PRIC_CHARGE_DISCOUNT_TIERS: DiscountTier[] = [
  { min: 100000, rate: 0.15 },
  { min: 50000, rate: 0.10 },
  { min: 30000, rate: 0.07 },
  { min: 10000, rate: 0.05 },
  { min: 0, rate: 0 },
];

/** 충전 프릭 수 → 할인율(0~1). */
export function pricChargeDiscountRate(pric: number): number {
  const p = Math.max(0, Math.trunc(Number(pric) || 0));
  for (const t of PRIC_CHARGE_DISCOUNT_TIERS) {
    if (p >= t.min) return t.rate;
  }
  return 0;
}

/** 충전 프릭 수 → 실제 결제할 원화(할인 적용, 정수). */
export function pricChargePayable(pric: number): number {
  const p = Math.max(0, Math.trunc(Number(pric) || 0));
  return Math.round(p * (1 - pricChargeDiscountRate(p)));
}
