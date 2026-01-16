/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useEffect, useState } from 'react';
import axios from 'axios';

// Imports relatifs directs pour contourner l'erreur TS2307
import Sidebar from '../dashboard/sidebar';
import ReclamationForm from '../../components/reclamations/ReclamationForm';
import ReclamationList from '../../components/reclamations/ReclamationList';

export default function ReclamationsPage() {
  const [data, setData] = useState({ 
    reclamations: [], 
    tiers: [], 
    processus: [] 
  });
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState({ T_Id: '', U_Id: '' });

  /**
   * Chargement global des données Qualisoft (Tiers, Processus, Réclamations)
   */
  const loadQualisoftEngine = async (tenantId: string) => {
    try {
      const apiBase = "http://127.0.0.1:3000"; // URL de ton backend NestJS
      
      const [resRec, resTiers, resProcs] = await Promise.all([
        axios.get(`${apiBase}/reclamations?tenantId=${tenantId}`),
        axios.get(`${apiBase}/tiers?T_Id=${tenantId}`), // Aligné sur ton TiersController
        axios.get(`${apiBase}/processus?tenantId=${tenantId}`)
      ]);

      setData({
        reclamations: resRec.data,
        tiers: resTiers.data,
        processus: resProcs.data
      });
    } catch (error) {
      console.error("Erreur de synchronisation Qualisoft :", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        setSession({ T_Id: user.tenantId, U_Id: user.U_Id });
        loadQualisoftEngine(user.tenantId);
      } catch (e) {
        console.error("Erreur session");
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0F172A] text-white">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="font-black italic uppercase tracking-widest text-sm">Chargement Qualisoft MS...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Navigation latérale fixe */}
      <Sidebar />

      {/* Contenu Principal - Décalage ml-72 pour ne pas être caché par la Sidebar */}
      <main className="flex-1 ml-72 p-10">
        <header className="mb-10 flex justify-between items-end border-b border-slate-200 pb-6">
          <div>
            <h1 className="text-4xl font-black text-slate-900 italic tracking-tighter uppercase">
              Gestion des Réclamations
            </h1>
            <p className="text-blue-600 font-bold text-xs uppercase tracking-[0.3em] mt-2">
              Moteur de Conformité Qualisoft • ISO 9001:2015
            </p>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-black text-slate-400 uppercase block">Année en cours</span>
            <span className="text-lg font-black italic text-slate-800">2026</span>
          </div>
        </header>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
          {/* Formulaire de saisie - Colonne Gauche */}
          <div className="xl:col-span-1">
            <ReclamationForm 
              T_Id={session.T_Id} 
              U_Id={session.U_Id} 
              tiers={data.tiers} 
              processus={data.processus} 
              onSuccess={() => loadQualisoftEngine(session.T_Id)}
            />
          </div>

          {/* Liste des enregistrements - Colonne Droite */}
          <div className="xl:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-1">
               <ReclamationList 
                  reclamations={data.reclamations} 
                  onRefresh={() => loadQualisoftEngine(session.T_Id)}
                  T_Id={session.T_Id}
               />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}