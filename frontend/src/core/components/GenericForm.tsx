/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 📑 MODULE : GenericForm.tsx
 * -------------------------------------------------------------------------
 * RÔLE : Générateur de formulaires scellés.
 * RÉVISION : 03 Mars 2026 | 01:10 GMT
 */

"use client";

import React from 'react';
import { useForm } from 'react-hook-form';
import { Loader2, Save, Terminal, ShieldCheck } from 'lucide-react';

interface Field {
  name: string;
  label: string;
  type: 'text' | 'number' | 'email' | 'select' | 'textarea' | 'date';
  placeholder?: string;
  options?: { label: string; value: string }[];
  required?: boolean;
}

export default function GenericForm({ title, fields, onSubmit, isLoading }: any) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const handleProcess = async (data: any) => {
    await onSubmit(data);
    reset(); 
  };

  return (
    <div className="bg-white p-12 rounded-[4rem] border border-slate-100 shadow-4xl text-left italic font-sans">
      <div className="flex items-center justify-between mb-12">
        <div className="flex items-center gap-5">
          <div className="p-4 bg-slate-950 rounded-2xl text-white shadow-xl shadow-slate-900/20">
             <Terminal size={28} />
          </div>
          <div>
            <h3 className="text-3xl font-black text-slate-950 uppercase italic tracking-tighter leading-none m-0">{title}</h3>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.4em] mt-3 m-0 italic">Matrix SDE Entry Protocol</p>
          </div>
        </div>
        <ShieldCheck className="text-blue-600 opacity-20" size={40} />
      </div>

      <form onSubmit={handleSubmit(handleProcess)} className="space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
          {fields.map((field: Field) => (
            <div key={field.name} className={`flex flex-col gap-3 ${field.type === 'textarea' ? 'md:col-span-2' : ''}`}>
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-5 italic">
                {field.label} {field.required && <span className="text-red-500 text-lg leading-none">*</span>}
              </label>
              
              {field.type === 'select' ? (
                <select
                  {...register(field.name, { required: field.required })}
                  className="w-full p-6 bg-slate-50 border-2 border-slate-100 rounded-4xl text-sm font-black text-slate-900 focus:border-blue-600 transition-all outline-none appearance-none cursor-pointer italic shadow-inner"
                >
                  <option value="">-- SÉLECTIONNER --</option>
                  {field.options?.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
              ) : field.type === 'textarea' ? (
                <textarea
                  rows={4}
                  placeholder={field.placeholder}
                  {...register(field.name, { required: field.required })}
                  className="w-full p-6 bg-slate-50 border-2 border-slate-100 rounded-[2.5rem] text-sm font-bold text-slate-900 focus:border-blue-600 transition-all outline-none italic shadow-inner"
                />
              ) : (
                <input
                  type={field.type}
                  placeholder={field.placeholder}
                  {...register(field.name, { required: field.required })}
                  className="w-full p-6 bg-slate-50 border-2 border-slate-100 rounded-4xl text-sm font-bold text-slate-900 focus:border-blue-600 transition-all outline-none italic shadow-inner"
                />
              )}
              {errors[field.name] && <span className="text-[9px] text-red-600 font-black uppercase ml-6 tracking-widest animate-pulse">Champ obligatoire §7.5.1</span>}
            </div>
          ))}
        </div>

        <button
          type="submit" disabled={isLoading}
          className="w-full py-8 bg-slate-950 text-white rounded-[3rem] font-black uppercase italic text-xs tracking-[0.4em] shadow-3xl hover:bg-blue-600 transition-all flex items-center justify-center gap-5 active:scale-95 border-none cursor-pointer disabled:opacity-50"
        >
          {isLoading ? <Loader2 className="animate-spin" size={24} /> : <Save size={24} />}
          {isLoading ? "SCÉLLAGE MATRIX..." : "Valider l'entrée de données"}
        </button>
      </form>
    </div>
  );
}