/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState } from 'react';

interface Field {
  name: string;
  label: string;
  type: string;
  placeholder?: string;
  required?: boolean;
  options?: { label: string; value: string }[]; // Pour les menus déroulants
}

interface GenericFormProps {
  title: string;
  fields: Field[];
  onSubmit: (data: any) => void;
  submitLabel?: string;
}

export default function GenericForm({ title, fields, onSubmit, submitLabel = "Valider" }: GenericFormProps) {
  const [formData, setFormData] = useState<any>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="bg-white rounded-4xl p-8 shadow-xl border border-slate-100">
      <h2 className="text-xl font-black mb-8 italic uppercase text-slate-800 border-l-4 border-blue-600 pl-4">
        {title}
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {fields.map((field) => (
          <div key={field.name} className="flex flex-col">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </label>
            
            {field.type === 'select' ? (
              <select
                name={field.name}
                required={field.required}
                onChange={handleChange}
                className="bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none"
              >
                <option value="">Sélectionner...</option>
                {field.options?.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type={field.type}
                name={field.name}
                placeholder={field.placeholder}
                required={field.required}
                onChange={handleChange}
                className="bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-bold text-slate-700 placeholder:text-slate-300 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              />
            )}
          </div>
        ))}

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-2xl shadow-lg shadow-blue-200 transition-all uppercase text-xs tracking-widest mt-4"
        >
          {submitLabel}
        </button>
      </form>
    </div>
  );
}