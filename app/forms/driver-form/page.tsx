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
    num: 1, title: 'Informations Personnelles', sub: 'VOS COORDONNEES',
    fields: [
      { name: 'full_name', type: 'text', required: true, label: 'Nom complet', placeholder: 'Prenom et nom' },
      { name: 'phone', type: 'tel', required: true, label: 'Telephone', placeholder: '(514) 555-1234' },
      { name: 'email', type: 'email', required: true, label: 'Courriel', placeholder: 'vous@courriel.com' },
      { name: 'city', type: 'text', required: true, label: 'Ville', placeholder: 'Montreal' },
      { name: 'province', type: 'select', required: true, full: true, label: 'Province', options: ['Quebec', 'Ontario', 'Alberta', 'Colombie-Britannique', 'Manitoba', 'Saskatchewan', 'Autre'] },
    ]
  },
  {
    num: 2, title: 'Experience & Qualifications', sub: 'VOTRE PROFIL',
    fields: [
      { name: 'years_experience', type: 'select', required: true, full: true, label: "Annees d'experience", options: ['Moins de 1 an', '1-2 ans', '3-5 ans', '6-10 ans', 'Plus de 10 ans'] },
      { name: 'license_classes', type: 'checkboxes', full: true, label: 'Classes de permis', options: ['Classe 1', 'Classe 2', 'Classe 3', 'Classe 4', 'Classe 5'] },
      { name: 'equipment', type: 'checkboxes', full: true, label: 'Types de remorques', options: ['Dry Van', 'Reefer', 'Flatbed', 'Citerne', 'Dompeur', 'Container', 'Train Routier', 'Moffat', 'Tailgate'] },
    ]
  },
  {
    num: 3, title: 'Preferences de Travail', sub: 'TYPE DE POSTE',
    fields: [
      { name: 'transport_types', type: 'checkboxes', full: true, label: 'Types de transport', options: ['Local', 'Regional', 'Longue Distance Canada', 'Longue Distance U.S.'] },
      { name: 'position_types', type: 'checkboxes', full: true, label: 'Types de postes', options: ['Temps plein', 'Temps partiel', 'Contractuel', 'Saisonnier'] },
      { name: 'employment_types', type: 'checkboxes', full: true, label: "Type d'emploi", options: ['Employe', 'Proprietaire-operateur'] },
    ]
  },
  {
    num: 4, title: 'Disponibilite', sub: 'QUAND POUVEZ-VOUS COMMENCER',
    fields: [
      { name: 'available_from', type: 'date', label: 'Disponible a partir de', placeholder: '' },
      { name: 'desired_salary', type: 'text', label: 'Salaire desire', placeholder: 'Ex: 28$/h ou 0.60$/km' },
      { name: 'schedule', type: 'checkboxes', full: true, label: 'Horaires acceptes', options: ['Jour', 'Soir', 'Nuit', 'Fin de semaine', 'Horaire rotatif'] },
    ]
  },
  {
    num: 5, title: 'Statut Legal', sub: 'DROIT DE TRAVAILLER AU CANADA',
    fields: [
      { name: 'legal_right_to_work', type: 'radios', full: true, label: 'Avez-vous le droit de travailler au Canada?', options: ['Oui', 'Non'] },
      { name: 'legal_status', type: 'select', full: true, label: 'Statut', options: ['Citoyen canadien', 'Resident permanent', 'Permis de travail', 'Autre'] },
      { name: 'languages', type: 'checkboxes', full: true, label: 'Langues parlees', options: ['Francais', 'Anglais', 'Espagnol', 'Autre'] },
    ]
  },
  {
    num: 6, title: 'Regions', sub: 'OU SOUHAITEZ-VOUS TRAVAILLER',
    fields: [
      { name: 'distance_regions', type: 'checkboxes', full: true, label: 'Regions souhaitees', options: ['Quebec', 'Ontario', 'Maritimes', 'Ouest canadien', 'Est USA', 'Ouest USA', 'Nationwide'] },
    ]
  },
]

type FormData = Record<string, string | string[]>

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function DriverFormPage() {
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
      const firstErr = document.querySelector('[data-field].has-error')
      firstErr?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }
    setStatus('sending')
    try {
      const res = await fetch('/api/driver-applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, locale: 'fr' }),
      })
      if (!res.ok) throw new Error()
      setStatus('ok')
    } catch { setStatus('err') }
  }

  if (status === 'ok') {
    return (
      <div className="form-page">
        <div className="form-hero">
          <h1>Candidature <span className="gold">soumise!</span></h1>
          <p>Merci! Notre equipe vous contactera dans les 24-48 heures.</p>
        </div>
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <Link href="/" className="btn">Retour a l accueil</Link>
        </div>
      </div>
    )
  }

  const progress = Math.round((Object.keys(data).length / 15) * 100)

  return (
    <div className="form-page">
      <div className="progress">
        <div className="wrap">
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${Math.min(progress, 100)}%` }}></div>
          </div>
          <div className="progress-text">{SECTIONS.length} SECTIONS</div>
        </div>
      </div>

      <div className="form-hero">
        <h1>Application <span className="gold">Chauffeur</span></h1>
        <p>Merci de completer ce formulaire afin que notre equipe puisse evaluer votre profil.</p>
      </div>

      <div className="form-container">
        <form id="crForm" onSubmit={handleSubmit}>
          <div className="section-cards">
            {SECTIONS.map(section => (
              <div key={section.num} className="section-card reveal in">
                <div className="section-header">
                  <div className="section-num">{section.num}</div>
                  <div>
                    <div className="section-title">{section.title}</div>
                    <div className="section-sub">{section.sub}</div>
                  </div>
                </div>
                <div className="fields-grid">
                  {section.fields.map(f => (
                    <div key={f.name} className={`field${f.full ? ' full' : ''}${errors[f.name] ? ' has-error' : ''}`} data-field={f.name}>
                      <label>{f.label}{f.required && <span className="req"> *</span>}</label>
                      {f.type === 'select' && (
                        <select name={f.name} value={(data[f.name] as string) || ''} onChange={e => setValue(f.name, e.target.value)}>
                          <option value="">-- Choisir --</option>
                          {f.options?.map(o => <option key={o} value={o}>{o}</option>)}
                        </select>
                      )}
                      {(f.type === 'text' || f.type === 'tel' || f.type === 'email' || f.type === 'date') && (
                        <input type={f.type} name={f.name} placeholder={f.placeholder} value={(data[f.name] as string) || ''} onChange={e => setValue(f.name, e.target.value)} />
                      )}
                      {f.type === 'checkboxes' && (
                        <div className="choices">
                          {f.options?.map(o => (
                            <label key={o} className="choice">
                              <input type="checkbox" name={f.name} value={o} checked={((data[f.name] as string[]) || []).includes(o)} onChange={() => toggleCheck(f.name, o)} />
                              <span>{o}</span>
                            </label>
                          ))}
                        </div>
                      )}
                      {f.type === 'radios' && (
                        <div className="choices row">
                          {f.options?.map(o => (
                            <label key={o} className="choice">
                              <input type="radio" name={f.name} value={o} checked={(data[f.name] as string) === o} onChange={() => setValue(f.name, o)} />
                              <span>{o}</span>
                            </label>
                          ))}
                        </div>
                      )}
                      {errors[f.name] && <p className="field-error">{errors[f.name]}</p>}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="submit-section">
            <button type="submit" className="btn" style={{ width: '100%' }} disabled={status === 'sending'}>
              {status === 'sending' ? 'Envoi en cours...' : 'Soumettre ma candidature'}
            </button>
            {status === 'err' && <div className="form-msg err" style={{ display: 'block' }}>Une erreur est survenue. Veuillez reessayer.</div>}
            <p className="form-note">Seuls les candidats correspondant a nos besoins seront contactes. Votre information est confidentielle.</p>
          </div>
        </form>
      </div>
    </div>
  )
}
