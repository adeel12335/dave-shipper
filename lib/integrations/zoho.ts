import { createAdminClient } from '@/lib/supabase/server'

// Get all app settings as object
async function getSettings(): Promise<Record<string, string>> {
  const admin = await createAdminClient()
  const { data } = await admin.from('app_settings').select('key, value')
  const out: Record<string, string> = {}
  data?.forEach(r => { out[r.key] = r.value ?? '' })
  return out
}

// Get Zoho access token using refresh token
async function getZohoAccessToken(cfg: Record<string, string>): Promise<string> {
  const url = `https://${cfg.zoho_account_url}/oauth/v2/token`
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      refresh_token: cfg.zoho_refresh_token,
      client_id: cfg.zoho_client_id,
      client_secret: cfg.zoho_client_secret,
      grant_type: 'refresh_token',
    }),
  })
  const data = await res.json()
  if (!data.access_token) throw new Error(`Zoho token error: ${JSON.stringify(data)}`)
  return data.access_token
}

// Create a candidate in Zoho Recruit
export async function syncToZoho(formData: Record<string, unknown>): Promise<{ ok: boolean; error?: string }> {
  try {
    const cfg = await getSettings()
    if (cfg.zoho_enabled !== 'true') return { ok: true }
    if (!cfg.zoho_client_id || !cfg.zoho_refresh_token) return { ok: false, error: 'Zoho not configured' }

    const accessToken = await getZohoAccessToken(cfg)

    // Map form fields to Zoho Recruit Candidate fields
    const candidate: Record<string, unknown> = {
      Last_Name: formData.full_name || 'Unknown',
      Email: formData.email || '',
      Phone: formData.phone || '',
      Current_Job_Title: 'Chauffeur',
      City: formData.city || '',
      Province: formData.province || '',
      Experience_in_Years: formData.years_experience || '',
      Skill_Set: Array.isArray(formData.license_classes) ? (formData.license_classes as string[]).join(', ') : '',
      Source: 'CamionRecrute.com',
    }

    const zohoBase = cfg.zoho_account_url.replace('accounts.', 'recruit.')
    const apiUrl = `https://${zohoBase}/recruit/v2/Candidates`

    const res = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        Authorization: `Zoho-oauthtoken ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ data: [candidate] }),
    })

    const result = await res.json()
    if (result.data?.[0]?.status === 'success') return { ok: true }
    return { ok: false, error: JSON.stringify(result) }
  } catch (err) {
    return { ok: false, error: String(err) }
  }
}
