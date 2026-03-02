/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * 🛰️ MODULE : SSEForm.tsx
 * -------------------------------------------------------------------------
 * RÔLE : Rapport de sinistre conforme ISO 45001.
 * RÉVISION : 02 Mars 2026 | 18:35 GMT
 */

"use client";

import React from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Save, Calendar, MapPin, Activity } from 'lucide-react';
import { toast } from 'sonner';

const sseSchema = z.object({
  type: z.string().min(1, "Type obligatoire"),
  dateHeure: z.string().min(1, "Date requise"),
  lieu: z.string().min(1, "Lieu requis"),
  description: z.string().min(10, "Description insuffisante"),
  avecArret: z.boolean(),
  nbJoursArret: z.number().min(0)
});

export function SSEForm() {
  const { register, handleSubmit, control, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(sseSchema),
    defaultValues: { dateHeure: new Date().toISOString().slice(0, 16), avecArret: false, nbJoursArret: 0 }
  });

  const avecArret = useWatch({ control, name: "avecArret" });

  const onSubmit = async (data: any) => {
    const tid = toast.loading("Scellage du rapport SSE...");
    try {
      // Simulation appel Kernel (L'apiClient porte le jeton SDE)
      await new Promise(r => setTimeout(r, 1500));
      toast.success("RAPPORT SCELLÉ : Registre mis à jour.", { id: tid });
    } catch (err) {
      toast.error("ERREUR KERNEL : Transmission rejetée.", { id: tid });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 italic font-sans text-left bg-white p-12 rounded-[4rem] shadow-4xl border border-slate-100">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-3">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-6 italic flex items-center gap-2"><Activity size={12}/> Nature de l&apos;Événement</label>
          <select {...register('type')} className="w-full p-6 bg-slate-50 border-2 border-slate-100 rounded-3xl font-black text-xs uppercase italic outline-none focus:border-blue-600 appearance-none">
            <option value="">-- CHOISIR --</option>
            <option value="AT">Accident du Travail</option>
            <option value="SD">Situation Dangereuse</option>
            <option value="ENV">Incident Environnemental</option>
          </select>
        </div>

        <div className="space-y-3">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-6 italic flex items-center gap-2"><Calendar size={12}/> Horodatage Scellé</label>
          <input type="datetime-local" {...register('dateHeure')} className="w-full p-6 bg-slate-50 border-2 border-slate-100 rounded-3xl font-black text-xs italic outline-none focus:border-blue-600" />
        </div>

        <div className="md:col-span-2 space-y-3">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-6 italic flex items-center gap-2"><MapPin size={12}/> Localisation (§45001)</label>
          <input {...register('lieu')} placeholder="EX: ZONE DE STOCKAGE SUD..." className="w-full p-6 bg-slate-50 border-2 border-slate-100 rounded-3xl font-black text-xs uppercase italic outline-none focus:border-blue-600" />
        </div>

        <div className="md:col-span-2 p-10 bg-blue-600/5 rounded-[2.5rem] border border-blue-600/10 flex items-center justify-between group">
          <label className="flex items-center gap-4 cursor-pointer">
            <input type="checkbox" {...register('avecArret')} className="h-6 w-6 rounded-lg text-blue-600" />
            <span className="font-black text-slate-900 uppercase text-xs italic tracking-tighter">Impact sur la continuité de service (Arrêt)</span>
          </label>
          {avecArret && (
            <input type="number" {...register('nbJoursArret', { valueAsNumber: true })} className="w-24 p-4 bg-white border-2 border-blue-200 rounded-xl text-center font-black text-blue-600 italic outline-none" />
          )}
        </div>
      </div>

      <button type="submit" disabled={isSubmitting} className="w-full py-7 bg-slate-950 text-white rounded-[2.5rem] font-black uppercase text-[11px] tracking-[0.4em] shadow-3xl hover:bg-blue-600 transition-all flex items-center justify-center gap-4 border-none cursor-pointer italic">
        {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />} 
        SCELLER LA DÉCLARATION SSE
      </button>
    </form>
  );
}