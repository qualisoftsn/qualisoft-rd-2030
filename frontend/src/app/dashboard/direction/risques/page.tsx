/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useEffect, useState, useCallback } from 'react';
import apiClient from '@/core/api/api-client';
import { Printer, Eye, X, Edit3, Save, Plus, Loader2, Target, Globe } from 'lucide-react';

export default function FormalRisksPage() {
  const [risks, setRisks] = useState<any[]>([]);
  const [processus, setProcessus] = useState<any[]>([]);
  const [selectedPid, setSelectedPid] = useState<string | null>(null);
  const [selectedRisk, setSelectedRisk] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [resRisks, resProcs] = await Promise.all([
        apiClient.get('/risks/heatmap', { params: { processusId: selectedPid } }),
        apiClient.get('/processus')
      ]);
      setRisks(resRisks.data);
      setProcessus(resProcs.data);
    } catch (err) { console.error("Erreur Sync"); }
    finally { setLoading(false); }
  }, [selectedPid]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleUpdate = async () => {
    try {
      await apiClient.patch(`/risks/${selectedRisk.RS_Id}`, selectedRisk);
      setIsEditing(false); fetchData();
      alert("Risque mis à jour !");
    } catch (e) { alert("Erreur Prisma : Vérifiez les types de données."); }
  };

  // Identification des noms pour le header d'impression
  const currentTenant = risks[0]?.tenantName || "QUALISOFT CLIENT";
  const currentProcess = selectedPid 
    ? processus.find(p => p.PR_Id === selectedPid)?.PR_Libelle 
    : "VUE GLOBALE (TOUS PROCESSUS)";

  if (loading) return <div className="ml-72 flex h-screen items-center justify-center bg-[#0B0F1A] text-blue-500 font-black italic uppercase animate-pulse">Chargement Qualisoft...</div>;

  return (
    <div className="min-h-screen bg-[#0B0F1A] p-10 ml-72 text-white italic print:bg-white print:ml-0 print:p-8 print:text-black">
      
      {/* 🖨️ MOTEUR DE STYLE D'IMPRESSION */}
      <style jsx global>{`
        @media print {
          @page { size: landscape; margin: 10mm; }
          .no-print, aside, nav, button, .heatmap-ui { display: none !important; }
          .ml-72 { margin-left: 0 !important; }
          .print-header { display: flex !important; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; border-bottom: 2px solid #000; padding-bottom: 10px; }
          .print-table { width: 100% !important; border: 1px solid #000 !important; border-collapse: collapse !important; }
          .print-table th, .print-table td { border: 1px solid #000 !important; padding: 6px !important; font-size: 9px !important; color: #000 !important; font-style: normal !important; }
          .print-table th { background-color: #f0f0f0 !important; text-transform: uppercase; font-weight: bold; }
          .bg-[#0B0F1A] { background-color: white !important; }
        }
        .print-header { display: none; }
      `}</style>

      {/* HEADER D'IMPRESSION (Visible uniquement sur papier/PDF) */}
      <div className="print-header">
        <div className="text-left">
          <h2 className="text-xl font-black uppercase m-0">{currentTenant}</h2>
          <p className="text-sm font-bold m-0 italic text-gray-600">{currentProcess}</p>
        </div>
        <div className="text-right">
          <h1 className="text-2xl font-black uppercase m-0">Grille des risques</h1>
        </div>
      </div>

      {/* HEADER ECRAN (Caché à l'impression) */}
      <header className="mb-10 flex justify-between items-end border-b border-white/5 pb-8 no-print">
        <div>
          <h1 className="text-5xl font-black uppercase italic tracking-tighter">Pilotage <span className="text-blue-500">Risques</span></h1>
          <p className="text-slate-500 font-bold text-[10px] uppercase tracking-widest mt-3 italic">{currentProcess}</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => window.print()} className="bg-blue-600 px-6 py-4 rounded-2xl font-black text-[10px] flex items-center gap-2 hover:bg-blue-500 transition-all shadow-lg shadow-blue-900/40">
            <Printer size={18}/> EXPORT PDF / IMPRESSION
          </button>
          <div className="flex bg-white/5 p-2 rounded-2xl border border-white/10 gap-1">
            <button onClick={() => setSelectedPid(null)} className={`px-4 py-2 rounded-xl text-[9px] font-black transition-all ${!selectedPid ? 'bg-white/10 text-blue-400' : 'text-slate-500'}`}><Globe size={14}/></button>
            {processus.map(p => (
              <button key={p.PR_Id} onClick={() => setSelectedPid(p.PR_Id)} className={`px-4 py-2 rounded-xl text-[9px] font-black transition-all ${selectedPid === p.PR_Id ? 'bg-white/10 text-blue-400' : 'text-slate-500'}`}>{p.PR_Code}</button>
            ))}
          </div>
        </div>
      </header>

      {/* REGISTRE DES RISQUES (Format Excel) */}
      <div className="bg-slate-900/40 rounded-[3rem] border border-white/5 overflow-hidden print:border-none print:rounded-none">
        <table className="print-table w-full text-left">
          <thead>
            <tr className="bg-white/5 text-[9px] font-black uppercase italic text-slate-500 print:text-black">
              <th className="p-6">Danger / Risque</th>
              <th className="p-6">Causes & Déclencheurs</th>
              <th className="p-6 text-center">P</th>
              <th className="p-6 text-center">G</th>
              <th className="p-6 text-center">Score</th>
              <th className="p-6">Mesures Préventives (Maîtrise)</th>
              <th className="p-6 no-print text-right italic">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 print:divide-black">
            {risks.length === 0 ? (
              <tr><td colSpan={7} className="p-10 text-center text-slate-500 italic uppercase text-[10px]">Aucune donnée disponible pour ce processus</td></tr>
            ) : (
              risks.map(r => (
                <tr key={r.RS_Id} className="hover:bg-white/5 transition-colors print:hover:bg-transparent">
                  <td className="p-6"><p className="text-xs font-black uppercase italic">{r.RS_Libelle}</p></td>
                  <td className="p-6 text-[10px] text-slate-400 italic leading-relaxed print:text-black">{r.RS_Description || "-"}</td>
                  <td className="p-6 text-center text-[10px]">{r.p}</td>
                  <td className="p-6 text-center text-[10px]">{r.g}</td>
                  <td className={`p-6 text-center font-black text-xl italic ${r.score >= 12 ? 'text-red-500' : 'text-blue-500'}`}>{r.score}</td>
                  <td className="p-6 text-[10px] text-slate-400 italic print:text-black">{r.RS_Mesures || "Plan d'action requis"}</td>
                  <td className="p-6 text-right no-print">
                    <button onClick={() => setSelectedRisk(r)} className="p-3 bg-white/5 rounded-xl text-blue-500 hover:bg-blue-600 hover:text-white transition-all"><Eye size={18}/></button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL / DRAWER (Caché à l'impression) */}
      {selectedRisk && (
        <>
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-110 no-print" onClick={() => {setSelectedRisk(null); setIsEditing(false);}} />
          <div className="fixed top-0 right-0 h-screen w-137.5 bg-[#0F172A] z-120 border-l border-white/10 p-10 flex flex-col no-print italic">
            <div className="flex justify-between items-center mb-10">
              <button onClick={() => setIsEditing(!isEditing)} className="text-[10px] font-black uppercase text-blue-400 flex items-center gap-2">
                {isEditing ? <><X size={14}/> Annuler</> : <><Edit3 size={14}/> Éditer le risque</>}
              </button>
              <button onClick={() => setSelectedRisk(null)} className="p-3 bg-white/5 rounded-xl"><X size={18}/></button>
            </div>

            <div className="flex-1 space-y-8 overflow-y-auto pr-2 scrollbar-hide">
              {isEditing ? (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase text-slate-500 ml-2 italic">Intitulé du danger</label>
                    <input className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl text-xs font-bold" value={selectedRisk.RS_Libelle} onChange={e => setSelectedRisk({...selectedRisk, RS_Libelle: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase text-slate-500 ml-2 italic">Causes (Excel)</label>
                    <textarea className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl text-xs font-bold min-h-30" value={selectedRisk.RS_Description} onChange={e => setSelectedRisk({...selectedRisk, RS_Description: e.target.value})} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="text-[9px] font-black uppercase text-slate-500 ml-2">P (1-4)</label><input type="number" className="w-full bg-white/5 p-4 rounded-xl" value={selectedRisk.RS_Probabilite} onChange={e => setSelectedRisk({...selectedRisk, RS_Probabilite: e.target.value})} /></div>
                    <div><label className="text-[9px] font-black uppercase text-slate-500 ml-2">G (1-4)</label><input type="number" className="w-full bg-white/5 p-4 rounded-xl" value={selectedRisk.RS_Gravite} onChange={e => setSelectedRisk({...selectedRisk, RS_Gravite: e.target.value})} /></div>
                  </div>
                  <button onClick={handleUpdate} className="w-full py-5 bg-blue-600 rounded-3xl font-black uppercase text-xs shadow-xl"><Save size={18} className="inline mr-2"/> Enregistrer les modifications</button>
                </div>
              ) : (
                <div className="space-y-10">
                  <h2 className="text-4xl font-black uppercase leading-none italic">{selectedRisk.RS_Libelle}</h2>
                  <div className="p-8 bg-white/5 rounded-[2.5rem] border border-white/5">
                    <h4 className="text-[10px] font-black uppercase text-slate-500 mb-4 italic tracking-widest">Causes identifiées</h4>
                    <p className="text-xs font-bold leading-relaxed">{selectedRisk.RS_Description || "Non documenté"}</p>
                  </div>
                  <div className="p-8 bg-blue-600/10 rounded-[2.5rem] border border-blue-500/20">
                    <h4 className="text-[10px] font-black uppercase text-blue-400 mb-4 italic tracking-widest">Plan de Maîtrise</h4>
                    <p className="text-xs font-bold text-blue-100 leading-relaxed">{selectedRisk.RS_Mesures || "À définir"}</p>
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