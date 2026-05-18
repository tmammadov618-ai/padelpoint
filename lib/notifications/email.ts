import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM = process.env.RESEND_FROM_EMAIL ?? 'noreply@padelpoint.az'
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://padelpoint3.vercel.app'

export async function sendBookingConfirmation(booking: any) {
  const customer = booking.customer
  const court = booking.court
  const startsAt = new Date(booking.starts_at)
  const endsAt = new Date(booking.ends_at)

  const dateStr = startsAt.toLocaleDateString('az-AZ', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  const timeStr = `${startsAt.toLocaleTimeString('az-AZ', { hour: '2-digit', minute: '2-digit' })} – ${endsAt.toLocaleTimeString('az-AZ', { hour: '2-digit', minute: '2-digit' })}`

  try {
    await resend.emails.send({
      from: FROM,
      to: customer?.email ?? '',
      subject: `✅ Rezervasiya Təsdiqləndi — ${court?.name} · ${dateStr}`,
      html: `
        <div style="font-family:Inter,sans-serif;background:#0A0A0A;padding:40px 0">
          <div style="max-width:560px;margin:0 auto;background:#1A1A1A;border-radius:12px;overflow:hidden">
            <div style="background:#C8E63C;padding:24px 32px;text-align:center">
              <h1 style="margin:0;font-size:20px;font-weight:900;color:#0A0A0A">PADEL<span>POINT</span></h1>
              <p style="margin:8px 0 0;font-size:14px;color:rgba(0,0,0,0.6)">Rezervasiya Təsdiqləndi ✅</p>
            </div>
            <div style="padding:28px 32px">
              <p style="color:white;font-size:16px;margin-bottom:20px">Salam ${customer?.full_name ?? 'İstifadəçi'}!</p>
              <div style="background:#111;border-radius:8px;padding:20px;margin-bottom:20px">
                <p style="color:#C8E63C;font-size:11px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;margin-bottom:12px">Rezervasiya məlumatları</p>
                <p style="color:rgba(255,255,255,0.7);font-size:14px;margin-bottom:8px">🏟️ <strong style="color:white">${court?.name ?? 'Kort'}</strong></p>
                <p style="color:rgba(255,255,255,0.7);font-size:14px;margin-bottom:8px">📅 <strong style="color:white">${dateStr}</strong></p>
                <p style="color:rgba(255,255,255,0.7);font-size:14px;margin-bottom:8px">⏰ <strong style="color:white">${timeStr}</strong></p>
                <p style="color:rgba(255,255,255,0.7);font-size:14px">💰 <strong style="color:#C8E63C">${booking.final_price_azn} AZN</strong></p>
              </div>
              <div style="text-align:center">
                <a href="${APP_URL}/my-bookings" style="display:inline-block;background:#C8E63C;color:#0A0A0A;padding:12px 28px;border-radius:6px;font-weight:800;font-size:13px;text-decoration:none;text-transform:uppercase">Rezervasiyalarıma bax</a>
              </div>
            </div>
            <div style="padding:16px 32px;border-top:1px solid rgba(255,255,255,0.06);text-align:center">
              <p style="color:rgba(255,255,255,0.3);font-size:12px;margin:0">© 2025 PadelPoint Baku · info@padelpoint.az</p>
            </div>
          </div>
        </div>
      `,
    })
  } catch (err) {
    console.error('Email send error:', err)
  }
}

export async function sendBookingCancellation(booking: any) {
  const customer = booking.customer
  try {
    await resend.emails.send({
      from: FROM,
      to: customer?.email ?? '',
      subject: `❌ Rezervasiya Ləğv Edildi`,
      html: `<p>Rezervasiyanız ləğv edildi. Suallarınız üçün bizimlə əlaqə saxlayın.</p>`,
    })
  } catch (err) {
    console.error('Email send error:', err)
  }
}

export async function sendBookingReminder(booking: any) {
  const customer = booking.customer
  const court = booking.court
  const startsAt = new Date(booking.starts_at)
  const timeStr = startsAt.toLocaleTimeString('az-AZ', { hour: '2-digit', minute: '2-digit' })

  try {
    await resend.emails.send({
      from: FROM,
      to: customer?.email ?? '',
      subject: `⏰ Sessiyanız 1 saat sonra başlayır — ${court?.name}`,
      html: `<p>Salam ${customer?.full_name}! ${court?.name} kortunda sessiyanız saat ${timeStr}-da başlayır. Sizi gözləyirik! 🎾</p>`,
    })
  } catch (err) {
    console.error('Email send error:', err)
  }
}
