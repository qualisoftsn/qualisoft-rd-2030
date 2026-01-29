import TrialBanner from '@/app/components/TrialBanner';
import Sidebar from '@/app/components/Sidebar';
import { getServerSession } from '@/core/lib/auth'; // votre helper auth

export default async function DashboardLayout({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  // Détection côté server si trial
  const session = await getServerSession();
  const isTrial = session?.user?.tenant?.T_SubscriptionStatus === 'TRIAL';

  return (
    <div className="min-h-screen bg-[#0B0F1A] text-white italic font-sans">
      {/* Banner flottante si trial */}
      <TrialBanner />
      
      {/* Décalage conditionnel pour le banner */}
      <div className={isTrial ? 'pt-20' : ''}>
        <div className="flex">
          <Sidebar />
          <main className="flex-1 ml-72 min-h-screen">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}