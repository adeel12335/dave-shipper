'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useLang } from '@/lib/i18n'
import { DRIVER_FORM_SECTIONS, DRIVER_FORM_SUBMIT_NOTE } from '@/lib/forms/driver-form-schema'
import { localizeSections, t } from '@/lib/forms/form-utils'
import type { LocalizedField } from '@/lib/forms/types'

type FormData = Record<string, string | string[]>

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const COPY = {
  fr: {
    heroTitle: 'Application',
    heroGold: 'Chauffeur',
    heroSub: 'Remplissez ce formulaire pour nous presenter votre profil. C est la premiere etape — si vous correspondez a nos besoins, nous vous enverrons ensuite le lien d onboarding.',
    flowNote: 'Etape 1 : candidature en ligne. Etape 2 : evaluation par notre equipe. Etape 3 : lien d onboarding envoye aux candidats retenus.',
    progress: (n: number, total: number) => `ETAPE ${n} / ${total}`,
    stepHint: (title: string) => `Section en cours : ${title}`,
    next: 'Suivant',
    prev: 'Precedent',
    submit: 'Soumettre ma candidature',
    sending: 'Envoi en cours...',
    err: 'Une erreur est survenue. Veuillez reessayer.',
    required: 'Ce champ est requis',
    invalidEmail: 'Adresse courriel invalide',
    invalidPhone: 'Minimum 10 chiffres requis',
    successTitle: 'Candidature',
    successGold: 'recue!',
    successSub: 'Merci! Notre equipe evaluera votre profil dans les 24-48 heures. Si vous etes retenu, nous vous enverrons le lien pour les prochaines etapes d onboarding.',
    back: "Retour a l'accueil",
    select: '-- Choisir --',
  },
  en: {
    heroTitle: 'Driver',
    heroGold: 'Application',
    heroSub: 'Complete this form to introduce your profile. This is step one — if you are a good fit, we will send you the onboarding link next.',
    flowNote: 'Step 1: online application. Step 2: review by our team. Step 3: onboarding link sent to selected candidates.',
    progress: (n: number, total: number) => `STEP ${n} / ${total}`,
    stepHint: (title: string) => `Current section: ${title}`,
    next: 'Next',
    prev: 'Previous',
    submit: 'Submit my application',
    sending: 'Sending...',
    err: 'An error occurred. Please try again.',
    required: 'This field is required',
    invalidEmail: 'Invalid email address',
    invalidPhone: 'Minimum 10 digits required',
    successTitle: 'Application',
    successGold: 'received!',
    successSub: 'Thank you! Our team will review your profile within 24-48 hours. If you are selected, we will send you the link for the next onboarding steps.',
    back: 'Back to home',
    select: '-- Select --',
  },
}

export default function DriverFormPage() {
  const { lang } = useLang()
  const [data, setData] = useState<FormData>({})
  const [status, setStatus] = useState<'idle' | 'sending' | 'ok' | 'err'>('idle')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [step, setStep] = useState(0)

  const tx = COPY[lang]
  const sections = localizeSections(DRIVER_FORM_SECTIONS, lang)
  const sectionCount = sections.length
  const section = sections[step]
  const isLast = step === sectionCount - 1
  const progressPct = Math.round(((step + 1) / sectionCount) * 100)

  const setValue = (name: string, value: string | string[]) => {
    setData((d) => ({ ...d, [name]: value }))
    if (errors[name]) setErrors((e) => ({ ...e, [name]: '' }))
  }

  const toggleCheck = (name: string, val: string) => {
    const cur = (data[name] as string[]) || []
    setValue(name, cur.includes(val) ? cur.filter((v) => v !== val) : [...cur, val])
  }

  const validateFields = (fields: LocalizedField[]) => {
    const e: Record<string, string> = {}
    for (const f of fields) {
      const val = data[f.name]
      if (f.required) {
        if (f.type === 'checkboxes') {
          if (!Array.isArray(val) || val.length === 0) e[f.name] = tx.required
        } else if (!val || (typeof val === 'string' && !val.trim())) {
          e[f.name] = tx.required
        }
      }
      if (f.type === 'email' && data[f.name] && !EMAIL_RE.test(data[f.name] as string)) {
        e[f.name] = tx.invalidEmail
      }
      if (f.type === 'tel' && data[f.name]) {
        const digits = (data[f.name] as string).replace(/\D/g, '')
        if (digits.length < 10) e[f.name] = tx.invalidPhone
      }
    }
    return e
  }

  const validateSection = (index: number) => {
    const sectionErrors = validateFields(sections[index].fields)
    setErrors((prev) => {
      const next = { ...prev }
      sections[index].fields.forEach((f) => delete next[f.name])
      return { ...next, ...sectionErrors }
    })
    return Object.keys(sectionErrors).length === 0
  }

  const goToStep = (next: number) => {
    setStep(next)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleNext = () => {
    if (!validateSection(step)) {
      document.querySelector('[data-field].has-error')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }
    goToStep(step + 1)
  }

  const handleBack = () => goToStep(step - 1)

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault()
    const allErrors: Record<string, string> = {}
    sections.forEach((s) => Object.assign(allErrors, validateFields(s.fields)))
    setErrors(allErrors)
    if (Object.keys(allErrors).length > 0) {
      const firstErrName = Object.keys(allErrors)[0]
      const errStep = sections.findIndex((s) => s.fields.some((f) => f.name === firstErrName))
      if (errStep >= 0) goToStep(errStep)
      return
    }
    setStatus('sending')
    try {
      const res = await fetch('/api/driver-applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, locale: lang }),
      })
      if (!res.ok) throw new Error()
      setStatus('ok')
    } catch {
      setStatus('err')
    }
  }

  const renderField = (f: LocalizedField) => (
    <div key={f.name} className={`field${f.full ? ' full' : ''}${errors[f.name] ? ' has-error' : ''}`} data-field={f.name}>
      <label>{f.label}{f.required && <span className="req"> *</span>}</label>

      {f.type === 'select' && (
        <select name={f.name} value={(data[f.name] as string) || ''} onChange={(e) => setValue(f.name, e.target.value)}>
          <option value="">{tx.select}</option>
          {f.options?.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      )}

      {(f.type === 'text' || f.type === 'tel' || f.type === 'email' || f.type === 'date') && (
        <input
          type={f.type}
          name={f.name}
          placeholder={f.placeholder}
          value={(data[f.name] as string) || ''}
          onChange={(e) => setValue(f.name, e.target.value)}
        />
      )}

      {f.type === 'textarea' && (
        <textarea
          name={f.name}
          rows={4}
          placeholder={f.placeholder}
          value={(data[f.name] as string) || ''}
          onChange={(e) => setValue(f.name, e.target.value)}
        />
      )}

      {f.type === 'checkboxes' && (
        <div className={`choices${(f.options?.length ?? 0) > 6 ? ' choices-wide' : ''}`}>
          {f.options?.map((o) => (
            <label key={o.value} className="choice">
              <input
                type="checkbox"
                checked={((data[f.name] as string[]) || []).includes(o.value)}
                onChange={() => toggleCheck(f.name, o.value)}
              />
              <span>{o.label}</span>
            </label>
          ))}
        </div>
      )}

      {f.type === 'radios' && (
        <div className="choices row">
          {f.options?.map((o) => (
            <label key={o.value} className="choice">
              <input
                type="radio"
                name={f.name}
                value={o.value}
                checked={(data[f.name] as string) === o.value}
                onChange={() => setValue(f.name, o.value)}
              />
              <span>{o.label}</span>
            </label>
          ))}
        </div>
      )}

      {errors[f.name] && <p className="field-error">{errors[f.name]}</p>}
    </div>
  )

  if (status === 'ok') {
    return (
      <div className="form-page">
        <section className="form-top">
          <div className="wrap">
            <h1 className="h2">{tx.successTitle} <span className="gold">{tx.successGold}</span></h1>
            <div className="underline"></div>
            <p className="form-hero-sub">{tx.successSub}</p>
          </div>
        </section>
        <div className="form-container" style={{ textAlign: 'center' }}>
          <Link href="/" className="btn">{tx.back}</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="form-page">
      <section className="form-top">
        <div className="wrap">
          <h1 className="h2">{tx.heroTitle} <span className="gold">{tx.heroGold}</span></h1>
          <div className="eyebrow">{tx.progress(step + 1, sectionCount)}</div>
          <div className="underline"></div>
          <p className="form-hero-sub">{tx.heroSub}</p>
        </div>
      </section>

      <div className="form-container">
        <div className="progress">
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progressPct}%` }} />
          </div>
        </div>

        <form id="crForm" onSubmit={handleSubmit}>
          <div className="section-cards">
            <div key={section.num} className="section-card reveal in">
              <div className="section-header">
                <div className="section-num">{section.num}</div>
                <div>
                  <div className="section-title">{section.title}</div>
                  <div className="section-sub">{section.sub}</div>
                </div>
              </div>
              <div className="fields-grid">
                {section.fields.map(renderField)}
              </div>
            </div>
          </div>

          <div className="wizard-nav">
            {step > 0 ? (
              <button type="button" className="btn-wizard-back" onClick={handleBack}>{tx.prev}</button>
            ) : (
              <span className="wizard-step-count">{tx.progress(step + 1, sectionCount)}</span>
            )}
            <div className="wizard-nav-spacer" />
            {!isLast ? (
              <button type="button" className="btn btn-wizard-next" onClick={handleNext}>{tx.next}</button>
            ) : (
              <button type="submit" className="btn btn-wizard-next" disabled={status === 'sending'}>
                {status === 'sending' ? tx.sending : tx.submit}
              </button>
            )}
          </div>

          {status === 'err' && <div className="form-msg err" style={{ display: 'block', marginTop: 16 }}>{tx.err}</div>}
          {isLast && <p className="form-note" style={{ marginTop: 16 }}>{t(DRIVER_FORM_SUBMIT_NOTE, lang)}</p>}
        </form>
      </div>
    </div>
  )
}
