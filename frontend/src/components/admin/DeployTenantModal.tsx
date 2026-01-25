/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';
import React, { useState } from 'react';
import { adminService } from '@/services/adminService';
import { X, Rocket, ShieldAlert, CheckCircle2, Loader2 } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onRefresh: () => void;
}

export default function DeployTenantModal({ isOpen, onClose, onRefresh }: Props) {
  const [formData, setFormData] = useState({
    name: '',
    domain: '',
    adminEmail: '',
    plan: 'ESSAI'
  });
  const [loading, setLoading] = useState(false);
  const [successData, setSuccessData] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await adminService.deployInstance(formData);
      setSuccessData(result.data);
      onRefresh();
    } catch (err) {
      alert("Erreur critique lors du déploiement. Vérifiez les logs.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-xl rounded-[2.5rem] shadow-2xl p-10 relative overflow-hidden">
        {/* Décoration de fond */}
        <div className="absolute -top-24 -right-24 h-64 w-64 bg-blue-600/10 rounded-full blur-3xl" />

        <div className="relative z-10">
          {!successData ? (
            <>
              <div className="flex justify-between items-start mb-10">
                <div>
                  <h2 className="text-3xl font-black">Provisioning Elite</h2>
                  <p className="text-slate-500 text-sm mt-1 font-medium">Déploiement atomique d&apos;une nouvelle instance Qualisoft.</p>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full text-slate-500"><X /></button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6 font-bold">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-slate-500 px-1">Nom de l&apos;Organisation</label>
                  <input 
                    required
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl p-4 outline-none focus:border-blue-500 transition-all text-white placeholder:text-slate-600"
                    placeholder="ex: SENELEC - SA"
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-slate-500 px-1">Sous-domaine</label>
                    <input 
                      required
                      className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl p-4 outline-none focus:border-blue-500 transition-all text-sm font-mono"
                      placeholder="ex: senelec"
                      onChange={(e) => setFormData({...formData, domain: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-slate-500 px-1">Plan de souscription</label>
                    <select 
                      className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl p-4 outline-none focus:border-blue-500 appearance-none text-blue-400"
                      onChange={(e) => setFormData({...formData, plan: e.target.value})}
                    >
                      <option value="ESSAI">ESSAI (14J)</option>
                      <option value="EMERGENCE">EMERGENCE</option>
                      <option value="ENTREPRISE">ENTREPRISE</option>
                      <option value="GROUPE">GROUPE</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-slate-500 px-1">Email Administrateur Racine</label>
                  <input 
                    required type="email"
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl p-4 outline-none focus:border-blue-500 transition-all"
                    placeholder="ex: admin@senelec.sn"
                    onChange={(e) => setFormData({...formData, adminEmail: e.target.value})}
                  />
                </div>

                <div className="bg-blue-500/5 p-4 rounded-2xl border border-blue-500/10 flex gap-4 mt-4">
                   <ShieldAlert className="h-6 w-6 text-blue-500 shrink-0" />
                   <p className="text-[10px] text-slate-400 leading-relaxed font-medium italic">
                     Cette action va générer automatiquement un site siège, un type d&apos;unité direction et un compte administrateur. 
                     Un mot de passe temporaire sera généré.
                   </p>
                </div>

                <button 
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 py-5 rounded-2xl text-white font-black text-lg transition-all shadow-xl shadow-blue-600/20 mt-4 flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {loading ? <Loader2 className="animate-spin" /> : <Rocket />} 
                  {loading ? 'DÉPLOIEMENT EN COURS...' : 'LANCER LE PROVISIONING'}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center py-6">
              <div className="bg-emerald-500/10 h-24 w-24 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="h-12 w-12 text-emerald-500" />
              </div>
              <h2 className="text-3xl font-black mb-2 text-white">Déploiement Réussi</h2>
              <p className="text-slate-400 font-medium mb-8">L&apos;instance [<strong>{formData.name}</strong>] est maintenant opérationnelle.</p>
              
              <div className="bg-slate-800/50 p-6 rounded-3xl border border-slate-700 mb-8 text-left space-y-3">
                <div className="flex justify-between border-b border-slate-700 pb-2">
                  <span className="text-slate-500 text-xs font-bold uppercase tracking-widest">Login</span>
                  <span className="font-mono text-blue-400">{successData.admin.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 text-xs font-bold uppercase tracking-widest">Password</span>
                  <span className="font-mono text-white bg-slate-700 px-2 rounded tracking-widest">{successData.admin.temporaryPassword}</span>
                </div>
              </div>

              <button 
                onClick={onClose}
                className="w-full bg-slate-800 hover:bg-slate-700 py-4 rounded-2xl font-black transition-all"
              >
                RETOURNER AU COCKPIT
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}