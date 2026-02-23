/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * 🛰️ MODULE : REGISTRE GLOBAL DES NON-CONFORMITÉS (CAPA KERNEL)
 * -------------------------------------------------------------------------
 * RÔLE : Pilotage, centralisation et scellage des écarts système.
 * RÉFÉRENTIEL : types/elite-sde.ts (SCELLAGE PRISMA STRICT).
 * NORME : ISO 9001:2015 §10.2 (Non-conformité et action corrective).
 * DESIGN : Cockpit Matrix Full-Space (max-w-500).
 * -------------------------------------------------------------------------
 */

"use client";

import apiClient from "@/core/api/api-client";
import {
  Activity,
  AlertOctagon,
  ChevronRight,
  ClipboardCheck,
  Clock,
  Filter,
  Fingerprint,
  Loader2,
  MessageSquare,
  Plus,
  Search,
  ShieldAlert,
  Truck,
  X,
  Zap,
} from "lucide-react";
import Link from "next/link";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { toast, Toaster } from "sonner";

// --- 🏗️ RÉFÉRENTIEL ÉLITE-SDE (SCELLAGE KERNEL) ---
import {
  NonConformite as INonConformite,
  Processus as IProcessus,
  User as IUser,
  NCGravity,
  NCSource,
  NCStatus,
} from "@/types/elite-sde";

// --- 🛠️ UTILITAIRES SYSTÈME ---
const cn = (...classes: (string | boolean | undefined | null)[]) =>
  classes.filter(Boolean).join(" ");

// --- 🎨 MAPPING VISUEL DES SOURCES (ISO 9001 §9.3) ---
const SOURCE_MAP: Record<
  NCSource,
  {
    label: string;
    icon: React.ReactNode;
    color: string;
    bg: string;
    border: string;
  }
> = {
  [NCSource.CLIENT_COMPLAINT]: {
    label: "Réclamation Client",
    icon: <MessageSquare size={16} />,
    color: "text-rose-500",
    bg: "bg-rose-500/10",
    border: "border-rose-500/20",
  },
  [NCSource.INTERNAL_AUDIT]: {
    label: "Audit Interne",
    icon: <ClipboardCheck size={16} />,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
  },
  [NCSource.EXTERNAL_AUDIT]: {
    label: "Audit Externe",
    icon: <ShieldAlert size={16} />,
    color: "text-indigo-500",
    bg: "bg-indigo-500/10",
    border: "border-indigo-500/20",
  },
  [NCSource.SUPPLIER]: {
    label: "Fournisseur",
    icon: <Truck size={16} />,
    color: "text-amber-500",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
  },
  [NCSource.INCIDENT_SAFETY]: {
    label: "Incident SST",
    icon: <AlertOctagon size={16} />,
    color: "text-orange-500",
    bg: "bg-orange-500/10",
    border: "border-orange-500/20",
  },
  [NCSource.PROCESS_REVIEW]: {
    label: "Revue Processus",
    icon: <Activity size={16} />,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
  },
  [NCSource.MANAGEMENT_REVIEW]: {
    label: "Revue Direction",
    icon: <Fingerprint size={16} />,
    color: "text-slate-500",
    bg: "bg-slate-500/10",
    border: "border-slate-500/20",
  },
};

export default function NonConformitesGlobalPage() {
  // --- 📦 ÉTATS DU NOYAU SDE ---
  const [ncs, setNcs] = useState<
    (INonConformite & { Processus?: IProcessus; Detector?: IUser })[]
  >([]);
  const [processes, setProcesses] = useState<IProcessus[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isSlideOverOpen, setIsSlideOverOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // --- 📝 FORMULAIRE DE DÉTECTION (§10.2.1.a) ---
  const [formData, setFormData] = useState({
    NC_Libelle: "",
    NC_Description: "",
    NC_Source: NCSource.INTERNAL_AUDIT,
    NC_Gravite: NCGravity.MINEURE,
    NC_ProcessusId: "",
    NC_DetectorId: "",
  });

  /**
   * 📡 SYNCHRONISATION DU REGISTRE
   * @description Extraction multi-tenant des NC avec résolution des relations Processus/Detecteur.
   */
  const fetchRegistry = useCallback(async () => {
    try {
      setLoading(true);
      const [ncRes, prRes] = await Promise.all([
        apiClient.get("/non-conformites"),
        apiClient.get("/processus"),
      ]);

      const extract = (res: any) => res.data?.data || res.data || [];
      setNcs(extract(ncRes));
      setProcesses(extract(prRes));

      // Récupération de l'ID utilisateur pour le scellage de la détection
      const storageUser = localStorage.getItem("qualisoft-auth-storage");
      if (storageUser) {
        const parsed = JSON.parse(storageUser);
        const userId = parsed.state?.user?.U_Id || parsed.state?.user?.id;
        if (userId) setFormData((prev) => ({ ...prev, NC_DetectorId: userId }));
      }
    } catch (e: unknown) {
      toast.error(
        "RUPTURE SDE : REGISTRE NC INACCESSIBLE OU FILTRAGE TENANT CORROMPU.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRegistry();
  }, [fetchRegistry]);

  /**
   * 💾 SCELLAGE DE L'ÉCART DANS LE SMI
   */
  const handleScellage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.NC_ProcessusId)
      return toast.error("ATTRIBUTION PROCESSUS OBLIGATOIRE (§4.4)");

    const tid = toast.loading("TRANSMISSION AU NOYAU SDE...");
    try {
      await apiClient.post("/non-conformites", {
        ...formData,
        NC_Statut: NCStatus.DETECTION,
      });
      toast.success("ÉCART SCELLÉ DANS LE REGISTRE SDE.", { id: tid });
      setIsSlideOverOpen(false);
      setFormData((prev) => ({ ...prev, NC_Libelle: "", NC_Description: "" }));
      fetchRegistry();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "ERREUR DE COMMUTATION SDE", {
        id: tid,
      });
    }
  };

  /**
   * 🔍 FILTRAGE DYNAMIQUE (Search Engine)
   */
  const filteredNCs = useMemo(() => {
    return ncs.filter(
      (nc) =>
        nc.NC_Libelle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        nc.NC_Code?.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [ncs, searchQuery]);

  /**
   * 📊 KPI : CALCUL DU TAUX DE RÉACTIVITÉ
   * Logic: $$Rate = \frac{NC_{Cloture}}{NC_{Total}} \times 100$$
   */
  const reactivityRate = useMemo(() => {
    if (ncs.length === 0) return 0;
    const closed = ncs.filter((nc) => nc.NC_Statut === NCStatus.CLOTURE).length;
    return Math.round((closed / ncs.length) * 100);
  }, [ncs]);

  if (loading)
    return (
      <div className="ml-72 h-screen flex flex-col items-center justify-center bg-[#0B0F1A] gap-12">
        <Loader2
          className="animate-spin text-red-600"
          size={100}
          strokeWidth={1}
        />
        <span className="text-red-500 font-black uppercase italic tracking-[1.5em] text-[12px] animate-pulse">
          Syncing Matrix Registries...
        </span>
      </div>
    );

  return (
    <div className="h-screen bg-[#0B0F1A] ml-72 flex flex-col font-sans italic text-left overflow-hidden selection:bg-red-600/30 text-white relative">
      <Toaster position="top-right" richColors theme="dark" />

      {/* 🔝 HEADER COCKPIT (Saturation spatiale) */}
      <header className="h-40 px-16 flex items-center justify-between border-b-4 border-white/5 bg-[#0F172A]/80 backdrop-blur-3xl z-40 shadow-4xl shrink-0">
        <div className="flex items-center gap-12">
          <div className="p-8 bg-red-600/10 border-4 border-red-600/20 rounded-[3rem] shadow-4xl group">
            <Zap
              size={48}
              className="text-red-600 fill-current group-hover:scale-110 transition-transform"
              strokeWidth={3}
            />
          </div>
          <div className="space-y-4 text-left">
            <h1 className="text-7xl font-black uppercase text-white leading-none italic tracking-tighter">
              Pilotage <span className="text-red-600">NC</span>
            </h1>
            <div className="flex items-center gap-6">
              <span className="w-4 h-4 rounded-full bg-red-600 animate-pulse shadow-[0_0_20px_red]" />
              <p className="text-slate-500 font-black text-[12px] uppercase italic tracking-[0.6em] leading-none">
                SMI Sovereign Registry • {ncs.length} Dossiers Détectés
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-10">
          <div className="hidden lg:flex flex-col items-end px-10 border-r-2 border-white/5 italic">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
              Taux de Clôture SDE
            </span>
            <span className="text-3xl font-black text-emerald-500 tracking-tighter">
              {reactivityRate}%
            </span>
          </div>
          <button
            onClick={() => setIsSlideOverOpen(true)}
            className="bg-red-600 hover:bg-white hover:text-red-600 px-16 py-8 rounded-[3rem] font-black uppercase text-[12px] text-white flex items-center gap-6 transition-all shadow-4xl border-none cursor-pointer active:scale-95 italic"
          >
            <Plus size={32} strokeWidth={4} /> Déclarer Écart
          </button>
        </div>
      </header>

      {/* 📊 REGISTRE MATRIX CORE (max-w-500) */}
      <main className="flex-1 overflow-y-auto p-16 custom-scrollbar bg-black/40 relative">
        <div className="w-full max-w-500 mx-auto space-y-16">
          {/* SEARCH ENGINE NOYAU */}
          <div className="flex gap-10 items-center bg-[#151A2D] p-6 rounded-[3.5rem] border-4 border-white/5 shadow-inner">
            <div className="flex-1 bg-black/40 border-2 border-white/5 rounded-[2.5rem] px-10 py-6 flex items-center gap-8 focus-within:border-red-600/40 group transition-all">
              <Search
                size={32}
                className="text-slate-700 group-focus-within:text-red-600 transition-colors"
              />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                type="text"
                placeholder="FILTRER LE REGISTRE SDE PAR LIBELLÉ OU CODE..."
                className="bg-transparent border-none outline-none text-xl font-black uppercase italic text-white w-full placeholder:text-slate-900 tracking-widest"
              />
            </div>
            <button className="p-8 bg-white/5 border-2 border-white/10 rounded-4xl text-slate-600 hover:text-white transition-all cursor-pointer">
              <Filter size={32} />
            </button>
          </div>

          {/* MATRIX GRID SYSTEM */}
          <div className="bg-[#151A2D] border-4 border-white/5 rounded-[6rem] overflow-hidden shadow-4xl backdrop-blur-3xl">
            <table className="w-full text-left italic">
              <thead className="bg-black/60 text-[13px] font-black uppercase text-slate-600 tracking-[0.5em] border-b-4 border-white/5">
                <tr>
                  <th className="px-16 py-14">Origine §9.3</th>
                  <th className="px-16 py-14 w-2/5">Scénario d&apos;Écart</th>
                  <th className="px-16 py-14">Axe Processus</th>
                  <th className="px-16 py-14 text-center">Statut SDE</th>
                  <th className="px-16 py-14 text-right">Pilotage</th>
                </tr>
              </thead>
              <tbody className="divide-y-4 divide-white/5">
                {filteredNCs.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="p-64 text-center opacity-10 font-black uppercase tracking-[1.5em] text-4xl italic"
                    >
                      Aucun enregistrement
                    </td>
                  </tr>
                ) : (
                  filteredNCs.map((nc) => {
                    const ui =
                      SOURCE_MAP[nc.NC_Source] ||
                      SOURCE_MAP[NCSource.INTERNAL_AUDIT];
                    return (
                      <tr
                        key={nc.NC_Id}
                        className="hover:bg-red-600/3 transition-all group"
                      >
                        <td className="px-16 py-12">
                          <div
                            className={cn(
                              "inline-flex items-center gap-5 px-8 py-4 rounded-4xl border-2 shadow-2xl",
                              ui.bg,
                              ui.border,
                            )}
                          >
                            <span className={ui.color}>{ui.icon}</span>
                            <span
                              className={cn(
                                "text-[12px] font-black uppercase italic tracking-widest",
                                ui.color,
                              )}
                            >
                              {ui.label}
                            </span>
                          </div>
                        </td>

                        <td className="px-16 py-12">
                          <div className="flex flex-col gap-6 text-left">
                            <h4 className="text-4xl font-black text-white uppercase italic tracking-tighter leading-none group-hover:text-red-600 transition-colors">
                              {nc.NC_Libelle}
                            </h4>
                            <div className="flex items-center gap-8 text-[11px] font-black text-slate-600 uppercase italic tracking-[0.4em]">
                              <Clock size={16} className="text-red-600" />{" "}
                              DÉTECTION :{" "}
                              {new Date(nc.NC_CreatedAt).toLocaleDateString()}
                              <span className="text-slate-800">•</span>
                              <span className="text-slate-400 font-mono tracking-normal">
                                CODE:{" "}
                                {nc.NC_Code || `NC-${nc.NC_Id.slice(0, 6)}`}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="px-16 py-12">
                          <div className="flex items-center gap-6">
                            <div className="w-3 h-12 bg-blue-600 rounded-full shadow-[0_0_20px_blue]" />
                            <div className="text-left">
                              <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest leading-none mb-2">
                                Processus Pilote
                              </p>
                              <span className="text-xl font-black text-blue-500 uppercase italic tracking-widest leading-none">
                                {nc.Processus?.PR_Libelle || "NON ASSIGNÉ"}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="px-16 py-12 text-center">
                          <div
                            className={cn(
                              "px-10 py-4 rounded-4xl text-[12px] font-black uppercase border-2 tracking-[0.6em] inline-block shadow-inner",
                              nc.NC_Statut === NCStatus.CLOTURE
                                ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                                : "bg-red-600/10 text-red-600 border-red-600/20 animate-pulse",
                            )}
                          >
                            {nc.NC_Statut}
                          </div>
                        </td>

                        <td className="px-16 py-12 text-right">
                          <Link
                            href={`/dashboard/non-conformites/${nc.NC_Id}`}
                            className="p-8 bg-white/5 rounded-4xl hover:bg-red-600 transition-all text-slate-700 hover:text-white border-2 border-white/5 hover:border-red-600 shadow-4xl inline-flex items-center justify-center group/btn active:scale-90"
                          >
                            <ChevronRight
                              size={36}
                              className="group-hover/btn:translate-x-2 transition-transform"
                            />
                          </Link>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* 🧾 SLIDE OVER : DÉCLARATION NC (Laboratoire de Saisie) */}
      {isSlideOverOpen && (
        <div className="fixed inset-0 z-100 flex items-center justify-end">
          <div
            className="absolute inset-0 bg-black/90 backdrop-blur-3xl animate-in fade-in duration-500"
            onClick={() => setIsSlideOverOpen(false)}
          />
          <div className="relative h-full w-162.5 bg-[#0F172A] border-l-8 border-red-600 p-20 overflow-y-auto animate-in slide-in-from-right duration-700 italic text-left shadow-[0_0_100px_rgba(0,0,0,1)] custom-scrollbar">
            <header className="mb-24 border-b-4 border-white/5 pb-16 flex justify-between items-start">
              <div>
                <h2 className="text-6xl font-black uppercase italic tracking-tighter leading-none text-white">
                  Déclarer <span className="text-red-600">Écart</span>
                </h2>
                <p className="text-slate-600 text-[13px] font-black uppercase tracking-[0.8em] mt-6 italic leading-none">
                  Scellage Dossier §10.2.1
                </p>
              </div>
              <button
                onClick={() => setIsSlideOverOpen(false)}
                className="p-6 bg-white/5 rounded-3xl text-slate-500 hover:text-white hover:bg-red-600 transition-all border-none cursor-pointer"
              >
                <X size={32} />
              </button>
            </header>

            <form onSubmit={handleScellage} className="space-y-16 text-left">
              <div className="space-y-6">
                <label className="text-[14px] font-black uppercase text-slate-600 ml-10 block italic tracking-[0.6em] leading-none">
                  Objet de l&apos;Anomalie *
                </label>
                <input
                  required
                  value={formData.NC_Libelle}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      NC_Libelle: e.target.value.toUpperCase(),
                    })
                  }
                  type="text"
                  placeholder="DÉFINIR L'ÉCART EN QUELQUES MOTS..."
                  className="w-full bg-black/40 border-4 border-white/5 rounded-[3rem] p-12 text-3xl font-black italic text-white outline-none focus:border-red-600 shadow-inner tracking-tighter"
                />
              </div>

              <div className="grid grid-cols-2 gap-10 text-left">
                <div className="space-y-6">
                  <label className="text-[13px] font-black text-slate-600 ml-10 block uppercase italic tracking-[0.4em] leading-none">
                    Niveau de Gravité
                  </label>
                  <select
                    value={formData.NC_Gravite}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        NC_Gravite: e.target.value as NCGravity,
                      })
                    }
                    className="w-full bg-black/40 border-4 border-white/5 rounded-4xl p-10 text-xl font-black uppercase italic text-white outline-none focus:border-red-600 appearance-none shadow-inner cursor-pointer"
                  >
                    {Object.values(NCGravity).map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-6">
                  <label className="text-[13px] font-black text-slate-600 ml-10 block uppercase italic tracking-[0.4em] leading-none">
                    Source de Détection
                  </label>
                  <select
                    value={formData.NC_Source}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        NC_Source: e.target.value as NCSource,
                      })
                    }
                    className="w-full bg-black/40 border-4 border-white/5 rounded-4xl p-10 text-xl font-black uppercase italic text-white outline-none focus:border-red-600 appearance-none shadow-inner cursor-pointer"
                  >
                    {Object.entries(SOURCE_MAP).map(([key, config]) => (
                      <option key={key} value={key}>
                        {config.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-6 text-left">
                <label className="text-[13px] font-black text-blue-600 ml-10 block uppercase italic tracking-[0.4em] leading-none">
                  Unité de Management §4.4
                </label>
                <select
                  required
                  value={formData.NC_ProcessusId}
                  onChange={(e) =>
                    setFormData({ ...formData, NC_ProcessusId: e.target.value })
                  }
                  className="w-full bg-blue-600/5 border-4 border-blue-600/20 rounded-[2.5rem] p-10 text-2xl font-black uppercase italic text-blue-500 outline-none focus:border-blue-500 appearance-none shadow-inner cursor-pointer"
                >
                  <option value="">SÉLECTIONNER PROCESSUS...</option>
                  {processes.map((pr) => (
                    <option key={pr.PR_Id} value={pr.PR_Id}>
                      {pr.PR_Libelle}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-6 text-left">
                <label className="text-[13px] font-black text-slate-600 ml-10 block uppercase italic tracking-[0.4em] leading-none">
                  Exposé des Faits Constatés
                </label>
                <textarea
                  required
                  rows={8}
                  value={formData.NC_Description}
                  onChange={(e) =>
                    setFormData({ ...formData, NC_Description: e.target.value })
                  }
                  className="w-full bg-black/40 border-4 border-white/5 rounded-[4rem] p-16 text-2xl font-bold italic text-slate-300 outline-none focus:border-red-600 shadow-inner resize-none leading-relaxed"
                  placeholder="DÉCRIRE PRÉCISÉMENT LES ÉCARTS OBSERVÉS..."
                />
              </div>

              <button
                type="submit"
                className="w-full py-12 bg-red-600 rounded-[3.5rem] text-2xl font-black uppercase italic text-white flex items-center justify-center gap-8 hover:bg-white hover:text-red-600 transition-all border-none shadow-4xl active:scale-95 cursor-pointer"
              >
                <Zap size={48} fill="currentColor" /> Valider dans le Noyau
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 🧩 FOOTER DE TRAÇABILITÉ KERNEL */}
      <footer className="h-24 px-16 border-t-4 border-white/5 bg-[#0F172A]/80 flex justify-between items-center opacity-40 shrink-0 group">
        <div className="flex items-center gap-10">
          <Fingerprint
            size={48}
            className="text-red-600 group-hover:rotate-12 transition-transform"
            strokeWidth={2.5}
          />
          <div className="text-left leading-none space-y-2">
            <p className="text-[14px] font-black uppercase tracking-[1em] text-slate-500 italic">
              CAPA SOVEREIGN ENGINE
            </p>
            <p className="text-[10px] font-bold text-slate-700 uppercase tracking-[0.5em] italic">
              Elite RD 2030 Matrix Infrastructure
            </p>
          </div>
        </div>
        <div className="flex items-center gap-8">
          <Activity size={24} className="text-emerald-500 animate-pulse" />
          <span className="text-[11px] font-black uppercase tracking-[0.4em] text-emerald-600/50 italic">
            Registre SDE Opérationnel
          </span>
        </div>
      </footer>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 0px;
        }
        * {
          scrollbar-width: none !important;
          -ms-overflow-style: none !important;
        }
        input::placeholder,
        textarea::placeholder {
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
