import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { ADMIN_FILTER_DEFS } from '@/lib/admin/filter-definitions'
import { applyAdminFilters } from '@/lib/admin/apply-filters'

function parseFilters(raw: string | null): Record<string, string> {
  if (!raw) return {}
  try {
    const parsed = JSON.parse(raw)
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      const out: Record<string, string> = {}
      for (const [k, v] of Object.entries(parsed)) {
        if (v !== null && v !== undefined && String(v).trim()) out[k] = String(v)
      }
      return out
    }
  } catch { /* ignore */ }
  return {}
}

function escapeCsv(value: unknown): string {
  if (value === null || value === undefined) return ''
  const str = Array.isArray(value) ? value.join('; ') : typeof value === 'object' ? JSON.stringify(value) : String(value)
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const table = searchParams.get('table') || 'company_leads'
    const status = searchParams.get('status') || ''
    const filters = parseFilters(searchParams.get('filters'))

    const defs = ADMIN_FILTER_DEFS[table] || []
    let query = supabase.from(table).select('*').order('created_at', { ascending: false }).limit(5000)

    if (status) query = query.eq('status', status)
    query = applyAdminFilters(query, filters, defs)

    const { data, error } = await query
    if (error) throw error

    const rows = data || []
    if (!rows.length) {
      return new NextResponse('No data', {
        status: 200,
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="${table}-export.csv"`,
        },
      })
    }

    const columns = Object.keys(rows[0])
    const header = columns.join(',')
    const body = rows.map((row) => columns.map((col) => escapeCsv(row[col])).join(',')).join('\n')
    const csv = `${header}\n${body}`

    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${table}-export.csv"`,
      },
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
