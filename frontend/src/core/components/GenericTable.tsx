/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/purity */
'use client';
/**
 * 📊 MODULE : GENERIC TABLE (ELITE DATAGRID)
 * -------------------------------------------------------------------------
 * FONCTION : Affichage tabulaire haute-fidélité des registres.
 * RÔLE : Centraliser la consultation des données scellées.
 * ISOLATION : Affiche uniquement ce que le Tenant a le droit de voir.
 */

import React from 'react';
import { Edit2, Trash2, Search, Filter, Layers, MoreHorizontal } from 'lucide-react';

interface Column {
  key: string;
  label: string;
  render?: (value: any, item: any) => React.ReactNode;
}

interface GenericTableProps {
  columns: Column[];
  data: any[];
  onEdit?: (item: any) => void;
  onDelete?: (id: string) => void;
  isLoading?: boolean;
}

export default function GenericTable({ columns, data, onEdit, onDelete, isLoading }: GenericTableProps) {
  return (
    <div className="bg-white rounded-[3.5rem] border border-slate-100 shadow-2xl shadow-slate-200/40 overflow-hidden italic text-left font-sans">
      
      {/* TOOLBAR SOUVERAINE */}
      <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-slate-50/30">
        <div className="relative flex-1 max-w-xl">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Rechercher dans le registre scellé..." 
            className="w-full pl-14 pr-6 py-5 bg-white border-2 border-slate-100 rounded-3xl text-sm font-bold text-slate-950 outline-none focus:border-blue-500 transition-all italic shadow-inner"
          />
        </div>
        <div className="flex gap-4">
            <button className="flex items-center gap-3 px-8 py-5 bg-white border-2 border-slate-100 text-slate-500 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:border-blue-500 hover:text-blue-600 transition-all shadow-sm">
              <Filter size={16} /> Filtres Avancés
            </button>
            <button className="p-5 bg-slate-950 text-white rounded-2xl shadow-lg hover:bg-blue-600 transition-all">
              <Layers size={18} />
            </button>
        </div>
      </div>

      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50">
              {columns.map((col) => (
                <th key={col.key} className="p-8 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 border-b border-slate-100 italic">
                  {col.label}
                </th>
              ))}
              <th className="p-8 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 border-b border-slate-100 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {isLoading ? (
              // SQUELETTE ELITE
              Array(5).fill(0).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  {columns.map((_, j) => (
                    <td key={j} className="p-8"><div className="h-4 bg-slate-100 rounded-lg w-full"></div></td>
                  ))}
                  <td className="p-8 text-right"><div className="h-8 w-8 bg-slate-100 rounded-xl ml-auto"></div></td>
                </tr>
              ))
            ) : data.length > 0 ? (
              data.map((item) => (
                <tr key={item.id || Math.random()} className="hover:bg-blue-50/30 transition-all group border-none">
                  {columns.map((col) => (
                    <td key={col.key} className="p-8 text-sm font-black text-slate-900 tracking-tight italic">
                      {col.render ? col.render(item[col.key], item) : item[col.key]}
                    </td>
                  ))}
                  <td className="p-8 text-right">
                    <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                      {onEdit && (
                        <button onClick={() => onEdit(item)} className="p-3 bg-white border border-slate-100 text-blue-600 hover:bg-blue-600 hover:text-white rounded-xl transition-all shadow-md">
                          <Edit2 size={16} />
                        </button>
                      )}
                      {onDelete && (
                        <button onClick={() => onDelete(item.id)} className="p-3 bg-white border border-slate-100 text-red-500 hover:bg-red-600 hover:text-white rounded-xl transition-all shadow-md">
                          <Trash2 size={16} />
                        </button>
                      )}
                      <button className="p-3 text-slate-300 hover:text-slate-600 bg-transparent border-none">
                        <MoreHorizontal size={20} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length + 1} className="p-32 text-center">
                   <div className="flex flex-col items-center gap-6 opacity-20">
                      <Layers size={64} className="text-slate-400" />
                      <p className="text-[11px] font-black uppercase italic tracking-[0.5em] text-slate-500">Registre vide ou scellé</p>
                   </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}