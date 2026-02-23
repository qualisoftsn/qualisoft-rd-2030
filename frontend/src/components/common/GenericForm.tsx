/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 📝 COMPOSANT : GenericForm
 * -------------------------------------------------------------------------
 * FONCTION : Moteur de génération dynamique de formulaires métiers.
 * RÔLE : Unifier la saisie de données à travers tous les modules SMI.
 * DESIGN : Structure Elite (Italic, Font-Black, Rounded-4xl).
 */

"use client";

import { ChevronDown, Save } from "lucide-react";
import React, { useState } from "react";

interface Field {
  name: string;
  label: string;
  type:
    | "text"
    | "email"
    | "password"
    | "date"
    | "select"
    | "textarea"
    | "number";
  placeholder?: string;
  required?: boolean;
  options?: { label: string; value: string }[];
  defaultValue?: any;
}

interface GenericFormProps {
  title: string;
  fields: Field[];
  onSubmit: (data: any) => void;
  submitLabel?: string;
}

export default function GenericForm({
  title,
  fields,
  onSubmit,
  submitLabel = "Valider les données",
}: GenericFormProps) {
  // Initialisation avec les valeurs par défaut pour éviter les composants non-contrôlés
  const [formData, setFormData] = useState<any>(
    fields.reduce(
      (acc, field) => ({ ...acc, [field.name]: field.defaultValue || "" }),
      {},
    ),
  );

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("💾 [FORM] Soumission des données au noyau...");
    onSubmit(formData);
  };

  return (
    <div className="bg-white rounded-[2.5rem] p-10 shadow-2xl border border-slate-100 animate-in fade-in slide-in-from-bottom-2 duration-500 text-left">
      <header className="mb-10 flex items-center gap-4">
        <div className="h-8 w-2 bg-blue-600 rounded-full" />
        <h2 className="text-2xl font-black italic uppercase text-slate-900 tracking-tighter leading-none">
          {title}
        </h2>
      </header>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          {fields.map((field) => (
            <div
              key={field.name}
              className={`flex flex-col ${field.type === "textarea" ? "md:col-span-2" : ""}`}
            >
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 ml-2 italic">
                {field.label}{" "}
                {field.required && <span className="text-red-500">*</span>}
              </label>

              <div className="relative group">
                {field.type === "select" ? (
                  <div className="relative">
                    <select
                      name={field.name}
                      required={field.required}
                      value={formData[field.name]}
                      onChange={handleChange}
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-5 text-sm font-bold text-slate-800 focus:border-blue-500 focus:bg-white outline-none transition-all appearance-none italic"
                    >
                      <option value="">Sélectionner une option...</option>
                      {field.options?.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label.toUpperCase()}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                      size={18}
                    />
                  </div>
                ) : field.type === "textarea" ? (
                  <textarea
                    name={field.name}
                    placeholder={field.placeholder}
                    required={field.required}
                    value={formData[field.name]}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-4xl px-6 py-5 text-sm font-bold text-slate-800 placeholder:text-slate-300 focus:border-blue-500 focus:bg-white outline-none transition-all italic min-h-30 resize-none shadow-inner"
                  />
                ) : (
                  <input
                    type={field.type}
                    name={field.name}
                    placeholder={field.placeholder}
                    required={field.required}
                    value={formData[field.name]}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-5 text-sm font-bold text-slate-800 placeholder:text-slate-300 focus:border-blue-500 focus:bg-white outline-none transition-all italic shadow-inner"
                  />
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Pied du formulaire avec bouton Elite */}
        <div className="pt-6 border-t border-slate-50 mt-10">
          <button
            type="submit"
            className="w-full bg-slate-900 hover:bg-blue-600 text-white font-black py-6 rounded-2xl shadow-xl shadow-slate-200 transition-all uppercase text-[11px] tracking-[0.3em] italic flex items-center justify-center gap-4 active:scale-95 group"
          >
            <Save
              size={20}
              className="group-hover:rotate-12 transition-transform"
            />
            {submitLabel}
          </button>
          <p className="text-[9px] text-center text-slate-400 uppercase font-bold mt-6 tracking-widest italic">
            Données soumises au protocole de sécurité Qualisoft Elite
          </p>
        </div>
      </form>
    </div>
  );
}
