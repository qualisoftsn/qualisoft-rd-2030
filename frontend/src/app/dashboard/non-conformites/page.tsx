/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 🛡️ MODULE : REGISTRE DES NON-CONFORMITÉS (SMI MATRIX)
 * -------------------------------------------------------------------------
 * RÔLE : Pilotage centralisé des écarts système.
 * NORME : ISO 9001:2015 §10.2.
 * DESIGN : Elite Dark Industrial • Glassmorphism • UI Dense.
 * LOGIQUE : 100% aligné Prisma, Typage Strict Appliqué (Correction Map/Filter).
 * -------------------------------------------------------------------------
 * DATE : 02 Mars 2026 | 11:45 GMT
 */

'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/core/api/api-client';
import { useAuthStore } from '@/store/authStore';
import {
  AlertOctagon, BarChart3, CheckCircle2, ChevronRight, Clock,
  Download, Filter, Loader2, MessageSquare, Plus, Search,
  ShieldAlert, Target, Truck, X, XCircle, RefreshCw, Zap
} from 'lucide-react';
import { toast, Toaster } from 'sonner';
import {
  NonConformite, Processus, User, NCGravity, NCSource, NCStatus,
  NCGravity as NCGravityEnum, NCSource as NCSourceEnum, NCStatus as NCStatusEnum
} from '@/types/elite-sde';

// --- CONFIGURATION SÉMANTIQUE DES SOURCES ---
const SOURCE_CONFIG: Record<NCSource, { label: string; icon: React.ElementType; color: string }> = {
  [NCSourceEnum.CLIENT_COMPLAINT]: { label: 'Réclamation client', icon: MessageSquare, color: 'text-rose-500' },
  [NCSourceEnum.INTERNAL_AUDIT]: { label: 'Audit interne', icon: Target, color: 'text-blue-500' },
  [NCSourceEnum.EXTERNAL_AUDIT]: { label: 'Audit externe', icon: ShieldAlert, color: 'text-indigo-500' },
  [NCSourceEnum.SUPPLIER]: { label: 'Fournisseur', icon: Truck, color: 'text-amber-500' },
  [NCSourceEnum.INCIDENT_SAFETY]: { label: 'Incident SST', icon: AlertOctagon, color: 'text-orange-500' },
  [NCSourceEnum.PROCESS_REVIEW]: { label: 'Revue processus', icon: BarChart3, color: 'text-emerald-500' },
  [NCSourceEnum.MANAGEMENT_REVIEW]: { label: 'Revue direction', icon: Clock, color: 'text-slate-400' },
};

export default function NonConformitesListPage() {
  const router = useRouter();
  const { user } = useAuthStore(); // Utilisation du store Matrix pour l'auth
  const [ncs, setNcs] = useState<NonConformite[]>([]);
  const [processes, setProcesses] = useState<Processus[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    status: 'ALL' as NCStatus | 'ALL',
    gravity: 'ALL' as NCGravity | 'ALL',
    source: 'ALL' as NCSource | 'ALL',
    processusId: 'ALL' as string | 'ALL',
  });

  // --- 📡 SYNCHRONISATION KERNEL ---
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [ncRes, prRes, uRes] = await Promise.all([
        apiClient.get<NonConformite[]>('/non-conformites'),
        apiClient.get<Processus[]>('/processes'),
        apiClient.get<User[]>('/users'),
      ]);
      setNcs(ncRes.data || []);
      setProcesses(prRes.data || []);
      setUsers(uRes.data || []);
    } catch (err) {
      toast.error('RUPTURE DE LIAISON AVEC LE REGISTRE DES ÉCARTS');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // --- 📊 MOTEUR STATISTIQUE EN TEMPS RÉEL ---
  const stats = useMemo(() => {
    const total = ncs.length;
    const closed = ncs.filter(nc => nc.NC_Statut === NCStatusEnum.CLOTURE).length;
    const open = total - closed;
    const critical = ncs.filter(nc => nc.NC_Gravite === NCGravityEnum.CRITIQUE).length;
    const closureRate = total > 0 ? Math.round((closed / total) * 100) : 0;
    return { total, closed, open, critical, closureRate };
  }, [ncs]);

  // --- 🔍 MOTEUR DE RECHERCHE DENSE ---
  const filteredNcs = useMemo(() => {
    return ncs.filter((nc) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch = nc.NC_Libelle.toLowerCase().includes(q) || (nc.NC_Code || '').toLowerCase().includes(q);
      const matchesStatus = filters.status === 'ALL' || nc.NC_Statut === filters.status;
      const matchesGravity = filters.gravity === 'ALL' || nc.NC_Gravite === filters.gravity;
      const matchesSource = filters.source === 'ALL' || nc.NC_Source === filters.source;
      const matchesProcessus = filters.processusId === 'ALL' || nc.NC_ProcessusId === filters.processusId;

      return matchesSearch && matchesStatus && matchesGravity && matchesSource && matchesProcessus;
    });
  }, [ncs, searchQuery, filters]);

  if (loading) return (
    <div className="ml-0 lg:ml-72 flex h-screen items-center justify-center bg-[#0B0F1A] text-red-500 font-black uppercase italic tracking-[0.5em] animate-pulse">
      <Loader2 className="h-10 w-10 animate-spin mr-4" /> Analyse du Registre...
    </div>
  );

  return (
    <div className="ml-0 lg:ml-72 bg-[#0B0F1A] min-h-screen p-8 text-white font-sans italic selection:bg-red-600/30">
      <Toaster position="top-right" richColors theme="dark" />

      {/* 🔝 HEADER STRATÉGIQUE */}
      <header className="mb-10 animate-in fade-in slide-in-from-top-4 mt-12 lg:mt-0">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 border-b border-white/5 pb-8">
          <div>
            <div className="flex items-center gap-4 mb-4">
              <span className="rounded-xl bg-red-600/10 border border-red-500/20 px-4 py-1.5 text-[9px] font-black text-red-500 uppercase tracking-widest">ISO 9001:2015 §10.2</span>
              <span className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-4 py-1.5 text-[9px] font-black text-emerald-400 uppercase tracking-widest">{stats.closureRate}% Clôture</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter m-0 leading-none">Registre des <span className="text-red-500">Non-Conformités</span></h1>
            <p className="mt-3 text-[11px] font-black uppercase tracking-[0.3em] text-slate-500">Pilotage centralisé des écarts et actions correctives</p>
          </div>

          <div className="flex gap-4">
            <button onClick={fetchData} className="p-4 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/5 transition-all cursor-pointer">
              <RefreshCw size={20} />
            </button>
            <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-red-600 hover:bg-white hover:text-red-600 text-white font-black text-[10px] uppercase tracking-widest transition-all shadow-3xl shadow-red-900/40 border-none cursor-pointer">
              <Plus size={16} /> Déclarer Écart
            </button>
          </div>
        </div>

        {/* 🔍 BARRE DE RECHERCHE ET FILTRES SDE */}
        <div className="mt-8 flex flex-wrap gap-4 bg-slate-900/40 p-4 rounded-[2.5rem] border border-white/5 backdrop-blur-md">
          <div className="relative flex-1 min-w-62.5">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input 
              type="text" 
              placeholder="Recherche par code, mot-clé..." 
              value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-4xl py-4 pl-14 pr-6 text-sm font-black italic text-white outline-none focus:border-red-500 transition-all placeholder:text-slate-600"
            />
          </div>
          
          <FilterSelect value={filters.status} onChange={(v: any) => setFilters(p => ({ ...p, status: v }))} options={[
            { val: 'ALL', label: 'TOUS STATUTS' },
            { val: NCStatusEnum.DETECTION, label: 'DÉTECTION' },
            { val: NCStatusEnum.ANALYSE, label: 'ANALYSE' },
            { val: NCStatusEnum.ACTION_EN_COURS, label: 'ACTION EN COURS' },
            { val: NCStatusEnum.VERIFICATION, label: 'VÉRIFICATION' },
            { val: NCStatusEnum.CLOTURE, label: 'CLÔTURÉE' }
          ]} />
          
          <FilterSelect value={filters.gravity} onChange={(v: any) => setFilters(p => ({ ...p, gravity: v }))} options={[
            { val: 'ALL', label: 'TOUTE GRAVITÉ' },
            { val: NCGravityEnum.MINEURE, label: 'MINEURE' },
            { val: NCGravityEnum.MAJEURE, label: 'MAJEURE' },
            { val: NCGravityEnum.CRITIQUE, label: 'CRITIQUE' }
          ]} />

          <FilterSelect value={filters.processusId} onChange={(v: any) => setFilters(p => ({ ...p, processusId: v }))} options={[
            { val: 'ALL', label: 'TOUS PROCESSUS' },
            ...processes.filter(p => p.PR_IsActive).map(p => ({ val: p.PR_Id, label: p.PR_Code }))
          ]} />
        </div>
      </header>

      {/* 📊 TABLEAU DE BORD KPI MATRIX */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12 animate-in fade-in zoom-in-95 duration-700">
        <KPIBox title="Total NC" value={stats.total} icon={AlertOctagon} color="red" />
        <KPIBox title="NC Ouvertes" value={stats.open} icon={XCircle} color="amber" />
        <KPIBox title="NC Clôturées" value={stats.closed} icon={CheckCircle2} color="emerald" />
        <KPIBox title="Taux Clôture" value={`${stats.closureRate}%`} icon={Target} color={stats.closureRate >= 85 ? 'blue' : 'amber'} sub={`Cible : ≥85%`} />
      </div>

      {/* 📋 TABLE DE DONNÉES SDE (DARK MODE) */}
      <div className="bg-[#151A2D]/80 border border-white/5 rounded-[3.5rem] overflow-hidden shadow-2xl animate-in slide-in-from-bottom-8 duration-700 backdrop-blur-sm">
        <div className="p-8 border-b border-white/5 flex justify-between items-center bg-black/20">
          <div>
            <h2 className="text-xl font-black uppercase text-white m-0 leading-none">Registre Actif ({filteredNcs.length})</h2>
            {stats.critical > 0 && <p className="text-[10px] text-red-500 uppercase tracking-widest mt-2 m-0 font-bold">{stats.critical} Action(s) Critique(s) Requise(s)</p>}
          </div>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left">
            <thead className="bg-black/40 border-b border-white/5">
              <tr>
                {['CODE', 'RÉFÉRENCE & LIBELLÉ', 'PROCESSUS', 'SOURCE', 'GRAVITÉ', 'STATUT', 'DATE'].map((h, i) => (
                  <th key={i} className="px-8 py-5 text-[9px] font-black text-slate-500 uppercase tracking-[0.3em]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredNcs.length > 0 ? filteredNcs.map((nc) => {
                const process = processes.find(p => p.PR_Id === nc.NC_ProcessusId);
                const source = SOURCE_CONFIG[nc.NC_Source] || SOURCE_CONFIG[NCSourceEnum.INTERNAL_AUDIT];
                const SourceIcon = source.icon;

                return (
                  <tr key={nc.NC_Id} onClick={() => router.push(`/dashboard/non-conformites/${nc.NC_Id}`)} className="group hover:bg-white/5 transition-all cursor-pointer">
                    <td className="px-8 py-6 whitespace-nowrap"><span className="text-[11px] font-black text-blue-500 uppercase tracking-widest">{nc.NC_Code || `NC-${nc.NC_Id.slice(0, 6)}`}</span></td>
                    <td className="px-8 py-6"><p className="text-sm font-black text-white uppercase truncate max-w-xs m-0">{nc.NC_Libelle}</p></td>
                    <td className="px-8 py-6 whitespace-nowrap"><div className="flex items-center gap-3"><div className="w-2 h-2 rounded-full bg-slate-700" /><span className="text-xs font-bold text-slate-300">{process?.PR_Code || 'N/A'}</span></div></td>
                    <td className="px-8 py-6 whitespace-nowrap"><div className="flex items-center gap-3"><SourceIcon size={14} className={source.color} /><span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{source.label}</span></div></td>
                    <td className="px-8 py-6 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${nc.NC_Gravite === NCGravityEnum.CRITIQUE ? 'bg-red-500/10 text-red-500 border-red-500/20' : nc.NC_Gravite === NCGravityEnum.MAJEURE ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 'bg-slate-800 text-slate-400 border-slate-700'}`}>
                        {nc.NC_Gravite}
                      </span>
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap"><StatusBadge status={nc.NC_Statut} /></td>
                    <td className="px-8 py-6 whitespace-nowrap text-[10px] font-bold text-slate-500 uppercase">{new Date(nc.NC_CreatedAt).toLocaleDateString('fr-FR')}</td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan={7} className="px-8 py-20 text-center">
                    <div className="mx-auto w-16 h-16 bg-white/5 rounded-3xl flex items-center justify-center mb-4"><Zap className="text-slate-600" size={24} /></div>
                    <p className="text-sm font-black uppercase text-slate-400 tracking-widest">Aucun écart détecté</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 🧾 MODAL SOUVERAIN DE CRÉATION */}
      {isModalOpen && <CreateNCModal onClose={() => setIsModalOpen(false)} onCreated={fetchData} processes={processes} users={users} currentUser={user} />}

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #ef4444; }
      `}</style>
    </div>
  );
}

// ============================================================================
// COMPOSANTS MATRIX ELITE
// ============================================================================

function KPIBox({ title, value, icon: Icon, color, sub }: any) {
  const c: any = { red: 'text-red-500 bg-red-500/10 border-red-500/20', amber: 'text-amber-500 bg-amber-500/10 border-amber-500/20', emerald: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20', blue: 'text-blue-500 bg-blue-500/10 border-blue-500/20' };
  return (
    <div className={`p-8 rounded-[2.5rem] border shadow-2xl backdrop-blur-md flex items-center justify-between transition-transform hover:-translate-y-1 ${c[color]}`}>
      <div className="flex items-center gap-5 text-left">
        <div className="p-4 bg-black/40 rounded-2xl shadow-inner"><Icon size={24} /></div>
        <div>
          <h3 className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-1">{title}</h3>
          {sub && <p className="text-[8px] font-bold uppercase tracking-widest opacity-60 m-0">{sub}</p>}
        </div>
      </div>
      <span className="text-4xl font-black italic tracking-tighter m-0 leading-none">{value}</span>
    </div>
  );
}

function FilterSelect({ value, onChange, options }: any) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} className="bg-black/50 border border-white/10 rounded-3xl py-4 px-6 text-[10px] font-black uppercase italic text-white outline-none focus:border-red-500 transition-all cursor-pointer appearance-none min-w-37.5">
      {options.map((o: any) => <option key={o.val} value={o.val}>{o.label}</option>)}
    </select>
  );
}

function StatusBadge({ status }: { status: NCStatus }) {
  const config: any = {
    [NCStatusEnum.DETECTION]: { label: 'Détection', color: 'bg-blue-600/10 text-blue-400 border-blue-500/20' },
    [NCStatusEnum.ANALYSE]: { label: 'Analyse', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
    [NCStatusEnum.ACTION_EN_COURS]: { label: 'Action', color: 'bg-red-500/10 text-red-400 border-red-500/20' },
    [NCStatusEnum.VERIFICATION]: { label: 'Vérification', color: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
    [NCStatusEnum.CLOTURE]: { label: 'Clôturée', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  };
  const c = config[status] || config[NCStatusEnum.DETECTION];
  return <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase italic tracking-widest border ${c.color}`}>{c.label}</span>;
}

// ============================================================================
// MODAL DE DÉCLARATION (§10.2) AVEC TYPAGE STRICT SDE
// ============================================================================

interface CreateNCModalProps {
  onClose: () => void;
  onCreated: () => void;
  processes: Processus[];
  users: User[];
  currentUser: any;
}

function CreateNCModal({ onClose, onCreated, processes, users, currentUser }: CreateNCModalProps) {
  const [data, setData] = useState({
    NC_Libelle: '', NC_Description: '', NC_Source: NCSourceEnum.INTERNAL_AUDIT,
    NC_Gravite: NCGravityEnum.MINEURE, NC_ProcessusId: '', NC_DetectorId: currentUser?.U_Id || ''
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data.NC_ProcessusId || !data.NC_DetectorId) return toast.error("Le processus et le détecteur sont requis (§4.4)");
    setSubmitting(true);
    const tid = toast.loading("Scellage de l'écart...");
    try {
      await apiClient.post('/non-conformites', { ...data, NC_Statut: NCStatusEnum.DETECTION });
      toast.success('NC INSCRITE AU REGISTRE', { id: tid });
      onCreated(); onClose();
    } catch (err: any) { 
      toast.error("ÉCHEC D'ÉCRITURE KERNEL", { id: tid }); 
    } finally { 
      setSubmitting(false); 
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-[#0B0F1A]/95 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="bg-slate-900 border border-white/10 w-full max-w-4xl rounded-[4rem] p-10 shadow-4xl text-left relative overflow-hidden">
        <button onClick={onClose} className="absolute top-8 right-8 text-slate-500 hover:text-white transition-all bg-transparent border-none cursor-pointer"><X size={32} /></button>
        
        <div className="flex items-center gap-5 mb-10 border-b border-white/5 pb-8">
          <div className="w-16 h-16 rounded-3xl bg-red-600 flex items-center justify-center shadow-lg"><AlertOctagon size={32} className="text-white" /></div>
          <div>
            <h2 className="text-3xl font-black uppercase italic tracking-tighter m-0 leading-none">Déclarer un écart</h2>
            <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest mt-2 m-0">Traçabilité ISO 9001 §10.2</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div>
            <label className="text-[10px] font-black uppercase text-slate-500 tracking-[0.3em] ml-4">Libellé de la déviation *</label>
            <input required type="text" value={data.NC_Libelle} onChange={e => setData({...data, NC_Libelle: e.target.value.toUpperCase()})} className="w-full mt-2 bg-black/40 border border-white/10 rounded-3xl p-6 text-xl font-black italic text-white outline-none focus:border-red-500 transition-all placeholder:text-slate-700" placeholder="EX: RUPTURE DE CONTRÔLE RÉCEPTION" />
          </div>

          <div>
            <label className="text-[10px] font-black uppercase text-slate-500 tracking-[0.3em] ml-4">Constat factuel (Preuves) *</label>
            <textarea required rows={4} value={data.NC_Description} onChange={e => setData({...data, NC_Description: e.target.value})} className="w-full mt-2 bg-black/40 border border-white/10 rounded-3xl p-6 text-sm font-bold italic text-slate-300 outline-none focus:border-red-500 transition-all uppercase resize-none placeholder:text-slate-800" placeholder="DÉCRIVEZ L'ÉCART, LE LIEU, L'HEURE ET L'IMPACT..." />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
               <label className="text-[10px] font-black uppercase text-slate-500 tracking-[0.3em] ml-4">Source</label>
               <select value={data.NC_Source} onChange={e => setData({...data, NC_Source: e.target.value as NCSource})} className="w-full mt-2 bg-black/50 border border-white/10 rounded-2xl p-4 text-xs font-black uppercase italic text-white outline-none focus:border-red-500 cursor-pointer appearance-none">
                 {Object.entries(SOURCE_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
               </select>
            </div>
            <div>
               <label className="text-[10px] font-black uppercase text-slate-500 tracking-[0.3em] ml-4">Gravité Estimée</label>
               <select value={data.NC_Gravite} onChange={e => setData({...data, NC_Gravite: e.target.value as NCGravity})} className="w-full mt-2 bg-black/50 border border-white/10 rounded-2xl p-4 text-xs font-black uppercase italic text-white outline-none focus:border-red-500 cursor-pointer appearance-none">
                 <option value={NCGravityEnum.MINEURE}>MINEURE</option>
                 <option value={NCGravityEnum.MAJEURE}>MAJEURE</option>
                 <option value={NCGravityEnum.CRITIQUE}>CRITIQUE</option>
               </select>
            </div>
            <div>
               <label className="text-[10px] font-black uppercase text-slate-500 tracking-[0.3em] ml-4">Processus Impacté *</label>
               <select required value={data.NC_ProcessusId} onChange={e => setData({...data, NC_ProcessusId: e.target.value})} className="w-full mt-2 bg-black/50 border border-white/10 rounded-2xl p-4 text-xs font-black uppercase italic text-white outline-none focus:border-red-500 cursor-pointer appearance-none">
                 <option value="">AFFECTATION...</option>
                 {processes.filter(p => p.PR_IsActive).map(p => (
                   <option key={p.PR_Id} value={p.PR_Id}>{p.PR_Code} - {p.PR_Libelle}</option>
                 ))}
               </select>
            </div>
            <div>
               <label className="text-[10px] font-black uppercase text-slate-500 tracking-[0.3em] ml-4">Détecteur (Scellé) *</label>
               <select required value={data.NC_DetectorId} onChange={e => setData({...data, NC_DetectorId: e.target.value})} className="w-full mt-2 bg-black/50 border border-white/10 rounded-2xl p-4 text-xs font-black uppercase italic text-slate-400 outline-none cursor-not-allowed appearance-none" disabled>
                 <option value={currentUser?.U_Id}>{currentUser?.U_FirstName} {currentUser?.U_LastName}</option>
               </select>
            </div>
          </div>

          <button type="submit" disabled={submitting} className="w-full py-6 rounded-[2.5rem] bg-red-600 hover:bg-white hover:text-red-600 text-white font-black uppercase italic text-xs tracking-widest shadow-3xl shadow-red-900/40 transition-all border-none cursor-pointer mt-10">
            {submitting ? <Loader2 className="animate-spin inline mr-2" /> : <ShieldAlert className="inline mr-2" />} Inscrire au Registre Qualité
          </button>
        </form>
      </div>
    </div>
  );
}