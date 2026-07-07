import Link from 'next/link'
import Image from 'next/image'
import type { FormLang } from '@/lib/forms/types'

type Props = {
  lang: FormLang
  onToggleLang?: () => void
}

export default function FormBrandBar({ lang, onToggleLang }: Props) {
  const tagline = lang === 'fr'
    ? 'LES BONS CHAUFFEURS. LES BONNES OPPORTUNITÉS.'
    : 'THE RIGHT DRIVERS. THE RIGHT OPPORTUNITIES.'

  return (
    <div className="form-brand-bar">
      <div className="wrap form-brand-inner">
        <Link href="/" className="form-brand-logo">
          <Image src="/images/logo-truckrecruit.png" alt="TruckRecruit.com" width={425} height={100} style={{ height: '34px', width: 'auto' }} />
        </Link>
        <div className="form-brand-right">
          <span className="form-brand-tag">{tagline}</span>
          {onToggleLang && (
            <button type="button" className="lang-btn" onClick={onToggleLang}>
              {lang === 'fr' ? 'EN' : 'FR'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
