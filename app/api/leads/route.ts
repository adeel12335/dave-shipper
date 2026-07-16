import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { sendNotificationEmail, buildLeadEmailHtml, sendConfirmationEmail, buildCompanyConfirmationHtml } from '@/lib/integrations/email'
import { syncCompanyToZoho } from '@/lib/integrations/zoho'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { company_name, contact_name, phone, email, message, locale } = body

    if (!company_name || !contact_name || !phone || !email) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const supabase = await createAdminClient()
    const { data: inserted, error } = await supabase.from('company_leads').insert({
      company_name, contact_name, phone, email,
      message: message || null,
      locale: locale || 'fr',
      status: 'new',
    }).select('id').single()

    if (error) throw error

    const integrationData = { ...body }
    Promise.allSettled([
      sendNotificationEmail(
        `New Company Lead — ${company_name}`,
        buildLeadEmailHtml(integrationData)
      ),
      syncCompanyToZoho(integrationData),
      sendConfirmationEmail(
        email,
        locale === 'en' ? 'Request received — TruckRecruit.com' : 'Demande reçue — TruckRecruit.com',
        buildCompanyConfirmationHtml(contact_name, locale)
      ),
    ]).then(async (results) => {
      results.forEach((r, i) => {
        if (r.status === 'rejected') console.error(`Lead integration ${i} failed:`, r.reason)
        else if (!r.value.ok) console.error(`Lead integration ${i} error:`, r.value.error)
      })

      const zohoResult = results[1]
      if (
        inserted?.id &&
        zohoResult.status === 'fulfilled' &&
        zohoResult.value.synced
      ) {
        const { error: updateError } = await supabase
          .from('company_leads')
          .update({ synced_zoho: true })
          .eq('id', inserted.id)
        if (updateError) console.error('Failed to update lead synced_zoho:', updateError)
      }
    })

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 })
  }
}
