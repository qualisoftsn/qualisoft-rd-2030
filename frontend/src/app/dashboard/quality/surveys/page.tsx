/* eslint-disable @typescript-eslint/no-unused-vars */
//* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 🛰️ MODULE : SURVEY MASTER COCKPIT (ELITE SDE)
 * -------------------------------------------------------------------------
 * RÔLE : Pilotage des enquêtes ISO 9001 (§9.1.2, §8.4.2, §7.1.2).
 * DESIGN : One-Pager, Densité SDE Matrix, Responsive, Typographie Black Italic.
 * ARCHITECTURE : Zéro NextAuth (100% apiClient JWT).
 * DATE : 02 Mars 2026 | 13:31 GMT
 * -------------------------------------------------------------------------
 */

'use client';

import { useState, useCallback, useEffect } from 'react';
import { 
  Plus, BarChart3, Link as LinkIcon, Mail, FileText, Workflow, 
  PenTool, Globe, Server, AlertOctagon, Target,
  Loader2, X, Save, RefreshCw
} from 'lucide-react';
import { toast, Toaster } from 'sonner';
import apiClient from '@/core/api/api-client';
import { useRouter } from 'next/navigation';

// --- 🏗️ TYPES STRICTS ---
type TargetType = 'CLIENT' | 'SUPPLIER' | 'EMPLOYEE';

interface Campaign {
  CMP_Id: string;
  CMP_Title: string;
  CMP_Target: TargetType;
  CMP_Responses: number;
  CMP_Status: 'OUVERTE' | 'CLOTUREE' | 'BROUILLON';
}

export default function SurveyMasterCockpit() {
  const router = useRouter();
  const [activeTarget, setActiveTarget] = useState<TargetType>('CLIENT');
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [stats, setStats] = useState({ csat: 0, totalResponses: 0 });
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const config = {
    CLIENT: { color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', label: 'Clients', iso: '§9.1.2' },
    SUPPLIER: { color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/20', label: 'Fournisseurs', iso: '§8.4.2' },
    EMPLOYEE: { color: 'text-purple-500', bg: 'bg-purple-500/10', border: 'border-purple-500/20', label: 'RH / Social', iso: '§7.1.2' }
  };

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const [campRes, statsRes] = await Promise.all([
        apiClient.get(`/surveys/campaigns?target=${activeTarget}`),
        apiClient.get(`/surveys/stats?target=${activeTarget}`).catch(() => ({ data: { csat: 0, totalResponses: 0 } }))
      ]);
      setCampaigns(campRes.data?.data || campRes.data || []);
      setStats({
        csat: statsRes.data?.data?.csat || 0,
        totalResponses: statsRes.data?.data?.totalResponses || 0
      });
    } catch (error) {
      toast.error("RUPTURE DE FLUX MATRIX : Impossible de charger les enquêtes.");
    } finally { setLoading(false); }
  }, [activeTarget]);

  useEffect(() => { fetchDashboardData(); }, [fetchDashboardData]);

  const copyLink = (id: string) => {
    navigator.clipboard.writeText(`https://qualisoft.sn/public/survey/${id}`);
    toast.success("LIEN SCELLÉ DANS LE PRESSE-PAPIER.");
  };

  return (
    <div className="ml-0 lg:ml-72 min-h-screen lg:h-screen bg-[#0B0F1A] text-white italic font-sans flex flex-col p-4 lg:p-6 overflow-hidden selection:bg-blue-600/30">
      <Toaster position="top-right" richColors theme="dark" />

      {/* 🔝 HEADER TACTIQUE */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center border-b-2 border-white/10 pb-6 mb-6 shrink-0 gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="px-4 py-1 rounded-xl bg-blue-600/10 border border-blue-500/20 text-blue-500 text-[9px] lg:text-[10px] font-black uppercase tracking-widest italic shadow-inner">
              ISO 9001 Compliance Matrix
            </span>
          </div>
          <h1 className="text-4xl lg:text-5xl font-black uppercase tracking-tighter m-0 flex items-center gap-4">
            Survey <span className={config[activeTarget].color}>Cockpit</span>
          </h1>
        </div>

        <div className="flex gap-4 w-full md:w-auto">
          <button onClick={() => setIsModalOpen(true)} className="flex-1 md:flex-none bg-emerald-600 hover:bg-emerald-500 px-6 py-4 lg:py-3 rounded-2xl text-[10px] lg:text-[11px] font-black uppercase flex items-center justify-center gap-3 border-none cursor-pointer transition-all shadow-[0_10px_20px_rgba(16,185,129,0.3)] italic text-white active:scale-95">
            <Plus size={18} strokeWidth={3} /> Initialiser Campagne
          </button>
          <button onClick={fetchDashboardData} className="p-4 lg:p-3 bg-white/5 rounded-2xl hover:bg-white/10 hover:text-blue-500 border border-white/10 transition-colors cursor-pointer shadow-sm">
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </header>

      {/* 🧭 NAVIGATION DES PILIERS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 shrink-0">
        {(['CLIENT', 'SUPPLIER', 'EMPLOYEE'] as TargetType[]).map((t) => (
          <button 
            key={t} onClick={() => setActiveTarget(t)}
            className={`p-5 rounded-4xl border-2 transition-all text-left relative overflow-hidden group cursor-pointer ${
              activeTarget === t ? `bg-[#151A2D] ${config[t].border} shadow-2xl` : 'bg-slate-900/40 border-white/5 opacity-60 hover:opacity-100'
            }`}
          >
            <div className="flex justify-between items-center mb-2 relative z-10">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic m-0">{config[t].iso}</span>
              <Target size={18} className={activeTarget === t ? config[t].color : 'text-slate-600'} />
            </div>
            <p className={`text-2xl font-black uppercase italic m-0 tracking-tighter relative z-10 ${activeTarget === t ? config[t].color : 'text-white'}`}>
              {config[t].label}
            </p>
            {activeTarget === t && <div className={`absolute -right-4 -bottom-4 w-24 h-24 blur-2xl opacity-20 ${config[t].color.replace('text', 'bg')}`}></div>}
          </button>
        ))}
      </div>

      {/* 🧩 CORPS DU COCKPIT */}
      <div className="flex-1 min-h-0 flex flex-col xl:grid xl:grid-cols-12 gap-6 overflow-hidden">
        
        {/* COL 1: REGISTRE DES CAMPAGNES (70%) */}
        <div className="xl:col-span-8 bg-[#151A2D] border-2 border-white/5 rounded-[2.5rem] lg:rounded-[3rem] flex flex-col overflow-hidden shadow-2xl flex-1">
          <div className="p-6 lg:p-8 border-b-2 border-white/5 flex justify-between items-center shrink-0 bg-slate-900/30">
            <h3 className="text-base lg:text-lg font-black uppercase italic flex items-center gap-3 m-0 tracking-tighter">
              <BarChart3 className={config[activeTarget].color} size={24} /> Registre des Campagnes SDE
            </h3>
            <span className="text-[10px] lg:text-[11px] font-black text-slate-500 uppercase tracking-widest bg-black/40 px-3 py-1.5 rounded-lg border border-white/5">{campaigns.length} Entrées</span>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-6 lg:p-8 space-y-4">
            {loading ? (
              <div className="h-full flex flex-col items-center justify-center opacity-40">
                 <Loader2 className="animate-spin mb-4 text-blue-500" size={48} strokeWidth={2} />
                 <p className="text-[10px] lg:text-[12px] uppercase font-black tracking-widest italic m-0">Synchronisation Matrix...</p>
              </div>
            ) : campaigns.length > 0 ? (
              campaigns.map(camp => (
                <CampaignRow key={camp.CMP_Id} camp={camp} color={config[activeTarget].color} onCopy={() => copyLink(camp.CMP_Id)} />
              ))
            ) : (
              <div className="h-full flex flex-col items-center justify-center border-4 border-dashed border-white/5 rounded-4xl opacity-30 italic">
                 <FileText size={60} className="mb-6 text-slate-500" />
                 <span className="uppercase text-[11px] font-black tracking-[0.4em] text-slate-400">Architecture Vierge</span>
              </div>
            )}
          </div>
        </div>

        {/* COL 2: ANALYTICS & WORKFLOW (30%) */}
        <div className="xl:col-span-4 flex flex-col gap-6 overflow-y-auto xl:overflow-hidden pb-6 xl:pb-0">
          
          {/* INDICE CSAT MINIATURISÉ */}
          <div className="bg-[#151A2D] border-2 border-white/5 rounded-[2.5rem] lg:rounded-[3rem] p-8 lg:p-10 relative overflow-hidden shadow-2xl shrink-0">
            <div className={`absolute -right-10 -top-10 w-48 h-48 rounded-full blur-3xl opacity-10 ${config[activeTarget].color.replace('text', 'bg')}`}></div>
            <h3 className="text-[10px] lg:text-[11px] font-black uppercase tracking-[0.3em] text-slate-500 mb-6 m-0 relative z-10">Indice Consolidé SDE</h3>
            <div className="flex items-baseline gap-2 relative z-10">
              <p className={`text-7xl lg:text-8xl font-black italic ${config[activeTarget].color} leading-none tracking-tighter m-0 drop-shadow-lg`}>{stats.csat.toFixed(1)}</p>
              <span className="text-2xl font-black text-slate-600">/10</span>
            </div>
            <div className="mt-8 p-4 bg-black/40 rounded-2xl border border-white/5 flex justify-center text-blue-400 font-mono text-xs shadow-inner relative z-10">
              {`$$CSAT = \\frac{\\sum (N \\times P)}{N}$$`}
            </div>
            <div className="mt-6 opacity-60 mix-blend-screen relative z-10 text-center text-[10px] font-black uppercase text-slate-400 tracking-widest italic">
               
            </div>
          </div>

          {/* WORKFLOW ISO COMPACT */}
          <div className="flex-1 bg-[#151A2D] border-2 border-white/5 rounded-[2.5rem] lg:rounded-[3rem] p-8 lg:p-10 flex flex-col overflow-hidden shadow-2xl">
            <h3 className="text-[10px] lg:text-[11px] font-black uppercase tracking-[0.3em] text-slate-500 mb-8 m-0 flex items-center gap-3">
              <Workflow size={16} /> Chaine de Valeur §9
            </h3>
            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4">
              <WorkflowMiniStep step="01" title="Conception" icon={<PenTool size={18} />} color="text-blue-500" />
              <WorkflowMiniStep step="02" title="Diffusion" icon={<Globe size={18} />} color="text-emerald-500" />
              <WorkflowMiniStep step="03" title="Agrégation" icon={<Server size={18} />} color="text-purple-500" />
              <WorkflowMiniStep step="04" title="Traitement" icon={<AlertOctagon size={18} />} color="text-rose-500" />
            </div>
            <div className="mt-8 p-5 bg-amber-500/10 border-2 border-amber-500/20 rounded-2xl shadow-inner">
              <p className="text-[9px] lg:text-[10px] text-slate-300 font-bold uppercase tracking-widest leading-relaxed m-0 italic">
                <span className="text-amber-500 font-black">PROTOCOL :</span> Les scores &lt; 5/10 déclenchent une ouverture automatique de Fiche NC.
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* 📟 MODALE INITIALISATION */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4">
          <form 
            onSubmit={(e) => { e.preventDefault(); router.push('/dashboard/quality/surveys/builder'); }} 
            className="bg-[#0B0F1A] border-t-2 sm:border-2 border-white/10 rounded-t-[3rem] sm:rounded-[3rem] w-full max-w-lg p-8 sm:p-12 space-y-8 shadow-4xl animate-in slide-in-from-bottom-10 sm:zoom-in-95 duration-300 relative overflow-hidden"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-black uppercase italic m-0 leading-none">Init. <span className="text-emerald-500">Campagne</span></h2>
              <button type="button" onClick={() => setIsModalOpen(false)} className="p-3 bg-white/5 rounded-2xl cursor-pointer text-slate-500 hover:text-white hover:bg-white/10 border-none transition-colors">
                 <X size={20} />
              </button>
            </div>
            
            <div className="space-y-6">
              <div className="space-y-3">
                <label className="text-[10px] lg:text-[11px] font-black text-slate-500 uppercase ml-2 tracking-[0.3em] italic m-0">Cible ISO</label>
                <div className="relative">
                  <select 
                    value={activeTarget}
                    onChange={(e) => setActiveTarget(e.target.value as TargetType)}
                    className="w-full bg-slate-900 border-2 border-white/10 rounded-2xl p-5 text-sm font-black uppercase italic text-white outline-none focus:border-emerald-500 transition-all appearance-none cursor-pointer shadow-inner"
                  >
                     <option value="CLIENT">PILIERS CLIENTS (§9.1.2)</option>
                     <option value="SUPPLIER">ÉVALUATION FOURNISSEURS (§8.4.2)</option>
                     <option value="EMPLOYEE">CLIMAT SOCIAL (§7.1.2)</option>
                  </select>
                  <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">▼</div>
                </div>
              </div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest italic m-0 pl-2">
                Vous serez redirigé vers le Survey Builder pour modéliser les dimensions d&apos;évaluation.
              </p>
            </div>

            <button type="submit" className="w-full bg-emerald-600 py-6 rounded-2xl font-black uppercase text-[11px] tracking-[0.4em] flex items-center justify-center gap-3 hover:bg-emerald-500 transition-all border-none text-white cursor-pointer group italic shadow-[0_15px_30px_rgba(16,185,129,0.3)] active:scale-95">
              <PenTool size={18} /> Ouvrir le Builder
            </button>
          </form>
        </div>
      )}

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #3b82f6; }
      `}</style>
    </div>
  );
}

// --- 🛠️ COMPOSANTS ATOMIQUES ---

function CampaignRow({ camp, color, onCopy }: any) {
  return (
    <div className="bg-slate-900/40 border-2 border-white/5 p-5 rounded-4xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 group hover:bg-white/5 hover:border-white/10 transition-all shadow-sm">
      <div className="flex items-center gap-5 w-full sm:w-auto">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center bg-[#0B0F1A] border-2 border-white/5 ${color} shadow-inner shrink-0`}>
          <FileText size={24} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-black text-base lg:text-lg uppercase italic text-white m-0 group-hover:text-blue-400 transition-colors truncate">{camp.CMP_Title}</p>
          <div className="flex flex-wrap items-center gap-3 mt-2">
             <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-500/10 px-2 py-1 rounded-md">{camp.CMP_Responses} Retours</span>
             <span className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-md border tracking-widest ${camp.CMP_Status === 'OUVERTE' ? 'bg-blue-600/10 text-blue-400 border-blue-600/20' : 'bg-slate-800 text-slate-500 border-white/5'}`}>{camp.CMP_Status}</span>
          </div>
        </div>
      </div>
      <div className="flex gap-3 w-full sm:w-auto justify-end">
        <button onClick={onCopy} className="p-3 bg-white/5 rounded-xl border border-white/10 text-slate-400 hover:text-blue-500 hover:bg-blue-500/10 cursor-pointer transition-all shadow-sm" title="Copier le lien"><LinkIcon size={18} /></button>
        <button className="p-3 bg-white/5 rounded-xl border border-white/10 text-slate-400 hover:text-purple-500 hover:bg-purple-500/10 cursor-pointer transition-all shadow-sm" title="Diffuser"><Mail size={18} /></button>
        <button className="bg-blue-600 text-white px-6 py-2 rounded-xl font-black text-[9px] lg:text-[10px] uppercase border-none cursor-pointer hover:bg-blue-500 transition-all shadow-lg tracking-widest italic">Scanner</button>
      </div>
    </div>
  );
}

function WorkflowMiniStep({ step, title, icon, color }: any) {
  return (
    <div className="p-4 bg-slate-900/60 border border-white/5 rounded-2xl flex items-center justify-between group hover:bg-white/5 transition-colors">
      <div className="flex items-center gap-4">
        <span className={`text-2xl font-black italic ${color} opacity-30 group-hover:opacity-100 transition-opacity`}>{step}</span>
        <p className="text-[11px] font-black uppercase italic text-white m-0 tracking-widest">{title}</p>
      </div>
      <div className="p-2.5 bg-white/5 text-slate-400 group-hover:bg-white group-hover:text-black rounded-xl transition-all shadow-inner">{icon}</div>
    </div>
  );
}