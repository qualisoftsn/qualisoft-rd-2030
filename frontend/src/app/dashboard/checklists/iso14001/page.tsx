/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * 💡 MODULE : CHECKLIST D'AUDIT ISO 14001:2015
 * -------------------------------------------------------------------------
 * RÔLE : Évaluation du Système de Management Environnemental (SME).
 * FIX : Migration vers Sonner pour la gestion des alertes, optimisation 
 * du chargement et de la grille responsive (lg:ml-72).
 * -------------------------------------------------------------------------
 * DATE : 02 Mars 2026 | 13:43 GMT
 */

"use client";

import apiClient from "@/core/api/api-client";
import {
  AlertTriangle, CheckCircle, ChevronDown, Download, FileText, Flame,
  Leaf, MapPin, Minus, Recycle, RefreshCw, Search, Target, UploadCloud,
  Users, XCircle, Zap,
} from "lucide-react";
import React, { useEffect, useMemo, useState, useCallback } from "react";
import { toast, Toaster } from "sonner";

// --- TYPES STRICTS ---
type ResponseType = "YES" | "NO" | "PARTIAL" | "NA";
type FilterStatus = "ALL" | "COMPLIANT" | "NON_COMPLIANT" | "PENDING";

interface ChecklistResponse {
  CR_ChecklistId: string;
  CR_Response: ResponseType;
  CR_Comment?: string;
  CR_Evidence?: string;
  CR_IsCompliant: boolean;
}

interface ChecklistItem {
  LC_Id: string;
  LC_Clause: string;
  LC_Title: string;
  LC_Description: string;
  LC_Criteria: string;
  LC_Reference?: string;
  LC_SenegalSpecific?: boolean;
  response?: ChecklistResponse;
}

interface ChecklistStats {
  complianceRate: number;
  compliant: number;
  nonCompliant: number;
  notAnswered: number;
  total: number;
}

export default function ISO14001ChecklistPage() {
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([]);
  const [stats, setStats] = useState<ChecklistStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("ALL");
  const [savingItemId, setSavingItemId] = useState<string | null>(null);
  const [uploadingEvidence, setUploadingEvidence] = useState<string | null>(null);

  const clauseGroups = useMemo(() => [
    { id: "4", label: "Contexte de l'organisation (§4)", color: "from-green-500 to-emerald-600" },
    { id: "5", label: "Leadership (§5)", color: "from-teal-500 to-cyan-600" },
    { id: "6", label: "Planification (§6)", color: "from-lime-500 to-green-600" },
    { id: "7", label: "Support (§7)", color: "from-emerald-500 to-teal-600" },
    { id: "8", label: "Réalisation (§8)", color: "from-green-500 to-lime-600" },
    { id: "9", label: "Évaluation des performances (§9)", color: "from-teal-500 to-emerald-600" },
    { id: "10", label: "Amélioration (§10)", color: "from-lime-500 to-green-700" },
  ], []);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [checklistRes, statsRes] = await Promise.all([
        apiClient.get("/checklist?standard=ISO_14001_2015"),
        apiClient.get("/checklist/stats?standard=ISO_14001_2015"),
      ]);
      const itemsData = checklistRes.data?.data || checklistRes.data;
      const statsData = statsRes.data?.data || statsRes.data;
      
      setChecklistItems(Array.isArray(itemsData) ? itemsData : []);
      setStats(statsData || null);
    } catch (error) {
      toast.error("Erreur de synchronisation ISO 14001");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // --- ACTIONS ---
  const handleResponseChange = async (itemId: string, response: string) => {
    setSavingItemId(itemId);
    const tid = toast.loading("Enregistrement de l'évaluation...");
    try {
      await apiClient.post("/checklist/response", { CR_ChecklistId: itemId, CR_Response: response });
      toast.success("Évaluation environnementale mise à jour.", { id: tid });
      fetchData();
    } catch (error) {
      toast.error("Échec de l'enregistrement", { id: tid });
    } finally {
      setSavingItemId(null);
    }
  };

  const handleEvidenceUpload = async (itemId: string, file: File) => {
    setUploadingEvidence(itemId);
    const tid = toast.loading("Téléchargement de la preuve...");
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await apiClient.post("/upload", formData, { headers: { "Content-Type": "multipart/form-data" } });
      await apiClient.post("/checklist/response", { CR_ChecklistId: itemId, CR_Response: "YES", CR_Evidence: res.data.url });
      toast.success("Preuve documentaire attachée avec succès.", { id: tid });
      fetchData();
    } catch (error) {
      toast.error("Échec de l'upload.", { id: tid });
    } finally {
      setUploadingEvidence(null);
    }
  };

  const handleCommentChange = async (itemId: string, comment: string) => {
    setSavingItemId(itemId);
    try {
      const currentResp = checklistItems.find((i) => i.LC_Id === itemId)?.response?.CR_Response || "PARTIAL";
      await apiClient.post("/checklist/response", { CR_ChecklistId: itemId, CR_Response: currentResp, CR_Comment: comment });
      toast.success("Plan d'action mis à jour.");
      fetchData();
    } catch (error) {
      toast.error("Erreur lors de l'enregistrement du commentaire.");
    } finally {
      setSavingItemId(null);
    }
  };

  const handleGenerateReport = async () => {
    const tid = toast.loading("Génération du rapport de performance...");
    try {
      const response = await apiClient.post("/audit-report/generate", { auditId: "checklist-iso14001", template: "ISO_14001" }, { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([response.data as BlobPart]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Rapport_ISO14001_${new Date().toISOString().split("T")[0]}.pdf`);
      document.body.appendChild(link);
      link.click(); link.remove(); window.URL.revokeObjectURL(url);
      toast.success("Rapport téléchargé.", { id: tid });
    } catch (error) {
      toast.error("Échec de la génération.", { id: tid });
    }
  };

  // --- FILTRES ---
  const filteredItems = useMemo(() => {
    return checklistItems.filter((item) => {
      const searchStr = searchTerm.toLowerCase();
      const matchesSearch = item.LC_Clause.toLowerCase().includes(searchStr) || item.LC_Title.toLowerCase().includes(searchStr) || item.LC_Description.toLowerCase().includes(searchStr) || (item.LC_Reference && item.LC_Reference.toLowerCase().includes(searchStr));
      if (!matchesSearch) return false;
      if (filterStatus === "ALL") return true;
      if (filterStatus === "COMPLIANT") return item.response?.CR_IsCompliant;
      if (filterStatus === "NON_COMPLIANT") return item.response && !item.response.CR_IsCompliant;
      if (filterStatus === "PENDING") return !item.response;
      return true;
    });
  }, [checklistItems, searchTerm, filterStatus]);

  const groupedItems = useMemo(() => {
    const groups: Record<string, ChecklistItem[]> = {};
    clauseGroups.forEach((group) => {
      groups[group.id] = filteredItems.filter((item) => item.LC_Clause.startsWith(group.id + ".") || item.LC_Clause === group.id);
    });
    return groups;
  }, [filteredItems, clauseGroups]);

  if (loading && checklistItems.length === 0) {
    return (
      <div className="ml-0 lg:ml-72 h-screen flex items-center justify-center bg-[#0B0F1A]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-500/20 border-t-green-500 rounded-full animate-spin mb-6 mx-auto"></div>
          <p className="text-green-500 font-black uppercase italic text-xs tracking-widest">
            Chargement ISO 14001...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="ml-0 lg:ml-72 min-h-screen bg-[#0B0F1A] text-white font-sans p-6 lg:p-10 selection:bg-green-600/30 pb-24">
      <Toaster position="top-right" richColors theme="dark" />

      <div className="max-w-400 mx-auto">
        {/* HEADER */}
        <header className="mb-10 border-b-2 border-white/5 pb-8 mt-12 lg:mt-0">
          <div className="flex flex-col xl:flex-row justify-between xl:items-start gap-8 mb-6">
            <div className="flex items-start gap-5">
              <div className="bg-linear-to-br from-green-600 to-emerald-800 p-5 rounded-4xl shadow-xl shadow-green-900/20 border border-green-500/20 shrink-0">
                <Leaf size={40} className="text-white" />
              </div>
              <div>
                <h1 className="text-4xl lg:text-5xl font-black uppercase italic tracking-tighter m-0 leading-none">
                  Checklist <span className="text-green-500">ISO 14001</span>
                </h1>
                <p className="text-slate-500 font-bold text-[10px] lg:text-xs uppercase tracking-[0.4em] mt-3 italic m-0">
                  Management Environnemental • Performance Durable
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 shrink-0">
              <button onClick={handleGenerateReport} className="flex-1 sm:flex-none bg-linear-to-r from-green-600 to-emerald-800 hover:from-green-500 hover:to-emerald-700 text-white px-6 py-4 rounded-2xl font-black uppercase text-xs flex justify-center items-center gap-2 transition-all shadow-xl shadow-green-900/20 border-none cursor-pointer">
                <Download size={18} /> Rapport
              </button>
              <button onClick={fetchData} className="flex-1 sm:flex-none bg-white/5 hover:bg-white/10 text-white px-6 py-4 rounded-2xl font-black uppercase text-xs flex justify-center items-center gap-2 transition-all cursor-pointer border-none">
                <RefreshCw size={18} /> Actualiser
              </button>
            </div>
          </div>

          {stats && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
              <StatCard label="Taux de Conformité" value={`${stats.complianceRate}%`} icon={<Target />} color="emerald" target="≥ 85%" />
              <StatCard label="Aspects Maîtrisés" value={`${stats.compliant}/${stats.total}`} icon={<Leaf />} color="green" />
              <StatCard label="Risques Env." value={stats.nonCompliant} icon={<Flame />} color="amber" />
              <StatCard label="Objectifs Atteints" value="3/5" icon={<Recycle />} color="cyan" />
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 mt-8">
            <div className="relative flex-1 group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-green-500 transition-colors" size={18} />
              <input
                type="text"
                placeholder="Rechercher aspect environnemental, exigence..."
                className="w-full bg-black/40 border-2 border-white/10 rounded-3xl pl-12 pr-4 py-4 text-xs font-bold uppercase text-white focus:border-green-500 outline-none transition-colors"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
              className="bg-black/40 border-2 border-white/10 rounded-3xl px-6 py-4 text-xs font-black uppercase text-white focus:border-green-500 outline-none min-w-50 cursor-pointer appearance-none transition-colors"
            >
              <option value="ALL" className="bg-[#0B0F1A]">Tous les statuts</option>
              <option value="COMPLIANT" className="bg-[#0B0F1A]">Conforme (Oui)</option>
              <option value="NON_COMPLIANT" className="bg-[#0B0F1A]">Non Conforme (Non)</option>
              <option value="PENDING" className="bg-[#0B0F1A]">Non évalué</option>
            </select>
          </div>
        </header>

        {/* INDICATEURS ENVIRONNEMENTAUX */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
          <EnvironmentalKpi title="Conso. Énergétique" value="8,450 kWh" trend="-5%" icon={<Zap />} color="amber" target="Objectif: -10% annuel" />
          <EnvironmentalKpi title="Taux de Recyclage" value="72%" trend="+8%" icon={<Recycle />} color="green" target="Objectif: ≥ 75%" />
          <EnvironmentalKpi title="Déchets Dangereux" value="120 kg" trend="-15%" icon={<Flame />} color="red" target="Objectif: Zéro déchet" />
        </div>

        {/* PROGRESSION GLOBALE ISO 14001 */}
        <div className="bg-linear-to-r from-green-900/20 to-emerald-900/20 border-2 border-green-500/20 rounded-[3rem] p-8 lg:p-10 mb-10 shadow-2xl">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-6 mb-6">
            <div>
              <h2 className="text-2xl font-black uppercase italic m-0 text-white">Performance Environnementale</h2>
              <p className="text-xs font-bold tracking-widest text-green-400 mt-2 m-0 uppercase">
                Suivi de la conformité ISO 14001 et locale
              </p>
            </div>
            <div className="text-left sm:text-right">
              <span className="text-4xl font-black italic text-white leading-none">{stats?.complianceRate || 0}%</span>
            </div>
          </div>
          <div className="w-full bg-black/40 rounded-full h-4 overflow-hidden border border-white/5">
            <div className="h-full bg-linear-to-r from-green-500 to-emerald-400 transition-all duration-1000" style={{ width: `${stats?.complianceRate || 0}%` }} />
          </div>
        </div>

        {/* CHECKLIST PAR SECTION ISO */}
        <div className="space-y-6">
          {clauseGroups.map((group) => {
            const items = groupedItems[group.id];
            if (!items || items.length === 0) return null;
            const isExpanded = expandedSection === group.id;

            return (
              <section key={group.id} className="bg-slate-900/40 border-2 border-white/5 rounded-[2.5rem] overflow-hidden shadow-xl transition-all">
                <button
                  onClick={() => setExpandedSection(isExpanded ? null : group.id)}
                  className="w-full p-6 lg:p-8 text-left transition-all cursor-pointer border-none flex flex-col md:flex-row justify-between md:items-center gap-6"
                  style={{ background: isExpanded ? `linear-gradient(90deg, ${group.color.replace("from-", "rgba(").replace(" to-", ", 0.2)")}, transparent)` : "transparent" }}
                >
                  <div className="flex items-center gap-4">
                    <span className="text-xs font-black uppercase bg-green-500/20 text-green-400 px-3 py-1.5 rounded-xl border border-green-500/30 shrink-0">
                      §{group.id}
                    </span>
                    <span className="text-xl lg:text-2xl font-black uppercase italic text-white m-0">{group.label}</span>
                  </div>
                  <div className="flex items-center gap-6 shrink-0 w-full md:w-auto">
                    <div className="flex items-center gap-2 text-[10px] font-black tracking-widest bg-black/40 px-4 py-2 rounded-xl">
                      <Leaf className="text-green-500" size={16} />
                      <span className="text-white">{items.filter((i) => i.response?.CR_IsCompliant).length} / {items.length}</span>
                    </div>
                    <div className="hidden sm:block w-32 h-2 bg-black/40 rounded-full overflow-hidden border border-white/5">
                      <div className="h-full bg-green-500" style={{ width: `${Math.round((items.filter((i) => i.response?.CR_IsCompliant).length / items.length) * 100)}%` }} />
                    </div>
                    <ChevronDown className={`text-slate-500 transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`} size={24} />
                  </div>
                </button>

                {isExpanded && (
                  <div className="divide-y divide-white/5 border-t-2 border-white/5 bg-black/20">
                    {items.map((item) => {
                      const response = item.response;
                      const isCompliant = response?.CR_IsCompliant;
                      const hasEvidence = response?.CR_Evidence;

                      return (
                        <div key={item.LC_Id} className="p-6 lg:p-8 hover:bg-white/5 transition-colors">
                          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                            
                            {/* EXIGENCE */}
                            <div className="xl:col-span-2 space-y-4">
                              <div className="flex flex-wrap items-center gap-3">
                                <span className="text-[10px] font-black uppercase bg-green-500/20 text-green-400 px-2.5 py-1 rounded-lg border border-green-500/20">
                                  §{item.LC_Clause}
                                </span>
                                {item.LC_SenegalSpecific && (
                                  <span className="text-[9px] font-black uppercase bg-amber-500/20 text-amber-400 px-2.5 py-1 rounded-lg border border-amber-500/20 flex items-center gap-1.5">
                                    <MapPin size={12} /> Exigence Sénégal
                                  </span>
                                )}
                              </div>
                              <h3 className="font-black text-lg lg:text-xl uppercase italic text-white m-0 leading-tight">
                                {item.LC_Title}
                              </h3>
                              <p className="text-xs text-slate-400 italic m-0 leading-relaxed border-l-2 border-white/10 pl-4">
                                {item.LC_Description}
                              </p>
                              <div className="bg-black/40 border border-white/5 rounded-2xl p-5 mt-4">
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 flex items-center gap-2 m-0">
                                  <FileText size={16} className="text-green-500" /> Critère d&apos;évaluation
                                </p>
                                <p className="text-xs text-slate-300 font-bold m-0 leading-relaxed">{item.LC_Criteria}</p>
                              </div>
                              {item.LC_Reference && (
                                <div className="text-[10px] text-slate-500 italic uppercase tracking-widest mt-2">
                                  <span className="font-black text-green-400">Réf. légale:</span> {item.LC_Reference}
                                </div>
                              )}
                            </div>

                            {/* RÉPONSE & PREUVE */}
                            <div className="space-y-6">
                              <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3 block">Notre Évaluation</label>
                                <div className="grid grid-cols-2 gap-2">
                                  {(["YES", "NO", "PARTIAL", "NA"] as const).map((resp) => (
                                    <button
                                      key={resp}
                                      onClick={() => handleResponseChange(item.LC_Id, resp)}
                                      disabled={savingItemId === item.LC_Id}
                                      className={`p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer border-none flex flex-col items-center gap-2 ${
                                        response?.CR_Response === resp
                                          ? resp === "YES" ? "bg-emerald-600 text-white shadow-lg shadow-emerald-900/20"
                                          : resp === "NO" ? "bg-red-600 text-white shadow-lg shadow-red-900/20"
                                          : resp === "PARTIAL" ? "bg-amber-500 text-white shadow-lg shadow-amber-900/20"
                                          : "bg-slate-600 text-white shadow-lg"
                                          : "bg-white/5 text-slate-500 hover:bg-white/10 hover:text-white"
                                      }`}
                                    >
                                      {resp === "YES" && <CheckCircle size={16} />}
                                      {resp === "NO" && <XCircle size={16} />}
                                      {resp === "PARTIAL" && <AlertTriangle size={16} />}
                                      {resp === "NA" && <Minus size={16} />}
                                      {resp}
                                    </button>
                                  ))}
                                </div>
                              </div>

                              <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3 flex items-center gap-2">
                                  <UploadCloud size={16} className="text-green-500" /> Preuve Matérielle
                                </label>
                                {hasEvidence ? (
                                  <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 flex items-center justify-between">
                                    <a href={response.CR_Evidence} target="_blank" rel="noopener noreferrer" className="text-xs font-black uppercase tracking-widest text-emerald-400 hover:text-white flex items-center gap-2 no-underline transition-colors">
                                      <FileText size={16} /> Voir le document
                                    </a>
                                  </div>
                                ) : (
                                  <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-3xl bg-black/40 border-white/10 hover:border-green-500/50 hover:bg-green-500/5 cursor-pointer transition-all">
                                    <UploadCloud size={24} className="text-green-500 mb-2" />
                                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                                      {uploadingEvidence === item.LC_Id ? "Upload en cours..." : "Joindre un fichier"}
                                    </span>
                                    <input type="file" className="hidden" onChange={(e) => e.target.files && handleEvidenceUpload(item.LC_Id, e.target.files[0])} disabled={uploadingEvidence === item.LC_Id} />
                                  </label>
                                )}
                              </div>

                              <div>
                                <textarea
                                  value={response?.CR_Comment || ""}
                                  onChange={(e) => handleCommentChange(item.LC_Id, e.target.value)}
                                  placeholder="Plan d'action, remarques de l'auditeur..."
                                  className="w-full bg-black/40 border-2 border-white/10 rounded-3xl p-5 text-xs text-white focus:border-green-500 outline-none min-h-25 resize-y italic transition-colors"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>
            );
          })}
        </div>

        {/* ENGAGEMENTS SÉNÉGAL */}
        <section className="mt-12 bg-linear-to-r from-amber-900/10 to-green-900/10 border-2 border-green-500/20 rounded-[3rem] p-8 lg:p-10 shadow-2xl">
          <h2 className="text-2xl lg:text-3xl font-black uppercase italic mb-6 flex items-center gap-4 text-green-400 m-0">
            <Users size={32} /> Compliance Locale (Sénégal)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <EngagementCard title="Code de l'Environnement" description="Respect strict des dispositions légales du Sénégal" status="Conforme" color="emerald" />
            <EngagementCard title="Déchets Dangereux" description="Gestion conforme (Décret n° 2015-1537)" status="En cours" color="amber" />
            <EngagementCard title="Études d'Impact" description="Réalisation (Décret n° 2015-1229)" status="Non requis" color="slate" />
          </div>
        </section>
      </div>
    </div>
  );
}

// --- SOUS-COMPOSANTS ISO 14001 ---

function StatCard({ label, value, icon, color, target }: any) {
  const colorMap: Record<string, string> = {
    emerald: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
    green: "bg-green-500/10 border-green-500/20 text-green-400",
    amber: "bg-amber-500/10 border-amber-500/20 text-amber-400",
    cyan: "bg-cyan-500/10 border-cyan-500/20 text-cyan-400",
  };

  return (
    <div className={`border-2 rounded-4xl p-6 ${colorMap[color]}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="p-3 bg-current bg-opacity-20 rounded-xl text-current">{icon}</div>
        {target && <span className="text-[9px] font-black uppercase tracking-widest bg-current bg-opacity-20 px-3 py-1 rounded-full">{target}</span>}
      </div>
      <p className="text-[10px] font-black uppercase tracking-widest text-current opacity-80 mb-1 m-0">{label}</p>
      <p className="text-3xl font-black italic text-white m-0 leading-none">{value}</p>
    </div>
  );
}

function EnvironmentalKpi({ title, value, trend, icon, color, target }: any) {
  const colorMap: Record<string, string> = {
    green: "bg-green-500/10 border-green-500/20 text-green-400",
    amber: "bg-amber-500/10 border-amber-500/20 text-amber-400",
    red: "bg-red-500/10 border-red-500/20 text-red-400",
  };

  return (
    <div className={`border-2 rounded-4xl p-6 lg:p-8 ${colorMap[color]}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="p-4 bg-current bg-opacity-20 rounded-2xl text-current">{icon}</div>
        <div className={`text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full border ${trend.startsWith('+') ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400' : 'bg-amber-500/20 border-amber-500/30 text-amber-400'}`}>
          {trend}
        </div>
      </div>
      <h3 className="text-sm font-black uppercase tracking-widest text-current opacity-80 mb-2 m-0">{title}</h3>
      <div className="flex flex-col gap-1">
        <span className="text-4xl font-black italic text-white leading-none">{value}</span>
        <span className="text-[10px] font-bold text-slate-400 mt-2">{target}</span>
      </div>
    </div>
  );
}

function EngagementCard({ title, description, status, color }: any) {
  const configMap: Record<string, string> = {
    emerald: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
    amber: "bg-amber-500/10 border-amber-500/20 text-amber-400",
    slate: "bg-slate-500/10 border-slate-500/20 text-slate-400",
  };

  return (
    <div className={`border-2 rounded-4xl p-6 ${configMap[color]}`}>
      <h4 className="font-black uppercase italic text-white mb-2 m-0 text-lg">{title}</h4>
      <p className="text-xs text-slate-300 mb-6 italic leading-relaxed m-0">{description}</p>
      <div className="bg-current bg-opacity-20 text-current text-[9px] font-black uppercase tracking-widest px-4 py-2 rounded-xl inline-block border border-current">
        {status}
      </div>
    </div>
  );
}