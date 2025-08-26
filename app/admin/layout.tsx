import type { Metadata } from 'next'
import dynamic from 'next/dynamic'
const AdminLayout = dynamic(() => import('@/components/admin/admin-layout').then(m => m.AdminLayout), { ssr: false })

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


