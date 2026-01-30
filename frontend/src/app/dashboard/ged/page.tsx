/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import apiClient from '@/core/api/api-client';
import { 
  FileText, Plus, Search, FolderTree, 
  Download, History, ShieldCheck, Loader2, 
  Archive, MoreVertical, LayoutGrid, List,
  Clock, User, Eye, CheckCircle2, AlertCircle,
  Lock, FileBarChart, Calendar, 
  ChevronRight, X, QrCode, Share2, FileUp
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'react-hot-toast';

export default function GEDPage() {
  const [docs, setDocs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDoc, setSelectedDoc] = useState<any | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({ category: 'ALL', status: 'ALL' });

  const fetchDocs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/documents/iso');
      setDocs(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      toast.error("Synchronisation GED interrompue (§7.5)");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchDocs(); }, [fetchDocs]);

  const filteredDocs = useMemo(() => {
    return docs.filter(doc => {
      const matchesSearch = doc.metadata.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          doc.metadata.reference.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCat = filters.category === 'ALL' || doc.metadata.category === filters.category;
      const matchesStat = filters.status === 'ALL' || doc.status === filters.status;
      return matchesSearch && matchesCat && matchesStat;
    });
  }, [docs, searchQuery, filters]);

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-[#0B0F1A] ml-72 font-black italic text-blue-500 uppercase tracking-widest">
      <Loader2 className="animate-spin mr-3" /> Lecture du Référentiel Documentaire...
    </div>
  );

  return (
    <div className="flex-1 bg-[#0B0F1A] min-h-screen p-8 ml-72 text-white relative">
      <div className="max-w-7xl mx-auto space-y-8">
        <header className="flex justify-between items-end border-b border-white/10 pb-8">
          <div>
            <h1 className="text-5xl font-black uppercase italic tracking-tighter">
              Maîtrise <span className="text-blue-500">Documentaire</span>
            </h1>
            <p className="text-slate-500 font-bold text-[10px] uppercase tracking-[0.3em] mt-2 italic">
              ISO 9001:2015 §7.5 Information Documentée
            </p>
          </div>
          <button 
            onClick={() => setIsUploadModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-2xl font-black uppercase italic text-xs shadow-xl shadow-blue-500/20 flex items-center gap-3 transition-all active:scale-95"
          >
            <Plus size={20} /> Nouveau Document
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 bg-white/5 p-4 rounded-3xl border border-white/10">
          <div className="lg:col-span-2 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input 
              className="w-full bg-black/20 border border-white/5 rounded-xl py-3 pl-12 pr-4 text-sm font-bold outline-none focus:border-blue-500 transition-all"
              placeholder="Chercher une référence ou un titre..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
          <select 
            className="bg-black/20 border border-white/5 rounded-xl px-4 py-3 text-xs font-bold uppercase outline-none text-slate-400"
            onChange={e => setFilters({...filters, category: e.target.value})}
          >
            <option value="ALL">Toutes Catégories</option>
            <option value="PROCEDURE">PROCÉDURE</option>
            <option value="MANUEL">MANUEL</option>
            <option value="ENREGISTREMENT">ENREGISTREMENT</option>
          </select>
          <div className="flex bg-black/20 rounded-xl p-1 border border-white/5">
            <button onClick={() => setViewMode('grid')} className={`flex-1 flex justify-center py-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-blue-600' : 'text-slate-500'}`}><LayoutGrid size={18}/></button>
            <button onClick={() => setViewMode('list')} className={`flex-1 flex justify-center py-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-blue-600' : 'text-slate-500'}`}><List size={18}/></button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-20">
          {filteredDocs.map(doc => (
            <div 
              key={doc.DOC_Id} 
              onClick={() => setSelectedDoc(doc)}
              className="bg-white/5 border border-white/5 rounded-[2.5rem] p-8 hover:border-blue-500/30 transition-all cursor-pointer group relative overflow-hidden"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="p-4 bg-blue-500/10 rounded-2xl text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-all shadow-lg">
                  <FileText size={24} />
                </div>
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{doc.metadata.reference}</span>
              </div>
              <h3 className="text-xl font-black uppercase italic leading-tight mb-2 line-clamp-2">{doc.metadata.title}</h3>
              <div className="flex items-center gap-3 text-[9px] font-bold text-slate-500 uppercase italic">
                <span className="px-2 py-0.5 bg-white/10 rounded">V{doc.metadata.version}</span>
                <span>•</span>
                <span className="text-blue-400">{doc.metadata.author}</span>
              </div>
              <div className="mt-8 flex justify-between items-center">
                <span className={`text-[9px] font-black uppercase px-3 py-1 rounded-full border ${
                  doc.status === 'APPROUVE' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                }`}>
                  {doc.status}
                </span>
                <ChevronRight size={18} className="text-slate-700 group-hover:translate-x-1 group-hover:text-blue-500 transition-all" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {isUploadModalOpen && (
        <DocumentUploadModal onClose={() => setIsUploadModalOpen(false)} onSuccess={fetchDocs} />
      )}

      {selectedDoc && (
        <div className="fixed inset-0 z-100 flex justify-end">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setSelectedDoc(null)} />
          <div className="relative w-full max-w-xl bg-[#0B0F1A] border-l border-white/10 h-full p-10 shadow-2xl animate-in slide-in-from-right duration-300 overflow-y-auto">
            <button onClick={() => setSelectedDoc(null)} className="absolute top-10 right-10 text-slate-500 hover:text-white"><X size={32}/></button>
            <div className="mb-10 mt-6">
              <span className="text-blue-500 font-black uppercase text-[10px] tracking-widest italic">{selectedDoc.metadata.reference}</span>
              <h2 className="text-4xl font-black uppercase italic mt-2 leading-none">{selectedDoc.metadata.title}</h2>
            </div>
            
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <InfoItem label="Processus" value={selectedDoc.metadata.processus} />
                <InfoItem label="Catégorie" value={selectedDoc.metadata.category} />
                <InfoItem label="Conservation" value={`${selectedDoc.metadata.retentionPeriod} Ans`} />
                <InfoItem label="Dernière Modif." value={format(new Date(selectedDoc.metadata.modificationDate), 'dd/MM/yyyy')} />
              </div>
              <div className="p-6 bg-white/5 rounded-3xl border border-white/5 space-y-4">
                <h4 className="text-[10px] font-black text-slate-500 uppercase italic">Contrôle de Version (§7.5.3)</h4>
                <div className="space-y-3 text-xs font-bold uppercase italic">
                  <p className="flex justify-between">Auteur <span className="text-blue-400">{selectedDoc.metadata.author}</span></p>
                  <p className="flex justify-between">Status Document <span className="text-emerald-500">{selectedDoc.status}</span></p>
                </div>
              </div>
              <button className="w-full py-5 bg-blue-600 hover:bg-blue-500 rounded-2xl font-black uppercase text-xs italic flex items-center justify-center gap-3 transition-all shadow-xl shadow-blue-900/40">
                <Download size={18} /> Télécharger Version V{selectedDoc.metadata.version}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DocumentUploadModal({ onClose, onSuccess }: any) {
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  
  // ✅ CLÉS SYNCHRONISÉES AVEC PRISMA
  const [formData, setFormData] = useState({
    DOC_Title: '',
    DOC_Reference: '',
    DOC_Category: 'PROCEDURE',
    DOC_Description: '',
    DOC_ReviewFrequencyMonths: 12
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return toast.error("Pièce jointe obligatoire");

    setLoading(true);
    const data = new FormData();
    data.append('file', file);
    data.append('metadata', JSON.stringify(formData));

    try {
      await apiClient.post('/documents/upload-iso', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success("Certifié & Téléversé");
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Erreur critique de transmission");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/95 backdrop-blur-xl z-200 flex items-center justify-center p-6">
      <div className="bg-[#0B0F1A] border border-white/10 p-12 rounded-[3rem] w-full max-w-3xl relative shadow-4xl animate-in zoom-in-95 duration-300 italic font-bold">
        <button onClick={onClose} className="absolute top-10 right-10 text-slate-500 hover:text-white"><X size={32}/></button>
        <h2 className="text-4xl font-black uppercase italic mb-8 tracking-tighter">Initialisation <span className="text-blue-600 italic">Documentaire</span></h2>
        
        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="space-y-1">
              <label className="text-[10px] text-slate-500 uppercase ml-2 italic font-black">Référence Normative</label>
              <input required className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl text-xs uppercase outline-none focus:border-blue-500" 
                value={formData.DOC_Reference} onChange={e => setFormData({...formData, DOC_Reference: e.target.value.toUpperCase()})} />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-slate-500 uppercase ml-2 italic font-black">Titre (DOC_Title)</label>
              <input required className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl text-xs uppercase outline-none focus:border-blue-500" 
                value={formData.DOC_Title} onChange={e => setFormData({...formData, DOC_Title: e.target.value})} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <select className="bg-white/5 border border-white/10 p-4 rounded-2xl text-[10px] uppercase outline-none" value={formData.DOC_Category} onChange={e => setFormData({...formData, DOC_Category: e.target.value as any})}>
                <option value="PROCEDURE">PROCÉDURE</option>
                <option value="MANUEL">MANUEL</option>
                <option value="ENREGISTREMENT">ENREGISTREMENT</option>
              </select>
              <input type="number" className="bg-white/5 border border-white/10 p-4 rounded-2xl text-[10px] uppercase" 
                value={formData.DOC_ReviewFrequencyMonths} onChange={e => setFormData({...formData, DOC_ReviewFrequencyMonths: parseInt(e.target.value)})} />
            </div>
          </div>

          <div className="space-y-6">
            <div className="relative group">
              <input type="file" id="file-upload" className="hidden" onChange={e => e.target.files && setFile(e.target.files[0])} />
              <label htmlFor="file-upload" className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-white/10 rounded-3xl hover:border-blue-500 transition-all cursor-pointer">
                <FileUp size={40} className={file ? "text-emerald-500" : "text-slate-600"} />
                <p className="text-[10px] font-black uppercase mt-4 text-center">{file ? file.name : "Joindre Fichier ISO"}</p>
              </label>
            </div>
            <textarea className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl text-xs uppercase h-20 outline-none" placeholder="Notes de révision..." 
              value={formData.DOC_Description} onChange={e => setFormData({...formData, DOC_Description: e.target.value})} />
            <button type="submit" disabled={loading} className="w-full py-6 bg-blue-600 rounded-3xl font-black uppercase text-xs italic flex items-center justify-center gap-3">
              {loading ? <Loader2 className="animate-spin" /> : <><ShieldCheck size={20}/> Valider le Dépôt</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function InfoItem({ label, value }: any) {
  return (
    <div className="bg-white/2 p-4 rounded-2xl border border-white/5 italic">
      <p className="text-[8px] text-slate-500 uppercase font-black mb-1">{label}</p>
      <p className="text-xs font-black text-white uppercase truncate">{value || 'NON DÉFINI'}</p>
    </div>
  );
}