/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useEffect, useState, use, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/core/api/api-client';
import { 
  Save, PenTool, ArrowLeft, Info, 
  CheckCircle2, Loader2, ClipboardList, Target, AlertCircle, Printer, ExternalLink, ShieldCheck
} from 'lucide-react';
import { toast } from 'react-hot-toast';

/**
 * 🛠️ MODULE : SESSION INTERACTIVE DE REVUE
 * -------------------------------------------------------------------------
 * RÔLE : 
 * Interface de travail permettant la saisie des analyses et décisions.
 * Gère le workflow de signature bilatérale (Pilote / Direction).
 * À la validation, les décisions sont envoyées au PAQ.
 * -------------------------------------------------------------------------
 */

export default function RevueSessionPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const id = resolvedParams.id;

  const [review, setReview] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Modèle de données de la revue
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

  /** 📡 CHARGEMENT DES DONNÉES DE LA SESSION */
  const loadData = useCallback(async () => {
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
      toast.error("Échec de connexion à la session");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { if (id) loadData(); }, [id, loadData]);

  /** 💾 SAUVEGARDE SÉCURISÉE DES ANALYSES */
  const handleSave = async () => {
    setSaving(true);
    try {
      await apiClient.put(`/process-reviews/${id}`, formData);
      toast.success("Brouillon scellé dans le SMI");
    } catch (e) {
      toast.error("Erreur critique de persistance");
    } finally {
      setSaving(false);
    }
  };

  /** ✍️ WORKFLOW DE SIGNATURE ET CLÔTURE (§9.3) */
  const handleSign = async () => {
    // Si déjà validé, on ne peut plus signer
    if (review.PRV_Status === 'VALIDEE') return;

    const isDirectionSigning = review.PRV_PiloteSigned; // Si le pilote a signé, c'est au tour de la direction
    const msg = isDirectionSigning 
      ? "SCELLAGE FINAL : Voulez-vous clôturer cette revue et déclencher les actions PAQ ?" 
      : "VISA PILOTE : Voulez-vous valider votre analyse de performance ?";
    
    if (!confirm(msg)) return;

    try {
      const res = await apiClient.post(`/process-reviews/${id}/sign`);
      setReview(res.data); // Rafraîchissement des états de signature
      if (res.data.PRV_Status === 'VALIDEE') {
        toast.success("REVUE CLÔTURÉE : Décisions injectées dans le Plan d'Actions Qualité.");
      } else {
        toast.success("VISA ENREGISTRÉ : En attente de la signature Direction.");
      }
    } catch (e) {
      toast.error("Échec de l'authentification de signature");
    }
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-[#0B0F1A] text-white italic font-black animate-pulse uppercase tracking-[0.5em]">
      <Loader2 size={40} className="animate-spin mr-6 text-blue-600" /> Sécurisation de la séance interactive...
    </div>
  );

  return (
    <div className="p-10 bg-[#0B0F1A] min-h-screen text-white italic pb-40 font-sans selection:bg-blue-600/30 text-left">
      
      {/* 🔝 HEADER & STATUT DES VISAS */}
      <header className="flex justify-between items-start mb-20 border-b border-white/5 pb-12 animate-in fade-in duration-700">
        <div className="space-y-6">
          <button onClick={() => router.push('/dashboard/process-review')} className="text-slate-500 flex items-center gap-3 uppercase font-black text-[10px] hover:text-white transition-all border-none bg-transparent cursor-pointer italic tracking-widest">
            <ArrowLeft size={16}/> Retour Registre Central
          </button>
          <div className="space-y-2">
            <h1 className="text-5xl font-black uppercase tracking-tighter italic leading-none">
              Revue <span className="text-blue-600">Mensuelle</span>
            </h1>
            <div className="flex items-center gap-6 mt-4">
              <span className="bg-blue-600 px-6 py-2 rounded-xl text-sm font-black uppercase tracking-[0.2em] italic shadow-[0_10px_30px_rgba(37,99,235,0.3)]">
                {months[review.PRV_Month - 1]} {review.PRV_Year}
              </span>
              <span className="text-slate-400 font-black uppercase text-[11px] tracking-[0.3em] flex items-center gap-3 italic leading-none">
                <Target size={14} className="text-blue-500" /> Processus : {review.PRV_Processus?.PR_Libelle}
              </span>
            </div>
          </div>
        </div>

        {/* 🛂 COCKPIT DES SIGNATURES */}
        <div className="flex gap-6">
          <div className={`p-8 rounded-4xl border transition-all duration-700 relative overflow-hidden ${review.PRV_PiloteSigned ? 'bg-emerald-500/10 border-emerald-500/30 shadow-2xl shadow-emerald-900/10' : 'bg-slate-900/50 border-white/5 opacity-50'}`}>
            <p className="text-[9px] font-black text-slate-500 uppercase mb-3 italic tracking-widest text-left leading-none">Visa Pilote Rapporteur</p>
            <div className="flex items-center gap-3 text-left">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${review.PRV_PiloteSigned ? 'bg-emerald-500 text-slate-950 shadow-lg' : 'bg-slate-800'}`}>
                {review.PRV_PiloteSigned ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
              </div>
              <span className={`text-[11px] font-black uppercase italic ${review.PRV_PiloteSigned ? 'text-emerald-500' : 'text-slate-600'}`}>
                {review.PRV_PiloteSigned ? "Approuvé" : "En attente"}
              </span>
            </div>
          </div>

          <div className={`p-8 rounded-4xl border transition-all duration-700 relative overflow-hidden ${review.PRV_RQSigned ? 'bg-emerald-500/10 border-emerald-500/30 shadow-2xl shadow-emerald-900/10' : 'bg-slate-900/50 border-white/5 opacity-50'}`}>
            <p className="text-[9px] font-black text-slate-500 uppercase mb-3 italic tracking-widest text-left leading-none">Visa Direction / RQ (§9.3.3)</p>
            <div className="flex items-center gap-3 text-left">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${review.PRV_RQSigned ? 'bg-emerald-500 text-slate-950 shadow-lg' : 'bg-slate-800'}`}>
                {review.PRV_RQSigned ? <CheckCircle2 size={16} /> : <ShieldCheck size={16} />}
              </div>
              <span className={`text-[11px] font-black uppercase italic ${review.PRV_RQSigned ? 'text-emerald-500' : 'text-slate-600'}`}>
                {review.PRV_RQSigned ? "Validé" : "En attente"}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* ✍️ ZONE DE TRAVAIL : ANALYSE & DÉCISIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 text-left">
        
        <div className="space-y-12 text-left">
          <section className="bg-slate-900/40 p-12 rounded-[4rem] border border-white/5 space-y-8 shadow-xl text-left">
            <h2 className="text-[11px] font-black text-blue-500 uppercase flex items-center gap-4 italic tracking-[0.3em] leading-none">
                <Info size={24}/> 1. Analyse de Performance (Indicateurs KPI)
            </h2>
            <textarea 
              className="w-full bg-slate-950/50 border border-white/10 rounded-[2.5rem] p-10 min-h-75 text-slate-200 font-bold text-sm focus:border-blue-600 transition-all outline-none leading-relaxed resize-none shadow-inner italic"
              value={formData.performance}
              onChange={(e) => setFormData({...formData, performance: e.target.value})}
              placeholder="Saisissez l'analyse quantitative des résultats..."
              disabled={review.PRV_Status === 'VALIDEE'}
            />
          </section>

          <section className="bg-slate-900/40 p-12 rounded-[4rem] border border-white/5 space-y-8 shadow-xl text-left">
            <h2 className="text-[11px] font-black text-red-500 uppercase flex items-center gap-4 italic tracking-[0.3em] leading-none">
                <ClipboardList size={24}/> 2. Revue des Audits & Non-Conformités
            </h2>
            <textarea 
              className="w-full bg-slate-950/50 border border-white/10 rounded-[2.5rem] p-10 min-h-75 text-slate-200 font-bold text-sm focus:border-red-600 transition-all outline-none leading-relaxed resize-none shadow-inner italic"
              value={formData.audit}
              onChange={(e) => setFormData({...formData, audit: e.target.value})}
              placeholder="Saisissez l'analyse des écarts constatés..."
              disabled={review.PRV_Status === 'VALIDEE'}
            />
          </section>
        </div>

        <div className="space-y-12 text-left h-full">
          <section className="bg-linear-to-br from-blue-600/5 to-emerald-600/5 p-12 rounded-[5rem] border border-white/5 space-y-10 shadow-3xl h-full flex flex-col text-left">
            <h2 className="text-3xl font-black text-emerald-500 uppercase flex items-center gap-6 italic leading-none tracking-tighter">
                <Target size={40}/> 3. Décisions & Mutations (PAQ)
            </h2>
            <textarea 
              className="flex-1 w-full bg-slate-950/80 border border-emerald-500/20 rounded-[3.5rem] p-12 min-h-100 text-white font-black text-3xl focus:border-emerald-600 transition-all outline-none shadow-2xl italic leading-tight placeholder:text-slate-800"
              value={formData.decisions}
              onChange={(e) => setFormData({...formData, decisions: e.target.value})}
              placeholder="ENTREZ VOS DÉCISIONS ICI (1 PAR LIGNE)..."
              disabled={review.PRV_Status === 'VALIDEE'}
            />
            
            {/* INJECTION PAQ : VISUALISATION POST-VALIDATION */}
            {review.PRV_Status === 'VALIDEE' && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-[2.5rem] p-10 mt-10 animate-in slide-in-from-bottom-4 duration-700 text-left">
                <div className="flex items-center justify-between mb-8">
                  <h4 className="text-emerald-500 font-black uppercase text-[10px] tracking-[0.4em] flex items-center gap-3 italic">
                    <CheckCircle2 size={18} /> Actions injectées au Plan Qualité
                  </h4>
                  <button onClick={() => router.push('/dashboard/paq')} className="text-[10px] font-black uppercase text-slate-500 hover:text-white flex items-center gap-3 transition-all border-none bg-transparent cursor-pointer italic leading-none">
                    Ouvrir le PAQ <ExternalLink size={14} />
                  </button>
                </div>
                <div className="space-y-5 opacity-90 italic text-base font-bold text-left">
                  {formData.decisions.split('\n').filter(l => l.trim() !== '').map((line, idx) => (
                    <div key={idx} className="flex gap-4 text-slate-300 border-b border-white/5 pb-4 last:border-0 leading-tight">
                      <span className="text-emerald-500 font-black text-xl leading-none">»</span> {line}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        </div>
      </div>

      {/* 🚀 BARRE D'ACTIONS SOUVERAINE (FIXE) */}
      <div className="fixed bottom-12 left-1/2 -translate-x-1/2 z-50 flex gap-6 bg-slate-950/90 backdrop-blur-3xl p-6 rounded-[3rem] border border-white/10 shadow-[0_30px_100px_rgba(0,0,0,0.8)] animate-in slide-in-from-bottom-10 duration-700">
        <button 
          onClick={() => router.push(`/dashboard/process-review/report/${id}`)}
          className="flex items-center gap-4 px-10 py-6 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-black uppercase text-[10px] tracking-[0.3em] transition-all border-none cursor-pointer italic"
        >
          <Printer size={20}/> Générer PV PDF
        </button>
        <button 
          onClick={handleSave}
          disabled={saving || review.PRV_Status === 'VALIDEE'}
          className="flex items-center gap-4 px-12 py-6 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-black uppercase text-[10px] tracking-[0.3em] transition-all disabled:opacity-20 border-none cursor-pointer italic"
        >
          {saving ? <Loader2 className="animate-spin" size={20}/> : <Save size={20}/>} Sceller Brouillon
        </button>
        <button 
          onClick={handleSign}
          disabled={review.PRV_Status === 'VALIDEE'}
          className={`flex items-center gap-4 px-14 py-6 rounded-2xl font-black uppercase text-[10px] tracking-[0.4em] shadow-3xl transition-all border-none cursor-pointer italic ${
            review.PRV_Status === 'VALIDEE' 
            ? 'bg-emerald-600 text-white shadow-emerald-900/40 cursor-default' 
            : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-900/40'
          }`}
        >
          {review.PRV_Status === 'VALIDEE' ? <CheckCircle2 size={20}/> : <PenTool size={20}/>}
          {review.PRV_Status === 'VALIDEE' ? "REVUE SCELLÉE DANS LE SMI" : "Signer & Clôturer Session"}
        </button>
      </div>
    </div>
  );
}