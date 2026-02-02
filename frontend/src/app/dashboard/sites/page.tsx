/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { MapPin, Plus, Trash2, Loader2, Globe, Building, Navigation, CheckCircle2, AlertCircle } from 'lucide-react';
import apiClient from '@/core/api/api-client';
import { toast, Toaster } from 'react-hot-toast';

export default function SitesPage() {
  const [sites, setSites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const [formData, setFormData] = useState({
    S_Name: '',
    S_Address: '',
    S_City: '',
    S_Country: 'Sénégal',
  });

  // ✅ Chargement des sites
  const fetchSites = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/sites');
      // On s'adapte au format de réponse (direct ou {data: []})
      const data = res.data?.data || res.data;
      setSites(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Erreur chargement sites");
      toast.error("Impossible de charger les sites");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchSites(); }, [fetchSites]);

  // ✅ Création d'un site
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);

    try {
      await apiClient.post('/sites', formData);
      setMessage({ type: 'success', text: `Site "${formData.S_Name}" créé avec succès.` });
      toast.success("Implantation enregistrée");
      setFormData({ S_Name: '', S_Address: '', S_City: '', S_Country: 'Sénégal' });
      fetchSites();
    } catch (err: any) {
      setMessage({ type: 'error', text: "Erreur : vérifiez que tous les champs sont remplis." });
      toast.error("Erreur lors de la création");
    } finally {
      setSubmitting(false);
    }
  };

  // ✅ SUPPRESSION D'UN SITE (Fonction ajoutée)
  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Voulez-vous vraiment supprimer le site "${name}" ?`)) return;

    try {
      await apiClient.delete(`/sites/${id}`);
      toast.success("Site supprimé");
      fetchSites();
    } catch (err: any) {
      console.error("Erreur suppression site", err);
      const errorMsg = err.response?.data?.message || "Erreur lors de la suppression";
      toast.error(Array.isArray(errorMsg) ? errorMsg[0] : errorMsg);
    }
  };

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-slate-50">
      <Loader2 className="animate-spin text-blue-600" size={40} />
    </div>
  );

  return (
    <div className="p-8 space-y-8 bg-slate-50 min-h-screen italic font-sans">
      <Toaster position="top-right" />
      
      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-black uppercase tracking-tighter text-slate-900 flex items-center gap-3">
          <MapPin className="text-blue-600" size={32} /> Sites & Implantations
        </h1>
        <p className="text-slate-500 font-medium">Gestion géographique des pôles d&apos;activité de l&apos;organisation.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* FORMULAIRE DE CRÉATION */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-3xl p-6 shadow-xl border border-slate-200 sticky top-8">
            <h2 className="text-xs font-black uppercase mb-6 text-slate-800 flex items-center gap-2">
              <Plus size={16} /> Nouvelle Implantation
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Nom du Site *</label>
                <div className="relative">
                   <Building className="absolute left-3 top-3 text-slate-300" size={14} />
                   <input required placeholder="Ex: Siège Social" className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-xs outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                    value={formData.S_Name} onChange={e => setFormData({...formData, S_Name: e.target.value})} />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Adresse Complète *</label>
                <div className="relative">
                   <Navigation className="absolute left-3 top-3 text-slate-300" size={14} />
                   <input required placeholder="Rue, Avenue..." className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-xs outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                    value={formData.S_Address} onChange={e => setFormData({...formData, S_Address: e.target.value})} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Ville *</label>
                  <input required placeholder="Dakar" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                    value={formData.S_City} onChange={e => setFormData({...formData, S_City: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Pays</label>
                  <input required placeholder="Sénégal" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                    value={formData.S_Country} onChange={e => setFormData({...formData, S_Country: e.target.value})} />
                </div>
              </div>

              <button type="submit" disabled={submitting} className="w-full bg-slate-900 hover:bg-blue-600 text-white font-black uppercase py-4 rounded-xl text-[10px] shadow-lg transition-all flex items-center justify-center gap-2">
                {submitting ? <Loader2 className="animate-spin" size={14} /> : <CheckCircle2 size={14} />}
                Enregistrer le Site
              </button>

              {message && (
                <div className={`p-3 rounded-xl flex items-center gap-2 text-[10px] font-bold animate-in fade-in slide-in-from-top-1 ${message.type === 'success' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                  {message.type === 'success' ? <CheckCircle2 size={14}/> : <AlertCircle size={14}/>}
                  {message.text}
                </div>
              )}
            </form>
          </div>
        </div>

        {/* LISTE DES SITES */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden min-h-125">
            <div className="p-6 border-b border-slate-100 flex items-center gap-2 bg-slate-50/50">
                <Globe size={18} className="text-blue-600" />
                <h3 className="font-black uppercase text-xs">Implantations Actives ({sites.length})</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 p-6 gap-4">
              {sites.map((site) => (
                <div key={site.S_Id} className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50 hover:border-blue-200 hover:bg-white transition-all group flex justify-between items-start">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-blue-600 shadow-sm group-hover:bg-blue-600 group-hover:text-white transition-all">
                      <MapPin size={20} />
                    </div>
                    <div>
                      <h4 className="text-xs font-black uppercase text-slate-900">{site.S_Name}</h4>
                      <p className="text-[10px] text-slate-500 mt-1 font-medium">{site.S_Address}</p>
                      <p className="text-[9px] font-bold text-blue-600 uppercase mt-2">{site.S_City}, {site.S_Country}</p>
                    </div>
                  </div>
                  
                  {/* BOUTON SUPPRESSION CORRIGÉ */}
                  <button 
                    onClick={() => handleDelete(site.S_Id, site.S_Name)}
                    className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                    title="Supprimer l'implantation"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}

              {sites.length === 0 && (
                <div className="col-span-2 py-20 flex flex-col items-center justify-center text-slate-400 gap-4">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
                    <Globe size={32} className="opacity-20" />
                  </div>
                  <p className="font-black uppercase text-[10px] italic">Aucun site configuré pour cette organisation.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}