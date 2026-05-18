import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM = process.env.RESEND_FROM_EMAIL ?? 'noreply@padelpoint.az'

export async function sendWelcomeEmail(name: string, email: string) {
  const firstName = name.split(' ')[0]
  const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#0A0A0A;font-family:Inter,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#0A0A0A;padding:40px 0">
<tr><td align="center">
<table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%">
  <tr><td style="background:#1A1A1A;border-radius:12px 12px 0 0;padding:32px 40px;text-align:center">
    <p style="margin:0;font-size:10px;letter-spacing:4px;color:#888;text-transform:uppercase;margin-bottom:10px">Bakı · Azərbaycan</p>
    <h1 style="margin:0;color:white;font-size:24px;font-weight:900;letter-spacing:0.06em">PADEL<span style="color:#C8E63C">POINT</span></h1>
  </td></tr>
  <tr><td style="background:#C8E63C;padding:32px 40px;text-align:center">
    <p style="margin:0;font-size:28px">🎾</p>
    <h2 style="margin:12px 0 8px;font-size:24px;font-weight:900;color:#0A0A0A">Xoş gəldiniz, ${firstName}!</h2>
    <p style="margin:0;font-size:14px;color:rgba(0,0,0,0.6)">Siz artıq PadelPoint ailəsinin bir hissəsiniz</p>
  </td></tr>
  <tr><td style="background:white;padding:32px 40px">
    <p style="font-size:15px;color:#333;line-height:1.7;margin-bottom:20px">
      Hesabınız uğurla yaradıldı. İndi kortlarımızı rezerv edə, üzv ola və məşqçilərimizlə görüşə bilərsiniz.
    </p>
    <ul style="font-size:14px;color:#555;line-height:2;padding-left:20px;margin-bottom:24px">
      <li>İş günü səhər: <strong>60 AZN / 90 dəq</strong></li>
      <li>İş günü axşam: <strong>80 AZN / 90 dəq</strong></li>
      <li>Həftə sonu: <strong>80 AZN / 90 dəq</strong></li>
    </ul>
    <div style="text-align:center">
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/book" style="display:inline-block;background:#C8E63C;color:#0A0A0A;padding:14px 36px;border-radius:6px;font-size:13px;font-weight:800;letter-spacing:0.06em;text-transform:uppercase;text-decoration:none">Kort Rezerv Et →</a>
    </div>
  </td></tr>
  <tr><td style="background:#111;padding:20px 40px;text-align:center;border-radius:0 0 12px 12px">
    <p style="margin:0;font-size:12px;color:#555">© 2025 PadelPoint Baku · info@padelpoint.az</p>
  </td></tr>
</table>
</td></tr>
</table>
</body></html>`

  await resend.emails.send({
    from: FROM,
    to: email,
    subject: `🎾 Xoş gəldiniz, ${firstName}! PadelPoint ailəsinə qoşuldunuz`,
    html,
  })
}
