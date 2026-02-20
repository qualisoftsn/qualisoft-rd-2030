/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * NOM ABSOLU : src/app/dashboard/compliance/senegal-legal/page.tsx
 * FONCTION : Hub de gestion de la conformité légale et réglementaire (Sénégal).
 * RÔLE : Pilotage de la veille juridique §6.1.3 et archivage des preuves de conformité.
 * DESIGN : Elite Sovereign (Dark Mode, Typographie Black Italic).
 */

'use client';

import React, { useEffect, useState, useCallback } from 'react';
import apiClient from '@/core/api/api-client';
import { 
  FileText, Plus, CheckCircle, XCircle, AlertTriangle, 
  Download, Calendar, ShieldCheck, X, Save, Loader2, Scale
} from 'lucide-react';
import { toast } from 'react-hot-toast';

/**
 * 🛠️ UTILITAIRES DE STYLE
 * Permet la concaténation de classes Tailwind sans pollution visuelle.
 */
const cn = (...classes: any[]) => classes.filter(Boolean).join(' ');

export default function SenegalLegalPage() {
  // --- ÉTATS DE DATA-MINING ---
  const [requirements, setRequirements] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // --- ÉTATS DE TRANSACTION ---
  const [submitting, setSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // --- STRUCTURE DU DOSSIER RÉGLEMENTAIRE (ISO 9001) ---
  const [formData, setFormData] = useState({
    SLR_Category: 'Travail',
    SLR_Title: '',
    SLR_Description: '',
    SLR_Reference: '',
    SLR_Authority: '',
    SLR_Deadline: '',
    SLR_Evidence: '',
    SLR_Comment: ''
  });

  /**
   * 📡 SYNCHRONISATION AVEC LE NOYAU LÉGAL
   * Récupère simultanément les exigences indexées et les métriques de conformité.
   */
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [resRequirements, resStats] = await Promise.all([
        apiClient.get('/senegal-legal'),
        apiClient.get('/senegal-legal/stats')
      ]);
      // Extraction sécurisée des données
      setRequirements(resRequirements.data.requirements || []);
      setStats(resStats.data);
    } catch (error) {
      toast.error('Rupture de liaison avec le Noyau Légal Qualisoft');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  /**
   * 💾 SCELLAGE D'UNE NOUVELLE EXIGENCE
   * Enregistre un nouveau texte de loi ou une obligation dans le registre souverain.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    
    setSubmitting(true);
    const tid = toast.loading("Scellage de l'exigence réglementaire...");
    try {
      await apiClient.post('/senegal-legal', formData);
      toast.success('Exigence légale indexée au registre', { id: tid });
      
      // Réinitialisation du workflow
      setIsModalOpen(false);
      setFormData({
        SLR_Category: 'Travail', SLR_Title: '', SLR_Description: '',
        SLR_Reference: '', SLR_Authority: '', SLR_Deadline: '',
        SLR_Evidence: '', SLR_Comment: ''
      });
      fetchData();
    } catch (error) {
      toast.error('Échec d&apos;indexation : Vérifiez les contraintes serveur', { id: tid });
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * ⚡ MISE À JOUR DU STATUT DE CONFORMITÉ
   * Permet de basculer instantanément le statut d'un texte (RESPECTEE / NON_CONFORME).
   */
  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await apiClient.patch(`/senegal-legal/${id}/status`, { status });
      toast.success('Verdict de conformité mis à jour');
      fetchData();
    } catch (error) {
      toast.error('Erreur lors de la mutation du statut');
    }
  };

  // --- ÉTAT DE CHARGEMENT SOUVERAIN ---
  if (loading) return (
    <div className="ml-72 h-screen flex flex-col items-center justify-center bg-[#0B0F1A]">
      <div className="text-center space-y-6">
        <Loader2 className="w-16 h-16 text-blue-500 animate-spin mx-auto opacity-50" />
        <p className="text-blue-500 font-black uppercase italic text-[10px] tracking-[0.5em] animate-pulse">Scanning du Référentiel Sénégalais...</p>
      </div>
    </div>
  );

  return (
    <div className="ml-72 min-h-screen bg-[#0B0F1A] text-white font-sans p-10 uppercase italic font-black overflow-x-hidden selection:bg-blue-600/30">
      {/* Désactivation de la scrollbar native pour épurer le design Elite */}
      <style jsx global>{`::-webkit-scrollbar { display: none !important; }`}</style>

      {/* 🔝 HEADER TACTIQUE */}
      <header className="mb-12 border-b border-white/5 pb-10 flex justify-between items-end animate-in fade-in duration-700">
        <div className="space-y-4">
          <div className="flex items-center gap-4 text-blue-600">
            <Scale size={32} strokeWidth={2.5} />
            <h1 className="text-4xl tracking-tighter leading-none text-white">CONFORMITÉ <span className="text-blue-600">LÉGALE</span></h1>
          </div>
          <p className="text-slate-500 text-[10px] tracking-[0.4em] flex items-center gap-2 italic">
            <ShieldCheck size={14} className="text-emerald-500" /> RÉPUBLIQUE DU SÉNÉGAL • VEILLE RÉGLEMENTAIRE §6.1.3
          </p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-500 px-10 py-5 rounded-2xl text-[10px] flex items-center gap-4 transition-all active:scale-95 shadow-[0_20px_50px_rgba(37,99,235,0.2)] border-none cursor-pointer"
        >
          <Plus size={20} strokeWidth={3} /> NOUVELLE EXIGENCE
        </button>
      </header>

      {/* 📊 MATRICE D'INDICATEURS DE PERFORMANCE */}
      {stats && (
        <div className="grid grid-cols-4 gap-8 mb-12 animate-in slide-in-from-bottom-4 duration-1000">
          <StatCard label="Total Exigences" value={stats.total} color="blue" icon={<FileText />} />
          <StatCard label="Textes Conformes" value={stats.compliant} color="emerald" icon={<CheckCircle />} />
          <StatCard label="Écarts Détectés" value={stats.nonCompliant} color="red" icon={<XCircle />} />
          <StatCard label="Taux de Conformité" value={`${stats.complianceRate}%`} color="amber" icon={<AlertTriangle />} />
        </div>
      )}

      {/* 🏛️ REGISTRE DES TEXTES LÉGAUX */}
      <div className="bg-slate-900/20 border border-white/5 rounded-[3.5rem] overflow-hidden backdrop-blur-3xl shadow-2xl relative">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-[10px] text-slate-500 border-b border-white/5 italic uppercase tracking-[0.2em] bg-white/2">
              <th className="p-10">Texte & Référence Documentaire</th>
              <th className="p-10">Autorité Émettrice</th>
              <th className="p-10">Date d&apos;Échéance</th>
              <th className="p-10 text-center">Statut SMI</th>
              <th className="p-10 text-right">Pilotage</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 italic">
            {requirements.map((req) => (
              <tr key={req.SLR_Id} className="hover:bg-blue-600/5 transition-all group">
                <td className="p-10">
                  <div className="flex flex-col items-start">
                    <span className="text-[9px] bg-blue-500/10 text-blue-400 px-4 py-1.5 rounded-full border border-blue-500/20 leading-none mb-4">{req.SLR_Category}</span>
                    <p className="text-base font-black tracking-tight group-hover:text-blue-400 transition-colors uppercase leading-none">{req.SLR_Title}</p>
                    <p className="text-[10px] text-slate-600 mt-2 line-clamp-1 italic font-bold tracking-widest">{req.SLR_Reference}</p>
                  </div>
                </td>
                <td className="p-10 text-[11px] text-slate-400 font-black uppercase tracking-tighter italic">{req.SLR_Authority}</td>
                <td className="p-10">
                  {req.SLR_Deadline && (
                    <div className="flex items-center gap-3 text-amber-500 text-[10px] font-black italic">
                      <Calendar size={16} /> {new Date(req.SLR_Deadline).toLocaleDateString()}
                    </div>
                  )}
                </td>
                <td className="p-10 text-center"><StatusBadge status={req.SLR_Status} /></td>
                <td className="p-10 text-right">
                  <div className="flex justify-end gap-4 opacity-40 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => handleUpdateStatus(req.SLR_Id, 'RESPECTEE')} 
                      className="p-4 bg-emerald-500/10 text-emerald-500 rounded-2xl hover:bg-emerald-500 hover:text-white transition-all border-none cursor-pointer"
                      title="Valider la conformité"
                    >
                      <CheckCircle size={20} />
                    </button>
                    <button 
                      onClick={() => handleUpdateStatus(req.SLR_Id, 'NON_CONFORME')} 
                      className="p-4 bg-red-500/10 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all border-none cursor-pointer"
                      title="Déclarer un écart"
                    >
                      <XCircle size={20} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {requirements.length === 0 && (
          <div className="p-20 text-center text-slate-700 italic font-black uppercase tracking-widest opacity-20">
            Aucune exigence indexée pour le moment.
          </div>
        )}
      </div>

      {/* 📟 MODALE D'INDEXATION RÉGLEMENTAIRE */}
      {isModalOpen && (
        <div className="fixed inset-0 z-110 bg-black/95 backdrop-blur-2xl flex items-center justify-center p-8 animate-in zoom-in duration-300">
          <div className="bg-[#0B0F1A] border border-white/10 rounded-[4.5rem] w-full max-w-5xl max-h-[90vh] overflow-hidden shadow-[0_50px_100px_rgba(0,0,0,0.8)] flex flex-col relative text-left">
            
            {/* Header Modale Sticky */}
            <div className="p-12 border-b border-white/5 flex justify-between items-center sticky top-0 bg-[#0B0F1A]/95 backdrop-blur-md z-10">
              <div>
                <h2 className="text-4xl italic font-black tracking-tighter">NOUVELLE <span className="text-blue-600">EXIGENCE</span></h2>
                <p className="text-slate-500 text-[10px] mt-4 tracking-[0.4em] italic font-black opacity-60">INDEXATION RÉGLEMENTAIRE RÉPUBLIQUE DU SÉNÉGAL</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="p-6 bg-white/5 hover:bg-red-500/20 text-slate-500 hover:text-red-500 transition-all rounded-3xl border-none cursor-pointer"
              >
                <X size={36} />
              </button>
            </div>
            
            {/* Formulaire ISO */}
            <form onSubmit={handleSubmit} className="p-16 space-y-10 overflow-y-auto scrollbar-hide">
              <div className="grid grid-cols-2 gap-12">
                <div className="space-y-4">
                  <label className="text-[10px] text-slate-500 ml-6 tracking-widest italic font-black uppercase">Domaine d&apos;application *</label>
                  <select
                    value={formData.SLR_Category}
                    onChange={(e) => setFormData({...formData, SLR_Category: e.target.value})}
                    className="w-full bg-[#0F172A] border border-white/10 rounded-3xl p-7 text-[12px] font-black uppercase italic outline-none focus:border-blue-600 transition-all appearance-none cursor-pointer shadow-inner text-white"
                  >
                    {['Travail', 'Environnement', 'Fiscalité', 'Santé Sécurité', 'Commerce'].map(c => (
                      <option key={c} value={c} className="bg-[#0B0F1A]">{c}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] text-slate-500 ml-6 tracking-widest italic font-black uppercase">Autorité de Régulation</label>
                  <input
                    value={formData.SLR_Authority}
                    onChange={(e) => setFormData({...formData, SLR_Authority: e.target.value.toUpperCase()})}
                    className="w-full bg-[#0F172A] border border-white/10 rounded-3xl p-7 text-[12px] font-black italic outline-none focus:border-blue-600 text-white shadow-inner uppercase"
                    placeholder="ANSD, DGID, MINISTÈRE DU TRAVAIL..."
                  />
                </div>
              </div>
              
              <div className="space-y-4 text-left">
                <label className="text-[10px] text-slate-500 ml-6 tracking-widest italic font-black uppercase">Libellé Radical de l&apos;Exigence *</label>
                <input
                  required
                  value={formData.SLR_Title}
                  onChange={(e) => setFormData({...formData, SLR_Title: e.target.value.toUpperCase()})}
                  className="w-full bg-[#0F172A] border border-white/10 rounded-3xl p-7 text-[13px] font-black italic outline-none focus:border-blue-600 text-white shadow-inner tracking-tighter uppercase"
                  placeholder="EX: DÉCLARATION ANNUELLE VRS, CODE DU TRAVAIL..."
                />
              </div>
              
              <div className="space-y-4 text-left">
                <label className="text-[10px] text-slate-500 ml-6 tracking-widest italic font-black uppercase">Synthèse & Analyse des Obligations</label>
                <textarea
                  value={formData.SLR_Description}
                  onChange={(e) => setFormData({...formData, SLR_Description: e.target.value})}
                  className="w-full bg-[#0F172A] border border-white/10 rounded-3xl p-7 text-[11px] font-bold italic outline-none focus:border-blue-600 h-40 text-slate-300 resize-none leading-relaxed shadow-inner"
                  placeholder="Détails du texte, articles concernés et enjeux pour l'organisation..."
                />
              </div>

              <div className="space-y-4 text-left">
                <label className="text-[10px] text-slate-500 ml-6 tracking-widest italic font-black uppercase">Référence Légale (Art. / Loi / Décret) *</label>
                <input
                  required
                  value={formData.SLR_Reference}
                  onChange={(e) => setFormData({...formData, SLR_Reference: e.target.value})}
                  className="w-full bg-[#0F172A] border border-white/10 rounded-3xl p-7 text-[12px] font-black italic outline-none focus:border-blue-600 text-blue-400 shadow-inner"
                  placeholder="EX: LOI N° 97-17 DU 1ER DÉCEMBRE 1997, ART. L.118..."
                />
              </div>
              
              <div className="grid grid-cols-2 gap-12">
                <div className="space-y-4 text-left">
                  <label className="text-[10px] text-slate-500 ml-6 tracking-widest italic font-black uppercase">Vigilance : Date d&apos;Échéance</label>
                  <input
                    type="date"
                    value={formData.SLR_Deadline}
                    onChange={(e) => setFormData({...formData, SLR_Deadline: e.target.value})}
                    className="w-full bg-[#0F172A] border border-white/10 rounded-3xl p-7 text-[12px] font-black italic outline-none focus:border-blue-600 text-white shadow-inner"
                  />
                </div>
                <div className="space-y-4 text-left">
                  <label className="text-[10px] text-slate-500 ml-6 tracking-widest italic font-black uppercase">Document de Preuve (Archive / URL)</label>
                  <input
                    type="url"
                    value={formData.SLR_Evidence}
                    onChange={(e) => setFormData({...formData, SLR_Evidence: e.target.value})}
                    className="w-full bg-[#0F172A] border border-white/10 rounded-3xl p-7 text-[12px] font-bold italic outline-none focus:border-blue-600 text-emerald-500 shadow-inner"
                    placeholder="https://cloud.qualisoft.sn/SMI/..."
                  />
                </div>
              </div>

              {/* Bouton de Validation Souveraine */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-blue-600 py-10 rounded-[2.5rem] font-black text-xs tracking-[0.5em] flex items-center justify-center gap-5 hover:bg-blue-500 transition-all disabled:opacity-50 shadow-2xl shadow-blue-900/40 border-none cursor-pointer active:scale-95 italic text-white"
              >
                {submitting ? <Loader2 className="animate-spin" size={24} /> : <Save size={24} />} AJOUTER AU REGISTRE LÉGAL SOUVERAIN
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

/** 📊 COMPOSANT ATOMIQUE : CARTE STATISTIQUE */
function StatCard({ label, value, icon, color }: any) {
  const colors: any = {
    blue: 'text-blue-500 bg-blue-500/10 border-blue-500/20 shadow-[0_15px_30px_rgba(59,130,246,0.1)]',
    emerald: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20 shadow-[0_15px_30px_rgba(16,185,129,0.1)]',
    red: 'text-red-500 bg-red-500/10 border-red-500/20 shadow-[0_15px_30px_rgba(239,68,68,0.1)]',
    amber: 'text-amber-500 bg-amber-500/10 border-amber-500/20 shadow-[0_15px_30px_rgba(245,158,11,0.1)]'
  };
  return (
    <div className="bg-white/2 border border-white/5 rounded-[2.5rem] p-10 flex flex-col gap-6 backdrop-blur-md hover:border-white/10 transition-all">
      <div className={cn("p-5 rounded-2xl w-fit border shadow-inner", colors[color])}>{icon}</div>
      <div className="text-left">
        <p className="text-5xl font-black italic leading-none tracking-tighter">{value}</p>
        <p className="text-[10px] text-slate-500 mt-4 tracking-[0.2em] italic font-black uppercase opacity-60 leading-none">{label}</p>
      </div>
    </div>
  );
}

/** 🏷️ COMPOSANT ATOMIQUE : BADGE DE STATUT SMI */
function StatusBadge({ status }: { status: string }) {
  const config = {
    'A_RESPECTER': { label: 'Veuille Active', color: 'text-blue-400 bg-blue-400/10 border-blue-400/20 shadow-[0_5px_15px_rgba(96,165,250,0.1)]' },
    'RESPECTEE': { label: 'Conforme §SMI', color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20 shadow-[0_5px_15px_rgba(52,211,153,0.1)]' },
    'NON_CONFORME': { label: 'Écart Détecté', color: 'text-red-400 bg-red-400/10 border-red-400/20 shadow-[0_5px_15px_rgba(248,113,113,0.1)]' },
    'EN_COURS': { label: 'Traitement...', color: 'text-amber-400 bg-amber-400/10 border-amber-400/20 shadow-[0_5px_15px_rgba(251,191,36,0.1)]' }
  };
  const { label, color } = config[status as keyof typeof config] || config.A_RESPECTER;
  return <span className={cn("px-5 py-2 rounded-xl text-[9px] border uppercase font-black italic tracking-widest", color)}>{label}</span>;
}