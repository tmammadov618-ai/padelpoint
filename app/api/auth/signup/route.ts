import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { sendWelcomeEmail } from '@/lib/notifications/welcome'

export async function POST(req: NextRequest) {
  const { userId, email, fullName } = await req.json()
  if (!userId || !email) return NextResponse.json({ ok: false })

  try {
    const supabase = await createAdminClient()
    await supabase.from('profiles').upsert({
      id: userId, email, full_name: fullName ?? '', role: 'customer',
    })
    await sendWelcomeEmail(fullName ?? 'İstifadəçi', email).catch(() => {})
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false })
  }
}
