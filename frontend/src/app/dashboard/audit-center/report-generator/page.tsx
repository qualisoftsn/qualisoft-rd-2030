/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * 💡 CE QUE FAIT CETTE PAGE :
 * --------------------------
 * Fichier : app/dashboard/audit-center/report-generator/page.tsx
 * Rôle : Générateur professionnel de rapports PDF d'Audit.
 * * Fonctionnalités clés :
 * 1. Sélection d'Audit : Permet de rechercher, filtrer et sélectionner un audit spécifique dans la base de données.
 * 2. Choix du Référentiel (Modèles) : Offre des modèles adaptés aux exigences de différents certificateurs (ISO 9001, 14001, Légal Sénégal, NC).
 * 3. Options de Personnalisation : Intègre des options pour inclure des photos, des signatures numériques ou prévoir un export modifiable (interfaces préparées pour l'évolution backend).
 * 4. Génération & Export : Sollicite le backend pour compiler un rapport PDF complet qui se télécharge automatiquement.
 * 5. Historisation : (En préparation) Visualisation des rapports précédemment générés pour éviter de refaire les exports.
 * * Public cible : Responsables Qualité, Auditeurs Principaux, Direction.
 */

'use client';

import React, { useEffect, useState } from 'react';
import apiClient from '@/core/api/api-client';
import type { LucideIcon } from 'lucide-react';
import { 
  FileText, Download, Printer, Mail, Calendar, 
  Users, Target, CheckCircle, AlertTriangle, 
  ChevronDown, Search, Filter, Plus, Loader2,
  Leaf, RefreshCw
} from 'lucide-react';
import { toast } from 'react-hot-toast';

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

  useEffect(() => {
    fetchAudits();
  }, []);

  const fetchAudits = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get<Audit[]>('/audits');
      setAudits(res.data);
    } catch (error) {
      console.error('Erreur chargement audits:', error);
      toast.error('Erreur lors du chargement des audits');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReport = async () => {
    if (!selectedAudit) {
      toast.error('Veuillez sélectionner un audit');
      return;
    }
    
    setGenerating(true);
    try {
      const response = await apiClient.post('/audit-report/generate', {
        auditId: selectedAudit,
        template: selectedTemplate
      }, { 
        responseType: 'blob',
        timeout: 60000 // 60 secondes de timeout
      });
      
      // Créer un lien de téléchargement
      const url = window.URL.createObjectURL(new Blob([response.data as BlobPart]));
      const link = document.createElement('a');
      const audit = audits.find(a => a.AU_Id === selectedAudit);
      const templateName = templates.find(t => t.id === selectedTemplate)?.label || 'Rapport';
      const dateStr = new Date().toISOString().split('T')[0];
      
      link.href = url;
      link.setAttribute('download', `${templateName.replace(/\s+/g, '_')}_${audit?.AU_Reference || 'audit'}_${dateStr}.pdf`);
      document.body.appendChild(link);
      link.click();
      
      // Nettoyer
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('Rapport généré et téléchargé avec succès !', { duration: 5000 });
      
    } catch (error: unknown) {
      console.error('Erreur génération rapport:', error);
      // Typage d'erreur sécurisé pour Axios
      const axiosError = error as { code?: string; response?: { status?: number; data?: { message?: string } } };
      
      if (axiosError.code === 'ECONNABORTED') {
        toast.error('Le rapport prend plus de temps que prévu. Veuillez réessayer.');
      } else if (axiosError.response?.status === 404) {
        toast.error('Audit non trouvé. Veuillez vérifier la sélection.');
      } else if (axiosError.response?.status === 500) {
        toast.error('Erreur serveur lors de la génération du rapport');
      } else {
        toast.error(axiosError.response?.data?.message || 'Erreur lors de la génération du rapport');
      }
    } finally {
      setGenerating(false);
    }
  };

  const filteredAudits = audits.filter(audit => {
    const matchesSearch = 
      audit.AU_Reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      audit.AU_Title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      audit.AU_Scope.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'ALL' || audit.AU_Type === filterType;
    
    return matchesSearch && matchesType;
  });

  if (loading) {
    return (
      <div className="ml-72 h-screen flex items-center justify-center bg-[#0B0F1A]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin mb-6 mx-auto"></div>
          <p className="text-slate-500 font-black uppercase italic text-[10px] tracking-widest">
            Chargement des audits disponibles...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="ml-72 min-h-screen bg-[#0B0F1A] text-white font-sans p-8">
      {/* HEADER */}
      <header className="mb-10 border-b border-white/5 pb-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-linear-to-br from-purple-600 to-indigo-700 p-4 rounded-2xl shadow-lg shadow-purple-500/20">
                <FileText size={40} className="text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-black uppercase italic tracking-tighter">
                  Générateur de <span className="text-purple-500">Rapports</span>
                </h1>
                <p className="text-slate-500 font-bold text-[10px] uppercase tracking-[0.4em] mt-2 italic">
                  Rapports d&apos;Audit • Certification • Conformité Légale
                </p>
              </div>
            </div>
            
            <div className="bg-purple-500/10 border border-purple-500/20 rounded-2xl p-6 mt-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-purple-500/20 rounded-xl">
                  <Printer size={28} className="text-purple-400" />
                </div>
                <div>
                  <h2 className="text-xl font-black mb-2">Génération de Rapports Professionnels</h2>
                  <p className="text-[11px] text-slate-300 italic">
                    Créez des rapports d&apos;audit conformes aux exigences des organismes certificateurs (AFNOR, Bureau Veritas, SGS) 
                    et de la réglementation sénégalaise. Personnalisez le contenu selon vos besoins spécifiques.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex gap-4">
            <button 
              onClick={fetchAudits}
              className="bg-slate-800 hover:bg-slate-700 text-white px-6 py-4 rounded-2xl font-black uppercase text-[10px] flex items-center gap-2 transition-all"
            >
              <RefreshCw size={18} className="animate-spin" /> Actualiser
            </button>
          </div>
        </div>

        {/* FILTRES */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input
              type="text"
              placeholder="Rechercher un audit (référence, titre, scope)..."
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 outline-none min-w-45"
          >
            <option value="ALL">Tous les types d&apos;audit</option>
            <option value="INTERNE">Audit Interne</option>
            <option value="EXTERNE">Audit Externe</option>
            <option value="CERTIFICATION">Audit Certification</option>
            <option value="SURVEILLANCE">Audit Surveillance</option>
          </select>
        </div>
      </header>

      {/* FORMULAIRE DE GÉNÉRATION */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
        {/* COLONNE GAUCHE: SÉLECTION AUDIT */}
        <div className="bg-slate-900/40 border border-white/5 rounded-3xl p-8">
          <h2 className="text-2xl font-black mb-6 flex items-center gap-3">
            <Calendar size={24} className="text-purple-500" /> Sélection de l&apos;Audit
          </h2>
          
          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
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
              <div className="text-center py-12 text-slate-600 italic">
                Aucun audit trouvé avec ces critères de recherche
              </div>
            )}
          </div>
          
          {selectedAudit && (
            <div className="mt-6 p-4 bg-purple-500/10 border border-purple-500/20 rounded-xl">
              <p className="text-[10px] font-black uppercase text-purple-400 mb-1">Audit sélectionné</p>
              <p className="font-black">
                {audits.find(a => a.AU_Id === selectedAudit)?.AU_Title}
              </p>
              <p className="text-[10px] text-slate-400 mt-1">
                Réf: {audits.find(a => a.AU_Id === selectedAudit)?.AU_Reference} • 
                Date: {new Date(audits.find(a => a.AU_Id === selectedAudit)?.AU_DateAudit || new Date()).toLocaleDateString('fr-FR')}
              </p>
            </div>
          )}
        </div>
        
        {/* COLONNE DROITE: OPTIONS & GÉNÉRATION */}
        <div className="bg-slate-900/40 border border-white/5 rounded-3xl p-8">
          <h2 className="text-2xl font-black mb-6 flex items-center gap-3">
            <FileText size={24} className="text-purple-500" /> Options de Génération
          </h2>
          
          <div className="space-y-6">
            {/* TEMPLATE */}
            <div>
              <label className="text-[10px] font-black uppercase text-slate-500 mb-3 block">
                Modèle de Rapport
              </label>
              <div className="grid grid-cols-1 gap-3">
                {templates.map((template) => {
                  const Icon = template.icon;
                  return (
                    <button
                      key={template.id}
                      onClick={() => setSelectedTemplate(template.id)}
                      className={`w-full p-4 text-left rounded-2xl border transition-all ${
                        selectedTemplate === template.id
                          ? `bg-linear-to-r ${template.color.replace('text-', 'from-').replace('-500', '-600')} to-purple-700 border-purple-500 shadow-lg shadow-purple-900/30`
                          : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-purple-500/30'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${template.color.replace('text-', 'bg-').replace('-500', '-500/20')} ${template.color}`}>
                          <Icon size={20} />
                        </div>
                        <div>
                          <p className="font-black">{template.label}</p>
                          <p className="text-[9px] text-slate-400 mt-1">
                            {template.id === 'ISO_9001' && 'Conforme aux exigences ISO 9001:2015 §9.2 et §10.2'}
                            {template.id === 'ISO_14001' && 'Conforme aux exigences ISO 14001:2015 §9.1 et §10.2'}
                            {template.id === 'LEGAL_SENEGAL' && 'Conforme au Code de l\'Environnement et Textes Réglementaires Sénégalais'}
                            {template.id === 'NON_CONFORMITE' && 'Analyse des causes, actions correctives et suivi'}
                            {template.id === 'REVUE_DIRECTION' && 'Synthèse performance SMQ/SME et décisions stratégiques'}
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
              <label className="text-[10px] font-black uppercase text-slate-500 mb-3 block">
                Options Supplémentaires
              </label>
              <div className="space-y-3">
                <OptionItem 
                  label="Inclure les preuves photographiques" 
                  description="Ajouter les photos des non-conformités et bonnes pratiques"
                  checked={true}
                />
                <OptionItem 
                  label="Exporter en format Word" 
                  description="Version éditable pour modifications ultérieures (.docx)"
                  checked={false}
                />
                <OptionItem 
                  label="Signature électronique" 
                  description="Ajouter les signatures numériques des responsables"
                  checked={true}
                />
                <OptionItem 
                  label="Envoi par email" 
                  description="Envoyer le rapport aux parties prenantes après génération"
                  checked={false}
                />
              </div>
            </div>
            
            {/* BOUTON DE GÉNÉRATION */}
            <div className="pt-6 border-t border-white/5">
              <button
                onClick={handleGenerateReport}
                disabled={generating || !selectedAudit}
                className={`w-full py-6 rounded-2xl font-black uppercase text-[11px] tracking-widest shadow-xl transition-all ${
                  generating
                    ? 'bg-purple-500/20 text-purple-400 cursor-not-allowed'
                    : selectedAudit
                    ? 'bg-linear-to-r from-purple-600 to-indigo-700 hover:from-purple-700 hover:to-indigo-800 text-white shadow-purple-900/40'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
              >
                {generating ? (
                  <>
                    <Loader2 className="animate-spin inline-block mr-2" size={20} />
                    Génération en cours... (cela peut prendre jusqu&apos;à 60 secondes)
                  </>
                ) : (
                  <>
                    <Download size={20} className="inline-block mr-2" />
                    Générer le Rapport PDF
                  </>
                )}
              </button>
              
              <p className="text-[9px] text-slate-500 mt-3 italic text-center">
                {selectedAudit 
                  ? 'Le rapport sera téléchargé automatiquement après génération'
                  : '⚠️ Veuillez sélectionner un audit pour générer le rapport'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* HISTORIQUE DES RAPPORTS */}
      <section className="bg-slate-900/40 border border-white/5 rounded-3xl p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-black flex items-center gap-3">
            <FileText size={24} className="text-purple-500" /> Historique des Rapports Générés
          </h2>
          <button className="text-[10px] font-black text-purple-400 hover:text-purple-300 flex items-center gap-1">
            <ChevronDown size={16} /> Voir tout l&apos;historique
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <ReportHistoryItem 
              key={i}
              title={`Rapport Audit ISO 9001 - ${new Date(Date.now() - i * 86400000).toLocaleDateString('fr-FR')}`}
              date={new Date(Date.now() - i * 86400000).toISOString()}
              template="ISO_9001"
              status="TERMINÉ"
            />
          ))}
        </div>
      </section>

      <footer className="mt-12 pt-8 border-t border-white/5 text-center">
        <p className="text-[8px] font-bold text-slate-600 uppercase italic tracking-[0.3em]">
          Qualisoft SMI • Générateur de Rapports d&apos;Audit • Conforme aux exigences des organismes certificateurs
        </p>
        <p className="text-[8px] font-bold text-slate-600 uppercase italic tracking-[0.3em] mt-1">
          AFNOR • Bureau Veritas • SGS • COFRAC • INNORPI Sénégal • ANSD
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
    <button
      onClick={onSelect}
      className={`w-full p-5 text-left rounded-2xl border transition-all ${
        isSelected
          ? 'bg-linear-to-r from-purple-600 to-indigo-700 border-purple-500 shadow-lg shadow-purple-900/30'
          : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-purple-500/30'
      }`}
    >
      <div className="flex justify-between items-start mb-2">
        <div>
          <span className="text-[10px] font-black uppercase bg-purple-500/20 text-purple-300 px-2.5 py-0.5 rounded">
            {audit.AU_Type.replace('_', ' ')}
          </span>
          <h3 className="font-black mt-2">{audit.AU_Title}</h3>
        </div>
        <div className="text-right">
          <span className="text-[10px] font-black text-purple-400">#{audit.AU_Reference}</span>
          <div className="flex items-center gap-1 mt-1 text-[9px] text-slate-400">
            <Calendar size={12} />
            <span>{new Date(audit.AU_DateAudit).toLocaleDateString('fr-FR')}</span>
          </div>
        </div>
      </div>
      
      <p className="text-[10px] text-slate-400 mb-3 line-clamp-2 italic">
        {audit.AU_Scope}
      </p>
      
      <div className="flex items-center justify-between text-[9px]">
        <div className="flex items-center gap-2">
          <span className={`px-2.5 py-0.5 rounded-full text-[8px] font-black uppercase ${
            audit.AU_Status === 'TERMINE' ? 'bg-emerald-500/20 text-emerald-300' :
            audit.AU_Status === 'EN_COURS' ? 'bg-blue-500/20 text-blue-300' :
            'bg-amber-500/20 text-amber-300'
          }`}>
            {audit.AU_Status.replace('_', ' ')}
          </span>
          <span className="text-slate-500">•</span>
          <span className="text-slate-400 flex items-center gap-1">
            <Users size={12} /> {audit.AU_Lead?.U_FirstName || 'Auditeur non assigné'}
          </span>
        </div>
        <span className="text-slate-500">•</span>
        <span className="text-slate-400 flex items-center gap-1">
          <Target size={12} /> {audit.AU_NonConformites?.length || 0} NC
        </span>
      </div>
    </button>
  );
}

interface OptionItemProps {
  label: string;
  description: string;
  checked: boolean;
}

function OptionItem({ label, description, checked }: OptionItemProps) {
  return (
    <label className="flex items-start gap-3 p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors cursor-pointer">
      <input 
        type="checkbox" 
        checked={checked}
        readOnly
        className="w-5 h-5 rounded-lg border-white/20 bg-white/5 text-purple-500 focus:ring-purple-500 focus:ring-offset-0 focus:ring-offset-transparent"
      />
      <div>
        <p className="font-black">{label}</p>
        <p className="text-[9px] text-slate-400 mt-1 italic">{description}</p>
      </div>
    </label>
  );
}

interface ReportHistoryItemProps {
  title: string;
  date: string;
  template: string;
  status: string;
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
    <div className="bg-white/5 border border-white/10 rounded-xl p-5 hover:border-purple-500/30 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className="p-2 bg-purple-500/10 rounded-lg">
          <Icon size={20} className={config.color} />
        </div>
        <span className={`px-2.5 py-0.5 rounded-full text-[8px] font-black uppercase ${
          status === 'TERMINÉ' ? 'bg-emerald-500/20 text-emerald-300' :
          status === 'EN_COURS' ? 'bg-blue-500/20 text-blue-300' :
          'bg-amber-500/20 text-amber-300'
        }`}>
          {status}
        </span>
      </div>
      
      <h4 className="font-black mb-2 line-clamp-1">{title}</h4>
      
      <div className="space-y-2 text-[9px] text-slate-400">
        <div className="flex items-center gap-1">
          <Calendar size={12} className="text-purple-400" />
          <span>{new Date(date).toLocaleDateString('fr-FR', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}</span>
        </div>
        <div className="flex items-center gap-1">
          <FileText size={12} className="text-purple-400" />
          <span>{template.replace('_', ' ')}</span>
        </div>
      </div>
      
      <button className="mt-4 w-full py-2 bg-purple-500/10 border border-purple-500/20 rounded-lg font-black text-[9px] uppercase text-purple-400 hover:bg-purple-500/20 transition-colors">
        Télécharger à nouveau
      </button>
    </div>
  );
}