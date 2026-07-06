import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { syncToZoho, syncCompanyToZoho } from '@/lib/integrations/zoho'

const TABLE_MAP: Record<string, 'Candidates' | 'Clients'> = {
  driver_applications: 'Candidates',
  company_leads: 'Clients',
  company_applications: 'Clients',
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { table, id } = await req.json()
    if (!table || !id || !TABLE_MAP[table]) {
      return NextResponse.json({ error: 'Invalid table' }, { status: 400 })
    }

    const admin = await createAdminClient()
    const { data: row, error } = await admin.from(table).select('*').eq('id', id).single()
    if (error || !row) return NextResponse.json({ error: 'Record not found' }, { status: 404 })

    const result = table === 'driver_applications'
      ? await syncToZoho(row)
      : await syncCompanyToZoho(row)

    if (!result.ok) {
      return NextResponse.json({ error: result.error || 'Zoho sync failed' }, { status: 502 })
    }

    if (result.synced) {
      const { error: updateError } = await admin.from(table).update({ synced_zoho: true }).eq('id', id)
      if (updateError) console.error('Failed to update synced_zoho:', updateError)
    }

    return NextResponse.json({ success: true, synced: result.synced })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
