//* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * 💡 CE QUE FAIT CETTE PAGE :
 * --------------------------
 * Fichier : app/dashboard/checklists/iso14001/page.tsx
 * Rôle : Interface pour l'évaluation de la conformité ISO 14001:2015 (Management Environnemental).
 * * * Fonctionnalités clés :
 * 1. KPIs Environnementaux : Suivi de la conso énergétique, déchets et recyclage.
 * 2. Analyse Réglementaire Spécifique : Prise en charge des obligations légales du Sénégal (Code de l'Environnement).
 * 3. Matrice de Conformité : Identification des exigences maîtrisées et des risques (écarts).
 * 4. Traçabilité Documentaire : Possibilité de lier des preuves (certificats de destruction, relevés, etc.).
 */

"use client";

import apiClient from "@/core/api/api-client";
import {
  AlertTriangle,
  CheckCircle,
  ChevronDown,
  Download,
  FileText,
  Flame,
  Leaf,
  MapPin,
  Recycle,
  RefreshCw,
  Search,
  Target,
  UploadCloud,
  Users,
  XCircle,
  Zap,
} from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";

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
  LC_SenegalSpecific?: boolean; // Attribut spécifique pour la conformité locale
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
  // --- ÉTATS ---
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([]);
  const [stats, setStats] = useState<ChecklistStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("ALL");
  const [savingItemId, setSavingItemId] = useState<string | null>(null);
  const [uploadingEvidence, setUploadingEvidence] = useState<string | null>(
    null,
  );

  // Groupes de clauses ISO 14001
  const clauseGroups = useMemo(
    () => [
      {
        id: "4",
        label: "Contexte de l'organisation (§4)",
        color: "from-green-500 to-emerald-600",
      },
      { id: "5", label: "Leadership (§5)", color: "from-teal-500 to-cyan-600" },
      {
        id: "6",
        label: "Planification (§6)",
        color: "from-lime-500 to-green-600",
      },
      { id: "7", label: "Support (§7)", color: "from-emerald-500 to-teal-600" },
      {
        id: "8",
        label: "Réalisation (§8)",
        color: "from-green-500 to-lime-600",
      },
      {
        id: "9",
        label: "Évaluation des performances (§9)",
        color: "from-teal-500 to-emerald-600",
      },
      {
        id: "10",
        label: "Amélioration (§10)",
        color: "from-lime-500 to-green-700",
      },
    ],
    [],
  );

  // --- CHARGEMENT DES DONNÉES ---
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [checklistRes, statsRes] = await Promise.all([
        apiClient.get<ChecklistItem[]>("/checklist?standard=ISO_14001_2015"),
        apiClient.get<ChecklistStats>(
          "/checklist/stats?standard=ISO_14001_2015",
        ),
      ]);
      setChecklistItems(checklistRes.data);
      setStats(statsRes.data);
    } catch (error) {
      console.error("Erreur chargement checklist ISO 14001:", error);
      toast.error("Erreur lors du chargement de la checklist");
    } finally {
      setLoading(false);
    }
  };

  // --- GESTIONNAIRES D'ÉVÉNEMENTS ---
  const handleResponseChange = async (itemId: string, response: string) => {
    setSavingItemId(itemId);
    try {
      await apiClient.post("/checklist/response", {
        CR_ChecklistId: itemId,
        CR_Response: response,
      });
      toast.success("Réponse enregistrée avec succès");
      fetchData();
    } catch (error) {
      console.error("Erreur sauvegarde réponse:", error);
      toast.error("Erreur lors de l'enregistrement");
    } finally {
      setSavingItemId(null);
    }
  };

  const handleEvidenceUpload = async (itemId: string, file: File) => {
    setUploadingEvidence(itemId);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await apiClient.post<{ url: string }>("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      await apiClient.post("/checklist/response", {
        CR_ChecklistId: itemId,
        CR_Response: "YES",
        CR_Evidence: res.data.url,
      });

      toast.success("Preuve environnementale téléchargée");
      fetchData();
    } catch (error) {
      console.error("Erreur upload preuve:", error);
      toast.error("Erreur lors du téléchargement");
    } finally {
      setUploadingEvidence(null);
    }
  };

  const handleCommentChange = async (itemId: string, comment: string) => {
    setSavingItemId(itemId);
    try {
      await apiClient.post("/checklist/response", {
        CR_ChecklistId: itemId,
        CR_Response:
          checklistItems.find((i) => i.LC_Id === itemId)?.response
            ?.CR_Response || "PARTIAL",
        CR_Comment: comment,
      });
      toast.success("Commentaire enregistré");
      fetchData();
    } catch (error) {
      console.error("Erreur sauvegarde commentaire:", error);
      toast.error("Erreur lors de l'enregistrement");
    } finally {
      setSavingItemId(null);
    }
  };

  const handleGenerateReport = async () => {
    try {
      const response = await apiClient.post(
        "/audit-report/generate",
        {
          auditId: "checklist-iso14001",
          template: "ISO_14001",
        },
        { responseType: "blob" },
      );

      const url = window.URL.createObjectURL(
        new Blob([response.data as BlobPart]),
      );
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `checklist-iso14001-${new Date().toISOString().split("T")[0]}.pdf`,
      );
      document.body.appendChild(link);
      link.click();
      link.remove();

      toast.success("Rapport environnemental généré avec succès");
    } catch (error) {
      console.error("Erreur génération rapport:", error);
      toast.error("Erreur lors de la génération du rapport");
    }
  };

  // --- FILTRES ET REGROUPEMENTS ---
  const filteredItems = useMemo(() => {
    return checklistItems.filter((item) => {
      const matchesSearch =
        item.LC_Clause.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.LC_Title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.LC_Description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.LC_Reference &&
          item.LC_Reference.toLowerCase().includes(searchTerm.toLowerCase()));

      if (!matchesSearch) return false;

      if (filterStatus === "ALL") return true;
      if (filterStatus === "COMPLIANT") return item.response?.CR_IsCompliant;
      if (filterStatus === "NON_COMPLIANT")
        return item.response && !item.response.CR_IsCompliant;
      if (filterStatus === "PENDING") return !item.response;

      return true;
    });
  }, [checklistItems, searchTerm, filterStatus]);

  const groupedItems = useMemo(() => {
    const groups: Record<string, ChecklistItem[]> = {};
    clauseGroups.forEach((group) => {
      groups[group.id] = filteredItems.filter(
        (item) =>
          item.LC_Clause.startsWith(group.id + ".") ||
          item.LC_Clause === group.id,
      );
    });
    return groups;
  }, [filteredItems, clauseGroups]);

  // --- ÉTAT DE CHARGEMENT ---
  if (loading) {
    return (
      <div className="ml-72 h-screen flex items-center justify-center bg-[#0B0F1A]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-500/20 border-t-green-500 rounded-full animate-spin mb-6 mx-auto"></div>
          <p className="text-slate-500 font-black uppercase italic text-[10px] tracking-widest">
            Chargement de la checklist ISO 14001:2015...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="ml-72 min-h-screen bg-[#0B0F1A] text-white font-sans p-8">
      {/* HEADER */}
      <header className="mb-10 border-b border-white/5 pb-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-linear-to-br from-green-600 to-emerald-700 p-4 rounded-2xl shadow-lg shadow-green-500/20">
                <Leaf size={40} className="text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-black uppercase italic tracking-tighter">
                  Checklist{" "}
                  <span className="text-green-500">ISO 14001:2015</span>
                </h1>
                <p className="text-slate-500 font-bold text-[10px] uppercase tracking-[0.4em] mt-2 italic">
                  Management Environnemental • Performance Durable
                </p>
              </div>
            </div>

            {stats && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
                <StatCard
                  label="Taux de Conformité"
                  value={`${stats.complianceRate}%`}
                  icon={<Target className="text-emerald-500" />}
                  color="bg-emerald-500/10 border-emerald-500/20"
                  target="≥ 85%"
                />
                <StatCard
                  label="Aspects Maîtrisés"
                  value={`${stats.compliant}/${stats.total}`}
                  icon={<Leaf className="text-green-500" />}
                  color="bg-green-500/10 border-green-500/20"
                />
                <StatCard
                  label="Risques Environnementaux"
                  value={stats.nonCompliant}
                  icon={<Flame className="text-amber-500" />}
                  color="bg-amber-500/10 border-amber-500/20"
                />
                <StatCard
                  label="Objectifs Environnementaux"
                  value="3/5"
                  icon={<Recycle className="text-cyan-500" />}
                  color="bg-cyan-500/10 border-cyan-500/20"
                />
              </div>
            )}
          </div>

          <div className="flex gap-4">
            <button
              onClick={handleGenerateReport}
              className="bg-linear-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 text-white px-6 py-4 rounded-2xl font-black uppercase text-[10px] flex items-center gap-2 transition-all shadow-lg cursor-pointer"
            >
              <Download size={18} /> Rapport Environnemental
            </button>
            <button
              onClick={fetchData}
              className="bg-slate-800 hover:bg-slate-700 text-white px-6 py-4 rounded-2xl font-black uppercase text-[10px] flex items-center gap-2 transition-all cursor-pointer"
            >
              <RefreshCw size={18} className="hover:animate-spin" /> Actualiser
            </button>
          </div>
        </div>

        {/* BARRE DE FILTRES */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
              size={18}
            />
            <input
              type="text"
              placeholder="Rechercher aspect environnemental, exigence..."
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-white focus:border-green-500 focus:ring-1 focus:ring-green-500/50 outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
            className="bg-[#151B2B] border border-white/10 rounded-xl px-4 py-2 text-white focus:border-green-500 focus:ring-1 focus:ring-green-500/50 outline-none min-w-45 cursor-pointer"
          >
            <option value="ALL">Tous les statuts</option>
            <option value="COMPLIANT">Conforme (Oui)</option>
            <option value="NON_COMPLIANT">Non Conforme (Non)</option>
            <option value="PENDING">Non évalué</option>
          </select>
        </div>
      </header>

      {/* INDICATEURS ENVIRONNEMENTAUX */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
        <EnvironmentalKpi
          title="Consommation Énergétique"
          value="8,450 kWh"
          trend="-5%"
          icon={<Zap className="text-amber-400" />}
          color="bg-amber-500/10 border-amber-500/20"
          target="Objectif: -10% annuel"
        />
        <EnvironmentalKpi
          title="Taux de Recyclage"
          value="72%"
          trend="+8%"
          icon={<Recycle className="text-green-400" />}
          color="bg-green-500/10 border-green-500/20"
          target="Objectif: ≥ 75%"
        />
        <EnvironmentalKpi
          title="Déchets Dangereux"
          value="120 kg"
          trend="-15%"
          icon={<Flame className="text-red-400" />}
          color="bg-red-500/10 border-red-500/20"
          target="Objectif: Zéro déchet dangereux"
        />
      </div>

      {/* PROGRESSION GLOBALE ISO 14001 */}
      <div className="bg-linear-to-r from-green-900/30 to-emerald-900/30 border border-green-500/20 rounded-3xl p-6 mb-10">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-xl font-black">
              Performance Environnementale Globale
            </h2>
            <p className="text-[10px] text-slate-400 mt-1 italic">
              Suivi de la conformité aux exigences ISO 14001:2015 et
              réglementation sénégalaise
            </p>
          </div>
          <div className="text-right">
            <span className="text-3xl font-black">
              {stats?.complianceRate || 0}%
            </span>
            <p className="text-[10px] text-slate-400 mt-1">
              Taux de conformité environnementale
            </p>
          </div>
        </div>

        <div className="w-full bg-white/5 rounded-full h-4 overflow-hidden">
          <div
            className="h-full bg-linear-to-r from-green-500 to-emerald-500 transition-all duration-500"
            style={{ width: `${stats?.complianceRate || 0}%` }}
          ></div>
        </div>

        <div className="mt-4 grid grid-cols-4 text-center text-[10px] font-black">
          <div>
            <div className="text-green-400">{stats?.compliant || 0}</div>
            <div>Maîtrisés</div>
          </div>
          <div>
            <div className="text-amber-400">{stats?.nonCompliant || 0}</div>
            <div>Risques</div>
          </div>
          <div>
            <div className="text-blue-400">{stats?.notAnswered || 0}</div>
            <div>Non Évalués</div>
          </div>
          <div>
            <div className="text-slate-400">{stats?.total || 0}</div>
            <div>Total</div>
          </div>
        </div>
      </div>

      {/* CHECKLIST PAR SECTION ISO */}
      <div className="space-y-8">
        {clauseGroups.map((group) => {
          const items = groupedItems[group.id];
          if (!items || items.length === 0) return null;

          const isExpanded = expandedSection === group.id;

          return (
            <section
              key={group.id}
              className="bg-slate-900/40 border border-white/5 rounded-3xl overflow-hidden"
            >
              <button
                onClick={() => setExpandedSection(isExpanded ? null : group.id)}
                className="w-full p-6 text-left bg-linear-to-r hover:from-slate-800 hover:to-slate-900 transition-all cursor-pointer"
                style={{
                  background: isExpanded
                    ? `linear-gradient(90deg, ${group.color.replace("from-", "rgb(").replace(" to-", ",")})`
                    : "transparent",
                }}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-[10px] font-black uppercase bg-green-500/20 text-green-300 px-2.5 py-0.5 rounded mr-3">
                      §{group.id}
                    </span>
                    <span className="text-xl font-black">{group.label}</span>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2 text-[10px] font-black">
                      <Leaf className="text-green-500" size={16} />
                      <span>
                        {items.filter((i) => i.response?.CR_IsCompliant).length}
                      </span>
                      <span className="text-slate-500">/</span>
                      <span>{items.length}</span>
                    </div>
                    <div className="w-24 h-2 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-500"
                        style={{
                          width: `${Math.round((items.filter((i) => i.response?.CR_IsCompliant).length / items.length) * 100)}%`,
                        }}
                      ></div>
                    </div>
                    <ChevronDown
                      className={`text-slate-500 transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`}
                      size={20}
                    />
                  </div>
                </div>
              </button>

              {isExpanded && (
                <div className="divide-y divide-white/5">
                  {items.map((item) => {
                    const response = item.response;
                    const isCompliant = response?.CR_IsCompliant;
                    const hasEvidence = response?.CR_Evidence;
                    const isSenegalSpecific = item.LC_SenegalSpecific;

                    return (
                      <div
                        key={item.LC_Id}
                        className="p-6 hover:bg-white/2 transition-colors"
                      >
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                          {/* COLONNE 1: EXIGENCE */}
                          <div className="lg:col-span-2">
                            <div className="flex items-start gap-3 mb-3">
                              <span className="text-[10px] font-black bg-green-500/20 text-green-300 px-2 py-0.5 rounded shrink-0">
                                {item.LC_Clause}
                              </span>
                              <div className="flex-1">
                                <h3 className="font-black text-lg">
                                  {item.LC_Title}
                                </h3>
                                {isSenegalSpecific && (
                                  <span className="text-[9px] font-black bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded mt-1 inline-block">
                                    <MapPin size={10} className="inline mr-1" />{" "}
                                    Spécifique Sénégal
                                  </span>
                                )}
                              </div>
                            </div>

                            <p className="text-[11px] text-slate-400 mb-3 italic">
                              {item.LC_Description}
                            </p>

                            <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-4">
                              <p className="text-[10px] font-black uppercase text-slate-500 mb-2 flex items-center gap-2">
                                <FileText
                                  size={14}
                                  className="text-green-500"
                                />{" "}
                                Critère d&apos;évaluation
                              </p>
                              <p className="text-[11px] text-slate-300">
                                {item.LC_Criteria}
                              </p>
                            </div>

                            {item.LC_Reference && (
                              <div className="text-[10px] text-slate-500 italic">
                                <span className="font-black text-green-400">
                                  Référence légale:
                                </span>{" "}
                                {item.LC_Reference}
                              </div>
                            )}
                          </div>

                          {/* COLONNE 2: RÉPONSE & ACTIONS */}
                          <div className="space-y-4">
                            <div>
                              <label className="text-[10px] font-black uppercase text-slate-500 mb-2 block">
                                notre réponse
                              </label>
                              <div className="grid grid-cols-2 gap-2">
                                {(["YES", "NO", "PARTIAL", "NA"] as const).map(
                                  (resp) => (
                                    <button
                                      key={resp}
                                      onClick={() =>
                                        handleResponseChange(item.LC_Id, resp)
                                      }
                                      disabled={savingItemId === item.LC_Id}
                                      className={`p-3 rounded-lg text-[10px] font-black uppercase transition-all cursor-pointer ${
                                        response?.CR_Response === resp
                                          ? resp === "YES"
                                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                                            : resp === "NO"
                                              ? "bg-red-500/20 text-red-300 border border-red-500/30"
                                              : resp === "PARTIAL"
                                                ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                                                : "bg-slate-500/20 text-slate-300 border border-slate-500/30"
                                          : "bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white"
                                      }`}
                                    >
                                      {resp === "YES" && (
                                        <CheckCircle
                                          size={14}
                                          className="mx-auto mb-1"
                                        />
                                      )}
                                      {resp === "NO" && (
                                        <XCircle
                                          size={14}
                                          className="mx-auto mb-1"
                                        />
                                      )}
                                      {resp === "PARTIAL" && (
                                        <AlertTriangle
                                          size={14}
                                          className="mx-auto mb-1"
                                        />
                                      )}
                                      {resp}
                                    </button>
                                  ),
                                )}
                              </div>
                            </div>

                            <div>
                              <label className="text-[10px] font-black uppercase text-slate-500 mb-2 block items-center gap-2">
                                <UploadCloud
                                  size={14}
                                  className="text-green-500 inline mr-1"
                                />{" "}
                                Preuve environnementale
                              </label>
                              {hasEvidence ? (
                                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3">
                                  <a
                                    href={response.CR_Evidence}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[10px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                                  >
                                    <FileText size={14} /> Voir la preuve
                                    (photo, certificat, relevé)
                                  </a>
                                </div>
                              ) : (
                                <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-xl bg-white/5 border-white/10 hover:border-green-500/30 hover:bg-green-500/5 cursor-pointer transition-all">
                                  <UploadCloud
                                    size={24}
                                    className="text-green-400 mb-2"
                                  />
                                  <span className="text-[10px] font-black text-slate-400">
                                    {uploadingEvidence === item.LC_Id
                                      ? "Téléchargement..."
                                      : "Uploader preuve"}
                                  </span>
                                  <input
                                    type="file"
                                    className="hidden"
                                    onChange={(e) =>
                                      e.target.files &&
                                      handleEvidenceUpload(
                                        item.LC_Id,
                                        e.target.files[0],
                                      )
                                    }
                                    disabled={uploadingEvidence === item.LC_Id}
                                  />
                                </label>
                              )}
                            </div>

                            <div>
                              <label className="text-[10px] font-black uppercase text-slate-500 mb-2 block">
                                Commentaires / Actions
                              </label>
                              <textarea
                                value={response?.CR_Comment || ""}
                                onChange={(e) =>
                                  handleCommentChange(
                                    item.LC_Id,
                                    e.target.value,
                                  )
                                }
                                placeholder="Décrivez les actions mises en place ou à prévoir..."
                                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-[10px] text-white focus:border-green-500 focus:ring-1 focus:ring-green-500/50 outline-none min-h-15"
                              />
                            </div>

                            <div className="pt-2 border-t border-white/5 flex justify-end">
                              <span
                                className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${
                                  isCompliant
                                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                                    : response
                                      ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                                      : "bg-slate-500/20 text-slate-300 border border-slate-500/30"
                                }`}
                              >
                                {isCompliant
                                  ? "Maîtrisé"
                                  : response
                                    ? "À améliorer"
                                    : "Non évalué"}
                              </span>
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

      {/* ENGAGEMENTS SÉNÉGAL (Compliance locale) */}
      <section className="mt-10 bg-linear-to-r from-amber-900/20 to-green-900/20 border border-amber-500/20 rounded-3xl p-8">
        <h2 className="text-2xl font-black mb-4 flex items-center gap-3 text-green-400">
          <Users size={28} /> Engagements Réglementaires Sénégalais
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <EngagementCard
            title="Code de l'Environnement"
            description="Respect des dispositions du Code de l'Environnement du Sénégal"
            status="Conforme"
            color="bg-emerald-500/10 border-emerald-500/20"
          />
          <EngagementCard
            title="Déchets Dangereux"
            description="Gestion conforme selon le Décret n° 2015-1537 du 11 décembre 2015"
            status="En cours"
            color="bg-amber-500/10 border-amber-500/20"
          />
          <EngagementCard
            title="Études d'Impact"
            description="Réalisation selon le Décret n° 2015-1229 du 28 octobre 2015"
            status="Non requis"
            color="bg-slate-500/10 border-slate-500/20"
          />
        </div>
      </section>

      {/* FOOTER */}
      <footer className="mt-12 pt-8 border-t border-white/5 text-center">
        <p className="text-[8px] font-bold text-slate-600 uppercase italic tracking-[0.3em]">
          Qualisoft SMI • Checklist Conformité ISO 14001:2015 • Conforme au Code
          de l&apos;Environnement Sénégal
        </p>
        <p className="text-[8px] font-bold text-slate-600 uppercase italic tracking-[0.3em] mt-1">
          Aspects Environnementaux • Objectifs • Conformité Légale • Évaluation
          des Performances
        </p>
      </footer>
    </div>
  );
}

// --- SOUS-COMPOSANTS ---

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  target?: string;
}

function StatCard({ label, value, icon, color, target }: StatCardProps) {
  return (
    <div className={`${color} rounded-2xl p-5`}>
      <div className="flex items-center justify-between mb-3">
        <div className="p-2 bg-white/10 rounded-lg">{icon}</div>
        {target && (
          <span className="text-[9px] font-black bg-white/20 px-2 py-0.5 rounded-full">
            {target}
          </span>
        )}
      </div>
      <p className="text-[9px] font-black uppercase text-white/70 mb-1">
        {label}
      </p>
      <p className="text-2xl font-black text-white">{value}</p>
    </div>
  );
}

interface EnvironmentalKpiProps {
  title: string;
  value: string;
  trend: string;
  icon: React.ReactNode;
  color: string;
  target: string;
}

function EnvironmentalKpi({
  title,
  value,
  trend,
  icon,
  color,
  target,
}: EnvironmentalKpiProps) {
  return (
    <div className={`${color} rounded-2xl p-6`}>
      <div className="flex items-center justify-between mb-4">
        <div className="p-3 bg-white/10 rounded-xl">{icon}</div>
        <div
          className={`text-[10px] font-black px-3 py-1 rounded-full ${
            trend.startsWith("+")
              ? "bg-emerald-500/20 text-emerald-300"
              : trend.startsWith("-")
                ? "bg-amber-500/20 text-amber-300"
                : "bg-slate-500/20 text-slate-300"
          }`}
        >
          {trend}
        </div>
      </div>
      <h3 className="text-lg font-black mb-1">{title}</h3>
      <div className="flex items-end justify-between">
        <span className="text-3xl font-black">{value}</span>
        <span className="text-[9px] text-slate-400">{target}</span>
      </div>
    </div>
  );
}

interface EngagementCardProps {
  title: string;
  description: string;
  status: "Conforme" | "En cours" | "Non requis";
  color: string;
}

function EngagementCard({
  title,
  description,
  status,
  color,
}: EngagementCardProps) {
  const statusConfig = {
    Conforme: { color: "text-emerald-400", bg: "bg-emerald-500/20" },
    "En cours": { color: "text-amber-400", bg: "bg-amber-500/20" },
    "Non requis": { color: "text-slate-400", bg: "bg-slate-500/20" },
  };

  const config = statusConfig[status] || statusConfig["Non requis"];

  return (
    <div className={`${color} rounded-xl p-5`}>
      <h4 className="font-black text-white mb-2">{title}</h4>
      <p className="text-[10px] text-slate-300 mb-3 italic">{description}</p>
      <div
        className={`${config.bg} ${config.color} text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full inline-block`}
      >
        {status}
      </div>
    </div>
  );
}
