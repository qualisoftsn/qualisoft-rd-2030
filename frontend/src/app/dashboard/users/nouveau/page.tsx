/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useEffect, useState, useCallback } from 'react';
import apiClient from '@/core/api/api-client';
import { 
  Users, Mail, Trash2, Loader2, Building2, 
  Layers, ShieldCheck, UserPlus, CheckCircle, 
  Crown, Zap, ChevronRight, X, Save, MapPin
} from 'lucide-react';

export default function UsersManagementPage() {
  const [members, setMembers] = useState<any[]>([]);
  const [sites, setSites] = useState<any[]>([]);
  const [depts, setDepts] = useState<any[]>([]);
  const [subscription, setSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    U_FirstName: '',
    U_LastName: '',
    U_Email: '',
    U_Password: 'Password123!', 
    U_Role: 'PILOTE',
    U_SiteId: '',
    U_DepartementId: '' 
  });

  const loadAllData = useCallback(async () => {
    setLoading(true);
    try {
      // ✅ ALIGNEMENT DES ROUTES : On cible /sites et /admin/departements
      const [uRes, sRes, dRes, subRes] = await Promise.all([
        apiClient.get('/users'),
        apiClient.get('/sites'),         
        apiClient.get('/admin/departements'),  
        apiClient.get('/subscriptions/my-plan')
      ]);

      console.log("DEBUG SITES:", sRes.data); // Vérifie ici si le tableau est vide []

      setMembers(uRes.data);
      setSites(sRes.data || []);
      setDepts(dRes.data || []);
      setSubscription(subRes.data);
    } catch (e) {
      console.error("Erreur de synchronisation de l'annuaire");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadAllData(); }, [loadAllData]);

  // ✅ LOGIQUE DE QUOTA : DÉBLOQUÉE POUR LE PLAN "GROUPE"
  const isPlanGroupe = subscription?.planName?.toUpperCase() === 'GROUPE';
  const usedCount = members.length;
  const limitCount = subscription?.usage?.pilotes?.limit || 5;
  const isFull = !isPlanGroupe && usedCount >= limitCount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.post('/users', formData);
      setFormData({ ...formData, U_FirstName: '', U_LastName: '', U_Email: '' });
      loadAllData();
      alert("Collaborateur créé avec succès.");
    } catch (err: any) {
      alert(err.response?.data?.message || "Erreur lors de la création.");
    }
  };

  if (loading) return (
    <div className="ml-72 h-screen flex flex-col items-center justify-center bg-[#0B0F1A] text-blue-500 font-black italic uppercase tracking-widest">
      <Loader2 className="animate-spin mb-4" size={40} />
      Synchronisation de l&apos;Annuaire...
    </div>
  );

  return (
    <div className="p-10 bg-[#0B0F1A] min-h-screen ml-72 text-white italic font-sans text-left">
      <header className="mb-12 border-b border-white/5 pb-8 flex justify-between items-end">
        <div>
          <h1 className="text-5xl font-black uppercase tracking-tighter italic leading-none">
            Habilitations <span className="text-blue-500">& RACI</span>
          </h1>
        </div>
        
        <div className="flex gap-4">
          <div className="bg-slate-900/50 border border-white/5 p-5 rounded-3xl min-w-48 text-right">
            <p className="text-[8px] font-black text-slate-500 uppercase mb-1">Plan</p>
            <p className="text-amber-500 font-black uppercase text-sm italic">{subscription?.planName || 'GROUPE'}</p>
          </div>
          <div className={`p-5 rounded-3xl min-w-48 border text-right ${isFull ? 'border-red-500/20 bg-red-500/5' : 'border-blue-500/20 bg-blue-500/5'}`}>
            <p className="text-[8px] font-black text-slate-500 uppercase mb-1">Quota</p>
            <p className="font-black uppercase text-sm italic text-blue-500">
              {isPlanGroupe ? 'ILLIMITÉ' : `${usedCount} / ${limitCount}`}
            </p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* FORMULAIRE */}
        <div className="lg:col-span-1">
          <form onSubmit={handleSubmit} className="bg-slate-900/40 p-8 rounded-[3rem] border border-white/10 space-y-4 shadow-2xl sticky top-10">
            <h3 className="text-xl font-black uppercase italic mb-6 text-blue-500 flex items-center gap-3">
              <UserPlus size={20} /> Nouvel Agent
            </h3>
            
            <input required placeholder="Prénom" className="w-full bg-white/5 border border-white/5 rounded-xl p-4 text-xs font-bold text-white outline-none focus:border-blue-500" 
              value={formData.U_FirstName} onChange={e => setFormData({ ...formData, U_FirstName: e.target.value })} />
            
            <input required placeholder="Nom" className="w-full bg-white/5 border border-white/5 rounded-xl p-4 text-xs font-bold text-white outline-none focus:border-blue-500" 
              value={formData.U_LastName} onChange={e => setFormData({ ...formData, U_LastName: e.target.value })} />

            <input required type="email" placeholder="Email Professionnel" className="w-full bg-white/5 border border-white/5 rounded-xl p-4 text-xs font-bold text-white outline-none focus:border-blue-500" 
              value={formData.U_Email} onChange={e => setFormData({ ...formData, U_Email: e.target.value })} />

            <div className="space-y-4 pt-4">
              <select className="w-full bg-white/5 border border-white/5 p-4 rounded-xl text-xs font-bold text-white italic" 
                value={formData.U_Role} onChange={e => setFormData({ ...formData, U_Role: e.target.value })}>
                <option value="PILOTE" className="bg-[#0B0F1A]">PILOTE PROCESSUS</option>
                <option value="ADMIN" className="bg-[#0B0F1A]">ADMIN / RQ</option>
              </select>

              {/* SELECT SITES */}
              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-500 uppercase ml-2 tracking-widest flex items-center gap-2"><MapPin size={10}/> Site</label>
                <select required className="w-full bg-white/5 border border-white/5 p-4 rounded-xl text-xs font-bold text-white italic" 
                  value={formData.U_SiteId} onChange={e => setFormData({ ...formData, U_SiteId: e.target.value, U_DepartementId: '' })}>
                  <option value="" className="bg-[#0B0F1A]">Choisir un Site...</option>
                  {sites.map(s => <option key={s.S_Id} value={s.S_Id} className="bg-[#0B0F1A]">{s.S_Name}</option>)}
                </select>
              </div>

              {/* SELECT DÉPARTEMENTS - SE DÉGRISE SI SITE CHOISI */}
              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-500 uppercase ml-2 tracking-widest flex items-center gap-2"><Layers size={10}/> Département</label>
                <select required disabled={!formData.U_SiteId} className="w-full bg-white/5 border border-white/5 p-4 rounded-xl text-xs font-bold text-white italic disabled:opacity-20 transition-all" 
                  value={formData.U_DepartementId} onChange={e => setFormData({ ...formData, U_DepartementId: e.target.value })}>
                  <option value="" className="bg-[#0B0F1A]">Choisir Département...</option>
                  {depts.filter(d => d.D_SiteId === formData.U_SiteId).map(d => (
                    <option key={d.D_Id} value={d.D_Id} className="bg-[#0B0F1A]">{d.D_Name}</option>
                  ))}
                </select>
              </div>
            </div>

            <button type="submit" disabled={isFull} className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-500 py-6 rounded-3xl font-black uppercase text-xs italic shadow-xl mt-6 transition-all">
              {isFull ? 'Quota Atteint' : 'Habiliter le Collaborateur'}
            </button>
          </form>
        </div>

        {/* LISTE DES MEMBRES */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-black uppercase italic flex items-center gap-3 mb-6 opacity-40">
            <Users size={20} /> Annuaire Actif ({members.length})
          </h2>

          <div className="grid gap-3">
            {members.map((u) => (
              <div key={u.U_Id} className="p-6 rounded-[2.5rem] border border-white/5 bg-white/2 flex items-center justify-between transition-all hover:border-blue-500/30 group shadow-lg">
                <div className="flex items-center gap-6">
                  <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center font-black text-sm italic shadow-lg text-white">
                    {u.U_FirstName[0]}{u.U_LastName[0]}
                  </div>
                  <div>
                    <h3 className="text-base font-black uppercase italic text-white flex items-center gap-3">
                      {u.U_FirstName} {u.U_LastName}
                      <CheckCircle size={14} className="text-blue-500" />
                    </h3>
                    <div className="flex flex-wrap items-center gap-4 mt-2.5 text-[9px] font-black text-slate-500 uppercase tracking-widest italic">
                      <span className="flex items-center gap-1.5"><Mail size={12} className="text-blue-600" /> {u.U_Email}</span>
                      <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 rounded-md border border-blue-500/10">{u.U_Role}</span>
                      <span className="flex items-center gap-1.5"><MapPin size={12} className="text-emerald-500" /> {u.U_Site?.S_Name || 'Siège'}</span>
                      <span className="flex items-center gap-1.5"><Layers size={12} className="text-amber-500" /> {u.U_Departement?.D_Name || 'SMI'}</span>
                    </div>
                  </div>
                </div>
                <Trash2 size={18} className="text-slate-700 hover:text-red-500 cursor-pointer transition-colors" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}