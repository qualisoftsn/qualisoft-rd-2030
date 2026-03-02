/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * 💡 MODULE : RAPPORT D'AUDIT ET CLÔTURE
 * -------------------------------------------------------------------------
 * RÔLE : Saisie des constats (PF, NC) et clôture officielle de l'audit.
 * FIX : Migration sur Sonner, correction de la grille responsive pour les 
 * constats (grid-cols-12), et design rehaussé pour les actions critiques.
 * -------------------------------------------------------------------------
 * DATE : 02 Mars 2026 | 13:24 GMT
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import apiClient from '@/core/api/api-client';
import { 
  FileText, Plus, Trash2, Save, Loader2, ArrowLeft, ShieldAlert 
} from 'lucide-react';
import { toast, Toaster } from 'sonner';

// --- INTERFACES STRICTES ---
interface Processus { PR_Libelle: string; }
interface AuditDetails { AU_Title: string; AU_Reference: string; AU_Processus?: Processus; }
interface Finding { 
  FI_Description: string; 
  FI_Type: 'CONFORMITE' | 'POINT_FORT' | 'OBSERVATION' | 'NC_MINEURE' | 'NC_MAJEURE' | string; 
}
interface NonConformityDraft {
  index: number; NC_Libelle: string; NC_Description: string; NC_Gravite: 'MAJEURE' | 'MINEURE';
}

export default function RapportAuditPage() {
  const params = useParams();
  const id = params?.id as string; 
  const router = useRouter();
  
  const [audit, setAudit] = useState<AuditDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [findings, setFindings] = useState<Finding[]>([{ FI_Description: '', FI_Type: 'CONFORMITE' }]);
  const [ncs, setNcs] = useState<NonConformityDraft[]>([]);

  useEffect(() => {
    const fetchAudit = async () => {
      if (!id) return;
      try {
        const res = await apiClient.get<AuditDetails>(`/audits/${id}`);
        setAudit(res.data);
      } catch (err) { 
        toast.error("Impossible de charger les données de l'audit.");
      } finally { 
        setLoading(false); 
      }
    };
    fetchAudit();
  }, [id]);

  const addFinding = () => setFindings([...findings, { FI_Description: '', FI_Type: 'CONFORMITE' }]);
  
  const removeFinding = (idx: number) => {
    setFindings(findings.filter((_, i) => i !== idx));
    setNcs(ncs.filter((n) => n.index !== idx));
  };

  const updateFinding = (index: number, field: keyof Finding, value: string) => {
    const newFindings = [...findings];
    newFindings[index] = { ...newFindings[index], [field]: value };
    setFindings(newFindings);

    if (field === 'FI_Type') {
      if (value === 'NC_MINEURE' || value === 'NC_MAJEURE') {
        if (!ncs.find(n => n.index === index)) {
          setNcs([...ncs, { 
            index, 
            NC_Libelle: `Écart: ${audit?.AU_Title || 'Audit'}`, 
            NC_Description: newFindings[index].FI_Description,
            NC_Gravite: value === 'NC_MAJEURE' ? 'MAJEURE' : 'MINEURE'
          }]);
        } else {
          setNcs(ncs.map(n => n.index === index ? { ...n, NC_Gravite: value === 'NC_MAJEURE' ? 'MAJEURE' : 'MINEURE' } : n));
        }
      } else {
        setNcs(ncs.filter(n => n.index !== index));
      }
    } else if (field === 'FI_Description') {
      setNcs(ncs.map(n => n.index === index ? { ...n, NC_Description: value } : n));
    }
  };

  const handleSubmitReport = async () => {
    if (!id) return;
    
    // Vérification basique
    if (findings.some(f => !f.FI_Description.trim())) {
      toast.error("Veuillez remplir la description de tous les constats.");
      return;
    }

    const tid = toast.loading("Scellement du rapport en cours...");
    try {
      setSubmitting(true);
      await apiClient.post(`/audits/${id}/submit-report`, { findings, nonConformites: ncs });
      toast.success("Rapport clôturé et transmis avec succès !", { id: tid });
      router.push('/dashboard/audits');
    } catch (err: any) { 
      toast.error(err.response?.data?.message || "Erreur critique lors de la clôture.", { id: tid }); 
    } finally { 
      setSubmitting(false); 
    }
  };

  if (loading) return (
    <div className="ml-0 lg:ml-72 flex h-screen items-center justify-center bg-[#0B0F1A] gap-4 text-blue-500 font-black italic uppercase text-xs tracking-widest">
      <Loader2 className="animate-spin" size={40}/> Initialisation du Rapport...
    </div>
  );

  return (
    <div className="flex-1 bg-[#0B0F1A] min-h-screen p-6 lg:p-10 ml-0 lg:ml-72 text-white font-sans italic text-left selection:bg-blue-600/30">
      <Toaster position="top-right" richColors theme="dark" />

      <div className="max-w-6xl mx-auto space-y-10">
        
        {/* HEADER */}
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 border-b-2 border-white/5 pb-10 mt-12 lg:mt-0">
          <div className="flex items-start lg:items-center gap-6 text-left">
            <button onClick={() => router.back()} className="p-4 bg-white/5 rounded-2xl hover:bg-white/10 transition-all text-slate-400 hover:text-white cursor-pointer border-none shrink-0 mt-1 lg:mt-0">
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-4xl lg:text-5xl font-black uppercase italic tracking-tighter text-white leading-none m-0">
                Rapport d&apos;<span className="text-blue-500">Audit</span>
              </h1>
              <div className="flex flex-wrap items-center gap-3 mt-4">
                <span className="bg-blue-600/10 text-blue-400 border border-blue-500/20 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                  Réf: {audit?.AU_Reference || 'N/A'}
                </span>
                <span className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em] italic">
                  Processus: {audit?.AU_Processus?.PR_Libelle || 'Non défini'}
                </span>
              </div>
            </div>
          </div>
          <button 
            onClick={handleSubmitReport} 
            disabled={submitting} 
            className="w-full lg:w-auto bg-linear-to-r from-emerald-600 to-emerald-800 hover:from-emerald-500 hover:to-emerald-700 text-white px-8 py-5 lg:px-10 lg:py-6 rounded-4xl font-black uppercase italic text-xs tracking-widest shadow-2xl shadow-emerald-900/20 flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50 transition-all cursor-pointer border-none"
          >
            {submitting ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />} 
            {submitting ? "Scellement..." : "Clôturer Rapport"}
          </button>
        </header>

        {/* SECTION CONSTATS */}
        <div className="bg-slate-900/40 border-2 border-white/5 rounded-[3rem] lg:rounded-[4rem] p-6 lg:p-10 space-y-8 shadow-2xl">
          <div className="flex justify-between items-center border-b border-white/5 pb-6">
            <h2 className="text-xl lg:text-2xl font-black uppercase italic flex items-center gap-4 text-white m-0 tracking-tight">
              <FileText className="text-blue-500" size={28} /> Constats terrain
            </h2>
            <button 
              onClick={addFinding} 
              className="bg-blue-600 p-4 rounded-2xl transition-all text-white shadow-xl hover:bg-blue-500 hover:scale-110 cursor-pointer border-none"
              title="Ajouter un constat"
            >
              <Plus size={24} />
            </button>
          </div>

          <div className="space-y-6">
            {findings.map((f, index) => (
              <div key={index} className="flex flex-col xl:grid xl:grid-cols-12 gap-6 p-6 lg:p-8 bg-black/20 border border-white/5 rounded-[2.5rem] items-start transition-all hover:border-blue-500/30 group">
                
                {/* Description du constat */}
                <div className="xl:col-span-8 space-y-3 w-full">
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest italic ml-2 block">
                    Description factuelle (Preuve / Écart)
                  </label>
                  <textarea 
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-sm font-bold text-white outline-none focus:border-blue-500 min-h-30 italic transition-colors resize-y"
                    value={f.FI_Description} 
                    onChange={(e) => updateFinding(index, 'FI_Description', e.target.value)} 
                    placeholder="Saisissez le constat ici..." 
                  />
                </div>

                {/* Classification et Bouton */}
                <div className="xl:col-span-4 flex flex-col sm:flex-row xl:flex-col justify-between gap-6 w-full h-full">
                  <div className="space-y-3 flex-1">
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest italic ml-2 block">
                      Classification ISO
                    </label>
                    <div className="relative">
                      <select 
                        className={`w-full bg-slate-900 border-2 rounded-3xl p-5 text-[11px] font-black uppercase tracking-widest outline-none italic cursor-pointer appearance-none transition-colors ${
                          f.FI_Type.includes('NC') ? 'border-red-500/30 text-red-400 focus:border-red-500' : 
                          f.FI_Type === 'POINT_FORT' ? 'border-emerald-500/30 text-emerald-400 focus:border-emerald-500' :
                          'border-white/10 text-blue-400 focus:border-blue-500'
                        }`}
                        value={f.FI_Type} 
                        onChange={(e) => updateFinding(index, 'FI_Type', e.target.value)}
                      >
                        <option value="CONFORMITE" className="text-white bg-[#0B0F1A]">✅ Conformité</option>
                        <option value="POINT_FORT" className="text-emerald-400 bg-[#0B0F1A]">⭐ Point Fort</option>
                        <option value="OBSERVATION" className="text-amber-400 bg-[#0B0F1A]">👀 Observation</option>
                        <option value="NC_MINEURE" className="text-red-400 bg-[#0B0F1A]">⚠️ NC Mineure</option>
                        <option value="NC_MAJEURE" className="text-red-500 bg-[#0B0F1A]">🚨 NC Majeure</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="xl:pt-4 flex justify-end shrink-0">
                    <button 
                      onClick={() => removeFinding(index)} 
                      disabled={findings.length === 1}
                      className="p-4 bg-white/5 rounded-2xl text-slate-500 hover:text-white hover:bg-red-600 transition-all cursor-pointer border-none disabled:opacity-30 disabled:cursor-not-allowed"
                      title="Supprimer le constat"
                    >
                      <Trash2 size={24} />
                    </button>
                  </div>
                </div>

              </div>
            ))}
          </div>
        </div>

        {/* GÉNÉRATION AUTO DES NON-CONFORMITÉS */}
        {ncs.length > 0 && (
          <div className="bg-red-500/5 border-2 border-red-500/20 rounded-[3rem] lg:rounded-[4rem] p-8 lg:p-10 space-y-8 animate-in slide-in-from-bottom-8 text-left shadow-[0_0_40px_rgba(239,68,68,0.05)]">
            <h3 className="text-red-500 font-black uppercase italic flex flex-col sm:flex-row items-start sm:items-center gap-4 text-lg lg:text-xl m-0 tracking-tight">
              <div className="p-3 bg-red-500/20 rounded-2xl shrink-0">
                <ShieldAlert size={28} className="animate-pulse" /> 
              </div>
              Génération automatique de {ncs.length} Fiche(s) d&apos;Anomalie
            </h3>
            
            <div className="grid gap-4">
              {ncs.map((nc, i) => (
                <div key={i} className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-black/40 p-6 rounded-3xl border border-red-500/10 gap-4">
                  <p className="text-xs font-bold italic text-slate-300 leading-relaxed m-0 border-l-2 border-red-500/50 pl-4">
                    &quot;{nc.NC_Description || "Description en attente de saisie..."}&quot;
                  </p>
                  <span className={`text-[9px] font-black px-4 py-2 rounded-xl uppercase italic text-white shadow-lg shrink-0 w-full sm:w-auto text-center ${
                    nc.NC_Gravite === 'MAJEURE' ? 'bg-red-600' : 'bg-amber-600'
                  }`}>
                    {nc.NC_Gravite}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}