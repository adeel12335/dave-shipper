'use client'
import { createContext, useContext, useState, useEffect } from 'react'

type Lang = 'fr' | 'en'
const LangContext = createContext<{ lang: Lang; setLang: (l: Lang) => void }>({ lang: 'fr', setLang: () => {} })

export function LangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>('fr')

  useEffect(() => {
    const saved = localStorage.getItem('lang') as Lang
    if (saved === 'fr' || saved === 'en') setLangState(saved)
  }, [])

  const setLang = (l: Lang) => {
    setLangState(l)
    localStorage.setItem('lang', l)
  }

  return <LangContext.Provider value={{ lang, setLang }}>{children}</LangContext.Provider>
}

export function useLang() { return useContext(LangContext) }

export const t: Record<Lang, Record<string, string>> = {
  fr: {
    cta: 'Postuler maintenant',
    tagline: 'LES BONS CHAUFFEURS. LES BONNES OPPORTUNITES.',
    heroTitle1: 'Les meilleurs',
    heroTitle2: 'Chauffeurs du Quebec',
    heroSub: 'Nous connectons les chauffeurs professionnels prescreenes aux meilleures entreprises de transport.',
    heroCta1: 'Postuler comme chauffeur',
    heroCta2: 'Trouver des chauffeurs',
    howTitle: 'Comment ca fonctionne',
    step1Title: 'Remplissez le formulaire',
    step1Desc: 'Quelques minutes suffisent pour completer votre profil de chauffeur.',
    step2Title: 'Nous evaluons votre profil',
    step2Desc: 'Notre equipe analyse votre experience et vos qualifications.',
    step3Title: 'Nous vous mettons en contact',
    step3Desc: 'Nous vous connectons avec des employeurs qui correspondent a votre profil.',
    whyTitle: 'Pourquoi TruckRecruit',
    why1: 'Pre-selection rigoureuse',
    why2: 'Placement rapide',
    why3: 'Support bilingue',
    why4: 'Reseau etabli',
    formTitle: 'Votre entreprise cherche des chauffeurs?',
    formSub: 'Laissez-nous vos coordonnees et notre equipe vous contactera rapidement.',
    formCompany: 'Nom de la compagnie',
    formName: 'Votre nom',
    formPhone: 'Telephone',
    formEmail: 'Courriel',
    formMessage: 'Besoin specifique (optionnel)',
    formSubmit: 'Envoyer ma demande',
    formSending: 'Envoi...',
    formSuccess: 'Merci! Nous vous contacterons bientot.',
    footerRights: 'Tous droits reserves.',
  },
  en: {
    cta: 'Apply now',
    tagline: 'THE RIGHT DRIVERS. THE RIGHT OPPORTUNITIES.',
    heroTitle1: 'The best',
    heroTitle2: 'Truck Drivers in Quebec',
    heroSub: 'We connect pre-screened professional drivers with top transport companies.',
    heroCta1: 'Apply as a driver',
    heroCta2: 'Find drivers',
    howTitle: 'How it works',
    step1Title: 'Fill out the form',
    step1Desc: 'A few minutes is all it takes to complete your driver profile.',
    step2Title: 'We review your profile',
    step2Desc: 'Our team analyzes your experience and qualifications.',
    step3Title: 'We connect you',
    step3Desc: 'We match you with employers that fit your profile.',
    whyTitle: 'Why TruckRecruit',
    why1: 'Rigorous pre-screening',
    why2: 'Fast placement',
    why3: 'Bilingual support',
    why4: 'Established network',
    formTitle: 'Looking for truck drivers?',
    formSub: 'Leave your contact info and our team will reach out quickly.',
    formCompany: 'Company name',
    formName: 'Your name',
    formPhone: 'Phone',
    formEmail: 'Email',
    formMessage: 'Specific need (optional)',
    formSubmit: 'Send my request',
    formSending: 'Sending...',
    formSuccess: 'Thank you! We will contact you soon.',
    footerRights: 'All rights reserved.',
  }
}
