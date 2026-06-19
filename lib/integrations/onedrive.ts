import { createAdminClient } from '@/lib/supabase/server'

async function getSettings(): Promise<Record<string, string>> {
  const admin = await createAdminClient()
  const { data } = await admin.from('app_settings').select('key, value')
  const out: Record<string, string> = {}
  data?.forEach(r => { out[r.key] = r.value ?? '' })
  return out
}

// Get Microsoft Graph access token (client credentials flow)
async function getMsAccessToken(cfg: Record<string, string>): Promise<string> {
  const url = `https://login.microsoftonline.com/${cfg.onedrive_tenant_id}/oauth2/v2.0/token`
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: cfg.onedrive_client_id,
      client_secret: cfg.onedrive_client_secret,
      scope: 'https://graph.microsoft.com/.default',
      grant_type: 'client_credentials',
    }),
  })
  const data = await res.json()
  if (!data.access_token) throw new Error(`MS token error: ${JSON.stringify(data)}`)
  return data.access_token
}

// Append a row to an Excel table on OneDrive via Microsoft Graph
export async function syncToOneDrive(formData: Record<string, unknown>): Promise<{ ok: boolean; error?: string }> {
  try {
    const cfg = await getSettings()
    if (cfg.onedrive_enabled !== 'true') return { ok: true }
    if (!cfg.onedrive_tenant_id || !cfg.onedrive_file_id) return { ok: false, error: 'OneDrive not configured' }

    const token = await getMsAccessToken(cfg)

    // Build a flat row array matching your Excel columns
    const row = [
      new Date().toISOString(),
      formData.full_name || '',
      formData.phone || '',
      formData.email || '',
      formData.city || '',
      formData.province || '',
      formData.years_experience || '',
      Array.isArray(formData.license_classes) ? (formData.license_classes as string[]).join(', ') : '',
      Array.isArray(formData.equipment) ? (formData.equipment as string[]).join(', ') : '',
      Array.isArray(formData.transport_types) ? (formData.transport_types as string[]).join(', ') : '',
      formData.available_from || '',
      formData.desired_salary || '',
      Array.isArray(formData.languages) ? (formData.languages as string[]).join(', ') : '',
    ]

    const sheet = encodeURIComponent(cfg.onedrive_sheet_name || 'Sheet1')
    // Try to append via the used-range approach — find the next empty row and write
    const driveId = cfg.onedrive_drive_id
    const fileId = cfg.onedrive_file_id

    // Get current used range to find next row
    const rangeRes = await fetch(
      `https://graph.microsoft.com/v1.0/drives/${driveId}/items/${fileId}/workbook/worksheets/${sheet}/usedRange`,
      { headers: { Authorization: `Bearer ${token}` } }
    )
    const rangeData = await rangeRes.json()
    const nextRow = (rangeData.rowCount || 1) + 1

    // Write to next row, columns A onwards
    const colCount = row.length
    const endCol = String.fromCharCode(64 + colCount) // A=65
    const address = `A${nextRow}:${endCol}${nextRow}`

    const writeRes = await fetch(
      `https://graph.microsoft.com/v1.0/drives/${driveId}/items/${fileId}/workbook/worksheets/${sheet}/range(address='${address}')`,
      {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ values: [row] }),
      }
    )

    if (!writeRes.ok) {
      const err = await writeRes.text()
      return { ok: false, error: err }
    }
    return { ok: true }
  } catch (err) {
    return { ok: false, error: String(err) }
  }
}
