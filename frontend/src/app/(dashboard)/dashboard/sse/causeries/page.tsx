/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 🛰️ MODULE : CAUSERIES SÉCURITÉ & ÉMARGEMENT (ELITE SDE)
 * ---------------------------------------------------------------------------
 * RÔLE : Preuve de sensibilisation numérique scellée.
 * DESIGN : Elite High-Density / 100dvh / Zero-Scroll.
 * ARCHITECTURE : Zéro NextAuth (Kernel Sovereign).
 * ---------------------------------------------------------------------------
 * DATE DE RÉVISION : 05 Mars 2026 | 19:30 GMT
 */

"use client";

import React, { useCallback, useEffect, useState } from "react";
import apiClient from "@/core/api/api-client";
import { Mic2, Plus, Users, QrCode, Trash2, RefreshCw, Clock, MapPin, ShieldCheck } from "lucide-react";
import { toast, Toaster } from "sonner";
import AttendanceQRModal from "./AttendanceQRModal"; 

export default function CauseriesPage() {
  const [causeries, setCauseries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeQR, setActiveQR] = useState<any>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get("/causeries");
      const data = res.data?.data || res.data;
      setCauseries(Array.isArray(data) ? data : []);
    } catch { 
      toast.error("RUPTURE KERNEL : Flux causeries interrompu."); 
    } finally { 
      setLoading(false); 
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) return <LoadingScreen label="Scan du Registre de Sensibilisation..." />;

  return (
    <div className="h-screen bg-[#0B0F1A] text-white italic font-black uppercase flex flex-col overflow-hidden w-full lg:pl-72 selection:bg-blue-600/30">
      <Toaster position="top-right" richColors theme="dark" />
      
      {/* 🔝 HEADER TACTIQUE */}
      <header className="shrink-0 p-8 border-b border-white/5 bg-black/40 flex flex-col xl:flex-row justify-between items-center gap-6 mt-12 lg:mt-0">
        <div className="text-left space-y-3">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-600 rounded-2xl text-white shadow-xl">
              <Mic2 size={28} strokeWidth={2.5} />
            </div>
            <h1 className="text-4xl lg:text-5xl tracking-tighter leading-none m-0 italic uppercase">
              Causeries <span className="text-blue-600">Sécurité</span>
            </h1>
          </div>
          <p className="text-slate-500 text-[10px] tracking-[0.4em] m-0 flex items-center gap-2">
            <ShieldCheck size={14} className="text-blue-600" /> Sensibilisation §7.3 ISO 45001
          </p>
        </div>

        <button className="bg-blue-600 text-white px-10 py-5 rounded-2xl font-black text-[10px] shadow-4xl hover:bg-white hover:text-blue-600 transition-all border-none cursor-pointer flex items-center gap-3 active:scale-95">
          <Plus size={18} strokeWidth={4} /> PROGRAMMER SESSION
        </button>
      </header>

      {/* 🧩 VIEWPORT SDE */}
      <main className="flex-1 overflow-y-auto custom-scrollbar p-8">
        <div className="max-w-400 mx-auto grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 content-start">
          {causeries.length > 0 ? causeries.map((c) => (
            <div key={c.CS_Id} className="group bg-[#151A2D] border-2 border-white/5 p-8 rounded-[3rem] flex flex-col shadow-2xl relative overflow-hidden hover:border-blue-600/50 transition-all duration-500 text-left">
               <div className="flex justify-between items-start mb-8">
                  <div className="p-4 bg-white/5 rounded-2xl text-blue-500 shadow-inner group-hover:rotate-6 transition-all">
                    <Users size={24}/>
                  </div>
                  <span className="bg-blue-600/20 text-blue-400 px-4 py-1.5 rounded-xl text-[9px] font-black border border-blue-500/20 italic tracking-widest uppercase">
                    {c._count?.CS_Participants || 0} PRÉSENTS
                  </span>
               </div>

               <div className="flex-1 space-y-2">
                 <h3 className="text-2xl font-black italic tracking-tighter m-0 mb-4 line-clamp-2 leading-none text-white uppercase">{c.CS_Theme}</h3>
                 <div className="flex flex-col gap-2">
                    <p className="text-[10px] text-slate-500 tracking-[0.2em] m-0 flex items-center gap-2"><Clock size={12}/> {new Date(c.CS_Date).toLocaleDateString()}</p>
                    <p className="text-[10px] text-slate-500 tracking-[0.2em] m-0 flex items-center gap-2"><MapPin size={12}/> {c.CS_Lieu || "SUR SITE"}</p>
                 </div>
               </div>
               
               <div className="flex gap-4 pt-8 mt-8 border-t border-white/5">
                  <button onClick={() => setActiveQR(c)} className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-black text-[9px] tracking-widest italic cursor-pointer border-none shadow-xl hover:bg-white hover:text-blue-600 transition-all uppercase active:scale-95">
                    <QrCode size={16} className="mr-2 inline" /> ÉMARGEMENT
                  </button>
                  <button className="p-4 bg-white/5 hover:bg-rose-600 text-slate-500 hover:text-white rounded-2xl transition-all border-none cursor-pointer">
                    <Trash2 size={20}/>
                  </button>
               </div>
            </div>
          )) : (
            <div className="col-span-full py-32 flex flex-col items-center gap-6 opacity-30 italic">
               <Mic2 size={60} strokeWidth={1} />
               <p className="font-black uppercase tracking-[0.4em] text-[10px]">Aucune causerie au registre</p>
            </div>
          )}
        </div>
      </main>

      {activeQR && <AttendanceQRModal causerieId={activeQR.CS_Id} theme={activeQR.CS_Theme} onClose={() => setActiveQR(null)} />}
      <style dangerouslySetInnerHTML={{ __html: `.custom-scrollbar::-webkit-scrollbar { width: 0px; }` }} />
    </div>
  );
}

// --- 🧩 COMPOSANT ATOMIQUE SCELLÉ ---
function LoadingScreen({ label }: { label: string }) {
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-[#0B0F1A] gap-8 lg:pl-72 text-blue-600 italic font-black uppercase tracking-[0.5em]">
      <RefreshCw className="animate-spin" size={70} strokeWidth={1} />
      <span className="text-[10px] animate-pulse text-center px-10 leading-relaxed uppercase">{label}</span>
    </div>
  );
}
