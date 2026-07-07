'use client'
import Link from 'next/link'
import Image from 'next/image'
import { useLang } from '@/lib/i18n'

export default function FormBrandBar() {
  const { lang, setLang } = useLang()
  const tagline = lang === 'fr'
    ? 'LES BONS CHAUFFEURS. LES BONNES OPPORTUNITÉS.'
    : 'THE RIGHT DRIVERS. THE RIGHT OPPORTUNITIES.'

  return (
    <div className="form-brand-bar">
      <div className="wrap form-brand-inner">
        <Link href="/" className="form-brand-logo" aria-label="TruckRecruit.com">
          <Image src="/images/logo-truckrecruit.png" alt="TruckRecruit.com" width={425} height={100} priority style={{ height: '38px', width: 'auto' }} />
        </Link>
        <div className="form-brand-right">
          <span className="form-brand-tag">{tagline}</span>
          <button type="button" className="lang-btn" onClick={() => setLang(lang === 'fr' ? 'en' : 'fr')}>
            {lang === 'fr' ? 'EN' : 'FR'}
          </button>
        </div>
      </div>
    </div>
  )
}
