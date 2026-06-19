import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

// GET — fetch all settings (admin only)
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = await createAdminClient()
  const { data, error } = await admin.from('app_settings').select('key, value').order('key')
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Convert rows to object
  const settings: Record<string, string> = {}
  data?.forEach(row => { settings[row.key] = row.value ?? '' })
  return NextResponse.json(settings)
}

// POST — upsert settings (admin only)
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body: Record<string, string> = await request.json()
  const admin = await createAdminClient()

  const rows = Object.entries(body).map(([key, value]) => ({
    key,
    value: String(value),
    updated_at: new Date().toISOString(),
  }))

  const { error } = await admin
    .from('app_settings')
    .upsert(rows, { onConflict: 'key' })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
