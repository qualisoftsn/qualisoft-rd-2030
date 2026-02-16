/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useEffect } from 'react';
import { matrixApi } from '@/services/matrix.service';
import { X, Save, Loader2, User, Mail, Lock, Shield, Building2, Eye, EyeOff, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

interface TenantSummary {
  T_Id: string;
  T_Name: string;
  T_Domain: string;
}

const PRISMA_ROLES = [
  { value: 'SUPER_ADMIN', label: '👑 SUPER ADMIN', desc: 'Accès total Matrix', color: 'bg-red-50 border-red-500 text-red-900' },
  { value: 'ADMIN', label: '🏢 ADMIN TENANT', desc: 'Directeur / Admin Local', color: 'bg-blue-50 border-blue-500 text-blue-900' },
  { value: 'RQ', label: '⭐ RESP. QUALITÉ (RQ)', desc: 'Pilotage du SMI', color: 'bg-indigo-50 border-indigo-500 text-indigo-900' },
  { value: 'PILOTE', label: '✈️ PILOTE', desc: 'Propriétaire de processus', color: 'bg-emerald-50 border-emerald-500 text-emerald-900' },
  { value: 'COPILOTE', label: '🛩️ CO-PILOTE', desc: 'Suppléant processus', color: 'bg-teal-50 border-teal-500 text-teal-900' },
  { value: 'AUDITEUR', label: '🔍 AUDITEUR', desc: 'Réalise les audits', color: 'bg-amber-50 border-amber-500 text-amber-900' },
  { value: 'HSE', label: '⛑️ HSE MANAGER', desc: 'Gestion Santé Sécurité', color: 'bg-orange-50 border-orange-500 text-orange-900' },
  { value: 'SAFETY_OFFICER', label: '🛡️ SAFETY OFFICER', desc: 'Agent de sécurité', color: 'bg-orange-50 border-orange-500 text-orange-900' },
  { value: 'DIRECTION', label: '👔 DIRECTION', desc: 'Revue de direction', color: 'bg-purple-50 border-purple-500 text-purple-900' },
  { value: 'USER', label: '👤 UTILISATEUR', desc: 'Accès standard', color: 'bg-slate-50 border-slate-400 text-slate-900' },
  { value: 'OBSERVATEUR', label: '👀 OBSERVATEUR', desc: 'Lecture seule', color: 'bg-gray-50 border-gray-400 text-gray-900' },
];

export default function MatrixUserModal({ isOpen, onClose, onSuccess, userToEdit }: any) {
  const [loading, setLoading] = useState(false);
  const [tenants, setTenants] = useState<TenantSummary[]>([]);
  const [showPassword, setShowPassword] = useState(false);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);
  
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', password: '', role: 'ADMIN', tenantId: ''
  });

  useEffect(() => {
    if (isOpen) {
      setErrorDetails(null);
      matrixApi.getTenants().then(data => {
        setTenants((Array.isArray(data) ? data : []).map((t: any) => ({
          T_Id: t.T_Id, T_Name: t.T_Name, T_Domain: t.T_Domain
        })));
      }).catch(() => toast.error("Échec synchro tenants."));

      if (userToEdit) {
        setForm({
          firstName: userToEdit.U_FirstName || '',
          lastName: userToEdit.U_LastName || '',
          email: userToEdit.U_Email || '',
          role: userToEdit.U_Role || 'USER',
          tenantId: userToEdit.tenantId || userToEdit.T_Id || '', 
          password: '' 
        });
      } else {
        setForm({ firstName: '', lastName: '', email: '', password: '', role: 'ADMIN', tenantId: '' });
      }
    }
  }, [isOpen, userToEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorDetails(null);

    try {
      // 🏗️ PAYLOAD SANITIZATION
      const payload: any = {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        role: form.role,
      };

      if (form.password?.trim()) payload.password = form.password;

      if (userToEdit?.U_Id) {
        // UPDATE MODE: On retire l'ID et le tenantId du body pour éviter la 400 NestJS
        console.log("📤 PATCH Action:", payload);
        await matrixApi.updateUser(userToEdit.U_Id, payload);
        toast.success("Cerveau mis à jour.");
      } else {
        // CREATE MODE
        payload.tenantId = form.tenantId;
        if (!payload.password) payload.password = "Qualisoft@2026";
        console.log("📤 POST Action:", payload);
        await matrixApi.createGlobalUser(payload);
        toast.success("Agent enrôlé.");
      }
      
      onSuccess();
      onClose();
    } catch (err: any) {
      const rawMsg = err.response?.data?.message;
      const cleanMsg = Array.isArray(rawMsg) ? rawMsg.join(' | ') : (typeof rawMsg === 'object' ? JSON.stringify(rawMsg) : rawMsg);
      setErrorDetails(cleanMsg || "Erreur de communication Matrix");
      toast.error("Opération révoquée par le Kernel.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const labelClass = "block text-[11px] font-black uppercase text-slate-700 mb-1.5 tracking-wide";
  const inputClass = "w-full bg-white border-2 border-slate-300 rounded-lg px-4 py-3 text-sm font-bold text-slate-900 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 transition-all outline-none";

  return (
    <div className="fixed inset-0 z-200 flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-4 animate-in fade-in duration-200 italic">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh] border border-slate-200">
        
        {/* HEADER */}
        <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50 rounded-t-2xl">
          <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-3">
            {userToEdit ? <User className="text-blue-600" /> : <Save className="text-blue-600" />}
            {userToEdit ? `Rectifier : ${form.lastName}` : 'Enrôlement Matrix'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-red-50 hover:text-red-600 rounded-full transition-colors cursor-pointer border border-slate-200"><X size={20}/></button>
        </div>

        {/* ERROR DISPLAY */}
        {errorDetails && (
          <div className="mx-6 mt-6 p-4 bg-red-50 border-l-4 border-red-600 rounded-r-lg flex items-start gap-3">
            <AlertTriangle className="text-red-600 shrink-0 mt-0.5" size={18} />
            <div className="flex-1 font-mono text-[11px] text-red-700 uppercase font-bold">{errorDetails}</div>
          </div>
        )}

        <form id="matrix-form" onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto custom-scrollbar flex-1">
          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className={labelClass}>Prénom</label>
              <input required className={inputClass} value={form.firstName} onChange={e => setForm({...form, firstName: e.target.value})} />
            </div>
            <div>
              <label className={labelClass}>Nom</label>
              <input required className={inputClass} value={form.lastName} onChange={e => setForm({...form, lastName: e.target.value})} />
            </div>
          </div>

          <div>
            <label className={labelClass}>Email (Identifiant Unique)</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input required type="email" className={`${inputClass} pl-12`} value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border-2 border-slate-200">
            <label className={labelClass}>{userToEdit ? 'Nouveau Password (Optionnel)' : 'Password Initial'}</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input type={showPassword ? "text" : "password"} className={`${inputClass} pl-12 pr-12`} value={form.password} onChange={e => setForm({...form, password: e.target.value})} placeholder={userToEdit ? "••••••••" : "Qualisoft@2026"} />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 cursor-pointer">{showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}</button>
            </div>
          </div>

          <div className="space-y-6 pt-4 border-t-2 border-slate-100">
            <div>
              <label className={labelClass}>Affectation Nœud Client</label>
              <select required disabled={!!userToEdit} className={`${inputClass} disabled:bg-slate-100`} value={form.tenantId} onChange={e => setForm({...form, tenantId: e.target.value})}>
                <option value="">-- Sélectionner l&apos;Organisation --</option>
                {tenants.map(t => <option key={t.T_Id} value={t.T_Id}>{t.T_Name} ({t.T_Domain})</option>)}
              </select>
            </div>

            <div>
              <label className={labelClass}>Accréditation (Prisma Role)</label>
              <div className="grid grid-cols-2 gap-3 max-h-60 overflow-y-auto p-1">
                {PRISMA_ROLES.map(r => (
                  <label key={r.value} className={`flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${form.role === r.value ? `${r.color} shadow-sm border-current` : 'border-slate-200 bg-white hover:border-slate-400 opacity-60 hover:opacity-100'}`}>
                    <input type="radio" className="hidden" checked={form.role === r.value} onChange={() => setForm({...form, role: r.value})} />
                    <Shield size={16} className="mt-0.5 shrink-0" />
                    <div>
                      <span className="text-[10px] font-black uppercase block">{r.label}</span>
                      <span className="text-[9px] font-bold opacity-70 block">{r.desc}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </form>

        <div className="p-6 border-t border-slate-100 flex gap-4 bg-slate-50 rounded-b-2xl">
          <button type="button" onClick={onClose} className="flex-1 py-4 bg-white border-2 border-slate-300 text-slate-700 rounded-xl font-black uppercase text-xs hover:bg-slate-100 transition-all cursor-pointer">Annuler</button>
          <button form="matrix-form" type="submit" disabled={loading} className="flex-2 py-4 bg-blue-600 text-white rounded-xl font-black uppercase text-xs hover:bg-blue-700 transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer">
            {loading ? <Loader2 className="animate-spin" /> : <Save size={16} />}
            {loading ? 'SCELLEMENT...' : (userToEdit ? 'RECTIFIER L\'AGENT' : 'ENRÔLER L\'AGENT')}
          </button>
        </div>
      </div>
    </div>
  );
}