/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import React, { useEffect, useState } from 'react';
import apiClient from '@/core/api/api-client';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { AlertTriangle, Eye, Trash2, Calendar, MapPin } from 'lucide-react';

export default function SseListPage() {
  const [incidents, setIncidents] = useState([]);

  const loadIncidents = async () => {
    try {
      const res = await apiClient.get('/sse');
      setIncidents(res.data);
    } catch (err) {
      console.error("Erreur SSE:", err);
    }
  };

  useEffect(() => { loadIncidents(); }, []);

  const getGraviteColor = (gravite: string) => {
    switch (gravite) {
      case 'HAUTE': return 'bg-red-600';
      case 'MOYENNE': return 'bg-orange-500';
      default: return 'bg-blue-500';
    }
  };

  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-4xl font-black italic uppercase tracking-tighter">
          Journal des <span className="text-orange-600">Incidents SSE</span>
        </h1>
        <button className="bg-orange-600 text-white px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-slate-900 transition-all">
          Déclarer un incident
        </button>
      </div>

      <div className="space-y-4">
        {incidents.map((sse: any) => (
          <div key={sse.id} className="bg-white p-6 rounded-4xl border border-slate-100 shadow-sm flex items-center justify-between group hover:border-orange-200 transition-all">
            <div className="flex items-center gap-6">
              {/* Badge Gravité */}
              <div className={`${getGraviteColor(sse.gravite)} w-3 h-16 rounded-full`} />
              
              <div>
                <div className="flex items-center gap-3">
                  <h3 className="font-black text-slate-800 uppercase tracking-tight">{sse.type.replace('_', ' ')}</h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-500">{sse.statut}</span>
                </div>
                
                <p className="text-slate-500 text-sm italic mt-1 line-clamp-1">{sse.description}</p>
                
                <div className="flex items-center gap-4 mt-3 text-[10px] font-black uppercase text-slate-400">
                  <span className="flex items-center gap-1"><Calendar size={12}/> {new Date(sse.dateIncident).toLocaleDateString()}</span>
                  <span className="flex items-center gap-1"><MapPin size={12}/> {sse.site?.nom} - {sse.service?.nom}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button className="p-4 bg-slate-50 text-slate-400 hover:bg-blue-600 hover:text-white rounded-2xl transition-all">
                <Eye size={20} />
              </button>
              <button className="p-4 bg-slate-50 text-slate-400 hover:bg-red-600 hover:text-white rounded-2xl transition-all">
                <Trash2 size={20} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}