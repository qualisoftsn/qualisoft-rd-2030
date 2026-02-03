'use client';

import React, { useEffect, useState, useCallback } from 'react';
import apiClient from '@/core/api/api-client';
import { 
  FileText, Plus, CheckCircle, XCircle, AlertTriangle, 
  Download, Calendar, ShieldCheck, X, Save, Loader2
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const cn = (...classes: any[]) => classes.filter(Boolean).join(' ');

export default function SenegalLegalPage() {
  const [requirements, setRequirements] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
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

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [resRequirements, resStats] = await Promise.all([
        apiClient.get('/senegal-legal'),
        apiClient.get('/senegal-legal/stats')
      ]);
      setRequirements(resRequirements.data.requirements || []);
      setStats(resStats.data);
    } catch (error) {
      toast.error('Erreur de liaison avec le Noyau Légal');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    
    setSubmitting(true);
    const tid = toast.loading("Enregistrement de l'exigence...");
    try {
      await apiClient.post('/senegal-legal', formData);
      toast.success('Exigence légale indexée', { id: tid });
      setIsModalOpen(false);
      setFormData({
        SLR_Category: 'Travail', SLR_Title: '', SLR_Description: '',
        SLR_Reference: '', SLR_Authority: '', SLR_Deadline: '',
        SLR_Evidence: '', SLR_Comment: ''
      });
      fetchData();
    } catch (error) {
      toast.error('Erreur : Vérifiez les champs ou le serveur', { id: tid });
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await apiClient.patch(`/senegal-legal/${id}/status`, { status });
      toast.success('Conformité mise à jour');
      fetchData();
    } catch (error) {
      toast.error('Erreur lors de la mise à jour');
    }
  };

  if (loading) return (
    <div className="ml-72 h-screen flex items-center justify-center bg-[#0B0F1A]">
      <div className="text-center">
        <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4 mx-auto" />
        <p className="text-slate-500 font-black uppercase italic text-[10px] tracking-[0.4em]">Veille Réglementaire en cours...</p>
      </div>
    </div>
  );

  return (
    <div className="ml-72 min-h-screen bg-[#0B0F1A] text-white font-sans p-10 uppercase italic font-black overflow-x-hidden">
      <style jsx global>{`::-webkit-scrollbar { display: none !important; }`}</style>

      <header className="mb-12 border-b border-white/5 pb-10 flex justify-between items-end">
        <div>
          <h1 className="text-6xl tracking-tighter leading-none">CONFORMITÉ <span className="text-blue-600">LÉGALE</span></h1>
          <p className="text-slate-500 text-[10px] tracking-[0.4em] mt-4 flex items-center gap-2">
            <ShieldCheck size={14} className="text-emerald-500" /> SÉNÉGAL • VEILLE RÉGLEMENTAIRE ISO 9001
          </p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-500 px-10 py-5 rounded-2xl text-[10px] flex items-center gap-3 transition-all active:scale-95 shadow-2xl shadow-blue-900/40"
        >
          <Plus size={20} /> NOUVELLE EXIGENCE
        </button>
      </header>

      {stats && (
        <div className="grid grid-cols-4 gap-8 mb-12">
          <StatCard label="Exigences" value={stats.total} color="blue" icon={<FileText />} />
          <StatCard label="Conformes" value={stats.compliant} color="emerald" icon={<CheckCircle />} />
          <StatCard label="Écarts" value={stats.nonCompliant} color="red" icon={<XCircle />} />
          <StatCard label="Taux" value={`${stats.complianceRate}%`} color="amber" icon={<AlertTriangle />} />
        </div>
      )}

      <div className="bg-slate-900/20 border border-white/5 rounded-[3rem] overflow-hidden backdrop-blur-xl">
        <table className="w-full text-left">
          <thead>
            <tr className="text-[10px] text-slate-500 border-b border-white/5 italic uppercase">
              <th className="p-8">TEXTE / RÉFÉRENCE</th>
              <th className="p-8">AUTORITÉ</th>
              <th className="p-8">ÉCHÉANCE</th>
              <th className="p-8">STATUT</th>
              <th className="p-8 text-right">ACTIONS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {requirements.map((req) => (
              <tr key={req.SLR_Id} className="hover:bg-blue-600/5 transition-all group">
                <td className="p-8">
                  <span className="text-[8px] bg-blue-500/10 text-blue-400 px-3 py-1 rounded-full">{req.SLR_Category}</span>
                  <p className="mt-3 text-sm">{req.SLR_Title}</p>
                  <p className="text-[9px] text-slate-500 mt-1 line-clamp-1 italic lowercase font-medium">{req.SLR_Reference}</p>
                </td>
                <td className="p-8 text-[11px] text-slate-400">{req.SLR_Authority}</td>
                <td className="p-8">
                  {req.SLR_Deadline && (
                    <div className="flex items-center gap-2 text-amber-500 text-[10px]">
                      <Calendar size={14} /> {new Date(req.SLR_Deadline).toLocaleDateString()}
                    </div>
                  )}
                </td>
                <td className="p-8"><StatusBadge status={req.SLR_Status} /></td>
                <td className="p-8 text-right">
                  <div className="flex justify-end gap-3">
                    <button onClick={() => handleUpdateStatus(req.SLR_Id, 'RESPECTEE')} className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl hover:bg-emerald-500 transition-all hover:text-white"><CheckCircle size={18} /></button>
                    <button onClick={() => handleUpdateStatus(req.SLR_Id, 'NON_CONFORME')} className="p-3 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 transition-all hover:text-white"><XCircle size={18} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center p-6">
          <div className="bg-[#0B0F1A] border border-white/10 rounded-[4rem] w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-4xl relative">
            <div className="p-10 border-b border-white/5 flex justify-between items-center sticky top-0 bg-[#0B0F1A]/90 backdrop-blur-md z-10">
              <div>
                <h2 className="text-4xl">NOUVELLE <span className="text-blue-600">EXIGENCE</span></h2>
                <p className="text-slate-500 text-[10px] mt-2 tracking-widest italic font-bold">INDEXATION RÉGLEMENTAIRE SÉNÉGAL</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-4 hover:bg-red-500/10 text-slate-500 hover:text-red-500 transition-all rounded-full"><X size={32} /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-12 space-y-8">
              <div className="grid grid-cols-2 gap-10">
                <div className="space-y-3">
                  <label className="text-[10px] text-slate-500 ml-4">CATÉGORIE *</label>
                  <select
                    value={formData.SLR_Category}
                    onChange={(e) => setFormData({...formData, SLR_Category: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 text-[11px] outline-none focus:border-blue-500 transition-all"
                  >
                    {['Travail', 'Environnement', 'Fiscalité', 'Santé Sécurité', 'Commerce'].map(c => <option key={c} value={c} className="bg-[#0B0F1A]">{c}</option>)}
                  </select>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] text-slate-500 ml-4">AUTORITÉ ÉMETTRICE</label>
                  <input
                    value={formData.SLR_Authority}
                    onChange={(e) => setFormData({...formData, SLR_Authority: e.target.value.toUpperCase()})}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 text-[11px] outline-none focus:border-blue-500"
                    placeholder="ANSD, DGID, MIN. TRAVAIL..."
                  />
                </div>
              </div>
              
              <div className="space-y-3">
                <label className="text-[10px] text-slate-500 ml-4">TITRE DE L&apos;EXIGENCE *</label>
                <input
                  required
                  value={formData.SLR_Title}
                  onChange={(e) => setFormData({...formData, SLR_Title: e.target.value.toUpperCase()})}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 text-[11px] outline-none focus:border-blue-500"
                  placeholder="NOM DU TEXTE OU DE LA DÉCLARATION..."
                />
              </div>
              
              <div className="space-y-3">
                <label className="text-[10px] text-slate-500 ml-4">DESCRIPTION DÉTAILLÉE</label>
                <textarea
                  value={formData.SLR_Description}
                  onChange={(e) => setFormData({...formData, SLR_Description: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 text-[11px] outline-none focus:border-blue-500 h-32 lowercase font-medium"
                />
              </div>

              <div className="space-y-3">
                <label className="text-[10px] text-slate-500 ml-4">RÉFÉRENCE LÉGALE (ART. / LOI) *</label>
                <input
                  required
                  value={formData.SLR_Reference}
                  onChange={(e) => setFormData({...formData, SLR_Reference: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 text-[11px] outline-none focus:border-blue-500"
                  placeholder="EX: CODE DU TRAVAIL, ART. L.12..."
                />
              </div>
              
              <div className="grid grid-cols-2 gap-10">
                <div className="space-y-3">
                  <label className="text-[10px] text-slate-500 ml-4">DATE D&apos;ÉCHÉANCE</label>
                  <input
                    type="date"
                    value={formData.SLR_Deadline}
                    onChange={(e) => setFormData({...formData, SLR_Deadline: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 text-[11px] outline-none focus:border-blue-500"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] text-slate-500 ml-4">PREUVE (URL)</label>
                  <input
                    type="url"
                    value={formData.SLR_Evidence}
                    onChange={(e) => setFormData({...formData, SLR_Evidence: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 text-[11px] outline-none focus:border-blue-500 lowercase font-medium"
                    placeholder="https://qualisoft.sn/..."
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-blue-600 py-10 rounded-3xl font-black text-xs tracking-[0.5em] flex items-center justify-center gap-4 hover:bg-blue-500 transition-all disabled:opacity-50"
              >
                {submitting ? <Loader2 className="animate-spin" /> : <Save size={20} />} AJOUTER AU REGISTRE LÉGAL
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, icon, color }: any) {
  const colors: any = {
    blue: 'text-blue-500 bg-blue-500/5',
    emerald: 'text-emerald-500 bg-emerald-500/5',
    red: 'text-red-500 bg-red-500/5',
    amber: 'text-amber-500 bg-amber-500/5'
  };
  return (
    <div className="bg-white/2 border border-white/5 rounded-[2rem] p-8 flex flex-col gap-4">
      <div className={cn("p-4 rounded-xl w-fit", colors[color])}>{icon}</div>
      <div>
        <p className="text-4xl leading-none">{value}</p>
        <p className="text-[9px] text-slate-500 mt-3 tracking-widest">{label}</p>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const config = {
    'A_RESPECTER': { label: 'À Respecter', color: 'text-blue-400 bg-blue-400/10 border-blue-400/20' },
    'RESPECTEE': { label: 'Respectée', color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' },
    'NON_CONFORME': { label: 'Non Conforme', color: 'text-red-400 bg-red-400/10 border-red-400/20' },
    'EN_COURS': { label: 'En Cours', color: 'text-amber-400 bg-amber-400/10 border-amber-400/20' }
  };
  const { label, color } = config[status as keyof typeof config] || config.A_RESPECTER;
  return <span className={cn("px-4 py-1.5 rounded-full text-[8px] border uppercase", color)}>{label}</span>;
}