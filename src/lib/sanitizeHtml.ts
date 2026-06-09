/**
 * 매우 가벼운 HTML 새니타이저.
 * 화이트리스트 기반은 아니지만, 에디터 출력에서 가장 위험한 XSS 벡터를 제거한다.
 * - <script>, <style>, <iframe>, <object>, <embed>, <link>, <meta> 등의 태그 자체 제거
 * - on* 이벤트 핸들러 속성 제거
 * - href/src 의 javascript: / data: (이미지 제외) 프로토콜 제거
 */
const STRIP_TAGS = [
  "script",
  "style",
  "iframe",
  "object",
  "embed",
  "link",
  "meta",
  "base",
  "form",
  "input",
  "textarea",
  "button",
  "noscript",
];

export function sanitizeHtml(input: string): string {
  if (!input || typeof input !== "string") return "";

  let out = input;

  // 1) 위험한 태그 통째로 제거 (열림~닫힘 포함)
  for (const tag of STRIP_TAGS) {
    const re = new RegExp(`<\\s*${tag}\\b[^>]*>[\\s\\S]*?<\\s*/\\s*${tag}\\s*>`, "gi");
    out = out.replace(re, "");
    // self-closing/끊긴 형태도 제거
    const reSelf = new RegExp(`<\\s*${tag}\\b[^>]*/?>`, "gi");
    out = out.replace(reSelf, "");
  }

  // 2) HTML 주석 제거
  out = out.replace(/<!--[\s\S]*?-->/g, "");

  // 3) on* 이벤트 핸들러 속성 제거 (e.g. onclick="...")
  out = out.replace(/\son[a-z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, "");

  // 4) javascript: / vbscript: 프로토콜 제거 (href, src, formaction 등)
  out = out.replace(
    /\s(href|src|xlink:href|formaction|action|background|poster)\s*=\s*(["'])\s*(?:javascript|vbscript|data(?!:image\/))[^"']*\2/gi,
    ""
  );

  return out.trim();
}

export function makeExcerpt(html: string, max = 160): string {
  const text = (html || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
  if (text.length <= max) return text;
  return text.slice(0, max).replace(/\s+\S*$/, "") + "…";
}

export function makeSlug(title: string): string {
  const base = (title || "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return base || `post-${Date.now().toString(36)}`;
}
