'use client'
import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import { useLang, t } from '@/lib/i18n'

export default function Header() {
  const barRef = useRef<HTMLElement>(null)
  const { lang, setLang } = useLang()
  const tx = t[lang]
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => {
      if (!barRef.current) return
      if (window.scrollY > 60) barRef.current.classList.add('scrolled')
      else barRef.current.classList.remove('scrolled')
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Lock body scroll when menu open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  const navLinks = [
    { href: '/#apply', label: lang === 'fr' ? 'Postuler' : 'Apply' },
    { href: '/#companies', label: lang === 'fr' ? 'Entreprises' : 'Companies' },
  ]

  return (
    <>
      <header className="topbar" ref={barRef}>
        <div className="wrap nav">
          {/* Logo + brand */}
          <Link href="/" className="brand" onClick={() => setMenuOpen(false)}>
            <Image src="/images/logo-removebg-preview.png" alt="CR" width={52} height={52} style={{ height: '52px', width: 'auto', flexShrink: 0 }} />
            <div className="brand-text">
              <span className="brand-name">CAMION<span className="brand-gold">RECRUTE</span>.COM</span>
              <span className="brand-tag">{tx.tagline}</span>
            </div>
          </Link>

          {/* Desktop actions */}
          <div className="nav-actions desktop-nav">
            <div className="desktop-nav-links">
              <Link href="/#apply" className="desktop-nav-link">
                {lang === 'fr' ? 'Postuler' : 'Apply'}
              </Link>
              <Link href="/#companies" className="desktop-nav-link">
                {lang === 'fr' ? 'Entreprises' : 'Companies'}
              </Link>
            </div>
            <div className="desktop-nav-divider" />
            <button className="lang-btn" onClick={() => setLang(lang === 'fr' ? 'en' : 'fr')}>
              {lang === 'fr' ? 'EN' : 'FR'}
            </button>
            <Link href="/#apply" className="btn btn-sm">{tx.cta}</Link>
          </div>

          {/* Mobile: lang + hamburger */}
          <div className="mobile-nav-right">
            <button className="lang-btn" onClick={() => setLang(lang === 'fr' ? 'en' : 'fr')}>
              {lang === 'fr' ? 'EN' : 'FR'}
            </button>
            <button className="hamburger-btn" onClick={() => setMenuOpen(true)} aria-label="Menu">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="3" y1="6" x2="21" y2="6"/>
                <line x1="3" y1="12" x2="21" y2="12"/>
                <line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile drawer overlay */}
      <div className={`mobile-drawer-overlay${menuOpen ? ' open' : ''}`} onClick={() => setMenuOpen(false)} />

      {/* Mobile drawer */}
      <nav className={`mobile-drawer${menuOpen ? ' open' : ''}`}>
        <div className="mobile-drawer-header">
          <Image src="/images/logo-removebg-preview.png" alt="CR" width={44} height={44} style={{ height: '44px', width: 'auto' }} />
          <span style={{ color: '#fff', fontWeight: 900, fontSize: 15, letterSpacing: 0.5 }}>
            CAMION<span style={{ color: '#d4a03c' }}>RECRUTE</span>.COM
          </span>
          <button className="drawer-close-btn" onClick={() => setMenuOpen(false)} aria-label="Close">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div className="mobile-drawer-links">
          <Link href="/" className="drawer-link" onClick={() => setMenuOpen(false)}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            {lang === 'fr' ? 'Accueil' : 'Home'}
          </Link>
          {navLinks.map(l => (
            <Link key={l.href} href={l.href} className="drawer-link" onClick={() => setMenuOpen(false)}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
              {l.label}
            </Link>
          ))}
        </div>

        <div className="mobile-drawer-cta">
          <Link href="/#apply" className="btn" style={{ width: '100%', justifyContent: 'center' }} onClick={() => setMenuOpen(false)}>
            {tx.cta}
          </Link>
        </div>
      </nav>
    </>
  )
}
