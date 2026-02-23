/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 👥 MODULE : INTELLIGENCE TIERS & PARTIES INTÉRESSÉES
 * -------------------------------------------------------------------------
 * RÔLE : Centralisation du registre des tiers (Clients, Fournisseurs, État).
 * FONCTION : Monitoring 360°, pilotage des réclamations et suivi des actions.
 * CONFORMITÉ : ISO 9001/14001 §4.2 (Compréhension des besoins des PI).
 */

"use client";

import apiClient from "@/core/api/api-client";
import {
  Activity,
  Briefcase,
  Building,
  ChevronRight,
  Edit3,
  Loader2,
  Mail,
  MessageSquare,
  Plus,
  Search,
  ShieldCheck,
  Target,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useCallback, useEffect, useState } from "react";
import { toast } from "react-hot-toast";

export default function TiersPage() {
  const router = useRouter();

  // --- ÉTATS DE GESTION DES DONNÉES ---
  const [tiers, setTiers] = useState<any[]>([]);
  const [selectedTier, setSelectedTier] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // --- ÉTATS DE L'INTERFACE (MODALES & VOLETS) ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // --- ÉTAT DU FORMULAIRE SOUVERAIN ---
  const [form, setForm] = useState({
    TR_Name: "",
    TR_Email: "",
    TR_Type: "CLIENT",
  });

  /**
   * 📡 SYNCHRONISATION DU REGISTRE DES TIERS
   * Extraction des données depuis le microservice backend.
   */
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get("/tiers");
      setTiers(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      console.error("Erreur de liaison registre tiers:", e);
      toast.error("Échec de synchronisation du registre.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  /**
   * 🔍 ANALYSE 360° D'UN TIERS
   * Récupère les statistiques et détails profonds (Réclamations, Actions).
   */
  const openDetail = async (id: string) => {
    try {
      const res = await apiClient.get(`/tiers/${id}`);
      setSelectedTier(res.data);
      setIsDetailOpen(true);
    } catch (e) {
      toast.error("Impossible d'extraire le profil complet.");
    }
  };

  /**
   * ✍️ ÉDITION DU RÉFÉRENTIEL
   * Prépare la modale pour la modification d'un tiers existant.
   */
  const handleEdit = (e: React.MouseEvent, tier: any) => {
    e.stopPropagation(); // Évite l'ouverture du volet de détail
    setEditingId(tier.TR_Id);
    setForm({
      TR_Name: tier.TR_Name,
      TR_Email: tier.TR_Email || "",
      TR_Type: tier.TR_Type,
    });
    setIsModalOpen(true);
  };

  /**
   * 🗑️ RÉVOCATION D'UN TIERS
   * Suppression définitive après validation de l'autorité.
   */
  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (
      !confirm(
        "⚠️ RÉVOCATION : Confirmer la suppression définitive de ce tiers ?",
      )
    )
      return;
    try {
      await apiClient.delete(`/tiers/${id}`);
      toast.success("Tiers révoqué du registre.");
      fetchData();
    } catch (e) {
      toast.error(
        "Erreur de révocation : le tiers est peut-être lié à des données SMI.",
      );
    }
  };

  /**
   * 💾 VALIDATION ET SCELLAGE (CREATE/UPDATE)
   * Enregistre ou met à jour l'entrée dans la base Master.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await apiClient.patch(`/tiers/${editingId}`, form);
        toast.success("Mise à jour du tiers scellée.");
      } else {
        await apiClient.post("/tiers", form);
        toast.success("Nouveau tiers enregistré au registre.");
      }
      setIsModalOpen(false);
      fetchData();
    } catch (e) {
      toast.error("Erreur d'écriture dans le registre Master.");
    }
  };

  /**
   * 🚀 ACTIONS RAPIDES CONNECTÉES
   * Redirection vers les modules SMI avec injection du TierId en paramètre.
   */
  const handleQuickAction = (target: string) => {
    setIsDetailOpen(false);
    if (target === "reclamation") {
      router.push(`/dashboard/non-conformites?tierId=${selectedTier.TR_Id}`);
    } else {
      router.push(`/dashboard/paq?tierId=${selectedTier.TR_Id}`);
    }
  };

  // --- FILTRAGE DYNAMIQUE ---
  const filteredTiers = tiers.filter(
    (t) =>
      t.TR_Name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.TR_Type.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // --- ÉCRAN DE CHARGEMENT ÉLITE ---
  if (loading && tiers.length === 0)
    return (
      <div className="ml-72 h-screen flex flex-col items-center justify-center bg-[#0B0F1A] gap-6 text-blue-500">
        <Loader2 className="animate-spin" size={50} />
        <p className="font-black uppercase italic text-[10px] tracking-[0.5em] animate-pulse">
          Intelligence Tiers en cours...
        </p>
      </div>
    );

  return (
    <div className="p-10 bg-[#0B0F1A] min-h-screen ml-72 text-white italic font-sans relative flex flex-col items-center selection:bg-blue-600/30 overflow-x-hidden">
      {/* 🔝 HEADER TACTIQUE */}
      <header className="mb-12 border-b border-white/5 pb-10 flex justify-between items-end w-full max-w-7xl animate-in fade-in slide-in-from-top-4 duration-700">
        <div className="text-left space-y-4">
          <div className="flex items-center gap-3 text-blue-500 font-black uppercase text-[10px] tracking-widest">
            <ShieldCheck size={16} /> Qualisoft Sovereign Security
          </div>
          <h1 className="text-5xl font-black uppercase tracking-tighter italic leading-none">
            Intelligence <span className="text-blue-500">Tiers</span>
          </h1>
          <p className="text-slate-500 font-bold text-[11px] uppercase tracking-[0.4em] italic leading-none opacity-70">
            Pilotage Stratégique des Parties Intéressées (§4.2)
          </p>
        </div>
        <button
          onClick={() => {
            setEditingId(null);
            setForm({ TR_Name: "", TR_Email: "", TR_Type: "CLIENT" });
            setIsModalOpen(true);
          }}
          className="bg-blue-600 hover:bg-blue-500 px-10 py-5 rounded-2xl font-black uppercase italic text-xs flex items-center gap-4 shadow-3xl shadow-blue-900/20 transition-all active:scale-95 border-none cursor-pointer text-white"
        >
          <Plus size={20} strokeWidth={4} /> NOUVEAU TIERS
        </button>
      </header>

      {/* 🔍 BARRE DE RECHERCHE INDUSTRIELLE */}
      <div className="mb-10 w-full max-w-7xl relative group">
        <Search
          className="absolute left-8 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors"
          size={24}
        />
        <input
          type="text"
          placeholder="RECHERCHER DANS LE REGISTRE DES PARTIES INTÉRESSÉES..."
          className="w-full bg-slate-900/40 border border-white/5 rounded-[2.5rem] py-8 pl-20 pr-10 text-xs font-black placeholder:text-slate-700 outline-none focus:border-blue-500/50 transition-all uppercase italic shadow-2xl"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* 📋 GRILLE DES TIERS */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10 w-full max-w-7xl animate-in fade-in slide-in-from-bottom-8 duration-1000">
        {filteredTiers.length > 0 ? (
          filteredTiers.map((tier) => (
            <div
              key={tier.TR_Id}
              onClick={() => openDetail(tier.TR_Id)}
              className="bg-slate-900/40 border border-white/5 p-10 rounded-[4rem] relative group hover:border-blue-500/40 transition-all duration-500 cursor-pointer shadow-4xl text-left backdrop-blur-3xl overflow-hidden"
            >
              <div className="absolute top-10 right-10 flex gap-3 opacity-0 group-hover:opacity-100 transition-all z-10 translate-y-2 group-hover:translate-y-0">
                <button
                  onClick={(e) => handleEdit(e, tier)}
                  className="p-3 bg-white/5 hover:bg-blue-600 rounded-xl text-white transition-colors border-none cursor-pointer"
                >
                  <Edit3 size={16} />
                </button>
                <button
                  onClick={(e) => handleDelete(e, tier.TR_Id)}
                  className="p-3 bg-white/5 hover:bg-red-600 rounded-xl text-white transition-colors border-none cursor-pointer"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <div className="flex justify-between items-start mb-10">
                <div className="w-16 h-16 bg-blue-600/10 rounded-2xl flex items-center justify-center text-blue-500 border border-blue-500/20 shadow-inner group-hover:bg-blue-600 group-hover:text-white transition-all">
                  {tier.TR_Type === "CLIENT" ? (
                    <Users size={32} />
                  ) : tier.TR_Type === "FOURNISSEUR" ? (
                    <Briefcase size={32} />
                  ) : (
                    <Building size={32} />
                  )}
                </div>
                <ChevronRight
                  size={24}
                  className="text-slate-800 group-hover:text-blue-500 mt-5 group-hover:translate-x-2 transition-transform"
                />
              </div>

              <h3 className="text-3xl font-black uppercase italic mb-8 group-hover:text-blue-400 transition-colors text-white tracking-tighter leading-none">
                {tier.TR_Name}
              </h3>

              <div className="flex items-center gap-4 border-t border-white/5 pt-8">
                <span className="text-[10px] font-black uppercase px-5 py-2 bg-blue-600/10 text-blue-400 rounded-full border border-blue-500/20 italic tracking-widest leading-none">
                  {tier.TR_Type}
                </span>
                <div className="flex-1 h-px bg-white/5"></div>
                <p className="text-[9px] font-bold text-slate-600 uppercase italic truncate max-w-37.5">
                  {tier.TR_Email || "PAS D'EMAIL SCÉLLÉ"}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-40 text-center opacity-30">
            <Users size={80} className="mx-auto text-slate-700 mb-8" />
            <p className="text-slate-500 font-black uppercase italic text-sm tracking-[0.5em]">
              Aucune partie intéressée au registre
            </p>
          </div>
        )}
      </div>

      {/* 📄 VOLET DE DÉTAIL 360° (SLIDE-OVER) */}
      {isDetailOpen && selectedTier && (
        <div className="fixed inset-0 z-150 flex justify-end">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-2xl animate-in fade-in duration-500"
            onClick={() => setIsDetailOpen(false)}
          />
          <div className="relative w-full max-w-2xl bg-[#0B0F1A] border-l border-white/10 h-full p-16 shadow-4xl animate-in slide-in-from-right duration-700 overflow-y-auto italic text-left">
            <button
              onClick={() => setIsDetailOpen(false)}
              className="absolute top-10 right-10 text-slate-500 hover:text-white transition-colors border-none bg-transparent cursor-pointer"
            >
              <X size={40} />
            </button>

            <div className="mb-16">
              <div className="flex items-center gap-4 text-blue-500 mb-4">
                <Activity size={20} />
                <span className="font-black uppercase text-[11px] tracking-[0.5em] italic">
                  Intelligence Parties Intéressées
                </span>
              </div>
              <h2 className="text-6xl font-black uppercase italic mt-2 text-white leading-none tracking-tighter">
                {selectedTier.TR_Name}
              </h2>
              <div className="flex items-center gap-4 mt-6">
                <Mail size={16} className="text-slate-600" />
                <p className="text-slate-400 text-sm font-bold">
                  {selectedTier.TR_Email || "contact@non-defini.sn"}
                </p>
              </div>
            </div>

            <div className="space-y-12">
              {/* KPIs SPÉCIFIQUES AU TIERS */}
              <div className="grid grid-cols-2 gap-8">
                <div className="bg-white/5 border border-white/5 p-10 rounded-[3rem] shadow-inner group hover:border-blue-500/30 transition-all">
                  <MessageSquare
                    className="text-blue-500 mb-6 group-hover:scale-110 transition-transform"
                    size={32}
                  />
                  <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-2 italic">
                    Réclamations / NC
                  </p>
                  <p className="text-5xl font-black italic text-white tracking-tighter">
                    {selectedTier.stats?.reclamations || 0}
                  </p>
                </div>
                <div className="bg-white/5 border border-white/5 p-10 rounded-[3rem] shadow-inner group hover:border-emerald-500/30 transition-all">
                  <Target
                    className="text-emerald-500 mb-6 group-hover:scale-110 transition-transform"
                    size={32}
                  />
                  <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-2 italic">
                    Actions SMI
                  </p>
                  <p className="text-5xl font-black italic text-white tracking-tighter">
                    {selectedTier.stats?.actions || 0}
                  </p>
                </div>
              </div>

              {/* TERMINAL D'ACTIONS RAPIDES */}
              <div className="space-y-6 pt-12 border-t border-white/10">
                <h4 className="text-[11px] font-black uppercase text-slate-600 ml-4 tracking-[0.3em] mb-6 italic">
                  Terminal de pilotage connecté
                </h4>
                <button
                  onClick={() => handleQuickAction("reclamation")}
                  className="w-full flex items-center justify-between p-8 bg-blue-600/10 border border-blue-500/20 rounded-4xl hover:bg-blue-600 hover:text-white transition-all group shadow-xl border-none cursor-pointer text-blue-500"
                >
                  <span className="text-xs font-black uppercase italic tracking-widest">
                    Saisir une réclamation client
                  </span>
                  <Plus
                    size={20}
                    className="group-hover:rotate-90 transition-transform"
                  />
                </button>
                <button
                  onClick={() => handleQuickAction("action")}
                  className="w-full flex items-center justify-between p-8 bg-white/5 border border-white/5 rounded-4xl hover:bg-emerald-600 hover:text-white transition-all group shadow-xl border-none cursor-pointer text-slate-400"
                >
                  <span className="text-xs font-black uppercase italic tracking-widest">
                    Lancer une action préventive
                  </span>
                  <Target
                    size={20}
                    className="group-hover:scale-125 transition-transform"
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 📝 MODAL DE Saisie / ÉDITION (NEON-SOVEREIGN) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-200 bg-black/95 backdrop-blur-2xl flex items-center justify-center p-6 text-left">
          <form
            onSubmit={handleSubmit}
            className="bg-[#0B0F1A] border border-white/10 p-16 rounded-[4rem] w-full max-w-2xl shadow-4xl relative animate-in zoom-in-95 duration-500 italic"
          >
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="absolute top-12 right-12 text-slate-500 hover:text-white transition-colors border-none bg-transparent cursor-pointer"
            >
              <X size={40} />
            </button>
            <div className="mb-12">
              <h2 className="text-5xl font-black uppercase italic text-white leading-none tracking-tighter">
                Registre <span className="text-blue-500">Tiers</span>
              </h2>
              <p className="text-[10px] font-black uppercase text-slate-500 tracking-[0.4em] mt-4 italic">
                Indexation de Partie Intéressée ISO §4.2
              </p>
            </div>

            <div className="space-y-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase text-slate-500 ml-6 italic tracking-widest">
                  Raison Sociale / Nom *
                </label>
                <input
                  required
                  className="w-full p-8 bg-white/5 border border-white/10 rounded-4xl text-sm text-white outline-none focus:border-blue-500 uppercase font-black italic shadow-inner"
                  value={form.TR_Name}
                  onChange={(e) =>
                    setForm({ ...form, TR_Name: e.target.value.toUpperCase() })
                  }
                  placeholder="EX: QUALISOFT INTERNATIONAL"
                />
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase text-slate-500 ml-6 italic tracking-widest">
                  Email de contact principal
                </label>
                <input
                  type="email"
                  className="w-full p-8 bg-white/5 border border-white/10 rounded-4xl text-sm text-white outline-none focus:border-blue-500 font-black italic shadow-inner"
                  value={form.TR_Email}
                  onChange={(e) =>
                    setForm({ ...form, TR_Email: e.target.value })
                  }
                  placeholder="contact@entreprise.sn"
                />
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase text-slate-500 ml-6 italic tracking-widest">
                  Catégorie Stratégique *
                </label>
                <select
                  required
                  className="w-full p-8 bg-white/5 border border-white/10 rounded-4xl text-sm text-white outline-none font-black italic cursor-pointer focus:border-blue-500 shadow-inner"
                  value={form.TR_Type}
                  onChange={(e) =>
                    setForm({ ...form, TR_Type: e.target.value })
                  }
                >
                  <option value="CLIENT">CLIENT</option>
                  <option value="FOURNISSEUR">FOURNISSEUR</option>
                  <option value="PARTENAIRE">PARTENAIRE STRATÉGIQUE</option>
                  <option value="ETAT">ÉTAT / ADMINISTRATION</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-8 mt-6 bg-blue-600 hover:bg-blue-500 text-white rounded-[2.5rem] uppercase font-black italic text-xs tracking-[0.4em] shadow-4xl transition-all border-none cursor-pointer active:scale-95"
              >
                {editingId
                  ? "Mettre à jour le registre"
                  : "Valider dans le registre Master"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
