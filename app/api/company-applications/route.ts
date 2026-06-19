import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { company_name, contact_name, phone, email } = body

    if (!company_name || !contact_name || !phone || !email) {
      return NextResponse.json({ error: 'Required fields missing' }, { status: 400 })
    }

    const supabase = await createAdminClient()
    const { error } = await supabase
      .from('company_applications')
      .insert({ ...body, status: 'new' })

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Company application error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
