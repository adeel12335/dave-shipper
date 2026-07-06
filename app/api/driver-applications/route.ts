import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { syncToZoho } from '@/lib/integrations/zoho'
import { syncToOneDrive } from '@/lib/integrations/onedrive'
import { sendNotificationEmail, buildDriverEmailHtml } from '@/lib/integrations/email'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { full_name, phone, email, city, province, years_experience, equipment, license_classes,
      transport_types, available_from, desired_salary, legal_right_to_work, legal_status,
      position_types, distance_regions, schedule, employment_types, languages, additional_notes, locale } = body

    if (!full_name || !phone || !email) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const supabase = await createClient()
    const { data: inserted, error } = await supabase.from('driver_applications').insert({
      full_name, phone, email,
      city: city || null,
      province: province || null,
      years_experience: years_experience || null,
      equipment: equipment || [],
      license_classes: license_classes || [],
      transport_types: transport_types || [],
      available_from: available_from || null,
      desired_salary: desired_salary || null,
      legal_right_to_work: legal_right_to_work || null,
      legal_status: legal_status || null,
      position_types: position_types || [],
      distance_regions: distance_regions || [],
      schedule: schedule || [],
      employment_types: employment_types || [],
      languages: languages || [],
      additional_notes: additional_notes || null,
      locale: locale || 'fr',
      status: 'new',
    }).select('id').single()

    if (error) throw error

    const applicationId = inserted.id
    const integrationData = { ...body }
    Promise.allSettled([
      syncToZoho(integrationData),
      syncToOneDrive(integrationData),
      sendNotificationEmail(
        `New Driver Application — ${full_name}`,
        buildDriverEmailHtml(integrationData)
      ),
    ]).then(async (results) => {
      results.forEach((r, i) => {
        if (r.status === 'rejected') console.error(`Integration ${i} failed:`, r.reason)
        else if (!r.value.ok) console.error(`Integration ${i} error:`, r.value.error)
      })

      const admin = await createAdminClient()
      const zohoResult = results[0]
      if (zohoResult.status === 'fulfilled' && zohoResult.value.synced) {
        const { error: updateError } = await admin
          .from('driver_applications')
          .update({ synced_zoho: true })
          .eq('id', applicationId)
        if (updateError) console.error('Failed to update synced_zoho:', updateError)
      }

      const onedriveResult = results[1]
      if (onedriveResult.status === 'fulfilled' && onedriveResult.value.ok) {
        const { error: updateError } = await admin
          .from('driver_applications')
          .update({ synced_excel: true })
          .eq('id', applicationId)
        if (updateError) console.error('Failed to update synced_excel:', updateError)
      }
    })

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 })
  }
}
