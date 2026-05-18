import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function BookPage() {
  const supabase = await createClient()
  const { data: courts } = await supabase.from('courts').select('*').eq('is_active', true).order('sort_order')
  const { data: coaches } = await supabase.from('profiles').select('id, full_name').eq('role', 'coach').eq('is_active', true)

  const courtPhotos = [
    'https://images.pexels.com/photos/32474981/pexels-photo-32474981.jpeg?auto=compress&cs=tinysrgb&w=600',
    'https://images.pexels.com/photos/33641987/pexels-photo-33641987.jpeg?auto=compress&cs=tinysrgb&w=600',
    'https://images.pexels.com/photos/10474904/pexels-photo-10474904.jpeg?auto=compress&cs=tinysrgb&w=600',
  ]

  return (
    <div style={{ minHeight: '100vh', background: '#F5F5F3' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 24px' }}>

        <div style={{ marginBottom: 36 }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.15em', color: '#888', textTransform: 'uppercase', marginBottom: 8 }}>Rezervasiya</p>
          <h1 style={{ fontSize: 32, fontWeight: 900, color: '#1A1A1A', marginBottom: 6 }}>Kort Seçin</h1>
          <p style={{ fontSize: 14, color: '#888' }}>Kortunuzu seçin, vaxt seçin, onlayn ödəyin — hazırdır!</p>
        </div>

        {/* Session type tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 28, flexWrap: 'wrap' }}>
          {[
            ['Tək sesiya', '✦'],
            ['Məşqçi ilə', '👨‍🏫'],
            ['Üzv sessiyası', '⭐'],
          ].map(([label, icon], i) => (
            <div key={label} style={{
              padding: '8px 18px',
              borderRadius: 6,
              background: i === 0 ? '#1A1A1A' : 'white',
              color: i === 0 ? '#C8E63C' : '#888',
              border: i === 0 ? 'none' : '1px solid #E8E8E5',
              fontSize: 12,
              fontWeight: 700,
              cursor: 'pointer',
              letterSpacing: '0.04em',
            }}>
              {icon} {label}
            </div>
          ))}
        </div>

        {/* Courts */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20, marginBottom: 48 }}>
          {courts?.map((court, i) => (
            <Link key={court.id} href={`/book/${court.id}`} style={{ textDecoration: 'none' }}>
              <div style={{
                background: 'white',
                border: '1px solid #E8E8E5',
                borderRadius: 12,
                overflow: 'hidden',
                transition: 'all 0.2s',
                cursor: 'pointer',
              }}>
                <div style={{ height: 200, position: 'relative', overflow: 'hidden', background: '#111' }}>
                  <img
                    src={courtPhotos[i] ?? courtPhotos[0]}
                    alt={court.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.9 }}
                  />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 60%)' }} />
                  <div style={{ position: 'absolute', top: 14, right: 14, background: '#C8E63C', color: '#0A0A0A', fontSize: 10, fontWeight: 800, padding: '4px 12px', borderRadius: 20, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                    Mövcuddur
                  </div>
                  <div style={{ position: 'absolute', bottom: 14, left: 14 }}>
                    <p style={{ fontSize: 18, fontWeight: 900, color: 'white', margin: 0 }}>{court.name}</p>
                  </div>
                </div>
                <div style={{ padding: '16px 20px' }}>
                  <p style={{ fontSize: 13, color: '#666', lineHeight: 1.5, marginBottom: 14 }}>
                    {court.description ?? 'Premium padel kortu, LED işıqlandırma, şüşə divarlar.'}
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, borderTop: '1px solid #F0F0EE' }}>
                    <div>
                      <span style={{ fontSize: 20, fontWeight: 900, color: '#1A1A1A' }}>60</span>
                      <span style={{ fontSize: 12, color: '#888', marginLeft: 4 }}>AZN-dən / 90 dəq</span>
                    </div>
                    <div style={{ background: '#1A1A1A', color: '#C8E63C', padding: '9px 18px', borderRadius: 6, fontSize: 12, fontWeight: 800, letterSpacing: '0.04em' }}>
                      Vaxt Seç →
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Coaches */}
        {coaches && coaches.length > 0 && (
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.15em', color: '#888', textTransform: 'uppercase', marginBottom: 16 }}>Məşqçilərimiz</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14 }}>
              {coaches.map(coach => (
                <div key={coach.id} style={{ background: 'white', border: '1px solid #E8E8E5', borderRadius: 10, padding: '20px', textAlign: 'center' }}>
                  <div style={{ width: 52, height: 52, borderRadius: '50%', background: '#1A1A1A', color: '#C8E63C', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', fontSize: 20, fontWeight: 900 }}>
                    {coach.full_name.charAt(0)}
                  </div>
                  <p style={{ fontSize: 14, fontWeight: 700, color: '#1A1A1A', marginBottom: 4 }}>{coach.full_name}</p>
                  <p style={{ fontSize: 11, color: '#888', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 14 }}>Sertifikatlı məşqçi</p>
                  <Link href={`/book?coach=${coach.id}&type=coach_training`} style={{ display: 'block', background: '#F5F5F3', color: '#1A1A1A', padding: '8px', borderRadius: 6, fontSize: 12, fontWeight: 700, textDecoration: 'none', border: '1px solid #E8E8E5' }}>
                    Məşq Rezerv Et
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
