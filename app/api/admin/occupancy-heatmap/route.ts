import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('bookings')
    .select('starts_at')
    .eq('status', 'confirmed')
    .gte('starts_at', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString())

  const heatmap: Record<string, number> = {}
  for (const b of data ?? []) {
    const d = new Date(b.starts_at)
    const key = `${d.getDay()}-${d.getHours()}`
    heatmap[key] = (heatmap[key] ?? 0) + 1
  }
  return NextResponse.json({ data: heatmap })
}
