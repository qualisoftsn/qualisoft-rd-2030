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
import { useAuth } from '@/core/providers/auth-provider';
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";

/**
 * ðŸ›°ï¸ INTERFACE DE SAISIE Ã‰LITE (SCELLÃ‰E)
 * Note : Le mot de passe est gÃ©rÃ© au niveau du Noyau pour la sÃ©curitÃ© initiale.
 */
interface ProvisionFormData {
  companyName: string;
  ceoName: string; 
  adminFirstName: string;
  adminLastName: string;
  email: string;
  phone: string;
  address: string;
  displayPassword?: string; // Uniquement pour l'affichage visuel
}

interface BackendErrorResponse {
  message: string | string[];
  error?: string;
  statusCode?: number;
}

export default function ProvisioningPage() {
  const { data: session, status } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

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

  // ðŸ›¡ï¸ PROTECTION RÃ‰GALIENNE : Seul le SUPER_ADMIN accÃ¨de au provisioning
  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/auth/login");
    } else if (
      status === "authenticated" &&
      user?.U_Role !== "SUPER_ADMIN"
    ) {
      toast.error("AccÃ¨s rÃ©galien refusÃ©.");
      router.replace("/dashboard");
    }
  }, [status, session, router]);

  /**
   * ðŸ–‹ï¸ PROTOCOLE DE DÃ‰PLOIEMENT SOUVERAIN
   */
  const handleDeploy = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      /**
       * âœ… ALIGNEMENT SCELLÃ‰
       * On extrait manuellement les propriÃ©tÃ©s pour correspondre au type ProvisioningPayload
       * qui interdit dÃ©sormais la propriÃ©tÃ© 'password'.
       */
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

      toast.success(`NÅ“ud Matrix pour ${formData.companyName} scellÃ© avec succÃ¨s.`);

      // RÃ©initialisation du formulaire
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
      setTimeout(() => router.push("/admin/matrix"), 2500);
    } catch (err: unknown) {
      let errorMessage = "Ã‰chec de la communication avec le Noyau Master";
      
      if (axios.isAxiosError(err)) {
        const data = err.response?.data as BackendErrorResponse;
        errorMessage = Array.isArray(data?.message) ? data.message[0] : data?.message || err.message;
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0B0F1A] italic">
        <Loader2 className="animate-spin text-blue-600" size={40} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans italic selection:bg-blue-100 overflow-x-hidden pb-20">
      
      {/* ðŸ” BARRE DE NAVIGATION */}
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
          className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 mb-10 hover:text-slate-900 transition-all cursor-pointer bg-transparent border-none outline-none"
        >
          <ChevronLeft size={14} /> Retour Cockpit Master
        </button>

        <header className="mb-12">
          <h1 className="text-6xl font-black text-slate-900 uppercase italic leading-none flex items-center gap-6 tracking-tighter">
            <Rocket className="text-blue-600" size={56} /> Provisioning <span className="text-blue-600">Elite</span>
          </h1>
          <p className="text-[11px] font-black uppercase text-slate-400 mt-4 tracking-[0.3em]">
            Initialisation dynamique d&apos;instance Qualisoft Elite RD 2030
          </p>
        </header>

        <form onSubmit={handleDeploy} className="space-y-10 bg-white p-12 rounded-[3.5rem] border border-white shadow-2xl animate-in fade-in slide-in-from-bottom-6 duration-700">
          
          {/* SECTION 1 : ORGANISATION */}
          <div className="space-y-6">
            <h3 className="text-[10px] font-black text-blue-600 uppercase tracking-[0.3em] flex items-center gap-2 border-b border-slate-100 pb-4">
              <Building2 size={14} /> IdentitÃ© & CoordonnÃ©es du NÅ“ud
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-2">DÃ©nomination Sociale</label>
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
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-2">CEO / Directeur GÃ©nÃ©ral</label>
                <div className="relative">
                  <UserCheck className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <input 
                    required 
                    type="text" 
                    className="w-full pl-16 pr-6 py-6 bg-slate-50 border-2 border-transparent rounded-[1.8rem] font-black text-slate-900 outline-none focus:border-blue-600 focus:bg-white transition-all italic" 
                    value={formData.ceoName} 
                    onChange={(e) => setFormData({ ...formData, ceoName: e.target.value })} 
                    placeholder="PrÃ©nom & Nom du CEO" 
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-2">TÃ©lÃ©phone Professionnel</label>
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
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-2">Adresse du SiÃ¨ge</label>
                <div className="relative">
                  <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <input 
                    required 
                    type="text" 
                    className="w-full pl-16 pr-6 py-6 bg-slate-50 border-2 border-transparent rounded-[1.8rem] font-black text-slate-900 outline-none focus:border-blue-600 focus:bg-white transition-all italic" 
                    value={formData.address} 
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })} 
                    placeholder="Dakar, SÃ©nÃ©gal" 
                  />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-2">AperÃ§u de l&apos;URL Souveraine</label>
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
              <User size={14} /> Administrateur Racine (ContrÃ´leur SMI)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-2">PrÃ©nom Admin</label>
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
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-2 italic">Mot de passe initial (Auto-scellÃ©)</label>
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

          {/* ACTION DE DÃ‰PLOIEMENT */}
          <button 
            type="submit" 
            disabled={loading} 
            className="w-full py-8 bg-slate-900 text-white rounded-[2.5rem] font-black uppercase tracking-[0.5em] flex justify-center items-center gap-4 hover:bg-blue-600 hover:shadow-xl transition-all cursor-pointer disabled:bg-slate-200 border-none mt-6 text-[11px] italic"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={24} />
            ) : (
              <>
                <Rocket size={20} className="animate-pulse" /> 
                Lancer le DÃ©ploiement Matrix
              </>
            )}
          </button>
        </form>

        <footer className="mt-24 text-center border-t border-slate-200 pt-12">
          <p className="text-[9px] font-black uppercase tracking-[0.6em] text-slate-300 italic">
            Qualisoft Elite Sovereign Infrastructure â€¢ Protocol v2.1.2 â€¢ 2026
          </p>
        </footer>
      </div>
    </div>
  );
}