/* NOM ABSOLU : src/app/dashboard/quality/surveys/scanner/page.tsx
   FONCTION : Analyseur de flux de réponses et détection automatique des insatisfactions
   CORRECTIF : Suppression du useMemo conflictuel (Optimisation Native)
*/

'use client';

import React, { useState } from 'react';
import { 
  Search, AlertOctagon, RefreshCcw, User, 
  Truck, HeartHandshake, CheckCircle, 
  Users
} from 'lucide-react';
import { toast } from 'react-hot-toast';

// --- 1. DÉFINITION SCELLÉE DES TYPES (Locale pour stabilité immédiate) ---
type SurveyTarget = 'CLIENT' | 'SUPPLIER' | 'EMPLOYEE';

interface SurveyResult {
  RES_Id: string;
  RES_Score: number;
  RES_Comment: string;
  RES_Respondent: string;
  RES_Date: string;
  RES_Status: 'PENDING' | 'PROCESSED'; // Traité ou En attente
  RES_Target: SurveyTarget;
}

// --- 2. DONNÉES RÉELLES SIMULÉES (MOCK DATA) ---
const MOCK_RESULTS: SurveyResult[] = [
  { RES_Id: 'R-1024', RES_Score: 9, RES_Comment: "Livraison parfaite, respect des délais ISO.", RES_Respondent: "Société SENELEC", RES_Date: "2026-02-10", RES_Status: 'PROCESSED', RES_Target: 'CLIENT' },
  { RES_Id: 'R-1025', RES_Score: 3, RES_Comment: "Retard critique sur la commande de câblage. Inacceptable.", RES_Respondent: "Fournisseur BTP-SA", RES_Date: "2026-02-09", RES_Status: 'PENDING', RES_Target: 'SUPPLIER' },
  { RES_Id: 'R-1026', RES_Score: 7, RES_Comment: "Ambiance correcte mais manque de formation sécurité.", RES_Respondent: "Anonyme", RES_Date: "2026-02-08", RES_Status: 'PENDING', RES_Target: 'EMPLOYEE' },
  { RES_Id: 'R-1027', RES_Score: 4, RES_Comment: "Le support technique ne répond pas aux tickets.", RES_Respondent: "Clinique Pasteur", RES_Date: "2026-02-08", RES_Status: 'PENDING', RES_Target: 'CLIENT' },
];

export default function SurveyResultScanner() {
  const [filter, setFilter] = useState<'ALL' | SurveyTarget>('ALL');
  const [results, setResults] = useState<SurveyResult[]>(MOCK_RESULTS);
  const [searchTerm, setSearchTerm] = useState('');

  // Configuration Visuelle Dynamique
  const targetConfig = {
    CLIENT: { color: 'text-emerald-500', bg: 'bg-emerald-500/10', icon: <HeartHandshake size={14} />, label: 'CLIENT' },
    SUPPLIER: { color: 'text-blue-500', bg: 'bg-blue-500/10', icon: <Truck size={14} />, label: 'FOURNISSEUR' },
    EMPLOYEE: { color: 'text-purple-500', bg: 'bg-purple-500/10', icon: <Users size={14} />, label: 'COLLABORATEUR' }
  };

  // --- LOGIQUE DE FILTRAGE (CORRIGÉE : Native JS sans useMemo) ---
  // Le compilateur React gère l'optimisation automatiquement ici.
  const filteredResults = results.filter(r => {
    const matchesTarget = filter === 'ALL' || r.RES_Target === filter;
    const matchesSearch = r.RES_Respondent.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          r.RES_Comment.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          r.RES_Id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTarget && matchesSearch;
  });

  // Action : Transformer en Non-Conformité
  const handleConvertToNC = (id: string) => {
    toast.loading("Génération de la Fiche de Non-Conformité...");
    setTimeout(() => {
        toast.dismiss();
        toast.success(`Fiche NC créée pour le retour ${id}`);
        // Mise à jour locale pour marquer comme traité
        setResults(prev => prev.map(r => r.RES_Id === id ? { ...r, RES_Status: 'PROCESSED' } : r));
    }, 1000);
  };

  return (
    <div className="p-10 bg-[#0B0F1A] min-h-screen ml-72 text-white italic font-sans selection:bg-blue-600/30">
      
      {/* 🛰️ HEADER SCANNER */}
      <header className="mb-12 border-b border-white/5 pb-10 flex justify-between items-end">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 mb-2">
            Analyse des Données de Sortie §9.1.3
          </p>
          <h1 className="text-3xl font-black uppercase italic tracking-tighter leading-none">
            Result <span className="text-amber-500">Scanner</span>
          </h1>
        </div>
        
        <div className="flex gap-4">
            <div className="bg-black/20 border border-white/10 px-6 py-4 rounded-2xl flex items-center gap-4">
                <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Flux Entrant</span>
                <span className="flex items-center gap-2 text-emerald-500 font-black italic"><div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"/> Actif</span>
            </div>
        </div>
      </header>

      {/* 🧭 FILTRES INTELLIGENTS */}
      <div className="flex justify-between items-center mb-10">
         <div className="flex gap-4 bg-white/5 p-2 rounded-4xl border border-white/10">
            <button onClick={() => setFilter('ALL')} className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${filter === 'ALL' ? 'bg-white text-slate-900 shadow-xl' : 'text-slate-500 hover:text-white'}`}>Global</button>
            <button onClick={() => setFilter('CLIENT')} className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${filter === 'CLIENT' ? 'bg-emerald-600 text-white shadow-xl' : 'text-slate-500 hover:text-emerald-500'}`}>Clients</button>
            <button onClick={() => setFilter('SUPPLIER')} className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${filter === 'SUPPLIER' ? 'bg-blue-600 text-white shadow-xl' : 'text-slate-500 hover:text-blue-500'}`}>Fournisseurs</button>
            <button onClick={() => setFilter('EMPLOYEE')} className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${filter === 'EMPLOYEE' ? 'bg-purple-600 text-white shadow-xl' : 'text-slate-500 hover:text-purple-500'}`}>RH</button>
         </div>
         
         <div className="relative w-96">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="RECHERCHER PAR ID OU MOT-CLÉ..." 
              className="w-full bg-slate-900/60 border border-white/10 rounded-4xl pl-16 pr-6 py-4 text-[11px] font-black uppercase text-white outline-none focus:border-amber-500 transition-all placeholder-slate-700"
            />
         </div>
      </div>

      {/* 📊 GRILLE DE RÉSULTATS */}
      <div className="grid grid-cols-1 gap-6">
         {filteredResults.map((res) => {
            const isCritical = res.RES_Score < 5;
            // Sécurité si le type est inconnu
            const config = targetConfig[res.RES_Target] || targetConfig.CLIENT;

            return (
              <div key={res.RES_Id} className={`relative overflow-hidden rounded-[3rem] p-10 transition-all hover:scale-[1.01] ${isCritical ? 'bg-rose-900/10 border border-rose-500/30' : 'bg-slate-900/40 border border-white/5'}`}>
                 
                 {/* BANDEAU LATÉRAL COULEUR */}
                 <div className={`absolute left-0 top-0 bottom-0 w-3 ${isCritical ? 'bg-rose-500' : 'bg-emerald-500'}`} />

                 <div className="flex justify-between items-start">
                    <div className="space-y-4">
                       <div className="flex items-center gap-4">
                          <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-2 border ${config.bg.replace('/10', '/20')} ${config.color} border-white/5`}>
                             {config.icon} {config.label}
                          </span>
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">ID: {res.RES_Id}</span>
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">• {res.RES_Date}</span>
                       </div>
                       
                       <h3 className="text-2xl font-black italic text-white max-w-4xl leading-relaxed">
                          &quot;{res.RES_Comment}&quot;
                       </h3>
                       
                       <div className="flex items-center gap-3 text-[11px] font-black uppercase text-slate-400 tracking-widest">
                          <User size={14} /> Répondant : <span className="text-white">{res.RES_Respondent}</span>
                       </div>
                    </div>

                    {/* BLOC SCORE & ACTION */}
                    <div className="flex flex-col items-end gap-6">
                       <div className={`w-24 h-24 rounded-4xl flex flex-col items-center justify-center border shadow-2xl ${isCritical ? 'bg-rose-500 text-white border-rose-400' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'}`}>
                          <span className="text-4xl font-black italic">{res.RES_Score}</span>
                          <span className="text-[9px] font-black">/10</span>
                       </div>

                       {isCritical && res.RES_Status === 'PENDING' && (
                          <button 
                            onClick={() => handleConvertToNC(res.RES_Id)}
                            className="flex items-center gap-3 px-6 py-4 bg-rose-600 hover:bg-rose-500 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg hover:shadow-rose-500/20 transition-all border-none cursor-pointer"
                          >
                             <AlertOctagon size={16} /> Ouvrir une NC
                          </button>
                       )}
                       
                       {res.RES_Status === 'PROCESSED' && (
                          <div className="flex items-center gap-2 px-6 py-3 bg-white/5 rounded-2xl border border-white/10 text-slate-400 text-[10px] font-black uppercase italic">
                             <CheckCircle size={14} className="text-emerald-500" /> Traité
                          </div>
                       )}
                    </div>
                 </div>
              </div>
            );
         })}

         {filteredResults.length === 0 && (
            <div className="py-20 text-center border-2 border-dashed border-white/5 rounded-[3rem]">
               <RefreshCcw className="mx-auto text-slate-700 mb-4" size={48} />
               <p className="text-slate-600 font-black uppercase italic tracking-[0.3em]">Aucun résultat à analyser pour ce filtre</p>
            </div>
         )}
      </div>
    </div>
  );
}