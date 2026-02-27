/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { matrixApi, ProvisioningPayload } from "@/services/matrix.service";
import axios from "axios";
import {
  Building2,
  ChevronLeft,
  Crown,
  Globe,
  Loader2,
  Lock,
  Mail,
  Rocket,
  ShieldCheck,
  User,
  UserCheck,
  Phone,
  MapPin,
} from "lucide-react";
import { useAuthStore } from '@/store/authStore';
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";

/**
 * 🛰️ INTERFACE DE SAISIE ÉLITE (SCELLÉE)
 * RÔLE : Initialisation souveraine de nouveaux locataires SMI.
 */
interface ProvisionFormData {
  companyName: string;
  ceoName: string; 
  adminFirstName: string;
  adminLastName: string;
  email: string;
  phone: string;
  address: string;
  displayPassword?: string;
}

interface BackendErrorResponse {
  message: string | string[];
  error?: string;
  statusCode?: number;
}

export default function ProvisioningPage() {
  // ✅ Correction : Utilisation du store Zustand Matrix
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();
  
  const [loading, setLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  const [formData, setFormData] = useState<ProvisionFormData>({
    companyName: "",
    ceoName: "",
    adminFirstName: "",
    adminLastName: "",
    email: "",
    phone: "",
    address: "",
    displayPassword: "Qualisoft@2026", 
  });

  // 🛡️ PROTECTION RÉGALIENNE
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isAuthenticated) {
        router.replace("/auth/login");
      } else if (user?.U_Role !== "SUPER_ADMIN") {
        toast.error("Accès régalien refusé.");
        router.replace("/dashboard");
      }
      setIsInitializing(false);
    }, 500);
    return () => clearTimeout(timer);
  }, [isAuthenticated, user, router]);

  /**
   * 🚀 PROTOCOLE DE DÉPLOIEMENT MATRIX
   */
  const handleDeploy = async (e: React.FormEvent) => {
    e.preventDefault();
    const tid = toast.loading("Scellage du nouveau nœud Matrix...");
    setLoading(true);

    try {
      const payload: ProvisioningPayload = {
        companyName: formData.companyName,
        ceoName: formData.ceoName,
        email: formData.email,
        adminFirstName: formData.adminFirstName,
        adminLastName: formData.adminLastName,
        phone: formData.phone,
        address: formData.address,
      };

      await matrixApi.initialize(payload);

      toast.success(`Nœud Matrix pour ${formData.companyName} scellé avec succès.`, { id: tid });

      setFormData({
        companyName: "",
        ceoName: "",
        adminFirstName: "",
        adminLastName: "",
        email: "",
        phone: "",
        address: "",
        displayPassword: "Qualisoft@2026",
      });

      // Propulsion vers le registre
      setTimeout(() => router.push("/admin/matrix"), 2000);
    } catch (err: unknown) {
      let errorMessage = "Échec de la communication avec le Noyau Master";
      if (axios.isAxiosError(err)) {
        const data = err.response?.data as BackendErrorResponse;
        errorMessage = Array.isArray(data?.message) ? data.message[0] : data?.message || err.message;
      }
      toast.error(errorMessage, { id: tid });
    } finally {
      setLoading(false);
    }
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0B0F1A] italic">
        <Loader2 className="animate-spin text-blue-600" size={40} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans italic selection:bg-blue-100 overflow-x-hidden pb-20">
      
      {/* 🧭 NAVIGATION RÉGALIENNE */}
      <nav className="bg-slate-900 text-white p-6 shadow-2xl flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <ShieldCheck className="text-blue-500" size={24} />
          <span className="font-black uppercase tracking-tighter text-xl italic">
            QUALI<span className="text-blue-500">SOFT</span> MASTER
          </span>
        </div>
        <div className="flex items-center gap-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">
          <Crown size={14} className="text-amber-400" /> {user?.U_Email}
        </div>
      </nav>

      <div className="max-w-4xl mx-auto py-16 px-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 mb-10 hover:text-slate-900 transition-all cursor-pointer bg-transparent border-none"
        >
          <ChevronLeft size={14} /> Retour Cockpit Master
        </button>

        <header className="mb-12">
          <h1 className="text-6xl font-black text-slate-900 uppercase italic leading-none flex items-center gap-6 tracking-tighter">
            <Rocket className="text-blue-600" size={56} /> Provisioning <span className="text-blue-600">Elite</span>
          </h1>
          <p className="text-[11px] font-black uppercase text-slate-400 mt-4 tracking-[0.3em]">
            Initialisation dynamique d'instance Qualisoft Elite RD 2030
          </p>
        </header>

        <form onSubmit={handleDeploy} className="space-y-10 bg-white p-12 rounded-[3.5rem] border border-white shadow-2xl animate-in fade-in slide-in-from-bottom-6 duration-700">
          
          {/* SECTION 1 : ORGANISATION */}
          <div className="space-y-6">
            <h3 className="text-[10px] font-black text-blue-600 uppercase tracking-[0.3em] flex items-center gap-2 border-b border-slate-100 pb-4">
              <Building2 size={14} /> Identité & Coordonnées du Nœud
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-2">Dénomination Sociale</label>
                <input 
                  required 
                  type="text" 
                  className="w-full p-6 bg-slate-50 border-2 border-transparent rounded-[1.8rem] font-black text-slate-900 outline-none focus:border-blue-600 focus:bg-white transition-all uppercase italic" 
                  value={formData.companyName} 
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })} 
                  placeholder="Ex: SENELEC" 
                />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-2">CEO / Directeur Général</label>
                <div className="relative">
                  <UserCheck className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <input 
                    required 
                    type="text" 
                    className="w-full pl-16 pr-6 py-6 bg-slate-50 border-2 border-transparent rounded-[1.8rem] font-black text-slate-900 outline-none focus:border-blue-600 focus:bg-white transition-all italic" 
                    value={formData.ceoName} 
                    onChange={(e) => setFormData({ ...formData, ceoName: e.target.value })} 
                    placeholder="Prénom & Nom du CEO" 
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-2">Téléphone Professionnel</label>
                <div className="relative">
                  <Phone className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <input 
                    required 
                    type="text" 
                    className="w-full pl-16 pr-6 py-6 bg-slate-50 border-2 border-transparent rounded-[1.8rem] font-black text-slate-900 outline-none focus:border-blue-600 focus:bg-white transition-all italic" 
                    value={formData.phone} 
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })} 
                    placeholder="+221..." 
                  />
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-2">Adresse du Siège</label>
                <div className="relative">
                  <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <input 
                    required 
                    type="text" 
                    className="w-full pl-16 pr-6 py-6 bg-slate-50 border-2 border-transparent rounded-[1.8rem] font-black text-slate-900 outline-none focus:border-blue-600 focus:bg-white transition-all italic" 
                    value={formData.address} 
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })} 
                    placeholder="Dakar, Sénégal" 
                  />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-2">Aperçu de l'URL Souveraine</label>
              <div className="p-6 bg-slate-100 rounded-[1.8rem] font-black text-slate-500 italic flex items-center gap-2 border border-slate-200/50">
                <Globe size={16} className="text-slate-400" />
                <span className="truncate">
                  {formData.companyName.toLowerCase().trim().replace(/\s+/g, "-") || "node"}
                  <span className="text-blue-500">.qualisoft.sn</span>
                </span>
              </div>
            </div>
          </div>

          {/* SECTION 2 : ADMIN RACINE */}
          <div className="space-y-6">
            <h3 className="text-[10px] font-black text-amber-600 uppercase tracking-[0.3em] flex items-center gap-2 border-b border-slate-100 pb-4">
              <User size={14} /> Administrateur Racine (Contrôleur SMI)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-2">Prénom Admin</label>
                <input required type="text" className="w-full p-6 bg-slate-50 border-2 border-transparent rounded-[1.8rem] font-black text-slate-900 outline-none focus:border-blue-600 focus:bg-white transition-all italic" value={formData.adminFirstName} onChange={(e) => setFormData({ ...formData, adminFirstName: e.target.value })} />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-2">Nom Admin</label>
                <input required type="text" className="w-full p-6 bg-slate-50 border-2 border-transparent rounded-[1.8rem] font-black text-slate-900 outline-none focus:border-blue-600 focus:bg-white transition-all italic" value={formData.adminLastName} onChange={(e) => setFormData({ ...formData, adminLastName: e.target.value })} />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-2">Email de Supervision</label>
                <div className="relative">
                  <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <input 
                    required 
                    type="email" 
                    className="w-full pl-16 pr-6 py-6 bg-slate-50 border-2 border-transparent rounded-[1.8rem] font-black text-slate-900 outline-none focus:border-blue-600 focus:bg-white transition-all lowercase italic" 
                    value={formData.email} 
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })} 
                    placeholder="admin@domaine.sn" 
                  />
                </div>
              </div>
              <div className="space-y-3 opacity-60">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-2 italic">Mot de passe initial (Auto-scellé)</label>
                <div className="relative">
                  <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <input 
                    readOnly 
                    type="text" 
                    className="w-full pl-16 pr-6 py-6 bg-slate-100 border-2 border-transparent rounded-[1.8rem] font-black text-slate-400 cursor-not-allowed italic" 
                    value={formData.displayPassword} 
                  />
                </div>
              </div>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading} 
            className="w-full py-8 bg-slate-900 text-white rounded-[2.5rem] font-black uppercase tracking-[0.5em] flex justify-center items-center gap-4 hover:bg-blue-600 hover:shadow-xl transition-all cursor-pointer disabled:bg-slate-200 border-none mt-6 text-[11px] italic shadow-2xl active:scale-95"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={24} />
            ) : (
              <>
                <Rocket size={20} /> 
                Lancer le Déploiement Matrix
              </>
            )}
          </button>
        </form>

        <footer className="mt-24 text-center border-t border-slate-200 pt-12">
          <p className="text-[9px] font-black uppercase tracking-[0.6em] text-slate-300 italic">
            Qualisoft Elite Sovereign Infrastructure • Protocol v2.1.2 • 2026
          </p>
        </footer>
      </div>
    </div>
  );
}