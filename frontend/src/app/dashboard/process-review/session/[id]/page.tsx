/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/core/api/api-client';
import { 
  Save, PenTool, ArrowLeft, Info, 
  CheckCircle2, Loader2, ClipboardList, Target, AlertCircle, Printer, ExternalLink
} from 'lucide-react';

export default function RevueSessionPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  
  // BLINDAGE NEXT.JS 16 : Récupération asynchrone sécurisée de l'ID
  const resolvedParams = use(params);
  const id = resolvedParams.id;

  const [review, setReview] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    performance: '',
    audit: '',
    risk: '',
    resources: '',
    decisions: ''
  });

  const months = [
    "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
    "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
  ];

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await apiClient.get(`/process-reviews/${id}`);
        setReview(res.data);
        setFormData({
          performance: res.data.PRV_PerformanceAnalysis || '',
          audit: res.data.PRV_AuditAnalysis || '',
          risk: res.data.PRV_RiskAnalysis || '',
          resources: res.data.PRV_ResourcesAnalysis || '',
          decisions: res.data.PRV_Decisions || ''
        });
      } catch (err) {
        console.error("Erreur de récupération:", err);
      } finally {
        setLoading(false);
      }
    };
    if (id) loadData();
  }, [id]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await apiClient.put(`/process-reviews/${id}`, formData);
      alert("PV Mensuel sauvegardé avec succès.");
    } catch (e) {
      alert("Erreur de sauvegarde.");
    } finally {
      setSaving(false);
    }
  };

  const handleSign = async () => {
    const isClosing = review.PRV_PiloteSigned || review.PRV_RQSigned;
    const msg = isClosing 
      ? "Dernier Visa : Voulez-vous clôturer la revue et générer les actions au PAQ ?" 
      : "Confirmer votre signature sur cette revue de processus ?";
    
    if (!confirm(msg)) return;

    try {
      const res = await apiClient.post(`/process-reviews/${id}/sign`);
      setReview(res.data); // Mise à jour visuelle immédiate des visas
      if (res.data.PRV_Status === 'VALIDEE') {
        alert("Revue clôturée ! Les actions sont maintenant visibles dans votre PAQ.");
      }
    } catch (e) {
      alert("Erreur lors de la signature.");
    }
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-[#0B0F1A] text-white italic font-black animate-pulse uppercase tracking-[0.4em]">
      Sécurisation de la séance...
    </div>
  );

  return (
    <div className="p-8 bg-[#0B0F1A] min-h-screen text-white italic pb-40">
      
      {/* HEADER & ÉTAT DES SIGNATURES (GESTION VISUELLE) */}
      <header className="flex justify-between items-start mb-16 border-b border-white/5 pb-10">
        <div className="space-y-4">
          <button onClick={() => router.push('/dashboard/process-review')} className="text-slate-500 flex items-center gap-2 uppercase font-black text-[9px] hover:text-white transition-all">
            <ArrowLeft size={14}/> Historique des revues
          </button>
          <h1 className="text-6xl font-black uppercase tracking-tighter italic leading-none">
            Revue <span className="text-blue-600 font-black">Mensuelle</span>
          </h1>
          <div className="flex items-center gap-4 mt-2">
            <span className="bg-blue-600 px-4 py-1 rounded-lg text-xs font-black uppercase tracking-widest italic shadow-lg shadow-blue-900/40">
              {months[review.PRV_Month - 1]} {review.PRV_Year}
            </span>
            <span className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.2em]">
              Processus : {review.PRV_Processus?.PR_Libelle}
            </span>
          </div>
        </div>

        <div className="flex gap-4">
          {/* VISA PILOTE VISUEL */}
          <div className={`p-6 rounded-3xl border transition-all duration-500 ${review.PRV_PiloteSigned ? 'bg-emerald-500/10 border-emerald-500/30 shadow-[0_0_30px_rgba(16,185,129,0.1)]' : 'bg-slate-900/50 border-white/5'}`}>
            <p className="text-[8px] font-black text-slate-500 uppercase mb-2">Visa Pilote</p>
            <div className="flex items-center gap-2">
              {review.PRV_PiloteSigned && <CheckCircle2 size={14} className="text-emerald-500" />}
              <span className={`text-[10px] font-black uppercase ${review.PRV_PiloteSigned ? 'text-emerald-500' : 'text-slate-600'}`}>
                {review.PRV_PiloteSigned ? "Approuvé" : "En attente"}
              </span>
            </div>
          </div>
          {/* VISA DIRECTION/RQ VISUEL */}
          <div className={`p-6 rounded-3xl border transition-all duration-500 ${review.PRV_RQSigned ? 'bg-emerald-500/10 border-emerald-500/30 shadow-[0_0_30px_rgba(16,185,129,0.1)]' : 'bg-slate-900/50 border-white/5'}`}>
            <p className="text-[8px] font-black text-slate-500 uppercase mb-2">Visa Direction / RQ</p>
            <div className="flex items-center gap-2">
              {review.PRV_RQSigned && <CheckCircle2 size={14} className="text-emerald-500" />}
              <span className={`text-[10px] font-black uppercase ${review.PRV_RQSigned ? 'text-emerald-500' : 'text-slate-600'}`}>
                {review.PRV_RQSigned ? "Validé" : "En attente"}
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* SECTION 1 & 2 : ANALYSES (DÉSACTIVÉES SI VALIDÉE) */}
        <div className="space-y-10">
          <section className="bg-slate-900/40 p-10 rounded-[3rem] border border-white/5 space-y-6">
            <h2 className="text-sm font-black text-blue-500 uppercase flex items-center gap-3"><Info size={20}/> 1. Performance (Scan KPI)</h2>
            <textarea 
              className="w-full bg-slate-950/50 border border-white/10 rounded-4xl p-8 min-h-60 text-slate-300 font-bold text-sm focus:border-blue-600 transition-all outline-none leading-relaxed"
              value={formData.performance}
              onChange={(e) => setFormData({...formData, performance: e.target.value})}
              disabled={review.PRV_Status === 'VALIDEE'}
            />
          </section>

          <section className="bg-slate-900/40 p-10 rounded-[3rem] border border-white/5 space-y-6">
            <h2 className="text-sm font-black text-red-500 uppercase flex items-center gap-3"><ClipboardList size={20}/> 2. Audits & Non-Conformités</h2>
            <textarea 
              className="w-full bg-slate-950/50 border border-white/10 rounded-4xl p-8 min-h-60 text-slate-300 font-bold text-sm focus:border-red-600 transition-all outline-none leading-relaxed"
              value={formData.audit}
              onChange={(e) => setFormData({...formData, audit: e.target.value})}
              disabled={review.PRV_Status === 'VALIDEE'}
            />
          </section>
        </div>

        {/* SECTION 3 : DÉCISIONS & RÉCAPITULATIF ACTIONS */}
        <div className="space-y-10">
          <section className="bg-linear-to-br from-blue-600/5 to-emerald-600/5 p-10 rounded-[4rem] border border-white/5 space-y-8 shadow-2xl">
            <h2 className="text-2xl font-black text-emerald-500 uppercase flex items-center gap-4 italic"><Target size={30}/> 3. Décisions & Actions</h2>
            <textarea 
              className="w-full bg-slate-950/80 border border-emerald-500/20 rounded-[3rem] p-10 min-h-60 text-white font-black text-2xl focus:border-emerald-600 transition-all outline-none shadow-inner"
              value={formData.decisions}
              onChange={(e) => setFormData({...formData, decisions: e.target.value})}
              placeholder="Saisissez vos décisions (1 par ligne)..."
              disabled={review.PRV_Status === 'VALIDEE'}
            />
            
            {/* PRÉPARATION DU TERRAIN : AFFICHAGE DES ACTIONS APRÈS VALIDATION */}
            {review.PRV_Status === 'VALIDEE' && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-3xl p-8 mt-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-emerald-500 font-black uppercase text-xs tracking-widest flex items-center gap-2">
                    <CheckCircle2 size={16} /> Actions injectées au PAQ
                  </h4>
                  <button onClick={() => router.push('/dashboard/paq')} className="text-[9px] font-black uppercase text-slate-400 hover:text-white flex items-center gap-2">
                    Voir le PAQ <ExternalLink size={12} />
                  </button>
                </div>
                <div className="space-y-3 opacity-80 italic text-sm">
                  {formData.decisions.split('\n').map((line, idx) => (
                    <div key={idx} className="flex gap-3 text-slate-300 border-b border-white/5 pb-2 last:border-0">
                      <span className="text-emerald-500 font-black">•</span> {line}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        </div>
      </div>

      {/* BARRE D'ACTIONS FIXE */}
      <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 flex gap-4 bg-slate-950/90 backdrop-blur-2xl p-5 rounded-4xl border border-white/10 shadow-[0_25px_60px_rgba(0,0,0,0.8)]">
        <button 
          onClick={() => router.push(`/dashboard/process-review/report/${id}`)}
          className="flex items-center gap-3 px-8 py-5 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all"
        >
          <Printer size={16}/> PDF
        </button>
        <button 
          onClick={handleSave}
          disabled={saving || review.PRV_Status === 'VALIDEE'}
          className="flex items-center gap-3 px-10 py-5 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all disabled:opacity-20"
        >
          {saving ? <Loader2 className="animate-spin" size={16}/> : <Save size={16}/>} Sauvegarder
        </button>
        <button 
          onClick={handleSign}
          disabled={review.PRV_Status === 'VALIDEE'}
          className={`flex items-center gap-3 px-12 py-5 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl transition-all ${
            review.PRV_Status === 'VALIDEE' 
            ? 'bg-emerald-600 text-white shadow-emerald-900/40' 
            : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-900/40'
          }`}
        >
          {review.PRV_Status === 'VALIDEE' ? <CheckCircle2 size={16}/> : <PenTool size={16}/>}
          {review.PRV_Status === 'VALIDEE' ? "REVUE VALIDÉE" : "Signer / Clôturer"}
        </button>
      </div>
    </div>
  );
}