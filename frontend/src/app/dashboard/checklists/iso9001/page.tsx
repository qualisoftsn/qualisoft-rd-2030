/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * 💡 MODULE : CHECKLIST D'AUDIT ISO 9001:2015
 * -------------------------------------------------------------------------
 * RÔLE : Évaluation de la conformité du Système de Management de la Qualité.
 * FIX : Conversion totale au Dark Theme (#0B0F1A) pour cohérence globale, 
 * refonte responsive (lg:ml-72), et intégration de Sonner pour les toasts.
 * -------------------------------------------------------------------------
 * DATE : 02 Mars 2026 | 13:43 GMT
 */

'use client';

import React, { useEffect, useMemo, useState, useCallback } from 'react';
import apiClient from '@/core/api/api-client';
import {
  CheckCircle2, Download, RefreshCw, Search, Target, XCircle,
  Layers, Loader2, ExternalLink, Check, X, Minus, HelpCircle
} from 'lucide-react';
import { toast, Toaster } from 'sonner';

// --- TYPES CONFORMES ---
type ResponseType = 'YES' | 'NO' | 'PARTIAL' | 'NA';

interface ChecklistItem {
  LC_Id: string;
  LC_Clause: string;
  LC_Title: string;
  LC_Description: string;
  LC_Criteria: string;
  LC_IsMandatory: boolean;
  LC_SenegalSpecific: boolean;
  response?: {
    CR_Response: ResponseType;
    CR_Comment?: string;
    CR_Evidence?: string;
    CR_IsCompliant: boolean;
  };
}

export default function ISO9001ChecklistPage() {
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeClause, setActiveClause] = useState<string>('4');
  const [searchTerm, setSearchTerm] = useState('');
  const [savingId, setSavingId] = useState<string | null>(null);

  // --- CHARGEMENT DES DONNÉES ---
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/checklist?standard=ISO9001');
      const data = res.data?.data || res.data;
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error('Échec du chargement de la checklist ISO 9001');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // --- CALCUL DES STATISTIQUES ---
  const stats = useMemo(() => {
    const total = items.length;
    const compliant = items.filter(i => i.response?.CR_Response === 'YES').length;
    const nonCompliant = items.filter(i => i.response?.CR_Response === 'NO').length;
    const partial = items.filter(i => i.response?.CR_Response === 'PARTIAL').length;
    const na = items.filter(i => i.response?.CR_Response === 'NA').length;
    const rate = total > 0 ? Math.round((compliant / total) * 100) : 0;
    return { total, compliant, nonCompliant, partial, na, rate };
  }, [items]);

  // --- FILTRAGE ---
  const filteredItems = useMemo(() => {
    return items.filter(i =>
      i.LC_Clause.startsWith(activeClause) &&
      (i.LC_Title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        i.LC_Clause.includes(searchTerm) ||
        i.LC_Description.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [items, activeClause, searchTerm]);

  // --- SAUVEGARDE ---
  const updateResponse = async (id: string, resp: ResponseType) => {
    setSavingId(id);
    const tid = toast.loading("Enregistrement...");
    try {
      await apiClient.post('/checklist/response', { LC_Id: id, CR_Response: resp });
      toast.success(`Conformité §${id} mise à jour.`, { id: tid });
      fetchData();
    } catch (e) {
      toast.error("Échec de l'enregistrement.", { id: tid });
    } finally {
      setSavingId(null);
    }
  };

  if (loading && items.length === 0) {
    return (
      <div className="ml-0 lg:ml-72 flex min-h-screen items-center justify-center bg-[#0B0F1A] gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
        <p className="text-sm font-black italic uppercase tracking-widest text-blue-500">
          Chargement ISO 9001...
        </p>
      </div>
    );
  }

  return (
    <div className="ml-0 lg:ml-72 bg-[#0B0F1A] min-h-screen p-6 lg:p-10 text-white font-sans selection:bg-blue-600/30 pb-24">
      <Toaster position="top-right" richColors theme="dark" />

      <div className="mx-auto max-w-400 space-y-10">
        
        {/* HEADER */}
        <header className="border-b-2 border-white/5 pb-8 mt-12 lg:mt-0">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-full bg-blue-600/20 border border-blue-500/30 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-blue-400 italic">
                  ISO 9001:2015
                </span>
                <span className="rounded-full bg-emerald-500/20 border border-emerald-500/30 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-emerald-400 italic">
                  {stats.rate}% Conformité
                </span>
              </div>
              <h1 className="mt-4 text-4xl lg:text-5xl font-black italic uppercase text-white tracking-tighter m-0 leading-none">
                Checklist d&apos;Audit <span className="text-blue-500">Qualité</span>
              </h1>
              <p className="mt-3 text-xs font-bold uppercase tracking-[0.2em] text-slate-500 m-0">
                Évaluation de la conformité selon les exigences des clauses §4 à §10
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <button onClick={fetchData} className="inline-flex items-center justify-center rounded-2xl bg-white/5 px-5 py-4 text-xs font-black uppercase tracking-widest text-slate-300 hover:text-white hover:bg-white/10 transition-colors border-none cursor-pointer">
                <RefreshCw className="mr-2 h-4 w-4" /> Actualiser
              </button>
              <button className="inline-flex items-center justify-center rounded-2xl bg-blue-600 px-6 py-4 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-blue-900/20 hover:bg-blue-500 transition-colors border-none cursor-pointer">
                <Download className="mr-2 h-4 w-4" /> Rapport
              </button>
            </div>
          </div>

          <div className="mt-8 max-w-md">
            <div className="relative group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={18} />
              <input
                type="text"
                placeholder="Rechercher par clause, titre..."
                className="w-full rounded-3xl bg-black/40 border-2 border-white/10 py-4 pl-12 pr-4 text-xs font-bold uppercase outline-none focus:border-blue-500 text-white placeholder-slate-600 transition-colors"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <p className="mt-3 text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-2">
              {filteredItems.length} résultat(s) • Clause active : §{activeClause}
            </p>
          </div>
        </header>

        {/* KPI DASHBOARD */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-6">
          <KPIStat title="Taux de conformité" value={`${stats.rate}%`} icon={Target} color={stats.rate >= 90 ? 'emerald' : stats.rate >= 75 ? 'blue' : 'amber'} />
          <KPIStat title="Exigences conformes" value={stats.compliant.toString()} icon={CheckCircle2} color="emerald" />
          <KPIStat title="Écarts identifiés" value={stats.nonCompliant.toString()} icon={XCircle} color="red" />
          <KPIStat title="Total évalué" value={stats.total.toString()} icon={Layers} color="gray" />
        </div>

        {/* MAIN CONTENT */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8 items-start">
          
          {/* NAVIGATION CLAUSES */}
          <div className="xl:col-span-1 xl:sticky top-10">
            <nav className="rounded-4xl bg-slate-900/40 border-2 border-white/5 overflow-hidden shadow-2xl">
              <div className="border-b-2 border-white/5 px-6 py-5 bg-black/20">
                <h2 className="text-sm font-black uppercase italic tracking-widest text-white m-0">Navigation ISO</h2>
              </div>
              <div className="divide-y divide-white/5">
                {[
                  { id: '4', title: 'Contexte de l\'organisation', desc: 'Enjeux & parties intéressées' },
                  { id: '5', title: 'Leadership', desc: 'Politique & responsabilités' },
                  { id: '6', title: 'Planification', desc: 'Risques & opportunités' },
                  { id: '7', title: 'Support', desc: 'Ressources & information' },
                  { id: '8', title: 'Réalisation', desc: 'Opérations & production' },
                  { id: '9', title: 'Évaluation des perf.', desc: 'Surveillance & revue' },
                  { id: '10', title: 'Amélioration', desc: 'Actions correctives' },
                ].map((clause) => {
                  const clauseItems = items.filter(i => i.LC_Clause.startsWith(clause.id));
                  const progress = clauseItems.length > 0 ? Math.round((clauseItems.filter(i => i.response?.CR_Response === 'YES').length / clauseItems.length) * 100) : 0;
                  
                  return (
                    <button
                      key={clause.id}
                      onClick={() => setActiveClause(clause.id)}
                      className={`w-full px-6 py-5 text-left transition-all border-none cursor-pointer flex items-center justify-between group ${
                        activeClause === clause.id ? 'bg-blue-600/10 border-l-4 border-l-blue-500' : 'hover:bg-white/5 border-l-4 border-l-transparent'
                      }`}
                    >
                      <div className="pr-4">
                        <p className={`text-xs font-black uppercase italic m-0 ${activeClause === clause.id ? 'text-blue-400' : 'text-slate-300 group-hover:text-white'}`}>
                          §{clause.id} {clause.title}
                        </p>
                        <p className="mt-1 text-[10px] font-bold tracking-widest text-slate-500 m-0">{clause.desc}</p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className={`text-[10px] font-black m-0 ${activeClause === clause.id ? 'text-blue-400' : 'text-slate-500'}`}>{progress}%</p>
                        <div className="mt-2 h-1.5 w-12 overflow-hidden rounded-full bg-white/10">
                          <div className={`h-full rounded-full ${activeClause === clause.id ? 'bg-blue-500' : 'bg-slate-600'}`} style={{ width: `${progress}%` }} />
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </nav>
          </div>

          {/* CHECKLIST ITEMS */}
          <div className="xl:col-span-3 space-y-6">
            <div className="rounded-[2.5rem] bg-slate-900/40 border-2 border-white/5 overflow-hidden shadow-2xl">
              <div className="border-b-2 border-white/5 bg-black/20 px-8 py-6 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div>
                  <h2 className="text-xl font-black uppercase italic text-white m-0">Clause §{activeClause} — Exigences</h2>
                  <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-slate-500 m-0">
                    {filteredItems.length} critère(s) à évaluer
                  </p>
                </div>
              </div>

              <div className="divide-y divide-white/5">
                {filteredItems.length === 0 ? (
                  <div className="p-16 text-center">
                    <Search className="mx-auto h-12 w-12 text-slate-600 mb-4 opacity-50" />
                    <h3 className="text-sm font-black uppercase italic text-slate-400 m-0">Aucune exigence trouvée</h3>
                    <button onClick={() => setSearchTerm('')} className="mt-6 rounded-2xl bg-white/5 px-6 py-3 text-[10px] font-black uppercase tracking-widest text-white hover:bg-white/10 transition-colors border-none cursor-pointer">
                      Réinitialiser la recherche
                    </button>
                  </div>
                ) : (
                  filteredItems.map((item) => (
                    <div key={item.LC_Id} className="p-6 lg:p-8 hover:bg-white/5 transition-colors flex flex-col lg:flex-row gap-6 lg:items-center justify-between group">
                      <div className="flex-1 space-y-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded bg-blue-600/20 border border-blue-500/20 px-2 py-1 text-[10px] font-black text-blue-400 uppercase tracking-widest italic">
                            §{item.LC_Clause}
                          </span>
                          {item.LC_IsMandatory && (
                            <span className="rounded bg-red-500/20 border border-red-500/20 px-2 py-1 text-[9px] font-black text-red-400 uppercase tracking-widest">
                              Obligatoire
                            </span>
                          )}
                        </div>
                        <p className="text-sm font-black italic uppercase text-white m-0 leading-tight group-hover:text-blue-300 transition-colors">
                          {item.LC_Title}
                        </p>
                        <p className="text-[11px] font-bold text-slate-400 m-0 leading-relaxed italic border-l-2 border-white/10 pl-3">
                          {item.LC_Criteria}
                        </p>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row lg:flex-col gap-4 items-start sm:items-center lg:items-end shrink-0">
                        <ResponseBadge response={item.response?.CR_Response} />
                        <div className="flex bg-black/40 rounded-xl p-1 border border-white/5">
                          <ResponseButton response="YES" active={item.response?.CR_Response === 'YES'} color="emerald" onClick={() => updateResponse(item.LC_Id, 'YES')} loading={savingId === item.LC_Id} />
                          <ResponseButton response="NO" active={item.response?.CR_Response === 'NO'} color="red" onClick={() => updateResponse(item.LC_Id, 'NO')} loading={savingId === item.LC_Id} />
                          <ResponseButton response="PARTIAL" active={item.response?.CR_Response === 'PARTIAL'} color="amber" onClick={() => updateResponse(item.LC_Id, 'PARTIAL')} loading={savingId === item.LC_Id} />
                          <ResponseButton response="NA" active={item.response?.CR_Response === 'NA'} color="gray" onClick={() => updateResponse(item.LC_Id, 'NA')} loading={savingId === item.LC_Id} />
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* BLOC INFO */}
            <div className="rounded-4xl bg-blue-900/10 border-2 border-blue-500/20 p-8 shadow-inner relative overflow-hidden">
              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <h3 className="text-sm font-black uppercase italic text-blue-400 m-0 flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg">§</span>
                    Exigence ISO 9001:2015
                  </h3>
                  <p className="mt-3 text-[11px] font-bold text-slate-300 m-0 max-w-2xl leading-relaxed italic">
                    L&apos;organisation doit effectuer des audits internes à des intervalles planifiés pour fournir des informations sur la conformité du système de management de la qualité aux exigences de l&apos;ISO.
                  </p>
                </div>
                <a href="https://www.iso.org/standard/62085.html" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center rounded-3xl bg-blue-600/20 px-6 py-4 text-[10px] font-black uppercase tracking-widest text-blue-400 hover:bg-blue-600 hover:text-white transition-all border-none no-underline shrink-0">
                  Norme Officielle <ExternalLink className="ml-2 h-4 w-4" />
                </a>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// COMPOSANTS ISO 9001
// ==========================================

function KPIStat({ title, value, icon: Icon, color }: any) {
  const colorClasses: Record<string, string> = {
    emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.05)]',
    blue: 'text-blue-400 bg-blue-500/10 border-blue-500/20 shadow-[0_0_20px_rgba(59,130,246,0.05)]',
    amber: 'text-amber-400 bg-amber-500/10 border-amber-500/20 shadow-[0_0_20px_rgba(245,158,11,0.05)]',
    red: 'text-red-400 bg-red-500/10 border-red-500/20 shadow-[0_0_20px_rgba(239,68,68,0.05)]',
    gray: 'text-slate-300 bg-white/5 border-white/10',
  };

  return (
    <div className={`rounded-4xl p-6 border-2 flex items-center gap-5 ${colorClasses[color]}`}>
      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-current bg-opacity-10 text-current">
        <Icon size={24} />
      </div>
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-current opacity-80 m-0">{title}</p>
        <p className="mt-1 text-3xl font-black italic text-white m-0 leading-none">{value}</p>
      </div>
    </div>
  );
}

function ResponseBadge({ response }: { response?: ResponseType }) {
  if (!response) {
    return (
      <span className="inline-flex items-center rounded-full bg-slate-800 border border-slate-700 px-3 py-1 text-[9px] font-black uppercase tracking-widest text-slate-400">
        <HelpCircle className="mr-1.5 h-3 w-3" /> En attente
      </span>
    );
  }

  const config: Record<ResponseType, { label: string; icon: React.ReactNode; color: string }> = {
    YES: { label: 'Conforme', icon: <Check className="h-3 w-3" />, color: 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400' },
    NO: { label: 'Écart', icon: <X className="h-3 w-3" />, color: 'bg-red-500/20 border-red-500/30 text-red-400' },
    PARTIAL: { label: 'Partiel', icon: <Minus className="h-3 w-3" />, color: 'bg-amber-500/20 border-amber-500/30 text-amber-400' },
    NA: { label: 'N/A', icon: <Minus className="h-3 w-3" />, color: 'bg-white/10 border-white/20 text-slate-300' },
  };

  const { label, icon, color } = config[response];
  return (
    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-[9px] font-black uppercase tracking-widest ${color}`}>
      <span className="mr-1.5">{icon}</span> {label}
    </span>
  );
}

function ResponseButton({ response, active, color, onClick, loading }: any) {
  const activeStyles: Record<string, string> = {
    emerald: 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/20',
    red: 'bg-red-600 text-white shadow-lg shadow-red-900/20',
    amber: 'bg-amber-500 text-white shadow-lg shadow-amber-900/20',
    gray: 'bg-slate-600 text-white shadow-lg',
  };

  const idleStyles = 'bg-transparent text-slate-500 hover:bg-white/10 hover:text-white';

  const icons: Record<ResponseType, React.ReactNode> = {
    YES: <Check className="h-4 w-4" />,
    NO: <X className="h-4 w-4" />,
    PARTIAL: <Minus className="h-4 w-4" />,
    NA: <HelpCircle className="h-4 w-4" />,
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className={`inline-flex h-10 w-10 items-center justify-center rounded-lg transition-all border-none cursor-pointer ${
        active ? activeStyles[color] : idleStyles
      } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
      title={response}
    >
      {loading && active ? <Loader2 className="h-4 w-4 animate-spin" /> : icons[response as ResponseType]}
    </button>
  );
}