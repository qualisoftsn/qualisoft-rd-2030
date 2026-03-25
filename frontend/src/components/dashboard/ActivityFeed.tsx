/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * 🛰️ MODULE : ActivityFeed.tsx
 * -------------------------------------------------------------------------
 * RÔLE : Flux de traçabilité en temps réel des actions du SMI.
 * RÉPARATION : Résolution du conflit de type Activity (Lucide vs Elite-SDE).
 * SÉCURITÉ : Isolation Matrix (Zéro NextAuth).
 * RÉVISION : 03 Mars 2026 | 16:55 GMT
 */

"use client";

import React, { useEffect, useState } from 'react';
import { 
  Activity as ActivityIcon, // ✅ Alias pour éviter le conflit avec le type métier
  Zap, 
  CheckCircle2, 
  AlertTriangle, 
  Clock,
  Loader2
} from 'lucide-react';
import apiClient from '@/core/api/api-client';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

// 🔱 IMPORTATION DU RÉFÉRENTIEL ELITE-SDE
type ActivityType = "DOCUMENT" | "NON_CONFORMITE" | "AUDIT" | "ACTION" | "SSE";

export default function ActivityFeed() {
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const res = await apiClient.get('/activities/latest');
        setActivities(res.data);
      } catch (err) {
        console.error("ERREUR KERNEL : Impossible de synchroniser le flux.");
      } finally {
        setLoading(false);
      }
    };
    fetchActivities();
  }, []);

  if (loading) {
    return (
      <div className="p-10 flex justify-center italic">
        <Loader2 className="animate-spin text-blue-600" size={24} />
      </div>
    );
  }

  return (
    <div className="bg-[#0F172A]/40 border border-white/5 rounded-[3rem] p-10 backdrop-blur-xl animate-in fade-in duration-700 font-sans italic">
      
      {/* HEADER DU FLUX */}
      <div className="flex items-center justify-between mb-10">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-600/10 rounded-2xl">
            {/* ✅ RÉPARATION : Utilisation de l'alias ActivityIcon */}
            <ActivityIcon size={20} className="text-blue-500" />
          </div>
          <div>
            <h3 className="text-lg font-black text-white uppercase tracking-tighter italic m-0 leading-none">
              Flux d&apos;activité
            </h3>
            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-1 m-0">
              Traçabilité temps réel Matrix
            </p>
          </div>
        </div>
        <div className="px-4 py-1.5 bg-white/5 rounded-full border border-white/5 text-[8px] font-black text-slate-400 uppercase tracking-widest">
          Live Stream
        </div>
      </div>

      {/* LISTE DES ÉVÉNEMENTS */}
      <div className="space-y-6">
        {activities.length > 0 ? activities.map((act, i) => (
          <div key={i} className="group flex items-start gap-5 p-4 rounded-2xl hover:bg-white/5 transition-all">
            <div className="mt-1">
              {renderIcon(act.type)}
            </div>
            <div className="flex-1 space-y-1">
              <p className="text-xs font-bold text-slate-200 m-0">
                <span className="font-black text-blue-400 uppercase">{act.userName}</span> {act.description}
              </p>
              <div className="flex items-center gap-3">
                <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest italic flex items-center gap-1">
                  <Clock size={10} /> {formatDistanceToNow(new Date(act.createdAt), { addSuffix: true, locale: fr })}
                </span>
                <span className="text-[9px] font-black text-slate-700 uppercase tracking-widest">
                  # {act.module}
                </span>
              </div>
            </div>
          </div>
        )) : (
          <div className="py-10 text-center text-[10px] font-black text-slate-700 uppercase tracking-widest opacity-20">
            Aucun signal détecté
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * 🎨 HELPER : RENDU DES ICÔNES DE CONTEXTE
 */
function renderIcon(type: string) {
  switch (type) {
    case 'ACTION': return <Zap size={14} className="text-amber-500" />;
    case 'NC': return <AlertTriangle size={14} className="text-red-500" />;
    case 'DOC': return <CheckCircle2 size={14} className="text-emerald-500" />;
    default: return <ActivityIcon size={14} className="text-blue-500" />;
  }
}
