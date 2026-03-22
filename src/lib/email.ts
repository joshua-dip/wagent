import nodemailer from 'nodemailer'

export type SendEmailResult = { ok: true } | { ok: false; error: string }

/**
 * 인증번호 메일 발송
 * - RESEND_API_KEY 가 있으면 Resend REST API 사용
 * - 아니면 SMTP (SMTP_HOST, SMTP_USER, SMTP_PASS 등) 사용
 */
export async function sendVerificationCodeEmail(
  to: string,
  name: string,
  code: string
): Promise<SendEmailResult> {
  const subject = '[PAYPERIC] 이메일 인증번호'
  const text = `${name}님, 회원가입 인증번호는 ${code} 입니다. 10분 이내에 입력해 주세요.`
  const html = `
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
      <h2 style="color: #0d9488;">PAYPERIC 이메일 인증</h2>
      <p>${escapeHtml(name)}님, 안녕하세요.</p>
      <p>아래 인증번호를 10분 이내에 입력해 주세요.</p>
      <p style="font-size: 28px; font-weight: bold; letter-spacing: 4px; color: #111;">${escapeHtml(code)}</p>
      <p style="color: #666; font-size: 13px;">본인이 요청하지 않았다면 이 메일을 무시하세요.</p>
    </div>
  `

  const resendKey = process.env.RESEND_API_KEY
  if (resendKey) {
    const from = process.env.EMAIL_FROM || 'PAYPERIC <onboarding@resend.dev>'
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from,
          to: [to],
          subject,
          html,
          text,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        console.error('[email] Resend error:', res.status, data)
        return {
          ok: false,
          error: typeof data?.message === 'string' ? data.message : 'Resend 발송 실패',
        }
      }
      return { ok: true }
    } catch (e) {
      console.error('[email] Resend exception:', e)
      return { ok: false, error: e instanceof Error ? e.message : 'Resend 요청 실패' }
    }
  }

  const host = process.env.SMTP_HOST
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS

  if (!host || !user || !pass) {
    return {
      ok: false,
      error:
        '이메일 발송 미설정: RESEND_API_KEY 또는 SMTP_HOST/SMTP_USER/SMTP_PASS 를 .env에 설정하세요.',
    }
  }

  const port = parseInt(process.env.SMTP_PORT || '465', 10)
  const secure = process.env.SMTP_SECURE !== 'false' && port === 465

  try {
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: { user, pass },
    })

    const from = process.env.EMAIL_FROM || `PAYPERIC <${user}>`

    await transporter.sendMail({
      from,
      to,
      subject,
      text,
      html,
    })
    return { ok: true }
  } catch (e) {
    console.error('[email] SMTP error:', e)
    return { ok: false, error: e instanceof Error ? e.message : 'SMTP 발송 실패' }
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
