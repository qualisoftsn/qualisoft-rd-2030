'use client';

import React from 'react';
import { X, Calendar, MapPin, AlertCircle, Clock } from 'lucide-react';

interface SSEDetailsModalProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  sse: any;
  isOpen: boolean;
  onClose: () => void;
}

export default function SSEDetailsModal({ sse, isOpen, onClose }: SSEDetailsModalProps) {
  if (!isOpen || !sse) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="bg-orange-500 p-6 text-white flex justify-between items-center">
          <div className="flex items-center gap-3">
            <AlertCircle size={24} />
            <h2 className="text-xl font-bold uppercase tracking-tight">Détails de l&apos;incident</h2>
          </div>
          <button onClick={onClose} className="hover:bg-orange-600 p-1 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 space-y-6">
          <div className="space-y-2">
            <span className="text-[10px] font-black uppercase text-orange-500 tracking-widest">Description</span>
            <p className="text-slate-700 font-medium leading-relaxed">{sse.description}</p>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="flex items-center gap-3">
              <div className="bg-slate-100 p-2 rounded-xl text-slate-500"><Calendar size={20} /></div>
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400">Date</p>
                <p className="text-sm font-bold text-slate-700">{new Date(sse.dateHeure).toLocaleDateString()}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-slate-100 p-2 rounded-xl text-slate-500"><MapPin size={20} /></div>
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400">Lieu</p>
                <p className="text-sm font-bold text-slate-700">{sse.SSEEventLieu}</p>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <div className="flex items-center gap-2 mb-2">
              <Clock size={16} className="text-orange-500" />
              <p className="text-[10px] uppercase font-black text-slate-500">Gravité & Impact</p>
            </div>
            <div className="flex gap-4">
               <div className={`px-3 py-1 rounded-full text-[10px] font-bold ${sse.avecArret ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                {sse.avecArret ? `AVEC ARRÊT (${sse.nbJoursArret}j)` : 'SANS ARRÊT'}
               </div>
               <div className="px-3 py-1 bg-slate-200 rounded-full text-[10px] font-bold text-slate-600 uppercase">
                {sse.SSEEventType.replace('_', ' ')}
               </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 p-4 border-t flex justify-end">
          <button onClick={onClose} className="px-6 py-2 bg-slate-900 text-white rounded-xl font-bold text-sm">Fermer</button>
        </div>
      </div>
    </div>
  );
}