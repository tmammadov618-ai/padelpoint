'use client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

const LANGS = [
  { code: 'az', label: 'AZ' },
  { code: 'ru', label: 'RU' },
  { code: 'en', label: 'EN' },
]

export default function LangSwitcher({ current }: { current: string }) {
  const router = useRouter()
  const [active, setActive] = useState(current)

  async function switchLang(code: string) {
    await fetch('/api/locale', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ locale: code }),
    })
    setActive(code)
    router.refresh()
  }

  return (
    <div style={{ display: 'flex', gap: 2 }}>
      {LANGS.map(l => (
        <button
          key={l.code}
          onClick={() => switchLang(l.code)}
          style={{
            padding: '4px 9px',
            fontSize: 10,
            fontWeight: 700,
            borderRadius: 5,
            border: 'none',
            cursor: 'pointer',
            letterSpacing: '0.08em',
            background: active === l.code ? 'var(--lime)' : 'transparent',
            color: active === l.code ? 'var(--charcoal)' : 'rgba(255,255,255,0.35)',
            transition: 'all 0.12s',
          }}
        >
          {l.label}
        </button>
      ))}
    </div>
  )
}
