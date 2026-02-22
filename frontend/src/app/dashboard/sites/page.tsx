/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * 🌍 MODULE : GESTION DES SITES & IMPLANTATIONS (VERSION ELITE SCELLÉE)
 * -------------------------------------------------------------------------
 * RÔLE : Point d'ancrage géographique du Système de Management Intégré (SMI).
 * ARCHITECTURE : Multi-Tenant Sovereign Data Environment (SDE).
 * RÉFÉRENTIEL : types/elite-sde.ts (Prisma Core).
 * CONFORMITÉ : ISO 9001:2015 (§4.4), ISO 14001, ISO 45001.
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  MapPin, Plus, Trash2, Loader2, Globe, 
  Building, Navigation, CheckCircle2, AlertCircle,
  ShieldCheck, RefreshCcw, Info
} from 'lucide-react';
import apiClient from '@/core/api/api-client';
import { toast } from 'sonner';

// --- IMPORTATION DU RÉFÉRENTIEL SDE ---
// Note : On définit l'interface locale pour correspondre exactement à types/elite-sde.ts
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

/**
 * @interface SiteFormData
 * @description Structure de données pour l'indexation d'une nouvelle entité physique.
 */
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

  // --- ÉTAT DU FORMULAIRE D'INDEXATION (SDE ALIGNED) ---
  const [formData, setFormData] = useState<SiteFormData>({
    S_Name: '',
    S_Address: '',
    S_City: '',
    S_Country: 'Sénégal',
  });

  /**
   * 📡 SYNCHRONISATION DU RÉFÉRENTIEL GÉOGRAPHIQUE
   * @function fetchSites
   * @description Récupère les implantations rattachées au tenant actif.
   * L'isolation est garantie par le middleware backend via le token de session.
   */
  const fetchSites = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMessage(null);
      
      // Appel au Kernel Matrix
      const res = await apiClient.get('/sites');
      
      // Gestion des formats de réponse API Qualisoft (Data Wrapping)
      const data = res.data?.data || res.data;
      
      if (Array.isArray(data)) {
        setSites(data);
      } else {
        console.warn("Format de données non standard détecté");
        setSites([]);
      }
    } catch (err: unknown) {
      console.error("❌ Erreur critique SDE (FetchSites):", err);
      const msg = "Rupture de liaison avec le registre des sites. Vérifiez l'état du Kernel.";
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  // Déclenchement automatique au montage du module
  useEffect(() => {
    fetchSites();
  }, [fetchSites]);

  /**
   * 💾 PROTOCOLE D'INDEXATION (POST)
   * @function handleSubmit
   * @description Valide et scelle une nouvelle implantation dans le coffre-fort de données.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation de surface
    if (!formData.S_Name.trim()) {
      toast.error("La désignation du site est obligatoire pour le scellage.");
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);

    try {
      /**
       * Le payload respecte strictement la nomenclature Prisma S_Id, S_Name, etc.
       * Le tenantId est injecté par le backend pour garantir l'isolation.
       */
      const response = await apiClient.post('/sites', formData);

      // Notification de succès avec feedback nominal
      toast.success(`Entité "${formData.S_Name}" scellée avec succès dans le SDE.`);
      
      // Reset du formulaire
      setFormData({
        S_Name: '',
        S_Address: '',
        S_City: '',
        S_Country: 'Sénégal',
      });
      
      // Rafraîchissement synchrone du registre
      fetchSites();

    } catch (err: any) {
      console.error("❌ Échec d'indexation Site:", err);
      
      let message = "Une anomalie technique empêche l'enregistrement souverain.";
      
      // Parsing des erreurs NestJS / Prisma
      if (err.response) {
        const backendMsg = err.response.data?.message;
        if (Array.isArray(backendMsg)) {
          message = backendMsg.join(' • ');
        } else if (backendMsg) {
          message = backendMsg;
        } else if (err.response.status === 403) {
          message = "Privilèges insuffisants pour modifier le référentiel géographique.";
        }
      }

      setErrorMessage(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * 🗑️ RÉVOCATION D'IMPLANTATION (DELETE)
   * @function handleDelete
   * @param id Identifiant S_Id unique de l'entité
   * @param name Désignation pour confirmation visuelle
   */
  const handleDelete = async (id: string, name: string) => {
    // Double validation de sécurité RD 2030
    const confirmDestruction = window.confirm(
      `ALERTE SÉCURITÉ : Voulez-vous révoquer définitivement l'implantation "${name}" ? \nCette action est irréversible dans le SMI.`
    );
    
    if (!confirmDestruction) return;

    const toastId = toast.loading("Révocation de l'entité en cours...");

    try {
      await apiClient.delete(`/sites/${id}`);
      
      toast.dismiss(toastId);
      toast.success(`Le site "${name}" a été purgé du référentiel.`);
      
      // Mutation optimiste pour garantir une UI ultra-fluide
      setSites(current => current.filter(s => s.S_Id !== id));
      
    } catch (err: any) {
      toast.dismiss(toastId);
      console.error("❌ Erreur de révocation:", err);
      const msg = err.response?.data?.message || "Échec de l'opération de suppression.";
      toast.error(Array.isArray(msg) ? msg[0] : msg);
    }
  };

  // --- ÉCRAN DE SYNCHRONISATION INITIALE (LOADER SDE) ---
  if (loading) return (
    <div className="flex h-screen flex-col items-center justify-center bg-slate-50 gap-4">
      <div className="relative">
        <Loader2 className="animate-spin text-blue-600" size={60} strokeWidth={1.5} />
        <ShieldCheck className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-blue-600/30" size={20} />
      </div>
      <div className="text-center space-y-2">
        <p className="text-[11px] font-black uppercase tracking-[0.5em] text-blue-600 italic animate-pulse">
          Initialisation du référentiel géographique...
        </p>
        <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Sovereign Data Environment 2030</p>
      </div>
    </div>
  );

  return (
    <div className="p-8 space-y-8 bg-slate-50 min-h-screen italic font-sans selection:bg-blue-600/30">
      
      {/* 🏛️ EN-TÊTE SOUVERAIN */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 animate-in slide-in-from-top-4 duration-500">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tighter text-slate-900 flex items-center gap-4 italic">
            <div className="p-3 bg-blue-600 rounded-2xl text-white shadow-xl shadow-blue-600/20">
              <MapPin size={28} strokeWidth={2.5} />
            </div>
            Sites & Implantations
          </h1>
          <p className="text-slate-500 font-bold text-[10px] uppercase tracking-[0.5em] mt-4 ml-1 opacity-70 flex items-center gap-2">
            <ShieldCheck size={12} className="text-blue-500" />
            Cartographie opérationnelle des pôles d&apos;activité • Périmètre SMI
          </p>
        </div>
        
        <button 
          onClick={() => fetchSites()} 
          className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-blue-600 transition-colors border-b border-transparent hover:border-blue-600 pb-1"
        >
          <RefreshCcw size={14} /> Rafraîchir le registre
        </button>
      </div>

      {/* VISUALISATION HIÉRARCHIQUE */}
      <div className="bg-blue-600/5 border border-blue-600/10 p-4 rounded-3xl flex items-center gap-4 animate-in fade-in duration-1000">
        <Info className="text-blue-600 shrink-0" size={20} />
        <p className="text-[10px] font-bold text-blue-800 uppercase tracking-tighter leading-relaxed">
          

[Image of organizational site hierarchy]
 - Cette cartographie assure la segmentation territoriale de vos processus et la traçabilité des audits multi-sites selon le référentiel ISO.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
        
        {/* 📋 COLONNE GAUCHE : FORMULAIRE D'INDEXATION SCELLÉ */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-[2.5rem] p-8 shadow-2xl border border-slate-200 sticky top-8 animate-in slide-in-from-left-4 duration-700">
            <div className="mb-8 border-b border-slate-100 pb-5">
              <h2 className="text-[11px] font-black uppercase text-slate-800 flex items-center gap-3 italic">
                <Plus size={18} className="text-blue-600" strokeWidth={3} /> Nouvelle Implantation
              </h2>
              <p className="text-[8px] text-slate-400 font-bold uppercase mt-2 tracking-widest">Indexation au SDE Matrix</p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* NOM DU SITE (S_Name) */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-2 italic tracking-widest">Désignation du Site *</label>
                <div className="relative group">
                   <Building className="absolute left-4 top-4 text-slate-300 group-focus-within:text-blue-600 transition-colors duration-300" size={16} />
                   <input 
                    required 
                    placeholder="EX: SIÈGE SOCIAL" 
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-5 py-4 text-xs outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 font-black uppercase tracking-tighter transition-all shadow-inner placeholder:opacity-30"
                    value={formData.S_Name} 
                    onChange={e => setFormData({...formData, S_Name: e.target.value})} 
                   />
                </div>
              </div>

              {/* ADRESSE PHYSIQUE (S_Address) */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-2 italic tracking-widest">Localisation Précise *</label>
                <div className="relative group">
                   <Navigation className="absolute left-4 top-4 text-slate-300 group-focus-within:text-blue-600 transition-colors duration-300" size={16} />
                   <input 
                    required 
                    placeholder="RUE, AVENUE, QUARTIER..." 
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-5 py-4 text-xs outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 font-bold italic transition-all shadow-inner"
                    value={formData.S_Address} 
                    onChange={e => setFormData({...formData, S_Address: e.target.value})} 
                   />
                </div>
              </div>

              {/* VILLE (S_City) & PAYS (S_Country) */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-2 italic tracking-widest">Ville *</label>
                  <input 
                    required 
                    placeholder="DAKAR" 
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-xs outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 font-black uppercase italic transition-all shadow-inner"
                    value={formData.S_City} 
                    onChange={e => setFormData({...formData, S_City: e.target.value})} 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-2 italic tracking-widest">Pays</label>
                  <input 
                    required 
                    placeholder="SÉNÉGAL" 
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-xs outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 font-black uppercase italic transition-all shadow-inner"
                    value={formData.S_Country} 
                    onChange={e => setFormData({...formData, S_Country: e.target.value})} 
                  />
                </div>
              </div>

              {/* FEEDBACK DES ERREURS API (DÉCODAGE MATRIX) */}
              {errorMessage && (
                <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3 text-[10px] font-black uppercase italic text-red-600 animate-in fade-in slide-in-from-top-2">
                  <AlertCircle size={16} className="shrink-0" />
                  <span className="leading-tight tracking-widest">{errorMessage}</span>
                </div>
              )}

              {/* BOUTON D'ACTION PRINCIPAL SCELLÉ */}
              <button 
                type="submit" 
                disabled={submitting} 
                className="w-full bg-slate-900 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black uppercase py-5 rounded-2xl text-[11px] shadow-2xl hover:shadow-blue-500/40 transition-all duration-300 flex items-center justify-center gap-3 cursor-pointer tracking-[0.2em] italic active:scale-95"
              >
                {submitting ? <Loader2 className="animate-spin" size={18} /> : <ShieldCheck size={18} />}
                {submitting ? 'TRAITEMENT EN COURS...' : 'SCELLER L\'IMPLANTATION'}
              </button>

            </form>
          </div>
        </div>

        {/* 🌐 COLONNE DROITE : REGISTRE DES ENTITÉS GÉOGRAPHIQUES */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-[3rem] shadow-2xl border border-slate-200 overflow-hidden min-h-160 animate-in slide-in-from-right-4 duration-700">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 backdrop-blur-md">
                <div className="flex items-center gap-4">
                    <div className="p-2 bg-blue-600/10 rounded-xl">
                      <Globe size={22} className="text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-black uppercase italic text-[13px] text-slate-800 tracking-tighter leading-none">
                        Implantations Actives 
                        <span className="text-blue-600 font-black ml-2 bg-blue-50 px-3 py-1 rounded-full text-[11px]">
                          {sites.length}
                        </span>
                      </h3>
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-1">Sovereign Asset Core • Tenant ID Secured</p>
                    </div>
                </div>
                <div className="hidden md:block text-[9px] font-black uppercase italic text-slate-400 tracking-widest opacity-60">
                  © 2026 QUALISOFT RD 2030
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 p-8 gap-8">
              {sites.map((site) => (
                <div key={site.S_Id} className="group relative p-8 rounded-4xl border border-slate-100 bg-slate-50/40 hover:bg-white hover:border-blue-600/30 hover:shadow-[0_20px_50px_rgba(37,99,235,0.1)] transition-all duration-500 ease-out">
                  <div className="flex justify-between items-start">
                    <div className="flex gap-6 items-start">
                      {/* Icône dynamique ELITE */}
                      <div className="w-16 h-16 bg-white border border-slate-100 rounded-3xl flex items-center justify-center text-blue-600 shadow-sm group-hover:bg-blue-600 group-hover:text-white group-hover:rotate-6 transition-all duration-500 shrink-0">
                        <MapPin size={28} strokeWidth={2.5} />
                      </div>
                      <div className="text-left space-y-1">
                        <div className="flex items-center gap-3">
                          <h4 className="text-[15px] font-black uppercase italic text-slate-900 group-hover:text-blue-700 transition-colors tracking-tighter leading-none">{site.S_Name}</h4>
                          {!site.S_IsActive && <span className="text-[8px] font-black bg-red-100 text-red-600 px-2 py-0.5 rounded-full uppercase">Inactif</span>}
                        </div>
                        <p className="text-[11px] text-slate-500 mt-3 font-bold italic leading-relaxed max-w-64 opacity-80">{site.S_Address || "Aucune adresse spécifiée"}</p>
                        <div className="flex items-center gap-2 mt-5">
                          <span className={`w-2 h-2 rounded-full ${site.S_IsActive ? 'bg-emerald-500' : 'bg-slate-300'} animate-pulse`}></span>
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] italic">
                            {site.S_City}, {site.S_Country}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Terminal de Pilotage d'Entité */}
                    <div className="flex flex-col gap-2">
                      <button 
                        onClick={() => handleDelete(site.S_Id, site.S_Name)}
                        className="p-3 text-slate-200 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all opacity-0 group-hover:opacity-100 border-none cursor-pointer flex items-center justify-center"
                        title="Révoquer l'implantation"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                  
                  {/* Metadata de Scellage (Invisible par défaut) */}
                  <div className="absolute bottom-4 right-8 opacity-0 group-hover:opacity-40 transition-opacity">
                    <p className="text-[7px] font-black text-slate-400 uppercase">SDE_ID: {site.S_Id.substring(0, 8)}...</p>
                  </div>
                </div>
              ))}

              {/* ÉTAT VIDE : NÉANT GÉOGRAPHIQUE */}
              {sites.length === 0 && !loading && (
                <div className="col-span-1 md:col-span-2 py-40 flex flex-col items-center justify-center text-slate-400 gap-8 border-4 border-dashed border-slate-100 rounded-[4rem] m-2 animate-in zoom-in duration-700">
                  <div className="w-28 h-28 bg-slate-50 rounded-full flex items-center justify-center shadow-inner relative">
                    <Globe size={56} className="opacity-10 text-slate-900 animate-spin-slow" />
                    <AlertCircle className="absolute top-0 right-0 text-blue-600/40" size={24} />
                  </div>
                  <div className="text-center space-y-3">
                    <p className="font-black uppercase text-sm italic tracking-[0.3em] text-slate-600">Néant géographique détecté</p>
                    <p className="text-[10px] font-bold italic opacity-40 uppercase tracking-tighter max-w-xs mx-auto leading-relaxed">
                      L&apos;infrastructure Qualisoft Elite nécessite au moins une implantation physique pour activer les modules SMI. Utilisez le terminal d&apos;indexation.
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

// Styles additionnels pour les animations
// @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }