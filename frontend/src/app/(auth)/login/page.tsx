'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/core/providers/auth-provider';

function LoginContent() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading, tenantSlug } = useAuth();
  const [mode, setMode] = useState<'LOADING' | 'CHOICE' | 'LOGIN_FORM'>('LOADING');
  const [form, setForm] = useState({ email: '', password: '', tenantId: '' });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.push(tenantSlug === 'matrix' ? '/admin/matrix' : '/dashboard');
    }
  }, [authLoading, isAuthenticated, tenantSlug, router]);

  useEffect(() => {
    const initMatrix = async () => {
      try {
        const res = await fetch('/api/public/tenants');
        const tenants = await res.json();
        const slug = window.location.hostname.split('.')[0].toLowerCase();

        const match = tenants.find((t: any) => t.T_Domain.split('.')[0].toLowerCase() === slug);
        if (slug === 'matrix' || slug === 'elite') {
          setForm(f => ({ ...f, tenantId: 'MATRIX' }));
          setMode('LOGIN_FORM');
        } else if (match) {
          setForm(f => ({ ...f, tenantId: match.T_Id }));
          setMode('LOGIN_FORM');
        } else {
          setMode('CHOICE');
        }
      } catch { setMode('CHOICE'); }
    };
    initMatrix();
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error('Accès refusé');
      const data = await res.json();
      document.cookie = `qualisoft_token=${data.accessToken}; path=/; max-age=28800; Secure; SameSite=Lax`;
      window.location.href = data.user.tenantDomain ? `https://${data.user.tenantDomain}.qualisoft.sn/dashboard` : '/dashboard';
    } catch (err: any) {
      toast.error("Identifiants incorrects");
    } finally { setIsLoading(false); }
  };

  if (mode === 'LOADING') return <Loader2 className="animate-spin text-blue-600" />;

  return (
    <div className="w-full max-w-md bg-slate-900/40 border border-white/5 rounded-[3rem] p-10 backdrop-blur-xl">
       <div className="text-center mb-8"><ShieldCheck size={40} className="text-blue-500 mx-auto" /></div>
       <form onSubmit={handleAuth} className="space-y-5">
          <input required type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full p-4 bg-black/20 border border-white/10 rounded-xl text-white outline-none" placeholder="EMAIL" />
          <input required type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} className="w-full p-4 bg-black/20 border border-white/10 rounded-xl text-white outline-none" placeholder="MOT DE PASSE" />
          <button type="submit" className="w-full py-4 bg-blue-600 rounded-xl font-black text-white hover:bg-blue-500 transition-all">
            {isLoading ? <Loader2 className="animate-spin mx-auto" /> : "AUTORISER L'ACCÈS"}
          </button>
       </form>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#0B0F1A] flex items-center justify-center">
      <Suspense fallback={<Loader2 className="animate-spin text-blue-600" />}><LoginContent /></Suspense>
    </div>
  );
}