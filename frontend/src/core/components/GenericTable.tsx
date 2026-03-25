/* eslint-disable react-hooks/purity */
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 📊 MODULE : GenericTable.tsx
 * -------------------------------------------------------------------------
 * RÔLE : Registre de données haute-fidélité.
 * RÉVISION : 03 Mars 2026 | 01:10 GMT
 */

"use client";

import { Edit2, Trash2, Search, Filter, Layers, Database } from 'lucide-react';

export default function GenericTable({ columns, data, onEdit, onDelete, isLoading }: any) {
  return (
    <div className="bg-white rounded-[4rem] border border-slate-100 shadow-4xl overflow-hidden italic text-left font-sans">
      
      {/* TOOLBAR SOUVERAINE */}
      <header className="p-10 border-b border-slate-50 flex flex-col lg:flex-row lg:items-center justify-between gap-8 bg-slate-50/50 relative">
        <div className="relative flex-1 max-w-2xl">
          <Search className="absolute left-7 top-1/2 -translate-y-1/2 text-slate-400" size={22} />
          <input 
            type="text" 
            placeholder="Rechercher dans le registre scellé..." 
            className="w-full pl-16 pr-8 py-6 bg-white border-2 border-slate-100 rounded-3xl text-sm font-bold text-slate-950 outline-none focus:border-blue-600 transition-all italic shadow-inner"
          />
        </div>
        <div className="flex gap-4">
            <button className="flex items-center gap-4 px-8 py-6 bg-white border-2 border-slate-100 text-slate-500 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:border-blue-600 hover:text-blue-600 transition-all shadow-sm italic border-none cursor-pointer">
              <Filter size={18} /> Filtrage Avancé
            </button>
            <div className="p-6 bg-slate-950 text-white rounded-2xl shadow-xl">
              <Database size={20} />
            </div>
        </div>
      </header>

      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/30">
              {columns.map((col: any) => (
                <th key={col.key} className="p-10 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 border-b border-slate-100 italic">
                  {col.label}
                </th>
              ))}
              <th className="p-10 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 border-b border-slate-100 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {isLoading ? (
              Array(5).fill(0).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  {columns.map((_: any, j: number) => (
                    <td key={j} className="p-10"><div className="h-5 bg-slate-100 rounded-xl w-full"></div></td>
                  ))}
                  <td className="p-10"><div className="h-10 w-10 bg-slate-100 rounded-xl ml-auto"></div></td>
                </tr>
              ))
            ) : data.length > 0 ? (
              data.map((item: any) => (
                <tr key={item.id || Math.random()} className="hover:bg-blue-50/40 transition-all group border-none">
                  {columns.map((col: any) => (
                    <td key={col.key} className="p-10 text-sm font-black text-slate-900 tracking-tight italic">
                      {col.render ? col.render(item[col.key], item) : item[col.key]}
                    </td>
                  ))}
                  <td className="p-10 text-right">
                    <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                      {onEdit && (
                        <button onClick={() => onEdit(item)} className="p-4 bg-white border border-slate-100 text-blue-600 hover:bg-blue-600 hover:text-white rounded-2xl transition-all shadow-lg cursor-pointer">
                          <Edit2 size={18} />
                        </button>
                      )}
                      {onDelete && (
                        <button onClick={() => onDelete(item.id)} className="p-4 bg-white border border-slate-100 text-red-600 hover:bg-red-600 hover:text-white rounded-2xl transition-all shadow-lg cursor-pointer">
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length + 1} className="p-40 text-center">
                   <div className="flex flex-col items-center gap-6 opacity-20">
                      <Layers size={80} className="text-slate-300" />
                      <p className="text-[12px] font-black uppercase italic tracking-[0.6em] text-slate-500">Registre vide ou scellé</p>
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
