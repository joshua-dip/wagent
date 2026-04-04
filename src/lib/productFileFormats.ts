/** 상품이 PDF 다운로드를 제공하는지 (주 파일이 PDF이거나 PDF+HWP인 경우) */
export function productHasPdf(p: { originalFileName?: string | null }): boolean {
  return !!p.originalFileName?.toLowerCase().endsWith(".pdf")
}

/** 상품이 HWP 다운로드를 제공하는지 */
export function productHasHwp(p: {
  originalFileName?: string | null
  hwpFilePath?: string | null
  hwpOriginalFileName?: string | null
}): boolean {
  return !!(
    (p.hwpFilePath && p.hwpOriginalFileName) ||
    p.originalFileName?.toLowerCase().endsWith(".hwp")
  )
}

export function fileFormatsSummary(p: {
  originalFileName?: string | null
  hwpFilePath?: string | null
  hwpOriginalFileName?: string | null
}): string {
  const hasPdf = productHasPdf(p)
  const hasHwp = productHasHwp(p)
  if (hasPdf && hasHwp) return "PDF·HWP"
  if (hasPdf) return "PDF"
  if (hasHwp) return "HWP"
  return "파일"
}
