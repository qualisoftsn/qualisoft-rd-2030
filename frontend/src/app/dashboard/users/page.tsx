/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Users, UserPlus, Mail, Shield, MapPin, 
  Trash2, Loader2, Search, X, Save, 
  ShieldCheck, Building, Filter, GitBranch, Star, ChevronRight
} from 'lucide-react';
import apiClient from '@/core/api/api-client';
import { toast } from 'react-hot-toast';

/**
 * 🏛️ INTERFACES ÉLITE (ZÉRO ANY)
 */
interface Site {
  S_Id: string;
  S_Name: string;
}

interface OrgUnit {
  OU_Id: string;
  OU_Name: string;
}

interface Processus {
  PR_Id: string;
  PR_Code: string;
  PR_Libelle: string;
}

interface User {
  U_Id: string;
  U_FirstName: string;
  U_LastName: string;
  U_Email: string;
  U_Role: 'SUPER_ADMIN' | 'ADMIN' | 'USER' | 'PILOTE' | 'COPILOTE';
  U_IsActive: boolean;
  U_Site?: Site;
  U_OrgUnit?: OrgUnit;
  U_AssignedProcess?: Processus; // 🔗 Le lien crucial
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [units, setUnits] = useState<OrgUnit[]>([]);
  const [processes, setProcesses] = useState<Processus[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');

  const [formData, setFormData] = useState({
    U_FirstName: '',
    U_LastName: '',
    U_Email: '',
    U_Password: 'Password123!',
    U_Role: 'USER',
    U_SiteId: '',
    U_OrgUnitId: '',
    U_AssignedProcessId: '' // 🚀 Affectation cockpit
  });

  /**
   * 📡 SYNCHRONISATION MULTI-SOURCES
   */
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [uRes, sRes, oRes, pRes] = await Promise.all([
        apiClient.get<User[]>('/users'),
        apiClient.get<Site[]>('/sites'),
        apiClient.get<OrgUnit[]>('/org-units'),
        apiClient.get<Processus[]>('/processus')
      ]);
      setUsers(uRes.data);
      setSites(sRes.data);
      setUnits(oRes.data);
      setProcesses(pRes.data);
    } catch (error: unknown) {
      toast.error("Erreur de liaison avec le Noyau Qualisoft");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  /**
   * ✍️ HABILITATION D'UN NOUVEL AGENT
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.post('/users', formData);
      toast.success("Agent habilité et qualifié avec succès");
      setShowModal(false);
      setFormData({ 
        U_FirstName: '', U_LastName: '', U_Email: '', 
        U_Password: 'Password123!', U_Role: 'USER', U_SiteId: '', 
        U_OrgUnitId: '', U_AssignedProcessId: '' 
      });
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Échec de création");
    }
  };

  /**
   * 📁 ARCHIVAGE LOGIQUE
   */
  const handleArchive = async (id: string) => {
    if (!confirm("Voulez-vous retirer les accès de ce collaborateur ?")) return;
    try {
      await apiClient.delete(`/users/${id}`);
      toast.success("Profil archivé");
      fetchData();
    } catch (error: unknown) {
      toast.error("Erreur lors de l'archivage");
    }
  };

  const filteredUsers = users.filter(user => 
    user.U_Email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.U_FirstName + " " + user.U_LastName).toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.U_Role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-[#F8FAFC] ml-72">
      <div className="flex flex-col items-center gap-4 text-[#2563eb]">
        <Loader2 className="animate-spin" size={48} />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] italic">Synchronisation RH...</p>
      </div>
    </div>
  );

  return (
    <div className="p-10 space-y-10 bg-[#F8FAFC] min-h-screen font-sans selection:bg-blue-100 ml-72 text-left italic">
      
      {/* 🚀 HEADER PREMIUM */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black uppercase italic tracking-tighter text-slate-900 flex items-center gap-4 leading-none">
            <div className="p-3 bg-white rounded-2xl shadow-sm border border-slate-100">
              <Users className="text-[#2563eb]" size={32} />
            </div>
            Annuaire <span className="text-[#2563eb]">Collaborateurs</span>
          </h1>
          <p className="text-slate-400 font-bold mt-3 text-[11px] uppercase tracking-widest flex items-center gap-2">
            <ShieldCheck size={14} className="text-green-500" />
            Qualification des ressources et autorités (§7.2)
          </p>
        </div>
        
        <button 
          onClick={() => setShowModal(true)}
          className="group bg-slate-900 hover:bg-[#2563eb] text-white px-8 py-5 rounded-4xl font-black uppercase text-[11px] shadow-xl hover:shadow-blue-200 flex items-center gap-3 transition-all active:scale-95 italic"
        >
          <UserPlus size={18} className="group-hover:rotate-12 transition-transform" />
          Habiliter un Pilote
        </button>
      </div>

      {/* 🔍 BARRE DE RECHERCHE */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-xl">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text"
            placeholder="Rechercher par nom, rôle ou processus..."
            className="w-full bg-white border border-slate-100 rounded-4xl pl-16 pr-8 py-5 text-[12px] font-bold outline-none focus:ring-4 focus:ring-blue-500/5 shadow-sm transition-all placeholder:text-slate-300 uppercase italic"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="p-5 bg-white rounded-3xl text-slate-400 hover:text-[#2563eb] shadow-sm border border-slate-100 transition-all active:scale-90">
          <Filter size={20} />
        </button>
      </div>

      {/* 📋 TABLEAU MASTER RACI */}
      <div className="bg-white rounded-[3rem] shadow-2xl shadow-slate-200/50 border border-slate-50 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50/50 text-[9px] font-black uppercase text-slate-400 border-b border-slate-100">
            <tr>
              <th className="px-10 py-6 tracking-widest">Identité & Qualification</th>
              <th className="px-10 py-6 tracking-widest">Rôle & Autorité</th>
              <th className="px-10 py-6 tracking-widest">Périmètre Pilotage</th>
              <th className="px-10 py-6 text-right tracking-widest">Contrôle</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filteredUsers.map((user) => (
              <tr key={user.U_Id} className={`group hover:bg-slate-50/80 transition-all duration-300 ${!user.U_IsActive ? 'opacity-30 grayscale' : ''}`}>
                <td className="px-10 py-8">
                  <div className="flex items-center gap-6">
                    <div className="w-14 h-14 rounded-[1.2rem] bg-slate-100 flex items-center justify-center text-slate-800 font-black text-sm uppercase group-hover:bg-[#2563eb] group-hover:text-white group-hover:rotate-3 transition-all">
                      {user.U_FirstName?.[0]}{user.U_LastName?.[0]}
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-900 uppercase tracking-tighter italic">{user.U_FirstName} {user.U_LastName}</p>
                      <p className="text-[10px] text-slate-400 font-bold flex items-center gap-1 mt-1 lowercase italic">
                        <Mail size={10} className="text-[#2563eb]" /> {user.U_Email}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-10 py-8">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50/50 rounded-lg border border-blue-100/50">
                    <ShieldCheck className="text-[#2563eb]" size={12} />
                    <span className="text-[9px] font-black text-[#2563eb] uppercase">{user.U_Role}</span>
                  </div>
                </td>
                <td className="px-10 py-8">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-[10px] font-black text-slate-700 uppercase italic">
                      <Building size={12} className="text-[#2563eb] opacity-30" /> {user.U_Site?.S_Name || '-'} / {user.U_OrgUnit?.OU_Name || '-'}
                    </div>
                    {user.U_AssignedProcess && (
                      <div className="flex items-center gap-2 text-[9px] text-[#2563eb] font-black italic">
                        <GitBranch size={10} className="animate-pulse" /> {user.U_AssignedProcess.PR_Libelle}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-10 py-8 text-right">
                  <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                    <button 
                      onClick={() => handleArchive(user.U_Id)}
                      className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                    >
                      <Trash2 size={18} />
                    </button>
                    <div className="p-3 text-slate-200"><ChevronRight size={18}/></div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 🗄️ MODAL DE CRÉATION & QUALIFICATION */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xl z-50 flex items-center justify-center p-6">
          <div className="bg-white rounded-[3.5rem] shadow-4xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300 border border-white">
            <div className="p-10 bg-slate-50/50 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h2 className="text-3xl font-black uppercase italic tracking-tighter">Habilitation Agent</h2>
                <p className="text-[10px] font-bold text-slate-400 uppercase mt-2 tracking-widest italic flex items-center gap-2">
                  <ShieldCheck size={12} className="text-green-500" /> Enregistrement dans le Noyau de Confiance
                </p>
              </div>
              <button onClick={() => setShowModal(false)} className="w-12 h-12 flex items-center justify-center rounded-2xl hover:bg-white text-slate-400 hover:text-red-500 transition-all shadow-sm active:scale-90"><X size={24}/></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-10 grid grid-cols-2 gap-8 bg-white">
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest ml-1 italic">Prénom</label>
                <input required className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-xs font-black uppercase italic outline-none focus:ring-4 focus:ring-blue-500/10 transition-all" 
                  value={formData.U_FirstName} onChange={e => setFormData({...formData, U_FirstName: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest ml-1 italic">Nom</label>
                <input required className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-xs font-black uppercase italic outline-none focus:ring-4 focus:ring-blue-500/10 transition-all" 
                  value={formData.U_LastName} onChange={e => setFormData({...formData, U_LastName: e.target.value})} />
              </div>
              <div className="col-span-2 space-y-2">
                <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest ml-1 italic">Email Professionnel</label>
                <input required type="email" className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-xs font-black outline-none focus:ring-4 focus:ring-blue-500/10 transition-all lowercase italic" 
                  value={formData.U_Email} onChange={e => setFormData({...formData, U_Email: e.target.value})} />
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest ml-1 italic">Rôle & Autorité</label>
                <select className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-[10px] font-black uppercase outline-none focus:ring-4 focus:ring-blue-500/10 transition-all italic" 
                  value={formData.U_Role} onChange={e => setFormData({...formData, U_Role: e.target.value as any})}>
                  <option value="USER">Collaborateur Standard</option>
                  <option value="PILOTE">Pilote de Processus</option>
                  <option value="ADMIN">Administrateur / RQ</option>
                </select>
              </div>

              {/* 🚀 QUALIFICATION PROCESSUS (TUNNELING) */}
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase text-[#2563eb] tracking-widest ml-1 italic flex items-center gap-2">
                  <GitBranch size={10} /> Affectation Cockpit
                </label>
                <select className="w-full bg-blue-50/30 border border-blue-100 rounded-2xl px-6 py-4 text-[10px] font-black uppercase outline-none focus:ring-4 focus:ring-blue-500/10 transition-all italic text-[#2563eb]" 
                  value={formData.U_AssignedProcessId} onChange={e => setFormData({...formData, U_AssignedProcessId: e.target.value})}>
                  <option value="">-- Aucun Processus --</option>
                  {processes.map(p => <option key={p.PR_Id} value={p.PR_Id}>{p.PR_Code} - {p.PR_Libelle}</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest ml-1 italic">Site</label>
                <select required className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-[10px] font-black uppercase outline-none focus:ring-4 focus:ring-blue-500/10 transition-all italic" 
                  value={formData.U_SiteId} onChange={e => setFormData({...formData, U_SiteId: e.target.value})}>
                  <option value="">-- Choisir Site --</option>
                  {sites.map(s => <option key={s.S_Id} value={s.S_Id}>{s.S_Name}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest ml-1 italic">Unité Organique</label>
                <select required className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-[10px] font-black uppercase outline-none focus:ring-4 focus:ring-blue-500/10 transition-all italic" 
                  value={formData.U_OrgUnitId} onChange={e => setFormData({...formData, U_OrgUnitId: e.target.value})}>
                  <option value="">-- Choisir Unité --</option>
                  {units.map(u => <option key={u.OU_Id} value={u.OU_Id}>{u.OU_Name}</option>)}
                </select>
              </div>

              <div className="col-span-2 pt-6">
                <button type="submit" className="w-full bg-slate-900 hover:bg-[#2563eb] text-white font-black uppercase py-6 rounded-3xl text-[11px] shadow-2xl flex items-center justify-center gap-3 transition-all italic active:scale-95">
                  <Save size={18} /> Qualifier le Collaborateur
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}