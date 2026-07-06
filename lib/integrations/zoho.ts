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

function recruitApiBase(accountUrl: string): string {
  return accountUrl.replace('accounts.', 'recruit.')
}

async function insertZohoRecord(
  cfg: Record<string, string>,
  module: 'Candidates' | 'Clients',
  record: Record<string, unknown>,
): Promise<{ ok: boolean; error?: string }> {
  const accessToken = await getZohoAccessToken(cfg)
  const apiUrl = `https://${recruitApiBase(cfg.zoho_account_url)}/recruit/v2/${module}`

  const res = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      Authorization: `Zoho-oauthtoken ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ data: [record] }),
  })

  const result = await res.json()
  if (result.data?.[0]?.status === 'success') return { ok: true }
  return { ok: false, error: JSON.stringify(result) }
}

async function syncIfEnabled(
  record: Record<string, unknown>,
  module: 'Candidates' | 'Clients',
): Promise<{ ok: boolean; synced: boolean; error?: string }> {
  try {
    const cfg = await getSettings()
    if (cfg.zoho_enabled !== 'true') return { ok: true, synced: false }
    if (!cfg.zoho_client_id || !cfg.zoho_refresh_token) {
      return { ok: false, synced: false, error: 'Zoho not configured' }
    }
    const result = await insertZohoRecord(cfg, module, record)
    return { ...result, synced: result.ok }
  } catch (err) {
    return { ok: false, synced: false, error: String(err) }
  }
}

// Create a candidate in Zoho Recruit (driver applications)
export async function syncToZoho(
  formData: Record<string, unknown>,
): Promise<{ ok: boolean; synced: boolean; error?: string }> {
  const candidate: Record<string, unknown> = {
    Last_Name: formData.full_name || 'Unknown',
    Email: formData.email || '',
    Phone: formData.phone || '',
    Current_Job_Title: 'Chauffeur',
    City: formData.city || '',
    Province: formData.province || '',
    Experience_in_Years: formData.years_experience || '',
    Skill_Set: Array.isArray(formData.license_classes)
      ? (formData.license_classes as string[]).join(', ')
      : '',
    Source: 'CamionRecrute.com',
  }
  return syncIfEnabled(candidate, 'Candidates')
}

// Create a client in Zoho Recruit (company leads / company applications).
// Clients module fits hiring companies; Job Openings is for posting roles.
export async function syncCompanyToZoho(
  formData: Record<string, unknown>,
): Promise<{ ok: boolean; synced: boolean; error?: string }> {
  const details = formData.details && typeof formData.details === 'object'
    ? formData.details as Record<string, unknown>
    : {}

  const notes = [
    formData.contact_name && `Contact: ${formData.contact_name}`,
    formData.contact_title && `Title: ${formData.contact_title}`,
    formData.position_type && `Position: ${formData.position_type}`,
    formData.drivers_count && `Drivers needed: ${formData.drivers_count}`,
    formData.region && `Region: ${formData.region}`,
    formData.message && `Message: ${formData.message}`,
    Object.keys(details).length > 0 && `Details: ${JSON.stringify(details)}`,
  ].filter(Boolean).join('\n')

  const client: Record<string, unknown> = {
    Client_Name: formData.company_name || 'Unknown',
    Contact_Number: formData.phone || '',
    Website: formData.website || '',
    Billing_City: formData.city_region || formData.region || '',
    Source: 'CamionRecrute.com',
    ...(notes ? { Description: notes } : {}),
  }

  return syncIfEnabled(client, 'Clients')
}
