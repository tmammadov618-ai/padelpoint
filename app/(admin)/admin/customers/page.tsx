import { createClient } from '@/lib/supabase/server'

export default async function CustomersPage({ searchParams }: { searchParams: { q?: string } }) {
  const supabase = await createClient()
  let query = supabase.from('profiles').select('*').eq('role', 'customer').order('created_at', { ascending: false })
  if (searchParams.q) query = query.ilike('full_name', `%${searchParams.q}%`)
  const { data: customers } = await query.limit(100)

  return (
    <div>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', color: 'var(--forest)', marginBottom: '2rem' }}>Customers</h1>
      <form style={{ marginBottom: '1.5rem' }}>
        <input name="q" defaultValue={searchParams.q} placeholder="Search by name…" style={{
          fontFamily: 'var(--font-sans)', fontSize: '0.85rem', padding: '10px 16px',
          border: '1px solid rgba(201,169,110,0.3)', borderRadius: 8, background: 'var(--ivory)', color: 'var(--charcoal)',
          width: 280, outline: 'none',
        }} />
      </form>
      <div style={{ background: 'var(--ivory)', border: '1px solid rgba(201,169,110,0.3)', borderRadius: 12, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'rgba(248,244,237,0.8)' }}>
              {['Name', 'Email', 'Phone', 'Joined', 'Status'].map(h => (
                <th key={h} style={{ fontFamily: 'var(--font-sans)', fontSize: '0.65rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--muted)', padding: '12px 16px', textAlign: 'left', borderBottom: '1px solid rgba(201,169,110,0.2)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {customers?.map(c => (
              <tr key={c.id}>
                <td style={{ padding: '12px 16px', borderBottom: '1px solid rgba(201,169,110,0.1)', fontFamily: 'var(--font-sans)', fontSize: '0.85rem', fontWeight: 500 }}>{c.full_name}</td>
                <td style={{ padding: '12px 16px', borderBottom: '1px solid rgba(201,169,110,0.1)', fontFamily: 'var(--font-sans)', fontSize: '0.82rem', color: 'var(--muted)' }}>{c.email}</td>
                <td style={{ padding: '12px 16px', borderBottom: '1px solid rgba(201,169,110,0.1)', fontFamily: 'var(--font-sans)', fontSize: '0.82rem', color: 'var(--muted)' }}>{c.phone ?? '—'}</td>
                <td style={{ padding: '12px 16px', borderBottom: '1px solid rgba(201,169,110,0.1)', fontFamily: 'var(--font-sans)', fontSize: '0.78rem', color: 'var(--muted-light)' }}>
                  {new Date(c.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                </td>
                <td style={{ padding: '12px 16px', borderBottom: '1px solid rgba(201,169,110,0.1)' }}>
                  <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.68rem', padding: '3px 10px', borderRadius: 20, background: c.is_active ? 'rgba(74,124,89,0.1)' : 'rgba(220,38,38,0.08)', color: c.is_active ? 'var(--sage)' : '#DC2626' }}>
                    {c.is_active ? 'Active' : 'Inactive'}
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
