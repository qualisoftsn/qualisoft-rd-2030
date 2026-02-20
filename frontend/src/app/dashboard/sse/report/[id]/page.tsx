/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 📄 MODULE : GÉNÉRATEUR DE RAPPORT D'INCIDENT SSE
 * -------------------------------------------------------------------------
 * RÔLE : Production de la fiche officielle d'incident pour archivage et audit.
 * USAGE : Visualisation détaillée et impression (PDF/Papier) conforme ISO.
 * PROCESSUS : Récupération granulaire via ID et mise en page "Print-Ready".
 */

'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import apiClient from '@/core/api/api-client';
import { 
  Printer, ShieldAlert, ArrowLeft, Loader2, 
  MapPin, Calendar, Clock, User, AlertTriangle 
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function SseReportPage() {
  // --- INITIALISATION DES RÉFÉRENTIELS ---
  const params = useParams();
  const id = params?.id as string; // Identifiant unique de l'incident scellé
  const router = useRouter();

  // --- ÉTATS DU DOCUMENT ---
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * 📡 SYNCHRONISATION AVEC LE REGISTRE SSE
   * Récupère l'intégralité du dossier d'incident. 
   * Note : On filtre dans le jeu de données pour garantir l'intégrité du contexte.
   */
  const fetchEventDetails = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      // Récupération globale pour assurer la cohérence du registre
      const res = await apiClient.get(`/sse`);
      
      // Recherche de l'occurrence spécifique via l'identifiant de route
      const found = res.data.find((e: any) => e.SSE_Id === id);
      
      if (found) {
        setEvent(found);
      } else {
        setError("L'identifiant fourni ne correspond à aucun enregistrement actif.");
      }
    } catch (err) {
      console.error("Erreur d'extraction du rapport:", err);
      setError("Rupture de liaison avec le serveur de rapports.");
      toast.error("Échec de la génération du document.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchEventDetails();
  }, [fetchEventDetails]);

  /**
   * 🖨️ ACTION : DÉCLENCHEMENT DE L'IMPRESSION
   * Utilise les règles CSS 'print:' définies dans le JSX.
   */
  const handlePrint = () => {
    window.print();
  };

  // --- ÉCRAN DE GÉNÉRATION (SOUVERAIN) ---
  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-white">
      <Loader2 className="animate-spin text-orange-600 mb-6" size={50} />
      <p className="text-slate-400 font-black uppercase italic text-[10px] tracking-[0.5em] animate-pulse">
        Génération du document certifié en cours...
      </p>
    </div>
  );

  // --- ÉCRAN D'ERREUR ---
  if (error || !event) return (
    <div className="h-screen flex flex-col items-center justify-center bg-white text-slate-500 p-10">
      <AlertTriangle size={48} className="text-red-500 mb-6" />
      <p className="font-black italic text-xl uppercase tracking-tighter text-slate-900">Document Introuvable</p>
      <p className="text-sm mt-2 opacity-60 italic">{error || "Cet incident a peut-être été révoqué du registre."}</p>
      <button 
        onClick={() => router.back()} 
        className="mt-8 flex items-center gap-2 bg-slate-900 text-white px-8 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-orange-600 transition-all border-none cursor-pointer"
      >
        <ArrowLeft size={14} /> Retour au registre
      </button>
    </div>
  );

  return (
    <div className="bg-slate-50 min-h-screen p-4 md:p-10 text-slate-900 italic font-sans selection:bg-orange-600/20">
      <div className="max-w-5xl mx-auto">
        
        {/* 🛠️ BARRE D'ACTIONS (CACHÉE À L'IMPRESSION) */}
        <div className="flex justify-between items-center mb-10 print:hidden animate-in fade-in slide-in-from-top-4 duration-700">
          <button 
            onClick={() => router.back()} 
            className="flex items-center gap-3 text-slate-500 hover:text-slate-900 font-black text-[10px] uppercase tracking-widest transition-all border-none bg-transparent cursor-pointer"
          >
            <ArrowLeft size={18} /> Retour au registre des incidents
          </button>
          
          <button 
            onClick={handlePrint} 
            className="bg-slate-900 hover:bg-orange-600 text-white px-10 py-5 rounded-2xl font-black uppercase text-[10px] flex items-center gap-3 shadow-2xl transition-all active:scale-95 border-none cursor-pointer tracking-[0.2em]"
          >
            <Printer size={18} /> Exporter / Imprimer en PDF
          </button>
        </div>

        {/* 📄 CORPS DU RAPPORT (VERSION "SOVEREIGN PRINT") */}
        <div className="bg-white border-[6px] border-slate-900 p-8 md:p-16 shadow-[0_40px_100px_rgba(0,0,0,0.1)] relative overflow-hidden">
          
          {/* FILIGRANE DE SÉCURITÉ (PRINT ONLY) */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-45 text-slate-100 text-[8rem] font-black pointer-events-none select-none hidden print:block opacity-20">
            QUALISOFT
          </div>

          <header className="flex flex-col md:flex-row justify-between items-start md:items-center border-b-[6px] border-slate-900 pb-10 mb-12 gap-8">
            <div className="flex items-center gap-8">
              <div className="bg-orange-600 p-5 rounded-2xl text-white shadow-xl">
                <ShieldAlert size={56} strokeWidth={2.5} />
              </div>
              <div className="text-left">
                <h1 className="text-5xl font-black uppercase leading-none tracking-tighter italic">Fiche <span className="text-orange-600">Incident</span></h1>
                <p className="text-slate-400 font-black tracking-[0.4em] uppercase text-[10px] mt-3 italic leading-none">Registre Officiel de Sécurité • ISO 45001 / 14001</p>
              </div>
            </div>
            <div className="text-left md:text-right bg-slate-50 p-6 border-l-4 border-orange-600">
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1 italic">Référence d&apos;Archive</p>
              <p className="font-black text-2xl leading-none tracking-tighter">#{event.SSE_Id?.slice(0, 12).toUpperCase()}</p>
              <p className="text-[9px] font-bold text-orange-600 mt-2 uppercase italic tracking-tighter leading-none">Document Scellé Numériquement</p>
            </div>
          </header>

          {/* MATRICE D'INFORMATIONS §9.1 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16 text-left">
            <div className="space-y-8">
              <div className="group">
                <label className="text-[10px] font-black uppercase text-slate-400 block mb-2 tracking-[0.2em] italic">Nature de l&apos;Événement</label>
                <p className="font-black text-xl border-b-2 border-slate-100 pb-3 uppercase italic tracking-tight text-slate-900">
                  {event.SSE_Type?.replace(/_/g, ' ')}
                </p>
              </div>
              <div className="group">
                <label className="text-[10px] font-black uppercase text-slate-400 block mb-2 tracking-[0.2em] italic">Localisation & Implantation</label>
                <div className="flex items-center gap-3 border-b-2 border-slate-100 pb-3">
                    <MapPin size={18} className="text-orange-600" />
                    <p className="font-bold text-lg text-slate-800 uppercase italic">
                        {event.SSE_Lieu} <span className="text-slate-400 ml-2">({event.SSE_Site?.S_Name || 'SITE MASTER'})</span>
                    </p>
                </div>
              </div>
              <div className="group">
                <label className="text-[10px] font-black uppercase text-slate-400 block mb-2 tracking-[0.2em] italic">Collaborateur / Victime</label>
                <div className="flex items-center gap-3 border-b-2 border-slate-100 pb-3">
                    <User size={18} className="text-blue-600" />
                    <p className="font-black text-lg text-slate-900 uppercase italic">
                        {event.SSE_Victim ? `${event.SSE_Victim.U_FirstName} ${event.SSE_Victim.U_LastName}` : 'AUCUNE VICTIME SIGNALÉE'}
                    </p>
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <div className="group">
                <label className="text-[10px] font-black uppercase text-slate-400 block mb-2 tracking-[0.2em] italic">Horodatage des Faits</label>
                <div className="flex items-center gap-3 border-b-2 border-slate-100 pb-3">
                    <Calendar size={18} className="text-orange-600" />
                    <p className="font-black text-xl text-slate-900 italic tracking-tighter">
                        {new Date(event.SSE_DateEvent).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                </div>
              </div>
              <div className="group">
                <label className="text-[10px] font-black uppercase text-slate-400 block mb-2 tracking-[0.2em] italic">Indisponibilité (Arrêt de travail)</label>
                <div className="flex items-center gap-3 border-b-2 border-slate-100 pb-3">
                    <Clock size={18} className={event.SSE_AvecArret ? "text-red-600" : "text-emerald-600"} />
                    <p className={`font-black text-lg uppercase italic ${event.SSE_AvecArret ? "text-red-600" : "text-emerald-600"}`}>
                        {event.SSE_AvecArret ? `${event.SSE_NbJoursArret} Jours d'arrêt prescrits` : 'Aucune interruption de service'}
                    </p>
                </div>
              </div>
              <div className="group">
                <label className="text-[10px] font-black uppercase text-slate-400 block mb-2 tracking-[0.2em] italic">Lésions ou Dommages Constatés</label>
                <p className="font-bold text-lg border-b-2 border-slate-100 pb-3 uppercase italic text-slate-700">
                    {event.SSE_Lesions || 'NÉANT'}
                </p>
              </div>
            </div>
          </div>

          {/* DÉTAILS CIRCONSTANCIELS (§10.2) */}
          <div className="mb-16 bg-slate-50 p-10 border-2 border-slate-900 shadow-inner relative">
            <div className="absolute -top-4 left-10 bg-slate-900 text-white px-6 py-1 text-[9px] font-black uppercase tracking-[0.3em] italic">
                Récit des événements
            </div>
            <label className="text-[10px] font-black uppercase text-slate-400 block mb-6 underline decoration-orange-500 underline-offset-8 tracking-widest italic">Description détaillée des faits et circonstances</label>
            <p className="text-md font-bold leading-relaxed text-slate-800 uppercase italic">
                {event.SSE_Description}
            </p>
          </div>

          {/* ESPACE DE VALIDATION ET SIGNATURES */}
          <div className="mt-24 grid grid-cols-1 md:grid-cols-2 gap-20">
            <div className="text-center">
                <div className="w-full border-t-2 border-slate-900 mb-4"></div>
                <p className="text-[9px] font-black uppercase text-slate-400 tracking-[0.4em] italic leading-none">Visa du déclarant / Victime</p>
                <p className="text-[8px] text-slate-300 mt-2 italic font-bold">Signature précédée de la mention &quot;Lu et approuvé&quot;</p>
            </div>
            <div className="text-center">
                <div className="w-full border-t-2 border-slate-900 mb-4"></div>
                <p className="text-[9px] font-black uppercase text-slate-400 tracking-[0.4em] italic leading-none">Direction Générale / Responsable HSE</p>
                <p className="text-[8px] text-slate-300 mt-2 italic font-bold">Cachet officiel de l&apos;organisation requis</p>
            </div>
          </div>

          <div className="mt-20 pt-10 border-t border-slate-100 flex justify-between items-center opacity-40">
              <p className="text-[8px] font-bold uppercase tracking-[0.5em] italic">Généré par Qualisoft Elite RD 2030 • {new Date().toLocaleString()}</p>
              <p className="text-[8px] font-bold uppercase tracking-[0.5em] italic">Page 1 / 1</p>
          </div>
        </div>
      </div>

      {/* 🧪 INJECTION DE STYLE POUR L'IMPRESSION PRO */}
      <style jsx global>{`
        @media print {
          body { background: white !important; }
          .bg-slate-50 { background: white !important; p: 0 !important; }
          .max-w-5xl { max-width: 100% !important; margin: 0 !important; }
          .shadow-4xl, .shadow-2xl, .shadow-inner { shadow: none !important; }
          .border-slate-900 { border-color: black !important; }
          .text-slate-900, .text-slate-800 { color: black !important; }
          .text-orange-600 { color: #ea580c !important; }
          @page { margin: 1cm; }
        }
      `}</style>
    </div>
  );
}