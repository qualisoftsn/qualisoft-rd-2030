/* eslint-disable @typescript-eslint/no-explicit-any */
//* eslint-disable @typescript-eslint/no-unused-vars */
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/core/lib/auth";
import { redirect } from "next/navigation";
import TrialBanner from '@/components/TrialBanner';
import Sidebar from '../dashboard/sidebar';

export default async function DashboardLayout({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  // 1️⃣ Récupération de la session serveur Qualisoft
  const session = await getServerSession(authOptions);

  // 2️⃣ Protection : Si pas de session, redirection vers le login
  if (!session || !session.user) {
    redirect('/auth/login');
  }

  // 3️⃣ Préparation des données pour les composants (on utilise 'as any' pour la flexibilité)
  const user = session.user as any;
  
  // Logique de détection (SuperAdmin et Trial)
  const isSuperAdmin = user.U_Role === 'SUPER_ADMIN' || user.email === 'ab.thiongane@qualisoft.sn';
  const isTrial = user.tenantId === 'ESSAI';

  return (
    <div className="min-h-screen bg-[#0B0F1A] text-white italic font-sans">
      
      {/* 🟢 CORRECTION : On passe obligatoirement user et isSuperAdmin à la Banner */}
      <TrialBanner user={user} isSuperAdmin={isSuperAdmin} />
      
      {/* 🟢 Décalage conditionnel si la bannière est présente (isTrial) */}
      <div className={isTrial ? 'pt-20' : ''}>
        <div className="flex">
          
          {/* 🟢 Passage des infos à la Sidebar également */}
          <Sidebar user={user} isSuperAdmin={isSuperAdmin} />
          
          <main className="flex-1 ml-72 min-h-screen relative">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}