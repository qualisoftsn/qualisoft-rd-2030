/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * NOM ABSOLU : src/app/dashboard/reclamations/nouveau/page.tsx
 * FONCTION : Interface de capture et de qualification initiale des plaintes.
 * NORME : ISO 10002 (Traitement des réclamations) & ISO 9001 §8.2.1.
 * LOGIQUE : Imputation processus obligatoire ou déclenchement automatique de NC Qualité.
 */

"use client";

import apiClient from "@/core/api/api-client";
import {
  AlertTriangle,
  ArrowLeft,
  Calendar,
  Info,
  Link2,
  Loader2,
  Save,
  ShieldAlert,
} from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useCallback, useEffect, useState } from "react";
import { toast } from "react-hot-toast";

export default function NouvelleReclamationPage() {
  const router = useRouter();

  // --- ÉTATS DES RÉFÉRENTIELS ---
  const [tiers, setTiers] = useState<any[]>([]);
  const [processus, setProcessus] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  // --- STRUCTURE DU DOSSIER D'ENTRÉE ---
  const [form, setForm] = useState({
    REC_Object: "",
    REC_Description: "",
    REC_Source: "MAIL",
    REC_DateReceipt: new Date().toISOString().split("T")[0],
    REC_Deadline: "",
    REC_Gravity: "MEDIUM",
    REC_TierId: "",
    REC_ProcessusId: "", // Pivot : Détermine si l'écart reste au niveau métier ou remonte en NC Qualité
  });

  /**
   * 📡 SYNCHRONISATION DES BASES DE DONNÉES
   * Récupère les tiers (Clients/Fns) et la cartographie des processus.
   */
  const fetchData = useCallback(async () => {
    try {
      setFetching(true);
      const [resTiers, resProc] = await Promise.all([
        apiClient.get("/tiers"),
        apiClient.get("/processus"),
      ]);
      setTiers(resTiers.data?.data || resTiers.data || []);
      setProcessus(resProc.data?.data || resProc.data || []);
    } catch (err) {
      toast.error("Échec de synchronisation des référentiels SMI");
    } finally {
      setFetching(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  /**
   * 💾 SCELLAGE DE LA RÉCLAMATION
   * Persistance du dossier dans le noyau Qualisoft.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Validation minimale de sécurité
    if (!form.REC_TierId) {
      toast.error("Identification du Tiers obligatoire (§8.2)");
      setLoading(false);
      return;
    }

    try {
      // Normalisation de l'objet avant transmission (Elite Standard)
      const payload = {
        ...form,
        REC_Object: form.REC_Object.toUpperCase().trim(),
      };

      await apiClient.post("/reclamations", payload);
      toast.success("Plainte enregistrée et mise sous surveillance.");
      router.push("/dashboard/reclamations");
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || "Erreur de scellage documentaire",
      );
    } finally {
      setLoading(false);
    }
  };

  // --- ÉCRAN DE CHARGEMENT SOUVERAIN ---
  if (fetching)
    return (
      <div className="ml-72 h-screen flex flex-col items-center justify-center bg-[#0B0F1A] gap-6">
        <Loader2 className="animate-spin text-blue-500" size={48} />
        <span className="text-blue-500 font-black uppercase tracking-[0.4em] text-[10px] italic animate-pulse">
          Scanning Infrastructure...
        </span>
      </div>
    );

  return (
    <div className="flex-1 bg-[#0B0F1A] min-h-screen p-12 ml-72 text-white font-sans italic selection:bg-blue-600/30">
      <div className="max-w-5xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
        {/* 🛰️ BARRE TACTIQUE D'EN-TÊTE */}
        <header className="flex justify-between items-center border-b border-white/5 pb-10">
          <div className="flex items-center gap-8">
            <button
              onClick={() => router.back()}
              className="p-5 bg-white/5 rounded-2xl hover:bg-white/10 transition-all border-none cursor-pointer text-white shadow-inner"
            >
              <ArrowLeft size={22} />
            </button>
            <div className="text-left">
              <h1 className="text-5xl font-black uppercase italic tracking-tighter leading-none">
                Enregistrer une <span className="text-blue-600">Plainte</span>
              </h1>
              <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.5em] mt-4 italic">
                Entrée SMI • Écoute Active des Parties Intéressées
              </p>
            </div>
          </div>
          <div className="p-4 bg-blue-600/5 border border-blue-500/20 rounded-2xl flex items-center gap-4">
            <ShieldAlert className="text-blue-500" size={20} />
            <span className="text-[10px] font-black uppercase tracking-widest text-blue-400">
              Canal de Traitement Certifié
            </span>
          </div>
        </header>

        {/* 📟 FORMULAIRE DE QUALIFICATION (§6.4 ISO 10002) */}
        <form
          onSubmit={handleSubmit}
          className="space-y-10 bg-slate-900/40 p-12 rounded-[4rem] border border-white/5 shadow-2xl backdrop-blur-3xl relative overflow-hidden text-left"
        >
          <div className="grid grid-cols-2 gap-12">
            {/* BLOC A : IDENTITÉ & SOURCE */}
            <div className="space-y-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase text-slate-500 ml-4 italic tracking-widest leading-none">
                  Objet de la réclamation (Libellé Radical)
                </label>
                <input
                  required
                  className="w-full bg-[#0B0F1A] border border-white/10 rounded-2xl p-6 text-base font-black uppercase italic text-white outline-none focus:border-blue-500 transition-all shadow-inner"
                  value={form.REC_Object}
                  onChange={(e) =>
                    setForm({ ...form, REC_Object: e.target.value })
                  }
                  placeholder="EX: NON-CONFORMITÉ LIVRAISON LOT #402"
                />
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase text-slate-500 ml-4 italic tracking-widest leading-none">
                  Canal de réception
                </label>
                <div className="relative">
                  <select
                    className="w-full bg-[#0B0F1A] border border-white/10 rounded-2xl p-6 text-sm font-black uppercase italic text-blue-400 outline-none focus:border-blue-500 transition-all appearance-none cursor-pointer shadow-inner"
                    value={form.REC_Source}
                    onChange={(e) =>
                      setForm({ ...form, REC_Source: e.target.value })
                    }
                  >
                    <option value="MAIL">Transmission par E-mail</option>
                    <option value="TELEPHONE">Appel Téléphonique (Mémo)</option>
                    <option value="COURRIER">Courrier Postal / LRAR</option>
                    <option value="PV_RECEPTION">
                      PV de Réception / Chantier
                    </option>
                    <option value="VISITE_CHANTIER">
                      Visite terrain / Audit
                    </option>
                    <option value="RECLAMATION_ORALE">
                      Signalement Oral (À documenter)
                    </option>
                  </select>
                </div>
              </div>
            </div>

            {/* BLOC B : TIERS & GRAVITÉ (§ISO 10002 §6.4) */}
            <div className="space-y-8 text-left">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase text-slate-500 ml-4 italic tracking-widest leading-none">
                  Organisme / Tiers Émetteur
                </label>
                <select
                  required
                  className="w-full bg-[#0B0F1A] border border-white/10 rounded-2xl p-6 text-[11px] font-black uppercase italic text-white outline-none focus:border-blue-500 transition-all cursor-pointer shadow-inner appearance-none"
                  value={form.REC_TierId}
                  onChange={(e) =>
                    setForm({ ...form, REC_TierId: e.target.value })
                  }
                >
                  <option value="">SÉLECTIONNER L&apos;ÉMETTEUR...</option>
                  {tiers.map((t) => (
                    <option key={t.TR_Id} value={t.TR_Id}>
                      {t.TR_Name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase text-slate-500 ml-4 italic tracking-widest leading-none">
                  Gravité estimée (Impact Opérationnel)
                </label>
                <select
                  className="w-full bg-[#0B0F1A] border border-white/10 rounded-2xl p-6 text-[11px] font-black uppercase italic text-white outline-none focus:border-blue-500 transition-all cursor-pointer shadow-inner appearance-none"
                  value={form.REC_Gravity}
                  onChange={(e) =>
                    setForm({ ...form, REC_Gravity: e.target.value })
                  }
                >
                  <option value="LOW" className="text-emerald-500">
                    MINEURE (Signalement simple)
                  </option>
                  <option value="MEDIUM" className="text-blue-500">
                    MOYENNE (Nécessite analyse métier)
                  </option>
                  <option value="HIGH" className="text-orange-500">
                    ÉLEVÉE (Action Corrective ISO requise)
                  </option>
                  <option value="CRITICAL" className="text-rose-500">
                    CRITIQUE (Urgence Direction / Alerte)
                  </option>
                </select>
              </div>
            </div>
          </div>

          {/* 💎 SECTION : IMPUTATION SMI & WORKFLOW PAQ */}
          <div className="bg-blue-600/5 p-10 rounded-[3rem] border border-blue-500/10 space-y-8 shadow-inner relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5 text-blue-500 rotate-12">
              <Link2 size={120} />
            </div>

            <div className="flex items-center gap-5 mb-4 leading-none relative z-10">
              <Link2 className="text-blue-500" size={24} />
              <h3 className="text-xl font-black uppercase italic tracking-tighter">
                Imputation au Processus Pilote
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-12 relative z-10 text-left">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-4 italic tracking-widest leading-none">
                  Processus Responsable
                </label>
                <select
                  className="w-full bg-[#0B0F1A] border border-white/10 rounded-2xl p-6 text-[11px] font-black uppercase italic text-white outline-none focus:border-blue-500 transition-all appearance-none cursor-pointer"
                  value={form.REC_ProcessusId}
                  onChange={(e) =>
                    setForm({ ...form, REC_ProcessusId: e.target.value })
                  }
                >
                  <option value="">
                    DÉTERMINATION AUTOMATIQUE (NC QUALITÉ)
                  </option>
                  {processus.map((p) => (
                    <option key={p.PR_Id} value={p.PR_Id}>
                      {p.PR_Libelle}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-4 italic tracking-widest leading-none">
                  Échéance de traitement impérative
                </label>
                <div className="relative">
                  <input
                    type="date"
                    className="w-full bg-[#0B0F1A] border border-white/10 rounded-2xl p-6 text-sm font-black uppercase italic text-white outline-none focus:border-blue-500 transition-all shadow-inner"
                    value={form.REC_Deadline}
                    onChange={(e) =>
                      setForm({ ...form, REC_Deadline: e.target.value })
                    }
                  />
                  <Calendar
                    className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-700 pointer-events-none"
                    size={20}
                  />
                </div>
              </div>
            </div>

            {/* ⚠️ ALERTE DE RUPTURE DE FLUX MÉTIER */}
            {!form.REC_ProcessusId && (
              <div className="flex items-start gap-5 bg-rose-500/10 p-6 rounded-2xl border border-rose-500/20 animate-pulse relative z-10 text-left">
                <AlertTriangle
                  size={24}
                  className="text-rose-500 shrink-0 mt-1"
                />
                <p className="text-[10px] font-black text-rose-500 uppercase italic tracking-tight leading-relaxed">
                  Attention : L&apos;absence d&apos;imputation à un processus
                  métier générera automatiquement une{" "}
                  <strong>Non-Conformité (NC)</strong> globale. Le dossier sera
                  transmis à l&apos;équipe Qualité pour analyse des causes
                  racines conformément à l&apos;ISO 9001 §10.2.
                </p>
              </div>
            )}
          </div>

          <div className="space-y-3 text-left">
            <label className="text-[10px] font-black uppercase text-slate-500 ml-4 italic tracking-widest leading-none">
              Exposé détaillé des faits & Preuves invoquées
            </label>
            <textarea
              required
              rows={5}
              className="w-full bg-[#0B0F1A] border border-white/10 rounded-[2.5rem] p-8 text-sm font-bold italic text-white outline-none focus:border-blue-500 transition-all shadow-inner resize-none leading-relaxed"
              value={form.REC_Description}
              onChange={(e) =>
                setForm({ ...form, REC_Description: e.target.value })
              }
              placeholder="Détailler les circonstances temporelles, les preuves fournies par le client et l'impact immédiat constaté..."
            />
          </div>

          {/* 🔘 BOUTONS D'ACTION SOUVERAINS */}
          <div className="flex flex-col gap-6 pt-10 border-t border-white/5">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 py-8 rounded-[2.5rem] font-black uppercase italic text-xs tracking-[0.4em] flex items-center justify-center gap-5 hover:bg-blue-500 transition-all shadow-[0_25px_60px_rgba(37,99,235,0.3)] border-none cursor-pointer disabled:opacity-50 active:scale-95 text-white"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={24} />
              ) : (
                <Save size={24} />
              )}
              Valider ET TRANSMETTRE AU PROCESSUS
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="w-full bg-transparent text-slate-600 hover:text-white transition-all font-black uppercase italic text-[10px] tracking-widest border-none cursor-pointer"
            >
              Annuler l&apos;enregistrement et quitter
            </button>
          </div>
        </form>

        {/* ℹ️ BLOC CONSEIL ISO */}
        <div className="flex items-center gap-6 p-10 bg-white/2 border border-white/5 rounded-[3.5rem] shadow-2xl">
          <div className="p-4 bg-amber-500/10 rounded-2xl text-amber-500 shadow-lg">
            <Info size={28} />
          </div>
          <p className="text-[11px] text-slate-500 font-bold italic leading-relaxed uppercase tracking-tighter text-left">
            <span className="text-amber-500 font-black">
              RAPPEL NORMATIF (§ISO 10002) :
            </span>{" "}
            Toute réclamation doit être traitée sans délai indu.
            L&apos;enregistrement initial doit être complet pour permettre une
            analyse objective. Si la plainte concerne la sécurité, augmentez la
            gravité à <span className="text-white">CRITIQUE</span> pour un
            traitement immédiat.
          </p>
        </div>
      </div>
    </div>
  );
}
