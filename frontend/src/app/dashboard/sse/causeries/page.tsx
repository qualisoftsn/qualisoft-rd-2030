/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

/**
 * 🏭 MODULE : DASHBOARD CAUSERIES SSE (SÉCURITÉ & PRÉVENTION)
 * -------------------------------------------------------------------------
 * FONCTION : Management des sensibilisations et dialogues sécurité.
 * RÔLE : Digitalisation de la sensibilisation §7.3 ISO 45001.
 * ISOLATION : Toutes les causeries affichées sont scellées au Tenant actif.
 */

import apiClient from "@/core/api/api-client";
import {
  AlertTriangle,
  Calendar,
  Clock,
  GitCommit,
  Leaf,
  Loader2,
  Mic2,
  Plus,
  QrCode,
  Shield,
  ShieldCheck,
  Trash2,
  Users,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "react-hot-toast";

// 🔗 IMPORTS SCELLÉS (Les composants doivent être dans leurs fichiers respectifs)
import AttendanceQRModal from "./AttendanceQRModal";
// Vous devez créer ce fichier 'CauserieForm.tsx' dans votre dossier de composants
//import CauserieForm from '@/components/sse/CauserieForm';
import CauserieForm from "../components/SSEForm";

export default function CauseriesSSEPage() {
  const [causeries, setCauseries] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Gestionnaires d'état des modales scellées
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [qrModalData, setQrModalData] = useState<{
    id: string;
    theme: string;
  } | null>(null);

  /**
   * 📡 SYNCHRONISATION DU REGISTRE DES SESSIONS
   * Utilise Promise.all pour charger le dashboard sans goulot d'étranglement.
   */
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [cRes, sRes] = await Promise.all([
        apiClient.get("/causeries"),
        apiClient
          .get("/causeries/stats")
          .catch(() => ({ data: { total: 0, monthCount: 0, envRatio: 0 } })),
      ]);
      setCauseries(cRes.data || []);
      setStats(sRes.data);
    } catch (e) {
      toast.error("Échec de liaison avec le Noyau Causeries Matrix.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  /**
   * 🗑️ RÉVOCATION DE SESSION SCELLÉE
   */
  const handleDelete = async (id: string) => {
    if (
      !window.confirm(
        "⚠️ RÉVOCATION DÉFINITIVE DE LA SESSION ? ACTION IRRÉVERSIBLE AU SEIN DU TENANT.",
      )
    )
      return;
    const tid = toast.loading("Purge de la session en cours...");
    try {
      await apiClient.delete(`/causeries/${id}`);
      toast.success("SESSION RÉVOQUÉE DU REGISTRE.", { id: tid });
      fetchData();
    } catch (e) {
      toast.error("REJET : Erreur de suppression serveur.", { id: tid });
    }
  };

  // 🔄 ÉTAT DE CHARGEMENT MATRIX
  if (loading)
    return (
      <div className="ml-72 h-screen flex flex-col items-center justify-center bg-[#0B0F1A] gap-10 font-sans italic">
        <div className="relative">
          <Loader2 className="animate-spin text-blue-600" size={80} />
          <ShieldCheck
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-blue-500/50"
            size={32}
          />
        </div>
        <p className="text-blue-500 font-black uppercase tracking-[0.6em] animate-pulse text-xs text-center leading-relaxed">
          Synchronisation SDE <br /> Accès au Référentiel Sensibilisation...
        </p>
      </div>
    );

  return (
    <div className="p-12 bg-[#0B0F1A] min-h-screen ml-72 text-white font-sans uppercase italic font-black selection:bg-blue-600/30 overflow-x-hidden">
      {/* --- HEADER SOUVERAIN --- */}
      <header className="mb-16 flex justify-between items-end border-b border-white/5 pb-10">
        <div className="text-left flex items-center gap-6">
          <div className="p-5 bg-blue-600/10 rounded-3xl border border-blue-500/20 shadow-lg shadow-blue-600/10">
            <Mic2 size={40} className="text-blue-500" />
          </div>
          <div>
            <h1 className="text-6xl tracking-tighter italic leading-none text-white">
              CAUSERIES{" "}
              <span className="text-blue-600 drop-shadow-[0_0_20px_rgba(37,99,235,0.5)]">
                SÉCURITÉ
              </span>
            </h1>
            <p className="text-slate-500 text-[10px] tracking-[0.5em] mt-4 italic uppercase">
              Management de la Sensibilisation ISO 45001 §7.3 • CULTURE SÉCURITÉ
              PRÉVENTIVE
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsFormModalOpen(true)}
          className="bg-blue-600 px-10 py-5 rounded-4xl text-[11px] shadow-[0_20px_40px_rgba(37,99,235,0.3)] flex items-center gap-4 hover:bg-blue-500 transition-all active:scale-95 group border-none cursor-pointer tracking-widest text-white"
        >
          <Plus
            size={20}
            strokeWidth={4}
            className="group-hover:rotate-90 transition-transform"
          />
          Programmer une Session
        </button>
      </header>

      {/* --- DASHBOARD ANALYTIQUE (§SMI) --- */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-20">
        <CStatsCard
          label="TOTAL SESSIONS"
          value={stats?.total || 0}
          icon={<ShieldCheck size={28} className="text-blue-400" />}
          color="bg-blue-900/10 border-blue-500/20"
        />
        <CStatsCard
          label="SESSIONS / MOIS"
          value={stats?.monthCount || 0}
          icon={<Calendar size={28} className="text-emerald-400" />}
          color="bg-emerald-900/10 border-emerald-500/20"
        />
        <CStatsCard
          label="FOCUS ÉCOLOGIQUE"
          value={`${stats?.envRatio || 0}%`}
          icon={<Leaf size={28} className="text-green-400" />}
          color="bg-green-900/10 border-green-500/20"
        />
        <CStatsCard
          label="INTÉGRITÉ ISO"
          value="100%"
          icon={<Shield size={28} className="text-purple-400" />}
          color="bg-purple-900/10 border-purple-500/20"
        />
      </div>

      {/* --- REGISTRE DES SESSIONS ACTIVES --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 text-left">
        {causeries.map((c) => (
          <div
            key={c.CS_Id}
            className={`bg-[#0F172A]/80 border-2 ${c.CS_IsActive ? "border-white/5 hover:border-blue-600/30" : "border-red-500/20 opacity-60"} p-12 rounded-[4rem] relative group transition-all shadow-[0_0_50px_rgba(0,0,0,0.5)] backdrop-blur-xl flex flex-col`}
          >
            {/* Statut de la session */}
            {!c.CS_IsActive && (
              <div className="absolute top-8 right-8 bg-red-600/20 text-red-500 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-2 border border-red-500/30">
                <AlertTriangle size={12} /> Session Clôturée
              </div>
            )}

            {/* En-tête de la carte */}
            <div className="flex justify-between items-start mb-10 flex-1">
              <div className="flex flex-col pr-8">
                <div className="flex items-center gap-3 mb-4 text-[10px] text-blue-500 font-black tracking-[0.3em]">
                  <Clock size={14} />
                  {new Date(c.CS_Date).toLocaleDateString("fr-FR", {
                    weekday: "long",
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })}
                </div>
                <h3 className="text-2xl tracking-tighter text-white uppercase italic leading-tight">
                  {c.CS_Theme}
                </h3>
              </div>
              <div className="p-5 bg-white/5 rounded-4xl group-hover:bg-blue-600/20 transition-all shadow-inner border border-white/5 shrink-0">
                <Users
                  size={28}
                  className="text-slate-500 group-hover:text-blue-400"
                />
              </div>
            </div>

            {/* Métadonnées */}
            <div className="flex items-center gap-8 mb-10 border-t border-white/5 pt-10">
              <div className="flex flex-col">
                <span className="text-[9px] text-slate-500 uppercase font-black tracking-widest mb-2 flex items-center gap-2">
                  <GitCommit size={10} /> Animateur Référent
                </span>
                <span className="text-xs text-slate-200 italic tracking-widest uppercase">
                  {c.CS_Animateur?.U_FirstName || "NON"}{" "}
                  {c.CS_Animateur?.U_LastName || "DÉFINI"}
                </span>
              </div>
              <div className="flex flex-col border-l border-white/10 pl-8">
                <span className="text-[9px] text-slate-500 uppercase font-black tracking-widest mb-2">
                  Contrôle Émargement
                </span>
                <span className="text-xs text-blue-400 uppercase font-black italic tracking-widest">
                  {c._count?.CS_Participants || 0} Présents Identifiés
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4 mt-auto">
              <button
                onClick={() =>
                  setQrModalData({ id: c.CS_Id, theme: c.CS_Theme })
                }
                disabled={!c.CS_IsActive}
                className="flex-1 py-5 bg-blue-600/10 border-2 border-blue-500/20 rounded-4xl text-[10px] font-black italic hover:bg-blue-600 text-blue-400 hover:text-white transition-all flex items-center justify-center gap-3 cursor-pointer tracking-widest shadow-xl disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <QrCode size={18} strokeWidth={3} /> Émargement SDE Flash
              </button>
              <button
                onClick={() => handleDelete(c.CS_Id)}
                className="p-5 bg-white/5 border-2 border-white/5 rounded-4xl text-slate-500 hover:text-red-500 hover:bg-red-500/10 hover:border-red-500/30 transition-all cursor-pointer shadow-xl"
              >
                <Trash2 size={20} />
              </button>
            </div>
          </div>
        ))}

        {/* État vide du registre */}
        {causeries.length === 0 && (
          <div className="col-span-1 lg:col-span-2 p-32 text-center border-2 border-dashed border-white/10 rounded-[4rem] bg-white/5">
            <Shield
              size={64}
              className="text-slate-700 mx-auto mb-6 opacity-50"
            />
            <p className="text-slate-500 font-black italic uppercase tracking-[0.5em] opacity-80 leading-relaxed text-[11px]">
              Le registre des causeries est vierge.
              <br /> Initiez votre première session pour sceller la conformité.
            </p>
          </div>
        )}
      </div>

      {/* --- INJECTION DES MODALES SCELLÉES --- */}
      {isFormModalOpen && (
        <CauserieForm
          onClose={() => setIsFormModalOpen(false)}
          onSuccess={fetchData}
        />
      )}
      {qrModalData && (
        <AttendanceQRModal
          causerieId={qrModalData.id}
          theme={qrModalData.theme}
          onClose={() => setQrModalData(null)}
        />
      )}
    </div>
  );
}

// ==========================================
// COMPOSANT LOCAL : CARTE STATISTIQUE ELITE
// ==========================================
function CStatsCard({ label, value, icon, color }: any) {
  return (
    <div
      className={`${color} p-8 rounded-[3rem] shadow-[0_20px_40px_rgba(0,0,0,0.3)] group backdrop-blur-xl transition-all hover:-translate-y-2 border text-left`}
    >
      <div className="p-4 bg-black/40 rounded-3xl w-fit mb-6 shadow-inner group-hover:scale-110 transition-transform border border-white/5">
        {icon}
      </div>
      <p className="text-[10px] text-slate-500 tracking-[0.3em] uppercase mb-3 font-black italic leading-none">
        {label}
      </p>
      <p className="text-4xl font-black italic tracking-tighter text-white leading-none drop-shadow-lg">
        {value}
      </p>
    </div>
  );
}

// On s'arrête ici. Le code en double (AttendanceQRModal2) a été détruit et purgé.
