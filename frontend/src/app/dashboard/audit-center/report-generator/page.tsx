/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * 💡 MODULE : GÉNÉRATEUR DE RAPPORTS SDE
 * -------------------------------------------------------------------------
 * RÔLE : Production de rapports PDF d'Audit normatifs (ISO 9001, etc.).
 * FIX : Remplacement de react-hot-toast par Sonner, ajout sécurisé du Toaster,
 * protection des boucles filter/map avec Array.isArray, et nettoyage JSX.
 * -------------------------------------------------------------------------
 * DATE : 02 Mars 2026 | 13:07 GMT
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
    { id: 'ISO_14001', label: 'ISO 14001:2015 - Environnement', icon: Leaf, color: 'text-green-500' },
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
      <div className="ml-72 h-screen flex flex-col items-center justify-center bg-[#0B0F1A] gap-6">
        <Loader2 className="animate-spin text-purple-500" size={60} strokeWidth={1.5} />
        <span className="text-purple-400 font-black uppercase italic text-[10px] tracking-[1em] animate-pulse">
          Chargement des audits...
        </span>
      </div>
    );
  }

  return (
    <div className="ml-72 min-h-screen bg-[#0B0F1A] text-white font-sans p-8 lg:p-12 selection:bg-purple-500/30">
      <Toaster position="top-right" richColors theme="dark" />

      {/* INJECTION CSS SÉCURISÉE */}
      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(255, 255, 255, 0.05); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(168, 85, 247, 0.5); }
      `}} />

      {/* HEADER */}
      <header className="mb-10 border-b-2 border-white/5 pb-10">
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-8 mb-8">
          <div>
            <div className="flex items-center gap-6 mb-6">
              <div className="bg-linear-to-br from-purple-600 to-indigo-700 p-5 rounded-3xl shadow-lg shadow-purple-500/20 shrink-0">
                <FileText size={40} className="text-white" />
              </div>
              <div>
                <h1 className="text-4xl lg:text-5xl font-black uppercase italic tracking-tighter m-0 leading-none">
                  Générateur de <span className="text-purple-500">Rapports</span>
                </h1>
                <p className="text-slate-500 font-bold text-[10px] uppercase tracking-[0.4em] mt-3 italic m-0">
                  Rapports d&apos;Audit • Certification • Conformité Légale
                </p>
              </div>
            </div>
            
            <div className="bg-purple-500/5 border border-purple-500/20 rounded-4xl p-6 lg:p-8 mt-6">
              <div className="flex items-start gap-5">
                <div className="p-4 bg-purple-500/10 rounded-2xl shrink-0">
                  <Printer size={28} className="text-purple-400" />
                </div>
                <div>
                  <h2 className="text-lg font-black mb-2 uppercase italic tracking-tight m-0">Génération de Rapports Professionnels</h2>
                  <p className="text-[11px] text-slate-400 italic leading-relaxed m-0 max-w-3xl">
                    Créez des rapports d&apos;audit conformes aux exigences des organismes certificateurs (AFNOR, Bureau Veritas, SGS) 
                    et de la réglementation sénégalaise. Personnalisez le contenu selon vos besoins spécifiques.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex shrink-0">
            <button 
              onClick={fetchAudits}
              className="bg-slate-800 hover:bg-slate-700 text-white px-8 py-5 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center gap-3 transition-all border-none cursor-pointer shadow-lg"
            >
              <RefreshCw size={18} /> Actualiser
            </button>
          </div>
        </div>

        {/* FILTRES */}
        <div className="flex flex-col md:flex-row gap-6 bg-white/5 p-4 rounded-3xl border border-white/5">
          <div className="relative flex-1">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input
              type="text"
              placeholder="Rechercher un audit (référence, titre, scope)..."
              className="w-full bg-black/40 border-2 border-white/5 rounded-2xl pl-12 pr-6 py-4 text-xs font-black uppercase text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 outline-none italic placeholder:text-slate-600 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-black/40 border-2 border-white/5 rounded-2xl px-6 py-4 text-xs font-black uppercase italic text-slate-400 focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 outline-none min-w-62.5 cursor-pointer transition-all"
          >
            <option value="ALL" className="bg-[#0B0F1A]">Tous les types d&apos;audit</option>
            <option value="INTERNE" className="bg-[#0B0F1A]">Audit Interne</option>
            <option value="EXTERNE" className="bg-[#0B0F1A]">Audit Externe</option>
            <option value="CERTIFICATION" className="bg-[#0B0F1A]">Audit Certification</option>
            <option value="SURVEILLANCE" className="bg-[#0B0F1A]">Audit Surveillance</option>
          </select>
        </div>
      </header>

      {/* FORMULAIRE DE GÉNÉRATION */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        
        {/* COLONNE GAUCHE: SÉLECTION AUDIT */}
        <div className="bg-slate-900/40 border border-white/5 rounded-[3rem] p-8 lg:p-10 shadow-2xl">
          <h2 className="text-2xl font-black mb-8 flex items-center gap-4 uppercase italic tracking-tighter">
            <Calendar size={28} className="text-purple-500" /> Sélection de l&apos;Audit
          </h2>
          
          <div className="space-y-4 max-h-125 overflow-y-auto pr-2 custom-scrollbar">
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
              <div className="text-center py-20 border-2 border-dashed border-white/5 rounded-4xl">
                <Search className="mx-auto mb-4 text-slate-600" size={32} />
                <p className="text-slate-600 font-black uppercase text-[10px] tracking-widest italic m-0">
                  Aucun audit trouvé avec ces critères
                </p>
              </div>
            )}
          </div>
          
          {selectedAudit && (
            <div className="mt-8 p-6 bg-purple-500/10 border border-purple-500/20 rounded-4xl shadow-inner animate-in fade-in slide-in-from-bottom-4">
              <p className="text-[10px] font-black uppercase text-purple-400 tracking-[0.2em] mb-2 m-0 flex items-center gap-2">
                <CheckCircle size={12} /> Cible Vérrouillée
              </p>
              <p className="font-black text-lg uppercase italic tracking-tight m-0 leading-none">
                {audits.find(a => a.AU_Id === selectedAudit)?.AU_Title}
              </p>
              <p className="text-[10px] text-slate-400 mt-3 font-bold uppercase tracking-widest m-0">
                Réf: {audits.find(a => a.AU_Id === selectedAudit)?.AU_Reference} • 
                Date: {new Date(audits.find(a => a.AU_Id === selectedAudit)?.AU_DateAudit || new Date()).toLocaleDateString('fr-FR')}
              </p>
            </div>
          )}
        </div>
        
        {/* COLONNE DROITE: OPTIONS & GÉNÉRATION */}
        <div className="bg-slate-900/40 border border-white/5 rounded-[3rem] p-8 lg:p-10 shadow-2xl flex flex-col">
          <h2 className="text-2xl font-black mb-8 flex items-center gap-4 uppercase italic tracking-tighter m-0">
            <FileText size={28} className="text-purple-500" /> Paramètres d&apos;Export
          </h2>
          
          <div className="space-y-8 flex-1">
            {/* TEMPLATE */}
            <div>
              <label className="text-[10px] font-black uppercase text-slate-500 tracking-[0.4em] mb-4 block">
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
                      className={`w-full p-5 text-left rounded-3xl border-2 transition-all cursor-pointer ${
                        isSelected
                          ? `bg-linear-to-r ${template.color.replace('text-', 'from-').replace('-500', '-600/20')} to-purple-900/20 border-purple-500 shadow-lg shadow-purple-900/30`
                          : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-purple-500/30'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-xl ${isSelected ? template.color : 'text-slate-500'} bg-black/40 shadow-inner`}>
                          <Icon size={20} />
                        </div>
                        <div>
                          <p className={`font-black uppercase italic tracking-tight m-0 ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                            {template.label}
                          </p>
                          <p className="text-[9px] text-slate-400 mt-1 uppercase tracking-widest m-0">
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
              <label className="text-[10px] font-black uppercase text-slate-500 tracking-[0.4em] mb-4 block">
                Extensions
              </label>
              <div className="space-y-3">
                <OptionItem label="Preuves photographiques" description="Annexer les visuels des constats" checked={true} />
                <OptionItem label="Signature numérique" description="Approbation certifiée" checked={true} />
              </div>
            </div>
          </div>
            
          {/* BOUTON DE GÉNÉRATION */}
          <div className="pt-8 border-t-2 border-white/5 mt-8">
            <button
              onClick={handleGenerateReport}
              disabled={generating || !selectedAudit}
              className={`w-full py-6 rounded-4xl font-black uppercase text-xs tracking-[0.4em] shadow-2xl transition-all flex items-center justify-center gap-4 border-none ${
                generating ? 'bg-purple-500/20 text-purple-400 cursor-not-allowed' : 
                selectedAudit ? 'bg-linear-to-r from-purple-600 to-indigo-700 hover:from-purple-500 hover:to-indigo-600 text-white cursor-pointer active:scale-95' : 
                'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              {generating ? (
                <><Loader2 className="animate-spin" size={24} /> Compilation Matrix...</>
              ) : (
                <><Download size={24} /> Sceller & Télécharger</>
              )}
            </button>
            
            <p className="text-[9px] text-slate-500 mt-4 font-bold uppercase tracking-widest italic text-center m-0">
              {selectedAudit 
                ? 'Génération sécurisée (max 60 secondes)'
                : '⚠️ Sélection obligatoire dans le registre'}
            </p>
          </div>
        </div>
      </div>

      {/* HISTORIQUE DES RAPPORTS */}
      <section className="bg-slate-900/40 border border-white/5 rounded-[3rem] p-8 lg:p-10 shadow-2xl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <h2 className="text-2xl font-black uppercase italic tracking-tighter m-0 flex items-center gap-4">
            <FileText size={28} className="text-purple-500" /> Historique Récent
          </h2>
          <button className="text-[9px] font-black text-purple-400 hover:text-white uppercase tracking-widest flex items-center gap-2 bg-purple-500/10 px-4 py-2 rounded-xl transition-colors border-none cursor-pointer">
             Historique Complet <ChevronDown size={14} />
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <ReportHistoryItem 
              key={i}
              title={`Rapport Audit ISO 9001`}
              date={new Date(Date.now() - i * 86400000).toISOString()}
              template="ISO_9001"
              status="TERMINÉ"
            />
          ))}
        </div>
      </section>

      <footer className="mt-16 pt-8 border-t border-white/5 text-center opacity-50 hover:opacity-100 transition-opacity">
        <p className="text-[9px] font-black text-slate-500 uppercase italic tracking-[0.5em] m-0 leading-relaxed">
          Qualisoft SMI • Conforme AFNOR, Bureau Veritas, SGS, INNORPI Sénégal
        </p>
      </footer>
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
      className={`w-full p-6 text-left rounded-4xl border-2 transition-all cursor-pointer group ${
        isSelected
          ? 'bg-linear-to-r from-purple-900/30 to-indigo-900/30 border-purple-500 shadow-xl shadow-purple-900/20'
          : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-purple-500/30'
      }`}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1 pr-4">
          <span className="text-[8px] font-black uppercase bg-purple-500/10 text-purple-400 border border-purple-500/20 px-3 py-1 rounded-lg tracking-widest">
            {audit.AU_Type?.replace('_', ' ') || 'STANDARD'}
          </span>
          <h3 className="text-lg font-black mt-3 uppercase italic tracking-tight leading-tight m-0 group-hover:text-purple-300 transition-colors">
            {audit.AU_Title || 'Audit sans titre'}
          </h3>
        </div>
        <div className="text-right shrink-0">
          <span className="text-[10px] font-black text-slate-400 bg-black/40 px-3 py-1.5 rounded-xl border border-white/5">
            #{audit.AU_Reference || 'N/A'}
          </span>
        </div>
      </div>
      
      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-5 line-clamp-2 italic m-0">
        {audit.AU_Scope || 'Périmètre non défini'}
      </p>
      
      <div className="flex flex-wrap items-center justify-between text-[9px] font-black uppercase tracking-widest gap-2 bg-black/30 p-3 rounded-2xl border border-white/5">
        <div className="flex items-center gap-3">
          <span className={`px-3 py-1.5 rounded-lg flex items-center gap-2 ${
            audit.AU_Status === 'TERMINE' ? 'bg-emerald-500/20 text-emerald-400' :
            audit.AU_Status === 'EN_COURS' ? 'bg-blue-500/20 text-blue-400' :
            'bg-amber-500/20 text-amber-400'
          }`}>
            {audit.AU_Status?.replace('_', ' ') || 'INCONNU'}
          </span>
          <span className="text-slate-400 flex items-center gap-2">
            <Users size={12} className="text-purple-400" /> 
            {audit.AU_Lead?.U_FirstName || 'N/A'}
          </span>
        </div>
        <span className="text-slate-400 flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
          <Target size={12} className="text-red-400" /> 
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
    <label className="flex items-start gap-4 p-5 bg-white/5 border border-white/5 rounded-2xl transition-colors cursor-not-allowed opacity-80">
      <input 
        type="checkbox" 
        checked={checked}
        readOnly
        className="w-5 h-5 rounded-lg mt-0.5 border-white/20 bg-black text-purple-500 focus:ring-purple-500 focus:ring-offset-0 focus:ring-offset-transparent pointer-events-none"
      />
      <div>
        <p className="font-black uppercase text-xs italic tracking-tight m-0">{label}</p>
        <p className="text-[9px] text-slate-500 mt-1 font-bold uppercase tracking-widest m-0">{description}</p>
      </div>
    </label>
  );
}

interface ReportHistoryItemProps {
  title: string; date: string; template: string; status: string;
}

function ReportHistoryItem({ title, date, template, status }: ReportHistoryItemProps) {
  const templateConfig: Record<string, { icon: LucideIcon; color: string }> = {
    'ISO_9001': { icon: Target, color: 'text-blue-500' },
    'ISO_14001': { icon: Leaf, color: 'text-green-500' },
    'LEGAL_SENEGAL': { icon: FileText, color: 'text-amber-500' },
    'NON_CONFORMITE': { icon: AlertTriangle, color: 'text-red-500' },
    'REVUE_DIRECTION': { icon: Users, color: 'text-purple-500' }
  };
  
  const config = templateConfig[template] || templateConfig['ISO_9001'];
  const Icon = config.icon;
  
  return (
    <div className="bg-white/5 border-2 border-white/5 rounded-4xl p-6 hover:border-purple-500/30 transition-all flex flex-col h-full group">
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 bg-black/40 shadow-inner rounded-xl ${config.color}`}>
          <Icon size={20} />
        </div>
        <span className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest ${
          status === 'TERMINÉ' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
        }`}>
          {status}
        </span>
      </div>
      
      <h4 className="font-black text-sm uppercase italic tracking-tight m-0 mb-4 line-clamp-2 leading-tight flex-1">
        {title}
      </h4>
      
      <div className="space-y-2 text-[9px] font-bold uppercase tracking-widest text-slate-500 bg-black/20 p-3 rounded-xl border border-white/5">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2"><Calendar size={12} className="text-purple-400" /> Date</span>
          <span className="text-white">{new Date(date).toLocaleDateString('fr-FR')}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2"><FileText size={12} className="text-purple-400" /> Type</span>
          <span className="text-white truncate max-w-25">{template.replace('_', ' ')}</span>
        </div>
      </div>
      
      <button className="mt-4 w-full py-3 bg-white/5 border border-white/10 hover:border-purple-500/30 hover:bg-purple-500/10 rounded-xl font-black text-[9px] uppercase tracking-[0.2em] text-slate-400 hover:text-purple-400 transition-all flex items-center justify-center gap-2 cursor-pointer">
        <Download size={14} /> Retélécharger
      </button>
    </div>
  );
}