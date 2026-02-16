/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useEffect } from 'react';
import { matrixApi, MatrixRole } from '@/services/matrix.service';
import { X, Save, Loader2, Mail, Lock, Shield, Eye, EyeOff, AlertCircle, UserCircle } from 'lucide-react';
import { toast } from 'sonner';

/**
 * 🛠️ REGISTRE DES CITOYENS - QUALISOFT ELITE RD 2030
 * Rôle : Création et Rectification des identités numériques Matrix.
 */

// Liste exhaustive des rôles alignés sur ton Schéma Prisma
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

interface MatrixUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  userToEdit?: any;
}

export default function MatrixUserModal({ isOpen, onClose, onSuccess, userToEdit }: MatrixUserModalProps) {
  const [loading, setLoading] = useState(false);
  const [tenants, setTenants] = useState<any[]>([]);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'USER' as MatrixRole,
    tenantId: ''
  });

  // 1. Initialisation du contexte
  useEffect(() => {
    if (isOpen) {
      setErrorMsg(null);
      // Récupération des tenants pour l'assignation Master
      matrixApi.getTenants().then(setTenants).catch(() => toast.error("Sync Tenants Échouée"));
      
      if (userToEdit) {
        setForm({
          firstName: userToEdit.U_FirstName || '',
          lastName: userToEdit.U_LastName || '',
          email: userToEdit.U_Email || '',
          role: userToEdit.U_Role || 'USER',
          tenantId: userToEdit.tenantId || '',
          password: '' // On ne charge jamais le password existant
        });
      } else {
        setForm({ firstName: '', lastName: '', email: '', password: '', role: 'USER', tenantId: '' });
      }
    }
  }, [isOpen, userToEdit]);

  // 2. Décodeur d'erreurs NestJS (Fix [object Object])
  const decodeError = (err: any): string => {
    const raw = err.response?.data?.message;
    if (Array.isArray(raw)) return raw.join(' | ');
    if (typeof raw === 'string') return raw;
    return "Violation du protocole de sécurité Matrix.";
  };

  // 3. Soumission souveraine
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    const tid = toast.loading(userToEdit ? "Rectification en cours..." : "Enrôlement en cours...");

    try {
      // 🏗️ Nettoyage chirurgical du payload
      const payload: any = {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim().toLowerCase(),
        role: form.role,
      };

      if (form.password) payload.password = form.password;

      if (userToEdit) {
        // PATCH : On utilise la méthode de mise à jour (l'id est dans l'URL, pas dans le body)
        await matrixApi.updateUser(userToEdit.U_Id, payload);
        toast.success("RECTIFICATION SCELLÉE", { id: tid });
      } else {
        // POST : Création globale avec tenantId
        if (!form.tenantId) throw new Error("Sélection du nœud d'ancrage requise.");
        payload.tenantId = form.tenantId;
        await matrixApi.createGlobalUser(payload);
        toast.success("CITOYEN ENRÔLÉ", { id: tid });
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      const msg = err.response ? decodeError(err) : (err.message || "Erreur de communication.");
      setErrorMsg(msg);
      toast.error("ÉCHEC DU PROTOCOLE", { id: tid });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-200 flex items-center justify-center bg-slate-950/90 backdrop-blur-xl p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-[3rem] w-full max-w-2xl shadow-2xl border-4 border-slate-900 overflow-hidden flex flex-col max-h-[95vh] italic font-sans">
        
        {/* HEADER */}
        <div className="p-10 bg-slate-50 border-b-2 border-slate-100 flex justify-between items-center shrink-0">
          <div>
            <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter italic">
              {userToEdit ? '📦 Rectifier Profil' : '🚀 Enrôler Agent'}
            </h2>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-1 italic pl-1">Registre d&apos;Identité Matrix RD 2030</p>
          </div>
          <button onClick={onClose} className="p-3 bg-white border border-slate-200 rounded-full hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-all cursor-pointer">
            <X size={24}/>
          </button>
        </div>

        {/* ERREUR LOG */}
        {errorMsg && (
          <div className="mx-10 mt-6 p-5 bg-red-50 border-l-4 border-red-600 rounded-r-2xl flex items-start gap-4 animate-in slide-in-from-top-2">
            <AlertCircle className="text-red-600 shrink-0 mt-0.5" size={20} />
            <p className="text-[11px] font-black text-red-800 uppercase leading-relaxed tracking-tight italic">{errorMsg}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-10 space-y-8 overflow-y-auto custom-scrollbar flex-1 pb-10">
          
          {/* IDENTITÉ */}
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Prénom</label>
              <input required placeholder="Prénom" className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-5 font-bold outline-none focus:border-blue-600 focus:bg-white transition-all text-slate-900" value={form.firstName} onChange={e => setForm({...form, firstName: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Nom de famille</label>
              <input required placeholder="Nom" className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-5 font-bold outline-none focus:border-blue-600 focus:bg-white transition-all text-slate-900" value={form.lastName} onChange={e => setForm({...form, lastName: e.target.value})} />
            </div>
          </div>

          {/* ACCRÉDITATION */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Identifiant (Email)</label>
            <div className="relative group">
              <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
              <input required type="email" placeholder="email@domaine.sn" className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-5 pl-14 pr-5 font-bold outline-none focus:border-blue-600 focus:bg-white transition-all text-slate-900" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Clé de Cryptage (Password)</label>
            <div className="relative group">
              <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
              <input type={showPassword ? "text" : "password"} placeholder={userToEdit ? "••••••••" : "Mot de passe par défaut"} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-5 pl-14 pr-14 font-bold outline-none focus:border-blue-600 focus:bg-white transition-all text-slate-900" value={form.password} onChange={e => setForm({...form, password: e.target.value})} />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors cursor-pointer bg-transparent border-none">
                {showPassword ? <EyeOff size={20}/> : <Eye size={20}/>}
              </button>
            </div>
            {userToEdit && <p className="text-[9px] font-black text-amber-600 uppercase tracking-widest ml-2 mt-1 italic">Laisser vide pour ne pas modifier la clé.</p>}
          </div>

          {/* ANCRAGE NŒUD (Uniquement à la création) */}
          {!userToEdit && (
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Ancrage Territorial (Organisation)</label>
              <select required className="w-full bg-slate-100 border-2 border-slate-200 rounded-2xl p-5 font-black uppercase text-xs text-slate-900 outline-none focus:border-blue-600 cursor-pointer italic" value={form.tenantId} onChange={e => setForm({...form, tenantId: e.target.value})}>
                <option value="">-- Sélectionner l&apos;organisation cible --</option>
                {tenants.map((t: any) => <option key={t.T_Id} value={t.T_Id}>{t.T_Name}</option>)}
              </select>
            </div>
          )}

          {/* SÉLECTEUR DE RÔLE SOUVERAIN */}
          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Niveau d&apos;Accréditation (Rôle)</label>
            <div className="grid grid-cols-2 gap-4">
              {PRISMA_ROLES.map(r => (
                <label key={r.value} className={`p-5 rounded-3xl border-2 cursor-pointer transition-all flex flex-col gap-1 relative overflow-hidden group ${form.role === r.value ? 'border-blue-600 bg-blue-50/50 shadow-inner' : 'border-slate-100 hover:border-slate-300 bg-slate-50/30'}`}>
                  <input type="radio" className="hidden" name="role" checked={form.role === r.value} onChange={() => setForm({...form, role: r.value as MatrixRole})} />
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase text-slate-900 italic tracking-tight">{r.label}</span>
                    {form.role === r.value && <Shield className="text-blue-600" size={14} />}
                  </div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-1">{r.desc}</span>
                  {form.role === r.value && <div className="absolute top-0 right-0 w-8 h-8 bg-blue-600/10 rounded-bl-full" />}
                </label>
              ))}
            </div>
          </div>

          {/* ACTIONS */}
          <button disabled={loading} className="w-full bg-slate-900 text-white py-6 rounded-4xl font-black uppercase text-xs tracking-[0.3em] hover:bg-blue-600 transition-all flex items-center justify-center gap-4 cursor-pointer border-none shadow-2xl active:scale-95 disabled:opacity-50 mt-4 group">
            {loading ? <Loader2 className="animate-spin" /> : <Save size={20} className="group-hover:rotate-12 transition-transform" />}
            {loading ? 'PROTOCOLE DE SCELLEMENT...' : 'SCELLER LE PROFIL AGENT'}
          </button>
        </form>
      </div>
    </div>
  );
}