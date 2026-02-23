/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * 🛰️ MODULE : ANALYSE DES CAUSES RACINES (ROOT CAUSE ENGINE)
 * -------------------------------------------------------------------------
 * RÔLE : Détermination des causes fondamentales des écarts (§10.2.1.b).
 * MÉTHODES : 5 Pourquoi & Ishikawa (5M).
 * RÉFÉRENTIEL : types/elite-sde.ts (SCELLAGE PRISMA).
 * DESIGN : Cockpit Matrix Full-Space (max-w-500).
 * -------------------------------------------------------------------------
 */

"use client";

import apiClient from "@/core/api/api-client";
import {
  Dna,
  FileSearch,
  Fingerprint,
  GitBranch,
  Info,
  Loader2,
  Microscope,
  Save,
  Zap,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast, Toaster } from "sonner";

// --- 🏗️ RÉFÉRENTIEL ÉLITE-SDE ---
import { NonConformite as INC, NCStatus } from "@/types/elite-sde";

const cn = (...classes: (string | boolean | undefined | null)[]) =>
  classes.filter(Boolean).join(" ");

export default function RootCausePage() {
  // --- 📦 ÉTATS DU KERNEL ---
  const [ncList, setNcList] = useState<INC[]>([]);
  const [selectedNc, setSelectedNc] = useState<INC | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // --- 🧠 ÉTATS D'INVESTIGATION ---
  const [whys, setWhys] = useState<string[]>(["", "", "", "", ""]);
  const [ishikawa, setIshikawa] = useState({
    MAIN_DOEUVRE: "",
    METHODE: "",
    MILIEU: "",
    MATERIEL: "",
    MATIERE: "",
  });

  /**
   * 📡 SYNCHRONISATION DES ÉCARTS OUVERTS
   */
  const loadNCs = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get("/non-conformites");
      const data = Array.isArray(res.data) ? res.data : res.data?.data || [];
      // On ne traite que les NC ouvertes ou en cours
      setNcList(data.filter((nc: INC) => nc.NC_Statut !== NCStatus.CLOTURE));
    } catch (err) {
      toast.error("ÉCHEC DE SYNCHRONISATION DU REGISTRE NC.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNCs();
  }, [loadNCs]);

  /**
   * 💾 SCELLAGE DE L'INVESTIGATION (§10.2.1.b)
   */
  const handleSealAnalysis = async () => {
    if (!selectedNc) return;
    setIsSaving(true);
    const tid = toast.loading("Scellage de l'analyse causale...");
    try {
      await apiClient.patch(`/non-conformites/${selectedNc.NC_Id}/root-cause`, {
        NC_RootCause: whys.filter((w) => w).join(" -> "),
        NC_Ishikawa: ishikawa,
        NC_Status: NCStatus.EN_COURS,
      });
      toast.success("ANALYSE SCELLÉE : LA CAUSE RACINE EST INDEXÉE.", {
        id: tid,
      });
    } catch (err) {
      toast.error("ERREUR DE MUTATION KERNEL.", { id: tid });
    } finally {
      setIsSaving(false);
    }
  };

  if (loading)
    return (
      <div className="ml-72 h-screen flex flex-col items-center justify-center bg-[#0B0F1A] gap-8">
        <Loader2
          className="animate-spin text-blue-600"
          size={80}
          strokeWidth={1}
        />
        <span className="text-blue-500 font-black uppercase italic tracking-[1em] text-[10px]">
          Initialisation Lab Cause...
        </span>
      </div>
    );

  return (
    <div className="p-16 bg-[#0B0F1A] min-h-screen ml-72 text-white italic font-sans text-left relative selection:bg-blue-600/30 overflow-x-hidden">
      <Toaster position="top-right" richColors />

      {/* 🔝 HEADER INVESTIGATEUR (max-w-500) */}
      <header className="mb-20 flex justify-between items-center w-full max-w-500 mx-auto border-b-4 border-white/5 pb-16">
        <div className="space-y-6">
          <div className="flex items-center gap-6">
            <Microscope className="text-blue-600 animate-pulse" size={32} />
            <p className="text-slate-500 font-black text-[12px] uppercase tracking-[0.6em] italic">
              ISO 9001:2015 §10.2.1 • Root Cause Analysis
            </p>
          </div>
          <h1 className="text-8xl font-black uppercase italic tracking-tighter leading-none">
            Analyse <span className="text-blue-600">des Causes</span>
          </h1>
        </div>

        <button
          onClick={handleSealAnalysis}
          disabled={!selectedNc || isSaving}
          className="px-20 py-8 bg-blue-600 rounded-[3rem] text-[13px] font-black uppercase flex items-center gap-8 shadow-4xl hover:bg-white hover:text-blue-600 transition-all border-none cursor-pointer italic disabled:opacity-20"
        >
          {isSaving ? (
            <Loader2 className="animate-spin" size={28} />
          ) : (
            <Save size={28} />
          )}{" "}
          Valider l&apos;Analyse
        </button>
      </header>

      <main className="w-full max-w-500 mx-auto grid grid-cols-12 gap-16">
        {/* 📋 SÉLECTION DE L'ANOMALIE SOURCE */}
        <div className="col-span-12 lg:col-span-4 space-y-12">
          <div className="bg-[#151A2D] border-4 border-white/5 rounded-[5rem] p-12 shadow-4xl relative overflow-hidden group">
            <h3 className="text-[13px] font-black uppercase text-slate-500 mb-12 tracking-[0.8em] flex items-center gap-6 italic leading-none">
              <FileSearch size={24} className="text-blue-500" /> Registre des
              Écarts
            </h3>
            <div className="space-y-6 max-h-150 overflow-y-auto no-scrollbar">
              {ncList.map((nc) => (
                <button
                  key={nc.NC_Id}
                  onClick={() => setSelectedNc(nc)}
                  className={cn(
                    "w-full p-8 rounded-[2.5rem] border-2 text-left transition-all italic group/item",
                    selectedNc?.NC_Id === nc.NC_Id
                      ? "bg-blue-600 border-transparent shadow-2xl scale-105"
                      : "bg-black/20 border-white/5 hover:border-blue-600/30",
                  )}
                >
                  <p
                    className={cn(
                      "text-[10px] font-black uppercase mb-2 tracking-widest",
                      selectedNc?.NC_Id === nc.NC_Id
                        ? "text-white"
                        : "text-blue-500",
                    )}
                  >
                    {nc.NC_Code} • {nc.NC_Source}
                  </p>
                  <h4 className="text-xl font-black uppercase tracking-tighter leading-tight line-clamp-2">
                    {nc.NC_Title}
                  </h4>
                </button>
              ))}
            </div>
          </div>

          {/* KPI RÉFÉRENTIEL (§PxGxM) */}
          <div className="bg-[#151A2D] border-4 border-white/5 rounded-[4rem] p-12 shadow-4xl text-center">
            <Dna size={60} className="text-blue-600 mx-auto mb-8 opacity-20" />
            <p className="text-[12px] font-black text-slate-600 uppercase tracking-[0.4em] mb-4">
              Chaîne Logique
            </p>
            <div className="text-3xl font-black italic tracking-tighter leading-none text-white">
              {"$$Why^5 \\rightarrow Root \\ Cause$$"}
            </div>
          </div>
        </div>

        {/* 🛠️ LABORATOIRE D'ANALYSE (5 POURQUOI & ISHIKAWA) */}
        <div className="col-span-12 lg:col-span-8 space-y-16">
          {/* SECTION : LES 5 POURQUOI */}
          <div className="bg-[#151A2D] border-4 border-white/5 rounded-[6rem] p-16 shadow-4xl relative group">
            <div className="absolute left-0 top-20 w-4 h-48 bg-blue-600 rounded-r-full shadow-[0_0_50px_rgba(37,99,235,0.7)]" />

            <h2 className="text-5xl font-black uppercase italic mb-16 flex items-center gap-10 tracking-tighter">
              <Zap className="text-blue-500" size={40} /> Méthode des 5 Pourquoi
            </h2>

            <div className="space-y-8">
              {whys.map((why, index) => (
                <div key={index} className="flex items-center gap-10 group/why">
                  <div className="w-20 h-20 rounded-3xl bg-black/40 border-2 border-white/5 flex items-center justify-center text-4xl font-black italic text-blue-600 shadow-inner group-hover/why:border-blue-600/30 transition-all">
                    {index + 1}
                  </div>
                  <div className="flex-1 relative">
                    <input
                      value={why}
                      onChange={(e) => {
                        const newWhys = [...whys];
                        newWhys[index] = e.target.value;
                        setWhys(newWhys);
                      }}
                      placeholder={
                        index === 0
                          ? "Pourquoi l'événement s'est-il produit ?"
                          : "Pourquoi cela est-il arrivé ?"
                      }
                      className="w-full bg-black/20 border-b-4 border-white/5 p-8 text-2xl font-black uppercase italic text-white outline-none focus:border-blue-600 transition-all tracking-tighter placeholder:text-slate-900"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION : ISHIKAWA 5M */}
          <div className="bg-[#151A2D] border-4 border-white/5 rounded-[6rem] p-16 shadow-4xl relative overflow-hidden group">
            <h2 className="text-5xl font-black uppercase italic mb-16 flex items-center gap-10 tracking-tighter">
              <GitBranch className="text-blue-500" size={40} /> Diagramme
              d&apos;Ishikawa (5M)
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {[
                {
                  key: "MAIN_DOEUVRE",
                  label: "Main d'œuvre",
                  info: "Compétences, formation, fatigue...",
                },
                {
                  key: "METHODE",
                  label: "Méthode",
                  info: "Procédures, instructions, modes opératoires...",
                },
                {
                  key: "MATERIEL",
                  label: "Matériel",
                  info: "Machines, outils, maintenance, GED...",
                },
                {
                  key: "MATIERE",
                  label: "Matière",
                  info: "Intrants, données, informations de base...",
                },
                {
                  key: "MILIEU",
                  label: "Milieu",
                  info: "Environnement, climat, espace de travail...",
                },
              ].map((m) => (
                <div key={m.key} className="space-y-4">
                  <div className="flex justify-between items-center px-6">
                    <label className="text-[13px] font-black uppercase tracking-[0.4em] text-blue-500 italic">
                      {m.label}
                    </label>
                    <Info size={16} className="text-slate-700" />
                  </div>
                  <textarea
                    value={(ishikawa as any)[m.key]}
                    onChange={(e) =>
                      setIshikawa({ ...ishikawa, [m.key]: e.target.value })
                    }
                    className="w-full bg-black/20 border-4 border-white/5 rounded-[3rem] p-8 text-lg font-bold italic text-slate-300 outline-none focus:border-blue-600 transition-all resize-none h-32 shadow-inner"
                    placeholder={m.info}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* 🧩 FOOTER SDE (§10.2.1) */}
      <footer className="mt-48 pt-20 border-t-8 border-white/5 flex justify-between items-center opacity-40 w-full max-w-500 mx-auto group">
        <div className="flex items-center gap-10">
          <Fingerprint
            size={60}
            className="text-blue-600 group-hover:rotate-360 transition-all duration-3000"
            strokeWidth={2.5}
          />
          <div className="text-left">
            <p className="text-[16px] font-black uppercase tracking-[1.5em] text-slate-500 italic leading-none">
              SDE moteur
            </p>
            <p className="text-[12px] font-bold text-slate-700 uppercase tracking-[0.8em] mt-4 italic leading-none">
              Qualisoft RD 2030 • ISO 9001 Investigations
            </p>
          </div>
        </div>
        <div className="flex items-center gap-20">
          <div className="flex flex-col items-end italic">
            <span className="text-[14px] font-black text-slate-600 uppercase tracking-widest">
              SMI Audit Trace
            </span>
            <span className="text-[18px] font-mono text-blue-900 mt-3 font-black uppercase">
              {selectedNc ? selectedNc.NC_Code : "NO_SELECTION"}
            </span>
          </div>
          <div className="flex gap-8">
            <div className="w-6 h-6 rounded-full bg-blue-600 shadow-[0_0_30px_blue] animate-pulse" />
            <div className="w-6 h-6 rounded-full bg-emerald-600" />
          </div>
        </div>
      </footer>

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        textarea::placeholder,
        input::placeholder {
          font-style: italic;
          opacity: 0.1;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.4em;
          color: white;
        }
      `}</style>
    </div>
  );
}
