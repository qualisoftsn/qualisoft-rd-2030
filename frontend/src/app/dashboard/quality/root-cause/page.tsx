//* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * 🛰️ MODULE : ANALYSE DES CAUSES RACINES (ROOT CAUSE ENGINE)
 * -------------------------------------------------------------------------
 * RÔLE : Détermination des causes fondamentales des écarts (§10.2.1.b).
 * MÉTHODES : 5 Pourquoi & Ishikawa (5M).
 * RÉFÉRENTIEL : types/elite-sde.ts (SCELLAGE PRISMA SDE).
 * ARCHITECTURE : Zéro simulation. Connexion stricte API. Validation active.
 * DESIGN : Cockpit Matrix Full-Space (max-w-500 / ml-72).
 * -------------------------------------------------------------------------
 */

"use client";

import apiClient from "@/core/api/api-client";
import {
  Dna, FileSearch, Fingerprint, GitBranch,
  Info, Loader2, Microscope, Save, Zap, AlertOctagon, Target
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast, Toaster } from "sonner";

// --- 🏗️ RÉFÉRENTIEL ÉLITE-SDE ---
import { NonConformite as INC, NCStatus } from "@/types/elite-sde";

const cn = (...classes: (string | boolean | undefined | null)[]) => classes.filter(Boolean).join(" ");

interface IshikawaData {
  MAIN_DOEUVRE: string;
  METHODE: string;
  MILIEU: string;
  MATERIEL: string;
  MATIERE: string;
}

export default function RootCausePage() {
  // --- 📦 ÉTATS DU KERNEL ---
  const [ncList, setNcList] = useState<INC[]>([]);
  const [selectedNc, setSelectedNc] = useState<INC | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // --- 🧠 ÉTATS D'INVESTIGATION ---
  const [whys, setWhys] = useState<string[]>(["", "", "", "", ""]);
  const [ishikawa, setIshikawa] = useState<IshikawaData>({
    MAIN_DOEUVRE: "",
    METHODE: "",
    MILIEU: "",
    MATERIEL: "",
    MATIERE: "",
  });

  /**
   * 📡 SYNCHRONISATION DES ÉCARTS OUVERTS (PROD SDE)
   */
  const loadNCs = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get("/non-conformites");
      const data = Array.isArray(res.data) ? res.data : res.data?.data || [];
      
      // Filtre stricte SDE : Uniquement les NC nécessitant une analyse (A_TRAITER ou EN_COURS)
      setNcList(data.filter((nc: INC) => nc.NC_Statut !== NCStatus.CLOTURE));
    } catch (err) {
      toast.error("RUPTURE DE FLUX : IMPOSSIBLE DE CHARGER LE REGISTRE NC.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadNCs(); }, [loadNCs]);

  /**
   * 🔄 CHANGEMENT D'ANOMALIE SOURCE
   * Réinitialise les états d'analyse lors du changement de sélection.
   */
  const handleSelectNc = (nc: INC) => {
    setSelectedNc(nc);
    setWhys(["", "", "", "", ""]);
    setIshikawa({ MAIN_DOEUVRE: "", METHODE: "", MILIEU: "", MATERIEL: "", MATIERE: "" });
  };

  /**
   * 💾 SCELLAGE DE L'INVESTIGATION (§10.2.1.b)
   * Validation stricte avant mutation API.
   */
  const handleSealAnalysis = async () => {
    if (!selectedNc) {
       return toast.warning("ANOMALIE : SÉLECTIONNEZ UN ÉCART SOURCE.");
    }

    // Validation Active : Au moins le 1er Pourquoi doit être rempli
    if (!whys[0].trim()) {
       return toast.warning("ANOMALIE : LE PREMIER POURQUOI EST OBLIGATOIRE.");
    }

    setIsSaving(true);
    const tid = toast.loading("Scellage de l'analyse causale dans le noyau SDE...");
    
    try {
      await apiClient.patch(`/non-conformites/${selectedNc.NC_Id}/root-cause`, {
        NC_RootCause: whys.filter((w) => w.trim()).join(" -> "),
        NC_Ishikawa: ishikawa,
        NC_Status: NCStatus.EN_COURS, // L'analyse place la NC en cours de traitement
      });
      toast.success("ANALYSE SCELLÉE : LA CAUSE RACINE EST INDEXÉE (§10.2).", { id: tid });
      
      // Rafraîchissement optionnel si le dashboard doit disparaître ou se mettre à jour
      // loadNCs(); 
    } catch (err: any) {
      toast.error(err.response?.data?.message || "ERREUR DE MUTATION KERNEL SDE.", { id: tid });
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return (
    <div className="ml-72 flex h-screen flex-col items-center justify-center bg-[#0B0F1A] gap-12">
      <Loader2 className="animate-spin text-blue-600" size={120} strokeWidth={1} />
      <p className="text-blue-500 font-black uppercase italic text-[14px] tracking-[1.5em] animate-pulse">
        Initialisation Lab Cause Racine...
      </p>
    </div>
  );

  return (
    <div className="flex-1 bg-[#0B0F1A] min-h-screen p-16 ml-72 text-white font-sans italic text-left selection:bg-blue-600/30 overflow-x-hidden">
      <Toaster position="top-right" richColors theme="dark" />

      <div className="w-full max-w-500 mx-auto space-y-20 animate-in fade-in duration-1000">

        {/* 🔝 HEADER INVESTIGATEUR SDE */}
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-10 border-b-4 border-white/5 pb-16">
          <div className="space-y-8">
            <div className="flex items-center gap-6 text-blue-500 bg-blue-600/10 w-fit px-8 py-3 rounded-2xl border-2 border-blue-600/20 shadow-inner">
              <Microscope size={24} className="animate-pulse" />
              <span className="text-[12px] font-black uppercase tracking-[0.5em] italic">ISO 9001:2015 §10.2.1 • Root Cause Analysis</span>
            </div>
            <h1 className="text-8xl font-black uppercase italic tracking-tighter leading-none text-white flex items-center gap-8">
              Analyse <span className="text-blue-600">des Causes</span>
            </h1>
          </div>

          <button
            onClick={handleSealAnalysis}
            disabled={!selectedNc || isSaving}
            className="bg-blue-600 hover:bg-white hover:text-blue-600 px-14 py-8 rounded-[3rem] font-black uppercase text-[14px] tracking-[0.4em] flex items-center gap-6 shadow-[0_30px_80px_rgba(37,99,235,0.4)] transition-all border-none cursor-pointer italic disabled:opacity-30 disabled:cursor-not-allowed text-white active:scale-95 group"
          >
            {isSaving ? <Loader2 className="animate-spin" size={32} /> : <Save size={32} strokeWidth={3} className="group-hover:scale-110 transition-transform" />} 
            Valider l&apos;Analyse Causale
          </button>
        </header>

        <main className="grid grid-cols-12 gap-16 items-start">
          
          {/* 📋 COLONNE GAUCHE : SÉLECTION DE L'ANOMALIE SOURCE */}
          <aside className="col-span-12 lg:col-span-4 space-y-16">
            <div className="bg-[#151A2D] border-4 border-white/5 rounded-[5rem] p-16 shadow-4xl relative overflow-hidden group backdrop-blur-3xl min-h-150 flex flex-col">
              <h3 className="text-[14px] font-black uppercase text-slate-400 mb-12 tracking-[0.6em] flex items-center gap-6 italic leading-none border-b-4 border-white/5 pb-8">
                <FileSearch size={28} className="text-blue-500" /> Registre des Écarts Ouverts
              </h3>
              
              <div className="space-y-6 flex-1 overflow-y-auto custom-scrollbar pr-4">
                {ncList.length > 0 ? ncList.map((nc) => (
                  <button
                    key={nc.NC_Id}
                    onClick={() => handleSelectNc(nc)}
                    className={cn(
                      "w-full p-10 rounded-[3.5rem] border-4 text-left transition-all italic group/item cursor-pointer block",
                      selectedNc?.NC_Id === nc.NC_Id
                        ? "bg-blue-600 border-transparent shadow-[0_0_40px_rgba(37,99,235,0.3)] scale-[1.02]"
                        : "bg-black/40 border-white/5 hover:border-blue-600/30 hover:bg-white/5"
                    )}
                  >
                    <p className={cn("text-[11px] font-black uppercase mb-4 tracking-[0.4em] flex items-center gap-4", selectedNc?.NC_Id === nc.NC_Id ? "text-blue-200" : "text-blue-500")}>
                      <Target size={16} /> {nc.NC_Code} • {nc.NC_Source}
                    </p>
                    <h4 className={cn("text-2xl font-black uppercase tracking-tighter leading-tight line-clamp-3", selectedNc?.NC_Id === nc.NC_Id ? "text-white" : "text-slate-300")}>
                      {nc.NC_Title}
                    </h4>
                  </button>
                )) : (
                  <div className="flex flex-col items-center justify-center h-full opacity-30 gap-6 mt-20">
                     <AlertOctagon size={64} className="text-slate-500" />
                     <span className="text-center font-black uppercase italic tracking-[0.5em] text-slate-500 text-[12px]">Aucun écart nécessitant analyse.</span>
                  </div>
                )}
              </div>
            </div>

            {/* KPI RÉFÉRENTIEL (§PxGxM) */}
            <div className="bg-[#151A2D] border-4 border-white/5 rounded-[5rem] p-16 shadow-4xl text-center backdrop-blur-md relative overflow-hidden">
               <Dna size={120} className="absolute -bottom-10 -right-10 text-blue-600 opacity-10" />
               <p className="text-[12px] font-black text-slate-500 uppercase tracking-[0.5em] mb-8 relative z-10 italic">Chaîne Logique SDE</p>
               
               {/* CORRECTION DU RENDU LATEX */}
               <div className="text-4xl font-black italic tracking-tighter leading-none text-blue-500 relative z-10 font-mono bg-black/60 p-8 rounded-[3rem] border-2 border-white/5 shadow-inner">
                  {"$$Why^5 \\rightarrow Root \\ Cause$$"}
               </div>
            </div>
          </aside>

          {/* 🛠️ COLONNE DROITE : LABORATOIRE D'ANALYSE (5 POURQUOI & ISHIKAWA) */}
          <div className="col-span-12 lg:col-span-8 space-y-16">
            
            {/* SECTION : LES 5 POURQUOI */}
            <div className="bg-[#151A2D] border-4 border-white/5 rounded-[6rem] p-20 shadow-4xl relative group backdrop-blur-3xl overflow-hidden">
              <div className="absolute left-0 top-24 w-4 h-64 bg-blue-600 rounded-r-full shadow-[0_0_50px_rgba(37,99,235,0.7)]" />

              <h2 className="text-5xl font-black uppercase italic mb-20 flex items-center gap-8 tracking-tighter text-white border-b-4 border-white/5 pb-10">
                <Zap className="text-blue-500" size={48} /> Méthode des 5 Pourquoi
              </h2>

              <div className="space-y-10 relative z-10">
                {whys.map((why, index) => (
                  <div key={index} className="flex flex-col md:flex-row items-start md:items-center gap-8 group/why">
                    <div className="w-24 h-24 rounded-[2.5rem] bg-black/60 border-4 border-white/5 flex items-center justify-center text-5xl font-black italic text-blue-600 shadow-inner group-hover/why:border-blue-600/40 group-hover/why:bg-blue-600/10 transition-all shrink-0">
                      {index + 1}
                    </div>
                    <div className="flex-1 w-full">
                      <input
                        value={why}
                        onChange={(e) => {
                          const newWhys = [...whys];
                          newWhys[index] = e.target.value.toUpperCase(); // Forcer majuscule pour SDE
                          setWhys(newWhys);
                        }}
                        disabled={!selectedNc}
                        placeholder={
                          !selectedNc ? "SÉLECTIONNEZ UN ÉCART SOURCE..." :
                          index === 0 ? "POURQUOI L'ÉVÉNEMENT S'EST-IL PRODUIT ?" : "POURQUOI CELA EST-IL ARRIVÉ ?"
                        }
                        className="w-full bg-black/40 border-b-4 border-white/5 p-10 text-3xl font-black uppercase italic text-white outline-none focus:border-blue-600 transition-all tracking-tighter placeholder:text-slate-800 disabled:opacity-50 disabled:cursor-not-allowed shadow-inner rounded-t-3xl"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* SECTION : ISHIKAWA 5M */}
            <div className="bg-[#151A2D] border-4 border-white/5 rounded-[6rem] p-20 shadow-4xl relative overflow-hidden group backdrop-blur-3xl">
              <GitBranch size={300} className="absolute -right-20 -bottom-20 text-blue-600 opacity-[0.03]" />
              
              <h2 className="text-5xl font-black uppercase italic mb-20 flex items-center gap-8 tracking-tighter text-white border-b-4 border-white/5 pb-10 relative z-10">
                <GitBranch className="text-blue-500" size={48} /> Diagramme d&apos;Ishikawa (5M)
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 relative z-10">
                {[
                  { key: "MAIN_DOEUVRE", label: "Main d'œuvre", info: "Compétences, formation, fatigue..." },
                  { key: "METHODE", label: "Méthode", info: "Procédures, instructions, modes opératoires..." },
                  { key: "MATERIEL", label: "Matériel", info: "Machines, outils, maintenance, GED..." },
                  { key: "MATIERE", label: "Matière", info: "Intrants, données, informations de base..." },
                  { key: "MILIEU", label: "Milieu", info: "Environnement, climat, espace de travail..." },
                ].map((m) => (
                  <div key={m.key} className="space-y-6">
                    <div className="flex justify-between items-center px-8">
                      <label className="text-[14px] font-black uppercase tracking-[0.5em] text-blue-500 italic flex items-center gap-4">
                        <span className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_10px_#3b82f6]"></span> {m.label}
                      </label>
                      <Info size={20} className="text-slate-600" />
                    </div>
                    <textarea
                      value={(ishikawa as any)[m.key]}
                      onChange={(e) => setIshikawa({ ...ishikawa, [m.key]: e.target.value })}
                      disabled={!selectedNc}
                      className="w-full bg-black/60 border-4 border-white/5 rounded-[4rem] p-10 text-xl font-bold italic text-slate-300 outline-none focus:border-blue-600 transition-all resize-none h-48 shadow-inner disabled:opacity-50 disabled:cursor-not-allowed placeholder:text-slate-800 tracking-wide uppercase"
                      placeholder={!selectedNc ? "ATTENTE SÉLECTION..." : m.info}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>

        {/* 🧩 FOOTER SDE (§10.2.1) */}
        <footer className="mt-32 pt-20 border-t-8 border-white/5 flex flex-col md:flex-row justify-between items-center opacity-40 hover:opacity-100 transition-opacity duration-700 w-full gap-10 group">
          <div className="flex items-center gap-10">
            <Fingerprint size={80} className="text-blue-600 group-hover:rotate-180 transition-all duration-3000" strokeWidth={2} />
            <div className="text-left">
              <p className="text-[20px] font-black uppercase tracking-[1em] text-slate-400 italic leading-none">SDE moteur</p>
              <p className="text-[12px] font-bold text-slate-600 uppercase tracking-[0.8em] mt-4 italic leading-none flex items-center gap-4">
                 Qualisoft RD 2030 <span className="w-1.5 h-1.5 rounded-full bg-slate-600"></span> ISO 9001 Investigations
              </p>
            </div>
          </div>
          <div className="flex items-center gap-16">
            <div className="flex flex-col items-end italic bg-white/5 px-8 py-4 rounded-3xl border-2 border-white/5 shadow-inner">
              <span className="text-[12px] font-black text-slate-500 uppercase tracking-[0.5em]">SMI Audit Trace</span>
              <span className="text-[18px] font-black text-blue-500 mt-2 uppercase tracking-widest">{selectedNc ? selectedNc.NC_Code : "NO_SELECTION"}</span>
            </div>
            <div className="flex gap-6">
              <div className="w-8 h-8 rounded-full bg-blue-600 shadow-[0_0_40px_rgba(37,99,235,0.8)] animate-pulse border-2 border-black" />
              <div className="w-8 h-8 rounded-full bg-slate-800 border-2 border-white/10" />
            </div>
          </div>
        </footer>
      </div>

      <style jsx global>{`
        ::-webkit-scrollbar { width: 0px; }
        * { scrollbar-width: none !important; -ms-overflow-style: none !important; }
        .custom-scrollbar::-webkit-scrollbar { width: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 20px; border: 2px solid #151A2D; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #2563eb; }
      `}</style>
    </div>
  );
}