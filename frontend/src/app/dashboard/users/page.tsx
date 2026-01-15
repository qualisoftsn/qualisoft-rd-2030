/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import React, { useState, useEffect } from 'react';
import { 
  Users, UserPlus, Mail, Shield, Building2, 
  MapPin, Trash2, Edit3, Loader2, Search, CheckCircle2, X, Save
} from 'lucide-react';
import apiClient from '@/core/api/api-client';

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [sites, setSites] = useState<any[]>([]);
  const [units, setUnits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    U_FirstName: '',
    U_LastName: '',
    U_Email: '',
    U_Password: '',
    U_Role: 'USER',
    U_SiteId: '',
    U_OrgUnitId: ''
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [uRes, sRes, oRes] = await Promise.all([
        apiClient.get('/users'),
        apiClient.get('/sites'),
        apiClient.get('/org-units')
      ]);
      setUsers(uRes.data);
      setSites(sRes.data);
      setUnits(oRes.data);
    } catch (err) {
      console.error("Erreur de synchronisation");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.post('/users', formData);
      setShowModal(false);
      setFormData({ U_FirstName: '', U_LastName: '', U_Email: '', U_Password: '', U_Role: 'USER', U_SiteId: '', U_OrgUnitId: '' });
      fetchData();
    } catch (err) {
      alert("Erreur lors de la création de l'utilisateur");
    }
  };

  const filteredUsers = users.filter(user => 
    user.U_Email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.U_FirstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.U_LastName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-slate-50">
      <Loader2 className="animate-spin text-blue-600" size={40} />
    </div>
  );

  return (
    <div className="p-8 space-y-8 bg-slate-50 min-h-screen italic font-sans relative">
      
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tighter text-slate-900 flex items-center gap-3">
            <Users className="text-blue-600" size={32} /> Annuaire Collaborateurs
          </h1>
          <p className="text-slate-500 font-medium">Gestion des accès et des responsabilités SMI.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-slate-900 hover:bg-blue-600 text-white px-6 py-4 rounded-2xl font-black uppercase text-[10px] shadow-lg flex items-center gap-2 transition-all active:scale-95"
        >
          <UserPlus size={16} /> Ajouter un utilisateur
        </button>
      </div>

      {/* RECHERCHE ET TABLEAU (Identique à la version précédente) */}
      <div className="relative max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input 
          type="text"
          placeholder="Rechercher..."
          className="w-full bg-white border border-slate-200 rounded-2xl pl-12 pr-4 py-3 text-xs outline-none focus:ring-2 focus:ring-blue-500 shadow-sm transition-all"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50 text-[10px] font-black uppercase text-slate-400 border-b border-slate-100">
            <tr>
              <th className="px-8 py-5">Collaborateur</th>
              <th className="px-8 py-5">Rôle</th>
              <th className="px-8 py-5">Structure</th>
              <th className="px-8 py-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredUsers.map((user) => (
              <tr key={user.U_Id} className="group hover:bg-slate-50/80">
                <td className="px-8 py-5">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black text-sm uppercase">
                      {user.U_FirstName?.[0]}{user.U_LastName?.[0]}
                    </div>
                    <div>
                      <p className="text-xs font-black text-slate-800 uppercase tracking-tight">{user.U_FirstName} {user.U_LastName}</p>
                      <p className="text-[10px] text-slate-400 font-medium">{user.U_Email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-5">
                   <span className="text-[9px] font-black text-blue-600 uppercase border border-blue-100 px-2 py-1 rounded-md">{user.U_Role}</span>
                </td>
                <td className="px-8 py-5 text-[10px] font-bold text-slate-600 uppercase">
                   {user.U_OrgUnit?.OU_Name || 'Sans Unité'} <br/>
                   <span className="text-slate-400 font-black italic">{user.U_OrgUnit?.OU_Type?.OUT_Label || '-'}</span>
                </td>
                <td className="px-8 py-5 text-right">
                  <button className="p-2 text-slate-300 hover:text-red-500"><Trash2 size={16}/></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL D'AJOUT (Le coeur du problème corrigé) */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-xl font-black uppercase italic tracking-tighter">Nouveau Collaborateur</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-900"><X /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 grid grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400">Prénom</label>
                <input required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs" 
                  value={formData.U_FirstName} onChange={e => setFormData({...formData, U_FirstName: e.target.value})} />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400">Nom</label>
                <input required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs" 
                  value={formData.U_LastName} onChange={e => setFormData({...formData, U_LastName: e.target.value})} />
              </div>
              <div className="col-span-2 space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400">Email Professionnel</label>
                <input required type="email" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs" 
                  value={formData.U_Email} onChange={e => setFormData({...formData, U_Email: e.target.value})} />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400">Mot de passe provisoire</label>
                <input required type="password" title="Mot de passe" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs" 
                  value={formData.U_Password} onChange={e => setFormData({...formData, U_Password: e.target.value})} />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400">Rôle Qualité</label>
                <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs" 
                  value={formData.U_Role} onChange={e => setFormData({...formData, U_Role: e.target.value})}>
                  <option value="USER">Utilisateur Standard</option>
                  <option value="PILOTE">Pilote de Processus</option>
                  <option value="ADMIN">Administrateur SMI</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400">Site</label>
                <select required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs" 
                  value={formData.U_SiteId} onChange={e => setFormData({...formData, U_SiteId: e.target.value})}>
                  <option value="">-- Choisir --</option>
                  {sites.map(s => <option key={s.S_Id} value={s.S_Id}>{s.S_Name}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400">Unité Organique</label>
                <select required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs" 
                  value={formData.U_OrgUnitId} onChange={e => setFormData({...formData, U_OrgUnitId: e.target.value})}>
                  <option value="">-- Choisir --</option>
                  {units.map(u => <option key={u.OU_Id} value={u.OU_Id}>{u.OU_Name} ({u.OU_Type?.OUT_Label})</option>)}
                </select>
              </div>

              <div className="col-span-2 pt-4">
                <button type="submit" className="w-full bg-blue-600 hover:bg-slate-900 text-white font-black uppercase py-4 rounded-2xl text-[11px] shadow-xl flex items-center justify-center gap-2 transition-all">
                  <Save size={16} /> Créer et notifier le collaborateur
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}