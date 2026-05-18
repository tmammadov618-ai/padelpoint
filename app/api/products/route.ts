import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const categories = searchParams.get('categories')?.split(',') ?? []
  
  const supabase = await createClient()
  let query = supabase.from('products').select('*').eq('is_active', true)
  
  if (categories.length > 0) {
    query = query.in('category', categories)
  }
  
  const { data: products } = await query
  return NextResponse.json({ products: products ?? [] })
}
