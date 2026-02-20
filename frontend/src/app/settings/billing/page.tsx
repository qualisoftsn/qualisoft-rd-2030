/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * 💳 MODULE : GESTION DE LICENCE & BILLING
 * -------------------------------------------------------------------------
 * FONCTION : Pilotage financier de l'instance Qualisoft.
 * RÔLE : Gestion des plans, pro-formas et déclaration des paiements mobiles.
 * PAIEMENT : Intégration Wave / Orange Money Sénégal.
 */

'use client';

import React, { useState } from 'react';
import { 
  Check, ShieldCheck, Zap, Crown, ArrowRight, 
  Users2, Smartphone, FileCheck, Loader2, Download,
  Wallet, Building2, Rocket, Landmark, X
} from 'lucide-react';
import apiClient from '@/core/api/api-client';
import { toast } from 'react-hot-toast';

const PLANS = [
  { id: 'EMERGENCE', name: 'Émergence', price: '25.000', rawPrice: 25000, users: '1 RQ / 3 Pilotes', features: ['GED SMQ Fondamentale', 'Gestion des NC', 'Actions Correctives', 'Tableau de bord de base'], color: 'blue' },
  { id: 'CROISSANCE', name: 'Croissance', price: '75.000', rawPrice: 75000, users: '1 RQ / 6 Pilotes', features: ['Tout Émergence', 'Matrice de Compétences', 'Analyses & KPI Dynamiques', 'Support Réactif 48h'], color: 'amber', popular: true },
  { id: 'ENTREPRISE', name: 'Entreprise', price: '125.000', rawPrice: 125000, users: '2 RQ / 10 Pilotes / 10 Copilotes', features: ['Tout Croissance', 'Audits Internes ISO', 'Gestion des Risques', 'Cloud Qualisoft Dédié'], color: 'purple' },
  { id: 'GROUPE', name: 'Groupe Élite', price: '250.000', rawPrice: 250000, users: 'Utilisateurs Illimités', features: ['Accès SMI Illimité', 'Multi-sites & Filiales', 'API & Connecteurs', 'Accompagnement VIP Qualisoft'], color: 'emerald' }
];

export default function BillingPage() {
  const [selectedPlan, setSelectedPlan] = useState('CROISSANCE');
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [paymentData, setPaymentData] = useState({ provider: 'WAVE', reference: '' });

  const activePlan = PLANS.find(p => p.id === selectedPlan);

  /**
   * 📄 GÉNÉRATION PRO-FORMA
   * Déclenche la création d'un document PDF officiel pour la comptabilité.
   */
  const handleDownloadProforma = async () => {
    setDownloading(true);
    try {
      const response = await apiClient.post('/admin/generate-proforma', { plan: selectedPlan }, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Proforma_Qualisoft_${selectedPlan}.pdf`);
      document.body.appendChild(link);
      link.click();
      toast.success("Facture pro-forma prête.");
    } catch (err) {
      toast.error("Le service de facturation est indisponible.");
    } finally { setDownloading(false); }
  };

  /**
   * 📱 DÉCLARATION TRANSACTION MOBILE
   * Enregistre la référence du transfert Wave/Orange pour validation manuelle par l'admin Master.
   */
  const handleDeclare = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentData.reference) return toast.error("Référence de transaction requise.");
    setLoading(true);
    try {
      await apiClient.post('/admin/declare-transaction', {
        amount: activePlan?.rawPrice,
        reference: paymentData.reference,
        provider: paymentData.provider,
        plan: selectedPlan
      });
      toast.success("Déclaration scellée ! Validation sous peu.");
      setShowModal(false);
    } catch (err) {
      toast.error("Échec de communication avec le serveur Master.");
    } finally { setLoading(false); }
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-700 pb-20 italic font-sans text-left">
      <header className="flex flex-col lg:flex-row lg:items-end justify-between border-b border-white/5 pb-12 gap-8">
        <div>
          <div className="flex items-center gap-3 text-blue-500 mb-4 font-black uppercase tracking-[0.5em] text-[11px]"><Landmark size={18} /> Bureautique Financière Qualisoft</div>
          <h1 className="text-4xl font-black uppercase tracking-tighter text-white leading-none italic">Gestion de <span className="text-blue-600">Licence</span></h1>
          <p className="text-slate-500 text-xs mt-4 font-bold uppercase tracking-widest italic leading-relaxed">Activez la puissance Élite pour un pilotage SMI sans compromis.</p>
        </div>
        <button onClick={handleDownloadProforma} disabled={downloading} className="bg-white/5 border border-white/10 px-8 py-4 rounded-2xl flex items-center gap-4 hover:bg-white/10 transition-all group border-none cursor-pointer">
          {downloading ? <Loader2 className="animate-spin text-blue-500" /> : <Download size={18} className="text-blue-500" />}
          <div className="text-left text-white">
            <p className="text-[10px] font-black uppercase leading-none">Télécharger Pro-Forma</p>
            <p className="text-[8px] text-slate-500 uppercase mt-1 tracking-widest font-bold">Format PDF Officiel</p>
          </div>
        </button>
      </header>

      {/* GRILLE DES PLANS */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {PLANS.map((plan) => (
          <div key={plan.id} onClick={() => setSelectedPlan(plan.id)}
            className={`relative p-8 rounded-[3.5rem] border transition-all duration-500 cursor-pointer flex flex-col group ${selectedPlan === plan.id ? 'bg-[#0F172A] border-blue-600 shadow-3xl shadow-blue-600/20 scale-105 z-10' : 'bg-slate-900/20 border-white/5 opacity-60 hover:opacity-100'}`}>
            {plan.popular && <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[8px] font-black px-6 py-2 rounded-full shadow-xl tracking-widest">TOP VENTE</div>}
            <h3 className="text-2xl font-black text-white uppercase mb-2 tracking-tighter italic">{plan.name}</h3>
            <p className="text-[9px] font-black text-blue-500 uppercase tracking-widest mb-6 italic">{plan.users}</p>
            <div className="mb-8 text-white font-black leading-none">
              <span className="text-4xl tracking-tighter">{plan.price}</span>
              <span className="text-slate-600 text-[10px] block uppercase mt-2 tracking-widest italic">FCFA / MOIS HT</span>
            </div>
            <ul className="space-y-4 mb-10 flex-1">
              {plan.features.map((feature, i) => (
                <li key={i} className="flex items-start gap-3 text-[10px] font-bold text-slate-400 leading-tight uppercase tracking-tighter italic">
                  <Check size={14} className="text-blue-500 shrink-0" strokeWidth={4} /> {feature}
                </li>
              ))}
            </ul>
            <button onClick={() => setShowModal(true)} className={`w-full py-5 rounded-2xl font-black uppercase text-[11px] tracking-[0.2em] transition-all border-none cursor-pointer ${selectedPlan === plan.id ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/30' : 'bg-white/5 text-slate-500 group-hover:bg-white/10'}`}>
              {selectedPlan === plan.id ? 'Activer Élite' : 'Sélectionner'}
            </button>
          </div>
        ))}
      </div>

      {/* MOBILE PAYMENT INFO */}
      <div className="bg-slate-900/40 border border-white/5 rounded-[4rem] p-12 flex flex-col xl:flex-row items-center justify-between gap-12 relative overflow-hidden text-left">
        <div className="absolute top-0 right-0 p-20 opacity-[0.02] pointer-events-none"><Wallet size={300} /></div>
        <div className="max-w-xl">
          <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter leading-tight">Activation Directe <span className="text-blue-600">Sénégal</span></h2>
          <p className="text-slate-400 text-xs mt-4 font-bold leading-relaxed uppercase tracking-widest italic">Transfert sur nos comptes officiels pour déploiement instantané.</p>
        </div>
        <div className="flex flex-wrap gap-6 justify-center">
          <PaymentProviderCard name="WAVE" number="77 456 12 34" color="bg-blue-500" />
          <PaymentProviderCard name="ORANGE MONEY" number="78 123 45 67" color="bg-orange-600" />
        </div>
      </div>

      {/* MODAL PAIEMENT */}
      {showModal && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-6 backdrop-blur-2xl bg-black/80 animate-in fade-in duration-300">
          <div className="bg-[#0F172A] border border-white/10 w-full max-w-xl rounded-[4rem] p-12 shadow-3xl text-left relative italic">
            <button onClick={() => setShowModal(false)} className="absolute top-8 right-8 text-slate-500 hover:text-white transition-colors border-none bg-transparent cursor-pointer"><X size={32}/></button>
            <h2 className="text-4xl font-black text-white uppercase italic tracking-tighter mb-2 leading-none">Finaliser <span className="text-blue-600">l&apos;activation</span></h2>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] mb-10">Engagement Élite • Plan {selectedPlan}</p>
            <form onSubmit={handleDeclare} className="space-y-8">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-500 ml-2 uppercase tracking-widest italic">Opérateur</label>
                  <select className="w-full p-5 bg-white/5 border border-white/10 rounded-2xl text-white font-black italic outline-none focus:border-blue-600 transition-all appearance-none cursor-pointer"
                    value={paymentData.provider} onChange={(e) => setPaymentData({...paymentData, provider: e.target.value})}>
                    <option value="WAVE" className="bg-[#0F172A]">WAVE SÉNÉGAL</option>
                    <option value="ORANGE" className="bg-[#0F172A]">ORANGE MONEY</option>
                  </select>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-500 ml-2 uppercase tracking-widest italic">Montant (FCFA)</label>
                  <div className="w-full p-5 bg-white/5 border border-white/10 rounded-2xl text-slate-400 font-black italic">{activePlan?.price}</div>
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-500 ml-2 uppercase tracking-widest italic">Référence de Transaction</label>
                <input required className="w-full p-6 bg-white/5 border border-white/10 rounded-2xl outline-none text-white font-black italic placeholder:text-slate-800 text-lg tracking-widest shadow-inner"
                  placeholder="EX: 2026-XXXX-XXXX" value={paymentData.reference} onChange={(e) => setPaymentData({...paymentData, reference: e.target.value})} />
              </div>
              <div className="p-6 bg-blue-600/10 border border-blue-600/20 rounded-3xl flex items-center gap-6">
                <ShieldCheck className="text-blue-500 shrink-0" size={32} />
                <p className="text-[9px] text-blue-200 font-black uppercase leading-relaxed tracking-wider italic">Validation automatique après scellage de la référence.</p>
              </div>
              <div className="flex gap-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-5 text-[10px] font-black uppercase text-slate-500 border border-white/10 rounded-2xl hover:bg-white/5 transition-all cursor-pointer bg-transparent italic">Retour</button>
                <button disabled={loading} type="submit" className="flex-2 py-5 bg-blue-600 text-white text-[11px] font-black uppercase rounded-2xl flex items-center justify-center gap-3 shadow-xl shadow-blue-600/30 hover:bg-blue-500 transition-all border-none cursor-pointer italic">
                  {loading ? <Loader2 className="animate-spin" size={18} /> : <>Confirmer le transfert <ArrowRight size={16}/></>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function PaymentProviderCard({ name, number, color }: { name: string, number: string, color: string }) {
  return (
    <div className="p-8 bg-white/5 rounded-[2.5rem] border border-white/10 hover:border-blue-600 transition-all cursor-default group w-64 text-left">
      <div className={`w-14 h-14 ${color} rounded-2xl flex items-center justify-center mb-6 shadow-xl group-hover:scale-110 transition-transform`}><Smartphone size={24} className="text-white" /></div>
      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mb-2 italic">{name}</p>
      <p className="text-xl font-black text-white italic tracking-tighter">{number}</p>
    </div>
  );
}