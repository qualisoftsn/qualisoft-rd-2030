/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * 🌍 MODULE : GESTION DES SITES & IMPLANTATIONS (ELITE SDE)
 * ---------------------------------------------------------------------------
 * RÔLE : Point d'ancrage géographique du SMI (§4.4 ISO 9001:2015).
 * DESIGN : Elite High-Density / 100dvh / Zero-Scroll Global / ClickUp Style.
 * ARCHITECTURE : Zéro NextAuth (Souveraineté JWT via apiClient).
 * ---------------------------------------------------------------------------
 * DATE DE RÉVISION : 05 Mars 2026 | 19:25 GMT
 */

"use client";

import React, { useCallback, useEffect, useState, useMemo } from "react";
import apiClient from "@/core/api/api-client";
import {
  AlertCircle, Building, Globe, Info, Loader2, MapPin, 
  Navigation, Plus, RefreshCw, ShieldCheck, Trash2, Search, Layers
} from "lucide-react";
import { toast, Toaster } from "sonner";

// --- 🏗️ INTERFACES SDE ---
interface Site {
  S_Id: string;
  S_Name: string;
  S_Address: string | null;
  S_City: string | null;
  S_Country: string | null;
  S_IsActive: boolean;
  S_CreatedAt: string | Date;
}

const cn = (...classes: any[]) => classes.filter(Boolean).join(' ');

export default function SitesPage() {
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [search, setSearch] = useState("");

  const [formData, setFormData] = useState({
    S_Name: "",
    S_Address: "",
    S_City: "",
    S_Country: "SÉNÉGAL",
  });

  // --- 📡 SYNCHRONISATION KERNEL ---
  const fetchSites = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get<any>("/sites");
      const data = res.data?.data || res.data;
      setSites(Array.isArray(data) ? data : []);
    } catch {
      toast.error("RUPTURE KERNEL : Registre géographique inaccessible.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchSites(); }, [fetchSites]);

  // --- 💾 PROTOCOLE D'INDEXATION ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.S_Name.trim()) return toast.warning("DÉSIGNATION OBLIGATOIRE");

    setSubmitting(true);
    const tid = toast.loading("Scellage de l'implantation...");
    try {
      await apiClient.post("/sites", formData);
      toast.success(`Entité "${formData.S_Name}" scellée avec succès.`, { id: tid });
      setFormData({ S_Name: "", S_Address: "", S_City: "", S_Country: "SÉNÉGAL" });
      fetchSites();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Échec de mutation SDE.", { id: tid });
    } finally {
      setSubmitting(false);
    }
  };

  // --- 🗑️ RÉVOCATION ---
  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`ALERTE : Révoquer l'implantation "${name}" ?`)) return;
    const tid = toast.loading("Révocation de l'entité...");
    try {
      await apiClient.delete(`/sites/${id}`);
      toast.success("Implantation purgée.", { id: tid });
      setSites(prev => prev.filter(s => s.S_Id !== id));
    } catch {
      toast.error("Erreur de suppression.", { id: tid });
    }
  };

  const filteredSites = useMemo(() => 
    sites.filter(s => s.S_Name.toLowerCase().includes(search.toLowerCase()) || s.S_City?.toLowerCase().includes(search.toLowerCase())),
  [sites, search]);

  if (loading && sites.length === 0) return <LoadingScreen label="Scanning Infrastructure Géographique..." />;

  return (
    <div className="h-screen bg-[#F9FAFB] text-slate-900 italic font-black uppercase flex flex-col overflow-hidden w-full lg:pl-72 selection:bg-blue-600/30">
      <Toaster position="top-right" richColors theme="light" />
      
      {/* 🔝 HEADER TACTIQUE */}
      <header className="shrink-0 p-8 border-b border-slate-200 bg-white flex flex-col xl:flex-row justify-between items-center gap-6 mt-12 lg:mt-0">
        <div className="text-left space-y-3">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-600 rounded-2xl text-white shadow-xl shadow-blue-600/20">
              <MapPin size={28} strokeWidth={2.5} />
            </div>
            <h1 className="text-4xl lg:text-5xl tracking-tighter leading-none m-0 italic uppercase">
              Sites & <span className="text-blue-600">Implantations</span>
            </h1>
          </div>
          <p className="text-slate-500 text-[10px] tracking-[0.4em] m-0 flex items-center gap-2">
            <ShieldCheck size={14} className="text-blue-600" /> Cartographie Opérationnelle • ISO 9001 §4.4
          </p>
        </div>

        <div className="flex gap-4 w-full xl:w-auto">
          <div className="relative flex-1 xl:flex-none group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-600 transition-all" size={20} />
            <input 
              value={search} 
              onChange={e => setSearch(e.target.value)}
              placeholder="RECHERCHER SITE..." 
              className="w-full xl:w-80 bg-slate-50 border-2 border-slate-100 rounded-[2.5rem] py-5 pl-16 pr-8 text-[11px] font-black italic text-slate-900 outline-none focus:border-blue-600 shadow-inner uppercase" 
            />
          </div>
          <button onClick={fetchSites} className="p-5 bg-white border-2 border-slate-100 rounded-3xl text-slate-400 hover:text-blue-600 hover:border-blue-600 transition-all cursor-pointer">
            <RefreshCw size={24} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </header>

      {/* 📊 KPI & FORMULA BAR */}
      <nav className="shrink-0 px-8 py-4 bg-white border-b border-slate-200 flex justify-between items-center overflow-x-auto custom-scrollbar">
        <div className="flex items-center gap-8">
           <KPIStat label="Total Implantations" value={sites.length} />
           <KPIStat label="Sites Actifs" value={sites.filter(s => s.S_IsActive).length} color="text-emerald-600" />
        </div>
        <div className="hidden lg:block bg-slate-50 px-6 py-2 rounded-2xl border border-slate-200 text-[10px] text-slate-500 font-black italic">
          {"Indice de Maillage : $$I_m = \\frac{N_{Sites}}{N_{Processus}} \\times 100$$"}
        </div>
      </nav>

      {/* 🧩 DUAL VIEWPORT MAIN */}
      <main className="flex-1 overflow-hidden p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* COLONNE INDEXATION (Static in Viewport) */}
        <section className="lg:col-span-4 bg-white p-10 rounded-[3.5rem] border-2 border-slate-100 shadow-2xl flex flex-col gap-10">
          <header className="border-b border-slate-100 pb-6">
            <h2 className="text-xl font-black italic m-0 flex items-center gap-4 text-slate-900 uppercase tracking-tighter">
              <Plus className="text-blue-600" size={24} strokeWidth={3} /> Nouvelle <span className="text-blue-600">Entité</span>
            </h2>
            <p className="text-[9px] text-slate-400 tracking-widest mt-2 uppercase">Indexation au SDE Matrix</p>
          </header>

          <form onSubmit={handleSubmit} className="flex-1 space-y-8 overflow-y-auto pr-2 custom-scrollbar">
            <SDEInput label="Désignation du Site *" value={formData.S_Name} onChange={(v: string) => setFormData({...formData, S_Name: v.toUpperCase()})} icon={<Building size={18}/>} />
            <SDEInput label="Localisation Précise *" value={formData.S_Address} onChange={(v: any) => setFormData({...formData, S_Address: v})} icon={<Navigation size={18}/>} />
            
            <div className="grid grid-cols-2 gap-6">
              <SDEInput label="Ville *" value={formData.S_City} onChange={(v: string) => setFormData({...formData, S_City: v.toUpperCase()})} />
              <SDEInput label="Pays" value={formData.S_Country} onChange={(v: string) => setFormData({...formData, S_Country: v.toUpperCase()})} />
            </div>

            <button type="submit" disabled={submitting} className="w-full py-6 bg-slate-900 text-white rounded-4xl font-black text-[11px] tracking-[0.4em] italic shadow-4xl border-none cursor-pointer hover:bg-blue-600 transition-all flex items-center justify-center gap-4 uppercase active:scale-95">
              {submitting ? <Loader2 className="animate-spin" /> : <ShieldCheck size={20} />} Valider l&apos;Implantation
            </button>
          </form>
        </section>

        {/* COLONNE REGISTRE (Isolated Scroll) */}
        <section className="lg:col-span-8 bg-slate-100/40 rounded-[3.5rem] border-2 border-slate-100 overflow-hidden flex flex-col shadow-inner">
          <header className="p-8 border-b border-slate-200 bg-white/80 backdrop-blur-md flex justify-between items-center">
            <h2 className="text-sm font-black italic m-0 uppercase flex items-center gap-3 tracking-widest">
              <Globe className="text-blue-600" size={20} /> Implantations Actives
            </h2>
            <span className="text-[10px] font-black bg-blue-600 text-white px-4 py-1.5 rounded-xl">RD-2026 SDE</span>
          </header>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-8 grid grid-cols-1 xl:grid-cols-2 gap-8 content-start">
            {filteredSites.length > 0 ? filteredSites.map((site) => (
              <div key={site.S_Id} className="group bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm hover:border-blue-500/50 hover:shadow-2xl transition-all duration-500 relative overflow-hidden text-left">
                <div className="flex gap-6 items-start">
                  <div className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-inner shrink-0">
                    <MapPin size={28} strokeWidth={2.5} />
                  </div>
                  <div className="flex-1 min-w-0 space-y-2">
                    <h4 className="text-lg font-black uppercase italic text-slate-900 group-hover:text-blue-600 truncate m-0">{site.S_Name}</h4>
                    <p className="text-[11px] font-bold text-slate-400 uppercase italic truncate m-0 tracking-tight leading-none">{site.S_Address || "Pas d'adresse spécifiée"}</p>
                    <div className="flex items-center gap-3 pt-3">
                      <div className={cn("w-2 h-2 rounded-full animate-pulse", site.S_IsActive ? "bg-emerald-500" : "bg-slate-300")} />
                      <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest italic">{site.S_City}, {site.S_Country}</span>
                    </div>
                  </div>
                  <button onClick={() => handleDelete(site.S_Id, site.S_Name)} className="p-4 bg-slate-50 rounded-2xl text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all border-none cursor-pointer opacity-100 xl:opacity-0 group-hover:opacity-100">
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            )) : (
              <div className="col-span-full py-32 flex flex-col items-center gap-6 opacity-30 italic">
                <Layers size={60} strokeWidth={1} />
                <p className="font-black uppercase tracking-[0.4em] text-[10px]">Aucune implantation scellée</p>
              </div>
            )}
          </div>
        </section>
      </main>

      <style dangerouslySetInnerHTML={{ __html: `.custom-scrollbar::-webkit-scrollbar { width: 0px; }` }} />
    </div>
  );
}

// --- 🧩 COMPOSANTS ATOMIQUES SDE ---

function SDEInput({ label, value, onChange, icon }: any) {
  return (
    <div className="space-y-3 text-left w-full">
      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 italic m-0">{label}</label>
      <div className="relative group">
        {icon && <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-600 transition-colors">{icon}</div>}
        <input 
          value={value || ""} 
          onChange={e => onChange(e.target.value)} 
          className={cn(
            "w-full bg-slate-50 border-2 border-slate-100 rounded-3xl p-6 text-[12px] font-black text-slate-900 outline-none italic focus:border-blue-600 focus:bg-white transition-all uppercase shadow-inner",
            icon ? "pl-16" : "px-6"
          )} 
          placeholder="..." 
        />
      </div>
    </div>
  );
}

function KPIStat({ label, value, color = "text-blue-600" }: any) {
  return (
    <div className="flex flex-col text-left">
      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic leading-none">{label}</span>
      <span className={cn("text-2xl font-black italic m-0", color)}>{value}</span>
    </div>
  );
}

function LoadingScreen({ label }: { label: string }) {
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-[#F9FAFB] gap-8 lg:pl-72 text-blue-600 italic font-black uppercase tracking-[0.5em]">
      <RefreshCw className="animate-spin" size={70} strokeWidth={1} />
      <span className="text-[10px] animate-pulse text-center px-10 leading-relaxed uppercase">{label}</span>
    </div>
  );
}