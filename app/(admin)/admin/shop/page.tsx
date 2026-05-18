import { createClient } from '@/lib/supabase/server'
import { formatAZN } from '@/lib/utils'

const CATEGORY_LABELS: Record<string, string> = {
  racket_rental: 'Racket Rental',
  balls:         'Balls',
  shop:          'Shop',
  cafe:          'Café',
}

export default async function ShopPage() {
  const supabase = await createClient()
  const { data: products } = await supabase.from('products').select('*').order('category').order('name')
  const { data: recentSales } = await supabase
    .from('order_items')
    .select('*, product:products(name, category), customer:profiles!customer_id(full_name)')
    .order('sold_at', { ascending: false })
    .limit(20)

  const salesTotal = recentSales?.reduce((s, i) => s + Number(i.total_price), 0) ?? 0

  return (
    <div>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', color: 'var(--forest)', marginBottom: '2rem' }}>Shop & Café</h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Products */}
        <div style={{ background: 'var(--ivory)', border: '1px solid rgba(201,169,110,0.3)', borderRadius: 12, padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', color: 'var(--forest)' }}>Products</h3>
            <button style={{ padding: '6px 14px', background: 'var(--forest)', color: 'var(--gold-light)', fontFamily: 'var(--font-sans)', fontSize: '0.75rem', border: 'none', borderRadius: 6, cursor: 'pointer' }}>+ Add</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {products?.map(p => (
              <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: 'rgba(248,244,237,0.5)', borderRadius: 8 }}>
                <div>
                  <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.83rem', color: 'var(--charcoal)', marginBottom: 2 }}>{p.name}</p>
                  <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.68rem', color: 'var(--muted)', textTransform: 'capitalize' }}>{CATEGORY_LABELS[p.category]}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.85rem', fontWeight: 500, color: 'var(--forest)', marginBottom: 2 }}>{formatAZN(Number(p.price_azn))}</p>
                  {p.stock_qty !== null && (
                    <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.68rem', color: p.stock_qty < 5 ? '#DC2626' : 'var(--muted-light)' }}>
                      Stock: {p.stock_qty}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent sales */}
        <div style={{ background: 'var(--ivory)', border: '1px solid rgba(201,169,110,0.3)', borderRadius: 12, padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', color: 'var(--forest)' }}>Recent Sales</h3>
            <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.78rem', color: 'var(--sage)', fontWeight: 500 }}>{formatAZN(salesTotal)}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {recentSales?.slice(0, 12).map(s => (
              <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 10px', borderBottom: '1px solid rgba(201,169,110,0.1)' }}>
                <div>
                  <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.8rem', color: 'var(--charcoal)' }}>{(s.product as any)?.name} × {s.quantity}</p>
                  <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.68rem', color: 'var(--muted-light)' }}>{(s.customer as any)?.full_name ?? 'Walk-in'}</p>
                </div>
                <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.82rem', fontWeight: 500, color: 'var(--forest)' }}>{formatAZN(Number(s.total_price))}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
