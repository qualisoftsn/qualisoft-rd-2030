/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
//* eslint-disable react-hooks/set-state-in-effect */
/**
 * 🔑 MODULE : LoginPage.tsx (elite-sde)
 * -------------------------------------------------------------------------
 * RÔLE : Portail d'accès Multi-Tenant & Console Master.
 * FIX : Remplacement du champ texte vide par une liste déroulante dynamique (Select)
 * alimentée par l'API pour les connexions depuis le domaine racine.
 * SÉCURITÉ : Zéro NextAuth. API SDE validée. Bypass Master conservé.
 * RÉVISION : 04 Mars 2026 | 05:40 GMT
 * -------------------------------------------------------------------------
 */

"use client";

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  Loader2, Mail, Lock, Eye, EyeOff, 
  ShieldCheck, Building2, ChevronLeft,
  Fingerprint, Crown, ChevronDown
} from 'lucide-react';
import { toast, Toaster } from 'sonner';
import apiClient from '@/core/api/api-client';
import { useAuthStore } from '@/store/authStore';
import Image from 'next/image';

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';
  const { setLogin } = useAuthStore() as any;

  // 🛡️ ÉTATS SOUVERAINS
  const [mode, setMode] = useState<'LOADING' | 'CHOICE' | 'LOGIN_FORM'>('LOADING');
  const [loginType, setLoginType] = useState<'MASTER' | 'TENANT'>('TENANT');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // GESTION DU MULTI-TENANT
  const [detectedTenant, setDetectedTenant] = useState<any>(null);
  const [tenantList, setTenantList] = useState<any[]>([]); // Liste des organisations
  
  // FORMULAIRE D'IDENTIFICATION
  const [form, setForm] = useState({ email: '', password: '', tenantId: '' });

  // 📡 CHARGEMENT DE LA LISTE DES ORGANISATIONS
  const fetchTenantList = async () => {
    try {
      const res = await apiClient.get('/public/tenants');
      // Adaptation selon la structure de votre réponse API (res.data ou res.data.data)
      const tenants = Array.isArray(res.data) ? res.data : (res.data?.data || []);
      setTenantList(tenants);
    } catch (err) {
      console.error("Échec de récupération de la liste des organisations Matrix", err);
    }
  };

  // 🌐 DÉTECTION DU LOCATAIRE (API MATRIX)
  useEffect(() => {
    const detectNode = async () => {
      try {
        const host = window.location.hostname.toLowerCase();
        const slug = host.split('.')[0];
        
        // Liste des accès Master SDE
        const masterNodes = ['app', 'matrix', 'admin', 'master', 'localhost'];
        
        if (masterNodes.includes(slug)) {
          setLoginType('MASTER');
          setForm(p => ({ ...p, tenantId: 'MATRIX' }));
          setMode('LOGIN_FORM');
        } else if (!['elite', 'www', 'qualisoft'].includes(slug)) {
          // 📡 Interrogation de l'API pour valider l'existence du sous-domaine
          const res = await apiClient.get(`/public/tenants/by-slug/${slug}`);
          if (res.data) {
            setDetectedTenant(res.data);
            setForm(p => ({ ...p, tenantId: res.data.T_Id })); // Stockage de l'ID réel pour l'API
            setLoginType('TENANT');
            setMode('LOGIN_FORM');
          } else {
            // Sous-domaine inconnu -> On propose le choix
            await fetchTenantList();
            setMode('CHOICE');
          }
        } else {
          // Domaine racine -> On propose le choix et on charge la liste
          await fetchTenantList();
          setMode('CHOICE');
        }
      } catch (err) {
        await fetchTenantList();
        setMode('CHOICE');
      }
    };
    detectNode();
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const tid = toast.loading('Scellage de session en cours...');

    try {
      // 👑 BYPASS MASTER ARCHITECT (A. THIONGANE)
      if (form.email === 'ab.thiongane@qualisoft.sn' && form.password === 'Qualisoft@2026') {
        const masterData = { 
          token: "MASTER_PROTOCOL_2026", 
          user: { U_Id: "ROOT", U_Email: form.email, U_Role: "SUPER_ADMIN", U_FirstName: "A.", U_LastName: "THIONGANE", tenantId: "MASTER" } 
        };
        setLogin(masterData);
        toast.success("ACCÈS SOUVERAIN ACTIVÉ", { id: tid });
        router.push('/dashboard');
        return;
      }

      // 🔐 REQUÊTE D'AUTHENTIFICATION (ZÉRO NEXTAUTH)
      const res = await apiClient.post('/auth/login', { 
        email: form.email.toLowerCase().trim(), 
        password: form.password, 
        tenantId: form.tenantId 
      });

      setLogin(res.data);
      toast.success(`Authentification réussie`, { id: tid });
      router.push(callbackUrl);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Identifiants invalides ou accès refusé.', { id: tid });
    } finally {
      setIsLoading(false);
    }
  };

  // 🌀 ÉCRAN DE CHARGEMENT INITIAL
  if (mode === 'LOADING') {
    return (
      <div className="flex flex-col items-center gap-4 italic animate-pulse">
        <Loader2 className="animate-spin text-blue-600" size={40} />
        <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Initialisation du SAS Matrix...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-lg bg-[#0F172A]/80 border border-blue-600/20 rounded-[3rem] p-10 lg:p-12 backdrop-blur-3xl shadow-[0_0_100px_rgba(37,99,235,0.15)] italic relative z-10">
      
      {/* 🛡️ EN-TÊTE DU FORMULAIRE */}
      <div className="text-center mb-10">
        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-2xl mx-auto mb-6">
          <Image src="/images/qslogo.png" alt="Qualisoft Matrix" width={40} height={40} />
        </div>
        <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter m-0">
          {detectedTenant?.T_Name || (loginType === 'MASTER' ? 'Matrix Console' : 'Elite Matrix OS')}
        </h2>
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em] mt-2">
          Portail d&apos;authentification
        </p>
      </div>

      {/* 🔀 SÉLECTION MANUELLE (Si domaine racine) */}
      {mode === 'CHOICE' ? (
        <div className="space-y-6 animate-in slide-in-from-bottom-4">
          <button onClick={() => { setLoginType('TENANT'); setMode('LOGIN_FORM'); }} className="w-full p-8 bg-blue-600 rounded-3xl flex justify-between items-center text-white font-black italic hover:bg-blue-500 transition-all border-none cursor-pointer shadow-xl">
            <span>ACCÈS ELITE SDE</span>
            <Building2 size={24} />
          </button>
          <button onClick={() => { setLoginType('MASTER'); setMode('LOGIN_FORM'); setForm(p => ({ ...p, tenantId: 'MATRIX' })); }} className="w-full p-8 bg-white/5 border border-white/10 rounded-3xl flex justify-between items-center text-slate-400 font-black italic hover:text-amber-500 hover:border-amber-500/50 transition-all cursor-pointer">
            <span>CONSOLE MASTER</span>
            <Crown size={24} />
          </button>
        </div>
      ) : (
        /* 📝 FORMULAIRE DE CONNEXION SCELLÉ */
        <form onSubmit={handleAuth} className="space-y-5 animate-in slide-in-from-bottom-4">
          
          {/* 🏢 CHAMP ORGANISATION (Visible uniquement pour les Tenants) */}
          {loginType === 'TENANT' && (
            <div className="space-y-2">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-2">Organisation</label>
              <div className="relative group">
                <Building2 className={`absolute left-5 top-1/2 -translate-y-1/2 transition-colors ${detectedTenant ? 'text-blue-500' : 'text-slate-500 group-focus-within:text-blue-500'}`} size={18} />
                
                {detectedTenant ? (
                  /* CAS 1 : SOUS-DOMAINE DÉTECTÉ -> Champ verrouillé visuellement */
                  <>
                    <input 
                      type="text" 
                      required
                      className="w-full p-5 pl-14 rounded-2xl outline-none uppercase text-xs font-black italic transition-colors bg-[#0B0F1A] border border-blue-500/30 text-blue-400 cursor-not-allowed opacity-90"
                      value={detectedTenant.T_Name}
                      readOnly
                    />
                    <ShieldCheck className="absolute right-5 top-1/2 -translate-y-1/2 text-blue-500" size={18} />
                  </>
                ) : (
                  /* CAS 2 : DOMAINE RACINE -> Liste déroulante des locataires */
                  <>
                    <select
                      required
                      className="w-full p-5 pl-14 pr-12 bg-[#0B0F1A] border border-white/10 rounded-2xl text-white outline-none focus:border-blue-500 transition-colors uppercase text-xs font-black italic appearance-none cursor-pointer"
                      value={form.tenantId}
                      onChange={e => setForm({...form, tenantId: e.target.value})}
                    >
                      <option value="" disabled className="text-slate-500">-- SÉLECTIONNEZ VOTRE ORGANISATION --</option>
                      {tenantList.map((t: any) => (
                        <option key={t.T_Id} value={t.T_Id} className="bg-[#0F172A] text-white py-2">
                          {t.T_Name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={18} />
                  </>
                )}
              </div>
            </div>
          )}

          {/* 📧 CHAMP EMAIL */}
          <div className="space-y-2">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-2">Identifiant</label>
            <div className="relative group">
              <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={18} />
              <input 
                type="email" 
                required
                placeholder="VOTRE EMAIL PROFESSIONNEL" 
                className="w-full p-5 pl-14 bg-[#0B0F1A] border border-white/10 rounded-2xl text-white outline-none focus:border-blue-500 transition-colors uppercase text-xs font-black italic"
                value={form.email}
                onChange={e => setForm({...form, email: e.target.value})}
              />
            </div>
          </div>

          {/* 🔒 CHAMP MOT DE PASSE */}
          <div className="space-y-2">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-2">Mot de passe</label>
            <div className="relative group">
              <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={18} />
              <input 
                type={showPassword ? "text" : "password"} 
                required
                placeholder="••••••••••••" 
                className="w-full p-5 pl-14 pr-14 bg-[#0B0F1A] border border-white/10 rounded-2xl text-white outline-none focus:border-blue-500 transition-colors font-black italic"
                value={form.password}
                onChange={e => setForm({...form, password: e.target.value})}
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white border-none bg-transparent cursor-pointer transition-colors">
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={isLoading || !form.tenantId} className={`w-full mt-4 py-6 rounded-2xl font-black uppercase tracking-[0.3em] text-sm italic transition-all flex justify-center items-center gap-3 border-none shadow-xl shadow-blue-900/20 ${isLoading || !form.tenantId ? 'bg-white/5 text-slate-500 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-500 cursor-pointer'}`}>
            {isLoading ? <Loader2 className="animate-spin" size={20} /> : "ACTIVER LA SESSION"}
          </button>

          <button type="button" onClick={() => setMode('CHOICE')} className="w-full pt-4 text-[9px] font-black text-slate-600 uppercase tracking-widest border-none bg-transparent cursor-pointer hover:text-white transition-all">
            <ChevronLeft size={10} className="inline mr-1 -mt-0.5" /> Retour
          </button>
        </form>
      )}
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#0B0F1A] flex items-center justify-center p-6 selection:bg-blue-600/30 overflow-hidden relative">
      <Toaster position="top-right" richColors theme="dark" />
      
      {/* 🔮 CORE MATRIX EFFECTS */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-0">
        <Fingerprint className="absolute -top-10 -left-10 text-blue-600/10" size={500} />
        <div className="absolute -bottom-[30%] -right-[10%] w-200 h-200 bg-blue-600/10 blur-[120px] rounded-full animate-pulse" />
      </div>

      <Suspense fallback={<Loader2 className="animate-spin text-blue-600 relative z-10" size={48} />}>
        <LoginFormContent />
      </Suspense>
    </div>
  );
}