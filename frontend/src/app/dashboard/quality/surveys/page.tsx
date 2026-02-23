/* eslint-disable @typescript-eslint/no-unused-vars */
//* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 🛰️ MODULE : SURVEY MASTER COCKPIT (ELITE SDE)
 * -------------------------------------------------------------------------
 * RÔLE : Pilotage des enquêtes ISO 9001 (§9.1.2, §8.4.2, §7.1.2).
 * DESIGN : One-Pager, Densité SDE Matrix, Typographie Black Italic.
 * -------------------------------------------------------------------------
 */

'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { 
  Plus, BarChart3, Link as LinkIcon, Mail, FileText, Workflow, 
  PenTool, Globe, Server, AlertOctagon, Lightbulb, Activity, Target,
  Loader2, ChevronRight, X, Save, RefreshCw, Database
} from 'lucide-react';
import { toast, Toaster } from 'sonner';
import apiClient from '@/core/api/api-client';

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
      toast.error("RUPTURE DE FLUX MATRIX");
    } finally { setLoading(false); }
  }, [activeTarget]);

  useEffect(() => { fetchDashboardData(); }, [fetchDashboardData]);

  const copyLink = (id: string) => {
    navigator.clipboard.writeText(`https://qualisoft.sn/public/survey/${id}`);
    toast.success("LIEN SCELLÉ DANS LE PRESSE-PAPIER.");
  };

  return (
    <div className="ml-72 h-screen bg-[#0B0F1A] text-white italic font-sans flex flex-col p-6 overflow-hidden selection:bg-blue-600/30">
      <Toaster position="top-right" richColors theme="dark" />

      {/* 🔝 HEADER TACTIQUE (Shrink-0) */}
      <header className="flex justify-between items-center border-b border-white/10 pb-4 mb-6 shrink-0">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <span className="px-3 py-0.5 rounded-lg bg-blue-600/10 border border-blue-500/20 text-blue-500 text-[8px] font-black uppercase tracking-widest italic shadow-inner">
              ISO 9001 Compliance Matrix
            </span>
          </div>
          <h1 className="text-3xl font-black uppercase tracking-tighter m-0 flex items-center gap-4">
            Survey <span className={config[activeTarget].color}>Cockpit</span>
          </h1>
        </div>

        <div className="flex gap-4">
          <button onClick={() => setIsModalOpen(true)} className="bg-emerald-600 hover:bg-white hover:text-emerald-600 px-6 py-2 rounded-xl text-[10px] font-black uppercase flex items-center gap-3 border-none cursor-pointer transition-all shadow-lg italic">
            <Plus size={16} strokeWidth={3} /> Initialiser Campagne
          </button>
          <button onClick={fetchDashboardData} className="p-2 bg-white/5 rounded-xl hover:text-blue-500 border border-white/10 transition-colors cursor-pointer">
            <RefreshCw size={18} />
          </button>
        </div>
      </header>

      {/* 🧭 NAVIGATION DES PILIERS (Shrink-0) */}
      <div className="grid grid-cols-3 gap-4 mb-6 shrink-0">
        {(['CLIENT', 'SUPPLIER', 'EMPLOYEE'] as TargetType[]).map((t) => (
          <button 
            key={t} onClick={() => setActiveTarget(t)}
            className={`p-4 rounded-3xl border transition-all text-left relative overflow-hidden group cursor-pointer ${
              activeTarget === t ? `bg-[#151A2D] ${config[t].border} shadow-2xl` : 'bg-black/20 border-white/5 opacity-50'
            }`}
          >
            <div className="flex justify-between items-center mb-1">
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 italic">{config[t].iso}</span>
              <Target size={14} className={activeTarget === t ? config[t].color : 'text-slate-700'} />
            </div>
            <p className={`text-xl font-black uppercase italic m-0 ${activeTarget === t ? config[t].color : 'text-white'}`}>
              {config[t].label}
            </p>
          </button>
        ))}
      </div>

      {/* 🧩 CORPS DU COCKPIT (Flex-1) */}
      <div className="flex-1 min-h-0 grid grid-cols-12 gap-6 overflow-hidden">
        
        {/* COL 1: REGISTRE DES CAMPAGNES (70%) */}
        <div className="col-span-8 bg-[#151A2D] border border-white/5 rounded-[2.5rem] flex flex-col overflow-hidden shadow-2xl">
          <div className="p-5 border-b border-white/5 flex justify-between items-center shrink-0">
            <h3 className="text-sm font-black uppercase italic flex items-center gap-3 m-0 tracking-tighter">
              <BarChart3 className={config[activeTarget].color} size={20} /> Registre des Campagnes SDE
            </h3>
            <span className="text-[10px] font-black text-slate-500">{campaigns.length} Entrées</span>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-4">
            {loading ? (
              <div className="h-full flex flex-col items-center justify-center opacity-30"><Loader2 className="animate-spin mb-4" size={40} /><p className="text-[10px] uppercase font-black">Sync Matrix...</p></div>
            ) : campaigns.length > 0 ? (
              campaigns.map(camp => (
                <CampaignRow key={camp.CMP_Id} camp={camp} color={config[activeTarget].color} onCopy={() => copyLink(camp.CMP_Id)} />
              ))
            ) : (
              <div className="h-full flex items-center justify-center border-2 border-dashed border-white/5 rounded-3xl opacity-20 italic uppercase text-[10px] font-black tracking-widest text-slate-500">Architecture Vierge</div>
            )}
          </div>
        </div>

        {/* COL 2: ANALYTICS & WORKFLOW (30%) */}
        <div className="col-span-4 flex flex-col gap-6 overflow-hidden">
          
          {/* INDICE CSAT MINIATURISÉ */}
          <div className="bg-[#151A2D] border border-white/5 rounded-[2.5rem] p-6 relative overflow-hidden shadow-2xl shrink-0">
            <div className={`absolute -right-10 -top-10 w-40 h-40 rounded-full blur-3xl opacity-10 ${config[activeTarget].color.replace('text', 'bg')}`}></div>
            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4 m-0">Indice Consolidé SDE</h3>
            <div className="flex items-baseline gap-2">
              <p className={`text-6xl font-black italic ${config[activeTarget].color} leading-none tracking-tighter m-0`}>{stats.csat.toFixed(1)}</p>
              <span className="text-xl font-black text-slate-700">/10</span>
            </div>
            <div className="mt-6 p-4 bg-black/40 rounded-2xl border border-white/5 flex justify-center text-blue-400 font-mono text-sm shadow-inner">
              {`$$CSAT = \\frac{\\sum (N \\times P)}{N}$$`}
            </div>
          </div>

          {/* WORKFLOW ISO COMPACT */}
          <div className="flex-1 bg-[#151A2D] border border-white/5 rounded-[2.5rem] p-6 flex flex-col overflow-hidden shadow-2xl">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-6 m-0 flex items-center gap-2">
              <Workflow size={14} /> Chaine de Valeur §9
            </h3>
            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3">
              <WorkflowMiniStep step="01" title="Conception" icon={<PenTool size={16} />} color="text-blue-500" />
              <WorkflowMiniStep step="02" title="Diffusion" icon={<Globe size={16} />} color="text-emerald-500" />
              <WorkflowMiniStep step="03" title="Agrégation" icon={<Server size={16} />} color="text-purple-500" />
              <WorkflowMiniStep step="04" title="Traitement" icon={<AlertOctagon size={16} />} color="text-rose-500" />
            </div>
            <div className="mt-6 p-4 bg-amber-500/5 border border-amber-500/20 rounded-2xl">
              <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed m-0 italic">
                <span className="text-amber-500">PROTOCOL :</span> Les scores &lt; 5/10 déclenchent une ouverture automatique de Fiche NC.
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* 📟 MODALE INITIALISATION (Amélioration du formulaire) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <form className="bg-[#0B0F1A] border border-white/10 rounded-[3rem] w-full max-w-lg p-10 space-y-6 shadow-4xl animate-in zoom-in-95 duration-300 relative overflow-hidden">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-black uppercase italic m-0">Initialiser <span className="text-emerald-500">Campagne</span></h2>
              <X onClick={() => setIsModalOpen(false)} className="cursor-pointer text-slate-500 hover:text-rose-500" />
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase ml-2 tracking-widest">Titre de la Campagne *</label>
                <input required className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-xs font-black uppercase italic text-white outline-none focus:border-emerald-500 transition-all" placeholder="EX: ENQUÊTE SATISFACTION Q1-2026" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase ml-2 tracking-widest">Cible ISO</label>
                <select className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-xs font-black uppercase italic text-white outline-none">
                   <option value="CLIENT">PILIERS CLIENTS (§9.1.2)</option>
                   <option value="SUPPLIER">ÉVALUATION FOURNISSEURS (§8.4.2)</option>
                   <option value="EMPLOYEE">CLIMAT SOCIAL (§7.1.2)</option>
                </select>
              </div>
            </div>

            <button type="submit" className="w-full bg-emerald-600 py-5 rounded-2xl font-black uppercase text-xs tracking-[0.3em] flex items-center justify-center gap-3 hover:bg-white hover:text-emerald-600 transition-all border-none text-white cursor-pointer group italic">
              <Save size={18} /> Sceller dans le registre
            </button>
          </form>
        </div>
      )}

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #2563eb; }
      `}</style>
    </div>
  );
}

// --- 🛠️ COMPOSANTS ATOMIQUES ---

function CampaignRow({ camp, color, onCopy }: any) {
  return (
    <div className="bg-black/40 border border-white/5 p-4 rounded-2xl flex justify-between items-center group hover:bg-white/5 transition-all">
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-[#0B0F1A] border border-white/5 ${color} shadow-inner`}>
          <FileText size={20} />
        </div>
        <div>
          <p className="font-black text-sm uppercase italic text-white m-0 group-hover:text-blue-500 transition-colors">{camp.CMP_Title}</p>
          <div className="flex items-center gap-3 mt-1">
             <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">{camp.CMP_Responses} Retours</span>
             <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded border ${camp.CMP_Status === 'OUVERTE' ? 'bg-blue-600/10 text-blue-400 border-blue-600/20' : 'bg-slate-800 text-slate-500'}`}>{camp.CMP_Status}</span>
          </div>
        </div>
      </div>
      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={onCopy} className="p-2 bg-white/5 rounded-lg border border-white/10 text-slate-500 hover:text-blue-500 cursor-pointer transition-all shadow-lg"><LinkIcon size={16} /></button>
        <button className="p-2 bg-white/5 rounded-lg border border-white/10 text-slate-500 hover:text-purple-500 cursor-pointer transition-all shadow-lg"><Mail size={16} /></button>
        <button className="bg-blue-600 text-white px-4 py-1.5 rounded-lg font-black text-[8px] uppercase border-none cursor-pointer hover:bg-white hover:text-blue-600 transition-all shadow-lg">Scanner</button>
      </div>
    </div>
  );
}

function WorkflowMiniStep({ step, title, icon, color }: any) {
  return (
    <div className="p-3 bg-black/40 border border-white/5 rounded-xl flex items-center justify-between group">
      <div className="flex items-center gap-3">
        <span className={`text-xl font-black italic ${color} opacity-20`}>{step}</span>
        <p className="text-[10px] font-black uppercase italic text-white m-0">{title}</p>
      </div>
      <div className="p-2 bg-white/5 text-slate-500 group-hover:bg-white group-hover:text-black rounded-lg transition-all">{icon}</div>
    </div>
  );
}