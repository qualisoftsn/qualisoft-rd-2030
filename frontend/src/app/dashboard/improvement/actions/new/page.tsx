/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Layers,
  Loader2,
  Plus,
  Save,
  ShieldCheck,
  Target,
  X,
} from "lucide-react";
import { toast, Toaster } from "sonner";
import apiClient from "@/core/api/api-client";
import {
  ActionOrigin,
  ActionStatus,
  ActionType,
  Priority,
} from "@/types/elite-sde";

// --- UTILITAIRE CN ---
const cn = (...classes: (string | boolean | undefined | null)[]) =>
  classes.filter(Boolean).join(" ");

export default function NewActionPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // États pour les référentiels
  const [users, setUsers] = useState<any[]>([]);
  const [paqs, setPaqs] = useState<any[]>([]);

  // État du formulaire
  const [formData, setFormData] = useState({
    ACT_Title: "",
    ACT_Description: "",
    ACT_Priority: Priority.MEDIUM,
    ACT_Origin: ActionOrigin.AUTRE,
    ACT_Type: ActionType.CORRECTIVE,
    ACT_ResponsableId: "",
    ACT_PAQId: "",
    ACT_Deadline: "",
    tasks: [] as { titre: string; responsableId: string }[],
  });

  // --- 🛰️ CHARGEMENT DES RÉFÉRENTIELS ---
  const loadRefs = useCallback(async () => {
    try {
      const [resU, resP] = await Promise.all([
        apiClient.get("/users"),
        apiClient.get("/paq"),
      ]);
      setUsers(resU.data?.data || resU.data || []);
      setPaqs(resP.data?.data || resP.data || []);
    } catch (err) {
      console.error("[NEW_ACTION] Error:", err);
      toast.error("Rupture de liaison avec le Kernel SDE");
    }
  }, []);

  useEffect(() => {
    loadRefs();
  }, [loadRefs]);

  // --- 🛠️ LOGIQUE CRUD : SOUMISSION ---
  const handleSubmit = async () => {
    // Validations de sécurité ISO
    if (!formData.ACT_PAQId) return toast.error("RATTACHEMENT AU PAQ OBLIGATOIRE (§10.2)");
    if (!formData.ACT_ResponsableId) return toast.error("RESPONSABLE OBLIGATOIRE");
    if (!formData.ACT_Deadline || new Date(formData.ACT_Deadline) <= new Date()) {
      return toast.error("ÉCHÉANCE FUTURE OBLIGATOIRE");
    }

    setLoading(true);
    try {
      // 1. Création de l'Action Racine (Scellage Matrix)
      const actionPayload = {
        ACT_Title: formData.ACT_Title.trim(),
        ACT_Description: formData.ACT_Description.trim() || null,
        ACT_Priority: formData.ACT_Priority,
        ACT_Origin: formData.ACT_Origin,
        ACT_Type: formData.ACT_Type,
        ACT_Status: ActionStatus.A_FAIRE,
        ACT_ResponsableId: formData.ACT_ResponsableId,
        ACT_PAQId: formData.ACT_PAQId,
        ACT_Deadline: new Date(formData.ACT_Deadline).toISOString(),
      };

      const actionRes = await apiClient.post("/actions", actionPayload);
      const newActionId = actionRes.data?.ACT_Id || actionRes.data?.id;

      // 2. Création des Tâches (Items) - Si présentes
      const validTasks = formData.tasks.filter(t => t.titre.trim() !== "");
      if (validTasks.length > 0) {
        await Promise.all(
          validTasks.map((task) =>
            apiClient.post("/action-items", {
              itemTitre: task.titre.trim(),
              itemResponsableId: task.responsableId || formData.ACT_ResponsableId,
              itemEcheance: new Date(formData.ACT_Deadline).toISOString(),
              itemStatus: "A_FAIRE",
              actionId: newActionId,
            })
          )
        );
      }

      toast.success("SCELLAGE RÉUSSI : Action corrective enregistrée");
      router.push(`/dashboard/continuous-improvement`);
      router.refresh();
    } catch (err: any) {
      const msg = err.response?.data?.message || "ERREUR DE SCELLAGE SDE";
      toast.error(Array.isArray(msg) ? msg[0] : msg);
    } finally {
      setLoading(false);
    }
  };

  // --- ✅ VALIDATION NAVIGATION ---
  const canProceed = () => {
    if (step === 1) return formData.ACT_Title.trim().length >= 5;
    if (step === 2) {
      return (
        formData.ACT_PAQId &&
        formData.ACT_ResponsableId &&
        formData.ACT_Deadline &&
        new Date(formData.ACT_Deadline) > new Date()
      );
    }
    return true;
  };

  // --- 🔍 MÉMORISATION DES DONNÉES LIÉES ---
  const selectedPAQ = useMemo(() => paqs.find((p) => p.PAQ_Id === formData.ACT_PAQId), [paqs, formData.ACT_PAQId]);
  const selectedUser = useMemo(() => users.find((u) => u.U_Id === formData.ACT_ResponsableId), [users, formData.ACT_ResponsableId]);

  const steps = [
    { id: 1, title: "Identification", icon: Target, description: "Titre, description et typologie" },
    { id: 2, title: "Rattachement", icon: Layers, description: "PAQ, responsable et échéance" },
    { id: 3, title: "Décomposition", icon: CheckCircle2, description: "Plan d'actions détaillé" },
  ];

  return (
    <div className="ml-72 bg-gray-50 min-h-screen p-6 italic font-sans">
      <Toaster position="top-right" richColors theme="dark" />

      <div className="mx-auto max-w-4xl">
        {/* BREADCRUMB */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-gray-500 hover:text-indigo-600 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Retour au registre
          </button>
        </div>

        {/* HEADER */}
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-black uppercase tracking-tighter text-gray-900">
            Nouvelle Action <span className="text-indigo-600">Corrective</span>
          </h1>
          <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.3em] text-gray-400">
            CONFORMITÉ ISO 9001:2015 §10.2 • MATRIX SDE
          </p>
        </div>

        {/* PROGRESS INDICATOR */}
        <div className="mb-12 px-4">
          <div className="flex justify-between relative">
            {steps.map((s, index) => (
              <div key={s.id} className="flex flex-1 flex-col items-center relative z-10">
                <div className={cn(
                    "flex h-12 w-12 items-center justify-center rounded-2xl border-2 transition-all duration-500 shadow-sm",
                    step > s.id ? "border-emerald-500 bg-emerald-500 text-white" : 
                    step === s.id ? "border-indigo-600 bg-indigo-600 text-white shadow-indigo-200 shadow-lg" : 
                    "border-gray-200 bg-white text-gray-400"
                  )}>
                  {step > s.id ? <CheckCircle2 className="h-6 w-6" /> : <span className="font-black text-lg">{s.id}</span>}
                </div>
                <div className="mt-4 text-center">
                  <p className={cn("text-[10px] font-black uppercase tracking-widest", step >= s.id ? "text-gray-900" : "text-gray-400")}>{s.title}</p>
                </div>
                {index < steps.length - 1 && (
                  <div className={cn("absolute top-6 left-1/2 w-full h-0.5 -z-10", step > s.id ? "bg-emerald-500" : "bg-gray-200")} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* FORMULAIRE CONTAINER */}
        <div className="rounded-3xl bg-white shadow-xl shadow-gray-200/50 border border-gray-100 p-10">
          
          {/* ÉTAPE 1 : IDENTIFICATION */}
          {step === 1 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Désignation de l&apos;action *</label>
                <input
                  autoFocus
                  value={formData.ACT_Title}
                  onChange={(e) => setFormData({ ...formData, ACT_Title: e.target.value })}
                  placeholder="Ex: OPTIMISATION DE LA RÉCEPTION LOGISTIQUE"
                  className="w-full rounded-2xl border-gray-200 bg-gray-50 p-4 text-sm font-bold text-gray-900 focus:border-indigo-500 focus:ring-indigo-500 transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Analyse des causes racines</label>
                <textarea
                  rows={4}
                  value={formData.ACT_Description}
                  onChange={(e) => setFormData({ ...formData, ACT_Description: e.target.value })}
                  placeholder="Décrivez les causes identifiées via la méthode 5 Pourquoi ou Ishikawa..."
                  className="w-full rounded-2xl border-gray-200 bg-gray-50 p-4 text-sm font-bold text-gray-900 focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Origine Matrix</label>
                  <select
                    value={formData.ACT_Origin}
                    onChange={(e) => setFormData({ ...formData, ACT_Origin: e.target.value as ActionOrigin })}
                    className="w-full rounded-2xl border-gray-200 bg-gray-50 p-4 text-sm font-bold text-gray-900 focus:border-indigo-500 outline-none"
                  >
                    {Object.values(ActionOrigin).map(o => <option key={o} value={o}>{o.replace(/_/g, ' ')}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Typologie</label>
                  <select
                    value={formData.ACT_Type}
                    onChange={(e) => setFormData({ ...formData, ACT_Type: e.target.value as ActionType })}
                    className="w-full rounded-2xl border-gray-200 bg-gray-50 p-4 text-sm font-bold text-gray-900 focus:border-indigo-500 outline-none"
                  >
                    {Object.values(ActionType).map(t => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Priorité Stratégique</label>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  {[Priority.LOW, Priority.MEDIUM, Priority.HIGH, Priority.CRITICAL].map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setFormData({ ...formData, ACT_Priority: p })}
                      className={cn(
                        "rounded-2xl border-2 p-4 text-[10px] font-black uppercase transition-all",
                        formData.ACT_Priority === p ? "border-indigo-600 bg-indigo-600 text-white shadow-lg" : "border-gray-100 bg-gray-50 text-gray-400 hover:border-indigo-200"
                      )}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ÉTAPE 2 : RATTACHEMENT */}
          {step === 2 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="rounded-3xl bg-indigo-50 p-6 flex items-start gap-4 border border-indigo-100">
                <ShieldCheck className="h-6 w-6 text-indigo-600 shrink-0" />
                <div>
                  <h3 className="text-xs font-black uppercase tracking-widest text-indigo-900">Protocole de Traçabilité §10.2</h3>
                  <p className="mt-1 text-xs font-bold text-indigo-700/70">L&apos;action doit être rattachée à un PAQ pour valider le cycle PDCA.</p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Plan d&apos;Actions Qualité (PAQ) *</label>
                <select
                  value={formData.ACT_PAQId}
                  onChange={(e) => setFormData({ ...formData, ACT_PAQId: e.target.value })}
                  className="w-full rounded-2xl border-gray-200 bg-gray-50 p-4 text-sm font-bold text-gray-900 focus:border-indigo-500 outline-none"
                >
                  <option value="">SÉLECTIONNER UN PAQ ACTIF...</option>
                  {paqs.map((paq) => (
                    <option key={paq.PAQ_Id} value={paq.PAQ_Id}>
                      {paq.PAQ_Title.toUpperCase()} ({paq.PAQ_Year})
                    </option>
                  ))}
                </select>
                {selectedPAQ && (
                   <div className="mt-2 text-[9px] font-black uppercase text-indigo-500 bg-indigo-50 px-4 py-2 rounded-xl inline-block border border-indigo-100">
                      Processus : {selectedPAQ.PAQ_Processus?.PR_Libelle || 'KERNEL'}
                   </div>
                )}
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Responsable Action *</label>
                  <select
                    value={formData.ACT_ResponsableId}
                    onChange={(e) => setFormData({ ...formData, ACT_ResponsableId: e.target.value })}
                    className="w-full rounded-2xl border-gray-200 bg-gray-50 p-4 text-sm font-bold text-gray-900 focus:border-indigo-500 outline-none"
                  >
                    <option value="">CHOISIR DANS L&apos;ANNUAIRE...</option>
                    {users.map((u) => (
                      <option key={u.U_Id} value={u.U_Id}>{u.U_FirstName} {u.U_LastName}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Échéance de traitement *</label>
                  <input
                    type="date"
                    min={new Date().toISOString().split("T")[0]}
                    value={formData.ACT_Deadline}
                    onChange={(e) => setFormData({ ...formData, ACT_Deadline: e.target.value })}
                    className="w-full rounded-2xl border-gray-200 bg-gray-50 p-4 text-sm font-bold text-gray-900 focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ÉTAPE 3 : DÉCOMPOSITION (CRUD TÂCHES) */}
          {step === 3 && (
            <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
              <div className="flex items-center justify-between border-b border-gray-100 pb-6">
                <div>
                  <h3 className="text-xl font-black uppercase tracking-tighter text-gray-900">Plan de décomposition</h3>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Détail des jalons opérationnels</p>
                </div>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, tasks: [...formData.tasks, { titre: "", responsableId: formData.ACT_ResponsableId }] })}
                  className="bg-indigo-600 text-white p-3 rounded-xl hover:bg-indigo-700 transition-all flex items-center gap-2 text-[10px] font-black uppercase tracking-widest"
                >
                  <Plus className="h-4 w-4" /> Ajouter jalon
                </button>
              </div>

              <div className="space-y-4">
                {formData.tasks.map((task, idx) => (
                  <div key={idx} className="flex flex-col gap-4 rounded-3xl border border-gray-100 bg-gray-50 p-6 sm:flex-row sm:items-end group animate-in slide-in-from-left-4 duration-300">
                    <div className="flex-1 space-y-2">
                      <label className="text-[9px] font-black uppercase text-gray-400 ml-1">Intitulé du jalon {idx + 1}</label>
                      <input
                        value={task.titre}
                        onChange={(e) => {
                          const newTasks = [...formData.tasks];
                          newTasks[idx].titre = e.target.value;
                          setFormData({ ...formData, tasks: newTasks });
                        }}
                        className="w-full rounded-2xl border-gray-100 p-4 text-sm font-bold text-gray-900 focus:border-indigo-500 transition-all"
                      />
                    </div>
                    <div className="w-full sm:w-64 space-y-2">
                      <label className="text-[9px] font-black uppercase text-gray-400 ml-1">Responsable</label>
                      <select
                        value={task.responsableId}
                        onChange={(e) => {
                          const newTasks = [...formData.tasks];
                          newTasks[idx].responsableId = e.target.value;
                          setFormData({ ...formData, tasks: newTasks });
                        }}
                        className="w-full rounded-2xl border-gray-100 p-4 text-sm font-bold text-gray-900 focus:border-indigo-500"
                      >
                        {users.map((u) => <option key={u.U_Id} value={u.U_Id}>{u.U_FirstName}</option>)}
                      </select>
                    </div>
                    <button
                      onClick={() => setFormData({ ...formData, tasks: formData.tasks.filter((_, i) => i !== idx) })}
                      className="p-4 rounded-2xl text-gray-400 hover:bg-red-50 hover:text-red-600 transition-all"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                ))}

                {formData.tasks.length === 0 && (
                  <div className="text-center py-12 bg-gray-50 rounded-[3rem] border-2 border-dashed border-gray-200">
                    <Layers className="h-10 w-10 text-gray-200 mx-auto mb-4" />
                    <p className="text-[10px] font-black uppercase text-gray-400">Aucune tâche définie</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ACTIONS DE NAVIGATION */}
          <div className="mt-12 flex justify-between gap-4">
            <button
              disabled={step === 1}
              onClick={() => setStep(s => Math.max(1, s - 1))}
              className="flex items-center gap-2 px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 hover:bg-gray-100 disabled:opacity-30 transition-all"
            >
              <ArrowLeft className="h-4 w-4" /> Précédent
            </button>

            {step < 3 ? (
              <button
                disabled={!canProceed()}
                onClick={() => setStep(s => s + 1)}
                className="flex items-center gap-2 bg-indigo-600 text-white px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-indigo-700 disabled:opacity-50 shadow-lg shadow-indigo-200 transition-all"
              >
                Suivant <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                disabled={loading || !canProceed()}
                onClick={handleSubmit}
                className="flex items-center gap-2 bg-emerald-600 text-white px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-emerald-700 disabled:opacity-50 shadow-lg shadow-emerald-100 transition-all"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {loading ? "SCELLAGE..." : "SCÉLLER L'ACTION"}
              </button>
            )}
          </div>
        </div>
      </div>
      
    </div>
  );
}