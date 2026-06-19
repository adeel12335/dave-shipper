'use client'
import { useState } from 'react'
import Link from 'next/link'

type Field = {
  name: string
  type: string
  label: string
  required?: boolean
  full?: boolean
  placeholder?: string
  options?: string[]
}

const SECTIONS: { num: number; title: string; sub: string; fields: Field[] }[] = [
  {
    num: 1, title: 'Informations de la compagnie', sub: 'VOTRE ENTREPRISE',
    fields: [
      { name: 'company_name', type: 'text', required: true, label: 'Nom de la compagnie', placeholder: 'Transport ABC Inc.' },
      { name: 'mc_number', type: 'text', label: 'Numero MC / DOT', placeholder: 'MC-123456' },
      { name: 'city', type: 'text', required: true, label: 'Ville', placeholder: 'Montreal' },
      { name: 'province', type: 'select', required: true, full: true, label: 'Province / Etat', options: ['Quebec', 'Ontario', 'Alberta', 'Colombie-Britannique', 'Manitoba', 'Saskatchewan', 'Autre'] },
    ]
  },
  {
    num: 2, title: 'Personne contact', sub: 'RESPONSABLE DES EMBAUCHES',
    fields: [
      { name: 'contact_name', type: 'text', required: true, label: 'Nom du responsable', placeholder: 'Jean Dupont' },
      { name: 'contact_title', type: 'text', label: 'Titre / Poste', placeholder: 'Directeur des operations' },
      { name: 'phone', type: 'tel', required: true, label: 'Telephone', placeholder: '(514) 555-0000' },
      { name: 'email', type: 'email', required: true, label: 'Courriel', placeholder: 'rh@compagnie.com' },
    ]
  },
  {
    num: 3, title: 'Besoins en conducteurs', sub: 'TYPE DE CHAUFFEURS RECHERCHES',
    fields: [
      { name: 'driver_types', type: 'checkboxes', full: true, label: 'Types de chauffeurs', options: ['Classe 1', 'Classe 3', 'Classe 5', 'AZ', 'DZ', 'Propietaire-operateur'] },
      { name: 'positions_count', type: 'select', full: true, label: 'Nombre de postes a combler', options: ['1-2', '3-5', '6-10', '11-20', 'Plus de 20'] },
      { name: 'employment_type', type: 'checkboxes', full: true, label: "Type d'emploi offert", options: ['Temps plein', 'Temps partiel', 'Contractuel', 'Saisonnier', 'Permanent'] },
    ]
  },
  {
    num: 4, title: 'Type de transport', sub: 'OPERATIONS',
    fields: [
      { name: 'transport_types', type: 'checkboxes', full: true, label: 'Types de transport', options: ['Local', 'Regional', 'Longue Distance Canada', 'Longue Distance U.S.', 'International'] },
      { name: 'equipment_types', type: 'checkboxes', full: true, label: 'Types de remorques', options: ['Dry Van', 'Reefer', 'Flatbed', 'Citerne', 'Dompeur', 'Container', 'Train Routier'] },
    ]
  },
  {
    num: 5, title: 'Conditions offertes', sub: 'REMUNERATION',
    fields: [
      { name: 'salary_range', type: 'select', full: true, label: 'Salaire / tarif offert', options: ['Moins de 22$/h', '22-25$/h', '25-28$/h', '28-32$/h', 'Plus de 32$/h', 'Salaire a discuter', 'Au km'] },
      { name: 'benefits', type: 'checkboxes', full: true, label: 'Avantages offerts', options: ['Assurances collectives', 'REER', 'Conges payes', 'Formation payee', 'Prime de rendement', 'Camion attitré'] },
      { name: 'additional_info', type: 'textarea', full: true, label: 'Informations supplementaires', placeholder: 'Decrivez le poste, les conditions, vos attentes...' },
    ]
  },
]

type FormData = Record<string, string | string[]>

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function CompanyFormPage() {
  const [data, setData] = useState<FormData>({})
  const [status, setStatus] = useState('idle')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const setValue = (name: string, value: string | string[]) => {
    setData(d => ({ ...d, [name]: value }))
    if (errors[name]) setErrors(e => ({ ...e, [name]: '' }))
  }

  const toggleCheck = (name: string, val: string) => {
    const cur = (data[name] as string[]) || []
    setValue(name, cur.includes(val) ? cur.filter(v => v !== val) : [...cur, val])
  }

  const validate = () => {
    const e: Record<string, string> = {}
    const allFields = SECTIONS.flatMap(s => s.fields)
    for (const f of allFields) {
      if (f.required) {
        const val = data[f.name]
        if (!val || (typeof val === 'string' && !val.trim())) {
          e[f.name] = 'Ce champ est requis'
        }
      }
      if (f.type === 'email' && data[f.name]) {
        if (!EMAIL_RE.test(data[f.name] as string)) e[f.name] = 'Adresse courriel invalide'
      }
      if (f.type === 'tel' && data[f.name]) {
        const digits = (data[f.name] as string).replace(/\D/g, '')
        if (digits.length < 10) e[f.name] = 'Minimum 10 chiffres requis'
      }
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) {
      const firstErr = document.querySelector('[data-field-err]')
      firstErr?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }
    setStatus('loading')
    const res = await fetch('/api/company-applications', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
    setStatus(res.ok ? 'success' : 'error')
  }

  if (status === 'success') {
    return (
      <div style={{ minHeight: '100vh', background: '#f8f9fc', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
        <div style={{ background: 'white', borderRadius: 16, padding: 48, textAlign: 'center', maxWidth: 480, boxShadow: '0 4px 24px rgba(0,0,0,.08)' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>✓</div>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: '#14222f', marginBottom: 8 }}>Demande envoyée!</h2>
          <p style={{ color: '#6b7a8d', marginBottom: 24 }}>Nous vous contacterons dans les meilleurs délais pour discuter de vos besoins.</p>
          <Link href="/" style={{ display: 'inline-block', padding: '12px 28px', background: '#d4a03c', color: '#14222f', borderRadius: 8, fontWeight: 700, textDecoration: 'none' }}>Retour à l&apos;accueil</Link>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8f9fc', paddingTop: 100 }}>
      <div style={{ maxWidth: 860, margin: '0 auto', padding: '0 20px 80px' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: 2, color: '#d4a03c', textTransform: 'uppercase', marginBottom: 8 }}>RECRUTEMENT</p>
          <h1 style={{ fontSize: 36, fontWeight: 900, color: '#14222f', lineHeight: 1.2 }}>Trouvez vos <span style={{ color: '#d4a03c' }}>Chauffeurs</span></h1>
          <p style={{ color: '#6b7a8d', marginTop: 12, maxWidth: 500, margin: '12px auto 0' }}>Remplissez ce formulaire et notre équipe vous contactera rapidement avec des profils correspondant à vos besoins.</p>
        </div>

        {status === 'error' && (
          <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 10, padding: '14px 20px', marginBottom: 24, color: '#b91c1c', fontWeight: 600 }}>
            Une erreur est survenue. Veuillez réessayer ou nous contacter directement.
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {SECTIONS.map((section) => (
            <div key={section.num} style={{ background: 'white', borderRadius: 16, padding: 32, marginBottom: 24, boxShadow: '0 2px 12px rgba(0,0,0,.06)', border: '1px solid #e8edf5' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24, paddingBottom: 16, borderBottom: '1px solid #f0f2f6' }}>
                <div style={{ width: 36, height: 36, background: 'linear-gradient(135deg,#d4a03c,#b8872e)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 16, flexShrink: 0 }}>{section.num}</div>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, color: '#d4a03c', textTransform: 'uppercase' }}>{section.sub}</div>
                  <div style={{ fontSize: 17, fontWeight: 800, color: '#14222f' }}>{section.title}</div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
                {section.fields.map((f) => (
                  <div key={f.name} style={{ gridColumn: f.full ? '1 / -1' : undefined }} data-field-err={errors[f.name] ? f.name : undefined}>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#14222f', marginBottom: 6 }}>
                      {f.label}{f.required && <span style={{ color: '#d4a03c', marginLeft: 4 }}>*</span>}
                    </label>

                    {f.type === 'select' && (
                      <select name={f.name} value={(data[f.name] as string) || ''} onChange={e => setValue(f.name, e.target.value)}
                        style={{ width: '100%', padding: '11px 14px', borderRadius: 10, border: `1.5px solid ${errors[f.name] ? '#e53e3e' : '#e0e7ef'}`, fontSize: 14, color: '#14222f', background: 'white', outline: 'none' }}>
                        <option value="">Sélectionner...</option>
                        {f.options?.map(o => <option key={o} value={o}>{o}</option>)}
                      </select>
                    )}

                    {f.type === 'checkboxes' && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 16px' }}>
                        {f.options?.map(o => (
                          <label key={o} style={{ display: 'flex', alignItems: 'center', gap: 7, cursor: 'pointer', fontSize: 14, color: '#2a3d52', fontWeight: 500 }}>
                            <input type="checkbox" checked={((data[f.name] as string[]) || []).includes(o)} onChange={() => toggleCheck(f.name, o)} style={{ accentColor: '#d4a03c', width: 16, height: 16 }} />
                            {o}
                          </label>
                        ))}
                      </div>
                    )}

                    {f.type === 'radios' && (
                      <div style={{ display: 'flex', gap: 20 }}>
                        {f.options?.map(o => (
                          <label key={o} style={{ display: 'flex', alignItems: 'center', gap: 7, cursor: 'pointer', fontSize: 14, color: '#2a3d52', fontWeight: 500 }}>
                            <input type="radio" name={f.name} value={o} checked={data[f.name] === o} onChange={() => setValue(f.name, o)} style={{ accentColor: '#d4a03c' }} />
                            {o}
                          </label>
                        ))}
                      </div>
                    )}

                    {f.type === 'textarea' && (
                      <textarea name={f.name} rows={4} placeholder={f.placeholder} value={(data[f.name] as string) || ''} onChange={e => setValue(f.name, e.target.value)}
                        style={{ width: '100%', padding: '11px 14px', borderRadius: 10, border: `1.5px solid ${errors[f.name] ? '#e53e3e' : '#e0e7ef'}`, fontSize: 14, color: '#14222f', outline: 'none', resize: 'vertical', boxSizing: 'border-box' }} />
                    )}

                    {!['select', 'checkboxes', 'radios', 'textarea'].includes(f.type) && (
                      <input type={f.type} name={f.name} placeholder={f.placeholder} value={(data[f.name] as string) || ''} onChange={e => setValue(f.name, e.target.value)}
                        style={{ width: '100%', padding: '11px 14px', borderRadius: 10, border: `1.5px solid ${errors[f.name] ? '#e53e3e' : '#e0e7ef'}`, fontSize: 14, color: '#14222f', outline: 'none', boxSizing: 'border-box' }} />
                    )}

                    {errors[f.name] && <p style={{ margin: '4px 0 0', fontSize: 12, fontWeight: 600, color: '#e53e3e' }}>{errors[f.name]}</p>}
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div style={{ textAlign: 'center' }}>
            <button type="submit" disabled={status === 'loading'}
              style={{ padding: '16px 48px', background: 'linear-gradient(135deg,#d4a03c,#b8872e)', color: '#0a1420', fontWeight: 800, fontSize: 16, borderRadius: 12, border: 'none', cursor: 'pointer', letterSpacing: 0.5 }}>
              {status === 'loading' ? 'Envoi en cours...' : 'Soumettre ma demande'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
