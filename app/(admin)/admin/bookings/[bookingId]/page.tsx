import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'

export default async function Page({ params }: { params: { bookingId: string } }) {
  const supabase = await createClient()
  const { data: b } = await supabase
    .from('bookings')
    .select('*, customer:profiles!customer_id(full_name,email,phone), court:courts(name), payment:payments(status,method,amount_azn)')
    .eq('id', params.bookingId)
    .single()
  if (!b) notFound()
  const p: any = Array.isArray(b.payment) ? b.payment[0] : b.payment
  return (
    <div style={{padding:'2rem'}}>
      <Link href="/admin/bookings" style={{color:'#888',textDecoration:'none',fontSize:13}}>← All Bookings</Link>
      <h1 style={{fontSize:28,fontWeight:900,margin:'16px 0 8px'}}>Booking #{params.bookingId.slice(0,8).toUpperCase()}</h1>
      <span style={{background:'rgba(200,230,60,0.15)',color:'#6B8A00',padding:'3px 12px',borderRadius:20,fontSize:12,fontWeight:700}}>{b.status.replace('_',' ')}</span>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,marginTop:24}}>
        <div style={{background:'white',border:'1px solid #eee',borderRadius:10,padding:20}}>
          <h3 style={{marginBottom:12,fontWeight:800}}>Session</h3>
          <p><b>Court:</b> {(b.court as any)?.name}</p>
          <p><b>Date:</b> {new Date(b.starts_at).toLocaleDateString('en-GB')}</p>
          <p><b>Time:</b> {new Date(b.starts_at).toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'})} – {new Date(b.ends_at).toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'})}</p>
          <p><b>Duration:</b> {b.duration_min} min</p>
          <p><b>Type:</b> {b.booking_type.replace('_',' ')}</p>
        </div>
        <div style={{background:'white',border:'1px solid #eee',borderRadius:10,padding:20}}>
          <h3 style={{marginBottom:12,fontWeight:800}}>Customer</h3>
          <p><b>Name:</b> {(b.customer as any)?.full_name}</p>
          <p><b>Email:</b> {(b.customer as any)?.email}</p>
          <p><b>Phone:</b> {(b.customer as any)?.phone ?? '—'}</p>
          <h3 style={{margin:'16px 0 8px',fontWeight:800}}>Payment</h3>
          <p><b>Total:</b> {Number(b.final_price_azn).toFixed(2)} AZN</p>
          <p><b>Method:</b> {p?.method ?? '—'}</p>
          <p><b>Status:</b> {p?.status ?? '—'}</p>
        </div>
      </div>
      {b.status === 'confirmed' && (
        <form action="/api/bookings/cancel" method="POST" style={{marginTop:24}}>
          <input type="hidden" name="bookingId" value={b.id} />
          <button type="submit" style={{padding:'9px 20px',border:'1px solid #f5c0c0',borderRadius:8,background:'#fef0f0',color:'#dc2626',fontWeight:700,cursor:'pointer'}}>Cancel & Refund</button>
        </form>
      )}
    </div>
  )
}
