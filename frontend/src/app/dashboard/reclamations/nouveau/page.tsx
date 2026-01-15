/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/core/api/api-client';
import { 
  Save, ArrowLeft, MessageSquareWarning, 
  Calendar, User, Link2, Info, Loader2 
} from 'lucide-react';

export default function NouvelleReclamationPage() {
  const router = useRouter();
  const [tiers, setTiers] = useState<any[]>([]);
  const [processus, setProcessus] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    REC_Object: '',
    REC_Description: '',
    REC_Source: 'MAIL',
    REC_DateReceipt: new Date().toISOString().split('T')[0],
    REC_Deadline: '',
    REC_Gravity: 'MEDIUM',
    REC_TierId: '',
    REC_ProcessusId: '', // Si laissé vide, générera une NC automatique
  });

  useEffect(() => {
    // Chargement des données nécessaires au paramétrage
    const fetchData = async () => {
      const [resTiers, resProc] = await Promise.all([
        apiClient.get('/tiers'),
        apiClient.get('/processus')
      ]);
      setTiers(resTiers.data);
      setProcessus(resProc.data);
    };
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await apiClient.post('/reclamations', form);
      router.push('/dashboard/reclamations');
    } catch (err) {
      alert("Erreur lors de l'enregistrement");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 bg-[#0B0F1A] min-h-screen p-10 ml-72 text-white font-sans italic">
      <div className="max-w-4xl mx-auto space-y-10">
        
        <header className="flex justify-between items-center border-b border-white/5 pb-10">
          <div className="flex items-center gap-6">
            <button onClick={() => router.back()} className="p-4 bg-white/5 rounded-2xl hover:bg-white/10 transition-all">
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-4xl font-black uppercase italic tracking-tighter">Enregistrer une <span className="text-blue-500">Plainte</span></h1>
              <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.3em] mt-2 italic">Entrée SMI • Écoute Client & Partenaires</p>
            </div>
          </div>
        </header>

        <form onSubmit={handleSubmit} className="space-y-8 bg-slate-900/40 p-10 rounded-[3rem] border border-white/5 shadow-2xl">
          
          <div className="grid grid-cols-2 gap-8">
            {/* OBJET & SOURCE */}
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-500 ml-2 italic">Objet de la réclamation</label>
                <input 
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-bold outline-none focus:border-blue-500 transition-all"
                  value={form.REC_Object}
                  onChange={(e) => setForm({...form, REC_Object: e.target.value})}
                  placeholder="Ex: Retard livraison Chantier A"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-500 ml-2 italic">Source Officielle</label>
                <select 
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-bold outline-none focus:border-blue-500 transition-all text-blue-400"
                  value={form.REC_Source}
                  onChange={(e) => setForm({...form, REC_Source: e.target.value})}
                >
                  <option value="MAIL">E-mail</option>
                  <option value="TELEPHONE">Appel Téléphonique</option>
                  <option value="COURRIER">Courrier Postal</option>
                  <option value="PV_RECEPTION">PV de Réception</option>
                  <option value="VISITE_CHANTIER">Visite de Chantier</option>
                  <option value="RECLAMATION_ORALE">Réclamation Orale (À documenter)</option>
                </select>
              </div>
            </div>

            {/* TIERS & GRAVITÉ */}
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-500 ml-2 italic">Tiers concerné (Client/Fournisseur)</label>
                <select 
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-bold outline-none focus:border-blue-500 transition-all"
                  value={form.REC_TierId}
                  onChange={(e) => setForm({...form, REC_TierId: e.target.value})}
                >
                  <option value="">Sélectionner un tiers...</option>
                  {tiers.map(t => <option key={t.TR_Id} value={t.TR_Id}>{t.TR_Name}</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-500 ml-2 italic">Gravité (Impact SMI)</label>
                <select 
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-bold outline-none focus:border-blue-500 transition-all"
                  value={form.REC_Gravity}
                  onChange={(e) => setForm({...form, REC_Gravity: e.target.value})}
                >
                  <option value="LOW">Mineure (Simple remarque)</option>
                  <option value="MEDIUM">Moyenne (Nécessite analyse)</option>
                  <option value="HIGH">Élevée (Action Corrective requise)</option>
                  <option value="CRITICAL">Critique (Urgence Direction)</option>
                </select>
              </div>
            </div>
          </div>

          {/* IMPUTATION PROCESSUS - LE COEUR DE TA DEMANDE */}
          <div className="bg-blue-600/5 p-8 rounded-[2.5rem] border border-blue-500/10 space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <Link2 className="text-blue-500" size={20} />
              <h3 className="text-sm font-black uppercase italic tracking-tighter">Imputation au Processus</h3>
            </div>
            
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-2 italic">Processus Responsable</label>
                <select 
                  className="w-full bg-[#0B0F1A] border border-white/10 rounded-2xl p-4 text-sm font-bold outline-none focus:border-blue-500 transition-all"
                  value={form.REC_ProcessusId}
                  onChange={(e) => setForm({...form, REC_ProcessusId: e.target.value})}
                >
                  <option value="">Aucun (Génèrera une Non-Conformité Qualité)</option>
                  {processus.map(p => <option key={p.PR_Id} value={p.PR_Id}>{p.PR_Libelle}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-2 italic">Délai de Réponse Souhaité</label>
                <input 
                  type="date"
                  className="w-full bg-[#0B0F1A] border border-white/10 rounded-2xl p-4 text-sm font-bold outline-none focus:border-blue-500 transition-all"
                  value={form.REC_Deadline}
                  onChange={(e) => setForm({...form, REC_Deadline: e.target.value})}
                />
              </div>
            </div>
            {!form.REC_ProcessusId && (
              <div className="flex items-start gap-3 bg-red-500/10 p-4 rounded-xl border border-red-500/20">
                <Info size={16} className="text-red-500 shrink-0 mt-0.5" />
                <p className="text-[9px] font-bold text-red-500 uppercase italic tracking-tight leading-relaxed">
                  Attention : Sans imputation à un processus métier, cette réclamation sera traitée comme une Non-Conformité (NC) majeure par l&apos;équipe Qualité.
                </p>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-500 ml-2 italic">Description détaillée des faits</label>
            <textarea 
              required
              rows={4}
              className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-bold outline-none focus:border-blue-500 transition-all"
              value={form.REC_Description}
              onChange={(e) => setForm({...form, REC_Description: e.target.value})}
              placeholder="Détaillez les circonstances, les lieux et les preuves évoquées par le tiers..."
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-blue-600 py-6 rounded-2xl font-black uppercase italic flex items-center justify-center gap-3 hover:bg-blue-500 transition-all shadow-xl shadow-blue-900/20 disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />} Enregistrer et Transmettre au Processus
          </button>
        </form>
      </div>
    </div>
  );
}