import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const [leads, drivers, companies] = await Promise.all([
      supabase.from('company_leads').select('id, status, created_at', { count: 'exact' }),
      supabase.from('driver_applications').select('id, status, created_at', { count: 'exact' }),
      supabase.from('company_applications').select('id, status, created_at', { count: 'exact' }),
    ])

    const newCount = [
      ...(leads.data || []),
      ...(drivers.data || []),
      ...(companies.data || []),
    ].filter(r => r.status === 'new').length

    return NextResponse.json({
      leads: leads.count || 0,
      drivers: drivers.count || 0,
      companies: companies.count || 0,
      newCount,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
