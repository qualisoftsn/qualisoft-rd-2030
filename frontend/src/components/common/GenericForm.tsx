/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 📝 MODULE : src/components/common/GenericForm.tsx
 * -------------------------------------------------------------------------
 * FONCTION : Moteur de génération dynamique de formulaires QHSE.
 * RÔLE : Unifier l'expérience de saisie sur l'ensemble du SMI §8.1.
 * DESIGN : Elite SDE (Italic, High-Density, Rounded-4xl).
 * -------------------------------------------------------------------------
 * RÉVISION : 02 Mars 2026 | 18:30 GMT
 */

"use client";

import React, { useState } from "react";
import { ChevronDown, Save, Loader2, Info } from "lucide-react";

// --- 🔱 INTERFACES SCELLÉES ---
export interface FormField {
  name: string;
  label: string;
  type: "text" | "email" | "password" | "date" | "select" | "textarea" | "number";
  placeholder?: string;
  required?: boolean;
  fullWidth?: boolean;
  options?: { label: string; value: string | number }[];
  defaultValue?: any;
}

interface GenericFormProps {
  title: string;
  fields: FormField[];
  onSubmit: (data: any) => void;
  submitLabel?: string;
  loading?: boolean;
  description?: string;
}

export default function GenericForm({
  title,
  fields,
  onSubmit,
  submitLabel = "Sceller les données",
  loading = false,
  description,
}: GenericFormProps) {
  
  /**
   * ⚙️ INITIALISATION DU NOYAU DE DONNÉES
   * On mappe les valeurs par défaut pour garantir un composant contrôlé.
   */
  const [formData, setFormData] = useState<any>(
    fields.reduce(
      (acc, field) => ({ ...acc, [field.name]: field.defaultValue ?? "" }),
      {}
    )
  );

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    onSubmit(formData);
  };

  return (
    <div className="bg-white rounded-[2.5rem] lg:rounded-[3.5rem] p-8 lg:p-12 shadow-4xl border border-slate-100 animate-in fade-in slide-in-from-bottom-4 duration-700 text-left font-sans italic">
      
      {/* 🔝 HEADER DU FORMULAIRE (§ISO CONTEXT) */}
      <header className="mb-12 relative">
        <div className="flex items-center gap-5 mb-4">
          <div className="h-10 w-2 bg-blue-600 rounded-full shadow-[0_0_15px_rgba(37,99,235,0.4)]" />
          <h2 className="text-3xl font-black uppercase text-slate-900 tracking-tighter leading-none m-0">
            {title}
          </h2>
        </div>
        {description && (
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-7 m-0">
            {description}
          </p>
        )}
      </header>

      <form onSubmit={handleFormSubmit} className="space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
          {fields.map((field) => (
            <div
              key={field.name}
              className={`flex flex-col ${
                field.type === "textarea" || field.fullWidth ? "md:col-span-2" : ""
              }`}
            >
              {/* LABEL ÉLITE */}
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.25em] mb-3 ml-4 italic flex items-center gap-2">
                {field.label}
                {field.required && <span className="text-red-500 text-lg leading-none">*</span>}
              </label>

              <div className="relative group">
                {field.type === "select" ? (
                  <div className="relative">
                    <select
                      name={field.name}
                      required={field.required}
                      value={formData[field.name]}
                      onChange={handleChange}
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-5 text-sm font-black text-slate-800 focus:border-blue-600 focus:bg-white outline-none transition-all appearance-none italic shadow-inner"
                    >
                      <option value="" disabled>-- Sélectionner --</option>
                      {field.options?.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label.toUpperCase()}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 pointer-events-none transition-colors"
                      size={20}
                    />
                  </div>
                ) : field.type === "textarea" ? (
                  <textarea
                    name={field.name}
                    placeholder={field.placeholder?.toUpperCase()}
                    required={field.required}
                    value={formData[field.name]}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-[2.5rem] px-8 py-6 text-sm font-bold text-slate-800 placeholder:text-slate-300 focus:border-blue-600 focus:bg-white outline-none transition-all italic min-h-40 resize-none shadow-inner leading-relaxed"
                  />
                ) : (
                  <input
                    type={field.type}
                    name={field.name}
                    placeholder={field.placeholder?.toUpperCase()}
                    required={field.required}
                    value={formData[field.name]}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-5 text-sm font-black text-slate-800 placeholder:text-slate-300 focus:border-blue-600 focus:bg-white outline-none transition-all italic shadow-inner"
                  />
                )}
              </div>
            </div>
          ))}
        </div>

        {/* 🏁 ACTIONS DE VALIDATION */}
        <div className="pt-10 border-t border-slate-100 mt-12 flex flex-col items-center">
          <button
            type="submit"
            disabled={loading}
            className="w-full lg:w-2/3 bg-slate-950 hover:bg-blue-600 text-white font-black py-7 rounded-4xl shadow-3xl shadow-slate-200 transition-all uppercase text-[12px] tracking-[0.4em] italic flex items-center justify-center gap-5 active:scale-95 group disabled:opacity-50 disabled:cursor-not-allowed border-none cursor-pointer"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={24} />
            ) : (
              <Save
                size={22}
                className="group-hover:rotate-12 transition-transform"
              />
            )}
            {submitLabel}
          </button>
          
          <div className="mt-8 flex items-center gap-3 opacity-40">
            <Info size={14} className="text-blue-600" />
            <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest italic m-0">
              Protocole de sécurisation des données Qualisoft SDE actif
            </p>
          </div>
        </div>
      </form>
    </div>
  );
}