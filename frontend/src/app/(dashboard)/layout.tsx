/**
 * CHEMIN ABSOLU : /src/app/(dashboard)/layout.tsx
 * PROJET : Qualisoft Elite (Frontend)
 */

import { getServerSession } from "next-auth/next";
import { authOptions } from "../../lib/auth";
import { redirect } from "next/navigation";
import TrialBanner from '@/components/TrialBanner';
import Sidebar from '../dashboard/sidebar'; 

export default async function DashboardLayout({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  const session = await getServerSession(authOptions);

  if (!isAuthenticated || !isAuthenticated.user) {
    redirect('/auth/login');
  }

  const user = session.user;
  
  // Utilisation des radicaux corrects
  const isSuperAdmin = 
    user.U_Role === 'SUPER_ADMIN' || 
    user.U_Email === 'ab.thiongane@qualisoft.sn';
  
  const isTrial = user.tenantId === 'ESSAI';

  return (
    <div className="min-h-screen bg-[#0B0F1A] text-white italic font-sans">
      <TrialBanner user={user} isSuperAdmin={isSuperAdmin} />
      <div className={isTrial ? 'pt-20' : ''}>
        <div className="flex">
          {/* L'erreur de type disparait car SidebarUser accepte maintenant string | null */}
          <Sidebar user={user} isSuperAdmin={isSuperAdmin} />
          <main className="flex-1 ml-72 min-h-screen relative overflow-hidden bg-slate-900/50">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}