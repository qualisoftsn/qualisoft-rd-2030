/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

/**
 * 🛰️ MODULE : CAUSERIES SÉCURITÉ & ÉMARGEMENT (ISO 45001 §7.3)
 * RÔLE : Preuve de sensibilisation numérique scellée
 * VERSION : 3.0 - Typing strict + Design Elite + Accessibilité
 */

import React, { useCallback, useEffect, useState } from "react";
import apiClient, { type ApiError } from "@/core/api/api-client";
import { Mic2, Plus, Users, QrCode, Trash2, RefreshCw, Clock, MapPin, ShieldCheck, AlertCircle } from "lucide-react";
import { toast, Toaster } from "sonner";
import { cn } from '@/core/utils/cn';

// ============================================================================
// TYPES (Prisma aligned)
// ============================================================================

export interface Causerie {
  CS_Id: string;
  CS_Theme: string;
  CS_Date: string;
  CS_Lieu?: string;
  CS_AnimateurId?: string;
  CS_Animateur?: {
    U_FirstName: string;
    U_LastName: string;
  };
  CS_Type?: string;
  CS_Description?: string;
  CS_Status?: string;
  _count?: {
    CS_Participants?: number;
  };
}

export interface AttendanceQRModalProps {
  causerieId: string;
  theme: string;
  onClose: () => void;
}

export interface LoadingScreenProps {
  label: string;
}

// ============================================================================
// SOUS-COMPOSANT : LOADING SCREEN
// ============================================================================

function LoadingScreen({ label }: LoadingScreenProps) {
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-[#0B0F1A] gap-6" role="status" aria-live="polite">
      <RefreshCw className="animate-spin text-blue-400 w-12 h-12 md:w-16 md:h-16" aria-hidden="true" />
      <span className="text-[10px] font-black uppercase tracking-widest text-blue-400 animate-pulse italic text-center px-4 md:px-10">{label}</span>
    </div>
  );
}

// ============================================================================
// SOUS-COMPOSANT : CAUSERIE CARD
// ============================================================================

interface CauserieCardProps {
  causerie: Causerie;
  onQRClick: (causerie: Causerie) => void;
  onDelete: (causerie: Causerie) => void;
}

function CauserieCard({ causerie, onQRClick, onDelete }: CauserieCardProps) {
  const participantCount = causerie._count?.CS_Participants || 0;

  return (
    <article 
      className="group bg-[#0F172A] border-2 border-white/5 p-4 md:p-6 lg:p-8 rounded-2xl md:rounded-3xl lg:rounded-[3rem] flex flex-col shadow-2xl relative overflow-hidden hover:border-blue-600/50 transition-all duration-500 text-left focus-within:border-blue-500/30 focus:outline-none focus:ring-2 focus:ring-blue-400"
      role="article"
      aria-label={`Causerie: ${causerie.CS_Theme}`}
    >
       <div className="flex justify-between items-start mb-4 md:mb-6 lg:mb-8">
          <div className="p-3 md:p-4 bg-white/5 rounded-xl md:rounded-2xl text-blue-400 shadow-inner group-hover:rotate-6 transition-all">
            <Users size={20} className="w-5 h-5 md:w-6 md:h-6 lg:w-8 lg:h-8" aria-hidden="true" />
          </div>
          <span className="bg-blue-600/20 text-blue-400 px-3 md:px-4 py-1 md:py-1.5 rounded-xl text-[8px] md:text-[9px] font-black border border-blue-500/20 italic tracking-widest uppercase">
            {participantCount} PRÉSENTS
          </span>
       </div>

       <div className="flex-1 space-y-1 md:space-y-2">
         <h3 className="text-lg md:text-xl lg:text-2xl font-black italic tracking-tighter m-0 mb-3 md:mb-4 line-clamp-2 leading-none text-white uppercase truncate">
           {causerie.CS_Theme}
         </h3>
         <div className="flex flex-col gap-1.5 md:gap-2">
            <p className="text-[9px] md:text-[10px] text-slate-500 tracking-widest m-0 flex items-center gap-1.5 md:gap-2">
              <Clock size={12} className="w-3 h-3 md:w-3.5 md:h-3.5" aria-hidden="true" /> 
              {new Date(causerie.CS_Date).toLocaleDateString('fr-SN')}
            </p>
            <p className="text-[9px] md:text-[10px] text-slate-500 tracking-widest m-0 flex items-center gap-1.5 md:gap-2">
              <MapPin size={12} className="w-3 h-3 md:w-3.5 md:h-3.5" aria-hidden="true" /> 
              {causerie.CS_Lieu || "SUR SITE"}
            </p>
         </div>
       </div>
       
       <div className="flex gap-2 md:gap-3 lg:gap-4 pt-4 md:pt-6 lg:pt-8 mt-4 md:mt-6 lg:mt-8 border-t border-white/5">
          <button 
            type="button"
            onClick={() => onQRClick(causerie)} 
            className="flex-1 py-2.5 md:py-3 lg:py-4 bg-blue-600 text-white rounded-xl md:rounded-2xl font-black text-[9px] md:text-[10px] tracking-widest italic cursor-pointer border-none shadow-xl hover:bg-white hover:text-blue-700 transition-all uppercase active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-400"
            aria-label={`Ouvrir QR code pour: ${causerie.CS_Theme}`}
          >
            <QrCode size={14} className="w-3.5 h-3.5 md:w-4 md:h-4 mr-1 md:mr-2 inline" aria-hidden="true" /> 
            <span className="hidden sm:inline">ÉMARGEMENT</span>
          </button>
          <button 
            type="button"
            onClick={() => onDelete(causerie)} 
            className="p-2 md:p-3 lg:p-4 bg-white/5 hover:bg-rose-600 text-slate-500 hover:text-white rounded-xl md:rounded-2xl transition-all border-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-rose-400"
            aria-label={`Supprimer la causerie: ${causerie.CS_Theme}`}
            title="Supprimer"
          >
            <Trash2 size={16} className="w-4 h-4 md:w-4.5 md:h-4.5 lg:w-5 lg:h-5" aria-hidden="true" />
          </button>
       </div>
    </article>
  );
}

// ============================================================================
// COMPOSANT PRINCIPAL
// ============================================================================

export default function CauseriesPage() {
  const [causeries, setCauseries] = useState<Causerie[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeQR, setActiveQR] = useState<Causerie | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get<Causerie[]>("/causeries");
      const data = Array.isArray(res.data) ? res.data : (Array.isArray(res.data?.data) ? res.data.data : []);
      setCauseries(data);
    } catch (error) {
      console.error('❌ Erreur chargement causeries:', error);
      toast.error("RUPTURE KERNEL : Flux causeries interrompu."); 
    } finally { 
      setLoading(false); 
    }
  }, []);

  useEffect(() => { if (typeof window !== 'undefined') fetchData(); }, [fetchData]);

  const handleQRClick = (causerie: Causerie) => {
    setActiveQR(causerie);
  };

  const handleDelete = async (causerie: Causerie) => {
    if (!confirm(`Supprimer la causerie "${causerie.CS_Theme}" ?`)) return;
    
    const toastId = toast.loading("Suppression en cours...");
    try {
      await apiClient.delete(`/causeries/${causerie.CS_Id}`);
      toast.success("Causerie supprimée", { id: toastId });
      fetchData();
    } catch (error: unknown) {
      const apiError = error as { response?: { data?: { message?: string } }; message?: string };
      toast.error(apiError?.response?.data?.message || "Échec de la suppression", { id: toastId });
    }
  };

  const handleCloseQR = () => {
    setActiveQR(null);
  };

  if (loading && typeof window !== 'undefined') {
    return <LoadingScreen label="Scan du Registre de Sensibilisation..." />;
  }

  // Import dynamic du modal QR (évite circular dependency)
  const AttendanceQRModal = activeQR 
    ? require('./AttendanceQRModal').default as React.ComponentType<AttendanceQRModalProps>
    : null;

  return (
    <div className="h-screen bg-[#0B0F1A] text-white italic font-sans flex flex-col overflow-hidden w-full selection:bg-blue-600/30">
      <Toaster position="top-right" richColors theme="dark" closeButton />
      
      {/* 🔝 HEADER */}
      <header className="shrink-0 px-4 md:px-6 lg:px-8 py-4 md:py-6 lg:py-8 border-b border-white/5 bg-black/40 flex flex-col xl:flex-row justify-between items-center gap-4 md:gap-6 mt-12 lg:mt-0">
        <div className="text-left space-y-2 md:space-y-3 w-full xl:w-auto">
          <div className="flex items-center gap-3 md:gap-4">
            <div className="p-2 md:p-3 bg-blue-600 rounded-xl md:rounded-2xl text-white shadow-xl">
              <Mic2 size={20} className="w-5 h-5 md:w-6 md:h-6 lg:w-7 lg:h-7" strokeWidth={2.5} aria-hidden="true" />
            </div>
            <h1 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl tracking-tighter leading-none m-0 italic uppercase">
              Causeries <span className="text-blue-400">Sécurité</span>
            </h1>
          </div>
          <p className="text-slate-500 text-[9px] md:text-[10px] tracking-widest m-0 flex items-center gap-1.5 md:gap-2">
            <ShieldCheck size={12} className="w-3 h-3 md:w-3.5 md:h-3.5 text-blue-400" aria-hidden="true" /> 
            Sensibilisation §7.3 ISO 45001
          </p>
        </div>

        <button 
          type="button"
          className="bg-blue-600 text-white px-4 md:px-6 lg:px-8 lg:px-10 py-3 md:py-4 lg:py-5 rounded-xl md:rounded-2xl font-black text-[9px] md:text-[10px] shadow-xl hover:bg-white hover:text-blue-700 transition-all border-none cursor-pointer flex items-center gap-2 md:gap-3 active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-400"
          aria-label="Programmer une nouvelle session de causerie"
        >
          <Plus size={16} className="w-4 h-4 md:w-4.5 md:h-4.5" strokeWidth={4} aria-hidden="true" /> 
          <span className="hidden sm:inline">PROGRAMMER SESSION</span>
        </button>
      </header>

      {/* 🧩 MAIN CONTENT */}
      <main className="flex-1 overflow-y-auto custom-scrollbar px-4 md:px-6 lg:px-8 py-4 md:py-6 lg:py-8">
        <div className="max-w-[100rem] mx-auto grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6 lg:gap-8 content-start" role="list" aria-label="Liste des causeries">
          {causeries.length > 0 ? causeries.map((c) => (
            <CauserieCard 
              key={c.CS_Id} 
              causerie={c} 
              onQRClick={handleQRClick}
              onDelete={handleDelete}
            />
          )) : (
            <div className="col-span-full py-24 md:py-28 lg:py-32 flex flex-col items-center gap-4 md:gap-6 opacity-30 italic" role="status">
               <Mic2 size={48} className="w-12 h-12 md:w-14 md:h-14 lg:w-16 lg:h-16" strokeWidth={1} aria-hidden="true" />
               <p className="font-black uppercase tracking-widest text-[9px] md:text-[10px] text-center px-4">Aucune causerie au registre</p>
               <button 
                 type="button"
                 className="mt-2 text-[8px] md:text-[9px] text-blue-400 hover:text-blue-300 uppercase tracking-widest italic underline focus:outline-none focus:ring-2 focus:ring-blue-400 rounded px-3 py-1"
               >
                 Créer votre première causerie
               </button>
            </div>
          )}
        </div>
      </main>

      {/* QR MODAL */}
      {activeQR && AttendanceQRModal && (
        <AttendanceQRModal 
          causerieId={activeQR.CS_Id} 
          theme={activeQR.CS_Theme} 
          onClose={handleCloseQR} 
        />
      )}

      <style>{`.custom-scrollbar::-webkit-scrollbar{width:4px}.custom-scrollbar::-webkit-scrollbar-track{background:transparent}.custom-scrollbar::-webkit-scrollbar-thumb{background:rgba(59,130,246,0.3);border-radius:10px}:focus-visible{outline:2px solid #3b82f6;outline-offset:2px}`}</style>
    </div>
  );
}