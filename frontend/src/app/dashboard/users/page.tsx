/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * 👥 NOM ABSOLU : src/app/dashboard/admin/users/page.tsx
 * FONCTION : Annuaire Master et Gestion des Habilitations (Matrice RACI).
 * RÔLE : Supervision des accès, qualification des pilotes et archivage logique.
 * CONFORMITÉ : ISO 9001 §7.2 (Compétence) et §5.3 (Rôles, responsabilités et autorités).
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Users, UserPlus, Mail, Shield, MapPin, 
  Trash2, Loader2, Search, X, Save, 
  ShieldCheck, Building, Filter, GitBranch, Star, ChevronRight, Activity
} from 'lucide-react';
import apiClient from '@/core/api/api-client';
import { toast } from 'react-hot-toast';

// --- INTERFACES DE DONNÉES SÉCURISÉES ---
interface Site { S_Id: string; S_Name: string; }
interface OrgUnit { OU_Id: string; OU_Name: string; }
interface Processus { PR_Id: string; PR_Code: string; PR_Libelle: string; }

interface User {
  U_Id: string;
  U_FirstName: string;
  U_LastName: string;
  U_Email: string;
  U_Role: 'SUPER_ADMIN' | 'ADMIN' | 'USER' | 'PILOTE' | 'COPILOTE';
  U_IsActive: boolean;
  U_Site?: Site;
  U_OrgUnit?: OrgUnit;
  U_AssignedProcess?: Processus; // Liaison critique pour le Cockpit
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [units, setUnits] = useState<OrgUnit[]>([]);
  const [processes, setProcesses] = useState<Processus[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Formulaire d'habilitation rapide
  const [formData, setFormData] = useState({
    U_FirstName: '',
    U_LastName: '',
    U_Email: '',
    U_Password: 'Password123!',
    U_Role: 'USER',
    U_SiteId: '',
    U_OrgUnitId: '',
    U_AssignedProcessId: '' 
  });

  /**
   * 📡 SYNCHRONISATION MULTI-RÉFÉRENTIELS
   * Récupère simultanément les agents et la structure organisationnelle pour garantir l'intégrité des relations.
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
      toast.error("Rupture de liaison avec le Noyau RH Qualisoft");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  /**
   * ✍️ HABILITATION ET QUALIFICATION D'UN AGENT
   * Enregistre l'agent et lui assigne son périmètre d'autorité.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.post('/users', formData);
      toast.success("Agent qualifié et habilité avec succès");
      setShowModal(false);
      // Reset complet du formulaire après succès
      setFormData({ 
        U_FirstName: '', U_LastName: '', U_Email: '', 
        U_Password: 'Password123!', U_Role: 'USER', U_SiteId: '', 
        U_OrgUnitId: '', U_AssignedProcessId: '' 
      });
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Échec de l'habilitation");
    }
  };

  /**
   * 📁 ARCHIVAGE LOGIQUE (§7.2)
   * Désactive les accès sans supprimer les données historiques (crucial pour la traçabilité des audits).
   */
  const handleArchive = async (id: string) => {
    if (!confirm("ORDRE DE SÉCURITÉ : Voulez-vous révoquer les accès de ce collaborateur ?")) return;
    try {
      await apiClient.delete(`/users/${id}`);
      toast.success("Profil archivé et accès révoqués");
      fetchData();
    } catch (error: unknown) {
      toast.error("Erreur lors de la révocation");
    }
  };

  // Logique de filtrage instantané
  const filteredUsers = users.filter(user => 
    user.U_Email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.U_FirstName + " " + user.U_LastName).toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.U_Role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-[#F8FAFC] ml-72">
      <div className="flex flex-col items-center gap-4 text-[#2563eb]">
        <Loader2 className="animate-spin" size={48} />
        <p className="text-[10px] font-black uppercase tracking-[0.5em] italic">Synchronisation RH Elite...</p>
      </div>
    </div>
  );

  return (
    <div className="p-10 space-y-10 bg-[#F8FAFC] min-h-screen font-sans ml-72 text-left italic">
      
      {/* 🚀 HEADER PREMIUM : GESTION DES AUTORITÉS */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-5xl font-black uppercase italic tracking-tighter text-slate-900 flex items-center gap-5 leading-none">
            <div className="p-4 bg-white rounded-3xl shadow-xl border border-slate-100 group">
              <Users className="text-[#2563eb] group-hover:rotate-6 transition-transform" size={40} />
            </div>
            Annuaire <span className="text-[#2563eb]">RACI</span>
          </h1>
          <p className="text-slate-400 font-bold mt-4 text-[11px] uppercase tracking-[0.4em] flex items-center gap-3">
            <ShieldCheck size={16} className="text-green-500" />
            Qualification et Habilitation des Ressources (§7.2 ISO)
          </p>
        </div>
        
        <button 
          onClick={() => setShowModal(true)}
          className="group bg-slate-900 hover:bg-[#2563eb] text-white px-10 py-6 rounded-4xl font-black uppercase text-[11px] shadow-2xl transition-all active:scale-95 flex items-center gap-4 cursor-pointer border-none"
        >
          <UserPlus size={20} className="group-hover:scale-110 transition-transform" />
          Habiliter un Pilote
        </button>
      </div>

      {/* 🔍 BARRE DE RECHERCHE DYNAMIQUE */}
      <div className="flex items-center gap-6">
        <div className="relative flex-1 max-w-2xl group">
          <Search className="absolute left-8 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#2563eb] transition-colors" size={20} />
          <input 
            type="text"
            placeholder="RECHERCHER PAR NOM, RÔLE OU PROCESSUS..."
            className="w-full bg-white border border-slate-100 rounded-4xl pl-20 pr-10 py-6 text-[12px] font-black outline-none focus:ring-4 focus:ring-blue-500/5 shadow-inner transition-all placeholder:text-slate-300 uppercase italic"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="p-6 bg-white rounded-3xl text-slate-400 hover:text-[#2563eb] shadow-xl border border-slate-100 transition-all active:scale-90 cursor-pointer">
          <Filter size={24} />
        </button>
      </div>

      {/* 📋 TABLEAU MASTER : MATRICE DES COMPÉTENCES */}
      <div className="bg-white rounded-[4rem] shadow-4xl border border-slate-50 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50 text-[10px] font-black uppercase text-slate-400 border-b border-slate-100">
            <tr>
              <th className="px-12 py-8 tracking-widest">Identité & Qualification</th>
              <th className="px-12 py-8 tracking-widest text-center">Rôle & Autorité</th>
              <th className="px-12 py-8 tracking-widest">Périmètre de Pilotage</th>
              <th className="px-12 py-8 text-right tracking-widest">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filteredUsers.map((user) => (
              <tr key={user.U_Id} className={`group hover:bg-slate-50/80 transition-all duration-300 ${!user.U_IsActive ? 'opacity-30 grayscale pointer-events-none' : ''}`}>
                <td className="px-12 py-10">
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-800 font-black text-lg uppercase group-hover:bg-[#2563eb] group-hover:text-white transition-all shadow-inner">
                      {user.U_FirstName?.[0]}{user.U_LastName?.[0]}
                    </div>
                    <div>
                      <p className="text-md font-black text-slate-900 uppercase tracking-tighter italic leading-none">{user.U_FirstName} {user.U_LastName}</p>
                      <p className="text-[11px] text-slate-400 font-bold flex items-center gap-2 mt-2 italic lowercase leading-none">
                        <Mail size={12} className="text-[#2563eb]" /> {user.U_Email}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-12 py-10 text-center">
                  <div className="inline-flex items-center gap-3 px-5 py-2.5 bg-blue-50 rounded-xl border border-blue-100">
                    <ShieldCheck className="text-[#2563eb]" size={14} />
                    <span className="text-[10px] font-black text-[#2563eb] uppercase">{user.U_Role}</span>
                  </div>
                </td>
                <td className="px-12 py-10">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-[11px] font-black text-slate-700 uppercase italic">
                      <Building size={14} className="text-slate-300" /> {user.U_Site?.S_Name || 'NON ASSIGNÉ'} / {user.U_OrgUnit?.OU_Name || 'ROOT'}
                    </div>
                    {user.U_AssignedProcess && (
                      <div className="flex items-center gap-3 text-[10px] text-[#2563eb] font-black italic animate-in fade-in slide-in-from-left-2">
                        <GitBranch size={12} className="animate-pulse" /> {user.U_AssignedProcess.PR_Libelle}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-12 py-10 text-right">
                  <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                    <button onClick={() => handleArchive(user.U_Id)} className="p-4 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all cursor-pointer border-none bg-transparent"><Trash2 size={20} /></button>
                    <button className="p-4 text-slate-300 hover:text-[#2563eb] hover:bg-blue-50 rounded-2xl transition-all cursor-pointer border-none bg-transparent"><ChevronRight size={20}/></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 🗄️ MODAL : HABILITATION ET QUALIFICATION */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-2xl z-999 flex items-center justify-center p-6">
          <div className="bg-white rounded-[4rem] shadow-4xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-500 border border-white">
            <div className="p-12 bg-slate-50/50 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h2 className="text-4xl font-black uppercase italic tracking-tighter">Habilitation Agent</h2>
                <p className="text-[11px] font-bold text-slate-400 uppercase mt-3 tracking-widest italic flex items-center gap-2">
                  <ShieldCheck size={14} className="text-green-500" /> Enregistrement dans le Noyau de Confiance
                </p>
              </div>
              <button onClick={() => setShowModal(false)} className="w-14 h-14 flex items-center justify-center rounded-2xl hover:bg-white text-slate-400 hover:text-red-500 transition-all shadow-xl cursor-pointer border-none bg-transparent"><X size={28}/></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-12 grid grid-cols-2 gap-10 bg-white italic text-left">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1 italic">Prénom de l&apos;Agent</label>
                <input required className="w-full bg-slate-50 border border-slate-100 rounded-3xl px-6 py-5 text-sm font-black uppercase italic outline-none focus:ring-4 focus:ring-blue-500/10 transition-all shadow-inner" value={formData.U_FirstName} onChange={e => setFormData({...formData, U_FirstName: e.target.value})} />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1 italic">Nom de l&apos;Agent</label>
                <input required className="w-full bg-slate-50 border border-slate-100 rounded-3xl px-6 py-5 text-sm font-black uppercase italic outline-none focus:ring-4 focus:ring-blue-500/10 transition-all shadow-inner" value={formData.U_LastName} onChange={e => setFormData({...formData, U_LastName: e.target.value})} />
              </div>
              <div className="col-span-2 space-y-3">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1 italic">Email Professionnel (Identifiant)</label>
                <input required type="email" className="w-full bg-slate-50 border border-slate-100 rounded-3xl px-6 py-5 text-sm font-bold outline-none focus:ring-4 focus:ring-blue-500/10 transition-all lowercase italic shadow-inner" value={formData.U_Email} onChange={e => setFormData({...formData, U_Email: e.target.value})} />
              </div>

              <div className="col-span-2 grid grid-cols-2 gap-10 pt-4">
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1 italic">Rôle & Autorité</label>
                  <select className="w-full bg-slate-50 border border-slate-100 rounded-3xl px-6 py-5 text-[11px] font-black uppercase outline-none focus:ring-4 focus:ring-blue-500/10 transition-all italic shadow-inner cursor-pointer" value={formData.U_Role} onChange={e => setFormData({...formData, U_Role: e.target.value as any})}>
                    <option value="USER">Collaborateur Standard</option>
                    <option value="PILOTE">Pilote de Processus</option>
                    <option value="ADMIN">Administrateur SMI / RQ</option>
                  </select>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase text-[#2563eb] tracking-widest ml-1 italic flex items-center gap-2">
                    <GitBranch size={12} /> Affectation Cockpit
                  </label>
                  <select className="w-full bg-blue-50 border border-blue-100 rounded-3xl px-6 py-5 text-[11px] font-black uppercase outline-none focus:ring-4 focus:ring-blue-500/10 transition-all italic text-[#2563eb] shadow-inner cursor-pointer" value={formData.U_AssignedProcessId} onChange={e => setFormData({...formData, U_AssignedProcessId: e.target.value})}>
                    <option value="">-- Aucun Processus --</option>
                    {processes.map(p => <option key={p.PR_Id} value={p.PR_Id}>{p.PR_Code} - {p.PR_Libelle}</option>)}
                  </select>
                </div>
              </div>

              <div className="col-span-2 pt-8">
                <button type="submit" className="w-full bg-slate-900 hover:bg-[#2563eb] text-white font-black uppercase py-7 rounded-4xl text-xs shadow-4xl flex items-center justify-center gap-4 transition-all italic active:scale-95 border-none cursor-pointer">
                  <Save size={20} /> Qualifier le Collaborateur
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}