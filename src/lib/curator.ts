import Product from '@/models/Product'

/** 모듈 + 연결된 PDF 상품(구매/담기용) 직렬화. pdfRef 없으면 product=null(준비중). */
export interface SerializedCuratorModule {
  code: string
  category: string
  title: string
  description: string
  pages: number
  diagnosticTags: string[]
  order: number
  product: { id: string; price: number; isActive: boolean; title: string } | null
}

interface LeanModule {
  code?: string; category?: string; title?: string; description?: string
  pages?: number; diagnosticTags?: string[]; order?: number; pdfRef?: unknown
}

export async function serializeModules(modules: LeanModule[]): Promise<SerializedCuratorModule[]> {
  const pdfIds = modules.map((m) => m.pdfRef).filter(Boolean).map((x) => String(x))
  const products = pdfIds.length
    ? await Product.find({ _id: { $in: pdfIds } }).select('price isActive title').lean()
    : []
  const pmap = new Map(
    (products as Array<{ _id: unknown; price?: number; isActive?: boolean; title?: string }>).map((p) => [String(p._id), p]),
  )
  return modules.map((m) => {
    const p = m.pdfRef ? pmap.get(String(m.pdfRef)) : null
    return {
      code: m.code ?? '',
      category: m.category ?? '',
      title: m.title ?? '',
      description: m.description ?? '',
      pages: m.pages ?? 0,
      diagnosticTags: Array.isArray(m.diagnosticTags) ? m.diagnosticTags : [],
      order: m.order ?? 0,
      product: p ? { id: String(p._id), price: p.price ?? 0, isActive: p.isActive ?? false, title: p.title ?? '' } : null,
    }
  })
}
