/* eslint-disable @typescript-eslint/no-explicit-any */
//* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * 💡 NOM ABSOLU : src/app/dashboard/compliance/senegal-legal/page.tsx
 * -------------------------------------------------------------------------
 * FONCTION : Hub de gestion de la conformité légale et réglementaire (Sénégal).
 * RÔLE : Pilotage de la veille juridique §6.1.3 et archivage des preuves SDE.
 * ARCHITECTURE : Zéro donnée factice. Liaison stricte noyau Matrix (apiClient).
 * DESIGN : Elite Sovereign (Full-Space max-w-500, Dark Mode, Typographie Black Italic).
 * -------------------------------------------------------------------------
 */

'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import apiClient from '@/core/api/api-client';
import { 
  FileText, Plus, CheckCircle, XCircle, AlertTriangle, 
  Search, Calendar, ShieldCheck, X, Save, Loader2, Scale,
  Activity, ArrowUpRight, BookOpen
} from 'lucide-react';
import { toast, Toaster } from 'sonner';

// --- 🏗️ TYPES STRICTS SDE MATRIX ---
type ComplianceStatus = 'A_RESPECTER' | 'RESPECTEE' | 'NON_CONFORME' | 'EN_COURS';

interface SenegalLegalRequirement {
  SLR_Id: string;
  SLR_Category: string;
  SLR_Title: string;
  SLR_Description: string;
  SLR_Reference: string;
  SLR_Authority: string;
  SLR_Deadline: string | null;
  SLR_Evidence: string;
  SLR_Status: ComplianceStatus;
  SLR_Comment?: string;
}

interface LegalStats {
  total: number;
  compliant: number;
  nonCompliant: number;
  complianceRate: number;
}

interface LegalFormData {
  SLR_Category: string;
  SLR_Title: string;
  SLR_Description: string;
  SLR_Reference: string;
  SLR_Authority: string;
  SLR_Deadline: string;
  SLR_Evidence: string;
  SLR_Comment: string;
}

// --- 🛠️ UTILITAIRES DE STYLE ---
const cn = (...classes: (string | boolean | undefined | null)[]) => classes.filter(Boolean).join(' ');

export default function SenegalLegalPage() {
  // --- 📦 ÉTATS DE DATA-MINING ---
  const [requirements, setRequirements] = useState<SenegalLegalRequirement[]>([]);
  const [stats, setStats] = useState<LegalStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  // --- ⚡ ÉTATS DE TRANSACTION SDE ---
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // --- 📑 STRUCTURE DU DOSSIER RÉGLEMENTAIRE (ISO 9001) ---
  const [formData, setFormData] = useState<LegalFormData>({
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
   * 📡 SYNCHRONISATION AVEC LE NOYAU LÉGAL SDE (PROD MODE)
   * Récupère simultanément les exigences indexées et les métriques de conformité.
   */
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [resRequirements, resStats] = await Promise.all([
        apiClient.get('/senegal-legal'),
        apiClient.get('/senegal-legal/stats').catch(() => ({ data: null })) // Fallback sécurisé pour les stats
      ]);
      
      const reqData = resRequirements.data?.data || resRequirements.data;
      const statData = resStats.data?.data || resStats.data;

      setRequirements(Array.isArray(reqData) ? reqData : []);
      
      // Calcul dynamique des stats si l'endpoint de stats échoue
      if (statData) {
        setStats(statData);
      } else if (Array.isArray(reqData)) {
        const total = reqData.length;
        const compliant = reqData.filter(r => r.SLR_Status === 'RESPECTEE').length;
        const nonCompliant = reqData.filter(r => r.SLR_Status === 'NON_CONFORME').length;
        const complianceRate = total > 0 ? Math.round((compliant / total) * 100) : 100;
        setStats({ total, compliant, nonCompliant, complianceRate });
      }

    } catch (error) {
      toast.error('RUPTURE DE LIAISON : NOYAU LÉGAL INACCESSIBLE.');
      setRequirements([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  /**
   * 🔍 MOTEUR DE RECHERCHE ACTIF
   */
  const filteredRequirements = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return requirements;
    return requirements.filter(req => 
      req.SLR_Title.toLowerCase().includes(term) || 
      req.SLR_Reference.toLowerCase().includes(term) ||
      req.SLR_Authority.toLowerCase().includes(term)
    );
  }, [requirements, searchTerm]);

  /**
   * 💾 SCELLAGE D'UNE NOUVELLE EXIGENCE
   * Validation stricte et enregistrement dans le registre souverain.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    // Validation Active SDE
    if (!formData.SLR_Title || !formData.SLR_Reference) {
      toast.warning("ANOMALIE : LE TITRE ET LA RÉFÉRENCE SONT OBLIGATOIRES.");
      return;
    }
    
    setSubmitting(true);
    const tid = toast.loading("Scellage de l'exigence réglementaire SDE...");
    try {
      await apiClient.post('/senegal-legal', {
        ...formData,
        SLR_Title: formData.SLR_Title.toUpperCase(),
        SLR_Reference: formData.SLR_Reference.toUpperCase()
      });
      toast.success('EXIGENCE SCELLÉE AU REGISTRE SOUVERAIN.', { id: tid });
      
      // Réinitialisation du workflow
      setIsModalOpen(false);
      setFormData({
        SLR_Category: 'Travail', SLR_Title: '', SLR_Description: '',
        SLR_Reference: '', SLR_Authority: '', SLR_Deadline: '',
        SLR_Evidence: '', SLR_Comment: ''
      });
      fetchData(); // Synchro Matrix
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'ÉCHEC DE SCELLAGE SDE.', { id: tid });
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * ⚡ MISE À JOUR DU STATUT DE CONFORMITÉ
   */
  const handleUpdateStatus = async (id: string, status: ComplianceStatus) => {
    const tid = toast.loading("Mutation du statut de conformité...");
    try {
      await apiClient.patch(`/senegal-legal/${id}/status`, { status });
      toast.success('VERDICT DE CONFORMITÉ SCELLÉ.', { id: tid });
      fetchData();
    } catch (error) {
      toast.error('ÉCHEC DE LA MUTATION.', { id: tid });
    }
  };

  // --- ÉTAT DE CHARGEMENT SOUVERAIN ---
  if (loading) return (
    <div className="ml-72 h-screen flex flex-col items-center justify-center bg-[#0B0F1A] gap-10">
      <Loader2 className="w-32 h-32 text-blue-600 animate-spin opacity-80" strokeWidth={1} />
      <p className="text-blue-500 font-black uppercase italic text-[14px] tracking-[1em] animate-pulse">
        Compilation du Référentiel Sénégalais...
      </p>
    </div>
  );

  return (
    <div className="flex-1 bg-[#0B0F1A] min-h-screen p-16 ml-72 text-white font-sans italic text-left selection:bg-blue-600/30 overflow-x-hidden">
      <Toaster position="top-right" richColors theme="dark" />

      <div className="w-full max-w-500 mx-auto space-y-20 animate-in fade-in duration-1000">

        {/* 🔝 HEADER TACTIQUE */}
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-10 border-b-4 border-white/5 pb-16">
          <div className="space-y-8">
            <div className="flex items-center gap-6">
               <span className="px-6 py-2 rounded-2xl bg-emerald-500/10 border-2 border-emerald-500/20 text-emerald-500 text-[12px] font-black uppercase tracking-[0.5em] flex items-center gap-4 italic shadow-inner">
                  <ShieldCheck size={18} /> République du Sénégal
               </span>
               <span className="px-6 py-2 rounded-2xl bg-blue-600/10 text-blue-500 text-[12px] font-black uppercase tracking-[0.5em] border-2 border-blue-600/20 italic shadow-inner">
                  Veille ISO §6.1.3
               </span>
            </div>
            <h1 className="text-8xl font-black uppercase tracking-tighter leading-none text-white flex items-center gap-8">
               <div className="p-6 bg-blue-600 rounded-[2.5rem] shadow-[0_0_50px_rgba(37,99,235,0.4)]">
                 <Scale size={56} strokeWidth={2.5} className="text-white" />
               </div>
               Conformité <span className="text-blue-600">Légale</span>
            </h1>
            <p className="text-slate-500 font-black text-[14px] uppercase tracking-[0.8em] italic opacity-60 flex items-center gap-5">
              <Activity size={20} className="text-blue-600" /> REGISTRE DES OBLIGATIONS ET PREUVES
            </p>
          </div>
          
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 hover:bg-white hover:text-blue-600 px-14 py-8 rounded-[3rem] text-[13px] font-black uppercase tracking-[0.5em] flex items-center gap-6 transition-all active:scale-95 shadow-[0_30px_80px_rgba(37,99,235,0.4)] border-none cursor-pointer group italic text-white"
          >
            <Plus size={28} strokeWidth={4} className="group-hover:rotate-90 transition-transform" /> NOUVELLE EXIGENCE
          </button>
        </header>

        {/* 📊 MATRICE D'INDICATEURS DE PERFORMANCE */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 animate-in slide-in-from-bottom-10 duration-1000">
            <StatCard label="Total Exigences" value={stats.total} color="blue" icon={<BookOpen />} />
            <StatCard label="Textes Conformes" value={stats.compliant} color="emerald" icon={<CheckCircle />} />
            <StatCard label="Écarts Détectés" value={stats.nonCompliant} color="red" icon={<XCircle />} />
            <StatCard label="Indice Conformité" value={`${stats.complianceRate}%`} color="amber" icon={<AlertTriangle />} />
          </div>
        )}

        {/* 🔍 BARRE DE RECHERCHE QUANTIQUE */}
        <div className="bg-[#151A2D] p-10 rounded-[4rem] border-4 border-white/5 flex items-center gap-8 backdrop-blur-3xl shadow-4xl relative z-20">
          <Search size={32} className="text-blue-600 ml-4" />
          <input 
            type="text" 
            placeholder="RECHERCHER UN TEXTE DE LOI, UN DÉCRET, UNE RÉFÉRENCE..." 
            className="w-full bg-black/60 border-4 border-white/5 rounded-[3rem] px-10 py-8 text-[16px] font-black uppercase italic text-white outline-none focus:border-blue-600 shadow-inner transition-all placeholder:text-slate-700 tracking-widest"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* 🏛️ REGISTRE DES TEXTES LÉGAUX (FULL SPACE TABLE) */}
        <div className="bg-[#151A2D] border-4 border-white/5 rounded-[5rem] overflow-hidden backdrop-blur-3xl shadow-4xl relative min-h-125">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead className="bg-black/60 border-b-4 border-white/5">
                <tr className="text-[12px] text-slate-500 italic uppercase tracking-[0.5em] font-black leading-none">
                  <th className="p-12">Texte & Référence Documentaire</th>
                  <th className="p-12">Autorité Émettrice</th>
                  <th className="p-12">Échéance</th>
                  <th className="p-12 text-center">Statut SMI</th>
                  <th className="p-12 text-right">Pilotage Matrix</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-white/5 italic">
                {filteredRequirements.map((req) => (
                  <tr key={req.SLR_Id} className="hover:bg-white/5 transition-colors group">
                    <td className="p-12">
                      <div className="flex flex-col items-start space-y-4">
                        <span className="text-[10px] font-black uppercase bg-blue-600/10 text-blue-400 px-5 py-2 rounded-xl border-2 border-blue-600/20 tracking-widest shadow-inner">
                           {req.SLR_Category}
                        </span>
                        <p className="text-2xl font-black tracking-tighter group-hover:text-blue-400 transition-colors uppercase leading-none text-white">
                           {req.SLR_Title}
                        </p>
                        <p className="text-[12px] text-slate-500 font-black tracking-[0.3em] uppercase">
                           {req.SLR_Reference}
                        </p>
                      </div>
                    </td>
                    <td className="p-12 text-[14px] text-slate-400 font-black uppercase tracking-[0.3em] italic">
                       {req.SLR_Authority || 'N/A'}
                    </td>
                    <td className="p-12">
                      {req.SLR_Deadline ? (
                        <div className="flex items-center gap-4 text-amber-500 text-[13px] font-black italic tracking-widest bg-amber-500/10 w-fit px-5 py-2.5 rounded-2xl border border-amber-500/20 shadow-inner">
                          <Calendar size={18} /> {new Date(req.SLR_Deadline).toLocaleDateString('fr-FR')}
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-600 font-black uppercase tracking-widest">PERMANENTE</span>
                      )}
                    </td>
                    <td className="p-12 text-center">
                       <StatusBadge status={req.SLR_Status} />
                    </td>
                    <td className="p-12 text-right">
                      <div className="flex justify-end gap-6 opacity-50 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleUpdateStatus(req.SLR_Id, 'RESPECTEE')} 
                          className="p-5 bg-emerald-500/10 text-emerald-500 rounded-3xl hover:bg-emerald-500 hover:text-white transition-all border-2 border-emerald-500/20 cursor-pointer shadow-inner active:scale-90"
                          title="Valider la conformité"
                        >
                          <CheckCircle size={28} />
                        </button>
                        <button 
                          onClick={() => handleUpdateStatus(req.SLR_Id, 'NON_CONFORME')} 
                          className="p-5 bg-rose-500/10 text-rose-500 rounded-3xl hover:bg-rose-500 hover:text-white transition-all border-2 border-rose-500/20 cursor-pointer shadow-inner active:scale-90"
                          title="Déclarer un écart"
                        >
                          <XCircle size={28} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredRequirements.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-32 text-center text-slate-600 italic font-black uppercase tracking-[0.5em] opacity-40">
                      Aucune exigence légale indexée dans ce périmètre.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* 📟 MODALE D'INDEXATION RÉGLEMENTAIRE (FULL SPACE) */}
        {isModalOpen && (
          <div className="fixed inset-0 z-110 bg-black/95 backdrop-blur-3xl flex items-center justify-center p-16 animate-in zoom-in duration-500">
            <div className="bg-[#151A2D] border-4 border-white/10 rounded-[6rem] w-full max-w-6xl max-h-[90vh] shadow-[0_0_150px_rgba(37,99,235,0.15)] flex flex-col relative text-left overflow-hidden">
              
              {/* Header Modale Sticky */}
              <div className="p-16 border-b-4 border-white/5 flex justify-between items-center sticky top-0 bg-[#151A2D]/95 backdrop-blur-xl z-20">
                <div>
                  <h2 className="text-6xl italic font-black tracking-tighter text-white flex items-center gap-6">
                     <div className="p-5 bg-blue-600 rounded-3xl shadow-[0_0_30px_rgba(37,99,235,0.5)]"><Plus size={36} strokeWidth={4} /></div>
                     NOUVELLE <span className="text-blue-600">EXIGENCE</span>
                  </h2>
                  <p className="text-slate-500 text-[12px] mt-6 tracking-[0.6em] italic font-black uppercase flex items-center gap-4">
                     <ShieldCheck size={16} className="text-emerald-500" /> INDEXATION RÉGLEMENTAIRE RÉPUBLIQUE DU SÉNÉGAL
                  </p>
                </div>
                <button 
                  onClick={() => setIsModalOpen(false)} 
                  className="p-8 bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-500 transition-all rounded-[2.5rem] border-none cursor-pointer active:scale-90"
                >
                  <X size={40} strokeWidth={3} />
                </button>
              </div>
              
              {/* Formulaire ISO */}
              <form onSubmit={handleSubmit} className="p-20 space-y-12 overflow-y-auto custom-scrollbar relative z-10">
                <div className="grid grid-cols-2 gap-16">
                  <div className="space-y-6">
                    <label className="text-[12px] text-slate-500 ml-6 tracking-[0.4em] italic font-black uppercase">Domaine d&apos;application SDE *</label>
                    <select
                      value={formData.SLR_Category}
                      onChange={(e) => setFormData({...formData, SLR_Category: e.target.value})}
                      className="w-full bg-black/60 border-4 border-white/5 rounded-[3.5rem] p-10 text-[16px] font-black uppercase italic outline-none focus:border-blue-600 transition-all appearance-none cursor-pointer shadow-inner text-white tracking-widest"
                    >
                      {['Travail', 'Environnement', 'Fiscalité', 'Santé Sécurité', 'Commerce', 'Social'].map(c => (
                        <option key={c} value={c} className="bg-[#0B0F1A]">{c}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-6">
                    <label className="text-[12px] text-slate-500 ml-6 tracking-[0.4em] italic font-black uppercase">Autorité de Régulation</label>
                    <input
                      value={formData.SLR_Authority}
                      onChange={(e) => setFormData({...formData, SLR_Authority: e.target.value.toUpperCase()})}
                      className="w-full bg-black/60 border-4 border-white/5 rounded-[3.5rem] p-10 text-[16px] font-black italic outline-none focus:border-blue-600 text-white shadow-inner uppercase tracking-widest placeholder:text-slate-700"
                      placeholder="ANSD, DGID, MINISTÈRE DU TRAVAIL..."
                    />
                  </div>
                </div>
                
                <div className="space-y-6 text-left">
                  <label className="text-[12px] text-slate-500 ml-6 tracking-[0.4em] italic font-black uppercase">Libellé Radical de l&apos;Exigence *</label>
                  <input
                    required
                    value={formData.SLR_Title}
                    onChange={(e) => setFormData({...formData, SLR_Title: e.target.value.toUpperCase()})}
                    className="w-full bg-black/60 border-4 border-white/5 rounded-[3.5rem] p-10 text-[20px] font-black italic outline-none focus:border-blue-600 text-white shadow-inner tracking-widest uppercase placeholder:text-slate-700"
                    placeholder="EX: DÉCLARATION ANNUELLE VRS, CODE DU TRAVAIL..."
                  />
                </div>
                
                <div className="space-y-6 text-left">
                  <label className="text-[12px] text-slate-500 ml-6 tracking-[0.4em] italic font-black uppercase">Synthèse & Analyse des Obligations</label>
                  <textarea
                    value={formData.SLR_Description}
                    onChange={(e) => setFormData({...formData, SLR_Description: e.target.value})}
                    className="w-full bg-black/60 border-4 border-white/5 rounded-[3.5rem] p-10 text-[16px] font-bold italic outline-none focus:border-blue-600 h-48 text-slate-300 resize-none leading-relaxed shadow-inner placeholder:text-slate-700"
                    placeholder="Détails du texte, articles concernés et enjeux pour l'organisation SDE..."
                  />
                </div>

                <div className="space-y-6 text-left">
                  <label className="text-[12px] text-slate-500 ml-6 tracking-[0.4em] italic font-black uppercase">Référence Légale (Art. / Loi / Décret) *</label>
                  <input
                    required
                    value={formData.SLR_Reference}
                    onChange={(e) => setFormData({...formData, SLR_Reference: e.target.value.toUpperCase()})}
                    className="w-full bg-black/60 border-4 border-white/5 rounded-[3.5rem] p-10 text-[18px] font-black italic outline-none focus:border-blue-600 text-blue-400 shadow-inner placeholder:text-slate-700 uppercase tracking-widest"
                    placeholder="EX: LOI N° 97-17 DU 1ER DÉCEMBRE 1997, ART. L.118..."
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-16">
                  <div className="space-y-6 text-left">
                    <label className="text-[12px] text-slate-500 ml-6 tracking-[0.4em] italic font-black uppercase">Vigilance : Date d&apos;Échéance</label>
                    <input
                      type="date"
                      value={formData.SLR_Deadline}
                      onChange={(e) => setFormData({...formData, SLR_Deadline: e.target.value})}
                      className="w-full bg-black/60 border-4 border-white/5 rounded-[3.5rem] p-10 text-[16px] font-black italic outline-none focus:border-blue-600 text-white shadow-inner tracking-widest"
                    />
                  </div>
                  <div className="space-y-6 text-left">
                    <label className="text-[12px] text-slate-500 ml-6 tracking-[0.4em] italic font-black uppercase">Document de Preuve (URL Archive)</label>
                    <input
                      type="url"
                      value={formData.SLR_Evidence}
                      onChange={(e) => setFormData({...formData, SLR_Evidence: e.target.value})}
                      className="w-full bg-black/60 border-4 border-white/5 rounded-[3.5rem] p-10 text-[16px] font-bold italic outline-none focus:border-blue-600 text-emerald-500 shadow-inner placeholder:text-slate-700 tracking-widest"
                      placeholder="https://cloud.qualisoft.sn/SMI/..."
                    />
                  </div>
                </div>

                {/* Bouton de Validation Souveraine */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-blue-600 py-12 mt-10 rounded-[4rem] font-black text-2xl tracking-[0.5em] flex items-center justify-center gap-6 hover:bg-white hover:text-blue-600 transition-all disabled:opacity-50 shadow-[0_30px_80px_rgba(37,99,235,0.4)] border-none cursor-pointer active:scale-95 italic text-white group"
                >
                  {submitting ? <Loader2 className="animate-spin" size={32} /> : <Save size={32} strokeWidth={3} className="group-hover:scale-110 transition-transform" />} VALIDER L&apos;EXIGENCE AU REGISTRE LÉGAL
                </button>
              </form>
            </div>
          </div>
        )}
      </div>

      <style jsx global>{`
        ::-webkit-scrollbar { width: 8px; height: 8px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 20px; border: 2px solid #0b0f1a; }
        ::-webkit-scrollbar-thumb:hover { background: #2563eb; }
      `}</style>
    </div>
  );
}

/** 📊 COMPOSANT ATOMIQUE : CARTE STATISTIQUE HAUTE FIDÉLITÉ */
function StatCard({ label, value, icon, color }: any) {
  const colors: Record<string, string> = {
    blue: 'text-blue-500 bg-blue-600/10 border-blue-600/20 shadow-[0_0_40px_rgba(37,99,235,0.1)]',
    emerald: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20 shadow-[0_0_40px_rgba(16,185,129,0.1)]',
    red: 'text-rose-500 bg-rose-500/10 border-rose-500/20 shadow-[0_0_40px_rgba(244,63,94,0.1)]',
    amber: 'text-amber-500 bg-amber-500/10 border-amber-500/20 shadow-[0_0_40px_rgba(245,158,11,0.1)]'
  };
  
  return (
    <div className="bg-[#151A2D] border-4 border-white/5 rounded-[4rem] p-12 flex flex-col gap-8 backdrop-blur-3xl hover:bg-black/40 transition-all shadow-4xl group text-left relative overflow-hidden">
      <div className="absolute -right-8 -bottom-8 opacity-[0.03] group-hover:scale-110 transition-transform duration-1000">
        {React.cloneElement(icon, { size: 150 })}
      </div>
      <div className={cn("p-6 rounded-4xl w-fit border-2 shadow-inner relative z-10", colors[color])}>
        {React.cloneElement(icon, { size: 36, strokeWidth: 2.5 })}
      </div>
      <div className="text-left relative z-10">
        <p className="text-7xl font-black italic leading-none tracking-tighter text-white">{value}</p>
        <p className="text-[12px] text-slate-500 mt-6 tracking-[0.4em] italic font-black uppercase leading-none">{label}</p>
      </div>
    </div>
  );
}

/** 🏷️ COMPOSANT ATOMIQUE : BADGE DE STATUT SMI */
function StatusBadge({ status }: { status: string }) {
  const config = {
    'A_RESPECTER': { label: 'VEILLE ACTIVE', color: 'text-blue-400 bg-blue-600/10 border-blue-600/30 shadow-[0_0_15px_rgba(37,99,235,0.2)]' },
    'RESPECTEE': { label: 'CONFORME §SMI', color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.2)]' },
    'NON_CONFORME': { label: 'ÉCART DÉTECTÉ', color: 'text-rose-500 bg-rose-500/10 border-rose-500/30 shadow-[0_0_15px_rgba(244,63,94,0.2)]' },
    'EN_COURS': { label: 'TRAITEMENT...', color: 'text-amber-500 bg-amber-500/10 border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.2)]' }
  };
  const { label, color } = config[status as keyof typeof config] || config.A_RESPECTER;
  return <span className={cn("px-6 py-2.5 rounded-3xl text-[10px] border-2 uppercase font-black italic tracking-[0.4em]", color)}>{label}</span>;
}