/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * 👥 MODULE : src/app/(dashboard)/tiers/page.tsx
 * -------------------------------------------------------------------------
 * RÔLE : Centralisation du registre des tiers (Parties Intéressées).
 * FONCTION : Monitoring 360°, pilotage des réclamations et suivi des actions.
 * CONFORMITÉ : ISO 9001/14001 §4.2 (Besoins et attentes des PI).
 * SÉCURITÉ : Zéro NextAuth. Synchronisation Master via apiClient.
 * DATE DE RÉVISION : 02 Mars 2026 | 16:15 GMT
 * -------------------------------------------------------------------------
 */

"use client";

import React, { useCallback, useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import apiClient from "@/core/api/api-client";
import {
  Activity, Briefcase, Building, ChevronRight, Edit3, Loader2, Mail,
  MessageSquare, Plus, Search, ShieldCheck, Target, Trash2, Users, X
} from "lucide-react";
import { toast, Toaster } from "sonner";

export default function TiersPage() {
  const router = useRouter();

  // --- ÉTATS ---
  const [tiers, setTiers] = useState<any[]>([]);
  const [selectedTier, setSelectedTier] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [form, setForm] = useState({
    TR_Name: "",
    TR_Email: "",
    TR_Type: "CLIENT",
  });

  // --- LOGIQUE API ---
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get("/tiers");
      setTiers(Array.isArray(res.data) ? res.data : (res.data?.data || []));
    } catch (e) {
      toast.error("Échec de synchronisation du registre des tiers.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openDetail = async (id: string) => {
    try {
      const res = await apiClient.get(`/tiers/${id}`);
      setSelectedTier(res.data?.data || res.data);
      setIsDetailOpen(true);
    } catch (e) {
      toast.error("Impossible d'extraire le profil complet.");
    }
  };

  const handleEdit = (e: React.MouseEvent, tier: any) => {
    e.stopPropagation();
    setEditingId(tier.TR_Id);
    setForm({
      TR_Name: tier.TR_Name,
      TR_Email: tier.TR_Email || "",
      TR_Type: tier.TR_Type,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm("⚠️ RÉVOCATION : Confirmer la suppression définitive ?")) return;
    try {
      await apiClient.delete(`/tiers/${id}`);
      toast.success("Tiers révoqué avec succès.");
      fetchData();
    } catch (e) {
      toast.error("Erreur : Ce tiers est lié à des enregistrements SMI.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const tid = toast.loading("Scellage du registre...");
    try {
      const payload = { ...form, TR_Name: form.TR_Name.toUpperCase() };
      if (editingId) {
        await apiClient.patch(`/tiers/${editingId}`, payload);
        toast.success("Mise à jour scellée.", { id: tid });
      } else {
        await apiClient.post("/tiers", payload);
        toast.success("Nouveau tiers enregistré.", { id: tid });
      }
      setIsModalOpen(false);
      fetchData();
    } catch (e) {
      toast.error("Erreur d'écriture dans le registre Master.", { id: tid });
    }
  };

  const filteredTiers = useMemo(() => {
    return tiers.filter(t => 
      t.TR_Name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.TR_Type.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [tiers, searchTerm]);

  if (loading && tiers.length === 0) return (
    <div className="ml-0 lg:ml-72 h-screen flex flex-col items-center justify-center bg-[#0B0F1A] gap-6 text-blue-500 italic">
      <Loader2 className="animate-spin w-12 h-12" />
      <span className="font-black uppercase tracking-[0.5em] text-[10px] animate-pulse">Intelligence Tiers en cours...</span>
    </div>
  );

  return (
    <div className="p-4 lg:p-10 bg-[#0B0F1A] min-h-screen ml-0 lg:ml-72 text-white italic font-sans flex flex-col items-center overflow-x-hidden">
      <Toaster position="top-right" richColors theme="dark" />
      
      {/* 🔝 HEADER */}
      <header className="mb-10 border-b border-white/5 pb-8 flex flex-col sm:flex-row justify-between items-start sm:items-end w-full max-w-7xl gap-6">
        <div className="text-left space-y-4">
          <div className="flex items-center gap-3 text-blue-500 font-black uppercase text-[10px] tracking-widest leading-none m-0">
            <ShieldCheck size={16} /> Qualisoft Sovereign Security
          </div>
          <h1 className="text-4xl lg:text-5xl font-black uppercase tracking-tighter italic leading-none m-0">
            Intelligence <span className="text-blue-500">Tiers</span>
          </h1>
          <p className="text-slate-500 font-bold text-[10px] lg:text-[11px] uppercase tracking-[0.4em] italic leading-none opacity-70 m-0">
            Parties Intéressées (§4.2)
          </p>
        </div>
        <button onClick={() => { setEditingId(null); setForm({ TR_Name: "", TR_Email: "", TR_Type: "CLIENT" }); setIsModalOpen(true); }} className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 px-8 py-4 rounded-2xl font-black uppercase italic text-xs flex items-center justify-center gap-4 transition-all border-none cursor-pointer text-white shadow-xl">
          <Plus size={18} strokeWidth={3} /> NOUVEAU TIERS
        </button>
      </header>

      {/* 🔍 SEARCH */}
      <div className="mb-10 w-full max-w-7xl relative">
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
        <input type="text" placeholder="RECHERCHER DANS LE REGISTRE..." className="w-full bg-slate-900/40 border border-white/5 rounded-2xl lg:rounded-4xl py-6 pl-16 pr-6 text-xs font-black placeholder:text-slate-700 outline-none focus:border-blue-500/50 transition-all uppercase italic shadow-inner" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
      </div>

      

      {/* 📋 GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-10 w-full max-w-7xl">
        {filteredTiers.map((tier) => (
          <div key={tier.TR_Id} onClick={() => openDetail(tier.TR_Id)} className="bg-slate-900/40 border border-white/5 p-8 rounded-[3rem] relative group hover:border-blue-500/40 transition-all duration-500 cursor-pointer backdrop-blur-3xl overflow-hidden shadow-lg">
            <div className="absolute top-6 right-6 flex gap-2 opacity-0 group-hover:opacity-100 transition-all z-10">
              <button onClick={(e) => handleEdit(e, tier)} className="p-2.5 bg-white/5 hover:bg-blue-600 rounded-xl text-white transition-colors border-none cursor-pointer"><Edit3 size={14} /></button>
              <button onClick={(e) => handleDelete(e, tier.TR_Id)} className="p-2.5 bg-white/5 hover:bg-red-600 rounded-xl text-white transition-colors border-none cursor-pointer"><Trash2 size={14} /></button>
            </div>
            <div className="flex justify-between items-start mb-8">
              <div className="w-14 h-14 bg-blue-600/10 rounded-2xl flex items-center justify-center text-blue-500 border border-blue-500/20 group-hover:bg-blue-600 group-hover:text-white transition-all">
                {tier.TR_Type === "CLIENT" ? <Users size={28} /> : tier.TR_Type === "FOURNISSEUR" ? <Briefcase size={28} /> : <Building size={28} />}
              </div>
              <ChevronRight size={20} className="text-slate-800 group-hover:text-blue-500 mt-4 group-hover:translate-x-2 transition-transform" />
            </div>
            <h3 className="text-2xl font-black uppercase italic mb-6 m-0 text-white tracking-tighter leading-none truncate">{tier.TR_Name}</h3>
            <div className="flex items-center gap-3 border-t border-white/5 pt-6">
              <span className="text-[9px] font-black uppercase px-4 py-1.5 bg-blue-600/10 text-blue-400 rounded-lg border border-blue-500/20 italic tracking-widest">{tier.TR_Type}</span>
              <p className="text-[8px] font-bold text-slate-600 uppercase italic truncate flex-1 m-0 text-right">{tier.TR_Email || "SANS EMAIL"}</p>
            </div>
          </div>
        ))}
      </div>

      {/* 📄 DETAIL DRAWER */}
      {isDetailOpen && selectedTier && (
        <div className="fixed inset-0 z-100 flex justify-end">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md animate-in fade-in" onClick={() => setIsDetailOpen(false)} />
          <div className="relative w-full max-w-xl bg-[#0B0F1A] border-l border-white/10 h-full p-10 lg:p-14 shadow-4xl animate-in slide-in-from-right overflow-y-auto">
            <button onClick={() => setIsDetailOpen(false)} className="absolute top-8 right-8 text-slate-500 hover:text-white transition-colors bg-transparent border-none cursor-pointer"><X size={32} /></button>
            <div className="mb-12">
              <h2 className="text-4xl lg:text-5xl font-black uppercase italic text-white leading-none tracking-tighter m-0">{selectedTier.TR_Name}</h2>
              <div className="flex items-center gap-3 mt-4 text-slate-400 text-xs font-bold italic"><Mail size={14}/> {selectedTier.TR_Email || "N/A"}</div>
            </div>
            <div className="grid grid-cols-2 gap-6 mb-12">
              <div className="bg-white/5 p-8 rounded-3xl text-left border border-white/5">
                <MessageSquare className="text-blue-500 mb-4" size={24} />
                <p className="text-[9px] font-black uppercase text-slate-500 italic m-0">Réclamations</p>
                <p className="text-4xl font-black italic text-white m-0 leading-none mt-2">{selectedTier.stats?.reclamations || 0}</p>
              </div>
              <div className="bg-white/5 p-8 rounded-3xl text-left border border-white/5">
                <Target className="text-emerald-500 mb-4" size={24} />
                <p className="text-[9px] font-black uppercase text-slate-500 italic m-0">Actions PAQ</p>
                <p className="text-4xl font-black italic text-white m-0 leading-none mt-2">{selectedTier.stats?.actions || 0}</p>
              </div>
            </div>
            <div className="space-y-4 border-t border-white/10 pt-10">
              <button onClick={() => router.push(`/dashboard/non-conformites?tierId=${selectedTier.TR_Id}`)} className="w-full flex justify-between p-6 bg-blue-600/10 border border-blue-500/20 rounded-2xl text-blue-500 font-black uppercase italic text-[10px] tracking-widest cursor-pointer hover:bg-blue-600 hover:text-white transition-all">Saisir Réclamation <Plus size={16}/></button>
              <button onClick={() => router.push(`/dashboard/paq?tierId=${selectedTier.TR_Id}`)} className="w-full flex justify-between p-6 bg-white/5 border border-white/5 rounded-2xl text-slate-400 font-black uppercase italic text-[10px] tracking-widest cursor-pointer hover:bg-emerald-600 hover:text-white transition-all">Action Préventive <Target size={16}/></button>
            </div>
          </div>
        </div>
      )}

      {/* 📝 FORM MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-200 bg-black/95 flex items-center justify-center p-4">
          <form onSubmit={handleSubmit} className="bg-[#0B0F1A] border border-white/10 p-10 lg:p-14 rounded-[3rem] lg:rounded-[4rem] w-full max-w-xl relative animate-in zoom-in-95">
            <button type="button" onClick={() => setIsModalOpen(false)} className="absolute top-8 right-8 text-slate-500 hover:text-white border-none bg-transparent cursor-pointer"><X size={32} /></button>
            <h2 className="text-3xl lg:text-4xl font-black uppercase italic text-white mb-10 leading-none">Registre <span className="text-blue-500">Tiers</span></h2>
            <div className="space-y-6 lg:space-y-8">
              <div className="space-y-2 text-left">
                <label className="text-[9px] font-black uppercase text-slate-500 ml-4 italic tracking-widest">Raison Sociale *</label>
                <input required className="w-full p-6 lg:p-7 bg-white/5 border border-white/10 rounded-2xl lg:rounded-3xl text-sm text-white outline-none focus:border-blue-500 uppercase font-black italic shadow-inner" value={form.TR_Name} onChange={(e) => setForm({ ...form, TR_Name: e.target.value })} />
              </div>
              <div className="space-y-2 text-left">
                <label className="text-[9px] font-black uppercase text-slate-500 ml-4 italic tracking-widest">Email Principal</label>
                <input type="email" className="w-full p-6 lg:p-7 bg-white/5 border border-white/10 rounded-2xl lg:rounded-3xl text-sm text-white outline-none focus:border-blue-500 font-black italic shadow-inner" value={form.TR_Email} onChange={(e) => setForm({ ...form, TR_Email: e.target.value })} />
              </div>
              <div className="space-y-2 text-left">
                <label className="text-[9px] font-black uppercase text-slate-500 ml-4 italic tracking-widest">Type Stratégique</label>
                <select className="w-full p-6 lg:p-7 bg-white/5 border border-white/10 rounded-2xl lg:rounded-3xl text-xs font-black italic text-white outline-none cursor-pointer focus:border-blue-500" value={form.TR_Type} onChange={(e) => setForm({ ...form, TR_Type: e.target.value })}>
                  <option value="CLIENT">CLIENT</option>
                  <option value="FOURNISSEUR">FOURNISSEUR</option>
                  <option value="PARTENAIRE">PARTENAIRE</option>
                  <option value="ETAT">ÉTAT / ADMIN</option>
                </select>
              </div>
              <button type="submit" className="w-full py-6 lg:py-8 bg-blue-600 text-white rounded-4xl lg:rounded-[2.5rem] uppercase font-black italic text-[10px] lg:text-xs tracking-widest hover:bg-blue-500 transition-all border-none cursor-pointer shadow-xl">{editingId ? "Mettre à jour" : "Valider au registre Master"}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}