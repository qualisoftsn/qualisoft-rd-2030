/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import apiClient from "@/core/api/api-client";
import {
  Activity,
  AlertCircle,
  Award,
  BookOpen,
  GraduationCap,
  Loader2,
  Plus,
  Search,
  ShieldCheck,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";

/**
 * 🛠️ UTILITAIRE DE STYLE
 */
const cn = (...classes: any[]) => classes.filter(Boolean).join(" ");

/**
 * 🎓 MODULE FORMATION & COMPÉTENCES (ISO 9001 §7.2)
 * Gère le cycle de vie des habilitations, de la planification à la validation des acquis.
 */
export default function FormationsPage() {
  // --- ÉTATS DU SYSTÈME ---
  const [formations, setFormations] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState("");

  /**
   * 🛰️ PROTOCOLE DE SYNCHRONISATION GPEC
   * Récupère les sessions de formation et le registre du personnel.
   */
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [fRes, uRes] = await Promise.all([
        apiClient.get("/formations"),
        apiClient.get("/users"),
      ]);
      setFormations(fRes.data || []);
      setUsers(uRes.data || []);
    } catch (err) {
      console.error("Erreur Sync GPEC:", err);
      toast.error("ERREUR DE SYNCHRONISATION GPEC");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  /**
   * 🔍 FILTRAGE ANALYTIQUE
   * Recherche croisée sur les titres de formation et les noms de collaborateurs.
   */
  const filteredFormations = useMemo(() => {
    return formations.filter((f) => {
      const searchTerm = search.toLowerCase();
      const userName =
        `${f.FOR_User?.U_FirstName} ${f.FOR_User?.U_LastName}`.toLowerCase();
      return (
        f.FOR_Title?.toLowerCase().includes(searchTerm) ||
        userName.includes(searchTerm)
      );
    });
  }, [formations, search]);

  /**
   * 🎨 GESTIONNAIRE DE STATUTS VISUELS
   */
  const getStatusColor = (status: string) => {
    switch (status) {
      case "VALIDÉ":
        return "text-emerald-500 bg-emerald-500/10 border-emerald-500/20";
      case "PLANIFIÉ":
        return "text-blue-500 bg-blue-500/10 border-blue-600/20";
      case "EXPIRÉ":
        return "text-red-500 bg-red-500/10 border-red-500/20";
      default:
        return "text-amber-500 bg-amber-500/10 border-amber-500/20";
    }
  };

  // --- ÉCRAN DE CHARGEMENT SYSTÈME ---
  if (loading)
    return (
      <div className="ml-72 flex h-screen items-center justify-center bg-[#0B0F1A] text-blue-500 font-black italic uppercase tracking-[0.4em] animate-pulse">
        <Activity className="animate-spin mr-4" size={32} /> INITIALISATION
        GPEC...
      </div>
    );

  return (
    <div className="min-h-screen bg-[#0B0F1A] text-white italic font-sans ml-72 flex flex-col uppercase font-black relative overflow-hidden selection:bg-blue-600/30">
      {/* 🧩 INJECTION DE STYLE POUR MASQUER LES SCROLLBARS (Clean Design) */}
      <style jsx global>{`
        ::-webkit-scrollbar {
          display: none !important;
        }
        * {
          scrollbar-width: none !important;
          -ms-overflow-style: none !important;
        }
      `}</style>

      {/* 🔝 HEADER : PILOTAGE COMPÉTENCES */}
      <header className="p-10 border-b border-white/5 flex justify-between items-center bg-[#0B0F1A]/80 backdrop-blur-3xl sticky top-0 z-50 shadow-2xl">
        <div className="text-left">
          <h1 className="text-4xl tracking-tighter italic font-black uppercase leading-none">
            PLAN <span className="text-blue-600">GPEC</span>
          </h1>
          <p className="text-slate-500 text-[10px] tracking-[0.4em] flex items-center gap-2 mt-3 italic">
            <ShieldCheck size={14} className="text-emerald-500" /> ISO 9001 §7.2
            • MAÎTRISE DES COMPÉTENCES
          </p>
        </div>
        <div className="flex gap-4">
          <div className="relative group">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-600 transition-colors"
              size={16}
            />
            <input
              placeholder="RECHERCHER COLLABORATEUR OU TITRE..."
              className="bg-white/5 border border-white/10 rounded-2xl px-12 py-4 text-[10px] outline-none focus:border-blue-600 w-80 italic font-black transition-all text-white"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-500 px-10 py-4 rounded-2xl text-[10px] flex items-center gap-3 active:scale-95 shadow-3xl shadow-blue-900/40 transition-all border-none text-white font-black italic cursor-pointer"
          >
            <Plus size={18} strokeWidth={3} /> PLANIFIER SESSION
          </button>
        </div>
      </header>

      {/* 🚀 MAIN CONTENT : REGISTRE DES HABILITATIONS */}
      <main className="p-12 flex-1 overflow-y-auto">
        <section className="bg-slate-900/40 border border-white/5 rounded-[3.5rem] overflow-hidden shadow-2xl backdrop-blur-md transition-all hover:border-blue-500/20">
          <div className="p-10 border-b border-white/5 bg-white/2 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <BookOpen size={24} className="text-blue-500" />
              <h3 className="text-sm tracking-[0.2em] italic uppercase font-black">
                REGISTRE DES HABILITATIONS & QUALIFICATIONS
              </h3>
            </div>
            <span className="text-[10px] text-slate-500 font-black tracking-widest">
              {filteredFormations.length} DOSSIERS ACTIFS
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="text-[10px] text-slate-600 border-b border-white/5 uppercase italic">
                <tr>
                  <th className="p-10 font-black tracking-widest">
                    COLLABORATEUR
                  </th>
                  <th className="p-10 font-black tracking-widest text-center">
                    FORMATION / TITRE DÉLIVRÉ
                  </th>
                  <th className="p-10 font-black tracking-widest text-right">
                    STATUT GPEC
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredFormations.length > 0 ? (
                  filteredFormations.map((f) => (
                    <tr
                      key={f.FOR_Id}
                      className="hover:bg-blue-600/5 transition-all group cursor-default"
                    >
                      <td className="p-10">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-blue-600/10 flex items-center justify-center text-blue-500 border border-blue-500/20 group-hover:scale-110 transition-transform">
                            <GraduationCap size={18} />
                          </div>
                          <span className="text-sm font-black tracking-tight">
                            {f.FOR_User?.U_FirstName} {f.FOR_User?.U_LastName}
                          </span>
                        </div>
                      </td>
                      <td className="p-10 text-center">
                        <div className="flex flex-col gap-1">
                          <span className="italic uppercase text-white font-black text-[12px]">
                            {f.FOR_Title}
                          </span>
                          <span className="text-[9px] text-slate-500 font-bold tracking-widest italic">
                            {f.FOR_Provider}
                          </span>
                        </div>
                      </td>
                      <td className="p-10 text-right">
                        <span
                          className={cn(
                            "px-6 py-2 rounded-xl text-[10px] font-black border italic tracking-widest",
                            getStatusColor(f.FOR_Status || "PLANIFIÉ"),
                          )}
                        >
                          {f.FOR_Status || "EN ATTENTE"}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="p-32 text-center">
                      <AlertCircle
                        size={48}
                        className="mx-auto text-slate-800 mb-6 opacity-20"
                      />
                      <p className="text-slate-600 font-black uppercase italic tracking-[0.5em] text-xs leading-relaxed">
                        AUCUN ENREGISTREMENT TROUVÉ DANS LE REGISTRE
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      {/* 📥 MODALE DE SAISIE STRATÉGIQUE (§10.2) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/98 backdrop-blur-2xl z-100 flex items-center justify-center p-6 animate-in fade-in duration-300">
          <form
            onSubmit={async (e: any) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const data = Object.fromEntries(formData.entries());

              setLoading(true);
              const tid = toast.loading("ENREGISTREMENT GPEC EN COURS...");
              try {
                // ✅ Normalisation des types avant envoi API Matrix
                await apiClient.post("/formations", {
                  ...data,
                  FOR_Date: new Date(data.FOR_Date as string).toISOString(),
                  FOR_Expiry: data.FOR_Expiry
                    ? new Date(data.FOR_Expiry as string).toISOString()
                    : null,
                });
                toast.success("SESSION PLANIFIÉE ET INDEXÉE", { id: tid });
                setIsModalOpen(false);
                fetchData();
              } catch (err: any) {
                console.error("Erreur POST Formation:", err);
                toast.error(
                  err.response?.data?.message?.[0] || "ERREUR DE SAISIE",
                  { id: tid },
                );
              } finally {
                setLoading(false);
              }
            }}
            className="bg-[#0F172A] w-full max-w-2xl rounded-[4rem] border border-white/10 p-16 space-y-10 shadow-4xl relative overflow-hidden italic text-left"
          >
            <div className="flex justify-between items-center border-b border-white/10 pb-10">
              <div>
                <h2 className="text-4xl italic font-black uppercase leading-none tracking-tighter">
                  PLANIFICATION <span className="text-blue-600">SESSION</span>
                </h2>
                <p className="text-[10px] text-slate-500 uppercase tracking-[0.3em] mt-3 italic font-black">
                  INDEXATION DU CAPITAL HUMAIN
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-4 bg-white/5 rounded-2xl text-slate-500 hover:text-red-500 transition-all border-none cursor-pointer"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-8 font-black italic">
              {/* LIBELLÉ FORMATION */}
              <div className="flex flex-col gap-3">
                <label className="text-[11px] text-slate-500 uppercase tracking-widest ml-4">
                  INTITULÉ DE LA FORMATION / HABILITATION *
                </label>
                <input
                  required
                  name="FOR_Title"
                  placeholder="EX: HABILITATION ÉLECTRIQUE B2V"
                  className="bg-white/5 border border-white/10 p-6 rounded-2xl text-[13px] text-white outline-none focus:border-blue-600 uppercase font-black"
                />
              </div>

              {/* BINÔME COLLABORATEUR / DATE */}
              <div className="grid grid-cols-2 gap-8">
                <div className="flex flex-col gap-3">
                  <label className="text-[11px] text-slate-500 uppercase tracking-widest ml-4">
                    COLLABORATEUR *
                  </label>
                  <select
                    required
                    name="FOR_UserId"
                    className="bg-white/5 border border-white/10 p-6 rounded-2xl text-[12px] text-white outline-none cursor-pointer font-black uppercase italic"
                  >
                    <option value="" className="bg-[#0F172A]">
                      SÉLECTIONNER...
                    </option>
                    {users.map((u) => (
                      <option
                        key={u.U_Id}
                        value={u.U_Id}
                        className="bg-[#0F172A]"
                      >
                        {u.U_FirstName} {u.U_LastName}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-3">
                  <label className="text-[11px] text-slate-500 uppercase tracking-widest ml-4">
                    DATE DE SESSION *
                  </label>
                  <input
                    required
                    name="FOR_Date"
                    type="date"
                    className="bg-white/5 border border-white/10 p-6 rounded-2xl text-[12px] text-white outline-none focus:border-blue-600 font-black"
                  />
                </div>
              </div>

              {/* BINÔME EXPIRATION / ORGANISME */}
              <div className="grid grid-cols-2 gap-8">
                <div className="flex flex-col gap-3">
                  <label className="text-[11px] text-slate-500 uppercase tracking-widest ml-4">
                    ÉCHÉANCE DE RECYCLAGE
                  </label>
                  <input
                    name="FOR_Expiry"
                    type="date"
                    className="bg-white/5 border border-white/10 p-6 rounded-2xl text-[12px] text-white outline-none focus:border-blue-600 font-black"
                  />
                </div>
                <div className="flex flex-col gap-3">
                  <label className="text-[11px] text-slate-500 uppercase tracking-widest ml-4">
                    ORGANISME PRESTATEUR *
                  </label>
                  <select
                    required
                    name="FOR_Provider"
                    className="bg-white/5 border border-white/10 p-6 rounded-2xl text-[12px] text-white outline-none cursor-pointer font-black italic uppercase"
                  >
                    <option value="INTERNE" className="bg-[#0F172A]">
                      FORMATION INTERNE
                    </option>
                    <option value="BUREAU VERITAS" className="bg-[#0F172A]">
                      BUREAU VERITAS
                    </option>
                    <option value="APAVE" className="bg-[#0F172A]">
                      APAVE
                    </option>
                    <option value="SGS" className="bg-[#0F172A]">
                      SGS
                    </option>
                    <option value="AFNOR" className="bg-[#0F172A]">
                      AFNOR
                    </option>
                    <option value="AUTRE" className="bg-[#0F172A]">
                      AUTRE (HORS LISTE)
                    </option>
                  </select>
                </div>
              </div>
            </div>

            {/* ACTION : VALIDATION SOUVERAINE */}
            <div className="pt-6">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 py-10 rounded-[2.5rem] font-black text-[13px] tracking-[0.5em] flex items-center justify-center gap-4 hover:bg-blue-500 transition-all shadow-3xl shadow-blue-900/40 border-none text-white italic cursor-pointer active:scale-95 disabled:opacity-50 group"
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={24} />
                ) : (
                  <Award
                    size={24}
                    className="group-hover:rotate-12 transition-transform"
                  />
                )}
                Valider L&apos;INSCRIPTION
              </button>
              <p className="text-[9px] text-slate-600 text-center mt-6 tracking-widest">
                EN VALIDANT, VOUS MISEZ SUR LE CAPITAL COMPÉTENCE DU SMI.
              </p>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
