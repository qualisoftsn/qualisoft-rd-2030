/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * 💡 GESTION DU REGISTRE DES RISQUES (ISO 31000)
 * --------------------------------------------
 * Rôle : Centralisation des risques par processus, calcul de criticité (Score = P x G).
 * Fonctionnalités : Impression paysage optimisée, drawer d'édition temps réel.
 */

'use client';

import React, { useEffect, useState, useCallback } from 'react';
import apiClient from '@/core/api/api-client';
import { Printer, Eye, X, Edit3, Save, Globe, Loader2, AlertTriangle, Zap } from 'lucide-react';
import { toast } from 'sonner';

// --- TYPES SCELLÉS ---
interface Processus {
  PR_Id: string;
  PR_Code: string;
  PR_Libelle: string;
}

interface Risk {
  RS_Id: string;
  RS_Libelle: string;
  RS_Description: string;
  RS_Probabilite: number;
  RS_Gravite: number;
  RS_Mesures: string;
  p: number; 
  g: number; 
  score: number; 
  tenantName?: string;
}

export default function FormalRisksPage() {
  const [risks, setRisks] = useState<Risk[]>([]);
  const [processus, setProcessus] = useState<Processus[]>([]);
  const [selectedPid, setSelectedPid] = useState<string | null>(null);
  const [selectedRisk, setSelectedRisk] = useState<Risk | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  /**
   * 📡 SYNCHRONISATION DES FLUX DE RISQUES
   * Charge les données en fonction du filtre processus sélectionné.
   */
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [resRisks, resProcs] = await Promise.all([
        apiClient.get<Risk[]>('/risks/heatmap', { params: { processusId: selectedPid } }),
        apiClient.get<Processus[]>('/processus')
      ]);
      setRisks(resRisks.data);
      setProcessus(resProcs.data);
    } catch (err) { 
      console.error("❌ Erreur de synchronisation", err);
      toast.error("Impossible de synchroniser le registre des risques.");
    } finally { 
      setLoading(false); 
    }
  }, [selectedPid]);

  useEffect(() => { 
    fetchData(); 
  }, [fetchData]);

  /**
   * 💾 PERSISTANCE DES MODIFICATIONS
   * Met à jour l'occurrence et la gravité pour recalculer le score Matrix.
   */
  const handleUpdate = async () => {
    if (!selectedRisk) return;
    try {
      await apiClient.patch(`/risks/${selectedRisk.RS_Id}`, {
        RS_Libelle: selectedRisk.RS_Libelle,
        RS_Description: selectedRisk.RS_Description,
        RS_Probabilite: Number(selectedRisk.RS_Probabilite),
        RS_Gravite: Number(selectedRisk.RS_Gravite)
      });
      setIsEditing(false); 
      fetchData();
      toast.success("Registre mis à jour avec succès !");
    } catch (e) { 
      console.error(e);
      toast.error("Erreur Prisma : Vérifiez l'intégrité des données (P & G)."); 
    }
  };

  // Méta-données dynamiques pour le rendu PDF
  const currentTenant = risks[0]?.tenantName || "QUALISOFT SMI NODE";
  const currentProcess = selectedPid 
    ? processus.find(p => p.PR_Id === selectedPid)?.PR_Libelle 
    : "VUE GLOBALE (TOUS PROCESSUS)";

  if (loading) return (
    <div className="ml-72 flex h-screen items-center justify-center bg-[#0B0F1A] text-blue-500 font-black italic uppercase animate-pulse">
      <Loader2 className="mr-3 animate-spin" size={24}/> Synchronisation Qualisoft...
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0B0F1A] p-10 ml-72 text-white italic print:bg-white print:ml-0 print:p-8 print:text-black selection:bg-blue-500/30">
      
      {/* 🖨️ MOTEUR D'IMPRESSION HAUTE FIDÉLITÉ (ISO compliance) */}
      <style jsx global>{`
        @media print {
          @page { size: landscape; margin: 10mm; }
          .no-print, aside, nav, button, .heatmap-ui { display: none !important; }
          .ml-72 { margin-left: 0 !important; }
          .print-header { display: flex !important; justify-content: space-between; align-items: flex-start; margin-bottom: 25px; border-bottom: 3px solid #000; padding-bottom: 12px; }
          .print-table { width: 100% !important; border: 2px solid #000 !important; border-collapse: collapse !important; }
          .print-table th, .print-table td { border: 1px solid #000 !important; padding: 10px !important; font-size: 10px !important; color: #000 !important; font-style: normal !important; text-transform: none !important; }
          .print-table th { background-color: #e5e7eb !important; text-transform: uppercase !important; font-weight: 900 !important; }
          .bg-[#0B0F1A] { background-color: white !important; }
        }
        .print-header { display: none; }
      `}</style>

      {/* RENDER D'IMPRESSION */}
      <div className="print-header">
        <div className="text-left">
          <h2 className="text-2xl font-black uppercase m-0">{currentTenant}</h2>
          <p className="text-sm font-bold m-0 italic text-slate-600 uppercase tracking-widest">{currentProcess}</p>
        </div>
        <div className="text-right">
          <h1 className="text-3xl font-black uppercase m-0">Grille des risques & Opportunités</h1>
          <p className="text-xs font-bold text-slate-500 italic uppercase">Généré le {new Date().toLocaleDateString()}</p>
        </div>
      </div>

      {/* 🖥️ HEADER INTERFACE (No-Print) */}
      <header className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-white/5 pb-8 no-print">
        <div className="text-left">
          <h1 className="text-4xl font-black uppercase italic tracking-tighter leading-none">Pilotage <span className="text-blue-500">Risques</span></h1>
          <p className="text-slate-500 font-bold text-[10px] uppercase tracking-widest mt-3 italic">{currentProcess}</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <button onClick={() => window.print()} className="bg-blue-600 px-6 py-4 rounded-2xl font-black text-[10px] flex items-center justify-center gap-2 hover:bg-blue-500 transition-all shadow-lg shadow-blue-900/40 cursor-pointer border-none text-white italic uppercase">
            <Printer size={18}/> EXPORT PDF SÉCURISÉ
          </button>
          
          {/* BARRE DE FILTRAGE PROCESSUS (Scrolable) */}
          <div className="flex bg-white/5 p-2 rounded-2xl border border-white/10 gap-1 overflow-x-auto max-w-[50vw] custom-scrollbar backdrop-blur-md">
            <button 
              onClick={() => setSelectedPid(null)} 
              className={`px-4 py-2 rounded-xl text-[9px] font-black transition-all cursor-pointer whitespace-nowrap border-none italic uppercase ${!selectedPid ? 'bg-white/10 text-blue-400' : 'text-slate-500 hover:text-white'}`}
            >
              <Globe size={14} className="mr-1 inline" /> Global
            </button>
            {processus.map(p => (
              <button 
                key={p.PR_Id} 
                onClick={() => setSelectedPid(p.PR_Id)} 
                className={`px-4 py-2 rounded-xl text-[9px] font-black transition-all cursor-pointer whitespace-nowrap border-none italic uppercase ${selectedPid === p.PR_Id ? 'bg-white/10 text-blue-400' : 'text-slate-500 hover:text-white'}`}
              >
                {p.PR_Code}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* 📊 REGISTRE DES RISQUES (Tableau Excel-Style) */}
      <div className="bg-slate-900/40 rounded-[3rem] border border-white/5 overflow-hidden print:border-none print:rounded-none shadow-2xl backdrop-blur-xl group">
        <table className="print-table w-full text-left border-collapse">
          <thead>
            <tr className="bg-white/5 text-[10px] font-black uppercase italic text-slate-500 print:text-black">
              <th className="p-8">Danger / Risque</th>
              <th className="p-8">Causes & Déclencheurs</th>
              <th className="p-8 text-center">P</th>
              <th className="p-8 text-center">G</th>
              <th className="p-8 text-center">Score</th>
              <th className="p-8">Mesures Préventives (Maîtrise)</th>
              <th className="p-8 no-print text-right italic">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 print:divide-black">
            {risks.length === 0 ? (
              <tr><td colSpan={7} className="p-20 text-center text-slate-600 italic uppercase text-xs font-black tracking-widest">Aucune donnée indexée pour ce périmètre</td></tr>
            ) : (
              risks.map(r => (
                <tr key={r.RS_Id} className="hover:bg-white/5 transition-all print:hover:bg-transparent group/row">
                  <td className="p-8"><p className="text-xs font-black uppercase italic tracking-tight text-white leading-tight">{r.RS_Libelle}</p></td>
                  <td className="p-8 text-[11px] text-slate-400 italic leading-relaxed print:text-black max-w-xs">{r.RS_Description || "-"}</td>
                  <td className="p-8 text-center text-[11px] font-black text-white">{r.p || r.RS_Probabilite}</td>
                  <td className="p-8 text-center text-[11px] font-black text-white">{r.g || r.RS_Gravite}</td>
                  <td className={`p-8 text-center font-black text-2xl italic tracking-tighter ${r.score >= 12 ? 'text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.3)]' : r.score >= 8 ? 'text-orange-500' : 'text-emerald-500'}`}>
                    {r.score || (r.RS_Probabilite * r.RS_Gravite)}
                  </td>
                  <td className="p-8 text-[11px] text-slate-400 italic print:text-black leading-relaxed">{r.RS_Mesures || "Action requise"}</td>
                  <td className="p-8 text-right no-print">
                    <button 
                      onClick={() => setSelectedRisk(r)} 
                      className="p-4 bg-white/5 rounded-2xl text-blue-500 hover:bg-blue-600 hover:text-white transition-all cursor-pointer border-none shadow-lg group-hover/row:scale-110"
                    >
                      <Eye size={20}/>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* 🪟 MODAL DRAWER : FOCUS ANALYTIQUE */}
      {selectedRisk && (
        <>
          <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-100 no-print animate-in fade-in duration-300" onClick={() => {setSelectedRisk(null); setIsEditing(false);}} />
          <div className="fixed top-0 right-0 h-screen w-full md:w-140 bg-[#0F172A] z-110 border-l border-white/10 p-12 flex flex-col no-print italic shadow-[ -20px_0_60px_rgba(0,0,0,0.5)] animate-in slide-in-from-right duration-500">
            
            <div className="flex justify-between items-center mb-12">
              <button 
                onClick={() => setIsEditing(!isEditing)} 
                className="text-[10px] font-black uppercase text-blue-400 flex items-center gap-2 cursor-pointer hover:text-blue-300 transition-colors border-none bg-transparent italic"
              >
                {isEditing ? <><X size={16}/> Annuler l&apos;édition</> : <><Edit3 size={16}/> Éditer le risque</>}
              </button>
              <button 
                onClick={() => {setSelectedRisk(null); setIsEditing(false);}} 
                className="p-4 bg-white/5 hover:bg-red-500/20 hover:text-red-500 rounded-2xl cursor-pointer transition-all border-none text-slate-400"
              >
                <X size={20}/>
              </button>
            </div>

            <div className="flex-1 space-y-10 overflow-y-auto pr-2 custom-scrollbar text-left">
              {isEditing ? (
                <div className="space-y-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase text-slate-500 ml-2 italic tracking-widest">Intitulé du danger</label>
                    <input 
                      className="w-full bg-white/5 border border-white/10 p-6 rounded-3xl text-sm font-black italic text-white outline-none focus:border-blue-500 transition-all" 
                      value={selectedRisk.RS_Libelle} 
                      onChange={e => setSelectedRisk({...selectedRisk, RS_Libelle: e.target.value})} 
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase text-slate-500 ml-2 italic tracking-widest">Facteurs & Déclencheurs</label>
                    <textarea 
                      className="w-full bg-white/5 border border-white/10 p-6 rounded-3xl text-sm font-black italic text-white min-h-40 outline-none focus:border-blue-500 transition-all resize-none leading-relaxed" 
                      value={selectedRisk.RS_Description || ''} 
                      onChange={e => setSelectedRisk({...selectedRisk, RS_Description: e.target.value})} 
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase text-slate-500 ml-2 italic">Probabilité (1-4)</label>
                      <input 
                        type="number" min="1" max="4"
                        className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl outline-none focus:border-blue-500 text-center font-black text-xl italic text-white" 
                        value={selectedRisk.RS_Probabilite} 
                        onChange={e => setSelectedRisk({...selectedRisk, RS_Probabilite: Number(e.target.value)})} 
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase text-slate-500 ml-2 italic">Gravité (1-4)</label>
                      <input 
                        type="number" min="1" max="4"
                        className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl outline-none focus:border-blue-500 text-center font-black text-xl italic text-white" 
                        value={selectedRisk.RS_Gravite} 
                        onChange={e => setSelectedRisk({...selectedRisk, RS_Gravite: Number(e.target.value)})} 
                      />
                    </div>
                  </div>
                  
                  <div className="p-6 bg-blue-500/10 rounded-3xl flex items-center justify-between border border-blue-500/20 shadow-inner">
                    <span className="text-[11px] font-black uppercase text-blue-400 tracking-widest">Score Prévisionnel PxG</span>
                    <span className={`text-3xl font-black italic ${(selectedRisk.RS_Probabilite * selectedRisk.RS_Gravite) >= 12 ? 'text-red-500' : 'text-blue-500'}`}>
                      {selectedRisk.RS_Probabilite * selectedRisk.RS_Gravite}
                    </span>
                  </div>

                  <button 
                    onClick={handleUpdate} 
                    className="w-full py-6 bg-blue-600 hover:bg-blue-500 text-white rounded-[2.5rem] font-black uppercase italic text-[11px] shadow-2xl transition-all cursor-pointer flex items-center justify-center gap-3 border-none tracking-[0.2em]"
                  >
                    <Save size={20} /> Appliquer les modifications
                  </button>
                </div>
              ) : (
                <div className="space-y-12">
                  <h2 className="text-5xl font-black uppercase leading-none italic tracking-tighter text-white">{selectedRisk.RS_Libelle}</h2>
                  
                  <div className="flex gap-4">
                     <div className="px-6 py-3 bg-white/5 rounded-2xl border border-white/10 text-[11px] font-black uppercase text-slate-400 italic">
                        Occurrence : <span className="text-white ml-2 text-lg">{selectedRisk.p || selectedRisk.RS_Probabilite}/4</span>
                     </div>
                     <div className="px-6 py-3 bg-white/5 rounded-2xl border border-white/10 text-[11px] font-black uppercase text-slate-400 italic">
                        Gravité : <span className="text-white ml-2 text-lg">{selectedRisk.g || selectedRisk.RS_Gravite}/4</span>
                     </div>
                  </div>

                  <div className="p-10 bg-white/5 rounded-[3.5rem] border border-white/5 shadow-inner">
                    <h4 className="text-[11px] font-black uppercase text-slate-500 mb-6 italic tracking-[0.3em] flex items-center gap-2">
                       <AlertTriangle size={14} /> Facteurs de Risques
                    </h4>
                    <p className="text-sm font-bold text-slate-200 leading-relaxed normal-case italic">
                       {selectedRisk.RS_Description || "Aucune description détaillée n'a été indexée pour ce risque."}
                    </p>
                  </div>

                  <div className="p-10 bg-blue-600/10 rounded-[3.5rem] border border-blue-500/20 shadow-inner relative overflow-hidden">
                    <Zap className="absolute top-0 right-0 p-4 opacity-5 text-blue-500" size={100} />
                    <h4 className="text-[11px] font-black uppercase text-blue-400 mb-6 italic tracking-[0.3em]">Stratégie de Maîtrise</h4>
                    <p className="text-sm font-bold text-blue-100 leading-relaxed normal-case italic relative z-10">
                       {selectedRisk.RS_Mesures || "Plan d'atténuation en cours de définition stratégique."}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}