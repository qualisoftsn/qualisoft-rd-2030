/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useEffect } from 'react';
import { matrixApi, MatrixRole } from '@/services/matrix.service';
import { X, Save, Loader2, Mail, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

const PRISMA_ROLES = [
  { value: 'SUPER_ADMIN', label: '👑 SUPER ADMIN', desc: 'Contrôle total du Kernel Matrix' },
  { value: 'ADMIN', label: '🏢 ADMIN TENANT', desc: 'Administration locale de l\'organisation' },
  { value: 'RQ', label: '⭐ RESP. QUALITÉ (RQ)', desc: 'Pilotage SMI et Conformité' },
  { value: 'PILOTE', label: '✈️ PILOTE DE PROCESSUS', desc: 'Gestion opérationnelle' },
  { value: 'DIRECTION', label: '👔 DIRECTION', desc: 'Consultation et Rapports' },
  { value: 'HSE', label: '⛑️ HSE MANAGER', desc: 'Hygiène, Sécurité, Environnement' },
  { value: 'AUDITEUR', label: '🔍 AUDITEUR', desc: 'Audits et Inspections' },
  { value: 'USER', label: '👤 COLLABORATEUR', desc: 'Accès standard' },
];

export default function MatrixUserModal({ isOpen, onClose, onSuccess, userToEdit }: any) {
  const [loading, setLoading] = useState(false);
  const [tenants, setTenants] = useState<any[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '', role: 'USER' as MatrixRole, tenantId: '' });

  useEffect(() => {
    if (isOpen) {
      setErrorMsg(null);
      matrixApi.getTenants().then(setTenants).catch(() => toast.error("Sync Tenants Échouée"));
      if (userToEdit) {
        setForm({ firstName: userToEdit.U_FirstName || '', lastName: userToEdit.U_LastName || '', email: userToEdit.U_Email || '', role: userToEdit.U_Role || 'USER', tenantId: userToEdit.tenantId || '', password: '' });
      } else {
        setForm({ firstName: '', lastName: '', email: '', password: '', role: 'USER', tenantId: '' });
      }
    }
  }, [isOpen, userToEdit]);

  const decodeError = (err: any): string => {
    const raw = err.response?.data?.message;
    return Array.isArray(raw) ? raw.join(' | ') : (typeof raw === 'string' ? raw : "Rejet Matrix");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setErrorMsg(null);
    const tid = toast.loading("Scellage Kernel...");
    try {
      const payload: any = { firstName: form.firstName.trim(), lastName: form.lastName.trim(), email: form.email.trim().toLowerCase(), role: form.role };
      if (form.password) payload.password = form.password;

      if (userToEdit) await matrixApi.updateUser(userToEdit.U_Id, payload);
      else { if (!form.tenantId) throw new Error("Ancrage requis."); payload.tenantId = form.tenantId; await matrixApi.createGlobalUser(payload); }
      
      onSuccess(); onClose(); toast.success("SCELLÉ", { id: tid });
    } catch (err: any) {
      setErrorMsg(decodeError(err)); toast.error("ÉCHEC", { id: tid });
    } finally { setLoading(false); }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-200 flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-4 italic">
      <div className="bg-white rounded-[3rem] w-full max-w-2xl shadow-2xl border-4 border-slate-900 overflow-hidden flex flex-col max-h-[95vh] font-sans">
        <div className="p-8 bg-slate-50 border-b-2 border-slate-100 flex justify-between items-center shrink-0">
          <h2 className="text-3xl font-black text-slate-900 uppercase italic tracking-tighter">{userToEdit ? '📦 Rectifier Profil' : '🚀 Enrôler Agent'}</h2>
          <button onClick={onClose} className="p-3 bg-white border border-slate-200 rounded-full hover:bg-red-50 hover:text-red-500 transition-all border-none cursor-pointer"><X size={24}/></button>
        </div>
        {errorMsg && <div className="mx-8 mt-6 p-4 bg-red-50 border-l-4 border-red-600 flex items-start gap-3 animate-in fade-in"><AlertCircle className="text-red-600 shrink-0 mt-0.5" size={20} /><p className="text-[10px] font-black text-red-800 uppercase italic">{errorMsg}</p></div>}
        <form onSubmit={handleSubmit} className="p-10 space-y-6 overflow-y-auto flex-1 pb-10">
          <div className="grid grid-cols-2 gap-4">
            <input required placeholder="Prénom" className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-5 font-bold outline-none focus:border-blue-600 italic" value={form.firstName} onChange={e => setForm({...form, firstName: e.target.value})} />
            <input required placeholder="Nom" className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-5 font-bold outline-none focus:border-blue-600 italic" value={form.lastName} onChange={e => setForm({...form, lastName: e.target.value})} />
          </div>
          <div className="relative"><Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} /><input required type="email" placeholder="Email" className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-5 pl-14 pr-5 font-bold italic outline-none focus:border-blue-600" value={form.email} onChange={e => setForm({...form, email: e.target.value})} /></div>
          {!userToEdit && <select required className="w-full bg-slate-100 border-2 border-slate-200 rounded-2xl p-5 font-black uppercase text-xs italic outline-none cursor-pointer" value={form.tenantId} onChange={e => setForm({...form, tenantId: e.target.value})}><option value="">-- Organisation --</option>{tenants.map((t: any) => <option key={t.T_Id} value={t.T_Id}>{t.T_Name}</option>)}</select>}
          <div className="grid grid-cols-2 gap-4">
            {PRISMA_ROLES.map(r => (
              <label key={r.value} className={`p-4 rounded-3xl border-2 cursor-pointer transition-all ${form.role === r.value ? 'border-blue-600 bg-blue-50 shadow-inner' : 'border-slate-100 hover:border-slate-300'}`}>
                <input type="radio" className="hidden" checked={form.role === r.value} onChange={() => setForm({...form, role: r.value as MatrixRole})} />
                <p className="text-[10px] font-black uppercase tracking-tight">{r.label}</p>
                <p className="text-[8px] font-bold text-slate-400 uppercase leading-none">{r.desc}</p>
              </label>
            ))}
          </div>
          <button disabled={loading} className="w-full bg-slate-900 text-white py-6 rounded-4xl font-black uppercase text-xs tracking-widest hover:bg-blue-600 transition-all border-none cursor-pointer shadow-xl flex justify-center items-center gap-4">{loading ? <Loader2 className="animate-spin" /> : <Save size={20} />} SCELLER LE PROFIL</button>
        </form>
      </div>
    </div>
  );
}