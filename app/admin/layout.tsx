import type { Metadata } from 'next'
import './admin.css'

export const metadata: Metadata = { title: 'TruckRecruit — Admin Panel' }

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
