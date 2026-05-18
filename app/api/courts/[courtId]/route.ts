import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest, { params }: { params: { courtId: string } }) {
  const supabase = await createClient()
  const { data: court } = await supabase
    .from('courts')
    .select('*')
    .eq('id', params.courtId)
    .single()
  
  if (!court) return NextResponse.json(null, { status: 404 })
  return NextResponse.json(court)
}
