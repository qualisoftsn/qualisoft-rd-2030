'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { Loader2, PlusCircle, Save } from 'lucide-react';

interface Field {
  name: string;
  label: string;
  type: 'text' | 'number' | 'email' | 'select';
  placeholder?: string;
  options?: { label: string; value: string }[]; // Pour les selects
  required?: boolean;
}

interface GenericFormProps {
  title: string;
  fields: Field[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onSubmit: (data: any) => Promise<void>;
  isLoading?: boolean;
}

export default function GenericForm({ title, fields, onSubmit, isLoading }: GenericFormProps) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleProcess = async (data: any) => {
    await onSubmit(data);
    reset(); // On vide le formulaire après succès
  };

  return (
    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40">
      <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
        <PlusCircle className="text-blue-600" size={24} />
        {title}
      </h3>

      <form onSubmit={handleSubmit(handleProcess)} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {fields.map((field) => (
            <div key={field.name} className="flex flex-col gap-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">
                {field.label} {field.required && <span className="text-red-500">*</span>}
              </label>
              
              {field.type === 'select' ? (
                <select
                  {...register(field.name, { required: field.required })}
                  className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                >
                  <option value="">Sélectionner...</option>
                  {field.options?.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
              ) : (
                <input
                  type={field.type}
                  placeholder={field.placeholder}
                  {...register(field.name, { required: field.required })}
                  className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                />
              )}
              {errors[field.name] && <span className="text-[10px] text-red-500 font-bold ml-2">Ce champ est obligatoire</span>}
            </div>
          ))}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full mt-4 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase text-[11px] tracking-[0.2em] shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
        >
          {isLoading ? <Loader2 className="animate-spin" size={18} /> : <><Save size={18} /> Enregistrer l&apos;entrée</>}
        </button>
      </form>
    </div>
  );
}