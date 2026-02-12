/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useEffect, useState, useCallback } from "react";
import { 
  ChevronLeft, Crown, Loader2, Lock, ShieldCheck, 
  Terminal, Globe, ChevronRight, Mail, 
  Eye, EyeOff, Cpu, Fingerprint
} from "lucide-react";
import { getSession, signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useAuthStore, AuthUser } from "@/store/authStore";
import { matrixApi, PublicTenant, PublicUser } from "@/services/matrix.service";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const setLogin = useAuthStore((state) => state.setLogin);
  const logout = useAuthStore((state) => state.logout);

  // --- ÉTATS UI ---
  const [mode, setMode] = useState<"CHOICE" | "MASTER_LOGIN" | "TENANT_PORTAL">("CHOICE");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);

  // --- DONNÉES REGISTRE ---
  const [publicTenants, setPublicTenants] = useState<PublicTenant[]>([]);
  const [publicUsers, setPublicUsers] = useState<PublicUser[]>([]);

  // --- ÉTATS FORMULAIRES ---
  const [masterEmail, setMasterEmail] = useState("ab.thiongane@qualisoft.sn");
  const [masterKey, setMasterKey] = useState("");
  const [selectedTenantId, setSelectedTenantId] = useState("");
  const [selectedEmail, setSelectedEmail] = useState("");
  const [tenantPassword, setTenantPassword] = useState("");

  /**
   * 🛡️ SYNC DU STORE SANS REDIRECTION FORCÉE
   * On synchronise le store si une session existe, mais on NE REDIRIGE PAS
   * pour te laisser voir la page.
   */
  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      setLogin({ 
        token: (session as any).accessToken || "", 
        user: session.user as AuthUser 
      });
    }
  }, [status, session, setLogin]);

  /**
   * 🏗️ CHARGEMENT REGISTRE
   */
  useEffect(() => {
    if (mode === "TENANT_PORTAL") {
      matrixApi.getPublicTenants().then(setPublicTenants).catch(() => toast.error("Registre inaccessible."));
    }
  }, [mode]);

  useEffect(() => {
    if (!selectedTenantId) return;
    setIsLoadingUsers(true);
    matrixApi.getPublicTenantUsers(selectedTenantId)
      .then(setPublicUsers)
      .finally(() => setIsLoadingUsers(false));
  }, [selectedTenantId]);

  /**
   * 🖋️ PROTOCOLE D'AUTHENTIFICATION (Avec Redirection Manuelle)
   */
  const handleAuthProtocol = useCallback(async (e: React.FormEvent, email: string, pass: string, tenantId?: string) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const finalTenantId = email.toLowerCase().trim() === 'ab.thiongane@qualisoft.sn' ? "MATRIX" : tenantId;

      const result = await signIn("credentials", {
        email: email.toLowerCase().trim(),
        password: pass,
        tenantId: finalTenantId,
        redirect: false,
      });

      if (result?.error) throw new Error(result.error);

      // On récupère la session fraîchement créée
      const newSession = await getSession();
      if (newSession?.user) {
        const authUser = newSession.user as AuthUser;
        setLogin({ token: (newSession as any).accessToken || "", user: authUser });
        
        toast.success(`BIENVENUE DANS LA MATRIX`);
        
        // LA REDIRECTION NE SE FAIT QU'ICI
        const target = (authUser.U_Id === "CORE_MASTER" || authUser.U_Role === "SUPER_ADMIN")
          ? "/admin/matrix"
          : "/dashboard";
        router.push(target);
      }
    } catch (err: any) {
      toast.error(err.message || "Accès refusé");
    } finally {
      setIsLoading(false);
    }
  }, [router, setLogin]);

  return (
    <div className="min-h-screen flex italic bg-white font-sans overflow-hidden relative selection:bg-blue-100">
      
      {/* BACKGROUND DECO */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.02]">
         <Cpu className="absolute -top-20 -left-20 text-slate-900" size={600} />
         <Fingerprint className="absolute -bottom-40 -right-20 text-blue-900" size={500} />
      </div>

      <div className="flex-1 flex flex-col justify-center px-6 lg:px-20 z-10">
        <div className="max-w-md w-full mx-auto space-y-12 py-12">
          
          {/* HEADER */}
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-slate-900 rounded-[2.5rem] mb-8 shadow-2xl">
              <ShieldCheck className="text-blue-500" size={48} />
            </div>
            <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tighter italic">QUALI<span className="text-blue-600">SOFT</span></h1>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.5em] mt-4">Elite RD 2030</p>
          </div>

          {/* SÉLECTEUR DE MODE */}
          {mode === "CHOICE" && (
            <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
              <button onClick={() => setMode("MASTER_LOGIN")} className="w-full bg-slate-900 text-white p-8 rounded-[3rem] flex items-center justify-between border-none cursor-pointer shadow-2xl hover:bg-slate-800 transition-all">
                <div className="flex items-center gap-6 text-left">
                  <Terminal size={28} className="text-blue-400" />
                  <div>
                    <p className="text-[10px] uppercase font-black text-blue-400 tracking-widest">Supervision</p>
                    <p className="text-xl font-black uppercase">Master Console</p>
                  </div>
                </div>
                <ChevronRight size={20} className="text-slate-600" />
              </button>

              <button onClick={() => setMode("TENANT_PORTAL")} className="w-full bg-white text-slate-900 p-8 rounded-[3rem] border-2 border-slate-100 flex items-center justify-between cursor-pointer hover:border-blue-600 transition-all">
                <div className="flex items-center gap-6 text-left">
                  <Globe size={28} className="text-slate-400" />
                  <div>
                    <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest">Utilisateur</p>
                    <p className="text-xl font-black uppercase">Portail Entreprise</p>
                  </div>
                </div>
                <ChevronRight size={24} className="text-slate-200" />
              </button>
            </div>
          )}

          {/* MASTER LOGIN */}
          {mode === "MASTER_LOGIN" && (
            <form onSubmit={(e) => handleAuthProtocol(e, masterEmail, masterKey)} className="space-y-8 animate-in slide-in-from-right-8 duration-500">
              <button type="button" onClick={() => setMode("CHOICE")} className="flex items-center gap-2 text-[10px] font-black text-blue-600 bg-transparent border-none cursor-pointer uppercase"><ChevronLeft size={16} /> Revenir</button>
              <div className="space-y-4">
                <div className="relative"><Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={22} /><input type="email" value={masterEmail} className="w-full pl-16 pr-6 py-6 bg-slate-50 border-2 border-transparent rounded-4xl font-black text-slate-900 outline-none focus:border-blue-600 focus:bg-white transition-all text-lg" onChange={(e) => setMasterEmail(e.target.value)} /></div>
                <div className="relative"><Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={22} /><input type={showPassword ? "text" : "password"} required placeholder="CLÉ SOUVERAINE" className="w-full pl-16 pr-16 py-6 bg-slate-50 border-2 border-transparent rounded-4xl font-black text-slate-900 outline-none focus:border-blue-600 focus:bg-white transition-all text-lg" onChange={(e) => setMasterKey(e.target.value)} /><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-6 top-1/2 -translate-y-1/2 bg-transparent border-none text-slate-300 cursor-pointer">{showPassword ? <EyeOff size={20} /> : <Eye size={20} />}</button></div>
              </div>
              <button disabled={isLoading} className="w-full py-7 bg-slate-900 text-white rounded-[2.5rem] font-black uppercase tracking-[0.4em] flex justify-center items-center gap-4 border-none cursor-pointer shadow-2xl hover:bg-blue-600 transition-all">{isLoading ? <Loader2 className="animate-spin" size={24} /> : "Sceller Session"}</button>
            </form>
          )}

          {/* TENANT PORTAL */}
          {mode === "TENANT_PORTAL" && (
            <form onSubmit={(e) => handleAuthProtocol(e, selectedEmail, tenantPassword, selectedTenantId)} className="space-y-6 animate-in slide-in-from-right-8 duration-500">
              <button type="button" onClick={() => setMode("CHOICE")} className="flex items-center gap-2 text-[10px] font-black text-slate-400 bg-transparent border-none cursor-pointer uppercase"><ChevronLeft size={16} /> Retour</button>
              <div className="space-y-4">
                <select value={selectedTenantId} onChange={(e) => setSelectedTenantId(e.target.value)} className="w-full p-6 bg-slate-50 border-2 border-transparent rounded-4xl font-black uppercase text-xs appearance-none outline-none focus:border-blue-600 focus:bg-white transition-all text-slate-900 italic">
                  <option value="">-- CHOISIR L&apos;ORGANISATION --</option>
                  {publicTenants.map(t => <option key={t.T_Id} value={t.T_Id}>{t.T_Name}</option>)}
                </select>
                <select disabled={!selectedTenantId} value={selectedEmail} onChange={(e) => setSelectedEmail(e.target.value)} className="w-full p-6 bg-slate-50 border-2 border-transparent rounded-4xl font-black uppercase text-xs appearance-none outline-none focus:border-blue-600 focus:bg-white transition-all text-slate-900 italic">
                  <option value="">-- IDENTITÉ COLLABORATEUR --</option>
                  {publicUsers.map(u => <option key={u.U_Id} value={u.U_Email}>{u.U_FirstName} {u.U_LastName}</option>)}
                </select>
                <div className="relative"><Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={22} /><input type={showPassword ? "text" : "password"} required placeholder="MOT DE PASSE MATRIX" className="w-full pl-16 pr-16 py-6 bg-slate-50 border-2 border-transparent rounded-4xl font-black outline-none focus:border-blue-600 focus:bg-white transition-all text-lg" onChange={(e) => setTenantPassword(e.target.value)} /><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-6 top-1/2 -translate-y-1/2 bg-transparent border-none text-slate-300 cursor-pointer">{showPassword ? <EyeOff size={20} /> : <Eye size={20} />}</button></div>
              </div>
              <button disabled={isLoading || !selectedEmail} className="w-full py-7 bg-blue-600 text-white rounded-[2.5rem] font-black uppercase tracking-[0.3em] border-none shadow-xl hover:bg-slate-900 transition-all italic cursor-pointer">Ouvrir la Session</button>
            </form>
          )}

          <footer className="pt-16 border-t border-slate-100 text-center flex flex-col items-center gap-6">
            <div className="flex items-center justify-center gap-3 text-[10px] font-black text-slate-300 uppercase tracking-[0.6em] italic">
              <Crown size={14} className="text-amber-400" /> Qualisoft Elite Sovereign v1.6
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}