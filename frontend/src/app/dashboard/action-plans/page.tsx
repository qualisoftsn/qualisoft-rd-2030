'use client';

import React, { useEffect, useState, useCallback } from 'react';
import apiClient from '@/core/api/api-client';
import { ClipboardCheck, Calendar, AlertTriangle, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function ActionPlansPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadPlans = useCallback(async () => {
    try {
      const res = await apiClient.get('/action-plans');
      setPlans(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Erreur Plans Action:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadPlans(); }, [loadPlans]);

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10">
      <div className="flex justify-between items-center mb-12">
        <div>
          <h1 className="text-4xl font-black italic uppercase tracking-tighter text-slate-900 leading-none">
            Plans <span className="text-green-600">de Traitement</span>
          </h1>
          <p className="text-slate-500 font-medium mt-2 italic text-sm">Suivi de la résolution des non-conformités</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {loading ? (
          <p className="p-10 text-slate-300 font-black italic animate-pulse uppercase">Synchronisation des plans...</p>
        ) : plans.map((plan) => (
          <div key={plan.id} className="bg-white rounded-[3rem] p-8 border border-slate-100 shadow-sm hover:shadow-2xl transition-all relative overflow-hidden group">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-green-50 text-green-600 rounded-2xl">
                  <ClipboardCheck size={24} />
                </div>
                <div>
                  <span className="px-3 py-1 rounded-lg bg-slate-100 text-[9px] font-black uppercase tracking-widest text-slate-500">
                    Statut: {plan.planStatus}
                  </span>
                  <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tight mt-1">{plan.planTitre}</h3>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 rounded-4xl p-6 mb-6">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                <AlertTriangle size={12} className="text-red-500" /> Lié à la NC :
              </p>
              <p className="text-sm font-bold text-slate-700 italic">&quot;{plan.nonConformite?.NCLibelle}&quot;</p>
            </div>

            <div className="flex justify-between items-center border-t border-slate-50 pt-6">
              <div className="flex gap-6">
                <div className="flex flex-col">
                  <span className="text-[9px] font-black text-slate-400 uppercase">Échéance</span>
                  <span className="text-xs font-bold text-slate-600 flex items-center gap-1">
                    <Calendar size={12} /> {plan.dateFinPrevue ? new Date(plan.dateFinPrevue).toLocaleDateString() : 'Non définie'}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] font-black text-slate-400 uppercase">Actions</span>
                  <span className="text-xs font-bold text-green-600 flex items-center gap-1">
                    <CheckCircle2 size={12} /> {plan.actions?.length || 0} tâches
                  </span>
                </div>
              </div>
              <button className="bg-slate-900 text-white p-4 rounded-2xl hover:bg-green-600 transition-all transform group-hover:scale-110">
                <ArrowRight size={20} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}