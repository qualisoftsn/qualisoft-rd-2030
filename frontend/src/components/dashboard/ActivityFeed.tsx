/**
 * 🛰️ MODULE : ActivityFeed.tsx
 * -------------------------------------------------------------------------
 * RÔLE : Agrégation et affichage en temps réel des flux du SMI.
 * SYNC : Connecté au Kernel Matrix via apiClient.
 * RÉVISION : 03 Mars 2026 | 21:20 GMT
 */

"use client";

import apiClient from "@/core/api/api-client";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import {
  AlertTriangle,
  ArrowRight,
  ClipboardCheck,
  Clock,
  FileText,
  Info,
  Loader2,
  ShieldAlert,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { Activity, useEffect, useState } from "react";

// --- 🔱 TYPES DE FLUX ---
type ActivityType = "DOCUMENT" | "NON_CONFORMITE" | "AUDIT" | "ACTION" | "SSE";

interface ActivityItem {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  createdAt: string;
  metadata?: any;
}

export default function ActivityFeed() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * 📡 CAPTURE DES ÉVÉNEMENTS
   */
  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const res = await apiClient.get<ActivityItem[]>(
          "/dashboard/activities",
        );
        setActivities(res.data);
      } catch (err) {
        console.error("[MATRIX ERROR] : Échec de synchronisation du flux.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchActivities();
  }, []);

  /**
   * 🎨 CONFIGURATION DES SIGNAUX VISUELS
   */
  const getIcon = (type: ActivityType) => {
    switch (type) {
      case "DOCUMENT":
        return { icon: FileText, color: "text-blue-500", bg: "bg-blue-500/10" };
      case "NON_CONFORMITE":
        return {
          icon: ShieldAlert,
          color: "text-red-500",
          bg: "bg-red-500/10",
        };
      case "AUDIT":
        return {
          icon: ClipboardCheck,
          color: "text-emerald-500",
          bg: "bg-emerald-500/10",
        };
      case "SSE":
        return {
          icon: AlertTriangle,
          color: "text-amber-500",
          bg: "bg-amber-500/10",
        };
      default:
        return { icon: Zap, color: "text-purple-500", bg: "bg-purple-500/10" };
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 className="animate-spin text-blue-600" size={32} />
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">
          Lecture du flux Matrix...
        </p>
      </div>
    );
  }

  return (
    <div className="bg-[#0F172A]/40 border border-white/5 rounded-[2.5rem] p-8 space-y-8 backdrop-blur-md">
      {/* HEADER DU FLUX */}
      <div className="flex items-center justify-between border-b border-white/5 pb-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-600/10 rounded-2xl">
            <Activity size={20} className="text-blue-500" />
          </div>
          <div>
            <h3 className="text-lg font-black text-white uppercase tracking-tighter italic m-0 leading-none">
              Flux d'Activité
            </h3>
            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1">
              Événements récents du SMI
            </p>
          </div>
        </div>
        <Link
          href="/dashboard/history"
          className="text-[9px] font-black text-blue-500 hover:text-white transition-colors uppercase tracking-widest no-underline"
        >
          Voir tout le registre
        </Link>
      </div>

      {/* LISTE DES ÉVÉNEMENTS */}
      <div className="space-y-6">
        {activities.length > 0 ? (
          activities.map((item) => {
            const config = getIcon(item.type);
            return (
              <div
                key={item.id}
                className="group flex items-start gap-6 p-4 rounded-3xl hover:bg-white/5 transition-all cursor-default"
              >
                {/* Icône de Type */}
                <div
                  className={`p-4 rounded-2xl ${config.bg} ${config.color} shrink-0 shadow-lg transition-transform group-hover:scale-110`}
                >
                  <config.icon size={18} />
                </div>

                {/* Contenu */}
                <div className="flex-1 space-y-1 min-w-0 text-left">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-[11px] font-black text-white uppercase italic tracking-tight truncate">
                      {item.title}
                    </span>
                    <span className="flex items-center gap-2 text-[8px] font-bold text-slate-600 uppercase shrink-0">
                      <Clock size={10} />
                      {formatDistanceToNow(new Date(item.createdAt), {
                        addSuffix: true,
                        locale: fr,
                      })}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 leading-relaxed font-medium line-clamp-1">
                    {item.description}
                  </p>
                </div>

                {/* Action Rapide */}
                <button className="p-3 bg-white/5 rounded-xl opacity-0 group-hover:opacity-100 transition-all text-slate-500 hover:text-blue-500 border-none cursor-pointer">
                  <ArrowRight size={16} />
                </button>
              </div>
            );
          })
        ) : (
          <div className="py-10 text-center space-y-3">
            <div className="inline-flex p-4 bg-white/5 rounded-full text-slate-700">
              <Info size={24} />
            </div>
            <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest italic">
              Aucun événement scellé ces dernières 24h
            </p>
          </div>
        )}
      </div>

      {/* FOOTER STATS */}
      <div className="pt-6 border-t border-white/5">
        <div className="flex items-center justify-between text-[8px] font-black text-slate-600 uppercase tracking-widest">
          <span>Statut : Synchro Matrix OK</span>
          <span className="text-blue-500">Dernier scan : Instantané</span>
        </div>
      </div>
    </div>
  );
}
