/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import apiClient from '@/core/api/api-client';
import { 
  Users, Mail, Loader2, Building2, 
  Layers, UserPlus, CheckCircle, 
  MapPin, GitBranch, ShieldCheck, 
  ChevronRight, Save, ShieldAlert,
  AlertCircle
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Site {
  S_Id: string;
  S_Name: string;
  S_IsActive: boolean;
}

interface OrgUnit {
  OU_Id: string;
  OU_Name: string;
  OU_Code?: string;
  OU_SiteId: string;
  OU_IsActive: boolean;
}

interface Processus {
  PR_Id: string;
  PR_Code: string;
  PR_Libelle: string;
  PR_IsActive: boolean;
  PR_PiloteId?: string;
}

export default function NewUserPage() {
  // États des référentiels
  const [sites, setSites] = useState<Site[]>([]);
  const [allOrgUnits, setAllOrgUnits] = useState<OrgUnit[]>([]);
  const [processes, setProcesses] = useState<Processus[]>([]);
  
  // États de chargement
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Valeurs initiales avec mot de passe imposé
  const initialFormState = {
    U_FirstName: '',
    U_LastName: '',
    U_Email: '',
    U_Password: 'qs@20252026', // 🔑 Mot de passe par défaut Qualisoft
    U_Role: 'PILOTE',
    U_SiteId: '',
    U_OrgUnitId: '', 
    U_AssignedProcessId: '' 
  };

  const [formData, setFormData] = useState(initialFormState);

  // 🔧 FILTRAGE DYNAMIQUE DES UNITÉS PAR SITE
  const filteredOrgUnits = useMemo(() => {
    if (!formData.U_SiteId) return [];
    return allOrgUnits.filter(unit => 
      unit.OU_SiteId === formData.U_SiteId && unit.OU_IsActive
    );
  }, [formData.U_SiteId, allOrgUnits]);

  // 📡 CHARGEMENT DES RÉFÉRENTIELS DE QUALIFICATION
  const loadReferentials = useCallback(async () => {
    setLoading(true);
    try {
      // Chargement parallèle des trois référentiels
      const [sitesRes, orgUnitsRes, processesRes] = await Promise.all([
        apiClient.get('/sites'),
        apiClient.get('/org-units'),
        apiClient.get('/processus')
      ]);

      // Filtrage des éléments actifs uniquement
      setSites((sitesRes.data || []).filter((s: Site) => s.S_IsActive));
      setAllOrgUnits((orgUnitsRes.data || []).filter((u: OrgUnit) => u.OU_IsActive));
      setProcesses((processesRes.data || []).filter((p: Processus) => p.PR_IsActive));

    } catch (error: any) {
      console.error('Erreur chargement référentiels:', error);
      toast.error(error.response?.data?.message || "Échec de synchronisation des référentiels structurels");
    } finally {
      setLoading(false);
    }
  }, []);

  // 🔄 RECHARGEMENT INITIAL AU MONTAGE
  useEffect(() => {
    loadReferentials();
  }, []); // Pas de dépendance pour éviter les rechargements intempestifs

  // 🔄 RÉINITIALISATION DES CHAMPS DÉPENDANTS
  useEffect(() => {
    // Réinitialiser l'unité quand le site change
    setFormData(prev => ({
      ...prev,
      U_OrgUnitId: '',
      U_AssignedProcessId: ''
    }));
  }, [formData.U_SiteId]);

  useEffect(() => {
    // Réinitialiser le processus quand l'unité change
    setFormData(prev => ({
      ...prev,
      U_AssignedProcessId: ''
    }));
  }, [formData.U_OrgUnitId]);

  // ✅ VALIDATION DU FORMULAIRE
  const validateForm = (): boolean => {
    if (!formData.U_FirstName.trim()) {
      toast.error('Le prénom est obligatoire');
      return false;
    }
    if (!formData.U_LastName.trim()) {
      toast.error('Le nom est obligatoire');
      return false;
    }
    if (!formData.U_Email.trim()) {
      toast.error('L\'email est obligatoire');
      return false;
    }
    // Validation email simple
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.U_Email)) {
      toast.error('Format d\'email invalide');
      return false;
    }
    if (!formData.U_SiteId) {
      toast.error('Veuillez sélectionner un site');
      return false;
    }
    if (!formData.U_OrgUnitId) {
      toast.error('Veuillez sélectionner une unité organisationnelle');
      return false;
    }
    if (formData.U_Role === 'PILOTE' && !formData.U_AssignedProcessId) {
      toast.error('Un pilote doit être affecté à un processus');
      return false;
    }
    return true;
  };

  // 📤 SOUMISSION DU FORMULAIRE
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation avant soumission
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      // Préparation des données selon le schéma Prisma
      const userData = {
        U_FirstName: formData.U_FirstName.trim(),
        U_LastName: formData.U_LastName.trim(),
        U_Email: formData.U_Email.trim().toLowerCase(),
        U_Password: formData.U_Password,
        U_Role: formData.U_Role,
        U_SiteId: formData.U_SiteId,
        U_OrgUnitId: formData.U_OrgUnitId,
        U_AssignedProcessId: formData.U_AssignedProcessId || undefined,
        U_IsActive: true,
        U_FirstLogin: true
      };

      await apiClient.post('/users', userData);
      
      toast.success(
        `✅ Habilitation réussie pour ${formData.U_FirstName} ${formData.U_LastName}`,
        { duration: 4000 }
      );
      
      // Réinitialisation avec le mot de passe par défaut
      setFormData(initialFormState);
      
    } catch (err: any) {
      console.error('Erreur création utilisateur:', err);
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.error || 
                          "Erreur lors de l'habilitation de l'utilisateur";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 🎨 AFFICHAGE CHARGEMENT INITIAL
  if (loading) {
    return (
      <div className="ml-72 h-screen flex flex-col items-center justify-center bg-[#0B0F1A] text-blue-500 font-black italic uppercase tracking-[0.3em]">
        <Loader2 className="animate-spin mb-6" size={50} />
        <div className="text-center">
          <p>Initialisation des Matrices...</p>
          <p className="text-xs mt-2 text-slate-600">Chargement des référentiels structurels</p>
        </div>
      </div>
    );
  }

  // 📊 STATISTIQUES DES RÉFÉRENTIELS
  const stats = {
    sites: sites.length,
    units: allOrgUnits.length,
    processes: processes.length
  };

  return (
    <div className="p-10 bg-[#0B0F1A] min-h-screen ml-72 text-white italic font-sans">
      
      {/* HEADER DE QUALIFICATION */}
      <header className="mb-12 border-b border-white/5 pb-10 flex justify-between items-end">
        <div>
          <h1 className="text-6xl font-black uppercase tracking-tighter italic leading-none">
            Nouvelle <span className="text-blue-500">Habilitation</span>
          </h1>
          <p className="text-slate-500 font-bold text-[10px] uppercase tracking-[0.5em] mt-4 italic">
            Qualification et Autorité du Personnel • ISO 9001 §7.2
          </p>
        </div>
        <div className="flex items-center gap-3 bg-white/5 p-4 rounded-2xl border border-white/10">
           <ShieldCheck size={20} className="text-emerald-500" />
           <div className="text-right">
              <p className="text-[8px] font-black text-slate-500 uppercase">Sécurité</p>
              <p className="text-[10px] font-black text-white uppercase italic">Noyau de confiance Actif</p>
           </div>
        </div>
      </header>

      {/* RÉSUMÉ DES RÉFÉRENTIELS DISPONIBLES */}
      <div className="mb-8 grid grid-cols-3 gap-4">
        {[
          { label: 'Sites', value: stats.sites, icon: MapPin, color: 'text-blue-500' },
          { label: 'Unités', value: stats.units, icon: Layers, color: 'text-amber-500' },
          { label: 'Processus', value: stats.processes, icon: GitBranch, color: 'text-emerald-500' }
        ].map((stat, i) => (
          <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
            <stat.icon className={`w-6 h-6 mx-auto mb-2 ${stat.color}`} />
            <div className="text-2xl font-black">{stat.value}</div>
            <div className="text-[9px] uppercase text-slate-500">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="max-w-5xl">
        <form onSubmit={handleSubmit} className="grid grid-cols-12 gap-10">
          
          {/* SECTION 1 : IDENTITÉ & ACCÈS */}
          <div className="col-span-12 lg:col-span-5 space-y-6">
            <div className="bg-[#0F172A] p-8 rounded-[3rem] border border-white/5 shadow-2xl">
              <h3 className="text-sm font-black uppercase italic text-blue-500 mb-6 flex items-center gap-3">
                <UserPlus size={18} /> Profil & Accès
              </h3>
              
              <div className="space-y-4">
                {/* PRÉNOM & NOM */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-500 uppercase ml-2 tracking-widest">
                      Prénom <span className="text-red-500">*</span>
                    </label>
                    <input 
                      required 
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-xs font-bold text-white uppercase italic focus:border-blue-500 outline-none focus:ring-1 focus:ring-blue-500/50" 
                      placeholder="Ex: Jean"
                      value={formData.U_FirstName} 
                      onChange={e => setFormData({ ...formData, U_FirstName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-500 uppercase ml-2 tracking-widest">
                      Nom <span className="text-red-500">*</span>
                    </label>
                    <input 
                      required 
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-xs font-bold text-white uppercase italic focus:border-blue-500 outline-none focus:ring-1 focus:ring-blue-500/50" 
                      placeholder="Ex: DUPONT"
                      value={formData.U_LastName} 
                      onChange={e => setFormData({ ...formData, U_LastName: e.target.value })}
                    />
                  </div>
                </div>

                {/* EMAIL */}
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-500 uppercase ml-2 tracking-widest">
                    Email Professionnel <span className="text-red-500">*</span>
                  </label>
                  <input 
                    required 
                    type="email" 
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-xs font-bold text-white italic focus:border-blue-500 outline-none focus:ring-1 focus:ring-blue-500/50" 
                    placeholder="prenom.nom@entreprise.com"
                    value={formData.U_Email} 
                    onChange={e => setFormData({ ...formData, U_Email: e.target.value })}
                  />
                </div>

                {/* MOT DE PASSE PROVISOIRE */}
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-amber-500 uppercase ml-2 tracking-widest">
                    🔐 Mot de passe provisoire (système)
                  </label>
                  <input 
                    readOnly 
                    className="w-full bg-amber-500/5 border border-amber-500/20 rounded-xl p-4 text-xs font-black text-amber-500 italic outline-none cursor-not-allowed" 
                    value={formData.U_Password} 
                  />
                  <p className="text-[8px] text-slate-600 mt-1 ml-2 italic">
                    Généré automatiquement • L&apos;utilisateur devra le modifier à la première connexion
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 2 : QUALIFICATION STRUCTURELLE */}
          <div className="col-span-12 lg:col-span-7 space-y-6">
            <div className="bg-[#0F172A] p-10 rounded-[4rem] border border-white/5 shadow-2xl space-y-8">
              <h3 className="text-sm font-black uppercase italic text-emerald-500 flex items-center gap-3">
                <ShieldCheck size={18} /> Qualification Métier (§4.4 & 7.2)
              </h3>

              <div className="grid grid-cols-2 gap-8">
                {/* RÔLE */}
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-500 uppercase ml-1 tracking-widest flex items-center gap-2 italic">
                    Rôle Qualité <span className="text-red-500">*</span>
                  </label>
                  <select 
                    required 
                    className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl text-[11px] font-black text-white italic outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50" 
                    value={formData.U_Role} 
                    onChange={e => setFormData({ ...formData, U_Role: e.target.value })}
                  >
                    <option value="PILOTE" className="bg-[#0B0F1A]">🎯 PILOTE PROCESSUS</option>
                    <option value="ADMIN" className="bg-[#0B0F1A]">⚙️ ADMIN / RESPONSABLE QUALITÉ</option>
                    <option value="USER" className="bg-[#0B0F1A]">👥 COLLABORATEUR STANDARD</option>
                    <option value="COPILOTE" className="bg-[#0B0F1A]">🤝 CO-PILOTE PROCESSUS</option>
                    <option value="AUDITEUR" className="bg-[#0B0F1A]">🔍 AUDITEUR INTERNE</option>
                  </select>
                  <p className="text-[8px] text-slate-600 mt-1 ml-2 italic">
                    Définit les permissions et responsabilités dans le système
                  </p>
                </div>

                {/* SITE */}
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-500 uppercase ml-1 tracking-widest flex items-center gap-2 italic">
                    <MapPin size={10} className="text-blue-500" /> Site d&apos;attache <span className="text-red-500">*</span>
                  </label>
                  <select 
                    required 
                    className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl text-[11px] font-black text-white italic outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50" 
                    value={formData.U_SiteId} 
                    onChange={e => setFormData({ ...formData, U_SiteId: e.target.value })}
                  >
                    <option value="" className="bg-[#0B0F1A]">Choisir un Site...</option>
                    {sites.map(site => (
                      <option key={site.S_Id} value={site.S_Id} className="bg-[#0B0F1A]">
                        📍 {site.S_Name}
                      </option>
                    ))}
                  </select>
                  {formData.U_SiteId && (
                    <p className="text-[8px] text-emerald-500 mt-1 ml-2 italic flex items-center gap-1">
                      <CheckCircle size={10} /> {sites.find(s => s.S_Id === formData.U_SiteId)?.S_Name}
                    </p>
                  )}
                </div>

                {/* UNITÉ ORGANISATIONNELLE */}
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-500 uppercase ml-1 tracking-widest flex items-center gap-2 italic">
                    <Layers size={10} className="text-amber-500" /> Unité / Département <span className="text-red-500">*</span>
                  </label>
                  <select 
                    required 
                    disabled={!formData.U_SiteId}
                    className={`w-full ${
                      formData.U_SiteId 
                        ? 'bg-white/5 border border-white/10' 
                        : 'bg-slate-800/30 border border-dashed border-slate-600'
                    } p-5 rounded-2xl text-[11px] font-black text-white italic outline-none ${
                      formData.U_SiteId ? 'focus:border-amber-500 focus:ring-1 focus:ring-amber-500/50' : ''
                    } disabled:opacity-40 disabled:cursor-not-allowed`}
                    value={formData.U_OrgUnitId} 
                    onChange={e => setFormData({ ...formData, U_OrgUnitId: e.target.value })}
                  >
                    <option value="" className="bg-[#0B0F1A]">
                      {!formData.U_SiteId ? "⚠️ Sélectionner un site d'abord" : "Choisir une Unité..."}
                    </option>
                    {filteredOrgUnits.map(unit => (
                      <option key={unit.OU_Id} value={unit.OU_Id} className="bg-[#0B0F1A]">
                        🏢 {unit.OU_Code ? `[${unit.OU_Code}] ` : ''}{unit.OU_Name}
                      </option>
                    ))}
                  </select>
                  {!formData.U_SiteId && (
                    <p className="text-[8px] text-amber-500 mt-1 ml-2 italic flex items-center gap-1">
                      <AlertCircle size={10} /> Sélectionnez d&apos;abord un site pour voir les unités disponibles
                    </p>
                  )}
                  {formData.U_OrgUnitId && (
                    <p className="text-[8px] text-emerald-500 mt-1 ml-2 italic flex items-center gap-1">
                      <CheckCircle size={10} /> {allOrgUnits.find(u => u.OU_Id === formData.U_OrgUnitId)?.OU_Name}
                    </p>
                  )}
                </div>

                {/* PROCESSUS ASSIGNÉ */}
                <div className="space-y-2">
                  <label className={`text-[9px] font-black uppercase ml-1 tracking-widest flex items-center gap-2 italic ${
                    formData.U_Role === 'PILOTE' ? 'text-blue-500 animate-pulse' : 'text-slate-500'
                  }`}>
                    <GitBranch size={10} /> 
                    {formData.U_Role === 'PILOTE' ? '🎯 Domaine de Pilotage (Cockpit)' : 'Processus Assigné'}
                    {formData.U_Role === 'PILOTE' && <span className="text-red-500">*</span>}
                  </label>
                  <select 
                    required={formData.U_Role === 'PILOTE'}
                    disabled={formData.U_Role !== 'PILOTE'}
                    className={`w-full ${
                      formData.U_Role === 'PILOTE'
                        ? 'bg-blue-500/5 border border-blue-500/20' 
                        : 'bg-slate-800/30 border border-dashed border-slate-600'
                    } p-5 rounded-2xl text-[11px] font-black ${
                      formData.U_Role === 'PILOTE' ? 'text-blue-400' : 'text-slate-500'
                    } italic outline-none ${
                      formData.U_Role === 'PILOTE' ? 'focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50' : ''
                    } disabled:opacity-40 disabled:cursor-not-allowed`}
                    value={formData.U_AssignedProcessId} 
                    onChange={e => setFormData({ ...formData, U_AssignedProcessId: e.target.value })}
                  >
                    <option value="" className="bg-[#0B0F1A]">
                      {formData.U_Role === 'PILOTE' 
                        ? "Affecter un Processus à piloter..." 
                        : "🔒 Réservé au rôle PILOTE"}
                    </option>
                    {formData.U_Role === 'PILOTE' && processes.map(process => (
                      <option key={process.PR_Id} value={process.PR_Id} className="bg-[#0B0F1A]">
                        📊 {process.PR_Code} - {process.PR_Libelle}
                      </option>
                    ))}
                  </select>
                  {formData.U_Role === 'PILOTE' && !formData.U_AssignedProcessId && (
                    <p className="text-[8px] text-amber-500 mt-1 ml-2 italic flex items-center gap-1">
                      <AlertCircle size={10} /> Un pilote doit être affecté à au moins un processus
                    </p>
                  )}
                  {formData.U_AssignedProcessId && (
                    <p className="text-[8px] text-emerald-500 mt-1 ml-2 italic flex items-center gap-1">
                      <CheckCircle size={10} /> {processes.find(p => p.PR_Id === formData.U_AssignedProcessId)?.PR_Libelle}
                    </p>
                  )}
                </div>
              </div>

              {/* BOUTON DE SOUMISSION */}
              <div className="pt-8 flex flex-col items-center gap-6">
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white py-7 rounded-4xl font-black uppercase text-xs italic shadow-3xl flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="animate-spin" />
                      Création en cours...
                    </>
                  ) : (
                    <>
                      <Save size={20} className="group-hover:scale-110 transition-transform" />
                      Confirmer l&apos;Habilitation & Qualification
                    </>
                  )}
                </button>
                
                {/* AVERTISSEMENT DE SÉCURITÉ */}
                <div className="flex items-center gap-3 opacity-30 italic">
                   <ShieldAlert size={14} />
                   <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                     Action irréversible • Enregistrée dans le log d&apos;audit qualité
                   </span>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}