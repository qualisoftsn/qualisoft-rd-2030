'use client';

import React from 'react';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Edit2, Trash2, MoreVertical, Search, Filter } from 'lucide-react';

interface Column {
  key: string;
  label: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  render?: (value: any, item: any) => React.ReactNode;
}

interface GenericTableProps {
  columns: Column[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onEdit?: (item: any) => void;
  onDelete?: (id: string) => void;
  isLoading?: boolean;
}

export default function GenericTable({ columns, data, onEdit, onDelete, isLoading }: GenericTableProps) {
  return (
    <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden">
      {/* HEADER DE TABLE AVEC RECHERCHE */}
      <div className="p-6 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Rechercher dans la liste..." 
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
          />
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-slate-50 text-slate-500 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-100 transition-all">
          <Filter size={16} /> Filtrer
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50">
              {columns.map((col) => (
                <th key={col.key} className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 font-mono">
                  {col.label}
                </th>
              ))}
              <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 font-mono text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {isLoading ? (
              Array(3).fill(0).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  {columns.map((_, j) => (
                    <td key={j} className="p-6"><div className="h-4 bg-slate-100 rounded-lg w-full"></div></td>
                  ))}
                  <td className="p-6"><div className="h-4 bg-slate-100 rounded-lg w-10 ml-auto"></div></td>
                </tr>
              ))
            ) : data.length > 0 ? (
              data.map((item) => (
                <tr key={item.id} className="hover:bg-blue-50/20 transition-all group">
                  {columns.map((col) => (
                    <td key={col.key} className="p-6 text-sm font-bold text-slate-700">
                      {col.render ? col.render(item[col.key], item) : item[col.key]}
                    </td>
                  ))}
                  <td className="p-6 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                      {onEdit && (
                        <button 
                          onClick={() => onEdit(item)}
                          className="p-2 text-blue-600 hover:bg-blue-100 rounded-xl transition-all"
                        >
                          <Edit2 size={16} />
                        </button>
                      )}
                      {onDelete && (
                        <button 
                          onClick={() => onDelete(item.id)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length + 1} className="p-20 text-center text-slate-400 font-medium italic">
                  Aucune donnée trouvée.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}