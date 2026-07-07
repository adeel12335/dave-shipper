import Link from 'next/link'
import Image from 'next/image'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="wrap foot-grid">
        <div>
          <Link href="/" className="brand">
            <Image src="/images/logo-truckrecruit.png" alt="TruckRecruit.com" width={425} height={100} style={{ height: '52px', width: 'auto' }} />
          </Link>
        </div>
        <div>
          <div className="foot-label">CONTACT</div>
          <div className="foot-row">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
            <a href="tel:+15142654285">(514) 265-4285</a>
          </div>
          <div className="foot-row">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 5L2 7"/></svg>
            <a href="mailto:info@truckrecruit.com">info@truckrecruit.com</a>
          </div>
        </div>
        <div>
          <div className="foot-label">SUIVEZ-NOUS</div>
          <div className="social">
            <a href="#" aria-label="Facebook">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
            </a>
            <a href="#" aria-label="LinkedIn">
              <svg width="19" height="19" viewBox="0 0 24 24" fill="currentColor"><path d="M4.98 3.5C4.98 4.88 3.87 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1s2.48 1.12 2.48 2.5zM.2 8h4.6v13H.2zM8 8h4.41v1.78h.06c.61-1.16 2.1-2.38 4.33-2.38 4.63 0 5.49 3.05 5.49 7.01V21h-4.6v-5.7c0-1.36-.02-3.1-1.89-3.1-1.89 0-2.18 1.48-2.18 3v5.8H8z"/></svg>
            </a>
          </div>
        </div>
      </div>
      <div className="copyright">© {new Date().getFullYear()} TruckRecruit.com — Tous droits réservés.</div>
    </footer>
  )
}
