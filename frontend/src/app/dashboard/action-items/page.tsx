/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import React, { useEffect, useState, useCallback } from 'react';
import apiClient from '@/core/api/api-client';
import { CheckSquare, Clock, User, Calendar, MoreHorizontal } from 'lucide-react';

export default function ActionItemsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadItems = useCallback(async () => {
    try {
      const res = await apiClient.get('/action-items');
      setItems(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Erreur Tâches:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadItems(); }, [loadItems]);

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10">
      <div className="mb-12">
        <h1 className="text-4xl font-black italic uppercase tracking-tighter text-slate-900 leading-none">
          Suivi des <span className="text-blue-600">Tâches</span>
        </h1>
        <p className="text-slate-500 font-medium mt-2 italic text-sm">Actions individuelles par responsable</p>
      </div>

      <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Tâche / Description</th>
              <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Responsable</th>
              <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Échéance</th>
              <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Statut</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-b border-slate-50 hover:bg-blue-50/20 transition-all group">
                <td className="p-6">
                  <p className="font-bold text-slate-800 uppercase text-sm tracking-tight">{item.itemTitre}</p>
                  <p className="text-xs text-slate-400 italic line-clamp-1">{item.itemDescription}</p>
                  <p className="text-[9px] font-black text-blue-500 mt-1 uppercase tracking-tighter">Plan: {item.actionPlan?.planTitre}</p>
                </td>
                <td className="p-6">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-500 border border-slate-200 uppercase">
                      {item.responsable?.firstName[0]}{item.responsable?.lastName[0]}
                    </div>
                    <span className="text-xs font-bold text-slate-600 uppercase tracking-tighter">
                      {item.responsable?.firstName} {item.responsable?.lastName}
                    </span>
                  </div>
                </td>
                <td className="p-6">
                  <div className="flex items-center text-xs font-bold text-slate-400 gap-1">
                    <Calendar size={12} className="text-blue-500" />
                    {item.itemEcheance ? new Date(item.itemEcheance).toLocaleDateString() : '—'}
                  </div>
                </td>
                <td className="p-6 text-center">
                  <span className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] ${
                    item.itemStatus === 'TERMINE' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'
                  }`}>
                    {item.itemStatus.replace('_', ' ')}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}