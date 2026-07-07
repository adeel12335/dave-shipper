import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { testEmailConnection } from '@/lib/integrations/email'

// POST — verify SMTP settings and send a test email (admin only).
// Optional body overrides let the admin test unsaved form values.
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })

  let override: Record<string, string> = {}
  try { override = await request.json() } catch { /* no body — test saved settings */ }

  const result = await testEmailConnection(override)
  return NextResponse.json(result)
}
