/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 🗺️ MODULE : GESTION DES SITES & IMPLANTATIONS
 * -------------------------------------------------------------------------
 * RÔLE : Centralisation des entités physiques de l'organisation.
 * USAGE : Segmentation territoriale pour le SMI (Système de Management Intégré).
 * CONFORMITÉ : ISO 9001, 14001, 45001 - Gestion multi-sites.
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  MapPin, Plus, Trash2, Loader2, Globe, 
  Building, Navigation, CheckCircle2, AlertCircle 
} from 'lucide-react';
import apiClient from '@/core/api/api-client';
import { toast } from 'sonner';

// --- INTERFACES DE DONNÉES ---
interface Site {
  S_Id: string;
  S_Name: string;
  S_Address: string;
  S_City: string;
  S_Country: string;
}

export default function SitesPage() {
  // --- ÉTATS DE GESTION DES DONNÉES ---
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // --- ÉTAT DU FORMULAIRE D'INDEXATION ---
  const [formData, setFormData] = useState({
    S_Name: '',
    S_Address: '',
    S_City: '',
    S_Country: 'Sénégal',
  });

  /**
   * 📡 SYNCHRONISATION DU RÉFÉRENTIEL
   * Récupère la liste exhaustive des implantations depuis le serveur.
   * Gère les formats de réponse imbriqués ou plats pour une compatibilité maximale.
   */
  const fetchSites = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/sites');
      const data = res.data?.data || res.data;
      setSites(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Erreur critique chargement sites:", err);
      toast.error("Rupture de liaison avec le registre des sites.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Déclenchement automatique au montage du composant
  useEffect(() => {
    fetchSites();
  }, [fetchSites]);

  /**
   * 💾 PROTOCOLE DE CRÉATION
   * Valide et transmet les données d'une nouvelle implantation au noyau.
   * Inclut une extraction granulaire des messages d'erreur du validateur NestJS.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMessage(null);

    try {
      // Envoi du payload vers l'endpoint /sites
      await apiClient.post('/sites', formData);

      // Notification de succès souveraine
      toast.success(`Entité "${formData.S_Name}" indexée avec succès.`);
      
      // Réinitialisation du formulaire à l'état initial
      setFormData({
        S_Name: '',
        S_Address: '',
        S_City: '',
        S_Country: 'Sénégal',
      });
      
      // Rafraîchissement du registre local
      fetchSites();

    } catch (err: any) {
      console.error("❌ Erreur lors de l'indexation site:", err);
      
      // Moteur de décodage des erreurs API
      let message = "Une anomalie technique empêche l'enregistrement.";
      
      if (err.response) {
        const backendMsg = err.response.data?.message;
        // Gestion des erreurs de validation (Array) vs erreurs simples (String)
        if (Array.isArray(backendMsg)) {
          message = backendMsg.join(' • ');
        } else if (backendMsg) {
          message = backendMsg;
        } else if (err.response.status === 401) {
          message = "Authentification requise pour cette opération.";
        }
      } else if (err.message) {
        message = err.message;
      }

      setErrorMessage(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * 🗑️ RÉVOCATION D'IMPLANTATION
   * Supprime un site du référentiel après validation humaine.
   * Utilise une mise à jour optimiste pour une interface ultra-réactive.
   */
  const handleDelete = async (id: string, name: string) => {
    // Validation de sécurité avant destruction
    if (!window.confirm(`Voulez-vous révoquer définitivement l'implantation "${name}" ?`)) return;

    const toastId = toast.loading("Destruction de l'entité en cours...");

    try {
      await apiClient.delete(`/sites/${id}`);
      toast.dismiss(toastId);
      toast.success(`Le site "${name}" a été retiré du référentiel.`);
      
      // Mutation optimiste de l'état pour supprimer l'élément sans rechargement complet
      setSites(current => current.filter(s => s.S_Id !== id));
      
    } catch (err: any) {
      toast.dismiss(toastId);
      console.error("Erreur lors de la révocation:", err);
      const msg = err.response?.data?.message || "Échec de l'opération de suppression.";
      toast.error(Array.isArray(msg) ? msg[0] : msg);
    }
  };

  // --- ÉCRAN DE SYNCHRONISATION INITIALE ---
  if (loading) return (
    <div className="flex h-screen flex-col items-center justify-center bg-slate-50 gap-4">
      <Loader2 className="animate-spin text-blue-600" size={50} />
      <p className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-600 italic animate-pulse">
        Initialisation du référentiel géographique...
      </p>
    </div>
  );

  return (
    <div className="p-8 space-y-8 bg-slate-50 min-h-screen italic font-sans selection:bg-blue-600/30">
      
      {/* 🏛️ EN-TÊTE SOUVERAIN */}
      <div className="animate-in slide-in-from-top-4 duration-500">
        <h1 className="text-3xl font-black uppercase tracking-tighter text-slate-900 flex items-center gap-3 italic">
          <MapPin className="text-blue-600" size={30} strokeWidth={2.5} /> Sites & Implantations
        </h1>
        <p className="text-slate-500 font-bold text-[10px] uppercase tracking-[0.5em] mt-3 ml-1 opacity-70">
          Cartographie opérationnelle des pôles d&apos;activité • Périmètre SMI
        </p>
      </div>

      

[Image of organizational site hierarchy]


      <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
        
        {/* 📋 COLONNE GAUCHE : FORMULAIRE D'INDEXATION */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-[2.5rem] p-8 shadow-2xl border border-slate-200 sticky top-8 animate-in slide-in-from-left-4 duration-700">
            <h2 className="text-[11px] font-black uppercase mb-8 text-slate-800 flex items-center gap-3 border-b border-slate-100 pb-5 italic">
              <Plus size={18} className="text-blue-600" strokeWidth={3} /> Nouvelle Implantation
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* NOM DU SITE */}
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

              {/* ADRESSE PHYSIQUE */}
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

              {/* VILLE & PAYS */}
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

              {/* FEEDBACK DES ERREURS API */}
              {errorMessage && (
                <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3 text-[10px] font-black uppercase italic text-red-600 animate-in fade-in slide-in-from-top-2">
                  <AlertCircle size={16} className="shrink-0" />
                  <span className="leading-tight tracking-widest">{errorMessage}</span>
                </div>
              )}

              {/* BOUTON D'ACTION PRINCIPAL */}
              <button 
                type="submit" 
                disabled={submitting} 
                className="w-full bg-slate-900 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black uppercase py-5 rounded-2xl text-[11px] shadow-2xl hover:shadow-blue-500/40 transition-all duration-300 flex items-center justify-center gap-3 cursor-pointer tracking-[0.2em] italic active:scale-95"
              >
                {submitting ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle2 size={18} />}
                {submitting ? 'TRAITEMENT EN COURS...' : 'SCELLER L\'IMPLANTATION'}
              </button>

            </form>
          </div>
        </div>

        {/* 🌐 COLONNE DROITE : REGISTRE DES ENTITÉS */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-[3rem] shadow-2xl border border-slate-200 overflow-hidden min-h-160 animate-in slide-in-from-right-4 duration-700">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 backdrop-blur-md">
                <div className="flex items-center gap-3">
                    <Globe size={22} className="text-blue-600" />
                    <h3 className="font-black uppercase italic text-[13px] text-slate-800 tracking-tighter leading-none">Implantations Actives <span className="text-blue-600 font-black ml-1">[{sites.length}]</span></h3>
                </div>
                <div className="text-[10px] font-black uppercase italic text-slate-400 tracking-widest opacity-60">Sovereign Asset Core</div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 p-8 gap-6">
              {sites.map((site) => (
                <div key={site.S_Id} className="group relative p-6 rounded-4xl border border-slate-100 bg-slate-50/40 hover:bg-white hover:border-blue-600/30 hover:shadow-xl transition-all duration-500 ease-out">
                  <div className="flex justify-between items-start">
                    <div className="flex gap-5 items-start">
                      {/* Icône dynamique avec état Hover */}
                      <div className="w-14 h-14 bg-white border border-slate-100 rounded-3xl flex items-center justify-center text-blue-600 shadow-md group-hover:bg-blue-600 group-hover:text-white transition-all duration-500 shrink-0">
                        <MapPin size={24} strokeWidth={2.5} />
                      </div>
                      <div className="text-left">
                        <h4 className="text-[13px] font-black uppercase italic text-slate-900 group-hover:text-blue-700 transition-colors tracking-tighter leading-none">{site.S_Name}</h4>
                        <p className="text-[10px] text-slate-500 mt-3 font-bold italic leading-relaxed max-w-50 opacity-80">{site.S_Address}</p>
                        <div className="flex items-center gap-2 mt-4">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic">{site.S_City}, {site.S_Country}</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Actions de pilotage */}
                    <button 
                      onClick={() => handleDelete(site.S_Id, site.S_Name)}
                      className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all opacity-0 group-hover:opacity-100 border-none cursor-pointer"
                      title="Révoquer l'implantation"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              ))}

              {/* ÉTAT VIDE : AUCUNE DONNÉE INDEXÉE */}
              {sites.length === 0 && !loading && (
                <div className="col-span-1 md:col-span-2 py-32 flex flex-col items-center justify-center text-slate-400 gap-6 border-4 border-dashed border-slate-100 rounded-[3rem] m-2">
                  <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center shadow-inner">
                    <Globe size={48} className="opacity-10 text-slate-900" />
                  </div>
                  <div className="text-center space-y-2">
                    <p className="font-black uppercase text-xs italic tracking-widest text-slate-600 opacity-60">Néant géographique</p>
                    <p className="text-[10px] font-bold italic opacity-40 uppercase tracking-tighter">Utilisez le terminal de gauche pour sceller votre première entité.</p>
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