'use client';

import React, { useEffect, useState } from 'react';
import apiClient from '@/core/api/api-client';
import { 
  FileText, Plus, CheckCircle, XCircle, AlertTriangle, 
  Download, Search, Filter, Calendar, Users, Leaf
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function SenegalLegalPage() {
  const [requirements, setRequirements] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    SLR_Category: 'Travail',
    SLR_Title: '',
    SLR_Description: '',
    SLR_Reference: '',
    SLR_Authority: '',
    SLR_Deadline: '',
    SLR_Evidence: '',
    SLR_Comment: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [resRequirements, resStats] = await Promise.all([
        apiClient.get('/senegal-legal'),
        apiClient.get('/senegal-legal/stats')
      ]);
      setRequirements(resRequirements.data.requirements);
      setStats(resStats.data);
    } catch (error) {
      console.error('Erreur chargement exigences légales:', error);
      toast.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.post('/senegal-legal', formData);
      toast.success('Exigence légale ajoutée avec succès');
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      console.error('Erreur création exigence:', error);
      toast.error('Erreur lors de la création de l\'exigence légale');
    }
  };

  const handleUpdateStatus = async (id: string, status: string, evidence?: string) => {
    try {
      await apiClient.patch(`/senegal-legal/${id}/status`, { status, evidence });
      toast.success('Statut mis à jour avec succès');
      fetchData();
    } catch (error) {
      console.error('Erreur mise à jour statut:', error);
      toast.error('Erreur lors de la mise à jour du statut');
    }
  };

  const handleGenerateReport = async () => {
    try {
      const response = await apiClient.get('/senegal-legal/report', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `rapport-conformite-legale-${new Date().toISOString().split('T')[0]}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Rapport généré avec succès');
    } catch (error) {
      console.error('Erreur génération rapport:', error);
      toast.error('Erreur lors de la génération du rapport');
    }
  };

  if (loading) {
    return (
      <div className="ml-72 h-screen flex items-center justify-center bg-[#0B0F1A]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mb-4"></div>
          <p className="text-slate-500 font-black uppercase italic text-[10px] tracking-widest">
            Chargement des exigences légales...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="ml-72 min-h-screen bg-[#0B0F1A] text-white font-sans p-8">
      <header className="mb-8 border-b border-white/5 pb-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-6xl font-black uppercase italic tracking-tighter">
              Conformité <span className="text-blue-500">Légale Sénégal</span>
            </h1>
            <p className="text-slate-500 font-bold text-[10px] uppercase tracking-[0.4em] mt-2 italic">
              Respect des textes réglementaires • ANSD • Ministère du Travail • DGID
            </p>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={handleGenerateReport}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-4 rounded-2xl font-black uppercase text-[10px] flex items-center gap-2 transition-all shadow-lg"
            >
              <Download size={18} /> Générer Rapport
            </button>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-4 rounded-2xl font-black uppercase text-[10px] flex items-center gap-2 transition-all shadow-lg"
            >
              <Plus size={18} /> Nouvelle Exigence
            </button>
          </div>
        </div>

        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <StatCard 
              label="Total Exigences" 
              value={stats.total} 
              icon={<FileText className="text-blue-500" />} 
            />
            <StatCard 
              label="Conformes" 
              value={stats.compliant} 
              icon={<CheckCircle className="text-emerald-500" />} 
            />
            <StatCard 
              label="Non Conformes" 
              value={stats.nonCompliant} 
              icon={<XCircle className="text-red-500" />} 
            />
            <StatCard 
              label="Taux de Conformité" 
              value={`${stats.complianceRate}%`} 
              icon={<AlertTriangle className="text-amber-500" />} 
            />
          </div>
        )}
      </header>

      <div className="bg-slate-900/40 border border-white/5 rounded-3xl overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-white/5">
            <tr className="text-[10px] font-black uppercase text-slate-500 italic tracking-widest border-b border-white/5">
              <th className="p-6">Catégorie / Titre</th>
              <th className="p-6">Référence Légale</th>
              <th className="p-6">Autorité</th>
              <th className="p-6">Échéance</th>
              <th className="p-6">Statut</th>
              <th className="p-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {requirements.map((req) => (
              <tr key={req.SLR_Id} className="hover:bg-white/5 transition-colors">
                <td className="p-6">
                  <span className="text-[9px] font-black uppercase bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded">
                    {req.SLR_Category}
                  </span>
                  <p className="font-black mt-2">{req.SLR_Title}</p>
                  <p className="text-[10px] text-slate-400 mt-1 line-clamp-2">{req.SLR_Description}</p>
                </td>
                <td className="p-6">
                  <p className="text-[10px] font-bold">{req.SLR_Reference}</p>
                </td>
                <td className="p-6">
                  <p className="text-[10px] font-bold">{req.SLR_Authority}</p>
                </td>
                <td className="p-6">
                  {req.SLR_Deadline && (
                    <div className="flex items-center gap-2">
                      <Calendar size={16} className="text-amber-400" />
                      <span className="text-[10px] font-bold">
                        {new Date(req.SLR_Deadline).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                  )}
                </td>
                <td className="p-6">
                  <StatusBadge status={req.SLR_Status} />
                </td>
                <td className="p-6 text-right">
                  <div className="flex justify-end gap-2">
                    <button 
                      onClick={() => handleUpdateStatus(req.SLR_Id, 'RESPECTEE', req.SLR_Evidence)}
                      className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg hover:bg-emerald-500/30 transition-colors"
                      title="Marquer comme respectée"
                    >
                      <CheckCircle size={18} />
                    </button>
                    <button 
                      onClick={() => handleUpdateStatus(req.SLR_Id, 'NON_CONFORME')}
                      className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                      title="Marquer comme non conforme"
                    >
                      <XCircle size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <LegalRequirementModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          onSubmit={handleSubmit}
          formData={formData}
          setFormData={setFormData}
        />
      )}
    </div>
  );
}

function StatCard({ label, value, icon }: any) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="p-2 bg-white/10 rounded-lg">{icon}</div>
        <span className="text-2xl font-black">{value}</span>
      </div>
      <p className="text-[9px] font-black uppercase text-slate-500">{label}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const config = {
    'A_RESPECTER': { label: 'À Respecter', color: 'bg-blue-500/20 text-blue-300' },
    'RESPECTEE': { label: 'Respectée', color: 'bg-emerald-500/20 text-emerald-300' },
    'NON_CONFORME': { label: 'Non Conforme', color: 'bg-red-500/20 text-red-300' },
    'EN_COURS': { label: 'En Cours', color: 'bg-amber-500/20 text-amber-300' }
  };
  
  const { label, color } = config[status as keyof typeof config] || config.A_RESPECTER;
  
  return (
    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${color} border border-current/30`}>
      {label}
    </span>
  );
}

function LegalRequirementModal({ isOpen, onClose, onSubmit, formData, setFormData }: any) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#0B0F1A] border border-white/10 rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="p-8 border-b border-white/5">
          <h2 className="text-3xl font-black uppercase">Nouvelle Exigence Légale</h2>
          <p className="text-slate-500 text-[10px] mt-2 uppercase tracking-widest">
            Conformité réglementaire Sénégal
          </p>
        </div>
        
        <form onSubmit={onSubmit} className="p-8 space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="text-[10px] font-black uppercase text-slate-500 mb-2 block">Catégorie</label>
              <select
                value={formData.SLR_Category}
                onChange={(e) => setFormData({...formData, SLR_Category: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white"
              >
                <option value="Travail">Travail</option>
                <option value="Environnement">Environnement</option>
                <option value="Fiscalité">Fiscalité</option>
                <option value="Santé Sécurité">Santé Sécurité</option>
                <option value="Commerce">Commerce</option>
              </select>
            </div>
            
            <div>
              <label className="text-[10px] font-black uppercase text-slate-500 mb-2 block">Autorité</label>
              <input
                type="text"
                value={formData.SLR_Authority}
                onChange={(e) => setFormData({...formData, SLR_Authority: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white"
                placeholder="Ex: ANSD, Ministère Travail, DGID"
              />
            </div>
          </div>
          
          <div>
            <label className="text-[10px] font-black uppercase text-slate-500 mb-2 block">Titre de l'exigence</label>
            <input
              type="text"
              required
              value={formData.SLR_Title}
              onChange={(e) => setFormData({...formData, SLR_Title: e.target.value})}
              className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white"
              placeholder="Ex: Déclaration annuelle des salaires"
            />
          </div>
          
          <div>
            <label className="text-[10px] font-black uppercase text-slate-500 mb-2 block">Description</label>
            <textarea
              value={formData.SLR_Description}
              onChange={(e) => setFormData({...formData, SLR_Description: e.target.value})}
              className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white h-32"
              placeholder="Description détaillée de l'exigence légale"
            />
          </div>
          
          <div>
            <label className="text-[10px] font-black uppercase text-slate-500 mb-2 block">Référence Légale</label>
            <input
              type="text"
              required
              value={formData.SLR_Reference}
              onChange={(e) => setFormData({...formData, SLR_Reference: e.target.value})}
              className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white"
              placeholder="Ex: Code du Travail Sénégalais, Art. 123"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="text-[10px] font-black uppercase text-slate-500 mb-2 block">Échéance</label>
              <input
                type="date"
                value={formData.SLR_Deadline}
                onChange={(e) => setFormData({...formData, SLR_Deadline: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white"
              />
            </div>
            
            <div>
              <label className="text-[10px] font-black uppercase text-slate-500 mb-2 block">Preuve (URL)</label>
              <input
                type="url"
                value={formData.SLR_Evidence}
                onChange={(e) => setFormData({...formData, SLR_Evidence: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white"
                placeholder="https://..."
              />
            </div>
          </div>
          
          <div>
            <label className="text-[10px] font-black uppercase text-slate-500 mb-2 block">Commentaire</label>
            <textarea
              value={formData.SLR_Comment}
              onChange={(e) => setFormData({...formData, SLR_Comment: e.target.value})}
              className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white h-24"
              placeholder="Commentaires supplémentaires"
            />
          </div>
          
          <div className="flex justify-end gap-4 pt-6 border-t border-white/5">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-slate-800 hover:bg-slate-700 rounded-xl font-black uppercase text-[10px] transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl font-black uppercase text-[10px] transition-colors flex items-center gap-2"
            >
              <Plus size={16} /> Ajouter l'Exigence
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}