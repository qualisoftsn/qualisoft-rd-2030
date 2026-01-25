/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Users, UserPlus, Mail, Shield, MapPin, 
  Trash2, Loader2, Search, X, Save, 
  ShieldCheck, Building, Filter
} from 'lucide-react';
import apiClient from '@/core/api/api-client';

/**
 * 🏛️ INTERFACES STRICTES (ZÉRO ANY)
 */
interface Site {
  S_Id: string;
  S_Name: string;
}

interface OrgUnitType {
  OUT_Id: string;
  OUT_Label: string;
}

interface OrgUnit {
  OU_Id: string;
  OU_Name: string;
  OU_Type?: OrgUnitType;
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
}

export default function UsersPage() {
  // États typés
  const [users, setUsers] = useState<User[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [units, setUnits] = useState<OrgUnit[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');

  const [formData, setFormData] = useState({
    U_FirstName: '',
    U_LastName: '',
    U_Email: '',
    U_Password: '',
    U_Role: 'USER',
    U_SiteId: '',
    U_OrgUnitId: ''
  });

  /**
   * 📡 SYNCHRONISATION AVEC LE NOYAU
   */
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [uRes, sRes, oRes] = await Promise.all([
        apiClient.get<User[]>('/users'),
        apiClient.get<Site[]>('/sites'),
        apiClient.get<OrgUnit[]>('/org-units')
      ]);
      setUsers(uRes.data);
      setSites(sRes.data);
      setUnits(oRes.data);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Erreur de liaison API";
      console.error(`🚨 [SYNC ERROR]: ${message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  /**
   * ✍️ CRÉATION D'UN COLLABORATEUR
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.post('/users', formData);
      setShowModal(false);
      setFormData({ 
        U_FirstName: '', U_LastName: '', U_Email: '', 
        U_Password: '', U_Role: 'USER', U_SiteId: '', U_OrgUnitId: '' 
      });
      fetchData();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Échec de création";
      alert(`Erreur : ${message}`);
    }
  };

  /**
   * 📁 ARCHIVAGE (SOFT DELETE)
   */
  const handleArchive = async (id: string) => {
    if (!confirm("Confirmer l'archivage de ce collaborateur ?")) return;
    try {
      await apiClient.delete(`/users/${id}`);
      fetchData();
    } catch (error: unknown) {
      console.error("Erreur lors de l'archivage");
    }
  };

  const filteredUsers = users.filter(user => 
    user.U_Email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.U_FirstName + " " + user.U_LastName).toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-[#F8FAFC]">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="animate-spin text-[#2563eb]" size={48} />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Accès au Noyau...</p>
      </div>
    </div>
  );

  return (
    <div className="p-10 space-y-10 bg-[#F8FAFC] min-h-screen font-sans selection:bg-blue-100">
      
      {/* HEADER ELITE */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black uppercase italic tracking-tighter text-slate-900 flex items-center gap-4">
            <div className="p-3 bg-white rounded-2xl shadow-sm border border-slate-100">
              <Users className="text-[#2563eb]" size={32} />
            </div>
            Annuaire <span className="text-[#2563eb]">Collaborateurs</span>
          </h1>
          <p className="text-slate-500 font-medium mt-2 flex items-center gap-2">
            <ShieldCheck size={14} className="text-green-500" />
            Gestion sécurisée des accès et responsabilités SMI Qualisoft.
          </p>
        </div>
        
        <button 
          onClick={() => setShowModal(true)}
          className="group bg-slate-900 hover:bg-[#2563eb] text-white px-8 py-5 rounded-4xl font-black uppercase text-[11px] shadow-xl hover:shadow-blue-200 flex items-center gap-3 transition-all active:scale-95"
        >
          <UserPlus size={18} className="group-hover:rotate-12 transition-transform" />
          Nouveau Profil
        </button>
      </div>

      {/* RECHERCHE & FILTRES */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-xl">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text"
            placeholder="Rechercher par nom, email ou rôle..."
            className="w-full bg-white border-none rounded-3xl pl-14 pr-6 py-5 text-sm outline-none focus:ring-2 focus:ring-[#2563eb]/20 shadow-sm transition-all font-medium"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="p-5 bg-white rounded-3xl text-slate-400 hover:text-slate-900 shadow-sm border border-slate-50 transition-all">
          <Filter size={20} />
        </button>
      </div>

      {/* TABLEAU MASTER */}
      <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-white overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50/50 text-[11px] font-black uppercase text-slate-400 border-b border-slate-100">
            <tr>
              <th className="px-10 py-6">Identité</th>
              <th className="px-10 py-6">Rôle SMI</th>
              <th className="px-10 py-6">Affectation Structurelle</th>
              <th className="px-10 py-6 text-right">Contrôle</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filteredUsers.map((user) => (
              <tr key={user.U_Id} className={`group hover:bg-slate-50/50 transition-colors ${!user.U_IsActive ? 'opacity-40 grayscale' : ''}`}>
                <td className="px-10 py-7">
                  <div className="flex items-center gap-5">
                    <div className="relative">
                      <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-slate-100 to-slate-200 flex items-center justify-center text-slate-800 font-black text-lg uppercase group-hover:from-[#2563eb] group-hover:to-blue-700 group-hover:text-white transition-all duration-300">
                        {user.U_FirstName?.[0]}{user.U_LastName?.[0]}
                      </div>
                      {user.U_IsActive && <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-4 border-white rounded-full" />}
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-900 uppercase tracking-tight">{user.U_FirstName} {user.U_LastName}</p>
                      <p className="text-[11px] text-slate-400 font-bold flex items-center gap-1 mt-1">
                        <Mail size={10} /> {user.U_Email}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-10 py-7">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-lg border border-blue-100">
                    <Shield className="text-[#2563eb]" size={12} />
                    <span className="text-[10px] font-black text-[#2563eb] uppercase">{user.U_Role}</span>
                  </div>
                </td>
                <td className="px-10 py-7">
                  <div className="space-y-1">
                    <p className="text-[11px] font-black text-slate-700 uppercase flex items-center gap-2">
                      <Building size={12} className="text-slate-300" /> {user.U_OrgUnit?.OU_Name || 'Siège'}
                    </p>
                    <p className="text-[10px] text-[#2563eb] font-black italic flex items-center gap-2">
                      <MapPin size={10} /> {user.U_Site?.S_Name || '-'}
                    </p>
                  </div>
                </td>
                <td className="px-10 py-7 text-right">
                  <button 
                    onClick={() => handleArchive(user.U_Id)}
                    className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                    title="Archiver le profil"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL ELITE D'AJOUT */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-50 flex items-center justify-center p-6">
          <div className="bg-white rounded-[3rem] shadow-3xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="p-10 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-black uppercase italic tracking-tighter">Nouveau Collaborateur</h2>
                <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">Enregistrement dans le Noyau SMI</p>
              </div>
              <button onClick={() => setShowModal(false)} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white text-slate-400 hover:text-slate-900 transition-all shadow-sm"><X size={20}/></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-10 grid grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Prénom</label>
                <input required className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-xs font-bold outline-none focus:ring-2 focus:ring-[#2563eb]/20" 
                  value={formData.U_FirstName} onChange={e => setFormData({...formData, U_FirstName: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Nom de famille</label>
                <input required className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-xs font-bold outline-none focus:ring-2 focus:ring-[#2563eb]/20" 
                  value={formData.U_LastName} onChange={e => setFormData({...formData, U_LastName: e.target.value})} />
              </div>
              <div className="col-span-2 space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Email Professionnel</label>
                <input required type="email" className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-xs font-bold outline-none focus:ring-2 focus:ring-[#2563eb]/20" 
                  value={formData.U_Email} onChange={e => setFormData({...formData, U_Email: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Mot de passe provisoire</label>
                <input required type="password" title="Mot de passe" className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-xs font-bold outline-none focus:ring-2 focus:ring-[#2563eb]/20" 
                  value={formData.U_Password} onChange={e => setFormData({...formData, U_Password: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Rôle Qualité</label>
                <select className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-xs font-black uppercase outline-none focus:ring-2 focus:ring-[#2563eb]/20" 
                  value={formData.U_Role} onChange={e => setFormData({...formData, U_Role: e.target.value as any})}>
                  <option value="USER">Utilisateur Standard</option>
                  <option value="PILOTE">Pilote de Processus</option>
                  <option value="ADMIN">Administrateur SMI</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Site</label>
                <select required className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-xs font-black uppercase outline-none focus:ring-2 focus:ring-[#2563eb]/20" 
                  value={formData.U_SiteId} onChange={e => setFormData({...formData, U_SiteId: e.target.value})}>
                  <option value="">-- Choisir Site --</option>
                  {sites.map(s => <option key={s.S_Id} value={s.S_Id}>{s.S_Name}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Unité Organique</label>
                <select required className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-xs font-black uppercase outline-none focus:ring-2 focus:ring-[#2563eb]/20" 
                  value={formData.U_OrgUnitId} onChange={e => setFormData({...formData, U_OrgUnitId: e.target.value})}>
                  <option value="">-- Choisir Unité --</option>
                  {units.map(u => <option key={u.OU_Id} value={u.OU_Id}>{u.OU_Name}</option>)}
                </select>
              </div>

              <div className="col-span-2 pt-6">
                <button type="submit" className="w-full bg-[#2563eb] hover:bg-slate-900 text-white font-black uppercase py-5 rounded-3xl text-[12px] shadow-2xl shadow-blue-200 flex items-center justify-center gap-3 transition-all">
                  <Save size={18} /> Créer et Initialiser les droits
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}