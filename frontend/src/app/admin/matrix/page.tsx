'use client';

import React, { useState, useEffect } from 'react';
import { matrixApi, TenantDetails } from '@/services/matrix.service';
import { Server, Loader2, Globe, Plus, ChevronRight } from 'lucide-react';
import { useAuth } from '@/core/providers/auth-provider'; 
import { toast } from 'sonner';

export default function MatrixControlPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [tenants, setTenants] = useState<TenantDetails[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated) {
      matrixApi.getTenants()
        .then(data => setTenants(data))
        .catch(() => toast.error("Erreur de liaison Matrix"))
        .finally(() => setLoading(false));
    }
  }, [isAuthenticated]);

  if (authLoading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>;
  if (!isAuthenticated) return <p className="text-white">Accès refusé.</p>;

  return (
    <div className="p-8 bg-slate-950 min-h-screen text-white italic">
      <h1 className="text-3xl font-black uppercase"><Server className="inline mr-2 text-blue-500"/> Matrix Control</h1>
      <div className="mt-8 bg-slate-900 rounded-3xl p-6 border border-slate-800">
        {loading ? <Loader2 className="animate-spin mx-auto" /> : (
          <table className="w-full">
            {/* Table des tenants identique... */}
          </table>
        )}
      </div>
    </div>
  );
}