'use client'
import Link from 'next/link'
import { useState, useEffect } from 'react'

function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll('.reveal')
    if (!('IntersectionObserver' in window)) { els.forEach((e) => e.classList.add('in')); return }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target) } })
    }, { threshold: 0.12 })
    els.forEach((e) => io.observe(e))
    return () => io.disconnect()
  }, [])
}

export default function HomePage() {
  useReveal()
  const [form, setForm] = useState({ company_name: '', contact_name: '', phone: '', email: '', region: '', drivers_count: '1', position_type: 'Classe 1 - Longue distance', message: '' })
  const [status, setStatus] = useState('idle')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('sending')
    try {
      const res = await fetch('/api/leads', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, locale: 'fr' }) })
      if (!res.ok) throw new Error()
      setStatus('ok')
      setForm({ company_name: '', contact_name: '', phone: '', email: '', region: '', drivers_count: '1', position_type: 'Classe 1 - Longue distance', message: '' })
    } catch { setStatus('err') }
  }

  return (
    <>
      {/* HERO */}
      <section className="hero" style={{ padding: 0 }}>
        <div className="wrap">
          <div className="hero-inner">
            <h1>
              <span>Trouvez votre</span><br />
              <span className="gold line2">prochaine opportunite</span>
            </h1>
            <p>CamionRecrute.com connecte les meilleurs chauffeurs professionnels aux meilleures entreprises du Quebec.</p>
            <Link href="#apply" className="btn">
              <span>Deposer ma candidature</span>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
            </Link>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="light" id="how">
        <div className="wrap">
          <h2 className="h2 reveal">Comment ca fonctionne?</h2>
          <div className="eyebrow reveal">3 ETAPES SIMPLES</div>
          <div className="underline reveal"></div>
          <div className="steps">
            <div className="step reveal">
              <div className="step-circle">
                <div className="step-num">1</div>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#14222f" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><circle cx="10" cy="13" r="2" /><path d="M8 18c0-1.5 1-2.5 2-2.5s2 1 2 2.5" /></svg>
              </div>
              <h3>Remplissez le formulaire</h3>
              <p>Partagez votre experience, votre classe de permis et vos preferences de poste.</p>
            </div>
            <div className="arrow">
              <svg width="56" height="24" viewBox="0 0 56 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="2" y1="12" x2="44" y2="12" strokeDasharray="6 7" /><polyline points="42 6 52 12 42 18" /></svg>
            </div>
            <div className="step reveal">
              <div className="step-circle">
                <div className="step-num">2</div>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#14222f" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="8" r="4" /><path d="M5 21v-1a6 6 0 0 1 9-5.2" /><circle cx="17" cy="17" r="3" /><line x1="19.5" y1="19.5" x2="22" y2="22" /></svg>
              </div>
              <h3>On analyse votre profil</h3>
              <p>Notre equipe evalue votre candidature et identifie les meilleures opportunites pour vous.</p>
            </div>
            <div className="arrow">
              <svg width="56" height="24" viewBox="0 0 56 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="2" y1="12" x2="44" y2="12" strokeDasharray="6 7" /><polyline points="42 6 52 12 42 18" /></svg>
            </div>
            <div className="step reveal">
              <div className="step-circle">
                <div className="step-num">3</div>
                <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="#14222f" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M3 11l3-3 3 3M9 11l3 3 3-3 3 3" /><path d="M21 13l-4 4-2-2" /></svg>
              </div>
              <h3>On vous place</h3>
              <p>Nous vous mettons en contact avec les entreprises qui correspondent a votre profil.</p>
            </div>
          </div>
        </div>
      </section>

      {/* WHY */}
      <section className="dark">
        <div className="wrap">
          <h2 className="h2 reveal">Pourquoi choisir CamionRecrute.com?</h2>
          <div className="eyebrow reveal">NOTRE DIFFERENCE</div>
          <div className="underline reveal"></div>
          <div className="cards">
            <div className="card reveal">
              <div className="card-icon"><svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M1 7h11v9H1z" /><path d="M12 10h5l3 3v3h-8z" /><circle cx="5" cy="18" r="1.6" /><circle cx="16" cy="18" r="1.6" /></svg></div>
              <h3>Specialise transport</h3>
              <p>100% dedie au recrutement de chauffeurs. Classe 1, 3, livraison, longue distance.</p>
            </div>
            <div className="card reveal">
              <div className="card-icon"><svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg></div>
              <h3>Rapide et efficace</h3>
              <p>Processus simplifie. Remplissez le formulaire en 5 minutes et notre equipe vous contacte rapidement.</p>
            </div>
            <div className="card reveal">
              <div className="card-icon"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg></div>
              <h3>Confidentiel</h3>
              <p>Votre candidature est traitee avec discretion. Vos informations ne sont jamais partagees sans votre consentement.</p>
            </div>
          </div>
        </div>
      </section>

      {/* APPLY CTA */}
      <section className="light cta" id="apply">
        <div className="wrap">
          <h2 className="h2 reveal">Postulez maintenant</h2>
          <div className="eyebrow reveal">C EST GRATUIT ET SANS ENGAGEMENT</div>
          <div className="underline reveal"></div>
          <p className="reveal">Remplissez le formulaire ci-dessous. Notre equipe vous contactera dans les 24-48 heures.</p>
          <Link href="/forms/driver-form" className="btn reveal">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></svg>
            <span>Acceder au formulaire de candidature</span>
          </Link>
        </div>
      </section>

      {/* COMPANY LEAD FORM */}
      <section className="lead" id="companies">
        <div className="wrap">
          <h2 className="h2 reveal">Vous etes une entreprise?</h2>
          <div className="eyebrow reveal">TROUVEZ VOTRE PROCHAIN CHAUFFEUR</div>
          <div className="underline reveal"></div>
          <p className="intro reveal">Remplissez ce court formulaire. On vous rappelle pour comprendre vos besoins, puis on vous envoie le formulaire detaille.</p>
          <form className="lead-form reveal" onSubmit={handleSubmit} noValidate>
            <div className="grid2">
              <div className="field"><label>Nom de l entreprise</label><input name="company_name" required value={form.company_name} onChange={handleChange} /></div>
              <div className="field"><label>Nom du contact</label><input name="contact_name" required value={form.contact_name} onChange={handleChange} /></div>
            </div>
            <div className="grid2">
              <div className="field"><label>Telephone</label><input name="phone" type="tel" required value={form.phone} onChange={handleChange} /></div>
              <div className="field"><label>Courriel</label><input name="email" type="email" required value={form.email} onChange={handleChange} /></div>
            </div>
            <div className="grid2">
              <div className="field"><label>Ville / Region</label><input name="region" value={form.region} onChange={handleChange} /></div>
              <div className="field"><label>Nombre de chauffeurs</label>
                <select name="drivers_count" value={form.drivers_count} onChange={handleChange}>
                  <option>1</option><option>2-3</option><option>4-5</option><option>6-10</option><option>10+</option>
                </select>
              </div>
            </div>
            <div className="field"><label>Type de poste recherche</label>
              <select name="position_type" value={form.position_type} onChange={handleChange}>
                <option>Classe 1 - Longue distance</option><option>Classe 1 - Local/Regional</option>
                <option>Classe 3</option><option>Shunter</option><option>Livreur</option><option>Autre</option>
              </select>
            </div>
            <div className="field"><label>Votre besoin (optionnel)</label><textarea name="message" value={form.message} onChange={handleChange}></textarea></div>
            <button type="submit" className="btn" style={{ width: '100%' }} disabled={status === 'sending'}>
              {status === 'sending' ? 'Envoi en cours...' : 'Envoyer ma demande'}
            </button>
            {status === 'ok' && <div className="form-msg ok" style={{ display: 'block' }}>Merci! Nous avons bien recu votre demande et vous contacterons sous 24h.</div>}
            {status === 'err' && <div className="form-msg err" style={{ display: 'block' }}>Une erreur est survenue. Veuillez reessayer ou nous appeler.</div>}
          </form>
        </div>
      </section>
    </>
  )
}
