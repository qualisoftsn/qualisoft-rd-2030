/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useEffect, useState, useMemo } from 'react';
import apiClient from '@/core/api/api-client';
import { 
  ShieldCheck, Target, CheckCircle, XCircle, AlertTriangle, 
  Download, Save, UploadCloud, FileText, Clock, TrendingUp,
  ChevronDown, ChevronRight, Search, Filter, Plus,
  RefreshCw
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function ISO9001ChecklistPage() {
  const [checklistItems, setChecklistItems] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'COMPLIANT' | 'NON_COMPLIANT' | 'PENDING'>('ALL');
  const [savingItemId, setSavingItemId] = useState<string | null>(null);
  const [uploadingEvidence, setUploadingEvidence] = useState<string | null>(null);

  // Groupes de clauses ISO 9001
  const clauseGroups = useMemo(() => [
    { id: '4', label: 'Contexte de l\'organisation (§4)', color: 'from-blue-500 to-cyan-600' },
    { id: '5', label: 'Leadership (§5)', color: 'from-emerald-500 to-teal-600' },
    { id: '6', label: 'Planification (§6)', color: 'from-amber-500 to-orange-600' },
    { id: '7', label: 'Support (§7)', color: 'from-purple-500 to-indigo-600' },
    { id: '8', label: 'Réalisation (§8)', color: 'from-pink-500 to-rose-600' },
    { id: '9', label: 'Évaluation des performances (§9)', color: 'from-red-500 to-amber-600' },
    { id: '10', label: 'Amélioration (§10)', color: 'from-green-500 to-emerald-600' }
  ], []);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [checklistRes, statsRes] = await Promise.all([
        apiClient.get('/checklist?standard=ISO_9001_2015'),
        apiClient.get('/checklist/stats?standard=ISO_9001_2015')
      ]);
      setChecklistItems(checklistRes.data);
      setStats(statsRes.data);
    } catch (error) {
      console.error('Erreur chargement checklist ISO 9001:', error);
      toast.error('Erreur lors du chargement de la checklist');
    } finally {
      setLoading(false);
    }
  };

  const handleResponseChange = async (itemId: string, response: string) => {
    setSavingItemId(itemId);
    try {
      await apiClient.post('/checklist/response', {
        CR_ChecklistId: itemId,
        CR_Response: response
      });
      toast.success('Réponse enregistrée avec succès');
      fetchData(); // Rafraîchir les données
    } catch (error) {
      console.error('Erreur sauvegarde réponse:', error);
      toast.error('Erreur lors de l\'enregistrement');
    } finally {
      setSavingItemId(null);
    }
  };

  const handleEvidenceUpload = async (itemId: string, file: File) => {
    setUploadingEvidence(itemId);
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const res = await apiClient.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      // Mettre à jour la réponse avec l'URL de la preuve
      await apiClient.post('/checklist/response', {
        CR_ChecklistId: itemId,
        CR_Response: 'YES', // Marquer comme conforme si preuve fournie
        CR_Evidence: res.data.url
      });
      
      toast.success('Preuve téléchargée et enregistrée');
      fetchData();
    } catch (error) {
      console.error('Erreur upload preuve:', error);
      toast.error('Erreur lors du téléchargement');
    } finally {
      setUploadingEvidence(null);
    }
  };

  const handleCommentChange = async (itemId: string, comment: string) => {
    setSavingItemId(itemId);
    try {
      await apiClient.post('/checklist/response', {
        CR_ChecklistId: itemId,
        CR_Response: checklistItems.find(i => i.LC_Id === itemId)?.response?.CR_Response || 'PARTIAL',
        CR_Comment: comment
      });
      toast.success('Commentaire enregistré');
      fetchData();
    } catch (error) {
      console.error('Erreur sauvegarde commentaire:', error);
      toast.error('Erreur lors de l\'enregistrement');
    } finally {
      setSavingItemId(null);
    }
  };

  const handleGenerateReport = async () => {
    try {
      const response = await apiClient.post('/audit-report/generate', {
        auditId: 'checklist-iso9001', // ID spécial pour checklist
        template: 'ISO_9001'
      }, { responseType: 'blob' });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `checklist-iso9001-${new Date().toISOString().split('T')[0]}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success('Rapport de checklist généré avec succès');
    } catch (error) {
      console.error('Erreur génération rapport:', error);
      toast.error('Erreur lors de la génération du rapport');
    }
  };

  // Filtrer les items selon les critères
  const filteredItems = useMemo(() => {
    return checklistItems.filter(item => {
      const matchesSearch = 
        item.LC_Clause.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.LC_Title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.LC_Description.toLowerCase().includes(searchTerm.toLowerCase());
      
      if (!matchesSearch) return false;
      
      if (filterStatus === 'ALL') return true;
      if (filterStatus === 'COMPLIANT') return item.response?.CR_IsCompliant;
      if (filterStatus === 'NON_COMPLIANT') return item.response && !item.response.CR_IsCompliant;
      if (filterStatus === 'PENDING') return !item.response;
      
      return true;
    });
  }, [checklistItems, searchTerm, filterStatus]);

  // Regrouper les items par section
  const groupedItems = useMemo(() => {
    const groups: any = {};
    clauseGroups.forEach(group => {
      groups[group.id] = filteredItems.filter(item => 
        item.LC_Clause.startsWith(group.id + '.') || item.LC_Clause === group.id
      );
    });
    return groups;
  }, [filteredItems, clauseGroups]);

  if (loading) {
    return (
      <div className="ml-72 h-screen flex items-center justify-center bg-[#0B0F1A]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mb-6"></div>
          <p className="text-slate-500 font-black uppercase italic text-[10px] tracking-widest">
            Chargement de la checklist ISO 9001:2015...
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
              <div className="bg-linear-to-br from-blue-600 to-cyan-700 p-4 rounded-2xl shadow-lg shadow-blue-500/20">
                <ShieldCheck size={40} className="text-white" />
              </div>
              <div>
                <h1 className="text-6xl font-black uppercase italic tracking-tighter">
                  Checklist <span className="text-blue-500">ISO 9001:2015</span>
                </h1>
                <p className="text-slate-500 font-bold text-[10px] uppercase tracking-[0.4em] mt-2 italic">
                  Évaluation de la conformité • Management de la Qualité
                </p>
              </div>
            </div>
            
            {stats && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
                <StatCard 
                  label="Taux de Conformité" 
                  value={`${stats.complianceRate}%`} 
                  icon={<Target className="text-emerald-500" />} 
                  color="bg-emerald-500/10 border-emerald-500/20"
                  target="≥ 90%"
                />
                <StatCard 
                  label="Exigences Conformes" 
                  value={`${stats.compliant}/${stats.total}`} 
                  icon={<CheckCircle className="text-blue-500" />} 
                  color="bg-blue-500/10 border-blue-500/20"
                />
                <StatCard 
                  label="Non-Conformités" 
                  value={stats.nonCompliant} 
                  icon={<XCircle className="text-red-500" />} 
                  color="bg-red-500/10 border-red-500/20"
                />
                <StatCard 
                  label="À Traiter" 
                  value={stats.notAnswered} 
                  icon={<Clock className="text-amber-500" />} 
                  color="bg-amber-500/10 border-amber-500/20"
                />
              </div>
            )}
          </div>
          
          <div className="flex gap-4">
            <button 
              onClick={handleGenerateReport}
              className="bg-linear-to-r from-blue-600 to-cyan-700 hover:from-blue-700 hover:to-cyan-800 text-white px-6 py-4 rounded-2xl font-black uppercase text-[10px] flex items-center gap-2 transition-all shadow-lg"
            >
              <Download size={18} /> Générer Rapport PDF
            </button>
            <button 
              onClick={fetchData}
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
              placeholder="Rechercher une clause, exigence..."
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 outline-none min-w-45"
          >
            <option value="ALL">Tous les statuts</option>
            <option value="COMPLIANT">Conforme (Oui)</option>
            <option value="NON_COMPLIANT">Non Conforme (Non)</option>
            <option value="PENDING">Non évalué</option>
          </select>
        </div>
      </header>

      {/* PROGRESSION GLOBALE */}
      <div className="bg-linear-to-r from-blue-900/30 to-cyan-900/30 border border-blue-500/20 rounded-3xl p-6 mb-10">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-xl font-black">Progression Globale de la Conformité</h2>
            <p className="text-[10px] text-slate-400 mt-1 italic">
              Suivi de la conformité aux exigences ISO 9001:2015
            </p>
          </div>
          <div className="text-right">
            <span className="text-3xl font-black">{stats?.complianceRate || 0}%</span>
            <p className="text-[10px] text-slate-400 mt-1">Taux de conformité global</p>
          </div>
        </div>
        
        <div className="w-full bg-white/5 rounded-full h-4 overflow-hidden">
          <div 
            className="h-full bg-linear-to-r from-emerald-500 to-cyan-500 transition-all duration-500"
            style={{ width: `${stats?.complianceRate || 0}%` }}
          ></div>
        </div>
        
        <div className="mt-4 grid grid-cols-4 text-center text-[10px] font-black">
          <div>
            <div className="text-emerald-400">{stats?.compliant || 0}</div>
            <div>Conforme</div>
          </div>
          <div>
            <div className="text-amber-400">{stats?.nonCompliant || 0}</div>
            <div>Non Conforme</div>
          </div>
          <div>
            <div className="text-blue-400">{stats?.notAnswered || 0}</div>
            <div>Non Évalué</div>
          </div>
          <div>
            <div className="text-slate-400">{stats?.total || 0}</div>
            <div>Total</div>
          </div>
        </div>
      </div>

      {/* CHECKLIST PAR SECTION */}
      <div className="space-y-8">
        {clauseGroups.map((group) => {
          const items = groupedItems[group.id];
          if (items.length === 0) return null;
          
          const isExpanded = expandedSection === group.id;
          
          return (
            <section key={group.id} className="bg-slate-900/40 border border-white/5 rounded-3xl overflow-hidden">
              <button
                onClick={() => setExpandedSection(isExpanded ? null : group.id)}
                className="w-full p-6 text-left bg-linear-to-r hover:from-slate-800 hover:to-slate-900 transition-all"
                style={{ 
                  background: isExpanded ? `linear-gradient(90deg, ${group.color.replace('from-', 'rgb(').replace(' to-', ',')})` : 'transparent'
                }}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-[10px] font-black uppercase bg-blue-500/20 text-blue-300 px-2.5 py-0.5 rounded mr-3">
                      §{group.id}
                    </span>
                    <span className="text-xl font-black">{group.label}</span>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2 text-[10px] font-black">
                      <CheckCircle className="text-emerald-500" size={16} />
                      <span>{items.filter((i: { response: { CR_IsCompliant: any; }; }) => i.response?.CR_IsCompliant).length}</span>
                      <span className="text-slate-500">/</span>
                      <span>{items.length}</span>
                    </div>
                    <div className="w-24 h-2 bg-white/10 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-emerald-500" 
                        style={{ 
                          width: `${Math.round((items.filter((i: { response: { CR_IsCompliant: any; }; }) => i.response?.CR_IsCompliant).length / items.length) * 100)}%` 
                        }}
                      ></div>
                    </div>
                    <ChevronDown 
                      className={`text-slate-500 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} 
                      size={20} 
                    />
                  </div>
                </div>
              </button>
              
              {isExpanded && (
                <div className="divide-y divide-white/5">
                  {items.map((item: any) => {
                    const response = item.response;
                    const isCompliant = response?.CR_IsCompliant;
                    const hasEvidence = response?.CR_Evidence;
                    
                    return (
                      <div key={item.LC_Id} className="p-6 hover:bg-white/2 transition-colors">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                          {/* COLONNE 1: EXIGENCE */}
                          <div className="lg:col-span-2">
                            <div className="flex items-start gap-3 mb-3">
                              <span className="text-[10px] font-black bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded shrink-0">
                                {item.LC_Clause}
                              </span>
                              <h3 className="font-black text-lg">{item.LC_Title}</h3>
                            </div>
                            
                            <p className="text-[11px] text-slate-400 mb-3 italic">
                              {item.LC_Description}
                            </p>
                            
                            <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-4">
                              <p className="text-[10px] font-black uppercase text-slate-500 mb-2 flex items-center gap-2">
                                <FileText size={14} className="text-blue-500" /> Critère d&apos;évaluation
                              </p>
                              <p className="text-[11px] text-slate-300">{item.LC_Criteria}</p>
                            </div>
                            
                            {item.LC_Reference && (
                              <div className="text-[10px] text-slate-500 italic">
                                <span className="font-black text-blue-400">Référence:</span> {item.LC_Reference}
                              </div>
                            )}
                          </div>
                          
                          {/* COLONNE 2: RÉPONSE & ACTIONS */}
                          <div className="space-y-4">
                            <div>
                              <label className="text-[10px] font-black uppercase text-slate-500 mb-2 block">
                                Votre réponse
                              </label>
                              <div className="grid grid-cols-2 gap-2">
                                {(['YES', 'NO', 'PARTIAL', 'NA'] as const).map((resp) => (
                                  <button
                                    key={resp}
                                    onClick={() => handleResponseChange(item.LC_Id, resp)}
                                    disabled={savingItemId === item.LC_Id}
                                    className={`p-3 rounded-lg text-[10px] font-black uppercase transition-all ${
                                      response?.CR_Response === resp
                                        ? resp === 'YES' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                                          resp === 'NO' ? 'bg-red-500/20 text-red-300 border border-red-500/30' :
                                          resp === 'PARTIAL' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                                          'bg-slate-500/20 text-slate-300 border border-slate-500/30'
                                        : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
                                    }`}
                                  >
                                    {resp === 'YES' && <CheckCircle size={14} className="mx-auto mb-1" />}
                                    {resp === 'NO' && <XCircle size={14} className="mx-auto mb-1" />}
                                    {resp === 'PARTIAL' && <AlertTriangle size={14} className="mx-auto mb-1" />}
                                    {resp}
                                  </button>
                                ))}
                              </div>
                            </div>
                            
                            <div>
                              <label className="text-[10px] font-black uppercase text-slate-500 mb-2 block items-center gap-2">
                                <UploadCloud size={14} className="text-blue-500" /> Preuve de conformité
                              </label>
                              {hasEvidence ? (
                                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3">
                                  <a 
                                    href={response.CR_Evidence} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-[10px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                                  >
                                    <FileText size={14} /> Voir la preuve téléchargée
                                  </a>
                                </div>
                              ) : (
                                <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-xl bg-white/5 border-white/10 hover:border-blue-500/30 hover:bg-blue-500/5 cursor-pointer transition-all">
                                  <UploadCloud size={24} className="text-blue-400 mb-2" />
                                  <span className="text-[10px] font-black text-slate-400">
                                    {uploadingEvidence === item.LC_Id ? 'Téléchargement...' : 'Cliquez pour uploader'}
                                  </span>
                                  <input 
                                    type="file" 
                                    className="hidden" 
                                    onChange={(e) => e.target.files && handleEvidenceUpload(item.LC_Id, e.target.files[0])}
                                    disabled={uploadingEvidence === item.LC_Id}
                                  />
                                </label>
                              )}
                            </div>
                            
                            <div>
                              <label className="text-[10px] font-black uppercase text-slate-500 mb-2 block">
                                Commentaires
                              </label>
                              <textarea
                                value={response?.CR_Comment || ''}
                                onChange={(e) => handleCommentChange(item.LC_Id, e.target.value)}
                                placeholder="Ajoutez des commentaires ou observations..."
                                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-[10px] text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 outline-none min-h-15"
                              />
                            </div>
                            
                            <div className="pt-2 border-t border-white/5 flex justify-end">
                              <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${
                                isCompliant ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                                response ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                                'bg-slate-500/20 text-slate-300 border border-slate-500/30'
                              }`}>
                                {isCompliant ? 'Conforme' : response ? 'À améliorer' : 'Non évalué'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          );
        })}
      </div>

      {/* RECOMMANDATIONS */}
      {stats && stats.nonCompliant > 0 && (
        <section className="mt-10 bg-linear-to-r from-amber-900/30 to-red-900/30 border border-amber-500/20 rounded-3xl p-8">
          <h2 className="text-2xl font-black mb-4 flex items-center gap-3 text-amber-400">
            <AlertTriangle size={28} /> Recommandations Prioritaires
          </h2>
          <div className="space-y-3">
            {stats.nonCompliant > 5 && (
              <RecommendationItem 
                priority="CRITIQUE" 
                title="Accélérer le traitement des non-conformités" 
                description={`Vous avez ${stats.nonCompliant} exigences non conformes. Priorisez les clauses §8 (Réalisation) et §7 (Support) qui représentent 60% des écarts.`}
              />
            )}
            {stats.complianceRate < 80 && (
              <RecommendationItem 
                priority="ÉLEVÉE" 
                title="Renforcer la conformité globale" 
                description={`Votre taux de conformité est de ${stats.complianceRate}%. Organisez des sessions de formation ciblées sur les exigences non conformes.`}
              />
            )}
            {stats.notAnswered > 10 && (
              <RecommendationItem 
                priority="MOYENNE" 
                title="Compléter l'évaluation des exigences" 
                description={`Il reste ${stats.notAnswered} exigences non évaluées. Allouez du temps cette semaine pour finaliser l'auto-évaluation.`}
              />
            )}
          </div>
        </section>
      )}

      <footer className="mt-12 pt-8 border-t border-white/5 text-center">
        <p className="text-[8px] font-bold text-slate-600 uppercase italic tracking-[0.3em]">
          Qualisoft SMI • Checklist Conformité ISO 9001:2015 • Conforme aux exigences ANSD Sénégal
        </p>
        <p className="text-[8px] font-bold text-slate-600 uppercase italic tracking-[0.3em] mt-1">
          §4 Contexte • §5 Leadership • §6 Planification • §7 Support • §8 Réalisation • §9 Évaluation • §10 Amélioration
        </p>
      </footer>
    </div>
  );
}

function StatCard({ label, value, icon, color, target }: any) {
  return (
    <div className={`${color} rounded-2xl p-5`}>
      <div className="flex items-center justify-between mb-3">
        <div className="p-2 bg-white/10 rounded-lg">{icon}</div>
        {target && (
          <span className="text-[9px] font-black bg-white/20 px-2 py-0.5 rounded-full">
            Cible: {target}
          </span>
        )}
      </div>
      <p className="text-[9px] font-black uppercase text-white/70 mb-1">{label}</p>
      <p className="text-2xl font-black text-white">{value}</p>
    </div>
  );
}

function RecommendationItem({ priority, title, description }: any) {
  const priorityConfig = {
    'CRITIQUE': { color: 'text-red-400', bg: 'bg-red-500/20' },
    'ÉLEVÉE': { color: 'text-amber-400', bg: 'bg-amber-500/20' },
    'MOYENNE': { color: 'text-blue-400', bg: 'bg-blue-500/20' }
  };
  
  const config = priorityConfig[priority as keyof typeof priorityConfig] || priorityConfig['MOYENNE'];
  
  return (
    <div className={`${config.bg} border border-current/30 rounded-xl p-4`}>
      <div className="flex items-start gap-3">
        <div className={`shrink-0 ${config.color} font-black text-[10px] uppercase tracking-widest px-2 py-0.5 rounded`}>
          {priority}
        </div>
        <div>
          <h3 className="font-black text-white mb-1">{title}</h3>
          <p className="text-[10px] text-slate-300 italic">{description}</p>
        </div>
      </div>
    </div>
  );
}

//import { RefreshCw } from 'lucide-react';