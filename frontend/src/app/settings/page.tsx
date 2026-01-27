"use client";

import apiClient from "@/core/api/api-client";
import {
  Activity,
  AlertCircle,
  Building2,
  Calendar,
  ChevronRight,
  CreditCard,
  Globe,
  Loader2,
  Lock,
  Mail,
  Save,
  ShieldCheck,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";

// --- INTERFACE STRICTE ---
interface ITenant {
  T_Id: string;
  T_Name: string;
  T_Email: string;
  T_Domain: string;
  T_Plan: string;
  T_SubscriptionStatus: string;
  T_SubscriptionEndDate: string;
  T_CreatedAt: string;
  T_IsActive: boolean;
  T_Phone?: string;
}

export default function SettingsPage() {
  const [tenant, setTenant] = useState<ITenant | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 1️⃣ CHARGEMENT SÉCURISÉ (ANTI-BOUCLE)
  const loadSettings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await apiClient.get<ITenant>("/admin/tenant/me");
      if (res.data) {
        setTenant(res.data);
      } else {
        setError("Aucune donnée reçue du noyau.");
      }
    } catch (err) {
      console.error("Défaut de synchronisation paramètres:", err);
      setError("Erreur d'accès aux droits du Tenant. Vérifiez votre session.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  // 2️⃣ SAUVEGARDE DES MODIFICATIONS
  const handleSave = async () => {
    if (!tenant) return;
    setSaving(true);
    try {
      await apiClient.patch(`/admin/tenant/${tenant.T_Id}`, tenant);
      alert("PROTOCOLE DE MISE À JOUR RÉUSSI");
    } catch (err) {
      alert("ERREUR : Échec de l'enregistrement sur le noyau.");
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div className="ml-72 flex h-screen flex-col items-center justify-center bg-[#0B0F1A]">
        <Loader2 className="animate-spin text-blue-500 mb-4" size={40} />
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-500 italic animate-pulse">
          Analyse des privilèges Qualisoft...
        </p>
      </div>
    );

  if (error || !tenant)
    return (
      <div className="ml-72 flex h-screen flex-col items-center justify-center bg-[#0B0F1A] p-10">
        <AlertCircle className="text-red-500 mb-4" size={48} />
        <p className="text-sm font-black uppercase text-white italic text-center max-w-md">
          {error || "Échec critique de l'analyse des droits."}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="mt-8 px-8 py-4 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase italic hover:bg-white/10 transition-all"
        >
          Réinitialiser la connexion
        </button>
      </div>
    );

  return (
    <div className="flex-1 bg-[#0B0F1A] min-h-screen p-10 ml-72 text-white font-sans italic text-left relative overflow-x-hidden">
      {/* HEADER ELITE */}
      <header className="flex justify-between items-end mb-12 border-b border-white/5 pb-10">
        <div>
          <div className="flex items-center gap-3 text-blue-500 mb-3 font-black uppercase tracking-[0.5em] text-[10px]">
            <Activity size={16} /> System Configuration Hub
          </div>
          <h1 className="text-5xl font-black uppercase italic tracking-tighter leading-none">
            Paramètres <span className="text-blue-500">SMI</span>
          </h1>
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.4em] mt-4">
            ID INSTANCE : {tenant.T_Id} &bull; QUALISOFT ELITE RD 2030
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-blue-600 hover:bg-blue-500 text-white px-10 py-5 rounded-2xl font-black uppercase italic text-xs shadow-2xl shadow-blue-900/40 flex items-center gap-3 transition-all active:scale-95 disabled:opacity-50"
        >
          {saving ? (
            <Loader2 className="animate-spin" size={18} />
          ) : (
            <Save size={18} />
          )}
          Sauvegarder les modifications
        </button>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
        {/* COLONNE GAUCHE : IDENTITÉ SOCIÉTÉ */}
        <div className="xl:col-span-2 space-y-8">
          <section className="bg-slate-900/40 border border-white/5 p-10 rounded-[3.5rem] shadow-2xl backdrop-blur-xl relative overflow-hidden">
            <div className="flex items-center gap-4 mb-12">
              <div className="w-12 h-12 bg-blue-600/10 rounded-2xl flex items-center justify-center text-blue-500 border border-blue-500/20">
                <Building2 size={24} />
              </div>
              <h2 className="text-2xl font-black uppercase italic tracking-tighter italic">
                Identité de l&apos;Organisation
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">
                  Désignation Sociale
                </label>
                <input
                  type="text"
                  value={tenant.T_Name}
                  onChange={(e) =>
                    setTenant({ ...tenant, T_Name: e.target.value })
                  }
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-sm font-bold focus:border-blue-500 outline-none transition-all italic shadow-inner"
                />
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">
                  Domaine d&apos;activité
                </label>
                <div className="relative">
                  <Globe
                    className="absolute left-5 top-5 text-slate-500"
                    size={20}
                  />
                  <input
                    type="text"
                    value={tenant.T_Domain}
                    onChange={(e) =>
                      setTenant({ ...tenant, T_Domain: e.target.value })
                    }
                    className="w-full pl-14 pr-5 py-5 bg-white/5 border border-white/10 rounded-2xl text-sm font-bold outline-none focus:border-blue-500 transition-all italic"
                  />
                </div>
              </div>

              <div className="space-y-3 md:col-span-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">
                  Contact Administratif principal
                </label>
                <div className="relative">
                  <Mail
                    className="absolute left-5 top-5 text-slate-500"
                    size={20}
                  />
                  <input
                    type="email"
                    value={tenant.T_Email}
                    onChange={(e) =>
                      setTenant({ ...tenant, T_Email: e.target.value })
                    }
                    className="w-full pl-14 pr-5 py-5 bg-white/5 border border-white/10 rounded-2xl text-sm font-bold outline-none focus:border-blue-500 transition-all italic"
                  />
                </div>
              </div>
            </div>
          </section>

          <section className="bg-slate-900/40 border border-white/5 p-10 rounded-[3.5rem] shadow-2xl backdrop-blur-xl">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500 border border-emerald-500/20">
                <ShieldCheck size={24} />
              </div>
              <h2 className="text-2xl font-black uppercase italic tracking-tighter">
                Sûreté & Traçabilité
              </h2>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-8 bg-white/5 rounded-[2rem] border border-white/5 group hover:bg-white/8 transition-all">
                <div className="text-left">
                  <p className="text-xs font-black uppercase italic tracking-tight">
                    Statut de Certification de l&apos;Instance
                  </p>
                  <p className="text-[10px] text-slate-500 font-bold uppercase mt-2 italic tracking-widest">
                    Vérifié par Qualisoft Master Guard
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-[10px] font-black uppercase text-emerald-500 italic tracking-widest">
                    Actif & Sécurisé
                  </span>
                  <div className="w-4 h-4 bg-emerald-500 rounded-full shadow-[0_0_20px_rgba(16,185,129,0.4)] animate-pulse"></div>
                </div>
              </div>
              <p className="text-[9px] text-slate-500 font-bold uppercase ml-8 italic tracking-widest">
                Initialisation du Tenant :{" "}
                {new Date(tenant.T_CreatedAt).toLocaleDateString("fr-FR", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
          </section>
        </div>

        {/* COLONNE DROITE : ABONNEMENT QUALISOFT */}
        <div className="space-y-8">
          <div className="bg-blue-600 p-12 rounded-[4rem] shadow-2xl shadow-blue-900/40 relative overflow-hidden group">
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-16 text-left">
                <CreditCard className="text-white/40" size={40} />
                <span className="bg-white/20 text-white text-[9px] font-black px-6 py-2.5 rounded-2xl uppercase tracking-[0.2em] border border-white/10 backdrop-blur-md italic">
                  STATUS: {tenant.T_SubscriptionStatus}
                </span>
              </div>
              <p className="text-blue-100 text-[10px] font-black uppercase tracking-[0.4em] mb-4 italic">
                Plan de Licence
              </p>
              <h3 className="text-6xl font-black text-white italic uppercase tracking-tighter mb-12 leading-none">
                {tenant.T_Plan}
              </h3>

              <div className="pt-10 border-t border-white/20 space-y-6 text-white/80 text-[11px] font-bold italic">
                <div className="flex justify-between items-center uppercase tracking-tighter">
                  <span className="flex items-center gap-3">
                    <Calendar size={16} /> Renouvellement
                  </span>
                  <span className="text-white font-black">
                    {new Date(tenant.T_SubscriptionEndDate).toLocaleDateString(
                      "fr-FR",
                    )}
                  </span>
                </div>
                <button className="w-full bg-white text-blue-600 py-5 rounded-2xl transition-all font-black uppercase text-[10px] flex items-center justify-center gap-3 mt-6 shadow-xl active:scale-95 hover:bg-blue-50">
                  Upgrade Master Plan <ChevronRight size={16} />
                </button>
              </div>
            </div>
            {/* Déco fond */}
            <div className="absolute -bottom-16 -right-16 w-64 h-64 bg-white/10 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-1000"></div>
          </div>

          {/* ZONE DE DANGER */}
          <div className="p-10 border border-red-500/20 bg-red-500/5 rounded-[3.5rem] space-y-8">
            <div className="flex gap-6 text-left">
              <Lock className="text-red-500 shrink-0" size={28} />
              <div>
                <p className="text-sm font-black text-red-500 uppercase italic leading-none mb-4">
                  Isolement de l&apos;Instance
                </p>
                <p className="text-[10px] text-red-500/60 font-bold italic leading-relaxed uppercase tracking-tight">
                  La suspension immédiate entraînera l&apos;arrêt des services
                  pour tous vos collaborateurs. Cette action est enregistrée
                  dans l&apos;Audit Log global.
                </p>
                <button className="mt-8 px-10 py-4 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/20 rounded-2xl text-[9px] font-black uppercase italic transition-all duration-500">
                  Exécuter Suspension
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
