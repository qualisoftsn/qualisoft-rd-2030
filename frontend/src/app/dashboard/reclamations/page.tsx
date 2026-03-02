/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 📋 MODULE : ReclamationsPage.tsx
 * -------------------------------------------------------------------------
 * RÔLE : Pilotage du registre des réclamations tiers (§8.2.1 ISO 9001).
 * FIX : Stabilisation du typage de réponse API (Array vs Object Wrapper).
 * RÉVISION : 02 Mars 2026 | 19:15 GMT
 */

"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { toast } from 'sonner';
import { Plus, RefreshCcw, FileText, Filter, Search } from 'lucide-react';
import apiClient from '@/core/api/api-client';
import ReclamationList from '@/components/reclamations/ReclamationList';
import ReclamationForm from '@/components/reclamations/ReclamationForm';
import Modal from '@/components/shared/Modal';

// 🔱 INTERFACE SCELLÉE
interface Reclamation {
  REC_Id: string;
  REC_Reference: string;
  REC_Object: string;
  REC_Status: string;
  REC_DateReceipt: string;
  REC_Tier?: { TR_Name: string };
}

export default function ReclamationsPage() {
  const [reclamations, setReclamations] = useState<Reclamation[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  /**
   * 📡 SYNCHRONISATION KERNEL
   * On accepte Reclamation[] ou { data: Reclamation[] } pour parer toute variation du backend.
   */
  const fetchReclamations = useCallback(async () => {
    setLoading(true);
    try {
      // ✅ FIX TYPE ERROR : On utilise 'any' sur la réponse brute pour le filtrage dynamique
      const res = await apiClient.get<any>('/reclamations');
      
      // Logique de déballage sécurisée
      const rawData = res.data;
      const finalData = Array.isArray(rawData) 
        ? rawData 
        : (Array.isArray(rawData?.data) ? rawData.data : []);

      setReclamations(finalData);
    } catch (err) {
      toast.error('ÉCHEC KERNEL : Impossible de synchroniser le registre ISO 10002');
      setReclamations([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReclamations();
  }, [fetchReclamations]);

  return (
    <div className="space-y-10 animate-in fade-in duration-700 italic font-sans text-left">
      
      {/* 🚀 HEADER DE PILOTAGE */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black text-white uppercase tracking-tighter m-0 italic">
            Registre <span className="text-blue-500 underline decoration-white/10">Réclamations</span>
          </h1>
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em] mt-4 m-0">
            Monitoring des signaux tiers • ISO 9001:2015
          </p>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={() => fetchReclamations()}
            className="p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-slate-400 hover:text-blue-500 transition-all cursor-pointer"
          >
            <RefreshCcw size={20} className={loading ? 'animate-spin' : ''} />
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="px-8 py-4 bg-blue-600 hover:bg-white hover:text-blue-600 text-white rounded-2xl text-[10px] font-black uppercase italic tracking-widest transition-all shadow-3xl shadow-blue-900/20 flex items-center gap-3 border-none cursor-pointer"
          >
            <Plus size={16} strokeWidth={3} /> Nouvel Ecart
          </button>
        </div>
      </header>

      {/* 🔍 BARRE DE RECHERCHE MATRIX */}
      <div className="relative group">
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={20} />
        <input 
          type="text"
          placeholder="Filtrer par référence, client ou objet..."
          className="w-full bg-white/5 border border-white/10 rounded-4xl p-6 pl-16 text-sm font-bold text-white outline-none focus:border-blue-600 focus:bg-white/10 transition-all italic shadow-inner"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* 📋 LISTE DES DOSSIERS SCELLÉS */}
      <div className="relative">
        {loading && (
          <div className="absolute inset-0 bg-[#0B0F1A]/50 backdrop-blur-sm z-10 flex items-center justify-center rounded-[3rem]">
            <div className="flex flex-col items-center gap-4">
               <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
               <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest italic">Chargement du flux...</p>
            </div>
          </div>
        )}
        <ReclamationList 
          reclamations={reclamations.filter(r => 
            r.REC_Reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.REC_Object?.toLowerCase().includes(searchTerm.toLowerCase())
          )} 
        />
      </div>

      {/* 📦 MODAL D'INDEXATION */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Déclarer une Réclamation"
      >
        <ReclamationForm 
          onSuccess={() => {
            setIsModalOpen(false);
            fetchReclamations();
          }} 
          processus={[]} // À injecter via un fetch parallèle si besoin
          tiers={[]}     // À injecter via un fetch parallèle si besoin
        />
      </Modal>

      {/* FOOTER DE CONFORMITÉ */}
      <footer className="pt-10 flex items-center gap-4 border-t border-white/5">
        <FileText size={16} className="text-slate-700" />
        <p className="text-[9px] font-black text-slate-700 uppercase tracking-widest m-0">
          Système de management de la satisfaction client • Scellé au Tenant Matrix RD-2026
        </p>
      </footer>
    </div>
  );
}