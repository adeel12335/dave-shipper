import { createAdminClient } from '@/lib/supabase/server'

async function getSettings(): Promise<Record<string, string>> {
  const admin = await createAdminClient()
  const { data } = await admin.from('app_settings').select('key, value')
  const out: Record<string, string> = {}
  data?.forEach(r => { out[r.key] = r.value ?? '' })
  return out
}

// Build a nodemailer transporter + From header from settings (server-side only)
async function getMailer(cfg: Record<string, string>) {
  const nodemailer = await import('nodemailer')
  const transporter = nodemailer.default.createTransport({
    host: cfg.smtp_host,
    port: parseInt(cfg.smtp_port || '587'),
    secure: cfg.smtp_port === '465',
    auth: { user: cfg.smtp_user, pass: cfg.smtp_pass },
  })
  const from = `"${cfg.smtp_from_name || 'TruckRecruit'}" <${cfg.smtp_from_email || cfg.smtp_user}>`
  return { transporter, from }
}

// Internal notification to the agency (new lead / application alert).
// Recipient is the configurable notification_email, falling back to the sender.
export async function sendNotificationEmail(subject: string, html: string): Promise<{ ok: boolean; error?: string }> {
  try {
    const cfg = await getSettings()
    if (cfg.smtp_enabled !== 'true') return { ok: true }
    if (!cfg.smtp_host || !cfg.smtp_user) return { ok: false, error: 'SMTP not configured' }

    const to = cfg.notification_email || cfg.smtp_from_email || cfg.smtp_user
    const { transporter, from } = await getMailer(cfg)
    await transporter.sendMail({ from, to, subject, html })
    return { ok: true }
  } catch (err) {
    return { ok: false, error: String(err) }
  }
}

// Confirmation / acknowledgement sent to the applicant (driver or company).
// Gated behind the `confirmation_enabled` setting so the agency can opt out.
export async function sendConfirmationEmail(to: string, subject: string, html: string): Promise<{ ok: boolean; error?: string }> {
  try {
    if (!to) return { ok: true }
    const cfg = await getSettings()
    if (cfg.smtp_enabled !== 'true' || cfg.confirmation_enabled !== 'true') return { ok: true }
    if (!cfg.smtp_host || !cfg.smtp_user) return { ok: false, error: 'SMTP not configured' }

    const { transporter, from } = await getMailer(cfg)
    await transporter.sendMail({ from, to, subject, html })
    return { ok: true }
  } catch (err) {
    return { ok: false, error: String(err) }
  }
}

// Verify SMTP settings and send a test message. Ignores the smtp_enabled flag
// so the admin can test before turning notifications on. `override` lets the
// admin test the values currently in the form without saving them first.
export async function testEmailConnection(
  override: Record<string, string> = {},
): Promise<{ ok: boolean; error?: string; sentTo?: string }> {
  try {
    const saved = await getSettings()
    const cfg = { ...saved, ...override }
    if (!cfg.smtp_host || !cfg.smtp_user) return { ok: false, error: 'SMTP host and username are required' }

    const { transporter, from } = await getMailer(cfg)
    await transporter.verify()

    const to = cfg.notification_email || cfg.smtp_from_email || cfg.smtp_user
    await transporter.sendMail({
      from,
      to,
      subject: 'TruckRecruit.com — Test email ✓',
      html: `<div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:28px;background:#f8f9fc;">
        <div style="background:#0a1420;padding:18px;border-radius:12px 12px 0 0;text-align:center;"><span style="color:#d4a03c;font-weight:900;font-size:20px;letter-spacing:1px;">TRUCKRECRUIT.COM</span></div>
        <div style="background:white;padding:24px;border-radius:0 0 12px 12px;border:1px solid #e8edf5;">
          <h2 style="color:#14222f;margin:0 0 10px;">Test successful ✓</h2>
          <p style="color:#4a5a6b;line-height:1.7;margin:0;">Your SMTP settings are working. New lead &amp; application notifications will be delivered to this address.</p>
        </div>
      </div>`,
    })
    return { ok: true, sentTo: to }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) }
  }
}

export function buildDriverEmailHtml(data: Record<string, unknown>): string {
  const rows = Object.entries(data)
    .map(([k, v]) => `<tr><td style="padding:6px 12px;font-weight:600;color:#6b7a8d;font-size:13px;text-transform:uppercase;letter-spacing:1px;">${k.replace(/_/g,' ')}</td><td style="padding:6px 12px;color:#14222f;font-size:14px;">${Array.isArray(v)?(v as string[]).join(', '):String(v||'-')}</td></tr>`)
    .join('')

  return `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#f8f9fc;padding:32px;">
      <div style="background:#0a1420;padding:20px 24px;border-radius:12px 12px 0 0;display:flex;align-items:center;gap:12px;">
        <span style="color:#d4a03c;font-weight:900;font-size:20px;letter-spacing:1px;">TRUCKRECRUIT.COM</span>
        <span style="margin-left:auto;background:#d4a03c;color:#0a1420;font-weight:800;font-size:12px;padding:5px 13px;border-radius:20px;letter-spacing:1.5px;">DRIVER</span>
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

export function buildCompanyApplicationEmailHtml(data: Record<string, unknown>): string {
  // Flatten top-level fields + the nested `details` object into one row set
  const details = data.details && typeof data.details === 'object' ? data.details as Record<string, unknown> : {}
  const flat: Record<string, unknown> = { ...data, ...details }
  delete flat.details

  const rows = Object.entries(flat)
    .filter(([, v]) => v !== null && v !== '' && !(Array.isArray(v) && v.length === 0))
    .map(([k, v]) => `<tr><td style="padding:6px 12px;font-weight:600;color:#6b7a8d;font-size:13px;text-transform:uppercase;letter-spacing:1px;">${k.replace(/_/g,' ')}</td><td style="padding:6px 12px;color:#14222f;font-size:14px;">${Array.isArray(v)?(v as string[]).join(', '):String(v||'-')}</td></tr>`)
    .join('')

  return `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#f8f9fc;padding:32px;">
      <div style="background:#0a1420;padding:20px 24px;border-radius:12px 12px 0 0;display:flex;align-items:center;gap:12px;">
        <span style="color:#d4a03c;font-weight:900;font-size:20px;letter-spacing:1px;">TRUCKRECRUIT.COM</span>
        <span style="margin-left:auto;background:#d4a03c;color:#0a1420;font-weight:800;font-size:12px;padding:5px 13px;border-radius:20px;letter-spacing:1.5px;">COMPANY</span>
      </div>
      <div style="background:white;padding:24px;border-radius:0 0 12px 12px;border:1px solid #e8edf5;">
        <h2 style="color:#14222f;margin-bottom:4px;">New Company Application (Detailed Form)</h2>
        <p style="color:#6b7a8d;margin-bottom:20px;">A company has completed the detailed hiring form.</p>
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

export function buildLeadEmailHtml(data: Record<string, unknown>): string {
  const rows = Object.entries(data)
    .map(([k, v]) => `<tr><td style="padding:6px 12px;font-weight:600;color:#6b7a8d;font-size:13px;text-transform:uppercase;letter-spacing:1px;">${k.replace(/_/g,' ')}</td><td style="padding:6px 12px;color:#14222f;font-size:14px;">${Array.isArray(v)?(v as string[]).join(', '):String(v||'-')}</td></tr>`)
    .join('')

  return `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#f8f9fc;padding:32px;">
      <div style="background:#0a1420;padding:20px 24px;border-radius:12px 12px 0 0;display:flex;align-items:center;gap:12px;">
        <span style="color:#d4a03c;font-weight:900;font-size:20px;letter-spacing:1px;">TRUCKRECRUIT.COM</span>
        <span style="margin-left:auto;background:#d4a03c;color:#0a1420;font-weight:800;font-size:12px;padding:5px 13px;border-radius:20px;letter-spacing:1.5px;">COMPANY</span>
      </div>
      <div style="background:white;padding:24px;border-radius:0 0 12px 12px;border:1px solid #e8edf5;">
        <h2 style="color:#14222f;margin-bottom:4px;">New Company Lead</h2>
        <p style="color:#6b7a8d;margin-bottom:20px;">A company has submitted a lead from the landing page.</p>
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

// ---- Applicant-facing confirmation emails (sent to the person who applied) ----

function confirmationShell(heading: string, body: string): string {
  return `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#f8f9fc;padding:32px;">
      <div style="background:#0a1420;padding:22px 24px;border-radius:12px 12px 0 0;text-align:center;">
        <span style="color:#d4a03c;font-weight:900;font-size:22px;letter-spacing:1px;">TRUCKRECRUIT.COM</span>
      </div>
      <div style="background:white;padding:28px 26px;border-radius:0 0 12px 12px;border:1px solid #e8edf5;">
        <h2 style="color:#14222f;margin:0 0 12px;">${heading}</h2>
        <p style="color:#4a5a6b;font-size:15px;line-height:1.7;margin:0;">${body}</p>
        <p style="color:#9aa7b5;font-size:13px;line-height:1.6;margin:22px 0 0;border-top:1px solid #eef1f5;padding-top:16px;">TruckRecruit.com — Les bons chauffeurs. Les bonnes opportunités.</p>
      </div>
    </div>
  `
}

export function buildDriverConfirmationHtml(name: string, locale: string = 'fr'): string {
  const first = (name || '').trim().split(' ')[0]
  if (locale === 'en') {
    return confirmationShell(
      `Thank you${first ? `, ${first}` : ''}!`,
      `We have received your driver application. Our team will review your profile within 24–48 hours. If your profile matches our clients' needs, we will contact you with the next steps.<br/><br/>No action is needed on your part for now.`,
    )
  }
  return confirmationShell(
    `Merci${first ? `, ${first}` : ''} !`,
    `Nous avons bien reçu votre candidature de chauffeur. Notre équipe évaluera votre profil dans les 24 à 48 heures. Si votre profil correspond aux besoins de nos clients, nous vous contacterons pour les prochaines étapes.<br/><br/>Aucune action n'est requise de votre part pour le moment.`,
  )
}

export function buildCompanyConfirmationHtml(name: string, locale: string = 'fr'): string {
  const first = (name || '').trim().split(' ')[0]
  if (locale === 'en') {
    return confirmationShell(
      `Thank you${first ? `, ${first}` : ''}!`,
      `We have received your request. Our team will contact you shortly to understand your needs and help you find the right drivers.`,
    )
  }
  return confirmationShell(
    `Merci${first ? `, ${first}` : ''} !`,
    `Nous avons bien reçu votre demande. Notre équipe vous contactera sous peu afin de comprendre vos besoins et vous aider à trouver les bons chauffeurs.`,
  )
}
