/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect, useMemo } from 'react';
import apiClient from '@/core/api/api-client';
import { 
  Users, Shield, CreditCard, TrendingUp, AlertCircle, 
  CheckCircle, Clock, XCircle, Search, Filter, 
  Plus, Eye, Edit, Trash2, Mail, Phone, 
  FileText, BarChart3, Settings, HelpCircle,
  ChevronDown, ChevronUp, Download, RefreshCw,
  Package, Zap, Crown, MapPin, Lock, Loader2, UserPlus, ShieldCheck
} from 'lucide-react';
import { toast } from 'react-hot-toast';

// --- CONFIGS ---
const PLAN_CONFIG: any = {
  ESSAI: { label: 'Essai Gratuit', color: 'bg-blue-500' },
  EMERGENCE: { label: 'Émergence', color: 'bg-green-500' },
  CROISSANCE: { label: 'Croissance', color: 'bg-amber-500' },
  ENTREPRISE: { label: 'Entreprise', color: 'bg-purple-500' },
  GROUPE: { label: 'Groupe', color: 'bg-red-500' }
};

const STATUS_CONFIG: any = {
  TRIAL: { label: 'Essai', color: 'bg-blue-100 text-blue-800', icon: <Clock className="w-4 h-4" /> },
  ACTIVE: { label: 'Actif', color: 'bg-green-100 text-green-800', icon: <CheckCircle className="w-4 h-4" /> },
  SUSPENDED: { label: 'Suspendu', color: 'bg-yellow-100 text-yellow-800', icon: <AlertCircle className="w-4 h-4" /> }
};

export default function SuperAdminTenantsPage() {
  const [tenants, setTenants] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddTenant, setShowAddTenant] = useState(false);
  const [expandedTenant, setExpandedTenant] = useState<string | null>(null);
  const [adminModalData, setAdminModalData] = useState<{id: string, name: string} | null>(null);

  const loadTenants = async () => {
    setLoading(true);
    try {
      const [tenantsRes, statsRes] = await Promise.all([
        apiClient.get('/tenants'),
        apiClient.get('/tenants/stats')
      ]);
      
      const tenantsWithStats = await Promise.all(
        tenantsRes.data.map(async (t: any) => {
          try {
            const s = await apiClient.get(`/tenants/${t.T_Id}/statistics`);
            return { ...t, stats: s.data };
          } catch { return t; }
        })
      );
      setTenants(tenantsWithStats);
      setStats(statsRes.data);
    } catch (error: any) {
      toast.error('Vérifiez les routes /stats sur le backend');
    } finally { setLoading(false); }
  };

  useEffect(() => { loadTenants(); }, []);

  const filteredTenants = useMemo(() => {
    return tenants.filter(t => t.T_Name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [tenants, searchTerm]);

  return (
    <div className="ml-72 min-h-screen bg-[#0B0F1A] text-white italic font-sans">
      <header className="bg-linear-to-r from-blue-900 to-purple-900 border-b border-white/10 p-8">
        <div className="max-w-7xl mx-auto flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-black uppercase italic">Espace <span className="text-yellow-400">Super Admin</span></h1>
            <p className="text-slate-400 text-sm uppercase tracking-widest italic font-bold">Qualisoft Management Cluster</p>
          </div>
          <div className="flex gap-3">
             <button onClick={loadTenants} className="flex items-center gap-2 px-4 py-2 bg-blue-600 rounded-lg text-xs font-bold uppercase hover:bg-blue-500"><RefreshCw size={14}/> Actualiser</button>
             <button onClick={() => setShowAddTenant(true)} className="flex items-center gap-2 px-6 py-3 bg-purple-600 rounded-xl text-sm font-black uppercase shadow-xl hover:bg-purple-500"><Plus size={18}/> Nouveau Tenant</button>
          </div>
        </div>
        <div className="max-w-7xl mx-auto grid grid-cols-6 gap-4">
           <StatCard label="Total" value={stats?.totalTenants || 0} icon={<Users />} color="bg-blue-500/20" />
           <StatCard label="Actifs" value={stats?.activeTenants || 0} icon={<CheckCircle />} color="bg-green-500/20" />
           <StatCard label="MRR" value={`${(stats?.mrr || 0) / 1000}K`} icon={<CreditCard />} color="bg-purple-500/20" />
           <StatCard label="Revenu" value={`${(stats?.totalRevenue || 0) / 1000000}M`} icon={<TrendingUp />} color="bg-amber-500/20" />
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-6 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
          <input className="w-full bg-[#0F172A] border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white font-bold outline-none focus:border-blue-500" placeholder="Rechercher une instance..." onChange={e => setSearchTerm(e.target.value)} />
        </div>

        <div className="space-y-4">
          {filteredTenants.map(t => (
            <TenantCard 
              key={t.T_Id} tenant={t} isExpanded={expandedTenant === t.T_Id}
              onToggleExpand={() => setExpandedTenant(expandedTenant === t.T_Id ? null : t.T_Id)}
              onOpenAdminModal={(id: string, name: string) => setAdminModalData({id, name})}
              onRefresh={loadTenants}
            />
          ))}
        </div>
      </main>

      {showAddTenant && <AddTenantModal onClose={() => setShowAddTenant(false)} onSuccess={loadTenants} />}
      {adminModalData && <AddAdminModal tenant={adminModalData} onClose={() => setAdminModalData(null)} onSuccess={loadTenants} />}
    </div>
  );
}

// --- PHASE 1 : CRÉATION TENANT SEUL ---
function AddTenantModal({ onClose, onSuccess }: any) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ T_Name: '', T_Email: '', T_Domain: '', T_Plan: 'ESSAI', T_CeoName: '', T_Phone: '', T_Address: '', T_ContractDuration: 24 });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // ⚠️ Vérifiez que votre API_URL contient bien le /api final
      await apiClient.post('/tenants', form);
      toast.success('Tenant créé ! Passez à la Phase 2 (Admin)');
      onSuccess(); onClose();
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Erreur 404 ou 500 : Vérifiez le Backend');
    } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4 italic font-bold">
      <div className="bg-[#0B0F1A] border border-white/10 rounded-2xl max-w-lg w-full p-8 shadow-2xl">
        <h2 className="text-2xl font-black uppercase mb-6 flex items-center gap-3"><Zap className="text-blue-500"/> Phase 1 : Tenant</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input required placeholder="NOM ENTREPRISE" className="w-full bg-white/5 border border-white/10 p-3 rounded-lg text-sm" onChange={e => setForm({...form, T_Name: e.target.value, T_Domain: e.target.value.toLowerCase().replace(/\s+/g, '-')})} />
          <input required type="email" placeholder="EMAIL CONTACT" className="w-full bg-white/5 border border-white/10 p-3 rounded-lg text-sm" onChange={e => setForm({...form, T_Email: e.target.value})} />
          <input placeholder="CEO" className="w-full bg-white/5 border border-white/10 p-3 rounded-lg text-sm" onChange={e => setForm({...form, T_CeoName: e.target.value})} />
          <div className="grid grid-cols-2 gap-4">
             <select className="w-full bg-white/5 border border-white/10 p-3 rounded-lg text-sm" onChange={e => setForm({...form, T_Plan: e.target.value})}>
               {Object.keys(PLAN_CONFIG).map(k => <option key={k} value={k}>{k}</option>)}
             </select>
             <input type="number" placeholder="CONTRAT (MOIS)" className="w-full bg-white/5 border border-white/10 p-3 rounded-lg text-sm" defaultValue={24} onChange={e => setForm({...form, T_ContractDuration: parseInt(e.target.value)})} />
          </div>
          <button type="submit" disabled={loading} className="w-full py-4 bg-blue-600 rounded-xl font-black uppercase hover:bg-blue-500 transition-all">
            {loading ? <Loader2 className="animate-spin mx-auto" /> : "Valider le Tenant"}
          </button>
        </form>
      </div>
    </div>
  );
}

// --- PHASE 2 : MODAL ADMIN ---
function AddAdminModal({ tenant, onClose, onSuccess }: any) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ firstName: '', lastName: '', password: '', email: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await apiClient.post(`/auth/register-admin-only`, { ...form, tenantId: tenant.id });
      toast.success(`Admin déployé pour ${tenant.name}`);
      onSuccess(); onClose();
    } catch (e: any) { toast.error('Erreur Phase 2'); }
    finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4 italic font-bold">
      <div className="bg-[#0B0F1A] border border-amber-500/30 rounded-2xl max-w-lg w-full p-8 shadow-2xl animate-in zoom-in-95">
        <h2 className="text-2xl font-black uppercase mb-2 flex items-center gap-3 text-amber-500"><ShieldCheck/> Phase 2 : Admin</h2>
        <p className="text-slate-500 text-[10px] mb-6 uppercase tracking-tighter">Assignation du compte maître pour {tenant.name}</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input required type="email" placeholder="EMAIL DE CONNEXION" className="w-full bg-white/5 border border-white/10 p-3 rounded-lg text-sm" onChange={e => setForm({...form, email: e.target.value})} />
          <div className="grid grid-cols-2 gap-4">
            <input required placeholder="PRÉNOM" className="w-full bg-white/5 border border-white/10 p-3 rounded-lg text-sm" onChange={e => setForm({...form, firstName: e.target.value})} />
            <input required placeholder="NOM" className="w-full bg-white/5 border border-white/10 p-3 rounded-lg text-sm" onChange={e => setForm({...form, lastName: e.target.value})} />
          </div>
          <input required type="password" placeholder="MOT DE PASSE" className="w-full bg-white/5 border border-white/10 p-3 rounded-lg text-sm" onChange={e => setForm({...form, password: e.target.value})} />
          <button type="submit" disabled={loading} className="w-full py-4 bg-amber-600 rounded-xl font-black uppercase hover:bg-amber-500 transition-all">
            {loading ? <Loader2 className="animate-spin mx-auto" /> : "Déployer le Profil"}
          </button>
        </form>
      </div>
    </div>
  );
}

// --- CARD RESTAURÉE (CEO, ADRESSE, METRICS) ---
function TenantCard({ tenant, isExpanded, onToggleExpand, onOpenAdminModal, onRefresh }: any) {
  const pc = PLAN_CONFIG[tenant.T_Plan] || { label: 'PLAN', color: 'bg-slate-700' };
  
  return (
    <div className="bg-[#0F172A] rounded-2xl border border-white/5 overflow-hidden hover:border-blue-500/30 transition-all">
      <div className="p-6 flex items-center justify-between">
        <div className="flex-1">
          <h3 className="text-xl font-black italic uppercase text-white mb-1">{tenant.T_Name}</h3>
          <div className="flex gap-4 text-[10px] font-bold text-slate-500 uppercase italic">
            <span>{tenant.T_Domain}.sn</span><span>•</span><span>{tenant.T_Email}</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className={`px-4 py-1 rounded-lg text-[10px] font-black uppercase text-white ${pc.color}`}>{pc.label}</span>
          <button onClick={onToggleExpand} className="p-2 bg-white/5 rounded-lg text-slate-500 hover:text-white transition-all">
             {isExpanded ? <ChevronUp size={22}/> : <ChevronDown size={22}/>}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="p-8 bg-black/30 border-t border-white/5 grid grid-cols-3 gap-10 animate-in slide-in-from-top-2">
           <div className="space-y-4">
              <h4 className="text-[10px] font-black text-slate-600 uppercase italic border-b border-white/5 pb-2">Informations Générales</h4>
              <DetailRow label="CEO" value={tenant.T_CeoName || 'N/A'} />
              <DetailRow label="TÉLÉPHONE" value={tenant.T_Phone || 'N/A'} />
              <DetailRow label="ADRESSE" value={tenant.T_Address || 'N/A'} />
              <DetailRow label="CONTRAT" value={`${tenant.T_ContractDuration} Mois`} />
           </div>

           <div className="space-y-4">
              <h4 className="text-[10px] font-black text-slate-600 uppercase italic border-b border-white/5 pb-2">Metrics SMI</h4>
              <div className="grid grid-cols-2 gap-3">
                 <StatBox label="Users" value={tenant.stats?.usersCount || 0} />
                 <StatBox label="Process" value={tenant.stats?.processesCount || 0} />
                 <StatBox label="Docs" value={tenant.stats?.documentsCount || 0} />
                 <StatBox label="Audits" value={tenant.stats?.auditsCount || 0} />
              </div>
           </div>

           <div className="space-y-4">
              <h4 className="text-[10px] font-black text-blue-500 uppercase italic border-b border-blue-500/20 pb-2">Actions Master</h4>
              <button onClick={() => onOpenAdminModal(tenant.T_Id, tenant.T_Name)} className="w-full py-4 bg-amber-500/10 text-amber-500 border border-amber-500/30 rounded-xl font-black text-[10px] uppercase italic flex items-center justify-center gap-2 hover:bg-amber-600 hover:text-white transition-all">
                <UserPlus size={16} /> Créer l&apos;Administrateur
              </button>
              <button onClick={async () => { await apiClient.delete(`/tenants/${tenant.T_Id}`); onRefresh(); }} className="w-full py-4 bg-red-900/20 text-red-500 rounded-xl font-black text-[10px] uppercase italic flex items-center justify-center gap-2 hover:bg-red-600 hover:text-white transition-all">
                <Trash2 size={16} /> Supprimer le Tenant
              </button>
           </div>
        </div>
      )}
    </div>
  );
}

// --- HELPERS ---
function StatCard({ label, value, icon, color }: any) {
  return <div className="bg-[#0F172A] rounded-2xl p-4 border border-white/5 italic flex items-center justify-between"><div className={`${color} p-3 rounded-xl text-white`}>{icon}</div><div className="text-right"><p className="text-2xl font-black">{value}</p><p className="text-[10px] text-slate-600 uppercase">{label}</p></div></div>;
}
function DetailRow({ label, value }: any) {
  return <div className="flex justify-between text-[10px] font-bold border-b border-white/5 pb-1"><span className="text-slate-600 uppercase">{label}:</span><span className="text-white uppercase truncate ml-2 font-black">{value}</span></div>;
}
function StatBox({ label, value }: any) {
  return <div className="bg-white/5 p-3 rounded-xl border border-white/5 text-center"><p className="text-xl font-black text-white">{value}</p><p className="text-[8px] text-slate-600 uppercase">{label}</p></div>;
}