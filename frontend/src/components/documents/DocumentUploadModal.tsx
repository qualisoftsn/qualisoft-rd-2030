/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useEffect } from 'react';
import apiClient from '@/core/api/api-client';
import { X, Upload, File, Loader2, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';

interface Props {
  onClose: () => void;
  onSuccess: () => void;
}

export default function DocumentUploadModal({ onClose, onSuccess }: Props) {
  const [loading, setLoading] = useState(false);
  const [processus, setProcessus] = useState<any[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  const [formData, setFormData] = useState({
    DOC_Title: '',
    DOC_Description: '',
    DOC_Category: 'PROCEDURE',
    DOC_ProcessusId: '',
    DOC_SiteId: ''
  });

  // 🔄 Charger les processus pour le "Lien Fort" requis par le SMI
  useEffect(() => {
    apiClient.get('/processus')
      .then(res => setProcessus(Array.isArray(res.data) ? res.data : []))
      .catch(err => console.error("Erreur chargement processus:", err));
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      // Pré-remplissage du titre avec le nom du fichier (sans extension)
      if (!formData.DOC_Title) {
        setFormData(prev => ({ ...prev, DOC_Title: file.name.split('.')[0] }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    setLoading(true);

    // 📦 Préparation du FormData pour l'envoi Multipart (Binaire + JSON)
    const data = new FormData();
    data.append('file', selectedFile);
    data.append('DOC_Title', formData.DOC_Title);
    data.append('DOC_Description', formData.DOC_Description);
    data.append('DOC_Category', formData.DOC_Category);
    data.append('DOC_ProcessusId', formData.DOC_ProcessusId);

    try {
      // 🚀 Envoi vers l'endpoint d'upload physique
      await apiClient.post('/documents/upload', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error("Erreur Upload GED:", err);
      alert(err.response?.data?.message || "Erreur lors de l'indexation du document.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-xl z-100 flex items-center justify-center p-4">
      <div className="bg-[#0F172A] w-full max-w-3xl rounded-[3rem] shadow-2xl border border-white/10 overflow-hidden animate-in zoom-in duration-300">
        
        {/* HEADER */}
        <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/5">
          <div>
            <h2 className="text-2xl font-black italic uppercase tracking-tighter text-white">
              Indexation <span className="text-blue-500">Documentaire</span>
            </h2>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1 italic">Qualisoft RD 2030 • Coffre-fort numérique</p>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-white/10 rounded-full text-slate-400 transition-all">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-10 space-y-8">
          
          {/* DROPZONE DYNAMIQUE */}
          <div className="relative group">
            <input 
              type="file" 
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20" 
              onChange={handleFileChange}
              required={!selectedFile}
            />
            <div className={`border-2 border-dashed rounded-[2.5rem] p-10 text-center transition-all duration-300 ${
              selectedFile ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-white/10 bg-white/5 group-hover:border-blue-500/40'
            }`}>
              {selectedFile ? (
                <div className="flex items-center justify-center gap-6 animate-in fade-in duration-500">
                  <div className="w-16 h-16 bg-emerald-500/20 rounded-2xl flex items-center justify-center text-emerald-500">
                    <CheckCircle2 size={32} />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-black text-white uppercase italic truncate max-w-75">{selectedFile.name}</p>
                    <p className="text-[10px] font-bold text-slate-500 uppercase">
                      {(selectedFile.size / 1024).toFixed(1)} KB • Prêt pour le versionnage V1.0
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="w-16 h-16 bg-blue-600/20 rounded-2xl flex items-center justify-center mx-auto text-blue-500 shadow-lg">
                    <Upload size={28} />
                  </div>
                  <div>
                    <p className="text-xs font-black uppercase text-slate-300 tracking-widest italic">Sélectionnez le fichier source</p>
                    <p className="text-[9px] text-slate-500 uppercase mt-2 tracking-tighter">Format PDF, Word ou Excel autorisé (Max 10MB)</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* COLONNE GAUCHE : IDENTITÉ */}
            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 ml-2 italic">Titre Qualité</label>
                <input 
                  type="text"
                  className="w-full bg-white/5 border border-white/5 rounded-2xl p-4 text-sm font-bold text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  value={formData.DOC_Title}
                  onChange={(e) => setFormData({...formData, DOC_Title: e.target.value})}
                  placeholder="Nom officiel du document"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 ml-2 italic">Type de document</label>
                <select 
                  className="w-full bg-[#161e31] border border-white/5 rounded-2xl p-4 text-sm font-bold text-white outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.DOC_Category}
                  onChange={(e) => setFormData({...formData, DOC_Category: e.target.value})}
                >
                  <option value="PROCEDURE">Procédure Opérationnelle</option>
                  <option value="MANUEL">Manuel SMI / Qualité</option>
                  <option value="ENREGISTREMENT">Enregistrement (Preuve)</option>
                  <option value="CONSIGNE">Consigne de Sécurité</option>
                  <option value="RAPPORT">Rapport d&apos;Audit / Revue</option>
                </select>
              </div>
            </div>

            {/* COLONNE DROITE : RATTACHEMENT */}
            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 ml-2 italic">Processus lié</label>
                <select 
                  className="w-full bg-[#161e31] border border-white/5 rounded-2xl p-4 text-sm font-bold text-white outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.DOC_ProcessusId}
                  onChange={(e) => setFormData({...formData, DOC_ProcessusId: e.target.value})}
                  required
                >
                  <option value="">-- Choisir un processus --</option>
                  {processus.map((p) => (
                    <option key={p.PR_Id} value={p.PR_Id}>{p.PR_Libelle}</option>
                  ))}
                </select>
              </div>

              <div className="p-5 bg-blue-600/5 border border-blue-500/20 rounded-4xl flex gap-4">
                 <AlertCircle size={20} className="text-blue-500 shrink-0" />
                 <p className="text-[9px] text-slate-500 leading-relaxed font-bold italic uppercase tracking-tighter">
                    Conformité ISO : Tout nouveau document est injecté en statut <span className="text-blue-400">BROUILLON</span>. 
                    Il devra passer par le circuit de validation pour devenir <span className="text-emerald-500">APPROUVÉ</span>.
                 </p>
              </div>
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading || !selectedFile}
            className="w-full bg-blue-600 text-white p-6 rounded-4xl font-black uppercase tracking-[0.3em] italic flex items-center justify-center gap-4 hover:bg-blue-500 transition-all shadow-2xl shadow-blue-900/40 disabled:opacity-20 disabled:cursor-not-allowed group"
          >
            {loading ? (
              <Loader2 className="animate-spin" />
            ) : (
              <>
                <ShieldCheck size={20} className="group-hover:scale-110 transition-transform" />
                <span>Indexer et Archiver (V1.0)</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}