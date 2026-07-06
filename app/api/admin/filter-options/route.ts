import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const ALLOWED_TABLES = new Set(['company_leads', 'driver_applications', 'company_applications'])

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const table = searchParams.get('table') || ''
    const field = searchParams.get('field') || ''
    const jsonb = searchParams.get('jsonb') === 'true'

    if (!ALLOWED_TABLES.has(table) || !field || field.includes('.') || field.includes(' ')) {
      return NextResponse.json({ error: 'Invalid params' }, { status: 400 })
    }

    const { data, error } = await supabase.from(table).select(jsonb ? 'details' : field).limit(2000)
    if (error) throw error

    const rows = (data || []) as unknown as Record<string, unknown>[]
    const values = new Set<string>()
    for (const row of rows) {
      let v: unknown
      if (jsonb) {
        const details = row.details as Record<string, unknown> | null
        v = details?.[field]
      } else {
        v = row[field]
      }
      if (v === null || v === undefined || v === '') continue
      if (Array.isArray(v)) v.forEach((item) => values.add(String(item)))
      else values.add(String(v))
    }

    const options = [...values].sort((a, b) => a.localeCompare(b)).map((value) => ({ value, label: value }))
    return NextResponse.json({ options })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
