"use client"

import dynamic from 'next/dynamic'
const AdminDashboard = dynamic(() => import("@/components/admin/admin-dashboard").then(m => m.AdminDashboard), { ssr: false })

export default function AdminDashboardPage() {
  return (
    <>
      <div id="admin-dashboard-ssr-fallback" className="p-4 text-sm text-muted-foreground">
        Admin Dashboard is loading...
      </div>
      {/* Inline script to hide SSR fallback once JS runs */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
          (function(){
            try{ var el = document.getElementById('admin-dashboard-ssr-fallback'); if(el){ el.style.display = 'none'; } console.log('DEBUG: AdminDashboard inline script executed'); }
            catch(e){ console.warn('DEBUG: inline script error', e); }
          })();
        `,
        }}
      />
      <AdminDashboard />
    </>
  )
}
