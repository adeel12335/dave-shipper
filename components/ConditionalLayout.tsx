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

  // Forms use the same site Header + Footer as other pages
  if (isForm) {
    return (
      <div className="form-shell">
        <Header />
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
