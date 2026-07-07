import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { syncCompanyToZoho } from '@/lib/integrations/zoho'
import { sendNotificationEmail, buildCompanyApplicationEmailHtml, sendConfirmationEmail, buildCompanyConfirmationHtml } from '@/lib/integrations/email'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { company_name, contact_name, phone, email } = body

    if (!company_name || !contact_name || !phone || !email) {
      return NextResponse.json({ error: 'Required fields missing' }, { status: 400 })
    }

    const supabase = await createAdminClient()
    const row = {
      company_name: String(company_name),
      contact_name: String(contact_name),
      contact_title: body.contact_title || null,
      phone: String(phone),
      email: String(email),
      website: body.website || null,
      city_region: body.city_region || null,
      position_type: body.position_type || null,
      drivers_count: body.drivers_count || null,
      details: body.details && typeof body.details === 'object' ? body.details : {},
      locale: body.locale || 'fr',
      lead_id: body.lead_id || null,
      status: 'new',
    }

    const { data: inserted, error } = await supabase
      .from('company_applications')
      .insert(row)
      .select('id')
      .single()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    if (body.lead_id) {
      await supabase
        .from('company_leads')
        .update({ status: 'form_sent' })
        .eq('id', body.lead_id)
    }

    // Notify the agency + acknowledge the company (non-blocking — don't delay the response on SMTP)
    sendNotificationEmail(
      `New Company Application — ${company_name}`,
      buildCompanyApplicationEmailHtml(body),
    ).then((r) => {
      if (!r.ok) console.error('Company application email error:', r.error)
    }).catch((e) => console.error('Company application email failed:', e))

    sendConfirmationEmail(
      String(email),
      body.locale === 'en' ? 'Request received — TruckRecruit.com' : 'Demande reçue — TruckRecruit.com',
      buildCompanyConfirmationHtml(String(contact_name), body.locale || 'fr'),
    ).catch((e) => console.error('Company confirmation email failed:', e))

    const zohoResult = await syncCompanyToZoho(body)
    if (!zohoResult.ok) {
      console.error('Zoho company sync error:', zohoResult.error)
    } else if (zohoResult.synced && inserted?.id) {
      await supabase
        .from('company_applications')
        .update({ synced_zoho: true })
        .eq('id', inserted.id)
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Company application error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
