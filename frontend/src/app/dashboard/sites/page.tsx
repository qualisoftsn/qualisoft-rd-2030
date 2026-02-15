/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { MapPin, Plus, Trash2, Loader2, Globe, Building, Navigation, CheckCircle2, AlertCircle } from 'lucide-react';
import apiClient from '@/core/api/api-client'; // Assure-toi que ce chemin est correct selon ta structure
import { toast } from 'sonner'; // On utilise le système global défini dans layout.tsx

// Interface pour typer proprement nos données
interface Site {
  S_Id: string;
  S_Name: string;
  S_Address: string;
  S_City: string;
  S_Country: string;
}

export default function SitesPage() {
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    S_Name: '',
    S_Address: '',
    S_City: '',
    S_Country: 'Sénégal',
  });

  // ✅ 1. CHARGEMENT DES SITES
  const fetchSites = useCallback(async () => {
    try {
      const res = await apiClient.get('/sites');
      // Adaptation robuste : supporte { data: [...] } ou [...] directement
      const data = res.data?.data || res.data;
      setSites(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Erreur chargement sites:", err);
      toast.error("Impossible de récupérer la liste des sites.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSites();
  }, [fetchSites]);

  // ✅ 2. CRÉATION D'UN SITE (Avec gestion d'erreur précise)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMessage(null);

    try {
      console.log("📤 Envoi payload création site:", formData);

      // Appel API
      await apiClient.post('/sites', formData);

      // Succès
      toast.success(`Le site "${formData.S_Name}" a été créé avec succès.`);
      
      // Reset du formulaire
      setFormData({
        S_Name: '',
        S_Address: '',
        S_City: '',
        S_Country: 'Sénégal',
      });
      
      // Rechargement de la liste
      fetchSites();

    } catch (err: any) {
      console.error("❌ Erreur API Création:", err);
      
      // Extraction du message d'erreur précis envoyé par le Backend (NestJS)
      let message = "Une erreur technique est survenue.";
      
      if (err.response) {
        const backendMsg = err.response.data?.message;
        // Si c'est un tableau (ValidationPipe), on joint les erreurs
        if (Array.isArray(backendMsg)) {
          message = backendMsg.join(' | ');
        } else if (backendMsg) {
          message = backendMsg;
        } else if (err.response.status === 401) {
          message = "Session expirée. Reconnectez-vous.";
        }
      } else if (err.message) {
        message = err.message;
      }

      setErrorMessage(message);
      toast.error(message); // Affiche la vraie raison (ex: "S_Name should not be empty")
    } finally {
      setSubmitting(false);
    }
  };

  // ✅ 3. SUPPRESSION D'UN SITE
  const handleDelete = async (id: string, name: string) => {
    // On utilise un confirm natif pour faire simple et efficace
    if (!window.confirm(`Confirmez-vous la suppression définitive du site "${name}" ?`)) return;

    const toastId = toast.loading("Suppression en cours...");

    try {
      await apiClient.delete(`/sites/${id}`);
      toast.dismiss(toastId);
      toast.success(`Le site "${name}" a été supprimé.`);
      
      // Mise à jour optimiste de l'UI (plus rapide que le fetch)
      setSites(current => current.filter(s => s.S_Id !== id));
      
    } catch (err: any) {
      toast.dismiss(toastId);
      console.error("Erreur suppression:", err);
      const msg = err.response?.data?.message || "Erreur lors de la suppression";
      toast.error(Array.isArray(msg) ? msg[0] : msg);
    }
  };

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-slate-50">
      <Loader2 className="animate-spin text-blue-600" size={40} />
    </div>
  );

  return (
    <div className="p-8 space-y-8 bg-slate-50 min-h-screen italic font-sans">
      
      {/* HEADER */}
      <div className="animate-in slide-in-from-top-4 duration-500">
        <h1 className="text-3xl font-black uppercase tracking-tighter text-slate-900 flex items-center gap-3">
          <MapPin className="text-blue-600" size={30} /> Sites & Implantations
        </h1>
        <p className="text-slate-500 font-medium text-xs mt-2 ml-1">
          Cartographie opérationnelle des pôles d&apos;activité de l&apos;organisation.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* COLONNE GAUCHE : FORMULAIRE */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-3xl p-6 shadow-xl border border-slate-200 sticky top-8 animate-in slide-in-from-left-4 duration-700">
            <h2 className="text-xs font-black uppercase mb-6 text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-4">
              <Plus size={16} className="text-blue-600" /> Nouvelle Implantation
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Champ Nom */}
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Nom du Site <span className="text-red-500">*</span></label>
                <div className="relative group">
                   <Building className="absolute left-3 top-3 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={14} />
                   <input 
                    required 
                    placeholder="Ex: Siège Social" 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-xs outline-none focus:ring-2 focus:ring-blue-500 font-bold transition-all"
                    value={formData.S_Name} 
                    onChange={e => setFormData({...formData, S_Name: e.target.value})} 
                   />
                </div>
              </div>

              {/* Champ Adresse */}
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Adresse Complète <span className="text-red-500">*</span></label>
                <div className="relative group">
                   <Navigation className="absolute left-3 top-3 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={14} />
                   <input 
                    required 
                    placeholder="Rue, Avenue, Quartier..." 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-xs outline-none focus:ring-2 focus:ring-blue-500 font-bold transition-all"
                    value={formData.S_Address} 
                    onChange={e => setFormData({...formData, S_Address: e.target.value})} 
                   />
                </div>
              </div>

              {/* Ville & Pays */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Ville <span className="text-red-500">*</span></label>
                  <input 
                    required 
                    placeholder="Dakar" 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs outline-none focus:ring-2 focus:ring-blue-500 font-bold transition-all"
                    value={formData.S_City} 
                    onChange={e => setFormData({...formData, S_City: e.target.value})} 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Pays</label>
                  <input 
                    required 
                    placeholder="Sénégal" 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs outline-none focus:ring-2 focus:ring-blue-500 font-bold transition-all"
                    value={formData.S_Country} 
                    onChange={e => setFormData({...formData, S_Country: e.target.value})} 
                  />
                </div>
              </div>

              {/* Zone de Feedback Erreur */}
              {errorMessage && (
                <div className="p-3 bg-red-50 border border-red-100 rounded-xl flex items-start gap-2 text-[10px] font-bold text-red-600 animate-pulse">
                  <AlertCircle size={14} className="shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <button 
                type="submit" 
                disabled={submitting} 
                className="w-full bg-slate-900 hover:bg-blue-600 disabled:opacity-70 disabled:cursor-not-allowed text-white font-black uppercase py-4 rounded-xl text-[10px] shadow-lg hover:shadow-blue-500/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {submitting ? <Loader2 className="animate-spin" size={14} /> : <CheckCircle2 size={14} />}
                {submitting ? 'ENREGISTREMENT...' : 'ENREGISTRER LE SITE'}
              </button>

            </form>
          </div>
        </div>

        {/* COLONNE DROITE : LISTE */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden min-h-125 animate-in slide-in-from-right-4 duration-700">
            <div className="p-6 border-b border-slate-100 flex items-center gap-2 bg-slate-50/50">
                <Globe size={18} className="text-blue-600" />
                <h3 className="font-black uppercase text-xs text-slate-700">Implantations Actives ({sites.length})</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 p-6 gap-4">
              {sites.map((site) => (
                <div key={site.S_Id} className="group relative p-5 rounded-2xl border border-slate-100 bg-slate-50/30 hover:bg-white hover:border-blue-200 hover:shadow-md transition-all duration-300">
                  <div className="flex justify-between items-start">
                    <div className="flex gap-4 items-start">
                      <div className="w-12 h-12 bg-white border border-slate-100 rounded-2xl flex items-center justify-center text-blue-600 shadow-sm group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 shrink-0">
                        <MapPin size={22} />
                      </div>
                      <div>
                        <h4 className="text-xs font-black uppercase text-slate-900 group-hover:text-blue-700 transition-colors">{site.S_Name}</h4>
                        <p className="text-[10px] text-slate-500 mt-1 font-medium leading-relaxed max-w-50">{site.S_Address}</p>
                        <div className="flex items-center gap-1 mt-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
                          <p className="text-[9px] font-bold text-slate-400 uppercase">{site.S_City}, {site.S_Country}</p>
                        </div>
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => handleDelete(site.S_Id, site.S_Name)}
                      className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                      title="Supprimer l'implantation"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}

              {sites.length === 0 && !loading && (
                <div className="col-span-1 md:col-span-2 py-20 flex flex-col items-center justify-center text-slate-400 gap-4 border-2 border-dashed border-slate-100 rounded-3xl m-4">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center">
                    <Globe size={32} className="opacity-20 text-slate-600" />
                  </div>
                  <div className="text-center">
                    <p className="font-black uppercase text-[10px] italic">Aucun site configuré</p>
                    <p className="text-[9px] mt-1">Utilisez le formulaire pour ajouter votre première implantation.</p>
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