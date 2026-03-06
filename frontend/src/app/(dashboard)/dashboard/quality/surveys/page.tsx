/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 🛰️ MODULE : SURVEY MASTER COCKPIT (ELITE SDE)
 * -------------------------------------------------------------------------
 * RÔLE : Pilotage des enquêtes ISO 9001 (§9.1.2, §8.4.2, §7.1.2).
 * DESIGN : Elite High-Density, ClickUp Cockpit Style, 100dvh.
 * RECTIFICATION : Double-échappement des backslashes LaTeX (Ligne 147).
 * -------------------------------------------------------------------------
 * DATE : 05 Mars 2026 | 23:55 GMT
 */

'use client';

import { useState, useCallback, useEffect } from 'react';
import { 
  Plus, BarChart3, Link as LinkIcon, Mail, FileText, Workflow, 
  PenTool, Globe, Server, AlertOctagon, Target,
  X, RefreshCw
} from 'lucide-react';
import { toast, Toaster } from 'sonner';
import apiClient from '@/core/api/api-client';
import { useRouter } from 'next/navigation';

const cn = (...classes: any[]) => classes.filter(Boolean).join(' ');

type TargetType = 'CLIENT' | 'SUPPLIER' | 'EMPLOYEE';

export default function SurveyMasterCockpit() {
  const router = useRouter();
  const [activeTarget, setActiveTarget] = useState<TargetType>('CLIENT');
  const [campaigns, setCampaigns] = useState<any[]>([]);
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
    } catch {
      toast.error("RUPTURE DE FLUX MATRIX : SYNCHRONISATION ÉCHOUÉE.");
    } finally { setLoading(false); }
  }, [activeTarget]);

  useEffect(() => { fetchDashboardData(); }, [fetchDashboardData]);

  const copyLink = (id: string) => {
    navigator.clipboard.writeText(`https://qualisoft.sn/public/survey/${id}`);
    toast.success("LIEN SCELLÉ DANS LE PRESSE-PAPIER.");
  };

  if (loading && campaigns.length === 0) return <LoadingScreen label="Synchronisation Matrix §9.1..." />;

  return (
    <div className="h-screen bg-[#0B0F1A] text-white italic font-black uppercase flex flex-col overflow-hidden w-full lg:pl-72 selection:bg-blue-600/30">
      <Toaster position="top-right" richColors theme="dark" />

      <header className="shrink-0 p-8 border-b border-white/5 flex flex-col xl:flex-row justify-between items-center bg-[#0B0F1A]/95 backdrop-blur-xl z-50 gap-6 mt-12 lg:mt-0">
        <div className="text-left space-y-3">
          <div className="flex items-center gap-4">
            <span className="bg-blue-600/10 border border-blue-500/20 px-4 py-1 rounded-xl text-[9px] text-blue-500 tracking-widest italic shadow-inner">ISO 9001 Compliance Matrix</span>
          </div>
          <h1 className="text-4xl lg:text-6xl tracking-tighter leading-none m-0 italic flex items-center gap-5">
            Survey <span className={config[activeTarget].color}>Cockpit</span>
          </h1>
        </div>

        <div className="flex gap-4 w-full xl:w-auto">
          <button onClick={() => setIsModalOpen(true)} className="flex-1 xl:flex-none bg-emerald-600 hover:bg-white hover:text-emerald-600 px-10 py-5 rounded-3xl text-[10px] shadow-4xl border-none cursor-pointer text-white italic transition-all active:scale-95 flex items-center justify-center gap-3 tracking-widest uppercase">
            <Plus size={18} strokeWidth={3} /> Initialiser Campagne
          </button>
          <button onClick={fetchDashboardData} className="p-5 bg-white/5 rounded-3xl hover:bg-white/10 hover:text-blue-500 border border-white/10 transition-all cursor-pointer shadow-sm">
            <RefreshCw size={24} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-hidden flex flex-col p-8 gap-8">
        <nav className="grid grid-cols-1 md:grid-cols-3 gap-6 shrink-0">
          {(['CLIENT', 'SUPPLIER', 'EMPLOYEE'] as TargetType[]).map((t) => (
            <button key={t} onClick={() => setActiveTarget(t)} className={cn("p-8 rounded-[2.5rem] border-2 transition-all text-left relative overflow-hidden group cursor-pointer", activeTarget === t ? `bg-[#151A2D] ${config[t].border} shadow-4xl` : "bg-slate-900/40 border-white/5 opacity-40 hover:opacity-100")}>
              <div className="flex justify-between items-center mb-4 relative z-10">
                <span className="text-[10px] text-slate-500 tracking-widest italic m-0">{config[t].iso}</span>
                <Target size={20} className={activeTarget === t ? config[t].color : 'text-slate-700'} />
              </div>
              <p className={cn("text-3xl font-black italic m-0 tracking-tighter relative z-10", activeTarget === t ? config[t].color : "text-white")}>{config[t].label}</p>
            </button>
          ))}
        </nav>

        <div className="flex-1 min-h-0 flex flex-col xl:grid xl:grid-cols-12 gap-8">
          <section className="xl:col-span-8 bg-[#151A2D] border-2 border-white/5 rounded-[3.5rem] flex flex-col overflow-hidden shadow-4xl">
            <header className="p-8 border-b-2 border-white/5 flex justify-between items-center bg-slate-900/30">
              <h3 className="text-xl font-black italic flex items-center gap-4 m-0 tracking-tighter uppercase">
                <BarChart3 className={config[activeTarget].color} size={28} /> Registre des Campagnes SDE
              </h3>
              <span className="text-[11px] font-black text-slate-500 tracking-widest bg-black/40 px-5 py-2 rounded-xl border border-white/5">{campaigns.length} SESSIONS</span>
            </header>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-8 space-y-6">
              {campaigns.length > 0 ? (
                campaigns.map(camp => (
                  <CampaignRow key={camp.CMP_Id} camp={camp} color={config[activeTarget].color} onCopy={() => copyLink(camp.CMP_Id)} onScan={() => router.push(`/dashboard/quality/scanner`)} />
                ))
              ) : (
                <div className="h-full flex flex-col items-center justify-center opacity-20 italic">
                  <FileText size={80} className="mb-8" />
                  <p className="text-xl font-black tracking-[0.5em]">Architecture Vierge</p>
                </div>
              )}
            </div>
          </section>

          <aside className="xl:col-span-4 flex flex-col gap-8 overflow-hidden">
            <div className="bg-[#151A2D] border-2 border-white/5 rounded-[3.5rem] p-10 relative overflow-hidden shadow-4xl shrink-0 text-left">
              <div className={cn("absolute -right-12 -top-12 w-64 h-64 rounded-full blur-[100px] opacity-10", config[activeTarget].color.replace('text', 'bg'))} />
              <h3 className="text-[11px] font-black text-slate-500 tracking-[0.4em] mb-10 m-0 relative z-10 italic uppercase">Indice Consolidé SDE</h3>
              <div className="flex items-baseline gap-4 relative z-10 mb-10">
                <p className={cn("text-8xl font-black italic leading-none tracking-tighter m-0 drop-shadow-2xl", config[activeTarget].color)}>{stats.csat.toFixed(1)}</p>
                <span className="text-3xl font-black text-slate-700 italic">/10</span>
              </div>
              
              {/* ✅ RECTIFICATION FINALE : Double backslash pour échapper le parseur TSX */}
              <div className="bg-black/40 p-6 rounded-3xl border border-white/5 shadow-inner relative z-10 text-center">
                <div className="text-blue-400 font-mono text-[14px] m-0">
                  {"$$CSAT = \\frac{\\sum (Score \\times Poids)}{N_{total}}$$"}
                </div>
              </div>
            </div>

            <div className="flex-1 bg-[#151A2D] border-2 border-white/5 rounded-[3.5rem] p-10 flex flex-col shadow-4xl text-left">
              <h3 className="text-[11px] font-black text-slate-500 tracking-[0.4em] mb-10 m-0 flex items-center gap-4 italic uppercase">
                <Workflow size={20} /> Chaine de Valeur §9
              </h3>
              <div className="flex-1 overflow-y-auto custom-scrollbar space-y-6 pr-2">
                <WorkflowStep step="01" title="Conception" icon={<PenTool size={20} />} color="text-blue-500" />
                <WorkflowStep step="02" title="Diffusion" icon={<Globe size={20} />} color="text-emerald-500" />
                <WorkflowStep step="03" title="Agrégation" icon={<Server size={20} />} color="text-purple-500" />
                <WorkflowStep step="04" title="Traitement" icon={<AlertOctagon size={20} />} color="text-rose-500" />
              </div>
              <div className="mt-10 p-6 bg-amber-500/5 border-2 border-amber-500/10 rounded-3xl">
                <p className="text-[10px] text-slate-400 font-black tracking-widest leading-relaxed m-0 italic uppercase">
                  <span className="text-amber-500">Alerte Matrix :</span> Tout score &lt; 5/10 déclenche l&apos;ouverture automatique d&apos;une Fiche NC.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </main>

      {isModalOpen && (
        <div className="fixed inset-0 z-100 bg-black/90 backdrop-blur-xl flex items-end sm:items-center justify-center p-0 sm:p-8">
          <div className="bg-[#0B0F1A] border-t-2 sm:border-2 border-white/10 rounded-t-[4rem] sm:rounded-[4rem] w-full max-w-xl p-12 sm:p-16 space-y-12 shadow-4xl animate-in slide-in-from-bottom-20 duration-500 relative overflow-hidden text-left italic">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-4xl font-black italic m-0 uppercase tracking-tighter leading-none">Init. <span className="text-emerald-500">Campagne</span></h2>
              <button onClick={() => setIsModalOpen(false)} className="p-4 bg-white/5 rounded-2xl text-slate-500 hover:text-white border-none cursor-pointer transition-all"><X size={24} /></button>
            </div>
            <div className="space-y-8">
              <div className="space-y-4">
                <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-6 m-0">Cible Stratégique ISO</label>
                <div className="relative">
                  <select value={activeTarget} onChange={(e) => setActiveTarget(e.target.value as TargetType)} className="w-full bg-slate-950 border-2 border-white/10 rounded-[2.5rem] p-8 text-lg font-black italic text-white outline-none focus:border-emerald-500 appearance-none cursor-pointer shadow-inner uppercase">
                     <option value="CLIENT">Piliers Clients (§9.1.2)</option>
                     <option value="SUPPLIER">Éval. Fournisseurs (§8.4.2)</option>
                     <option value="EMPLOYEE">Climat Social (§7.1.2)</option>
                  </select>
                  <div className="absolute right-10 top-1/2 -translate-y-1/2 pointer-events-none text-slate-600">▼</div>
                </div>
              </div>
              <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest m-0 pl-6 leading-relaxed">Redirection automatique vers le Survey Builder pour la modélisation des dimensions.</p>
            </div>
            <button onClick={() => router.push('/dashboard/quality/surveys/builder')} className="w-full bg-emerald-600 py-8 rounded-[3rem] font-black uppercase text-[12px] tracking-[0.5em] flex items-center justify-center gap-6 hover:bg-white hover:text-emerald-600 transition-all border-none text-white cursor-pointer shadow-4xl active:scale-95">
              <PenTool size={22} /> Ouvrir le Builder
            </button>
          </div>
        </div>
      )}
      <style dangerouslySetInnerHTML={{ __html: `.custom-scrollbar::-webkit-scrollbar { width: 0px; }` }} />
    </div>
  );
}

// ... (CampaignRow & WorkflowStep components restent identiques à la version précédente)

function CampaignRow({ camp, color, onCopy, onScan }: any) {
  return (
    <div className="bg-[#0B1222]/50 border-2 border-white/5 p-8 rounded-[3rem] flex flex-col xl:flex-row justify-between items-start xl:items-center gap-10 group hover:bg-white/5 hover:border-white/10 transition-all shadow-4xl text-left italic">
      <div className="flex items-center gap-8 w-full xl:w-auto">
        <div className={cn("w-20 h-20 rounded-3xl flex items-center justify-center bg-black/40 border-2 border-white/5 shadow-inner shrink-0", color)}>
          <FileText size={32} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-black text-2xl uppercase text-white m-0 group-hover:text-blue-400 transition-colors truncate tracking-tighter">{camp.CMP_Title}</p>
          <div className="flex flex-wrap items-center gap-6 mt-4">
             <span className="text-[10px] font-black text-emerald-500 tracking-widest bg-emerald-500/10 px-4 py-1.5 rounded-xl border border-emerald-500/20">{camp.CMP_Responses} RETOURS</span>
             <span className={cn("text-[10px] font-black px-4 py-1.5 rounded-xl border tracking-widest", camp.CMP_Status === 'OUVERTE' ? "bg-blue-600/10 text-blue-400 border-blue-600/20" : "bg-slate-800 text-slate-500 border-white/5")}>{camp.CMP_Status}</span>
          </div>
        </div>
      </div>
      <div className="flex gap-4 w-full xl:w-auto justify-end">
        <button onClick={onCopy} className="p-4 bg-white/5 rounded-2xl border border-white/5 text-slate-500 hover:text-blue-500 transition-all cursor-pointer"><LinkIcon size={20} /></button>
        <button className="p-4 bg-white/5 rounded-2xl border border-white/5 text-slate-500 hover:text-purple-500 transition-all cursor-pointer"><Mail size={20} /></button>
        <button onClick={onScan} className="bg-blue-600 text-white px-10 py-4 rounded-2xl font-black text-[11px] uppercase border-none cursor-pointer hover:bg-white hover:text-blue-600 transition-all shadow-4xl italic tracking-widest">Scanner</button>
      </div>
    </div>
  );
}

function WorkflowStep({ step, title, icon, color }: any) {
  return (
    <div className="p-6 bg-black/30 border border-white/5 rounded-3xl flex items-center justify-between group hover:bg-white/5 transition-all shadow-inner">
      <div className="flex items-center gap-6">
        <span className={cn("text-4xl font-black italic opacity-10 group-hover:opacity-100 transition-opacity", color)}>{step}</span>
        <p className="text-[12px] font-black uppercase italic text-white m-0 tracking-widest">{title}</p>
      </div>
      <div className="p-3 bg-white/5 text-slate-600 group-hover:bg-white group-hover:text-black rounded-2xl transition-all shadow-inner">{icon}</div>
    </div>
  );
}

function LoadingScreen({ label }: { label: string }) {
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-[#0B0F1A] gap-8 lg:pl-72 text-blue-500 italic font-black uppercase tracking-[0.5em]">
      <RefreshCw className="animate-spin" size={70} strokeWidth={1} />
      <span className="text-[10px] animate-pulse text-center px-10 leading-relaxed uppercase">{label}</span>
    </div>
  );
}