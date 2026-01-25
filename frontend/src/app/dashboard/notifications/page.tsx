'use client';

import { useEffect, useState } from 'react';
import { 
  Bell, 
  AlertTriangle, 
  CheckCircle, 
  ShieldAlert, 
  Clock, 
  ChevronRight
} from 'lucide-react';

/**
 * 🏛️ INTERFACE ALIGNÉE SUR LE SCHÉMA PRISMA (21/01/2026)
 */
interface Notification {
  N_Id: string;
  N_Title: string;
  N_Message: string;
  N_Type: 'INFO' | 'WARNING' | 'SUCCESS' | 'DANGER' | 'SSE_ALERT';
  N_IsRead: boolean;
  N_CreatedAt: string;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Simulation des IDs (À brancher sur ton Auth Context plus tard)
  const userId = "id-user-local-test"; 
  const tenantId = "id-tenant-local-test";

  /**
   * 📡 RÉCUPÉRATION DES DONNÉES DEPUIS L'API LOCALE (PORT 9000)
   */
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:9000/api/notifications/${userId}?tenantId=${tenantId}`);
      if (!response.ok) throw new Error('Échec de la liaison avec le Noyau PostgreSQL');
      const data = await response.json();
      setNotifications(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  /**
   * ✅ ACQUITTEMENT D'UNE ALERTE
   */
  const handleMarkAsRead = async (id: string) => {
    try {
      const response = await fetch(`http://localhost:9000/api/notifications/${id}/read`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });

      if (response.ok) {
        setNotifications(prev => prev.filter(n => n.N_Id !== id));
      }
    } catch (err) {
      console.error("Erreur lors de l'acquittement :", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  return (
    <div className="min-h-screen bg-[#0B0F1A] text-white selection:bg-[#2563eb]/30">
      <div className="max-w-5xl mx-auto px-6 py-12">
        
        {/* HEADER : IDENTITÉ QUALISOFT ELITE */}
        <header className="mb-16 relative">
          <div className="absolute -left-4 top-0 w-1 h-20 bg-[#2563eb] rounded-full shadow-[0_0_15px_#2563eb]" />
          <h1 className="text-5xl font-black italic tracking-tighter uppercase leading-none">
            Cockpit <span className="text-[#2563eb]">Alertes</span>
          </h1>
          <div className="flex items-center gap-3 mt-4">
            <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-bold tracking-[0.2em] text-gray-400 uppercase">
              L&apos;Excellence Augmentée
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#2563eb] animate-pulse" />
            <span className="text-xs text-gray-500 font-medium uppercase tracking-widest">
              Système Opérationnel • v1.0
            </span>
          </div>
        </header>

        {/* ZONE DE CONTENU */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="w-12 h-12 border-4 border-[#2563eb]/20 border-t-[#2563eb] rounded-full animate-spin" />
            <p className="text-gray-500 font-bold italic uppercase tracking-widest text-sm">Synchronisation avec le Noyau...</p>
          </div>
        ) : error ? (
          <div className="p-8 rounded-3xl border border-red-500/20 bg-red-500/5 backdrop-blur-xl text-center">
            <ShieldAlert className="mx-auto text-red-500 mb-4" size={48} />
            <h2 className="text-xl font-bold uppercase italic mb-2">Erreur de Flux</h2>
            <p className="text-gray-400 mb-6">{error}</p>
            <button 
              onClick={fetchNotifications}
              className="px-8 py-3 bg-red-500 text-white font-black italic uppercase rounded-xl hover:bg-red-600 transition-all"
            >
              Réessayer la liaison
            </button>
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-12 rounded-[2.5rem] border border-white/5 bg-white/2 backdrop-blur-3xl text-center border-dashed">
            <CheckCircle className="mx-auto text-gray-700 mb-4" size={40} />
            <p className="text-gray-500 font-bold italic uppercase tracking-widest">Aucune alerte critique en attente</p>
          </div>
        ) : (
          <div className="space-y-6">
            {notifications.map((notif) => (
              <div 
                key={notif.N_Id}
                className="group relative rounded-4xl border border-white/5 bg-white/3 p-8 backdrop-blur-2xl transition-all duration-500 hover:border-[#2563eb]/40 hover:bg-white/5"
              >
                <div className="flex flex-col md:flex-row md:items-center gap-8">
                  
                  {/* INDICATEUR DE TYPE */}
                  <div className={`shrink-0 w-16 h-16 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 ${
                    notif.N_Type === 'DANGER' ? 'bg-red-500/20 text-red-500 shadow-[0_0_20px_rgba(239,68,68,0.2)]' : 
                    notif.N_Type === 'WARNING' ? 'bg-yellow-500/20 text-yellow-500 shadow-[0_0_20px_rgba(234,179,8,0.2)]' : 
                    'bg-[#2563eb]/20 text-[#2563eb] shadow-[0_0_20px_rgba(37,99,235,0.2)]'
                  }`}>
                    {notif.N_Type === 'DANGER' ? <ShieldAlert size={32} /> : 
                     notif.N_Type === 'WARNING' ? <AlertTriangle size={32} /> : <Bell size={32} />}
                  </div>

                  {/* CONTENU TEXTUEL */}
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-2">
                      <h3 className="text-2xl font-black italic tracking-tight uppercase leading-none">
                        {notif.N_Title}
                      </h3>
                      <span className="h-px flex-1 bg-white/5" />
                    </div>
                    <p className="text-gray-400 text-lg leading-relaxed max-w-2xl font-medium">
                      {notif.N_Message}
                    </p>
                    <div className="flex items-center gap-4 mt-6 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-600">
                      <Clock size={12} />
                      <span>Émis le : {new Date(notif.N_CreatedAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
                      <span className="w-1 h-1 rounded-full bg-gray-700" />
                      <span>ID: {notif.N_Id.split('-')[0]}</span>
                    </div>
                  </div>

                  {/* ACTION D'ACQUITTEMENT */}
                  <button 
                    onClick={() => handleMarkAsRead(notif.N_Id)}
                    className="shrink-0 group/btn flex items-center gap-3 px-8 py-4 rounded-2xl bg-white/5 border border-white/10 font-black italic uppercase text-xs tracking-widest transition-all hover:bg-[#2563eb] hover:border-[#2563eb] hover:shadow-[0_0_25px_rgba(37,99,235,0.4)]"
                  >
                    <span>Acquitter</span>
                    <ChevronRight size={16} className="transition-transform group-hover/btn:translate-x-1" />
                  </button>
                </div>

                {/* EFFET DE LUMIÈRE AU SURVOL */}
                <div className="absolute -inset-px rounded-4xl bg-linear-to-r from-transparent via-[#2563eb]/5 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100 pointer-events-none" />
              </div>
            ))}
          </div>
        )}

        {/* FOOTER STATS RAPIDES */}
        <footer className="mt-20 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-8">
            <div>
              <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-1">Total Alertes</p>
              <p className="text-2xl font-black italic">{notifications.length}</p>
            </div>
            <div className="w-px h-8 bg-white/5" />
            <div>
              <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-1">Statut Noyau</p>
              <p className="text-2xl font-black italic text-[#2563eb]">SYNC</p>
            </div>
          </div>
          <button 
            onClick={fetchNotifications}
            className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.3em] text-gray-500 hover:text-[#2563eb] transition-colors"
          >
            <span className="w-2 h-2 rounded-full bg-[#2563eb]" />
            Forcer la synchronisation
          </button>
        </footer>

      </div>
    </div>
  );
}