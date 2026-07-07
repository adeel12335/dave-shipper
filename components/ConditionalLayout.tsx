'use client'
import { usePathname } from 'next/navigation'
import Header from './Header'
import Footer from './Footer'

export default function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAdmin = pathname?.startsWith('/admin')
  const isForm = pathname?.startsWith('/forms/')

  // Admin owns its full chrome — no site header/footer
  if (isAdmin) return <>{children}</>

  // Form pages keep their own FormBrandBar header (its lang toggle is wired to
  // the form's local state), but still get the site Footer for a finished look.
  if (isForm) {
    return (
      <div className="form-shell">
        {children}
        <Footer />
      </div>
    )
  }

  return (
    <>
      <Header />
      {children}
      <Footer />
    </>
  )
}
