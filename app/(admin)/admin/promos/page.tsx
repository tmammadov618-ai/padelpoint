import { createClient } from '@/lib/supabase/server'
import { formatAZN } from '@/lib/utils'

export default async function PromosPage() {
  const supabase = await createClient()
  const { data: promos } = await supabase.from('promo_codes').select('*').order('created_at', { ascending: false })

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', color: 'var(--forest)' }}>Promo Codes</h1>
        <button style={{ padding: '10px 20px', background: 'var(--forest)', color: 'var(--gold-light)', fontFamily: 'var(--font-sans)', fontSize: '0.8rem', border: 'none', borderRadius: 8, cursor: 'pointer' }}>
          + Create Code
        </button>
      </div>
      <div style={{ background: 'var(--ivory)', border: '1px solid rgba(201,169,110,0.3)', borderRadius: 12, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'rgba(248,244,237,0.8)' }}>
              {['Code', 'Discount', 'Uses', 'Min. Amount', 'Valid Until', 'Status'].map(h => (
                <th key={h} style={{ fontFamily: 'var(--font-sans)', fontSize: '0.65rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--muted)', padding: '12px 16px', textAlign: 'left', borderBottom: '1px solid rgba(201,169,110,0.2)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {promos?.map(p => (
              <tr key={p.id}>
                <td style={{ padding: '13px 16px', borderBottom: '1px solid rgba(201,169,110,0.1)' }}>
                  <code style={{ fontFamily: 'monospace', fontSize: '0.85rem', fontWeight: 600, color: 'var(--forest)', background: 'rgba(28,58,46,0.06)', padding: '2px 8px', borderRadius: 4 }}>{p.code}</code>
                </td>
                <td style={{ padding: '13px 16px', borderBottom: '1px solid rgba(201,169,110,0.1)', fontFamily: 'var(--font-sans)', fontSize: '0.85rem', color: 'var(--forest)', fontWeight: 500 }}>
                  {p.discount_type === 'percentage' ? `${p.discount_value}%` : formatAZN(p.discount_value)}
                </td>
                <td style={{ padding: '13px 16px', borderBottom: '1px solid rgba(201,169,110,0.1)', fontFamily: 'var(--font-sans)', fontSize: '0.82rem', color: 'var(--muted)' }}>
                  {p.used_count}{p.max_uses ? ` / ${p.max_uses}` : ' / ∞'}
                </td>
                <td style={{ padding: '13px 16px', borderBottom: '1px solid rgba(201,169,110,0.1)', fontFamily: 'var(--font-sans)', fontSize: '0.82rem', color: 'var(--muted)' }}>
                  {p.min_booking_azn > 0 ? formatAZN(Number(p.min_booking_azn)) : '—'}
                </td>
                <td style={{ padding: '13px 16px', borderBottom: '1px solid rgba(201,169,110,0.1)', fontFamily: 'var(--font-sans)', fontSize: '0.78rem', color: 'var(--muted)' }}>
                  {p.valid_to ? new Date(p.valid_to).toLocaleDateString('en-GB') : 'No expiry'}
                </td>
                <td style={{ padding: '13px 16px', borderBottom: '1px solid rgba(201,169,110,0.1)' }}>
                  <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.68rem', padding: '3px 10px', borderRadius: 20, background: p.is_active ? 'rgba(74,124,89,0.1)' : 'rgba(107,97,82,0.08)', color: p.is_active ? 'var(--sage)' : 'var(--muted)' }}>
                    {p.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
