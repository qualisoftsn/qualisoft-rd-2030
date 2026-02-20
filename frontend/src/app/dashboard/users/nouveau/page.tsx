/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 🎯 NOM ABSOLU : src/app/dashboard/admin/users/nouveau/page.tsx
 * FONCTION : Tunnel de Qualification et d'Habilitation d'un nouvel agent.
 * RÔLE : Affectation structurelle (Site/OU) et fonctionnelle (Processus).
 * SÉCURITÉ : Mot de passe imposé qs@20252026 pour le premier accès Master.
 */

'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import apiClient from '@/core/api/api-client';
import { 
  Users, Mail, Loader2, Building2, Layers, UserPlus, CheckCircle, 
  MapPin, GitBranch, ShieldCheck, Save, ShieldAlert, AlertCircle
} from 'lucide-react';
import { toast } from 'react-hot-toast';

// --- INTERFACES RÉFÉRENTIELS ---
interface Site { S_Id: string; S_Name: string; S_IsActive: boolean; }
interface OrgUnit { OU_Id: string; OU_Name: string; OU_Code?: string; OU_SiteId: string; OU_IsActive: boolean; }
interface Processus { PR_Id: string; PR_Code: string; PR_Libelle: string; PR_IsActive: boolean; }

export default function NewUserPage() {
  const [sites, setSites] = useState<Site[]>([]);
  const [allOrgUnits, setAllOrgUnits] = useState<OrgUnit[]>([]);
  const [processes, setProcesses] = useState<Processus[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Configuration initiale du Noyau Agent
  const initialFormState = {
    U_FirstName: '',
    U_LastName: '',
    U_Email: '',
    U_Password: 'qs@20252026', // Clé Master provisoire
    U_Role: 'PILOTE',
    U_SiteId: '',
    U_OrgUnitId: '', 
    U_AssignedProcessId: '' 
  };

  const [formData, setFormData] = useState(initialFormState);

  /**
   * 🧩 FILTRAGE DYNAMIQUE (§4.4)
   * Isole les unités organisationnelles appartenant au site sélectionné.
   */
  const filteredOrgUnits = useMemo(() => {
    if (!formData.U_SiteId) return [];
    return allOrgUnits.filter(unit => unit.OU_SiteId === formData.U_SiteId && unit.OU_IsActive);
  }, [formData.U_SiteId, allOrgUnits]);

  /**
   * 📡 CHARGEMENT DES MATRICES DE STRUCTURE
   * Récupère les sites, unités et processus actifs pour l'habilitation.
   */
  const loadReferentials = useCallback(async () => {
    setLoading(true);
    try {
      const [sitesRes, orgUnitsRes, processesRes] = await Promise.all([
        apiClient.get('/sites'),
        apiClient.get('/org-units'),
        apiClient.get('/processus')
      ]);
      setSites((sitesRes.data || []).filter((s: Site) => s.S_IsActive));
      setAllOrgUnits((orgUnitsRes.data || []).filter((u: OrgUnit) => u.OU_IsActive));
      setProcesses((processesRes.data || []).filter((p: Processus) => p.PR_IsActive));
    } catch (error: any) {
      toast.error("Échec de synchronisation des référentiels structurels");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadReferentials(); }, []);

  // Gestion des dépendances de sélection (Cascade)
  useEffect(() => { setFormData(prev => ({ ...prev, U_OrgUnitId: '', U_AssignedProcessId: '' })); }, [formData.U_SiteId]);
  useEffect(() => { setFormData(prev => ({ ...prev, U_AssignedProcessId: '' })); }, [formData.U_OrgUnitId]);

  /**
   * 📤 SOUMISSION ET SCELLAGE DE L'HABILITATION
   * Valide et pousse le nouvel agent dans le Noyau de Confiance Qualisoft.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation stricte avant scellage
    if (!formData.U_Email.includes('@')) return toast.error("Format d'email invalide");
    if (formData.U_Role === 'PILOTE' && !formData.U_AssignedProcessId) return toast.error("Un Pilote doit être affecté à un processus");

    setIsSubmitting(true);
    try {
      await apiClient.post('/users', {
        ...formData,
        U_Email: formData.U_Email.toLowerCase().trim(),
        U_IsActive: true,
        U_FirstLogin: true
      });
      
      toast.success(`Habilitation scellée pour ${formData.U_FirstName} ${formData.U_LastName}`);
      setFormData(initialFormState);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Erreur d'habilitation critique");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return (
    <div className="ml-72 h-screen flex flex-col items-center justify-center bg-[#0B0F1A] text-blue-500 font-black italic uppercase">
      <Loader2 className="animate-spin mb-6" size={60} />
      <p className="tracking-[0.4em]">Initialisation des Matrices de Confiance...</p>
    </div>
  );

  return (
    <div className="p-10 bg-[#0B0F1A] min-h-screen ml-72 text-white italic font-sans text-left overflow-x-hidden">
      
      {/* HEADER DE QUALIFICATION SÉCURISÉ */}
      <header className="mb-14 border-b border-white/5 pb-12 flex justify-between items-end animate-in fade-in slide-in-from-top-4 duration-700">
        <div>
          <h1 className="text-6xl font-black uppercase italic tracking-tighter leading-none mb-4">
            Habilitation <span className="text-blue-500">Agent</span>
          </h1>
          <p className="text-slate-500 font-bold text-[11px] uppercase tracking-[0.6em] italic opacity-60">
            Qualification et Autorité du Personnel • ISO 9001 §7.2
          </p>
        </div>
        <div className="bg-white/5 p-5 rounded-3xl border border-white/10 flex items-center gap-4">
           <ShieldCheck size={24} className="text-emerald-500 animate-pulse" />
           <div className="text-right">
             <p className="text-[9px] font-black text-slate-500 uppercase italic">Statut Sécurité</p>
             <p className="text-[11px] font-black text-white uppercase italic leading-none">Noyau Actif</p>
           </div>
        </div>
      </header>

      {/* COMPTEURS DE RÉFÉRENTIELS */}
      <div className="mb-12 grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Sites Actifs', val: sites.length, icon: MapPin, color: 'text-blue-500' },
          { label: 'Unités Libres', val: allOrgUnits.length, icon: Layers, color: 'text-amber-500' },
          { label: 'Processus Pilotés', val: processes.length, icon: GitBranch, color: 'text-emerald-500' }
        ].map((s, i) => (
          <div key={i} className="bg-white/5 border border-white/5 p-8 rounded-4xl flex items-center justify-between shadow-2xl">
             <div className={`p-4 rounded-2xl bg-white/5 ${s.color} border border-white/5`}><s.icon size={28}/></div>
             <div className="text-right"><p className="text-4xl font-black italic tracking-tighter">{s.val}</p><p className="text-[10px] uppercase text-slate-600 font-black">{s.label}</p></div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-12 animate-in fade-in slide-in-from-bottom-6 duration-1000">
          
          {/* SECTION IDENTITÉ & CLÉ D'ACCÈS */}
          <div className="lg:col-span-5 space-y-8 text-left">
            <div className="bg-slate-900/40 border border-white/5 p-12 rounded-[4rem] shadow-4xl backdrop-blur-3xl">
              <h3 className="text-xl font-black uppercase italic text-blue-500 mb-10 flex items-center gap-4">
                <UserPlus size={24} /> Identité & Accès
              </h3>
              
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase ml-2 italic">Prénom *</label>
                    <input required className="w-full bg-black/40 border border-white/10 rounded-2xl p-5 text-sm font-black text-white uppercase italic focus:border-blue-500 outline-none transition-all shadow-inner" placeholder="EX: JEAN" value={formData.U_FirstName} onChange={e => setFormData({ ...formData, U_FirstName: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase ml-2 italic">Nom *</label>
                    <input required className="w-full bg-black/40 border border-white/10 rounded-2xl p-5 text-sm font-black text-white uppercase italic focus:border-blue-500 outline-none transition-all shadow-inner" placeholder="EX: SOW" value={formData.U_LastName} onChange={e => setFormData({ ...formData, U_LastName: e.target.value })} />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase ml-2 italic">Email Professionnel *</label>
                  <input required type="email" className="w-full bg-black/40 border border-white/10 rounded-2xl p-5 text-sm font-bold text-white italic focus:border-blue-500 outline-none transition-all shadow-inner" placeholder="prenom.nom@qualisoft.sn" value={formData.U_Email} onChange={e => setFormData({ ...formData, U_Email: e.target.value })} />
                </div>

                <div className="bg-amber-600/5 border border-amber-600/20 p-8 rounded-[2.5rem] mt-10">
                  <label className="text-[10px] font-black text-amber-500 uppercase ml-2 italic flex items-center gap-2">🔐 Clé Master Provisoire</label>
                  <input readOnly className="w-full bg-black/40 border border-white/5 mt-4 rounded-xl p-5 text-sm font-black text-amber-500 italic cursor-not-allowed" value={formData.U_Password} />
                  <p className="text-[9px] text-slate-600 mt-4 italic font-bold">L&apos;agent devra sceller son propre mot de passe lors de la première synchronisation cockpit.</p>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION QUALIFICATION SMI (§7.2) */}
          <div className="lg:col-span-7 space-y-8">
            <div className="bg-slate-900/40 border border-white/5 p-12 rounded-[4.5rem] shadow-4xl backdrop-blur-3xl space-y-10">
              <h3 className="text-xl font-black uppercase italic text-emerald-500 flex items-center gap-4">
                <ShieldCheck size={24} /> Qualification Métier
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-500 uppercase ml-2 italic">Rôle & Autorité SMI *</label>
                  <select required className="w-full bg-black/40 border border-white/10 p-5 rounded-2xl text-[11px] font-black text-white italic outline-none focus:border-emerald-500 shadow-inner cursor-pointer" value={formData.U_Role} onChange={e => setFormData({ ...formData, U_Role: e.target.value })}>
                    <option value="PILOTE">🎯 PILOTE PROCESSUS</option>
                    <option value="ADMIN">⚙️ RESPONSABLE QUALITÉ</option>
                    <option value="USER">👥 COLLABORATEUR</option>
                    <option value="COPILOTE">🤝 CO-PILOTE</option>
                  </select>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-500 uppercase ml-2 italic">Site d&apos;Attache *</label>
                  <select required className="w-full bg-black/40 border border-white/10 p-5 rounded-2xl text-[11px] font-black text-white italic outline-none focus:border-blue-500 shadow-inner cursor-pointer" value={formData.U_SiteId} onChange={e => setFormData({ ...formData, U_SiteId: e.target.value })}>
                    <option value="">CHOISIR UN SITE...</option>
                    {sites.map(s => <option key={s.S_Id} value={s.S_Id}>{s.S_Name}</option>)}
                  </select>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-500 uppercase ml-2 italic">Unité Organisationnelle *</label>
                  <select required disabled={!formData.U_SiteId} className="w-full bg-black/40 border border-white/10 p-5 rounded-2xl text-[11px] font-black text-white italic outline-none focus:border-amber-500 disabled:opacity-30 cursor-pointer shadow-inner" value={formData.U_OrgUnitId} onChange={e => setFormData({ ...formData, U_OrgUnitId: e.target.value })}>
                    <option value="">CHOISIR UNE UNITÉ...</option>
                    {filteredOrgUnits.map(u => <option key={u.OU_Id} value={u.OU_Id}>{u.OU_Name}</option>)}
                  </select>
                </div>

                <div className="space-y-3">
                  <label className={`text-[10px] font-black uppercase ml-2 italic flex items-center gap-2 ${formData.U_Role === 'PILOTE' ? 'text-blue-500 animate-pulse' : 'text-slate-500'}`}>Affectation Cockpit *</label>
                  <select required={formData.U_Role === 'PILOTE'} disabled={formData.U_Role !== 'PILOTE'} className="w-full bg-black/40 border border-white/10 p-5 rounded-2xl text-[11px] font-black text-white italic outline-none focus:border-blue-600 disabled:opacity-20 cursor-pointer shadow-inner" value={formData.U_AssignedProcessId} onChange={e => setFormData({ ...formData, U_AssignedProcessId: e.target.value })}>
                    <option value="">AFFECTER PROCESSUS...</option>
                    {processes.map(p => <option key={p.PR_Id} value={p.PR_Id}>{p.PR_Code} - {p.PR_Libelle}</option>)}
                  </select>
                </div>
              </div>

              <div className="pt-12 flex flex-col items-center gap-8">
                <button type="submit" disabled={isSubmitting} className="w-full bg-blue-600 hover:bg-blue-500 text-white py-8 rounded-[2.5rem] font-black uppercase text-xs italic shadow-4xl flex items-center justify-center gap-4 transition-all active:scale-95 disabled:opacity-50 border-none cursor-pointer">
                  {isSubmitting ? <Loader2 className="animate-spin" /> : <Save size={24} />} Confirmer l&apos;Habilitation Maître
                </button>
                <div className="flex items-center gap-3 opacity-30 italic">
                   <ShieldAlert size={16} />
                   <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Action irréversible • Journal Audit Qualité Actif</span>
                </div>
              </div>
            </div>
          </div>
      </form>
    </div>
  );
}