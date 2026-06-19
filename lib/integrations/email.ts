import { createAdminClient } from '@/lib/supabase/server'

async function getSettings(): Promise<Record<string, string>> {
  const admin = await createAdminClient()
  const { data } = await admin.from('app_settings').select('key, value')
  const out: Record<string, string> = {}
  data?.forEach(r => { out[r.key] = r.value ?? '' })
  return out
}

// Send email via SMTP using the fetch-based approach (nodemailer not needed with SMTP relay)
// Uses the raw SMTP protocol through a simple HTTP email API if available,
// or nodemailer if running in Node.js environment
export async function sendNotificationEmail(subject: string, html: string): Promise<{ ok: boolean; error?: string }> {
  try {
    const cfg = await getSettings()
    if (cfg.smtp_enabled !== 'true') return { ok: true }
    if (!cfg.smtp_host || !cfg.smtp_user) return { ok: false, error: 'SMTP not configured' }

    // Dynamic import of nodemailer (server-side only)
    const nodemailer = await import('nodemailer')
    const transporter = nodemailer.default.createTransport({
      host: cfg.smtp_host,
      port: parseInt(cfg.smtp_port || '587'),
      secure: cfg.smtp_port === '465',
      auth: {
        user: cfg.smtp_user,
        pass: cfg.smtp_pass,
      },
    })

    await transporter.sendMail({
      from: `"${cfg.smtp_from_name || 'CamionRecrute'}" <${cfg.smtp_from_email || cfg.smtp_user}>`,
      to: cfg.smtp_from_email || cfg.smtp_user,
      subject,
      html,
    })

    return { ok: true }
  } catch (err) {
    return { ok: false, error: String(err) }
  }
}

export function buildDriverEmailHtml(data: Record<string, unknown>): string {
  const rows = Object.entries(data)
    .map(([k, v]) => `<tr><td style="padding:6px 12px;font-weight:600;color:#6b7a8d;font-size:13px;text-transform:uppercase;letter-spacing:1px;">${k.replace(/_/g,' ')}</td><td style="padding:6px 12px;color:#14222f;font-size:14px;">${Array.isArray(v)?(v as string[]).join(', '):String(v||'-')}</td></tr>`)
    .join('')

  return `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#f8f9fc;padding:32px;">
      <div style="background:#0a1420;padding:20px 24px;border-radius:12px 12px 0 0;display:flex;align-items:center;gap:12px;">
        <span style="color:#d4a03c;font-weight:900;font-size:20px;letter-spacing:1px;">CAMIONRECRUTE.COM</span>
      </div>
      <div style="background:white;padding:24px;border-radius:0 0 12px 12px;border:1px solid #e8edf5;">
        <h2 style="color:#14222f;margin-bottom:4px;">New Driver Application</h2>
        <p style="color:#6b7a8d;margin-bottom:20px;">A new driver has submitted their application.</p>
        <table style="width:100%;border-collapse:collapse;border:1px solid #f0f2f6;border-radius:8px;overflow:hidden;">
          ${rows}
        </table>
        <div style="margin-top:20px;text-align:center;">
          <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/admin" style="display:inline-block;padding:12px 28px;background:#d4a03c;color:#0a1420;font-weight:800;border-radius:8px;text-decoration:none;">View in Admin Panel</a>
        </div>
      </div>
    </div>
  `
}
