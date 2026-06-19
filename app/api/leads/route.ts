import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { company_name, contact_name, phone, email, region, position_type, drivers_count, message, locale } = body

    if (!company_name || !contact_name || !phone || !email) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const supabase = await createClient()
    const { error } = await supabase.from('company_leads').insert({
      company_name, contact_name, phone, email,
      region: region || null,
      position_type: position_type || null,
      drivers_count: drivers_count || null,
      message: message || null,
      locale: locale || 'fr',
      status: 'new',
    })

    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 })
  }
}
