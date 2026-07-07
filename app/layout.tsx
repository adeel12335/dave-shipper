import type { Metadata } from 'next'
import './globals.css'
import './mobile-drawer.css'
import ConditionalLayout from '@/components/ConditionalLayout'
import { LangProvider } from '@/lib/i18n'

export const metadata: Metadata = {
  title: 'TruckRecruit.com - Les bons chauffeurs. Les bonnes opportunites.',
  description: 'TruckRecruit.com connecte les meilleurs chauffeurs professionnels aux meilleures entreprises du Quebec.',
  icons: { icon: '/images/logo-icon.png' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body suppressHydrationWarning>
        <LangProvider>
          <ConditionalLayout>{children}</ConditionalLayout>
        </LangProvider>
      </body>
    </html>
  )
}
