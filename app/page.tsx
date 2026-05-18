import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

// Inline lang switcher components (server-safe, no imports needed)
function NavLang() {
  return (
    <div style={{ display: 'flex', gap: 2 }}>
      {(['AZ', 'RU', 'EN'] as const).map(l => (
        <form key={l} action="/api/locale" method="POST">
          <input type="hidden" name="locale" value={l.toLowerCase()} />
          <button type="submit" style={{
            padding: '4px 9px', fontSize: 10, fontWeight: 700, borderRadius: 5,
            border: 'none', cursor: 'pointer', background: 'transparent',
            color: 'rgba(255,255,255,0.4)', letterSpacing: '0.08em',
          }}>{l}</button>
        </form>
      ))}
    </div>
  )
}

function FooterLang() {
  return (
    <div style={{ display: 'flex', gap: 16 }}>
      {(['AZ', 'RU', 'EN'] as const).map(l => (
        <form key={l} action="/api/locale" method="POST">
          <input type="hidden" name="locale" value={l.toLowerCase()} />
          <button type="submit" style={{
            fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.25)',
            letterSpacing: '0.1em', cursor: 'pointer', background: 'none', border: 'none', padding: 0,
          }}>{l}</button>
        </form>
      ))}
    </div>
  )
}

export default async function HomePage() {
  const supabase = await createClient()
  const { data: courts } = await supabase
    .from('courts').select('*').eq('is_active', true).order('sort_order')

  return (
    <div style={{ fontFamily: 'Inter, -apple-system, sans-serif', background: '#0A0A0A', color: 'white', overflowX: 'hidden' }}>

      {/* ── NAVBAR ── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        height: 64, padding: '0 5%',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'rgba(10,10,10,0.9)', backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        <a href="/" style={{ fontSize: 18, fontWeight: 900, letterSpacing: '0.08em', color: 'white', textDecoration: 'none' }}>
          PADEL<span style={{ color: '#C8E63C' }}>POINT</span>
        </a>
        <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
          <a href="#about" style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.5)', textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Padel haqqında</a>
          <a href="#courts" style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.5)', textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Kortlar</a>
          <a href="#membership" style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.5)', textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Üzvlük</a>
          <Link href="/login" style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.5)', textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Daxil ol</Link>
          <NavLang />
          <Link href="/book" style={{ background: '#C8E63C', color: '#0A0A0A', padding: '9px 20px', borderRadius: 6, fontWeight: 800, fontSize: 12, letterSpacing: '0.06em', textDecoration: 'none', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
            Rezerv Et
          </Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <div style={{ position: 'relative', height: '100vh', minHeight: 600, display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
        {/* Rich dark gradient background with padel feel */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, #0A0A0A 0%, #0F1A04 50%, #0A0A0A 100%)' }} />
        {/* Geometric court lines */}
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
          {/* Court outline right side */}
          <div style={{ position: 'absolute', right: '6%', top: '50%', transform: 'translateY(-50%)', width: 380, height: 520, border: '1px solid rgba(200,230,60,0.12)', borderRadius: 3 }}>
            <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: 1, background: 'rgba(200,230,60,0.1)' }} />
            <div style={{ position: 'absolute', top: 0, bottom: 0, left: '50%', width: 1, background: 'rgba(200,230,60,0.1)' }} />
            <div style={{ position: 'absolute', top: '22%', left: 0, right: 0, height: 1, background: 'rgba(200,230,60,0.07)' }} />
            <div style={{ position: 'absolute', bottom: '22%', left: 0, right: 0, height: 1, background: 'rgba(200,230,60,0.07)' }} />
            <div style={{ position: 'absolute', inset: 20, border: '1px solid rgba(200,230,60,0.05)', borderRadius: 1 }} />
          </div>
          {/* Ball accent */}
          <div style={{ position: 'absolute', right: '18%', top: '35%', width: 14, height: 14, borderRadius: '50%', background: '#C8E63C', opacity: 0.6 }} />
          <div style={{ position: 'absolute', right: '28%', top: '62%', width: 10, height: 10, borderRadius: '50%', background: '#C8E63C', opacity: 0.3 }} />
          {/* Diagonal lime line */}
          <div style={{ position: 'absolute', top: 0, right: '40%', width: 1, height: '100vh', background: 'linear-gradient(to bottom, transparent, rgba(200,230,60,0.06), transparent)', transform: 'rotate(15deg)', transformOrigin: 'top' }} />
        </div>
        {/* Left lime strip */}
        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, background: '#C8E63C' }} />

        {/* Hero content */}
        <div style={{ position: 'relative', zIndex: 2, padding: '0 8%', maxWidth: 680 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(200,230,60,0.1)', border: '1px solid rgba(200,230,60,0.3)', padding: '6px 14px', borderRadius: 20, marginBottom: 28 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#C8E63C' }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: '#C8E63C', letterSpacing: '0.2em', textTransform: 'uppercase' }}>Bakı · Azərbaycan</span>
          </div>
          <h1 style={{ fontSize: 'clamp(44px, 7vw, 86px)', fontWeight: 900, lineHeight: 0.93, margin: '0 0 24px', letterSpacing: '-0.02em' }}>
            HƏR<br />
            <span style={{ color: '#C8E63C' }}>ZƏRBƏDƏ</span><br />
            MÜKƏMMƏLLİK
          </h1>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.5)', lineHeight: 1.7, marginBottom: 36, maxWidth: 440 }}>
            Bakının ən müasir padel mərkəzi — 3 premium kort, peşəkar məşqçilər və dünya standartlı infrastruktur.
          </p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Link href="/book" style={{ background: '#C8E63C', color: '#0A0A0A', padding: '15px 34px', borderRadius: 6, fontWeight: 800, fontSize: 14, letterSpacing: '0.06em', textDecoration: 'none', textTransform: 'uppercase', display: 'inline-block' }}>
              Kort Rezerv Et →
            </Link>
            <a href="#about" style={{ background: 'rgba(255,255,255,0.07)', color: 'white', padding: '15px 28px', borderRadius: 6, fontWeight: 600, fontSize: 14, letterSpacing: '0.06em', textDecoration: 'none', textTransform: 'uppercase', border: '1px solid rgba(255,255,255,0.12)', display: 'inline-block' }}>
              Daha Çox
            </a>
          </div>
        </div>

        {/* Stats bottom bar */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)', borderTop: '1px solid rgba(255,255,255,0.06)', padding: '18px 8%' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', maxWidth: 700 }}>
            {[['3', 'Premium Kort'], ['5+', 'Məşqçi'], ['07:00–23:00', 'İş saatları'], ['60+', 'AZN/sesiya']].map(([n, l], i) => (
              <div key={l} style={{ textAlign: i === 0 ? 'left' : 'center', paddingRight: 20 }}>
                <p style={{ fontSize: 'clamp(16px, 2.5vw, 26px)', fontWeight: 900, color: '#C8E63C', lineHeight: 1, marginBottom: 4 }}>{n}</p>
                <p style={{ fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{l}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── WHAT IS PADEL ── */}
      <div id="about" style={{ padding: 'clamp(60px,8vw,110px) 8%', background: '#111' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 64, alignItems: 'center' }}>
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.2em', color: '#C8E63C', textTransform: 'uppercase', marginBottom: 14 }}>Padel haqqında</p>
            <h2 style={{ fontSize: 'clamp(28px,4vw,46px)', fontWeight: 900, lineHeight: 1.1, margin: '0 0 20px' }}>
              PADEL<br /><span style={{ color: 'rgba(255,255,255,0.2)' }}>NEDİR?</span>
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.55)', lineHeight: 1.85, fontSize: 15, marginBottom: 16 }}>
              Padel — tennis ilə skvoşun birləşməsindən yaranmış dinamik idman növüdür. Şüşə divarlarla əhatə olunmuş daha kiçik meydançada oynanılır. Öyrənmək asan, oynamaq isə çox əyləncəlidir.
            </p>
            <p style={{ color: 'rgba(255,255,255,0.55)', lineHeight: 1.85, fontSize: 15, marginBottom: 28 }}>
              Həmişə ikiqat oynanılır — ideal sosial idman növü. Bütün yaş qrupları üçün uyğundur.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                'Öyrənmək asandır — ilk gündən oynaya bilərsiniz',
                'Sosial idman — dostlar və ailə ilə',
                'Tam bədən məşqi — yüksək enerji sərfi',
                'Bütün yaş qrupları üçün uyğundur',
              ].map(f => (
                <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'rgba(200,230,60,0.12)', border: '1px solid rgba(200,230,60,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ color: '#C8E63C', fontSize: 10, fontWeight: 800 }}>✓</span>
                  </div>
                  <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)' }}>{f}</span>
                </div>
              ))}
            </div>
          </div>
          {/* Visual padel stats */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            {[
              { n: '150M+', l: 'Dünyada oyunçu', bg: '#C8E63C', txt: '#0A0A0A', sub: 'rgba(0,0,0,0.5)' },
              { n: '90', l: 'Dəqiqə / sesiya', bg: '#1A1A1A', txt: '#C8E63C', sub: 'rgba(255,255,255,0.35)' },
              { n: '4', l: 'Oyunçu / oyun', bg: '#1A1A1A', txt: '#C8E63C', sub: 'rgba(255,255,255,0.35)' },
              { n: '#3', l: 'İdman Avropada', bg: '#1A1A1A', txt: '#C8E63C', sub: 'rgba(255,255,255,0.35)' },
            ].map(s => (
              <div key={s.l} style={{ background: s.bg, borderRadius: 10, padding: '24px 20px', border: s.bg === '#1A1A1A' ? '1px solid rgba(255,255,255,0.07)' : 'none' }}>
                <p style={{ fontSize: 28, fontWeight: 900, color: s.txt, lineHeight: 1, marginBottom: 6 }}>{s.n}</p>
                <p style={{ fontSize: 11, fontWeight: 700, color: s.sub, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{s.l}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── BOOK NOW CTA STRIP ── */}
      <div style={{ background: '#C8E63C', padding: 'clamp(24px,4vw,40px) 8%' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 20 }}>
          <div>
            <p style={{ fontSize: 'clamp(18px,3vw,28px)', fontWeight: 900, color: '#0A0A0A', margin: 0 }}>Oynamağa hazırsınız?</p>
            <p style={{ fontSize: 13, color: 'rgba(0,0,0,0.5)', margin: '4px 0 0', fontWeight: 500 }}>Onlayn rezervasiya · Ani təsdiq · Güvənli ödəniş</p>
          </div>
          <Link href="/book" style={{ background: '#0A0A0A', color: '#C8E63C', padding: '13px 30px', borderRadius: 6, fontWeight: 800, fontSize: 13, letterSpacing: '0.06em', textDecoration: 'none', textTransform: 'uppercase', whiteSpace: 'nowrap', flexShrink: 0 }}>
            İndi Rezerv Et →
          </Link>
        </div>
      </div>

      {/* ── COURTS ── */}
      <div id="courts" style={{ padding: 'clamp(60px,8vw,100px) 8%', background: '#0A0A0A' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 44, flexWrap: 'wrap', gap: 16 }}>
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.2em', color: '#C8E63C', textTransform: 'uppercase', marginBottom: 10 }}>Kortlarımız</p>
              <h2 style={{ fontSize: 'clamp(26px,4vw,46px)', fontWeight: 900, lineHeight: 1.1, margin: 0 }}>
                3 PREMIUM<br /><span style={{ color: 'rgba(255,255,255,0.2)' }}>KORT</span>
              </h2>
            </div>
            <Link href="/book" style={{ color: '#C8E63C', fontWeight: 700, fontSize: 13, letterSpacing: '0.08em', textDecoration: 'none', textTransform: 'uppercase', borderBottom: '1px solid rgba(200,230,60,0.4)', paddingBottom: 3 }}>
              Hamısını gör →
            </Link>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 18 }}>
            {(courts && courts.length > 0 ? courts : [
              { id: '1', name: 'Court 1', description: 'Premium süni çəmən örtük, tam LED işıqlandırma.' },
              { id: '2', name: 'Court 2', description: 'Panoramik şüşə divarlar, yarışma keyfiyyəti.' },
              { id: '3', name: 'Court 3', description: 'Məşq kortu — koçinq sessiyaları üçün ideal.' },
            ]).map((court: any, i: number) => (
              <Link key={court.id} href="/book" style={{ textDecoration: 'none', display: 'block' }}>
                <div style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.07)', background: '#151515' }}>
                  {/* Court visual using CSS - no broken images */}
                  <div style={{
                    height: 200, position: 'relative', overflow: 'hidden',
                    background: [
                      'linear-gradient(135deg, #0D2010 0%, #1A3A18 40%, #0D2010 100%)',
                      'linear-gradient(135deg, #0A1A1F 0%, #102840 40%, #0A1A1F 100%)',
                      'linear-gradient(135deg, #1A1205 0%, #2A2010 40%, #1A1205 100%)',
                    ][i],
                  }}>
                    {/* Court lines decoration */}
                    <div style={{ position: 'absolute', inset: 16, border: `1px solid ${['rgba(200,230,60,0.25)', 'rgba(100,180,255,0.25)', 'rgba(255,180,60,0.25)'][i]}`, borderRadius: 2 }}>
                      <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: 1, background: `${['rgba(200,230,60,0.18)', 'rgba(100,180,255,0.18)', 'rgba(255,180,60,0.18)'][i]}` }} />
                      <div style={{ position: 'absolute', top: 0, bottom: 0, left: '50%', width: 1, background: `${['rgba(200,230,60,0.18)', 'rgba(100,180,255,0.18)', 'rgba(255,180,60,0.18)'][i]}` }} />
                      <div style={{ position: 'absolute', top: '22%', left: 0, right: 0, height: 1, background: `${['rgba(200,230,60,0.1)', 'rgba(100,180,255,0.1)', 'rgba(255,180,60,0.1)'][i]}` }} />
                      <div style={{ position: 'absolute', bottom: '22%', left: 0, right: 0, height: 1, background: `${['rgba(200,230,60,0.1)', 'rgba(100,180,255,0.1)', 'rgba(255,180,60,0.1)'][i]}` }} />
                    </div>
                    {/* Court number */}
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontSize: 72, fontWeight: 900, color: ['rgba(200,230,60,0.06)', 'rgba(100,180,255,0.06)', 'rgba(255,180,60,0.06)'][i] }}>{i + 1}</span>
                    </div>
                    {/* Labels */}
                    <div style={{ position: 'absolute', top: 14, left: 14 }}>
                      <span style={{ fontSize: 11, fontWeight: 800, color: ['#C8E63C', '#64B4FF', '#FFB43C'][i], letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                        {['Premium', 'Glass', 'Training'][i]}
                      </span>
                    </div>
                    <div style={{ position: 'absolute', top: 14, right: 14, background: '#C8E63C', color: '#0A0A0A', fontSize: 9, fontWeight: 800, padding: '3px 10px', borderRadius: 20, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      Mövcuddur
                    </div>
                    <div style={{ position: 'absolute', bottom: 14, left: 14 }}>
                      <p style={{ fontSize: 20, fontWeight: 900, color: 'white', margin: 0 }}>{court.name}</p>
                    </div>
                  </div>
                  <div style={{ padding: '16px 20px' }}>
                    <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', lineHeight: 1.5, marginBottom: 14 }}>
                      {court.description ?? 'Premium padel kortu, LED işıqlandırma, şüşə divarlar.'}
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.07)' }}>
                      <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)' }}>60 AZN-dən / sesiya</span>
                      <span style={{ fontSize: 12, color: '#C8E63C', fontWeight: 700 }}>Vaxt seç →</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* ── WHY US ── */}
      <div style={{ padding: 'clamp(60px,8vw,100px) 8%', background: '#111' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.2em', color: '#C8E63C', textTransform: 'uppercase', marginBottom: 12, textAlign: 'center' }}>Niyə biz?</p>
          <h2 style={{ fontSize: 'clamp(24px,4vw,42px)', fontWeight: 900, margin: '0 0 44px', textAlign: 'center' }}>PadelPoint FƏRQI</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 18 }}>
            {[
              { icon: '🏆', title: 'Premium Kortlar', desc: 'Beynəlxalq standartlara cavab verən süni çəmən örtük.' },
              { icon: '👨‍🏫', title: 'Peşəkar Məşqçilər', desc: 'Sertifikatlı məşqçilərimiz hər səviyyə üçün dərs keçir.' },
              { icon: '📱', title: 'Asan Rezervasiya', desc: 'Telefon və kompüterdən anında onlayn rezervasiya.' },
              { icon: '☕', title: 'Kafe & Mağaza', desc: 'Oyundan sonra rahat istirahət və idman avadanlıqları.' },
              { icon: '🔒', title: 'Güvənli Ödəniş', desc: 'Stripe ilə qorunan etibarlı onlayn ödəniş sistemi.' },
              { icon: '⭐', title: 'Üzv Üstünlükləri', desc: 'Endirimlər, prioritet rezervasiya və daha çox.' },
            ].map(f => (
              <div key={f.title} style={{ background: '#1A1A1A', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '22px 20px' }}>
                <div style={{ fontSize: 26, marginBottom: 12 }}>{f.icon}</div>
                <p style={{ fontSize: 14, fontWeight: 800, color: 'white', marginBottom: 8 }}>{f.title}</p>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── MEMBERSHIP ── */}
      <div id="membership" style={{ padding: 'clamp(60px,8vw,100px) 8%', background: '#0A0A0A' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 56, alignItems: 'center' }}>
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.2em', color: '#C8E63C', textTransform: 'uppercase', marginBottom: 14 }}>Üzvlük</p>
            <h2 style={{ fontSize: 'clamp(26px,4vw,44px)', fontWeight: 900, lineHeight: 1.1, margin: '0 0 18px' }}>
              KLUBUMUZun<br /><span style={{ color: 'rgba(255,255,255,0.2)' }}>HİSSƏSİ OLUN</span>
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 15, lineHeight: 1.8, marginBottom: 28 }}>
              Üzv olun — prioritet rezervasiya, eksklüziv endirimlər, pulsuz top hər sesiyada.
            </p>
            <Link href="/membership" style={{ display: 'inline-block', background: '#C8E63C', color: '#0A0A0A', padding: '13px 28px', borderRadius: 6, fontWeight: 800, fontSize: 13, letterSpacing: '0.06em', textDecoration: 'none', textTransform: 'uppercase' }}>
              Planları Gör →
            </Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { name: 'Silver', price: '160', sub: '4 sesiya/ay', highlight: false },
              { name: 'Gold', price: '280', sub: '8 sesiya/ay', highlight: true },
              { name: 'Elite', price: '480', sub: '16 sesiya/ay', highlight: false },
            ].map(m => (
              <div key={m.name} style={{
                background: m.highlight ? '#C8E63C' : '#1A1A1A',
                border: m.highlight ? 'none' : '1px solid rgba(255,255,255,0.07)',
                borderRadius: 10, padding: '18px 22px',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <div>
                  <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', color: m.highlight ? 'rgba(0,0,0,0.45)' : 'rgba(255,255,255,0.3)', textTransform: 'uppercase', marginBottom: 4 }}>{m.name}</p>
                  <p style={{ fontSize: 11, color: m.highlight ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.25)' }}>{m.sub}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: 28, fontWeight: 900, color: m.highlight ? '#0A0A0A' : '#C8E63C', lineHeight: 1 }}>{m.price}</p>
                  <p style={{ fontSize: 10, color: m.highlight ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.25)' }}>AZN/ay</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── FINAL CTA ── */}
      <div style={{ padding: 'clamp(60px,10vw,110px) 8%', background: '#111', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, rgba(200,230,60,0.06) 0%, transparent 70%)' }} />
        <div style={{ position: 'relative', zIndex: 2 }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.2em', color: '#C8E63C', textTransform: 'uppercase', marginBottom: 14 }}>Başlamağa hazırsınız?</p>
          <h2 style={{ fontSize: 'clamp(26px,5vw,56px)', fontWeight: 900, lineHeight: 1.05, margin: '0 0 18px' }}>
            İLK ADDIMINIZı<br />BİZİMLƏ ATIN
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 15, lineHeight: 1.7, marginBottom: 36, maxWidth: 440, margin: '0 auto 36px' }}>
            Kortunuzu onlayn rezerv edin, ödəyin və anında təsdiq alın.
          </p>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/book" style={{ background: '#C8E63C', color: '#0A0A0A', padding: '14px 34px', borderRadius: 6, fontWeight: 800, fontSize: 13, letterSpacing: '0.06em', textDecoration: 'none', textTransform: 'uppercase' }}>
              Kort Rezerv Et
            </Link>
            <Link href="/register" style={{ background: 'rgba(255,255,255,0.07)', color: 'white', padding: '14px 26px', borderRadius: 6, fontWeight: 600, fontSize: 13, letterSpacing: '0.06em', textDecoration: 'none', textTransform: 'uppercase', border: '1px solid rgba(255,255,255,0.12)' }}>
              Qeydiyyat
            </Link>
          </div>
        </div>
      </div>

      {/* ── FOOTER ── */}
      <div style={{ background: '#080808', borderTop: '1px solid rgba(255,255,255,0.06)', padding: 'clamp(40px,6vw,64px) 8%' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 40, marginBottom: 44 }}>
            <div>
              <p style={{ fontSize: 18, fontWeight: 900, letterSpacing: '0.08em', marginBottom: 14 }}>PADEL<span style={{ color: '#C8E63C' }}>POINT</span></p>
              <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13, lineHeight: 1.8 }}>Bakının ən müasir padel mərkəzi. Hər səviyyə üçün kortlar.</p>
            </div>
            <div>
              <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.15em', color: '#C8E63C', textTransform: 'uppercase', marginBottom: 18 }}>Keçidlər</p>
              {[['Kort Rezerv Et', '/book'], ['Üzvlük', '/membership'], ['Daxil ol', '/login'], ['Qeydiyyat', '/register']].map(([l, h]) => (
                <Link key={l} href={h} style={{ display: 'block', color: 'rgba(255,255,255,0.35)', fontSize: 13, marginBottom: 10, textDecoration: 'none' }}>{l}</Link>
              ))}
            </div>
            <div>
              <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.15em', color: '#C8E63C', textTransform: 'uppercase', marginBottom: 18 }}>İş saatları</p>
              <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13, marginBottom: 8 }}>B.e – C.a: 07:00 – 23:00</p>
              <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13, marginBottom: 8 }}>Şənbə – Bazar: 07:00 – 23:00</p>
              <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13 }}>Hər gün açıqdır</p>
            </div>
            <div>
              <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.15em', color: '#C8E63C', textTransform: 'uppercase', marginBottom: 18 }}>Əlaqə</p>
              <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13, marginBottom: 8 }}>Bakı, Azərbaycan</p>
              <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13, marginBottom: 16 }}>info@padelpoint.az</p>
              <Link href="/book" style={{ display: 'inline-block', background: '#C8E63C', color: '#0A0A0A', padding: '9px 18px', borderRadius: 6, fontWeight: 800, fontSize: 11, textDecoration: 'none', textTransform: 'uppercase' }}>Rezerv Et</Link>
            </div>
          </div>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 22, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <p style={{ color: 'rgba(255,255,255,0.18)', fontSize: 12 }}>© 2025 PadelPoint Baku</p>
            <FooterLang />
          </div>
        </div>
      </div>

      {/* Mobile responsive */}
      <style>{`
        @media (max-width: 768px) {
          nav > div:last-child > a:not(:last-child):not([href="/login"]) { display: none; }
        }
      `}</style>
    </div>
  )
}
