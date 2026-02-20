/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';
/**
 * 🛰️ MODULE : SSE INCIDENT REPORT FORM
 * -------------------------------------------------------------------------
 * FONCTION : Collecte scellée des incidents et situations dangereuses.
 * RÔLE : Alimenter le registre légal de l'organisation.
 * SÉCURITÉ : Validation Zod avant injection dans le SDE du Tenant.
 */

import React from 'react';
import { useForm, SubmitHandler, useWatch, Control } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import apiClient from '@/core/api/api-client';
import { Loader2, Save, AlertCircle, Calendar, MapPin, Activity } from 'lucide-react';
import { toast } from 'sonner';

// Schéma de validation souverain
const sseSchema = z.object({
  type: z.string().min(1, "Type d'événement obligatoire"),
  dateHeure: z.string().min(1, "Horodatage requis"),
  lieu: z.string().min(1, "Périmètre géographique requis"),
  description: z.string().min(10, "La description doit être circonstanciée"),
  avecArret: z.boolean(),
  nbJoursArret: z.number().min(0),
  causesImmediates: z.string().optional()
});

type SSEFormData = z.infer<typeof sseSchema>;

export function SSEForm() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { register, handleSubmit, control, formState: { errors } } = useForm<SSEFormData>({
    resolver: zodResolver(sseSchema),
    defaultValues: {
      type: '',
      dateHeure: new Date().toISOString().slice(0, 16),
      lieu: '',
      description: '',
      avecArret: false,
      nbJoursArret: 0,
      causesImmediates: ''
    }
  });

  // Observation isolée du champ 'avecArret' pour l'affichage conditionnel
  const avecArret = useWatch({ control, name: "avecArret" });

  /**
   * 🚀 MUTATION KERNEL
   * Envoie le rapport au micro-service SSE du tenant actif.
   */
  const mutation = useMutation({
    mutationFn: async (newReport: SSEFormData) => {
      const { data } = await apiClient.post('/sse/report', newReport);
      return data;
    },
    onSuccess: () => {
      toast.success("Rapport SSE scellé au registre");
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      router.push('/dashboard');
      router.refresh();
    },
    onError: () => {
      toast.error("Échec de la transmission au noyau");
    }
  });

  const onSubmit: SubmitHandler<SSEFormData> = (data) => mutation.mutate(data);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 italic">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* TYPE D'ÉVÉNEMENT */}
        <div className="space-y-3">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4 flex items-center gap-2">
            <Activity size={12} /> Nature du sinistre
          </label>
          <select 
            {...register('type')}
            className={`w-full p-5 bg-slate-50 border-2 ${errors.type ? 'border-red-500' : 'border-slate-100'} rounded-3xl font-bold outline-none focus:border-blue-500 transition-all text-sm uppercase`}
          >
            <option value="">-- CHOISIR --</option>
            <option value="ACCIDENT_TRAVAIL">Accident du Travail</option>
            <option value="SITUATION_DANGEREUSE">Situation Dangereuse</option>
            <option value="INCIDENT_ENVIRONNEMENTAL">Incident Environnemental</option>
          </select>
        </div>

        {/* DATE & HEURE */}
        <div className="space-y-3">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4 flex items-center gap-2">
            <Calendar size={12} /> Horodatage scellé
          </label>
          <input type="datetime-local" {...register('dateHeure')} className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-3xl font-bold outline-none text-sm" />
        </div>

        {/* LIEU */}
        <div className="md:col-span-2 space-y-3">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4 flex items-center gap-2">
            <MapPin size={12} /> Localisation précise (§45001)
          </label>
          <input {...register('lieu')} placeholder="EX: ZONE DE STOCKAGE SUD..." className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-3xl font-bold outline-none text-sm uppercase" />
        </div>

        {/* DESCRIPTION */}
        <div className="md:col-span-2 space-y-3">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Circonstances de l&apos;événement</label>
          <textarea {...register('description')} rows={4} placeholder="DÉCRIRE LES FAITS DE MANIÈRE OBJECTIVE..." className="w-full p-6 bg-slate-50 border-2 border-slate-100 rounded-4xl font-bold outline-none text-sm italic" />
        </div>

        {/* GESTION DES ARRÊTS (§ SÉCURITÉ SOCIALE) */}
        <div className="md:col-span-2 p-8 bg-blue-600/5 border-2 border-blue-600/10 rounded-[2.5rem] flex items-center justify-between group">
          <label className="flex items-center gap-4 cursor-pointer">
            <input 
              type="checkbox" 
              {...register('avecArret')} 
              className="h-6 w-6 text-blue-600 border-slate-300 rounded-lg focus:ring-blue-500" 
            />
            <span className="font-black text-slate-900 uppercase text-xs italic tracking-tighter">Impact sur la continuité de service (Arrêt)</span>
          </label>
          
          {avecArret && (
            <div className="flex items-center gap-4 animate-in slide-in-from-right duration-300">
              <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest">Nb Jours :</span>
              <input 
                type="number" 
                {...register('nbJoursArret', { valueAsNumber: true })}
                className="w-24 p-3 bg-white border-2 border-blue-200 rounded-xl text-center font-black outline-none text-blue-600"
              />
            </div>
          )}
        </div>
      </div>

      <button 
        type="submit" 
        disabled={mutation.isPending}
        className="w-full py-6 bg-slate-950 text-white rounded-4xl font-black uppercase tracking-[0.3em] shadow-2xl hover:bg-blue-600 transition-all flex items-center justify-center gap-4 active:scale-95 disabled:opacity-50 border-none cursor-pointer"
      >
        {mutation.isPending ? <Loader2 className="animate-spin" /> : <Save size={20} />}
        {mutation.isPending ? 'SCELLEMENT EN COURS...' : 'Valider la déclaration SSE'}
      </button>
    </form>
  );
}