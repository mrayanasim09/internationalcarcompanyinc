import type { Metadata } from 'next'
import { AdminLayout } from '@/components/admin/admin-layout'

export const metadata: Metadata = {
  title: {
    default: 'Admin - International Car Company Inc',
    template: '%s | Admin - International Car Company Inc'
  },
}

export default function AdminSectionLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AdminLayout>
      {children}
    </AdminLayout>
  )
}


