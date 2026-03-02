/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * 🌍 MODULE : GESTION DES SITES & IMPLANTATIONS (VERSION ELITE SCELLÉE)
 * -------------------------------------------------------------------------
 * RÔLE : Point d'ancrage géographique du Système de Management Intégré (SMI).
 * ARCHITECTURE : Multi-Tenant Sovereign Data Environment (SDE). Responsive.
 * SÉCURITÉ : Zéro NextAuth. 100% apiClient.
 * DATE DE RÉVISION : 02 Mars 2026 | 14:40 GMT
 * -------------------------------------------------------------------------
 */

"use client";

import apiClient from "@/core/api/api-client";
import {
  AlertCircle,
  Building,
  Globe,
  Info,
  Loader2,
  MapPin,
  Navigation,
  Plus,
  RefreshCcw,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";
import { toast, Toaster } from "sonner";

// --- IMPORTATION DU RÉFÉRENTIEL SDE ---
interface Site {
  S_Id: string;
  S_Name: string;
  S_Address: string | null;
  S_City: string | null;
  S_Country: string | null;
  S_IsActive: boolean;
  tenantId: string;
  S_CreatedAt: string | Date;
  S_UpdatedAt: string | Date;
}

interface SiteFormData {
  S_Name: string;
  S_Address: string;
  S_City: string;
  S_Country: string;
}

export default function SitesPage() {
  // --- ÉTATS DE GESTION DU RÉFÉRENTIEL ---
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [formData, setFormData] = useState<SiteFormData>({
    S_Name: "",
    S_Address: "",
    S_City: "",
    S_Country: "Sénégal",
  });

  /**
   * 📡 SYNCHRONISATION DU RÉFÉRENTIEL GÉOGRAPHIQUE
   */
  const fetchSites = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMessage(null);
      const res = await apiClient.get("/sites");
      const data = res.data?.data || res.data;

      if (Array.isArray(data)) {
        setSites(data);
      } else {
        setSites([]);
      }
    } catch (err: any) {
      const msg = "Rupture de liaison avec le registre des sites. Vérifiez l'état du Kernel.";
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSites();
  }, [fetchSites]);

  /**
   * 💾 PROTOCOLE D'INDEXATION (POST)
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.S_Name.trim()) {
      toast.error("La désignation du site est obligatoire pour le scellage.");
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);
    const tid = toast.loading("Scellage de l'entité en cours...");

    try {
      await apiClient.post("/sites", formData);
      toast.success(`Entité "${formData.S_Name}" scellée avec succès dans le SDE.`, { id: tid });
      setFormData({ S_Name: "", S_Address: "", S_City: "", S_Country: "Sénégal" });
      fetchSites();
    } catch (err: any) {
      let message = "Une anomalie technique empêche l'enregistrement souverain.";
      if (err.response) {
        const backendMsg = err.response.data?.message;
        if (Array.isArray(backendMsg)) message = backendMsg.join(" • ");
        else if (backendMsg) message = backendMsg;
        else if (err.response.status === 403) message = "Privilèges insuffisants pour modifier le référentiel géographique.";
      }
      setErrorMessage(message);
      toast.error(message, { id: tid });
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * 🗑️ RÉVOCATION D'IMPLANTATION (DELETE)
   */
  const handleDelete = async (id: string, name: string) => {
    const confirmDestruction = window.confirm(
      `ALERTE SÉCURITÉ : Voulez-vous révoquer définitivement l'implantation "${name}" ? \nCette action est irréversible dans le SMI.`
    );
    if (!confirmDestruction) return;

    const toastId = toast.loading("Révocation de l'entité en cours...");
    try {
      await apiClient.delete(`/sites/${id}`);
      toast.success(`Le site "${name}" a été purgé du référentiel.`, { id: toastId });
      setSites((current) => current.filter((s) => s.S_Id !== id));
    } catch (err: any) {
      const msg = err.response?.data?.message || "Échec de l'opération de suppression.";
      toast.error(Array.isArray(msg) ? msg[0] : msg, { id: toastId });
    }
  };

  if (loading && sites.length === 0) return (
    <div className="flex min-h-screen ml-0 lg:ml-72 flex-col items-center justify-center bg-slate-50 gap-4">
      <div className="relative">
        <Loader2 className="animate-spin text-blue-600" size={60} strokeWidth={1.5} />
        <ShieldCheck className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-blue-600/30" size={20} />
      </div>
      <div className="text-center space-y-2">
        <p className="text-[11px] font-black uppercase tracking-[0.5em] text-blue-600 italic animate-pulse">
          Initialisation du référentiel géographique...
        </p>
        <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">
          Sovereign Data Environment 2030
        </p>
      </div>
    </div>
  );

  return (
    <div className="p-4 lg:p-8 space-y-6 lg:space-y-8 bg-slate-50 min-h-screen italic font-sans selection:bg-blue-600/30 ml-0 lg:ml-72 overflow-x-hidden">
      <Toaster position="top-right" richColors theme="light" />
      
      {/* 🏛️ EN-TÊTE SOUVERAIN */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 animate-in slide-in-from-top-4 duration-500">
        <div>
          <h1 className="text-2xl lg:text-3xl font-black uppercase tracking-tighter text-slate-900 flex items-center gap-4 italic m-0">
            <div className="p-3 bg-blue-600 rounded-2xl text-white shadow-xl shadow-blue-600/20 shrink-0">
              <MapPin size={24} strokeWidth={2.5} />
            </div>
            Sites & Implantations
          </h1>
          <p className="text-slate-500 font-bold text-[9px] lg:text-[10px] uppercase tracking-[0.3em] lg:tracking-[0.5em] mt-3 lg:mt-4 ml-1 opacity-70 flex items-center gap-2 m-0">
            <ShieldCheck size={14} className="text-blue-500 shrink-0" />
            Cartographie opérationnelle des pôles d&apos;activité • Périmètre SMI
          </p>
        </div>

        <button
          onClick={() => fetchSites()}
          className="flex items-center justify-center gap-2 text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-blue-600 transition-colors border-b border-transparent hover:border-blue-600 pb-1 cursor-pointer w-full md:w-auto"
        >
          <RefreshCcw size={14} /> Rafraîchir le registre
        </button>
      </div>

      

      {/* VISUALISATION HIÉRARCHIQUE */}
      <div className="bg-blue-600/5 border border-blue-600/10 p-4 lg:p-5 rounded-3xl flex items-start sm:items-center gap-4 animate-in fade-in duration-1000 shadow-inner">
        <Info className="text-blue-600 shrink-0 mt-0.5 sm:mt-0" size={20} />
        <p className="text-[9px] lg:text-[10px] font-bold text-blue-800 uppercase tracking-tighter leading-relaxed m-0">
          Cette cartographie assure la segmentation territoriale de vos processus et la traçabilité des audits multi-sites selon le référentiel ISO 9001.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 lg:gap-10">
        {/* 📋 COLONNE GAUCHE : FORMULAIRE D'INDEXATION SCELLÉ */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-4xl lg:rounded-[2.5rem] p-6 lg:p-8 shadow-xl border border-slate-200 lg:sticky lg:top-8 animate-in slide-in-from-left-4 duration-700">
            <div className="mb-6 lg:mb-8 border-b border-slate-100 pb-4 lg:pb-5">
              <h2 className="text-[10px] lg:text-[11px] font-black uppercase text-slate-800 flex items-center gap-3 italic m-0">
                <Plus size={18} className="text-blue-600 shrink-0" strokeWidth={3} /> Nouvelle Implantation
              </h2>
              <p className="text-[8px] text-slate-400 font-bold uppercase mt-2 tracking-widest m-0">Indexation au SDE Matrix</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 lg:space-y-6">
              <div className="space-y-2">
                <label className="text-[9px] lg:text-[10px] font-black uppercase text-slate-400 ml-2 italic tracking-widest">Désignation du Site *</label>
                <div className="relative group">
                  <Building className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-600 transition-colors" size={16} />
                  <input
                    required
                    placeholder="EX: SIÈGE SOCIAL"
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 py-3 lg:py-4 text-xs outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 font-black uppercase tracking-tighter transition-all shadow-inner placeholder:opacity-30"
                    value={formData.S_Name}
                    onChange={(e) => setFormData({ ...formData, S_Name: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[9px] lg:text-[10px] font-black uppercase text-slate-400 ml-2 italic tracking-widest">Localisation Précise *</label>
                <div className="relative group">
                  <Navigation className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-600 transition-colors" size={16} />
                  <input
                    required
                    placeholder="RUE, QUARTIER..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 py-3 lg:py-4 text-xs outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 font-bold italic transition-all shadow-inner"
                    value={formData.S_Address}
                    onChange={(e) => setFormData({ ...formData, S_Address: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 lg:gap-4">
                <div className="space-y-2">
                  <label className="text-[9px] lg:text-[10px] font-black uppercase text-slate-400 ml-2 italic tracking-widest">Ville *</label>
                  <input
                    required
                    placeholder="DAKAR"
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 lg:px-6 py-3 lg:py-4 text-xs outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 font-black uppercase italic transition-all shadow-inner"
                    value={formData.S_City}
                    onChange={(e) => setFormData({ ...formData, S_City: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] lg:text-[10px] font-black uppercase text-slate-400 ml-2 italic tracking-widest">Pays</label>
                  <input
                    required
                    placeholder="SÉNÉGAL"
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 lg:px-6 py-3 lg:py-4 text-xs outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 font-black uppercase italic transition-all shadow-inner"
                    value={formData.S_Country}
                    onChange={(e) => setFormData({ ...formData, S_Country: e.target.value })}
                  />
                </div>
              </div>

              {errorMessage && (
                <div className="p-3 lg:p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3 text-[9px] lg:text-[10px] font-black uppercase italic text-red-600 animate-in fade-in slide-in-from-top-2 shadow-sm">
                  <AlertCircle size={16} className="shrink-0" />
                  <span className="leading-tight tracking-widest">{errorMessage}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-slate-900 hover:bg-blue-600 disabled:opacity-50 text-white font-black uppercase py-4 lg:py-5 rounded-2xl text-[10px] lg:text-[11px] shadow-xl hover:shadow-blue-500/30 transition-all flex items-center justify-center gap-3 cursor-pointer tracking-[0.2em] italic active:scale-95 m-0"
              >
                {submitting ? <Loader2 className="animate-spin shrink-0" size={18} /> : <ShieldCheck size={18} className="shrink-0" />}
                {submitting ? "TRAITEMENT..." : "Valider L'IMPLANTATION"}
              </button>
            </form>
          </div>
        </div>

        {/* 🌐 COLONNE DROITE : REGISTRE DES ENTITÉS GÉOGRAPHIQUES */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-4xl lg:rounded-[3rem] shadow-xl border border-slate-200 overflow-hidden min-h-100 animate-in slide-in-from-right-4 duration-700">
            <div className="p-6 lg:p-8 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between bg-slate-50/50 backdrop-blur-md gap-4">
              <div className="flex items-center gap-4">
                <div className="p-2.5 bg-blue-600/10 rounded-xl">
                  <Globe size={20} className="text-blue-600" />
                </div>
                <div>
                  <h3 className="font-black uppercase italic text-xs lg:text-[13px] text-slate-800 tracking-tighter leading-none m-0">
                    Implantations Actives
                    <span className="text-blue-600 font-black ml-2 bg-blue-50 px-2.5 py-1 rounded-md text-[10px] lg:text-[11px] shadow-inner">
                      {sites.length}
                    </span>
                  </h3>
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-1.5 m-0">Sovereign Asset Core</p>
                </div>
              </div>
              <div className="hidden sm:block text-[8px] lg:text-[9px] font-black uppercase italic text-slate-400 tracking-widest opacity-60">
                © 2026 QUALISOFT RD
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 p-4 lg:p-8 gap-6 lg:gap-8">
              {sites.map((site) => (
                <div
                  key={site.S_Id}
                  className="group relative p-6 lg:p-8 rounded-4xl lg:rounded-4xl border border-slate-100 bg-slate-50/40 hover:bg-white hover:border-blue-600/30 hover:shadow-[0_20px_50px_rgba(37,99,235,0.1)] transition-all duration-500 ease-out"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex gap-4 lg:gap-6 items-start w-full">
                      <div className="w-12 h-12 lg:w-16 lg:h-16 bg-white border border-slate-100 rounded-2xl lg:rounded-3xl flex items-center justify-center text-blue-600 shadow-sm group-hover:bg-blue-600 group-hover:text-white group-hover:rotate-6 transition-all duration-500 shrink-0">
                        <MapPin size={24} strokeWidth={2.5} />
                      </div>
                      <div className="text-left space-y-1 flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 lg:gap-3">
                          <h4 className="text-sm lg:text-[15px] font-black uppercase italic text-slate-900 group-hover:text-blue-700 transition-colors tracking-tighter leading-none m-0 truncate">
                            {site.S_Name}
                          </h4>
                          {!site.S_IsActive && (
                            <span className="text-[8px] font-black bg-red-100 text-red-600 px-2 py-0.5 rounded-md uppercase w-fit">Inactif</span>
                          )}
                        </div>
                        <p className="text-[10px] lg:text-[11px] text-slate-500 mt-2 font-bold italic leading-relaxed truncate opacity-80 m-0">
                          {site.S_Address || "Aucune adresse"}
                        </p>
                        <div className="flex items-center gap-2 mt-4">
                          <span className={`w-2 h-2 rounded-full shrink-0 ${site.S_IsActive ? "bg-emerald-500" : "bg-slate-300"} animate-pulse`}></span>
                          <p className="text-[8px] lg:text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] italic truncate m-0">
                            {site.S_City}, {site.S_Country}
                          </p>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDelete(site.S_Id, site.S_Name)}
                      className="p-2.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-100 lg:opacity-0 lg:group-hover:opacity-100 border-none cursor-pointer shrink-0"
                      title="Révoquer l'implantation"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>

                  <div className="absolute bottom-4 right-6 lg:right-8 opacity-100 lg:opacity-0 lg:group-hover:opacity-40 transition-opacity">
                    <p className="text-[7px] font-black text-slate-400 uppercase m-0">ID: {site.S_Id.substring(0, 8)}</p>
                  </div>
                </div>
              ))}

              {/* ÉTAT VIDE : NÉANT GÉOGRAPHIQUE */}
              {sites.length === 0 && !loading && (
                <div className="col-span-1 md:col-span-2 py-20 lg:py-32 flex flex-col items-center justify-center text-slate-400 gap-6 border-4 border-dashed border-slate-100 rounded-[3rem] animate-in zoom-in duration-700">
                  <div className="w-20 h-20 lg:w-28 lg:h-28 bg-slate-50 rounded-full flex items-center justify-center shadow-inner relative">
                    <Globe size={40} className="opacity-10 text-slate-900 animate-spin" style={{ animationDuration: '4s' }} />
                    <AlertCircle className="absolute top-0 right-0 text-blue-600/40" size={20} />
                  </div>
                  <div className="text-center space-y-2 lg:space-y-3 px-4">
                    <p className="font-black uppercase text-xs lg:text-sm italic tracking-[0.2em] lg:tracking-[0.3em] text-slate-600 m-0">Néant géographique</p>
                    <p className="text-[9px] lg:text-[10px] font-bold italic opacity-60 uppercase tracking-tighter max-w-xs mx-auto leading-relaxed m-0">
                      L&apos;infrastructure Qualisoft Elite nécessite au moins une implantation physique pour activer les modules SMI.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}