/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import apiClient from "@/core/api/api-client";
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  CheckCircle2,
  Layers,
  Loader2,
  Plus,
  Save,
  Target,
  User,
  X,
  Zap,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

/**
 * 🚀 PAGE : WIZARD D'INDEXATION D'ACTION
 * Guide l'utilisateur dans la création structurée d'une action corrective.
 */
export default function NewActionPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [paqs, setPaqs] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [processes, setProcesses] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    ACT_Title: "",
    ACT_Description: "",
    ACT_Priority: "MEDIUM",
    ACT_Origin: "AUTRE",
    ACT_Type: "CORRECTIVE",
    ACT_ResponsableId: "",
    ACT_ProcessusId: "",
    ACT_PAQId: "",
    ACT_Deadline: "",
    tasks: [] as { titre: string; responsableId: string }[],
  });

  /**
   * 📡 CHARGEMENT DU RÉFÉRENTIEL MATRIX
   */
  useEffect(() => {
    const loadRefs = async () => {
      try {
        const [resU, resP, resPlans, resProc] = await Promise.all([
          apiClient.get("/users"),
          apiClient.get("/paq"),
          apiClient.get("/action-plans"),
          apiClient.get("/processes"),
        ]);
        setUsers(resU.data);
        setPaqs(resP.data);
        setPlans(resPlans.data);
        setProcesses(resProc.data);
      } catch (err) {
        toast.error("Échec de synchronisation du référentiel GPEC/SMQ");
      }
    };
    loadRefs();
  }, []);

  const handleSubmit = async () => {
    if (!formData.ACT_ProcessusId) {
      toast.error("RATTACHEMENT PROCESSUS OBLIGATOIRE (§4.4)");
      return;
    }

    setLoading(true);
    const tid = toast.loading("Scellage de l'action dans le noyau...");
    try {
      // 1. Persistance de l'action racine
      const actionRes = await apiClient.post("/actions", {
        ...formData,
        ACT_Status: "A_FAIRE",
      });

      // 2. Décomposition synchrone des tâches
      if (formData.tasks.length > 0 && formData.tasks[0].titre) {
        await Promise.all(
          formData.tasks.map((task) =>
            apiClient.post("/action-items", {
              itemTitre: task.titre,
              itemResponsableId:
                task.responsableId || formData.ACT_ResponsableId,
              itemEcheance: formData.ACT_Deadline,
              itemStatus: "A_FAIRE",
              actionId: actionRes.data.ACT_Id,
            }),
          ),
        );
      }

      toast.success("Action corrective indexée avec succès", { id: tid });
      router.push(`/dashboard/improvement/actions/${actionRes.data.ACT_Id}`);
    } catch (err) {
      toast.error("Échec critique de création", { id: tid });
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { id: 1, title: "Identification", icon: Target },
    { id: 2, title: "Rattachement", icon: Layers },
    { id: 3, title: "Décomposition", icon: CheckCircle2 },
  ];

  const canProceed = () => {
    if (step === 1) return formData.ACT_Title.length > 3;
    if (step === 2)
      return (
        formData.ACT_ProcessusId &&
        formData.ACT_ResponsableId &&
        formData.ACT_Deadline
      );
    return true;
  };

  const selectedProcess = processes.find(
    (p) => p.PR_Id === formData.ACT_ProcessusId,
  );

  return (
    <div className="min-h-screen bg-[#0B0F1A] text-white italic font-sans ml-72 p-10 selection:bg-blue-600/30">
      {/* 🧭 NAVIGATION RETOUR */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-3 text-slate-500 hover:text-white mb-10 text-[10px] font-black uppercase tracking-widest transition-all border-none bg-transparent cursor-pointer italic group"
      >
        <ArrowLeft
          size={16}
          className="group-hover:-translate-x-1 transition-transform"
        />{" "}
        Retour au Hub
      </button>

      <div className="max-w-4xl mx-auto text-left">
        <h1 className="text-6xl font-black uppercase tracking-tighter italic mb-4 text-white leading-none">
          Indexation <span className="text-blue-600">Action</span>
        </h1>
        <p className="text-slate-500 text-[11px] font-black uppercase tracking-[0.4em] mb-12 italic">
          Amélioration Continue • Cycle PDCA • Étape {step}/3
        </p>

        {/* 🚦 STEP INDICATOR */}
        <div className="flex gap-6 mb-12">
          {steps.map((s) => (
            <div
              key={s.id}
              className={`flex-1 flex items-center gap-4 p-5 rounded-3xl border transition-all duration-500 ${
                step >= s.id
                  ? "bg-blue-600/10 border-blue-500/30 text-blue-400 shadow-[0_0_20px_rgba(37,99,235,0.1)]"
                  : "bg-slate-900/40 border-white/5 text-slate-600"
              }`}
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all ${step >= s.id ? "bg-blue-600 text-white" : "bg-slate-800"}`}
              >
                <s.icon size={20} />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest">
                {s.title}
              </span>
              {step > s.id && (
                <CheckCircle2 size={16} className="ml-auto text-emerald-500" />
              )}
            </div>
          ))}
        </div>

        <div className="bg-slate-900/40 border border-white/10 rounded-[4rem] p-12 space-y-10 shadow-4xl backdrop-blur-md">
          {/* ÉTAPE 1 : IDENTIFICATION §10.2 */}
          {step === 1 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="text-left">
                <label className="text-[11px] font-black uppercase text-slate-500 tracking-widest mb-4 block italic ml-6">
                  Désignation de l&apos;Action corrective *
                </label>
                <input
                  required
                  autoFocus
                  className="w-full bg-slate-950 border border-white/10 rounded-4xl p-8 text-2xl font-black uppercase italic outline-none focus:border-blue-500 transition-all text-white shadow-inner placeholder:text-slate-800"
                  placeholder="EX: REFONTE DU PROCESSUS LOGISTIQUE..."
                  value={formData.ACT_Title}
                  onChange={(e) =>
                    setFormData({ ...formData, ACT_Title: e.target.value })
                  }
                />
              </div>

              <div className="text-left">
                <label className="text-[11px] font-black uppercase text-slate-500 tracking-widest mb-4 block italic ml-6">
                  Description & Analyse des Causes
                </label>
                <textarea
                  rows={4}
                  className="w-full bg-slate-950 border border-white/10 rounded-4xl p-8 text-sm font-bold outline-none focus:border-blue-500 transition-all text-white shadow-inner italic uppercase leading-relaxed placeholder:text-slate-800"
                  placeholder="CONTEXTE, JUSTIFICATION ET OBJECTIFS ATTENDUS..."
                  value={formData.ACT_Description}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      ACT_Description: e.target.value,
                    })
                  }
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
                <div className="space-y-4">
                  <label className="text-[11px] font-black uppercase text-slate-500 tracking-widest ml-6 italic">
                    Origine SMQ
                  </label>
                  <select
                    className="w-full bg-slate-950 border border-white/10 rounded-3xl p-6 text-xs font-black uppercase italic outline-none focus:border-blue-500 text-white appearance-none cursor-pointer"
                    value={formData.ACT_Origin}
                    onChange={(e) =>
                      setFormData({ ...formData, ACT_Origin: e.target.value })
                    }
                  >
                    <option value="AUDIT">AUDIT INTERNE/EXTERNE</option>
                    <option value="COPIL">COPIL / REVUE DIRECTION</option>
                    <option value="NON_CONFORMITE">NON-CONFORMITÉ</option>
                    <option value="RECLAMATION">RÉCLAMATION CLIENT</option>
                    <option value="AUTRE">AUTRE SOURCE</option>
                  </select>
                </div>
                <div className="space-y-4">
                  <label className="text-[11px] font-black uppercase text-slate-500 tracking-widest ml-6 italic">
                    Typologie d&apos;action
                  </label>
                  <select
                    className="w-full bg-slate-950 border border-white/10 rounded-3xl p-6 text-xs font-black uppercase italic outline-none focus:border-blue-500 text-white appearance-none cursor-pointer"
                    value={formData.ACT_Type}
                    onChange={(e) =>
                      setFormData({ ...formData, ACT_Type: e.target.value })
                    }
                  >
                    <option value="CORRECTIVE">ACTION CORRECTIVE</option>
                    <option value="PREVENTIVE">ACTION PRÉVENTIVE</option>
                    <option value="AMELIORATION">
                      OPPORTUNITÉ D&apos;AMÉLIORATION
                    </option>
                  </select>
                </div>
              </div>

              <div className="text-left pt-6">
                <label className="text-[11px] font-black uppercase text-slate-500 tracking-widest mb-6 block italic ml-6 leading-none">
                  Indice de Priorité Stratégique
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {["LOW", "MEDIUM", "HIGH", "URGENT"].map((prio) => (
                    <button
                      key={prio}
                      type="button"
                      onClick={() =>
                        setFormData({ ...formData, ACT_Priority: prio })
                      }
                      className={`p-5 rounded-2xl border text-[10px] font-black uppercase italic transition-all tracking-widest shadow-md border-none cursor-pointer ${
                        formData.ACT_Priority === prio
                          ? "bg-blue-600 text-white shadow-blue-900/40 scale-105"
                          : "bg-slate-950 text-slate-600 hover:text-white hover:bg-slate-900"
                      }`}
                    >
                      {prio}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ÉTAPE 2 : RATTACHEMENT §4.4 */}
          {step === 2 && (
            <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500 text-left">
              <div className="bg-blue-600/5 border-2 border-blue-500/20 rounded-[3rem] p-10 relative overflow-hidden group">
                <Zap
                  className="absolute -right-12 -bottom-12 text-blue-500/5 rotate-12 group-hover:scale-110 transition-transform duration-1000"
                  size={250}
                />

                <div className="flex items-center gap-4 mb-8 relative z-10">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center text-blue-500 shadow-lg">
                    <Layers size={24} />
                  </div>
                  <label className="text-[13px] font-black uppercase text-blue-400 tracking-[0.3em] italic leading-none">
                    Rattachement au Processus *
                  </label>
                </div>

                <select
                  required
                  className="w-full bg-slate-950 border border-blue-500/30 rounded-3xl p-8 text-sm font-black italic uppercase outline-none focus:border-blue-500 text-white shadow-2xl relative z-10 appearance-none cursor-pointer"
                  value={formData.ACT_ProcessusId}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      ACT_ProcessusId: e.target.value,
                    })
                  }
                >
                  <option value="" className="bg-[#0B0F1A]">
                    SÉLECTIONNER UN AXE DU SMI...
                  </option>
                  {processes.map((proc: any) => (
                    <option
                      key={proc.PR_Id}
                      value={proc.PR_Id}
                      className="bg-[#0B0F1A]"
                    >
                      {proc.PR_Code} - {proc.PR_Libelle}
                    </option>
                  ))}
                </select>

                <p className="mt-8 text-[11px] text-blue-500/50 font-black uppercase tracking-[0.2em] relative z-10 italic leading-none">
                  * LE RATTACHEMENT À UN PROCESSUS EST UN PRÉREQUIS À
                  L&apos;AUDITABILITÉ.
                </p>

                {selectedProcess && (
                  <div className="mt-8 p-6 bg-blue-600/10 rounded-4xl border border-blue-500/20 animate-in zoom-in-95 relative z-10 shadow-lg">
                    <p className="text-[10px] text-blue-300 uppercase font-black italic tracking-widest leading-none mb-3">
                      Contexte Processus
                    </p>
                    <p className="text-lg font-black text-white italic leading-none mb-2">
                      {selectedProcess.PR_Libelle}
                    </p>
                    <p className="text-[10px] text-blue-400 font-bold italic tracking-widest">
                      PILOTE : {selectedProcess.PR_Pilote?.U_FirstName}{" "}
                      {selectedProcess.PR_Pilote?.U_LastName}
                    </p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-4">
                  <label className="text-[11px] font-black uppercase text-slate-500 ml-6 italic tracking-widest flex items-center gap-2">
                    <User size={14} className="text-blue-500" /> Pilote Action *
                  </label>
                  <select
                    required
                    className="w-full bg-slate-950 border border-white/10 rounded-3xl p-6 text-xs font-black italic uppercase outline-none focus:border-blue-500 text-white appearance-none cursor-pointer"
                    value={formData.ACT_ResponsableId}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        ACT_ResponsableId: e.target.value,
                      })
                    }
                  >
                    <option value="">CHOISIR UN COLLABORATEUR...</option>
                    {users.map((u: any) => (
                      <option
                        key={u.U_Id}
                        value={u.U_Id}
                        className="bg-[#0B0F1A]"
                      >
                        {u.U_FirstName} {u.U_LastName}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-4">
                  <label className="text-[11px] font-black uppercase text-slate-500 ml-6 italic tracking-widest flex items-center gap-2">
                    <Calendar size={14} className="text-blue-500" /> Échéance de
                    Traitement *
                  </label>
                  <input
                    type="date"
                    required
                    className="w-full bg-slate-950 border border-white/10 rounded-3xl p-6 text-xs font-black italic outline-none focus:border-blue-500 text-blue-500 shadow-inner"
                    value={formData.ACT_Deadline}
                    onChange={(e) =>
                      setFormData({ ...formData, ACT_Deadline: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>
          )}

          {/* ÉTAPE 3 : DÉCOMPOSITION (TÂCHES) */}
          {step === 3 && (
            <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500 text-left">
              <div className="bg-slate-950/40 rounded-[3rem] p-10 border border-white/5 shadow-inner">
                <h3 className="text-[11px] font-black uppercase text-slate-500 tracking-[0.4em] mb-6 italic leading-none">
                  Récapitulatif d&apos;indexation
                </h3>
                <div className="grid grid-cols-2 gap-8 text-sm italic uppercase font-black tracking-tight text-white">
                  <div className="space-y-1">
                    <p className="text-[9px] text-slate-600">Action :</p>
                    <p className="truncate">{formData.ACT_Title}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] text-slate-600">Processus :</p>
                    <p className="text-blue-500 truncate">
                      {selectedProcess?.PR_Libelle}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] text-slate-600">Priorité :</p>
                    <p
                      className={
                        formData.ACT_Priority === "URGENT" ? "text-red-500" : ""
                      }
                    >
                      {formData.ACT_Priority}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] text-slate-600">Date Limite :</p>
                    <p>{formData.ACT_Deadline}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="text-xl font-black uppercase italic tracking-tighter ml-4 leading-none text-white">
                  Décomposition Granulaire (WBS)
                </h3>

                {formData.tasks.map((task, idx) => (
                  <div
                    key={idx}
                    className="flex gap-4 bg-slate-950/80 p-6 rounded-4xl border border-white/5 items-end shadow-xl animate-in slide-in-from-bottom-2 duration-300 transition-all group"
                  >
                    <div className="flex-1 space-y-3">
                      <label className="text-[10px] font-black uppercase text-slate-600 ml-4 italic tracking-widest">
                        Tâche de travail {idx + 1}
                      </label>
                      <input
                        placeholder="LIBELLÉ DE LA TÂCHE..."
                        className="w-full bg-transparent border-b border-white/10 pb-4 text-sm font-black uppercase italic text-white outline-none focus:border-blue-500 transition-all"
                        value={task.titre}
                        onChange={(e) => {
                          const newTasks = [...formData.tasks];
                          newTasks[idx].titre = e.target.value.toUpperCase();
                          setFormData({ ...formData, tasks: newTasks });
                        }}
                      />
                    </div>
                    <div className="w-64 space-y-3">
                      <label className="text-[10px] font-black text-slate-600 ml-2 italic tracking-widest uppercase">
                        Opérateur
                      </label>
                      <select
                        className="w-full bg-slate-900 border border-white/5 rounded-xl px-4 py-3 text-[10px] font-black uppercase italic text-slate-400 outline-none cursor-pointer"
                        value={task.responsableId}
                        onChange={(e) => {
                          const newTasks = [...formData.tasks];
                          newTasks[idx].responsableId = e.target.value;
                          setFormData({ ...formData, tasks: newTasks });
                        }}
                      >
                        <option value="">DÉFAUT (PILOTE)</option>
                        {users.map((u: any) => (
                          <option key={u.U_Id} value={u.U_Id}>
                            {u.U_FirstName}
                          </option>
                        ))}
                      </select>
                    </div>
                    <button
                      onClick={() =>
                        setFormData({
                          ...formData,
                          tasks: formData.tasks.filter((_, i) => i !== idx),
                        })
                      }
                      className="text-slate-700 hover:text-red-500 p-3 bg-white/5 rounded-xl transition-all border-none cursor-pointer mb-1"
                    >
                      <X size={20} />
                    </button>
                  </div>
                ))}

                <button
                  onClick={() =>
                    setFormData({
                      ...formData,
                      tasks: [
                        ...formData.tasks,
                        { titre: "", responsableId: "" },
                      ],
                    })
                  }
                  className="w-full py-8 border-2 border-dashed border-slate-800 rounded-[2.5rem] text-slate-600 hover:text-blue-500 hover:border-blue-500/50 transition-all text-[11px] font-black uppercase italic tracking-[0.4em] bg-transparent cursor-pointer group"
                >
                  <Plus
                    size={16}
                    className="inline mr-2 group-hover:scale-125 transition-transform"
                  />{" "}
                  Ajouter une unité de travail
                </button>
              </div>
            </div>
          )}

          {/* ACTIONS DE NAVIGATION DU WIZARD */}
          <div className="flex justify-between pt-10 border-t border-white/5">
            <button
              onClick={() => setStep(Math.max(1, step - 1))}
              disabled={step === 1}
              className="px-10 py-5 rounded-3xl font-black uppercase italic text-[10px] tracking-widest disabled:opacity-0 hover:bg-white/5 transition-all border-none text-slate-500 cursor-pointer"
            >
              Précédent
            </button>

            {step < 3 ? (
              <button
                onClick={() => setStep(step + 1)}
                disabled={!canProceed()}
                className="bg-blue-600 hover:bg-blue-500 disabled:opacity-30 disabled:hover:bg-blue-600 text-white px-10 py-5 rounded-3xl font-black uppercase italic text-[10px] tracking-widest shadow-3xl shadow-blue-900/40 transition-all flex items-center gap-3 border-none cursor-pointer"
              >
                Suivant <ArrowRight size={18} />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading || !canProceed()}
                className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white px-10 py-5 rounded-3xl font-black uppercase italic text-[10px] tracking-widest shadow-3xl shadow-emerald-900/40 transition-all flex items-center gap-3 border-none cursor-pointer group"
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  <Save
                    size={18}
                    className="group-hover:rotate-12 transition-transform"
                  />
                )}
                Valider L&apos;ACTION CORRECTIVE
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
