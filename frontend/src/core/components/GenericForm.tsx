/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
/**
 * 📑 MODULE : GENERIC FORM (MOTEUR DE SAISIE)
 * -------------------------------------------------------------------------
 * FONCTION : Génération dynamique de formulaires basés sur des schémas.
 * PHILOSOPHIE : "Structure over Chaos" - Garantir l'intégrité des données à la source.
 */

import React from 'react';
import { useForm } from 'react-hook-form';
import { Loader2, Save, Terminal } from 'lucide-react';

interface Field {
  name: string;
  label: string;
  type: 'text' | 'number' | 'email' | 'select';
  placeholder?: string;
  options?: { label: string; value: string }[];
  required?: boolean;
}

interface GenericFormProps {
  title: string;
  fields: Field[];
  onSubmit: (data: any) => Promise<void>;
  isLoading?: boolean;
}

export default function GenericForm({ title, fields, onSubmit, isLoading }: GenericFormProps) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const handleProcess = async (data: any) => {
    await onSubmit(data);
    reset(); 
  };

  return (
    <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-2xl shadow-slate-200/50 text-left italic">
      <div className="flex items-center gap-4 mb-10">
        <div className="p-3 bg-blue-600 rounded-2xl text-white shadow-lg">
           <Terminal size={24} />
        </div>
        <h3 className="text-2xl font-black text-slate-950 uppercase italic tracking-tighter leading-none">
          {title}
        </h3>
      </div>

      <form onSubmit={handleSubmit(handleProcess)} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {fields.map((field) => (
            <div key={field.name} className="flex flex-col gap-3">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-4">
                {field.label} {field.required && <span className="text-red-500">*</span>}
              </label>
              
              {field.type === 'select' ? (
                <select
                  {...register(field.name, { required: field.required })}
                  className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-3xl text-sm font-black text-slate-900 focus:border-blue-600 transition-all outline-none appearance-none cursor-pointer italic"
                >
                  <option value="">-- CHOISIR --</option>
                  {field.options?.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
              ) : (
                <input
                  type={field.type}
                  placeholder={field.placeholder}
                  {...register(field.name, { required: field.required })}
                  className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-3xl text-sm font-bold text-slate-900 focus:border-blue-600 transition-all outline-none italic"
                />
              )}
              {errors[field.name] && <span className="text-[9px] text-red-500 font-black uppercase ml-4 tracking-widest">Champ obligatoire</span>}
            </div>
          ))}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full mt-6 py-6 bg-slate-950 text-white rounded-4xl font-black uppercase italic text-xs tracking-[0.3em] shadow-xl hover:bg-blue-600 transition-all flex items-center justify-center gap-4 active:scale-95 border-none cursor-pointer"
        >
          {isLoading ? <Loader2 className="animate-spin" /> : <Save size={18} />}
          {isLoading ? "SCÉLLAGE MATRIX..." : "Valider l&apos;entrée de données"}
        </button>
      </form>
    </div>
  );
}