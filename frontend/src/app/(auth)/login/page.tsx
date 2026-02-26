/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
// app/(auth)/login/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  Loader2, Mail, Lock, Eye, EyeOff, ArrowRight, ShieldCheck, 
  Globe, Building2, Key 
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/core/providers/auth-provider';
import { authManager } from '@/core/auth/auth-manager';

interface PublicTenant {
  T_Id: string;
  T_Name: string;
  T_Domain: string;
}

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, isLoading: authLoading, tenantSlug } = useAuth();
  const [mode, setMode] = useState<'LOADING' | 'CHOICE' | 'LOGIN_FORM' | 'MASTER_LOGIN'>('LOADING');
  const [loginType, setLoginType] = useState<'MASTER' | 'TENANT'>('TENANT');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [detectedTenant, setDetectedTenant] = useState<PublicTenant | null>(null);
  const [publicTenants, setPublicTenants] = useState<PublicTenant[]>([]);
  const [form, setForm] = useState({ email: '', password: '', tenantId: '' });
  const [masterPassword, setMasterPassword] = useState('');

  // ✅ REDIRECTION SI DÉJÀ CONNECTÉ
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      // Redirection adaptée au type de session
      if (tenantSlug === 'matrix') {
        router.push('/admin/matrix');
      } else {
        router.push('/dashboard');
      }
    }
  }, [authLoading, isAuthenticated, router, tenantSlug]);

  useEffect(() => {
    const loadTenants = async () => {
      try {
        const res = await fetch('/api/public/tenants');
        const tenants = await res.json();
        setPublicTenants(tenants);

        // 🔍 DÉTECTION AUTOMATIQUE PAR SOUS-DOMAINE (OVH)
        const hostname = window.location.hostname;
        const parts = hostname.split('.');
        const slug = parts[0].toLowerCase();
        const reserved = ['www', 'api', 'app', 'elite', 'localhost', 'matrix'];

        // Cas MASTER : accès direct à matrix.qualisoft.sn
        if (slug === 'matrix') {
          setMode('MASTER_LOGIN');
          return;
        }

        // Cas Tenant : détection via sous-domaine
        if (parts.length > 2 && !reserved.includes(slug)) {
          const match = tenants.find((t: PublicTenant) => t.T_Domain.toLowerCase() === slug);
          if (match) {
            setDetectedTenant(match);
            setForm((prev) => ({ ...prev, tenantId: match.T_Id }));
            setLoginType('TENANT');
            setMode('LOGIN_FORM');
            return;
          }
        }

        setMode('CHOICE');
      } catch (error) {
        console.error('Failed to load tenants:', error);
        setMode('CHOICE');
      }
    };

    loadTenants();
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loginType === 'TENANT' && !form.tenantId) {
      toast.error('Veuillez sélectionner une organisation.');
      return;
    }

    setIsLoading(true);
    const tid = toast.loading('Vérification des accréditations...');

    try {
      const payload = {
        email: form.email.toLowerCase().trim(),
        password: form.password,
        tenantId: loginType === 'MASTER' ? 'MATRIX' : form.tenantId,
      };

      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include',
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'Identifiants invalides');
      }

      const data = await res.json();
      
      // ✅ STOCKAGE SÉCURISÉ EN MÉMOIRE
      authManager.setToken(data.accessToken, data.expiresIn, false);

      toast.success('Accès autorisé.', { id: tid });

      // 🚩 REDIRECTION TERRITORIALE SÉCURISÉE (OVH)
      const targetDomain = data.user.tenantDomain || 'app';
      const currentHostname = window.location.hostname;

      if (currentHostname.startsWith(targetDomain)) {
        router.push('/dashboard');
      } else {
        window.location.href = `https://${targetDomain}.qualisoft.sn/dashboard`;
      }
    } catch (err: any) {
      toast.error(err.message || 'Échec de l\'authentification', { id: tid });
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ AUTHENTIFICATION SPÉCIALE POUR LE COMPTE "ÉTERNEL" MATRIX
  const handleMasterAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const tid = toast.loading('Vérification des accréditations Matrix...');

    try {
      await authManager.signInMaster(masterPassword);
      // La redirection est gérée dans signInMaster()
    } catch (err: any) {
      toast.error(err.message || 'Accès Matrix refusé', { id: tid });
      setIsLoading(false);
    }
  };

  if (mode === 'LOADING' || authLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center">
        <Loader2 className="animate-spin text-blue-600 h-12 w-12" />
        <p className="mt-4 text-gray-400 text-sm">
          {tenantSlug === 'matrix' ? 'Accès Matrix en cours...' : 'Identification du nœud client...'}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-gray-800/50 border border-gray-700 rounded-2xl p-8 shadow-xl">
        <div className="text-center mb-8">
          <div className="inline-flex p-4 bg-gray-900 border border-gray-700 rounded-xl mb-4">
            <ShieldCheck 
              size={32} 
              className={tenantSlug === 'matrix' ? 'text-purple-500' : 'text-emerald-500'} 
            />
          </div>
          <h1 className="text-3xl font-bold text-white">
            {detectedTenant ? detectedTenant.T_Name : tenantSlug === 'matrix' ? 'MATRIX' : 'QUALISOFT'}
          </h1>
          <p className="text-gray-500 text-sm mt-2">
            {detectedTenant 
              ? `Organisation : ${detectedTenant.T_Domain}` 
              : tenantSlug === 'matrix' 
                ? 'Gestion Multi-Tenant Centralisée' 
                : 'Plateforme de gestion qualité'}
          </p>
        </div>

        {mode === 'CHOICE' ? (
          <div className="space-y-4">
            <button
              onClick={() => {
                setLoginType('MASTER');
                setMode('MASTER_LOGIN');
              }}
              className="w-full bg-gray-900 p-6 rounded-xl border border-gray-700 flex justify-between items-center hover:border-purple-500 transition-colors"
            >
              <div className="text-left">
                <p className="text-xs text-purple-400 font-medium">Accès Matrix</p>
                <p className="text-lg text-white font-semibold">Gestion Multi-Tenant</p>
              </div>
              <Key className="text-purple-500" />
            </button>
            <button
              onClick={() => {
                setLoginType('TENANT');
                setMode('LOGIN_FORM');
              }}
              className="w-full bg-white p-6 rounded-xl flex justify-between items-center hover:shadow-lg transition-shadow"
            >
              <div className="text-left">
                <p className="text-xs text-gray-500 font-medium">Accès Client</p>
                <p className="text-lg text-gray-900 font-semibold">Portail Organisation</p>
              </div>
              <Building2 className="text-gray-500" />
            </button>
          </div>
        ) : mode === 'MASTER_LOGIN' ? (
          // ✅ INTERFACE SPÉCIALE POUR LE COMPTE "ÉTERNEL" MATRIX
          <form onSubmit={handleMasterAuth} className="space-y-6">
            <div className="text-center mb-6">
              <div className="inline-flex p-3 bg-purple-900/20 rounded-lg mb-4">
                <Globe size={28} className="text-purple-400" />
              </div>
              <h2 className="text-2xl font-bold text-white">Accès Matrix</h2>
              <p className="text-gray-400 text-sm mt-1">
                Interface de gestion multi-tenant réservée à l&apos;administrateur système
              </p>
            </div>

            <div className="relative">
              <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                required
                type={showPassword ? 'text' : 'password'}
                placeholder="Clé d'accès Matrix"
                className="w-full pl-10 pr-10 p-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                value={masterPassword}
                onChange={(e) => setMasterPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <button
              disabled={isLoading}
              type="submit"
              className="w-full py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-500 transition-colors flex justify-center items-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  Authentification Matrix...
                </>
              ) : (
                <>
                  Accéder à Matrix <ArrowRight size={18} />
                </>
              )}
            </button>

            <div className="text-center mt-4">
              <button
                type="button"
                onClick={() => setMode('CHOICE')}
                className="text-sm text-gray-400 hover:text-gray-300"
              >
                ← Retour au choix d&apos;accès
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleAuth} className="space-y-6">
            {!detectedTenant && (
              <button
                type="button"
                onClick={() => setMode('CHOICE')}
                className="text-sm text-blue-500 font-medium flex items-center gap-1 hover:text-blue-400"
              >
                ← Retour au choix
              </button>
            )}

            <div className="space-y-4">
              {loginType === 'TENANT' && detectedTenant && (
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-500" size={18} />
                  <input
                    disabled
                    value={detectedTenant.T_Name}
                    className="w-full pl-10 p-3 bg-blue-900/20 border border-blue-900/30 rounded-lg text-blue-300 font-medium"
                  />
                </div>
              )}

              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  required
                  type="email"
                  placeholder="Email"
                  className="w-full pl-10 p-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  required
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Mot de passe"
                  className="w-full pl-10 pr-10 p-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              disabled={isLoading}
              type="submit"
              className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-500 transition-colors flex justify-center items-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  Connexion...
                </>
              ) : (
                <>
                  Se connecter <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}