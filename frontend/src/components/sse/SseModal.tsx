/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

/**
 * 🚨 MODULE : SSE ACCIDENT REPORT MODAL
 * -------------------------------------------------------------------------
 * FONCTION : Signalement immédiat d'un accident ou incident SSE.
 * RÔLE : Initier le workflow de traitement (§10.2 ISO 45001).
 * ISOLATION : Liaison stricte aux sites et employés du Tenant.
 */

import apiClient from "@/core/api/api-client";
import { AlertCircle, Loader2, MapPin, ShieldAlert, X } from "lucide-react";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";

export default function SseModal({ onClose, onSuccess }: any) {
  const [loading, setLoading] = useState(false);
  const [sites, setSites] = useState([]);
  const [users, setUsers] = useState([]);

  const [formData, setFormData] = useState({
    SSE_Type: "ACCIDENT_TRAVAIL",
    SSE_Lieu: "",
    SSE_Description: "",
    SSE_DateEvent: new Date().toISOString().split("T")[0],
    SSE_SiteId: "",
    SSE_VictimId: "",
    SSE_AvecArret: false,
    SSE_NbJoursArret: 0,
    SSE_Lesions: "",
  });

  useEffect(() => {
    // Synchronisation multi-sources scellée
    Promise.all([apiClient.get("/sites"), apiClient.get("/users")])
      .then(([s, u]) => {
        setSites(s.data);
        setUsers(u.data);
      })
      .catch(() => toast.error("Échec synchro Kernel"));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const tid = toast.loading("Enregistrement du sinistre...");
    try {
      await apiClient.post("/sse", formData);
      toast.success("ÉVÉNEMENT SSE INDEXÉ", { id: tid });
      onSuccess();
      onClose();
    } catch (err) {
      toast.error("REJET DÉCLARATION", { id: tid });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-2xl z-100 flex items-center justify-center p-6 italic font-sans animate-in fade-in duration-500">
      <div className="bg-white w-full max-w-3xl rounded-[4rem] shadow-4xl overflow-hidden animate-in slide-in-from-bottom-12 duration-700">
        {/* HEADER D'URGENCE */}
        <div className="p-10 bg-red-600 text-white flex justify-between items-center relative overflow-hidden">
          <div className="flex items-center gap-5 relative z-10 text-left">
            <div className="p-4 bg-white/20 rounded-3xl backdrop-blur-md animate-pulse">
              <AlertCircle size={32} />
            </div>
            <div>
              <h2 className="text-3xl font-black uppercase italic tracking-tighter leading-none">
                Déclarer un{" "}
                <span className="text-slate-900">Événement SSE</span>
              </h2>
              <p className="text-[10px] font-black uppercase tracking-[0.4em] mt-3 opacity-80">
                Rapport de sinistre scellé RD 2026
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-3 bg-white/10 hover:bg-white/30 rounded-full transition-all border-none cursor-pointer text-white relative z-10"
          >
            <X size={28} />
          </button>
          <ShieldAlert
            className="absolute -right-8 -bottom-8 opacity-10 text-white rotate-12"
            size={200}
          />
        </div>

        <form
          onSubmit={handleSubmit}
          className="p-12 grid grid-cols-2 gap-8 text-left"
        >
          <div className="col-span-2 space-y-3">
            <label className="text-[11px] font-black uppercase text-slate-500 ml-4 tracking-widest italic leading-none">
              Type de l&apos;écart SSE
            </label>
            <select
              className="w-full bg-slate-50 border-2 border-slate-100 p-6 rounded-4xl text-sm font-black outline-none focus:border-red-600 transition-all uppercase italic appearance-none cursor-pointer"
              value={formData.SSE_Type}
              onChange={(e) =>
                setFormData({ ...formData, SSE_Type: e.target.value })
              }
            >
              <option value="ACCIDENT_TRAVAIL">Accident de Travail (AT)</option>
              <option value="ACCIDENT_TRAJET">Accident de Trajet</option>
              <option value="PRESQU_ACCIDENT">
                Presqu&apos;Accident (Nearly Miss)
              </option>
              <option value="SITUATION_DANGEREUSE">Situation Dangereuse</option>
            </select>
          </div>

          <div className="space-y-3">
            <label className="text-[11px] font-black uppercase text-slate-500 ml-4 tracking-widest italic">
              Horodatage des faits
            </label>
            <input
              type="date"
              required
              className="w-full bg-slate-50 border-2 border-slate-100 p-6 rounded-4xl text-sm font-black outline-none focus:border-red-600"
              value={formData.SSE_DateEvent}
              onChange={(e) =>
                setFormData({ ...formData, SSE_DateEvent: e.target.value })
              }
            />
          </div>

          <div className="space-y-3">
            <label className="text-[11px] font-black uppercase text-slate-500 ml-4 tracking-widest italic flex items-center gap-2">
              <MapPin size={14} /> Site Matrix
            </label>
            <select
              className="w-full bg-slate-50 border-2 border-slate-100 p-6 rounded-4xl text-sm font-black outline-none focus:border-red-600 uppercase italic cursor-pointer"
              value={formData.SSE_SiteId}
              onChange={(e) =>
                setFormData({ ...formData, SSE_SiteId: e.target.value })
              }
            >
              <option value="">SÉLECTIONNER UN PÉRIMÈTRE</option>
              {sites.map((s: any) => (
                <option key={s.S_Id} value={s.S_Id}>
                  {s.S_Name}
                </option>
              ))}
            </select>
          </div>

          <div className="col-span-2 space-y-3">
            <label className="text-[11px] font-black uppercase text-slate-500 ml-4 tracking-widest italic leading-none">
              Description & Circonstances de l&apos;écart
            </label>
            <textarea
              required
              className="w-full bg-slate-50 border-2 border-slate-100 p-8 rounded-[2.5rem] text-sm font-bold outline-none focus:border-red-600 min-h-30 italic leading-relaxed"
              placeholder="DÉCRIRE LES FAITS, LES CAUSES IMMÉDIATES ET LES LÉSIONS ÉVENTUELLES..."
              value={formData.SSE_Description}
              onChange={(e) =>
                setFormData({ ...formData, SSE_Description: e.target.value })
              }
            />
          </div>

          {/* GESTION DES ARRÊTS */}
          <div className="col-span-2 p-8 bg-slate-50 rounded-4xl flex items-center justify-between group border-2 border-transparent hover:border-red-100 transition-all">
            <div className="flex items-center gap-5">
              <input
                type="checkbox"
                className="w-8 h-8 rounded-xl border-slate-200 text-red-600 focus:ring-red-600 cursor-pointer shadow-inner"
                checked={formData.SSE_AvecArret}
                onChange={(e) =>
                  setFormData({ ...formData, SSE_AvecArret: e.target.checked })
                }
              />
              <div>
                <label className="text-sm font-black uppercase italic text-slate-900 leading-none">
                  Impact sur la continuité (Arrêt de travail)
                </label>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1 italic">
                  Indice de gravité de l&apos;événement
                </p>
              </div>
            </div>

            {formData.SSE_AvecArret && (
              <div className="flex items-center gap-4 animate-in slide-in-from-right duration-500">
                <span className="text-[10px] font-black text-red-600 uppercase italic tracking-widest">
                  Nb Jours :
                </span>
                <input
                  type="number"
                  className="w-24 bg-white border-2 border-red-100 p-4 rounded-xl text-sm font-black outline-none text-red-600 text-center shadow-lg"
                  value={formData.SSE_NbJoursArret}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      SSE_NbJoursArret: parseInt(e.target.value),
                    })
                  }
                />
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="col-span-2 bg-slate-950 py-8 rounded-[3rem] font-black uppercase italic text-sm tracking-[0.4em] text-white shadow-4xl hover:bg-red-600 transition-all flex justify-center items-center gap-6 border-none cursor-pointer active:scale-95"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={24} />
            ) : (
              <ShieldAlert size={24} />
            )}
            Valider le rapport de sinistre
          </button>
        </form>
      </div>
    </div>
  );
}
