'use client'
import Link from 'next/link'
import Image from 'next/image'
import { useLang } from '@/lib/i18n'

export default function FormBrandBar() {
  const { lang, setLang } = useLang()

  return (
    <div className="form-brand-bar">
      <div className="wrap form-brand-inner">
        <Link href="/" className="form-brand-logo" aria-label="TruckRecruit.com">
          <Image
            src="/images/logo-truckrecruit.png"
            alt="TruckRecruit.com"
            width={1024}
            height={307}
            priority
            className="brand-logo"
          />
        </Link>
        <div className="form-brand-right">
          <button type="button" className="lang-btn" onClick={() => setLang(lang === 'fr' ? 'en' : 'fr')}>
            {lang === 'fr' ? 'EN' : 'FR'}
          </button>
        </div>
      </div>
    </div>
  )
}
