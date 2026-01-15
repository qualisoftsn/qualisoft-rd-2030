/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import React from 'react';
// 1. On ajoute useWatch et Control pour stabiliser le build Next.js
import { useForm, SubmitHandler, useWatch, Control } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import apiClient from '@/core/api/api-client';
import { Loader2, Save, AlertCircle } from 'lucide-react';

// Schéma strict
const sseSchema = z.object({
  type: z.string().min(1, "Le type est requis"),
  dateHeure: z.string().min(1, "La date est requise"),
  lieu: z.string().min(1, "Le lieu est requis"),
  description: z.string().min(10, "Description trop courte"),
  avecArret: z.boolean(),
  nbJoursArret: z.number(),
  causesImmediates: z.string()
});

interface SSEFormData {
  type: string;
  dateHeure: string;
  lieu: string;
  description: string;
  avecArret: boolean;
  nbJoursArret: number;
  causesImmediates: string;
}

export function SSEForm() {
  const router = useRouter();
  const queryClient = useQueryClient();

  // 2. On récupère "control" pour useWatch
  const { 
    register, 
    handleSubmit, 
    control, // Ajouté pour useWatch
    formState: { errors } 
  } = useForm<SSEFormData>({
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

  // 3. LIGNE 60 CORRIGÉE : On utilise useWatch pour éviter l'erreur de mémorisation
  // Cela sépare l'observation du champ de la logique principale de useForm
  const avecArret = useWatch({
    control,
    name: "avecArret",
  });

  const mutation = useMutation({
    mutationFn: async (newReport: SSEFormData) => {
      const { data } = await apiClient.post('/sse/report', newReport);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      router.push('/dashboard');
      router.refresh();
    },
  });

  const onSubmit: SubmitHandler<SSEFormData> = (data) => {
    mutation.mutate(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* TYPE */}
        <div className="space-y-2">
          <label className="text-sm font-black text-slate-700 uppercase">Type d&apos;événement</label>
          <select 
            {...register('type')}
            className={`w-full p-4 bg-slate-50 border ${errors.type ? 'border-red-500' : 'border-slate-200'} rounded-2xl outline-none focus:ring-2 focus:ring-blue-500`}
          >
            <option value="">Sélectionnez...</option>
            <option value="ACCIDENT_TRAVAIL">Accident du Travail</option>
            <option value="SITUATION_DANGEREUSE">Situation Dangereuse</option>
            <option value="INCIDENT_ENVIRONNEMENTAL">Incident Environnemental</option>
          </select>
          {errors.type && <p className="text-red-500 text-xs font-bold mt-1">{errors.type.message}</p>}
        </div>

        {/* DATE & HEURE */}
        <div className="space-y-2">
          <label className="text-sm font-black text-slate-700 uppercase">Date & Heure</label>
          <input type="datetime-local" {...register('dateHeure')} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none" />
        </div>

        {/* LIEU */}
        <div className="md:col-span-2 space-y-2">
          <label className="text-sm font-black text-slate-700 uppercase">Lieu précis</label>
          <input {...register('lieu')} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none" />
          {errors.lieu && <p className="text-red-500 text-xs font-bold">{errors.lieu.message}</p>}
        </div>

        {/* DESCRIPTION */}
        <div className="md:col-span-2 space-y-2">
          <label className="text-sm font-black text-slate-700 uppercase">Description</label>
          <textarea {...register('description')} rows={4} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none" />
          {errors.description && <p className="text-red-500 text-xs font-bold">{errors.description.message}</p>}
        </div>

        {/* OPTIONS ARRÊT */}
        <div className="md:col-span-2 p-6 bg-blue-50 rounded-3xl flex items-center justify-between">
          <div className="flex items-center gap-4">
            <input 
              type="checkbox" 
              {...register('avecArret')} 
              className="h-6 w-6 text-blue-600 border-slate-300 rounded-lg focus:ring-blue-500 cursor-pointer" 
            />
            <span className="font-bold text-slate-900 uppercase text-sm">Avec arrêt de travail ?</span>
          </div>
          
          {/* L'affichage conditionnel utilise maintenant la valeur stable de useWatch */}
          {avecArret && (
            <div className="flex items-center gap-2">
              <label className="text-xs font-bold text-blue-700">JOURS :</label>
              <input 
                type="number" 
                {...register('nbJoursArret', { valueAsNumber: true })}
                className="w-24 p-2 bg-white border border-blue-200 rounded-xl text-center font-bold outline-none"
              />
            </div>
          )}
        </div>
      </div>

      <button 
        type="submit" 
        disabled={mutation.isPending}
        className="w-full py-5 bg-slate-900 text-white rounded-4xl font-black uppercase tracking-widest shadow-xl hover:bg-blue-600 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
      >
        {mutation.isPending ? <Loader2 className="animate-spin" /> : <Save size={20} />}
        {mutation.isPending ? 'ENREGISTREMENT...' : 'Valider la déclaration SSE'}
      </button>

      {mutation.isError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-600 text-sm font-bold flex items-center gap-2">
          <AlertCircle size={18} /> Erreur de connexion au noyau.
        </div>
      )}
    </form>
  );
}