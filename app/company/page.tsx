'use client'

import { useEffect, useState } from 'react'
import { useLang } from '@/lib/i18n'
import './company.css'

type FormState = {
  company_name: string
  contact_name: string
  phone: string
  email: string
  position_type: string
  region: string
  details: string
}

const EMPTY: FormState = {
  company_name: '',
  contact_name: '',
  phone: '',
  email: '',
  position_type: '',
  region: '',
  details: '',
}

const COPY = {
  fr: {
    heroTitleBefore: 'Trouvez des',
    heroTitleGold: 'chauffeurs qualifies',
    heroTitleAfter: 'pour vos besoins',
    heroSub:
      'TruckRecruit.com connecte les entreprises de transport aux meilleurs chauffeurs qualifies du Quebec. Simple, confidentiel et gratuit.',
    ctaFind: 'Trouver mes chauffeurs',
    ctaProcess: 'Voir comment ca marche',
    trust1: 'Talents preselectionnes',
    trust2: 'Appariement rapide',
    trust3: 'Processus transparent',
    heroStatTitle: 'Correspondances qualifies',
    heroStatSub: 'Selon votre trajet, horaire et besoins de flotte.',
    whyTitle: 'Pourquoi choisir TruckRecruit.com?',
    whyEyebrow: 'Notre difference',
    feat1Title: 'Tarification juste et transparente',
    feat1Desc: 'Aucun pourcentage sur le salaire. Aucune surprise. Un prix clair et fixe.',
    feat2Title: 'Candidats preselectionnes',
    feat2Desc:
      'Nous envoyons des candidats qui correspondent a vos criteres : classe de permis, experience, region et type de poste.',
    feat3Title: 'Expertise du secteur',
    feat3Desc:
      'Notre equipe comprend les realites du transport et les qualites d un excellent chauffeur.',
    processTitle: 'Comment ca fonctionne?',
    processEyebrow: '4 etapes simples',
    step1Title: 'Vous nous contactez',
    step1Desc: 'Remplissez le formulaire avec vos besoins : type de poste, classe de permis et region.',
    step2Title: 'Nous analysons vos besoins',
    step2Desc: 'Notre equipe evalue votre demande et cherche dans notre reseau de candidats.',
    step3Title: 'Nous vous envoyons les profils',
    step3Desc: 'Vous recevez des candidats preselectionnes qui correspondent exactement a vos criteres.',
    step4Title: 'Vous embauchez le bon chauffeur',
    step4Desc: 'Vous choisissez votre candidat et mettez votre chauffeur sur la route — rapidement.',
    contactLabel: 'Formulaire de contact',
    contactTitle: 'Trouvez vos chauffeurs maintenant',
    contactSub:
      'Dites-nous ce dont vous avez besoin. Notre equipe vous contactera sous 24 heures pour discuter de vos besoins de recrutement.',
    point1Title: 'Reponse rapide',
    point1Desc: 'Nous examinons les demandes dans un delai d un jour ouvrable.',
    point2Title: 'Confidentiel',
    point2Desc: 'Les details de votre entreprise et de recrutement restent prives.',
    labelCompany: 'Nom de l entreprise',
    labelName: 'Nom du contact',
    labelPhone: 'Telephone',
    labelEmail: 'Courriel',
    labelJob: 'Type de poste',
    labelRegion: 'Region',
    labelDetails: 'Details supplementaires',
    phCompany: 'Nom de votre entreprise',
    phName: 'Votre nom complet',
    phPhone: '(514) 555-1234',
    phEmail: 'vous@exemple.com',
    phDetails: 'Horaire, equipement, exigences specifiques...',
    jobChoose: 'Choisir un poste',
    regionChoose: 'Choisir une region',
    jobs: [
      'Longue distance — Classe 1',
      'Livraison locale — Classe 1',
      'Chauffeur-livreur — Classe 3',
      'Proprietaire-exploitant',
      'Autre',
    ],
    regions: [
      'Montreal et environs',
      'Quebec',
      'Monteregie',
      'Laval / Laurentides',
      'Autre region du Quebec',
    ],
    submit: 'Soumettre ma demande',
    sending: 'Envoi en cours...',
    note: 'En soumettant ce formulaire, vous acceptez d etre contacte au sujet de votre demande de recrutement.',
    success: 'Merci! Votre demande a bien ete recue. Nous vous contacterons sous 24h.',
    error: 'Une erreur est survenue. Veuillez reessayer ou nous appeler.',
    invalid: 'Veuillez remplir correctement tous les champs obligatoires.',
  },
  en: {
    heroTitleBefore: 'Find qualified',
    heroTitleGold: 'drivers for',
    heroTitleAfter: 'your needs',
    heroSub:
      'TruckRecruit.com connects transportation companies with the best qualified drivers in Quebec. It\'s simple, confidential and free.',
    ctaFind: 'Find My Drivers',
    ctaProcess: 'See how it works',
    trust1: 'Pre-screened talent',
    trust2: 'Fast matching',
    trust3: 'Transparent process',
    heroStatTitle: 'Qualified matches',
    heroStatSub: 'Built around your route, schedule and fleet needs.',
    whyTitle: 'Why choose TruckRecruit.com?',
    whyEyebrow: 'Our difference',
    feat1Title: 'Fair and transparent pricing',
    feat1Desc: 'No percentage on salary. No surprises. A clear, upfront price.',
    feat2Title: 'Pre-screened candidates',
    feat2Desc:
      'We send candidates who match your criteria: licence class, experience, region and job type.',
    feat3Title: 'Industry expertise',
    feat3Desc:
      'Our team understands the realities of transportation and the qualities of a great driver.',
    processTitle: 'How it works?',
    processEyebrow: '4 simple steps',
    step1Title: 'You contact us',
    step1Desc: 'Fill out the form with your needs: job type, licence class and region.',
    step2Title: 'We analyze your needs',
    step2Desc: 'Our team evaluates your request and searches our candidate network.',
    step3Title: 'We send you the profiles',
    step3Desc: 'You receive pre-screened candidates who match your criteria exactly.',
    step4Title: 'You hire the right driver',
    step4Desc: 'You choose your candidate and put your driver on the road—fast.',
    contactLabel: 'Contact form',
    contactTitle: 'Find your drivers now',
    contactSub:
      'Tell us what you need. Our team will contact you within 24 hours to discuss your hiring requirements.',
    point1Title: 'Fast response',
    point1Desc: 'We review requests within one business day.',
    point2Title: 'Confidential',
    point2Desc: 'Your company and hiring details stay private.',
    labelCompany: 'Company name',
    labelName: 'Contact name',
    labelPhone: 'Phone number',
    labelEmail: 'Email',
    labelJob: 'Job type',
    labelRegion: 'Region',
    labelDetails: 'Additional details',
    phCompany: 'Your company name',
    phName: 'Your full name',
    phPhone: '(514) 555-1234',
    phEmail: 'you@example.com',
    phDetails: 'Schedule, equipment, specific requirements...',
    jobChoose: 'Choose a position',
    regionChoose: 'Choose a region',
    jobs: [
      'Long haul — Class 1',
      'Local delivery — Class 1',
      'Delivery driver — Class 3',
      'Owner-operator',
      'Other',
    ],
    regions: [
      'Montreal and surrounding areas',
      'Quebec City',
      'Monteregie',
      'Laval / Laurentides',
      'Other Quebec region',
    ],
    submit: 'Submit My Request',
    sending: 'Sending...',
    note: 'By submitting this form, you agree to be contacted about your recruitment request.',
    success: 'Thank you! Your request has been received. We will contact you within 24 hours.',
    error: 'An error occurred. Please try again or call us.',
    invalid: 'Please complete all required fields correctly.',
  },
}

export default function CompanyLandingPage() {
  const { lang } = useLang()
  const tx = COPY[lang]
  const [form, setForm] = useState<FormState>(EMPTY)
  const [invalid, setInvalid] = useState<Record<string, boolean>>({})
  const [status, setStatus] = useState<'idle' | 'sending' | 'ok' | 'err' | 'invalid'>('idle')
  const [showTop, setShowTop] = useState(false)

  useEffect(() => {
    const els = document.querySelectorAll('.company-landing .cp-reveal')
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced || !('IntersectionObserver' in window)) {
      els.forEach((el) => el.classList.add('is-visible'))
      return
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible')
            io.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.14, rootMargin: '0px 0px -35px' },
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [lang])

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 520)
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const setField = (name: keyof FormState, value: string) => {
    setForm((f) => ({ ...f, [name]: value }))
    setInvalid((inv) => ({ ...inv, [name]: false }))
    if (status === 'invalid' || status === 'err') setStatus('idle')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const required: (keyof FormState)[] = [
      'company_name',
      'contact_name',
      'phone',
      'email',
      'position_type',
      'region',
    ]
    const nextInvalid: Record<string, boolean> = {}
    let firstBad: string | null = null
    for (const key of required) {
      const val = form[key].trim()
      const bad =
        !val ||
        (key === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) ||
        (key === 'phone' && val.replace(/\D/g, '').length < 10)
      if (bad) {
        nextInvalid[key] = true
        if (!firstBad) firstBad = key
      }
    }
    setInvalid(nextInvalid)
    if (firstBad) {
      setStatus('invalid')
      document.querySelector<HTMLElement>(`[name="${firstBad}"]`)?.focus()
      return
    }

    setStatus('sending')
    const messageParts = [
      form.position_type && `Job type: ${form.position_type}`,
      form.region && `Region: ${form.region}`,
      form.details.trim() && form.details.trim(),
    ].filter(Boolean)

    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company_name: form.company_name.trim(),
          contact_name: form.contact_name.trim(),
          phone: form.phone.trim(),
          email: form.email.trim(),
          message: messageParts.join('\n') || null,
          position_type: form.position_type,
          region: form.region,
          locale: lang,
        }),
      })
      if (!res.ok) throw new Error()
      setStatus('ok')
      setForm(EMPTY)
    } catch {
      setStatus('err')
    }
  }

  const fieldClass = (name: keyof FormState) => (invalid[name] ? 'is-invalid' : undefined)

  return (
    <div className="company-landing">
      <main>
        <section className="hero" aria-labelledby="company-hero-title">
          <div className="shell hero-grid">
            <div className="hero-copy cp-reveal">
              <h1 id="company-hero-title">
                {tx.heroTitleBefore} <span>{tx.heroTitleGold}</span> {tx.heroTitleAfter}
              </h1>
              <p>{tx.heroSub}</p>
              <div className="hero-actions">
                <a className="button button-gold button-large" href="#contact">
                  {tx.ctaFind}
                </a>
                <a className="text-link" href="#process">
                  {tx.ctaProcess} <span aria-hidden="true">→</span>
                </a>
              </div>
              <div className="trust-line" aria-label="Service advantages">
                <span>{tx.trust1}</span>
                <span>{tx.trust2}</span>
                <span>{tx.trust3}</span>
              </div>
            </div>
          </div>
        </section>

        <section className="difference section-dark" id="difference">
          <div className="shell">
            <div className="section-heading section-heading-light cp-reveal">
              <h2>{tx.whyTitle}</h2>
              <p>{tx.whyEyebrow}</p>
            </div>
            <div className="feature-grid">
              <article className="feature-card cp-reveal">
                <div className="feature-icon">
                  <img src="/company/feature-pricing.png" alt="" />
                </div>
                <h3>{tx.feat1Title}</h3>
                <p>{tx.feat1Desc}</p>
              </article>
              <article className="feature-card cp-reveal">
                <div className="feature-icon">
                  <img src="/company/feature-candidates.png" alt="" />
                </div>
                <h3>{tx.feat2Title}</h3>
                <p>{tx.feat2Desc}</p>
              </article>
              <article className="feature-card cp-reveal">
                <div className="feature-icon">
                  <img src="/company/feature-expertise.png" alt="" />
                </div>
                <h3>{tx.feat3Title}</h3>
                <p>{tx.feat3Desc}</p>
              </article>
            </div>
          </div>
        </section>

        <section className="process" id="process">
          <div className="shell">
            <div className="section-heading cp-reveal">
              <h2>{tx.processTitle}</h2>
              <p>{tx.processEyebrow}</p>
            </div>
            <ol className="process-grid">
              {[
                { img: '/company/process-1.webp', title: tx.step1Title, desc: tx.step1Desc },
                { img: '/company/process-2.webp', title: tx.step2Title, desc: tx.step2Desc },
                { img: '/company/process-3.webp', title: tx.step3Title, desc: tx.step3Desc },
                { img: '/company/process-4.webp', title: tx.step4Title, desc: tx.step4Desc },
              ].map((step, i) => (
                <li key={step.title} className="process-step cp-reveal">
                  <span className="step-number">{i + 1}</span>
                  {i < 3 && <div className="step-line" aria-hidden="true" />}
                  <img src={step.img} alt="" />
                  <h3>{step.title}</h3>
                  <p>{step.desc}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="contact-section section-dark" id="contact">
          <div className="shell contact-layout">
            <div className="contact-copy cp-reveal">
              <p className="section-label">{tx.contactLabel}</p>
              <h2>{tx.contactTitle}</h2>
              <p>{tx.contactSub}</p>
              <div className="contact-points">
                <div>
                  <strong>{tx.point1Title}</strong>
                  <span>{tx.point1Desc}</span>
                </div>
                <div>
                  <strong>{tx.point2Title}</strong>
                  <span>{tx.point2Desc}</span>
                </div>
              </div>
            </div>

            <form className="lead-form cp-reveal" onSubmit={handleSubmit} noValidate>
              <div className="form-grid">
                <label>
                  <span>{tx.labelCompany}</span>
                  <input
                    name="company_name"
                    type="text"
                    autoComplete="organization"
                    placeholder={tx.phCompany}
                    required
                    value={form.company_name}
                    className={fieldClass('company_name')}
                    onChange={(e) => setField('company_name', e.target.value)}
                  />
                </label>
                <label>
                  <span>{tx.labelName}</span>
                  <input
                    name="contact_name"
                    type="text"
                    autoComplete="name"
                    placeholder={tx.phName}
                    required
                    value={form.contact_name}
                    className={fieldClass('contact_name')}
                    onChange={(e) => setField('contact_name', e.target.value)}
                  />
                </label>
                <label>
                  <span>{tx.labelPhone}</span>
                  <input
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    placeholder={tx.phPhone}
                    required
                    value={form.phone}
                    className={fieldClass('phone')}
                    onChange={(e) => setField('phone', e.target.value)}
                  />
                </label>
                <label>
                  <span>{tx.labelEmail}</span>
                  <input
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder={tx.phEmail}
                    required
                    value={form.email}
                    className={fieldClass('email')}
                    onChange={(e) => setField('email', e.target.value)}
                  />
                </label>
                <label>
                  <span>{tx.labelJob}</span>
                  <select
                    name="position_type"
                    required
                    value={form.position_type}
                    className={fieldClass('position_type')}
                    onChange={(e) => setField('position_type', e.target.value)}
                  >
                    <option value="">{tx.jobChoose}</option>
                    {tx.jobs.map((j) => (
                      <option key={j} value={j}>
                        {j}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  <span>{tx.labelRegion}</span>
                  <select
                    name="region"
                    required
                    value={form.region}
                    className={fieldClass('region')}
                    onChange={(e) => setField('region', e.target.value)}
                  >
                    <option value="">{tx.regionChoose}</option>
                    {tx.regions.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="full-width">
                  <span>{tx.labelDetails}</span>
                  <textarea
                    name="details"
                    rows={4}
                    placeholder={tx.phDetails}
                    value={form.details}
                    onChange={(e) => setField('details', e.target.value)}
                  />
                </label>
              </div>
              <button
                className="button button-gold button-submit"
                type="submit"
                disabled={status === 'sending'}
              >
                {status === 'sending' ? tx.sending : tx.submit}
              </button>
              <p className="form-note">{tx.note}</p>
              <div
                className={`form-status${status === 'ok' ? ' success' : ''}${status === 'err' || status === 'invalid' ? ' error' : ''}`}
                role="status"
                aria-live="polite"
              >
                {status === 'ok' && tx.success}
                {status === 'err' && tx.error}
                {status === 'invalid' && tx.invalid}
              </div>
            </form>
          </div>
        </section>
      </main>

      <button
        className={`back-to-top${showTop ? ' visible' : ''}`}
        type="button"
        aria-label="Back to top"
        onClick={() =>
          window.scrollTo({
            top: 0,
            behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
              ? 'auto'
              : 'smooth',
          })
        }
      >
        ↑
      </button>
    </div>
  )
}
