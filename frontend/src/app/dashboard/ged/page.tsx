/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import apiClient from '@/core/api/api-client';
import DocumentUploadModal from '@/components/documents/DocumentUploadModal';
import { 
  FileText, Plus, Search, FolderTree, 
  Download, History, ShieldCheck, Loader2, 
  Archive, MoreVertical, LayoutGrid, List
} from 'lucide-react';

export default function GEDPage() {
  const [docs, setDocs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // 🔄 Chargement des documents
  const fetchDocs = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/documents');
      setDocs(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Erreur GED:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchDocs(); }, [fetchDocs]);

  // 🔍 LOGIQUE DE RECHERCHE OPTIMISÉE (useMemo pour la performance)
  const filteredDocs = useMemo(() => {
    return docs.filter(doc => {
      // 1. On normalise tout en minuscules pour ignorer la casse
      const title = (doc.DOC_Title || "").toLowerCase();
      const search = searchQuery.toLowerCase();
      
      // 2. Vérification des critères
      const matchesSearch = title.includes(search);
      const matchesCategory = filter === 'ALL' || doc.DOC_Category === filter;

      return matchesSearch && matchesCategory;
    });
  }, [docs, searchQuery, filter]);

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'APPROUVE': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'EN_REVUE': return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
      default: return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
    }
  };

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-[#0B0F1A] ml-72 font-black italic text-blue-500 uppercase">
       Synchronisation du coffre-fort...
    </div>
  );

  return (
    <div className="flex-1 bg-[#0B0F1A] min-h-screen p-8 ml-72 text-white">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* HEADER */}
        <header className="flex justify-between items-end border-b border-white/5 pb-8">
          <div>
            <h1 className="text-5xl font-black uppercase italic tracking-tighter text-white">
                Explorateur <span className="text-blue-500">GED</span>
            </h1>
            <p className="text-slate-500 font-bold text-[10px] uppercase tracking-[0.3em] mt-3 italic">
              Management de l&apos;Information Documentée
            </p>
          </div>
          <div className="flex gap-4">
            {/* 🔍 BARRE DE RECHERCHE CORRIGÉE */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
              <input 
                type="text"
                placeholder="Rechercher par titre..."
                className="bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500 transition-all w-80 text-white"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)} // Capture immédiate
              />
            </div>
            <button 
              onClick={() => setIsUploadModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-2xl font-black uppercase italic text-xs shadow-lg shadow-blue-500/20 flex items-center gap-3 transition-all"
            >
              <Plus size={20} /> Nouveau Document
            </button>
          </div>
        </header>

        {/* FILTRES CATÉGORIES */}
        <div className="flex gap-2 bg-white/5 p-2 rounded-4xl border border-white/5 w-fit">
          {['ALL', 'PROCEDURE', 'MANUEL', 'ENREGISTREMENT'].map((cat) => (
            <button 
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-6 py-3 rounded-xl text-[9px] font-black uppercase italic transition-all ${
                filter === cat ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-white hover:bg-white/5'
              }`}
            >
              {cat === 'ALL' ? 'Tout' : cat}
            </button>
          ))}
        </div>

        {/* GRID DE DOCUMENTS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredDocs.length > 0 ? (
            filteredDocs.map((doc) => (
              <div key={doc.DOC_Id} className="group bg-slate-900/40 border border-white/5 p-8 rounded-[40px] hover:border-blue-500/30 transition-all relative overflow-hidden">
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-6">
                    <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase italic border ${getStatusStyle(doc.DOC_Status)}`}>
                      {doc.DOC_Status}
                    </span>
                    <button className="text-slate-600 hover:text-white transition-colors"><MoreVertical size={18}/></button>
                  </div>

                  <h3 className="text-xl font-black uppercase italic tracking-tight mb-2 group-hover:text-blue-400 transition-colors leading-tight min-h-14">
                    {doc.DOC_Title}
                  </h3>
                  
                  <div className="space-y-3 mb-8">
                    <p className="text-slate-500 text-[9px] font-black uppercase flex items-center gap-2">
                       <FolderTree size={14} className="text-blue-500" /> {doc.DOC_Processus?.PR_Libelle || 'Non classé'}
                    </p>
                    <p className="text-slate-500 text-[9px] font-black uppercase flex items-center gap-2">
                       <History size={14} className="text-blue-500" /> Version {doc.DOC_CurrentVersion}.0
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <button className="flex-1 bg-white/5 hover:bg-blue-600 py-4 rounded-2xl flex items-center justify-center gap-3 transition-all text-[10px] font-black uppercase italic">
                      <Download size={16} /> Ouvrir
                    </button>
                    <button className="p-4 bg-white/5 hover:bg-white/10 rounded-2xl text-slate-500 transition-all">
                      <ShieldCheck size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-32 text-center bg-slate-900/20 rounded-[4rem] border-2 border-dashed border-white/5">
              <FileText className="mx-auto text-slate-800 mb-6" size={80} />
              <p className="text-slate-500 font-black uppercase italic text-sm tracking-[0.2em]">
                {searchQuery ? `Aucun résultat pour "${searchQuery}"` : "La bibliothèque est vide"}
              </p>
            </div>
          )}
        </div>
      </div>

      {isUploadModalOpen && (
        <DocumentUploadModal 
          onClose={() => setIsUploadModalOpen(false)} 
          onSuccess={() => fetchDocs()} 
        />
      )}
    </div>
  );
}