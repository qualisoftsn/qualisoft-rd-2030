/* eslint-disable @typescript-eslint/no-unused-vars */
//* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 📂 SYSTÈME GED (MATRIX CORE)
 * Rôle : Maîtrise des informations documentées §7.5 ISO 9001.
 * Fix : Alignement One-Pager, densité scellée et z-index filters.
 * -------------------------------------------------------------------------
 * DATE : 02 Mars 2026 | 02:35 GMT
 */

"use client";

import apiClient from "@/core/api/api-client";
import { Archive, CheckCircle2, Download, Eye, FileText, FileUp, Filter, History, Loader2, Plus, Save, Search, ShieldCheck, Trash2, X } from "lucide-react";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { toast, Toaster } from "sonner";

const cn = (...classes: any[]) => classes.filter(Boolean).join(" ");

export default function GEDPage() {
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [search, setSearch] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get("/documents");
      setDocuments(res.data?.data || res.data || []);
    } catch (err) {
      toast.error("ÉCHEC DE SYNCHRONISATION GED");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const stats = useMemo(() => ({
    total: documents.length,
    approved: documents.filter((d) => d.DOC_Status === "APPROUVE").length,
    review: documents.filter((d) => d.DOC_Status === "EN_REVUE").length,
    archived: documents.filter((d) => d.DOC_IsArchived).length,
  }), [documents]);

  const filteredDocs = useMemo(() => {
    return documents.filter((d) => {
      const matchSearch = (d.DOC_Title || "").toLowerCase().includes(search.toLowerCase()) || (d.DOC_Reference || "").toLowerCase().includes(search.toLowerCase());
      const matchCat = categoryFilter === "ALL" || d.DOC_Category === categoryFilter;
      return matchSearch && matchCat;
    });
  }, [documents, search, categoryFilter]);

  if (loading && documents.length === 0) return (
    <div className="ml-0 lg:ml-72 flex h-screen flex-col items-center justify-center bg-[#0B0F1A] text-blue-500 font-black italic tracking-widest animate-pulse">
      <Loader2 className="animate-spin mb-4" size={40} /> SYNCHRONISATION GED...
    </div>
  );

  return (
    <div className="h-screen bg-[#0B0F1A] text-white italic font-sans ml-0 lg:ml-72 flex flex-col overflow-hidden selection:bg-blue-600/30">
      <Toaster position="top-right" richColors theme="dark" />

      <header className="px-6 py-4 border-b border-white/5 flex flex-col sm:flex-row justify-between items-center shrink-0 bg-[#0B0F1A]/95 backdrop-blur-3xl z-40 gap-4 mt-12 lg:mt-0">
        <div className="text-left">
          <h1 className="text-2xl tracking-tighter italic leading-none font-black uppercase m-0">Système <span className="text-blue-600">GED Matrix</span></h1>
          <p className="text-slate-500 text-[8px] tracking-[0.3em] font-black uppercase opacity-60 m-0 mt-2 italic">§7.5 • Maîtrise Documentaire SDE</p>
        </div>
        <div className="flex gap-4 items-center">
          <div className="relative group hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500" size={14} />
            <input placeholder="RECHERCHER DOCUMENT..." className="w-64 bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-[10px] outline-none focus:border-blue-600 transition-all font-black italic uppercase text-white shadow-inner" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <button onClick={() => setIsModalOpen(true)} className="bg-blue-600 hover:bg-white hover:text-slate-900 px-6 py-2.5 rounded-xl text-[10px] flex items-center gap-2 transition-all font-black italic uppercase border-none text-white cursor-pointer active:scale-95 shadow-lg"><Plus size={16} strokeWidth={3} /> Nouveau Document</button>
        </div>
      </header>

      <div className="px-6 py-3 flex flex-wrap gap-3 shrink-0 bg-white/2">
        <MetricSmall title="Total" val={stats.total} icon={FileText} color="blue" />
        <MetricSmall title="Validés" val={stats.approved} icon={CheckCircle2} color="emerald" />
        <MetricSmall title="En Revue" val={stats.review} icon={History} color="amber" />
        <MetricSmall title="Archives" val={stats.archived} icon={Archive} color="slate" />
      </div>

      <div className="px-6 py-2 flex flex-col sm:flex-row justify-between items-center bg-black/20 border-y border-white/5 shrink-0 gap-4 overflow-x-auto">
        <div className="flex gap-2">
          {["ALL", "PROCEDURE", "MANUEL", "ENREGISTREMENT"].map((cat) => (
            <button key={cat} onClick={() => setCategoryFilter(cat)} className={cn("px-4 py-1.5 rounded-lg text-[8px] font-black transition-all border uppercase italic cursor-pointer tracking-widest", categoryFilter === cat ? "bg-blue-600 border-blue-600 text-white" : "bg-white/5 border-white/10 text-slate-500 hover:text-white")}>{cat}</button>
          ))}
        </div>
        <div className="text-slate-500 text-[8px] font-black uppercase italic tracking-widest flex items-center gap-2 m-0 whitespace-nowrap"><Filter size={12} /> {filteredDocs.length} DOCUMENTS DÉTECTÉS</div>
      </div>

      <main className="flex-1 overflow-hidden p-4 lg:p-6">
        <div className="h-full bg-[#151A2D] border border-white/5 rounded-3xl flex flex-col shadow-4xl overflow-hidden">
          <div className="overflow-auto h-full custom-scrollbar">
            <table className="w-full text-left border-collapse min-w-200">
              <thead className="sticky top-0 bg-[#151A2D] z-10 border-b border-white/10 shadow-sm">
                <tr className="text-[9px] text-slate-500 italic font-black uppercase tracking-[0.2em]">
                  <th className="px-6 py-4">Référence / Titre Officiel</th>
                  <th className="px-6 py-4">Secteur</th>
                  <th className="px-6 py-4 text-center">Version</th>
                  <th className="px-6 py-4 text-center">Statut SMI</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredDocs.map((doc) => (
                  <tr key={doc.DOC_Id} className="hover:bg-blue-600/5 transition-all group">
                    <td className="px-6 py-4">
                      <div className="flex flex-col text-left">
                        <span className="text-[9px] text-blue-500 font-black tracking-widest uppercase mb-1">{doc.DOC_Reference}</span>
                        <span className="text-sm text-white font-black italic tracking-tighter m-0 uppercase leading-none">{doc.DOC_Title}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4"><span className="text-[9px] font-black uppercase italic text-slate-400">§7.5 • SDE CORE</span></td>
                    <td className="px-6 py-4 text-center"><span className="font-black text-white text-lg italic leading-none">V{doc.DOC_CurrentVersion}</span></td>
                    <td className="px-6 py-4 text-center"><StatusMiniBadge status={doc.DOC_Status} /></td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                        <button className="p-2.5 bg-white/5 rounded-lg text-slate-400 hover:text-blue-500 transition-all cursor-pointer border-none"><Eye size={14}/></button>
                        <button className="p-2.5 bg-white/5 rounded-lg text-slate-400 hover:text-emerald-500 transition-all cursor-pointer border-none"><Download size={14}/></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {isModalOpen && (
        <div className="fixed inset-0 z-100 bg-black/95 backdrop-blur-2xl flex items-center justify-center p-4">
          <form onSubmit={async (e: any) => {
              e.preventDefault();
              if (!selectedFile) return toast.error("Veuillez sélectionner un fichier");
              const tid = toast.loading("Scellage documentaire...");
              try {
                await apiClient.post("/documents", new FormData(e.currentTarget), { headers: { "Content-Type": "multipart/form-data" } });
                toast.success("DOCUMENT SCELLÉ", { id: tid });
                setIsModalOpen(false); fetchData();
              } catch { toast.error("ERREUR DE DÉPOT", { id: tid }); }
            }}
            className="bg-[#0B0F1A] border border-white/10 rounded-[3rem] w-full max-w-xl p-10 lg:p-12 space-y-8 shadow-4xl animate-in zoom-in-95 font-black italic uppercase"
          >
            <div className="flex justify-between items-center border-b border-white/5 pb-6">
              <h2 className="text-xl italic font-black uppercase text-white m-0 flex items-center gap-3"><ShieldCheck className="text-blue-500" size={24} /> Indexation Documentaire</h2>
              <X size={24} className="cursor-pointer text-slate-500 hover:text-red-500" onClick={() => setIsModalOpen(false)} />
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2"><label className="text-[9px] text-slate-500 tracking-widest ml-2">Classification *</label><select name="DOC_Category" className="w-full bg-[#151A2D] border border-white/5 p-4 rounded-xl text-[10px] text-white font-black italic appearance-none cursor-pointer"><option value="PROCEDURE">PROCÉDURE</option><option value="MANUEL">MANUEL</option></select></div>
              <div className="space-y-2"><label className="text-[9px] text-slate-500 tracking-widest ml-2">Référence SMI</label><input name="DOC_Reference" placeholder="SDE-DOC-00" className="w-full bg-[#151A2D] border border-white/5 p-4 rounded-xl text-[10px] text-blue-400 font-black italic outline-none" /></div>
            </div>
            <div className="space-y-2 text-left"><label className="text-[9px] text-slate-500 tracking-widest ml-2">Désignation Officielle *</label><input required name="DOC_Title" className="w-full bg-[#151A2D] border border-white/5 p-4 rounded-xl text-[11px] text-white font-black italic outline-none focus:border-blue-600" /></div>
            <div className="relative"><label htmlFor="ged-up" className={cn("flex flex-col items-center justify-center border-2 border-dashed rounded-3xl p-8 transition-all cursor-pointer bg-white/2", selectedFile ? "border-emerald-500" : "border-white/10 hover:border-blue-500")}><FileUp size={30} className={selectedFile ? "text-emerald-500" : "text-blue-600"} /><p className="text-[10px] text-white font-black italic mt-3 m-0">{selectedFile ? selectedFile.name : "DÉPOSER LE FICHIER ISO"}</p></label><input id="ged-up" type="file" className="hidden" onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} /></div>
            <button type="submit" className="w-full bg-blue-600 py-6 rounded-3xl font-black text-xs tracking-widest text-white border-none flex items-center justify-center gap-4 cursor-pointer shadow-3xl active:scale-95 italic"><Save size={20} /> Valider l&apos;Indexation SMI</button>
          </form>
        </div>
      )}
      <style jsx global>{`.custom-scrollbar::-webkit-scrollbar { width: 3px; } .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }`}</style>
    </div>
  );
}

const MetricSmall = ({ title, val, icon: Icon, color }: any) => {
  const colors: any = { blue: "text-blue-500 bg-blue-500/10", emerald: "text-emerald-500 bg-emerald-500/10", amber: "text-amber-500 bg-amber-500/10", slate: "text-slate-400 bg-white/5" };
  return (
    <div className="flex-1 bg-[#151A2D] border border-white/5 rounded-2xl p-4 flex items-center justify-between shadow-inner">
      <div className="flex items-center gap-3">
        <div className={cn("p-2.5 rounded-xl border border-white/5", colors[color])}><Icon size={14} /></div>
        <p className="text-[8px] font-black uppercase text-slate-500 tracking-[0.2em] m-0 italic">{title}</p>
      </div>
      <p className="text-xl font-black text-white italic m-0 tracking-tighter">{val}</p>
    </div>
  );
};

const StatusMiniBadge = ({ status }: { status: string }) => {
  const config: any = { APPROUVE: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20", EN_REVUE: "text-amber-500 bg-amber-500/10 border-amber-500/20", BROUILLON: "text-slate-500 bg-white/5" };
  return (
    <span className={cn("px-4 py-1 rounded-full text-[8px] font-black border uppercase italic whitespace-nowrap", config[status] || config.BROUILLON)}>
      {status?.replace("_", " ") || "EN ATTENTE"}
    </span>
  );
};