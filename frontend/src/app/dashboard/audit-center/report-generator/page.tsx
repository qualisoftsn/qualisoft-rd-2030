/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * 💡 MODULE : GÉNÉRATEUR DE RAPPORTS SDE (elite-sde)
 * -------------------------------------------------------------------------
 * RÔLE : Production de rapports PDF d'Audit normatifs (ISO 9001, etc.).
 * FIX : UI ClickUp 100dvh (Zéro Scroll Global), PWA Ready (retrait ml-72).
 * SÉCURITÉ : Validation API stricte (`Array.isArray`). Zéro NextAuth.
 * -------------------------------------------------------------------------
 * DATE : 05 Mars 2026 | 00:30 GMT
 */

'use client';

import React, { useEffect, useState, useCallback } from 'react';
import apiClient from '@/core/api/api-client';
import type { LucideIcon } from 'lucide-react';
import { 
  FileText, Download, Printer, Users, Target, CheckCircle, 
  AlertTriangle, ChevronDown, Search, Loader2, Leaf, RefreshCw, Calendar
} from 'lucide-react';
import { toast, Toaster } from 'sonner';

// --- INTERFACES STRICTES ---
interface AuditLead {
  U_FirstName?: string;
  U_LastName?: string;
}

interface Audit {
  AU_Id: string;
  AU_Reference: string;
  AU_Title: string;
  AU_Scope: string;
  AU_Type: string;
  AU_Status: string;
  AU_DateAudit: string;
  AU_Lead?: AuditLead;
  AU_NonConformites?: unknown[];
}

interface TemplateOption {
  id: string;
  label: string;
  icon: LucideIcon;
  color: string;
}

export default function ReportGeneratorPage() {
  const [audits, setAudits] = useState<Audit[]>([]);
  const [templates] = useState<TemplateOption[]>([
    { id: 'ISO_9001', label: 'ISO 9001:2015 - Qualité', icon: Target, color: 'text-blue-500' },
    { id: 'ISO_14001', label: 'ISO 14001:2015 - Environnement', icon: Leaf, color: 'text-emerald-500' },
    { id: 'LEGAL_SENEGAL', label: 'Conformité Légale Sénégal', icon: FileText, color: 'text-amber-500' },
    { id: 'NON_CONFORMITE', label: 'Rapport de Non-Conformité', icon: AlertTriangle, color: 'text-red-500' },
    { id: 'REVUE_DIRECTION', label: 'Revue de Direction', icon: Users, color: 'text-purple-500' }
  ]);
  const [selectedAudit, setSelectedAudit] = useState<string>('');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('ISO_9001');
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('ALL');

  const fetchAudits = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/audits').catch(() => ({ data: [] }));
      const auditsData = res.data?.data || res.data;
      setAudits(Array.isArray(auditsData) ? auditsData : []);
    } catch (error) {
      toast.error('Erreur lors de la synchronisation des audits');
      setAudits([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAudits();
  }, [fetchAudits]);

  const handleGenerateReport = async () => {
    if (!selectedAudit) {
      toast.error('Veuillez sélectionner un audit dans la liste');
      return;
    }
    
    setGenerating(true);
    const tid = toast.loading("Génération du rapport en cours... (patientez)");
    try {
      const response = await apiClient.post('/audit-report/generate', {
        auditId: selectedAudit,
        template: selectedTemplate
      }, { 
        responseType: 'blob',
        timeout: 60000 
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data as BlobPart]));
      const link = document.createElement('a');
      const audit = audits.find(a => a.AU_Id === selectedAudit);
      const templateName = templates.find(t => t.id === selectedTemplate)?.label || 'Rapport';
      const dateStr = new Date().toISOString().split('T')[0];
      
      link.href = url;
      link.setAttribute('download', `${templateName.replace(/\s+/g, '_')}_${audit?.AU_Reference || 'audit'}_${dateStr}.pdf`);
      document.body.appendChild(link);
      link.click();
      
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('Rapport compilé et téléchargé avec succès !', { id: tid });
      
    } catch (error: any) {
      if (error.code === 'ECONNABORTED') {
        toast.error('Le délai de génération a expiré. Réessayez.', { id: tid });
      } else if (error.response?.status === 404) {
        toast.error('Audit non localisé dans la base.', { id: tid });
      } else {
        toast.error(error.response?.data?.message || 'Erreur critique lors de la génération', { id: tid });
      }
    } finally {
      setGenerating(false);
    }
  };

  const filteredAudits = audits.filter(audit => {
    const title = audit.AU_Title || '';
    const ref = audit.AU_Reference || '';
    const scope = audit.AU_Scope || '';

    const matchesSearch = 
      ref.toLowerCase().includes(searchTerm.toLowerCase()) ||
      title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      scope.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'ALL' || audit.AU_Type === filterType;
    return matchesSearch && matchesType;
  });

  if (loading && audits.length === 0) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center bg-[#0B0F1A] gap-6 text-white italic">
        <Loader2 className="animate-spin text-purple-500" size={48} strokeWidth={3} />
        <span className="text-purple-400 font-black uppercase tracking-[0.5em] md:tracking-[1em] text-[10px] md:text-xs animate-pulse m-0">
          Chargement des audits...
        </span>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-[#0B0F1A] italic font-sans overflow-hidden text-white w-full selection:bg-purple-500/30">
      <Toaster position="top-right" richColors theme="dark" />

      {/* 🔝 EN-TÊTE FIXE */}
      <header className="shrink-0 p-6 md:p-8 lg:p-12 border-b border-white/5 bg-[#0B0F1A]/90 backdrop-blur-md z-20 flex flex-col gap-6 md:gap-8">
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-6 md:gap-8 animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="flex items-center gap-4 md:gap-6 min-w-0">
            <div className="bg-linear-to-br from-purple-600 to-indigo-700 p-4 md:p-5 rounded-2xl md:rounded-3xl shadow-lg shadow-purple-900/40 shrink-0">
              <FileText size={32} className="text-white md:w-10 md:h-10" />
            </div>
            <div className="min-w-0">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-black uppercase italic tracking-tighter m-0 leading-none truncate">
                Générateur de <span className="text-purple-500">Rapports</span>
              </h1>
              <p className="text-slate-500 font-bold text-[8px] md:text-[9px] uppercase tracking-[0.3em] md:tracking-[0.4em] mt-2 md:mt-3 italic m-0 truncate">
                Rapports d&apos;Audit • Certification • Conformité Légale
              </p>
            </div>
          </div>
          
          <button 
            onClick={fetchAudits}
            className="bg-[#0F172A] border border-white/10 hover:bg-white hover:text-slate-900 text-white px-6 md:px-8 py-4 md:py-5 rounded-2xl md:rounded-3xl font-black uppercase text-[9px] md:text-[10px] tracking-widest flex items-center justify-center gap-3 transition-all cursor-pointer shadow-xl active:scale-95 w-full xl:w-auto shrink-0 m-0"
          >
            <RefreshCw size={16} className="md:w-5 md:h-5" /> Actualiser
          </button>
        </div>

        {/* 🔍 FILTRES */}
        <div className="flex flex-col md:flex-row gap-4 md:gap-6 bg-[#0F172A] p-3 md:p-4 rounded-2xl md:rounded-3xl border border-white/5 shadow-inner animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="relative flex-1">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 md:w-5 md:h-5" size={18} />
            <input
              type="text"
              placeholder="Rechercher un audit..."
              className="w-full bg-[#0B0F1A] border border-white/10 rounded-xl md:rounded-2xl pl-12 pr-6 py-3 md:py-4 text-[10px] md:text-xs font-black uppercase text-white outline-none focus:border-purple-500 transition-all placeholder:text-slate-600 italic shadow-inner tracking-widest"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="relative w-full md:w-auto md:min-w-62.5 shrink-0">
             <select
               value={filterType}
               onChange={(e) => setFilterType(e.target.value)}
               className="w-full bg-[#0B0F1A] border border-white/10 rounded-xl md:rounded-2xl px-6 py-3 md:py-4 text-[9px] md:text-[10px] font-black uppercase italic text-slate-400 focus:border-purple-500 outline-none cursor-pointer transition-colors shadow-inner appearance-none tracking-widest"
             >
               <option value="ALL" className="bg-[#0B0F1A]">Tous les types</option>
               <option value="INTERNE" className="bg-[#0B0F1A]">Audit Interne</option>
               <option value="EXTERNE" className="bg-[#0B0F1A]">Audit Externe</option>
               <option value="CERTIFICATION" className="bg-[#0B0F1A]">Certification</option>
               <option value="SURVEILLANCE" className="bg-[#0B0F1A]">Surveillance</option>
             </select>
             <ChevronDown size={16} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none md:w-5 md:h-5" />
          </div>
        </div>
      </header>

      {/* 📜 ZONE DE DÉFILEMENT */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-8 lg:p-12">
        <div className="max-w-400 mx-auto space-y-8 md:space-y-12">
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
            
            {/* COLONNE GAUCHE: SÉLECTION AUDIT */}
            <div className="bg-[#0F172A]/80 border border-white/5 rounded-[2.5rem] md:rounded-[3.5rem] p-6 md:p-10 shadow-2xl backdrop-blur-sm flex flex-col max-h-175">
              <h2 className="text-xl md:text-2xl font-black mb-6 md:mb-8 flex items-center gap-3 md:gap-4 uppercase italic tracking-tighter m-0 shrink-0">
                <Calendar size={24} className="text-purple-500 md:w-7 md:h-7" /> Sélection de l&apos;Audit
              </h2>
              
              <div className="space-y-3 md:space-y-4 overflow-y-auto custom-scrollbar pr-2 flex-1">
                {filteredAudits.length > 0 ? (
                  filteredAudits.map((audit) => (
                    <AuditCard 
                      key={audit.AU_Id} 
                      audit={audit} 
                      isSelected={selectedAudit === audit.AU_Id}
                      onSelect={() => setSelectedAudit(audit.AU_Id)}
                    />
                  ))
                ) : (
                  <div className="text-center py-16 md:py-20 border-2 border-dashed border-white/10 rounded-4xl md:rounded-[3rem] h-full flex flex-col items-center justify-center">
                    <Search className="mx-auto mb-4 text-slate-600 md:w-10 md:h-10" size={32} />
                    <p className="text-slate-500 font-black uppercase text-[9px] md:text-[10px] tracking-[0.2em] md:tracking-widest italic m-0 px-4">
                      Aucun audit trouvé avec ces critères
                    </p>
                  </div>
                )}
              </div>
              
              {selectedAudit && (
                <div className="mt-6 md:mt-8 p-5 md:p-6 bg-purple-500/10 border border-purple-500/20 rounded-2xl md:rounded-4xl shadow-inner shrink-0 animate-in fade-in slide-in-from-bottom-4 duration-300">
                  <p className="text-[9px] md:text-[10px] font-black uppercase text-purple-400 tracking-[0.2em] mb-2 m-0 flex items-center gap-2">
                    <CheckCircle size={14} className="md:w-4 md:h-4" /> Cible Verrouillée
                  </p>
                  <p className="font-black text-base md:text-lg uppercase italic tracking-tight m-0 leading-tight truncate">
                    {audits.find(a => a.AU_Id === selectedAudit)?.AU_Title}
                  </p>
                  <p className="text-[9px] md:text-[10px] text-slate-400 mt-2 md:mt-3 font-bold uppercase tracking-[0.2em] md:tracking-widest m-0 truncate">
                    Réf: {audits.find(a => a.AU_Id === selectedAudit)?.AU_Reference} • 
                    Date: {new Date(audits.find(a => a.AU_Id === selectedAudit)?.AU_DateAudit || new Date()).toLocaleDateString('fr-FR')}
                  </p>
                </div>
              )}
            </div>
            
            {/* COLONNE DROITE: OPTIONS & GÉNÉRATION */}
            <div className="bg-[#0F172A]/80 border border-white/5 rounded-[2.5rem] md:rounded-[3.5rem] p-6 md:p-10 shadow-2xl backdrop-blur-sm flex flex-col max-h-175">
              <h2 className="text-xl md:text-2xl font-black mb-6 md:mb-8 flex items-center gap-3 md:gap-4 uppercase italic tracking-tighter m-0 shrink-0">
                <FileText size={24} className="text-purple-500 md:w-7 md:h-7" /> Paramètres d&apos;Export
              </h2>
              
              <div className="space-y-6 md:space-y-8 flex-1 overflow-y-auto custom-scrollbar pr-2">
                {/* TEMPLATE */}
                <div>
                  <label className="text-[8px] md:text-[9px] font-black uppercase text-slate-500 tracking-[0.3em] md:tracking-[0.4em] mb-3 md:mb-4 block m-0">
                    Modèle de Rapport
                  </label>
                  <div className="grid grid-cols-1 gap-3">
                    {templates.map((template) => {
                      const Icon = template.icon;
                      const isSelected = selectedTemplate === template.id;
                      return (
                        <button
                          key={template.id}
                          onClick={() => setSelectedTemplate(template.id)}
                          className={`w-full p-4 md:p-5 text-left rounded-3xl md:rounded-3xl border transition-all cursor-pointer m-0 ${
                            isSelected
                              ? `bg-linear-to-r ${template.color.replace('text-', 'from-').replace('-500', '-600/10')} to-purple-900/10 border-purple-500/50 shadow-lg shadow-purple-900/20`
                              : 'bg-[#0B0F1A] border-white/5 hover:bg-white/5 hover:border-purple-500/30'
                          }`}
                        >
                          <div className="flex items-center gap-4">
                            <div className={`p-2.5 md:p-3 rounded-xl md:rounded-2xl ${isSelected ? template.color : 'text-slate-500'} bg-black/40 shadow-inner shrink-0`}>
                              <Icon size={20} className="md:w-6 md:h-6" />
                            </div>
                            <div className="min-w-0">
                              <p className={`font-black uppercase italic tracking-tight m-0 text-xs md:text-sm truncate ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                                {template.label}
                              </p>
                              <p className="text-[8px] md:text-[9px] text-slate-500 mt-1 md:mt-1.5 uppercase tracking-[0.2em] md:tracking-widest m-0 truncate">
                                {template.id === 'ISO_9001' && 'ISO 9001:2015 §9.2 / §10.2'}
                                {template.id === 'ISO_14001' && 'ISO 14001:2015 §9.1 / §10.2'}
                                {template.id === 'LEGAL_SENEGAL' && 'Code Environnement Sénégal'}
                                {template.id === 'NON_CONFORMITE' && 'Analyse CAPA'}
                                {template.id === 'REVUE_DIRECTION' && 'Synthèse Stratégique SMQ'}
                              </p>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
                
                {/* OPTIONS SUPPLÉMENTAIRES */}
                <div>
                  <label className="text-[8px] md:text-[9px] font-black uppercase text-slate-500 tracking-[0.3em] md:tracking-[0.4em] mb-3 md:mb-4 block m-0">
                    Extensions (Auto-incluses)
                  </label>
                  <div className="space-y-2 md:space-y-3">
                    <OptionItem label="Preuves photographiques" description="Annexer les visuels des constats" checked={true} />
                    <OptionItem label="Signature numérique" description="Approbation certifiée SDE" checked={true} />
                  </div>
                </div>
              </div>
                
              {/* BOUTON DE GÉNÉRATION */}
              <div className="pt-6 md:pt-8 border-t border-white/10 mt-6 md:mt-8 shrink-0">
                <button
                  onClick={handleGenerateReport}
                  disabled={generating || !selectedAudit}
                  className={`w-full py-5 md:py-6 rounded-2xl md:rounded-4xl font-black uppercase text-[10px] md:text-xs tracking-[0.2em] md:tracking-[0.4em] shadow-xl transition-all flex items-center justify-center gap-3 md:gap-4 border-none m-0 ${
                    generating ? 'bg-purple-500/20 text-purple-400 cursor-not-allowed' : 
                    selectedAudit ? 'bg-linear-to-r from-purple-600 to-indigo-700 hover:from-purple-500 hover:to-indigo-600 text-white cursor-pointer active:scale-95' : 
                    'bg-[#0B0F1A] text-slate-600 border border-white/5 cursor-not-allowed'
                  }`}
                >
                  {generating ? (
                    <><Loader2 className="animate-spin md:w-6 md:h-6" size={20} /> Compilation Matrix...</>
                  ) : (
                    <><Download size={20} className="md:w-6 md:h-6" /> Sceller & Télécharger</>
                  )}
                </button>
                
                <p className="text-[8px] md:text-[9px] text-slate-500 mt-3 md:mt-4 font-bold uppercase tracking-[0.2em] md:tracking-widest italic text-center m-0">
                  {selectedAudit 
                    ? 'Génération sécurisée (max 60 secondes)'
                    : '⚠️ Sélection obligatoire dans le registre'}
                </p>
              </div>
            </div>
          </div>

          <footer className="pt-6 md:pt-8 border-t border-white/5 text-center shrink-0 pb-4">
             <p className="text-[8px] md:text-[9px] font-black text-slate-600 uppercase italic tracking-[0.3em] md:tracking-[0.5em] m-0 leading-relaxed">
               Qualisoft SMI • Conforme AFNOR, Bureau Veritas, SGS, INNORPI Sénégal
             </p>
          </footer>

        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(168, 85, 247, 0.5); }
      `}} />
    </div>
  );
}

// --- SOUS-COMPOSANTS ---

interface AuditCardProps {
  audit: Audit;
  isSelected: boolean;
  onSelect: () => void;
}

function AuditCard({ audit, isSelected, onSelect }: AuditCardProps) {
  return (
    <div
      onClick={onSelect}
      className={`w-full p-5 md:p-6 text-left rounded-3xl md:rounded-3xl border transition-all cursor-pointer group m-0 ${
        isSelected
          ? 'bg-linear-to-r from-purple-900/20 to-indigo-900/20 border-purple-500/50 shadow-lg shadow-purple-900/20'
          : 'bg-[#0B0F1A] border-white/5 hover:bg-white/5 hover:border-purple-500/30'
      }`}
    >
      <div className="flex justify-between items-start mb-3 md:mb-4 gap-4">
        <div className="flex-1 min-w-0">
          <span className="text-[8px] font-black uppercase bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2.5 md:px-3 py-1 md:py-1.5 rounded-md md:rounded-lg tracking-[0.2em] md:tracking-widest truncate max-w-full inline-block">
            {audit.AU_Type?.replace('_', ' ') || 'STANDARD'}
          </span>
          <h3 className="text-sm md:text-base lg:text-lg font-black mt-2.5 md:mt-3 uppercase italic tracking-tight leading-tight m-0 group-hover:text-purple-400 transition-colors line-clamp-2">
            {audit.AU_Title || 'Audit sans titre'}
          </h3>
        </div>
        <div className="text-right shrink-0">
          <span className="text-[8px] md:text-[9px] font-black text-slate-500 bg-[#0F172A] px-2.5 md:px-3 py-1.5 rounded-lg md:rounded-xl border border-white/5 shadow-inner">
            #{audit.AU_Reference || 'N/A'}
          </span>
        </div>
      </div>
      
      <p className="text-[9px] md:text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] md:tracking-widest mb-4 md:mb-5 line-clamp-2 italic m-0">
        {audit.AU_Scope || 'Périmètre non défini'}
      </p>
      
      <div className="flex flex-wrap items-center justify-between text-[8px] md:text-[9px] font-black uppercase tracking-[0.2em] md:tracking-widest gap-2 bg-[#0F172A] p-2.5 md:p-3 rounded-xl md:rounded-2xl border border-white/5 shadow-inner">
        <div className="flex items-center gap-2 md:gap-3 min-w-0">
          <span className={`px-2.5 md:px-3 py-1 md:py-1.5 rounded-md md:rounded-lg flex items-center gap-1.5 shrink-0 ${
            audit.AU_Status === 'TERMINE' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
            audit.AU_Status === 'EN_COURS' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
            'bg-amber-500/10 text-amber-400 border border-amber-500/20'
          }`}>
            {audit.AU_Status?.replace('_', ' ') || 'INCONNU'}
          </span>
          <span className="text-slate-500 flex items-center gap-1.5 truncate">
            <Users size={12} className="text-purple-500 shrink-0" /> 
            <span className="truncate">{audit.AU_Lead?.U_FirstName || 'N/A'}</span>
          </span>
        </div>
        <span className="text-slate-400 flex items-center gap-1.5 bg-[#0B0F1A] px-2.5 md:px-3 py-1 md:py-1.5 rounded-md md:rounded-lg border border-white/5 shrink-0">
          <Target size={12} className="text-red-500 shrink-0" /> 
          {audit.AU_NonConformites?.length || 0} NC
        </span>
      </div>
    </div>
  );
}

interface OptionItemProps {
  label: string; description: string; checked: boolean;
}

function OptionItem({ label, description, checked }: OptionItemProps) {
  return (
    <label className="flex items-start gap-3 md:gap-4 p-4 md:p-5 bg-[#0B0F1A] border border-white/5 rounded-3xl md:rounded-2xl transition-colors cursor-not-allowed opacity-70 shadow-inner m-0">
      <input 
        type="checkbox" 
        checked={checked}
        readOnly
        className="w-4 h-4 md:w-5 md:h-5 rounded-md md:rounded-lg mt-0.5 border-white/20 bg-black text-purple-500 focus:ring-purple-500 focus:ring-offset-0 focus:ring-offset-transparent pointer-events-none shrink-0"
      />
      <div className="min-w-0">
        <p className="font-black uppercase text-[10px] md:text-xs italic tracking-tight m-0 truncate">{label}</p>
        <p className="text-[8px] md:text-[9px] text-slate-500 mt-1 md:mt-1.5 font-bold uppercase tracking-[0.2em] md:tracking-widest m-0 truncate">{description}</p>
      </div>
    </label>
  );
}