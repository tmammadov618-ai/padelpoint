import { cookies } from 'next/headers'
import { NextIntlClientProvider } from 'next-intl'
import LangSwitcher from '@/components/layout/LangSwitcher'

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const locale = cookieStore.get('locale')?.value ?? 'az'
  const messages = (await import(`@/messages/${locale}.json`)).default

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--charcoal)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      position: 'relative',
    }}>
      <div style={{ position: 'absolute', top: 0, right: 0, width: 0, height: 0, borderTop: '200px solid var(--lime)', borderLeft: '200px solid transparent', opacity: 0.08 }} />
      <div style={{ position: 'absolute', bottom: 0, left: 0, width: 0, height: 0, borderBottom: '150px solid var(--terra)', borderRight: '150px solid transparent', opacity: 0.05 }} />

      <div style={{ position: 'absolute', top: 16, right: 16 }}>
        <NextIntlClientProvider messages={messages}>
          <LangSwitcher current={locale} />
        </NextIntlClientProvider>
      </div>

      <div style={{ width: '100%', maxWidth: 400 }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.25em', color: 'rgba(200,230,60,0.6)', textTransform: 'uppercase', marginBottom: 8 }}>Bakı · Azərbaycan</p>
          <h1 style={{ fontSize: 22, fontWeight: 900, color: 'var(--white)', letterSpacing: '0.04em' }}>
            PADEL<span style={{ color: 'var(--lime)' }}>POINT</span>
          </h1>
        </div>
        {children}
      </div>
    </div>
  )
}
