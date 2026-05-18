import { NextRequest, NextResponse } from 'next/server'

const locales = ['az', 'ru', 'en']

export async function POST(req: NextRequest) {
  let locale = ''
  
  const ct = req.headers.get('content-type') ?? ''
  
  try {
    if (ct.includes('application/x-www-form-urlencoded') || ct.includes('multipart/form-data')) {
      const fd = await req.formData()
      locale = (fd.get('locale') as string) ?? ''
    } else if (ct.includes('application/json')) {
      const body = await req.json()
      locale = body.locale ?? ''
    }
  } catch {
    locale = ''
  }

  if (!locale || !locales.includes(locale)) {
    return NextResponse.json({ error: 'Invalid locale' }, { status: 400 })
  }

  const referer = req.headers.get('referer') ?? '/'
  const url = new URL(referer)
  const redirectUrl = url.pathname + url.search

  const res = NextResponse.redirect(new URL(redirectUrl, req.url))
  res.cookies.set('locale', locale, {
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
    sameSite: 'lax',
    httpOnly: false,
  })
  return res
}
