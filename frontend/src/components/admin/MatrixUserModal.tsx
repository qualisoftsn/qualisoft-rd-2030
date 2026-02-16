/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useEffect } from 'react';
import { matrixApi } from '@/services/matrix.service';
import { X, Save, Loader2, Mail, Lock, Shield, Building2, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

/**
 * 🛠️ CORRECTIF ÉLITE : Gestion des payloads et décodage des erreurs
 */

const PRISMA_ROLES = [
  { value: 'SUPER_ADMIN', label: '👑 SUPER ADMIN', desc: 'Accès total Matrix' },
  { value: 'ADMIN', label: '🏢 ADMIN TENANT', desc: 'Admin local société' },
  { value: 'RQ', label: '⭐ RESP. QUALITÉ (RQ)', desc: 'Pilotage SMI' },
  { value: 'PILOTE', label: '✈️ PILOTE', desc: 'Gestion processus' },
  { value: 'HSE', label: '⛑️ HSE MANAGER', desc: 'Santé Sécurité' },
  { value: 'SAFETY_OFFICER', label: '🛡️ SAFETY OFFICER', desc: 'Agent terrain' },
  { value: 'AUDITEUR', label: '🔍 AUDITEUR', desc: 'Audits internes' },
  { value: 'DIRECTION', label: '👔 DIRECTION', desc: 'Consultation' },
  { value: 'USER', label: '👤 UTILISATEUR', desc: 'Accès standard' },
];

export default function MatrixUserModal({ isOpen, onClose, onSuccess, userToEdit }: any) {
  const [loading, setLoading] = useState(false);
  const [tenants, setTenants] = useState<any[]>([]);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '', role: 'USER', tenantId: '' });

  useEffect(() => {
    if (isOpen) {
      setErrorMsg(null);
      matrixApi.getTenants().then(setTenants).catch(() => toast.error("Sync Tenants Échouée"));
      if (userToEdit) {
        setForm({
          firstName: userToEdit.U_FirstName || '',
          lastName: userToEdit.U_LastName || '',
          email: userToEdit.U_Email || '',
          role: userToEdit.U_Role || 'USER',
          tenantId: userToEdit.tenantId || '',
          password: ''
        });
      } else {
        setForm({ firstName: '', lastName: '', email: '', password: '', role: 'USER', tenantId: '' });
      }
    }
  }, [isOpen, userToEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      // 🏗️ PAYLOAD SANITIZATION
      const payload: any = {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim().toLowerCase(),
        role: form.role,
      };

      if (form.password) payload.password = form.password;

      if (userToEdit?.U_Id) {
        // PATCH : On ne renvoie PAS le tenantId ni l'id dans le corps pour éviter la 400
        await matrixApi.updateUser(userToEdit.U_Id, payload);
        toast.success("Agent mis à jour");
      } else {
        // POST : On ajoute le tenantId pour la création
        payload.tenantId = form.tenantId;
        await matrixApi.createGlobalUser(payload);
        toast.success("Agent créé");
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      // 🛡️ DÉCODEUR D'ERREUR (Fix [object Object])
      const raw = err.response?.data?.message;
      const msg = Array.isArray(raw) ? raw.join(' | ') : (typeof raw === 'object' ? JSON.stringify(raw) : (raw || "Erreur Inconnue"));
      setErrorMsg(msg);
      toast.error("Échec de l'opération");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-200 flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-4 italic">
      <div className="bg-white rounded-[2.5rem] w-full max-w-2xl shadow-2xl border-4 border-slate-900 overflow-hidden flex flex-col max-h-[95vh] animate-in zoom-in duration-200">
        
        <div className="p-8 bg-slate-50 border-b-2 border-slate-100 flex justify-between items-center">
          <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">
            {userToEdit ? '📦 Rectifier Profil' : '🚀 Enrôler Agent'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-red-50 hover:text-red-500 rounded-full cursor-pointer transition-colors"><X size={24}/></button>
        </div>

        {errorMsg && (
          <div className="mx-8 mt-6 p-4 bg-red-50 border-l-4 border-red-600 rounded-r-xl flex items-start gap-3">
            <AlertCircle className="text-red-600 shrink-0 mt-0.5" size={18} />
            <p className="text-[10px] font-black text-red-800 uppercase leading-tight">{errorMsg}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-2 gap-4">
            <input required placeholder="Prénom" className="w-full bg-slate-100 border-2 border-slate-200 rounded-2xl p-4 font-bold outline-none focus:border-blue-600" value={form.firstName} onChange={e => setForm({...form, firstName: e.target.value})} />
            <input required placeholder="Nom" className="w-full bg-slate-100 border-2 border-slate-200 rounded-2xl p-4 font-bold outline-none focus:border-blue-600" value={form.lastName} onChange={e => setForm({...form, lastName: e.target.value})} />
          </div>

          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input required type="email" placeholder="Email (Login)" className="w-full bg-slate-100 border-2 border-slate-200 rounded-2xl py-4 pl-12 pr-4 font-bold outline-none focus:border-blue-600" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
          </div>

          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input type={showPassword ? "text" : "password"} placeholder={userToEdit ? "Laisser vide si inchangé" : "Mot de passe"} className="w-full bg-slate-100 border-2 border-slate-200 rounded-2xl py-4 pl-12 pr-4 font-bold outline-none focus:border-blue-600" value={form.password} onChange={e => setForm({...form, password: e.target.value})} />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 cursor-pointer">{showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}</button>
          </div>

          {!userToEdit && (
            <select required className="w-full bg-slate-100 border-2 border-slate-200 rounded-2xl p-4 font-bold outline-none focus:border-blue-600 appearance-none" value={form.tenantId} onChange={e => setForm({...form, tenantId: e.target.value})}>
              <option value="">Sélectionner Organisation</option>
              {tenants.map((t: any) => <option key={t.T_Id} value={t.T_Id}>{t.T_Name}</option>)}
            </select>
          )}

          <div className="grid grid-cols-2 gap-3 max-h-48 overflow-y-auto pr-2">
            {PRISMA_ROLES.map(r => (
              <label key={r.value} className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${form.role === r.value ? 'border-blue-600 bg-blue-50' : 'border-slate-100 hover:border-slate-300'}`}>
                <input type="radio" className="hidden" checked={form.role === r.value} onChange={() => setForm({...form, role: r.value})} />
                <p className="text-[10px] font-black uppercase text-slate-900">{r.label}</p>
                <p className="text-[9px] font-bold text-slate-400 uppercase">{r.desc}</p>
              </label>
            ))}
          </div>

          <button disabled={loading} className="w-full bg-slate-900 text-white py-5 rounded-3xl font-black uppercase text-xs hover:bg-blue-600 transition-all flex items-center justify-center gap-3 cursor-pointer shadow-xl">
            {loading ? <Loader2 className="animate-spin" /> : <Save size={18}/>}
            {loading ? 'SCELLEMENT...' : 'SCELLER LE PROFIL'}
          </button>
        </form>
      </div>
    </div>
  );
}