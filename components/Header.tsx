'use client'
import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import { useLang, t } from '@/lib/i18n'

const DriverIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3"/><line x1="12" y1="3" x2="12" y2="9"/><line x1="5.6" y1="18" x2="9.5" y2="13.8"/><line x1="18.4" y1="18" x2="14.5" y2="13.8"/></svg>
)
const CompanyIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18"/><path d="M5 21V7l7-4 7 4v14"/><path d="M9 9h.01M9 13h.01M9 17h.01M15 9h.01M15 13h.01M15 17h.01"/></svg>
)

export default function Header() {
  const barRef = useRef<HTMLElement>(null)
  const applyRef = useRef<HTMLDivElement>(null)
  const { lang, setLang } = useLang()
  const tx = t[lang]
  const [menuOpen, setMenuOpen] = useState(false)
  const [applyOpen, setApplyOpen] = useState(false)

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

  // Close the "Apply" dropdown on outside click / Escape
  useEffect(() => {
    if (!applyOpen) return
    const onClick = (e: MouseEvent) => {
      if (applyRef.current && !applyRef.current.contains(e.target as Node)) setApplyOpen(false)
    }
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setApplyOpen(false) }
    document.addEventListener('mousedown', onClick)
    document.addEventListener('keydown', onKey)
    return () => { document.removeEventListener('mousedown', onClick); document.removeEventListener('keydown', onKey) }
  }, [applyOpen])

  const applyOptions = {
    driver: {
      href: '/forms/driver-form',
      title: lang === 'fr' ? 'Je suis chauffeur' : 'I am a driver',
      sub: lang === 'fr' ? 'Déposer ma candidature' : 'Submit your application',
    },
    company: {
      href: '/#companies',
      title: lang === 'fr' ? 'Je suis une entreprise' : 'I am a company',
      sub: lang === 'fr' ? 'Trouver des chauffeurs' : 'Find drivers',
    },
  }

  return (
    <>
      <header className="topbar" ref={barRef}>
        <div className="wrap nav">
          {/* Logo + brand */}
          <Link href="/" className="brand" onClick={() => setMenuOpen(false)}>
            <Image src="/images/logo-truckrecruit.png" alt="TruckRecruit.com" width={425} height={100} priority style={{ height: '46px', width: 'auto', flexShrink: 0 }} />
          </Link>

          {/* Desktop actions */}
          <div className="nav-actions desktop-nav">
            <button className="lang-btn" onClick={() => setLang(lang === 'fr' ? 'en' : 'fr')}>
              {lang === 'fr' ? 'EN' : 'FR'}
            </button>
            <div className={`apply-dropdown${applyOpen ? ' open' : ''}`} ref={applyRef}>
              <button className="btn btn-sm apply-toggle" onClick={() => setApplyOpen(o => !o)} aria-expanded={applyOpen} aria-haspopup="true">
                {tx.cta}
                <svg className="chev" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
              </button>
              {applyOpen && (
                <div className="apply-menu" role="menu">
                  <Link href={applyOptions.driver.href} className="apply-menu-item" role="menuitem" onClick={() => setApplyOpen(false)}>
                    <DriverIcon />
                    <span className="apply-menu-text">
                      <span className="apply-menu-title">{applyOptions.driver.title}</span>
                      <span className="apply-menu-sub">{applyOptions.driver.sub}</span>
                    </span>
                  </Link>
                  <Link href={applyOptions.company.href} className="apply-menu-item" role="menuitem" onClick={() => setApplyOpen(false)}>
                    <CompanyIcon />
                    <span className="apply-menu-text">
                      <span className="apply-menu-title">{applyOptions.company.title}</span>
                      <span className="apply-menu-sub">{applyOptions.company.sub}</span>
                    </span>
                  </Link>
                </div>
              )}
            </div>
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
          <Image src="/images/logo-truckrecruit.png" alt="TruckRecruit.com" width={425} height={100} style={{ height: '38px', width: 'auto' }} />
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
          <div className="drawer-section-label">{lang === 'fr' ? 'POSTULER' : 'APPLY'}</div>
          <Link href={applyOptions.driver.href} className="drawer-link" onClick={() => setMenuOpen(false)}>
            <DriverIcon />
            {applyOptions.driver.title}
          </Link>
          <Link href={applyOptions.company.href} className="drawer-link" onClick={() => setMenuOpen(false)}>
            <CompanyIcon />
            {applyOptions.company.title}
          </Link>
        </div>
      </nav>
    </>
  )
}
