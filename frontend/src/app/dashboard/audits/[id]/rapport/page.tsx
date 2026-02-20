/**
 * 💡 CE QUE FAIT CETTE PAGE :
 * --------------------------
 * Fichier : app/dashboard/audits/[id]/rapport/page.tsx
 * Rôle : Interface de rédaction et de clôture du rapport d'audit.
 * * Fonctionnalités clés :
 * 1. Constats d'Audit : Ajout dynamique de constats (Points forts, Observations, Conformités, Non-Conformités).
 * 2. Automatisation ISO : Si l'auditeur qualifie un constat en "NC Mineure" ou "NC Majeure", le système prépare automatiquement la déclaration de cette Non-Conformité dans le registre global.
 * 3. Clôture Sécurisée : Bouton de validation qui transmet le rapport au backend, actant la fin de l'audit.
 * * Public cible : Auditeurs, Lead Auditeurs.
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import apiClient from '@/core/api/api-client';
import { 
  FileText, Plus, Trash2, Save, Loader2, ArrowLeft, ShieldAlert 
} from 'lucide-react';
import { toast } from 'react-hot-toast';

// --- INTERFACES STRICTES ---
interface Processus {
  PR_Libelle: string;
}

interface AuditDetails {
  AU_Title: string;
  AU_Reference: string;
  AU_Processus?: Processus;
}

interface Finding {
  FI_Description: string;
  FI_Type: 'CONFORMITE' | 'POINT_FORT' | 'OBSERVATION' | 'NC_MINEURE' | 'NC_MAJEURE' | string;
}

interface NonConformityDraft {
  index: number;
  NC_Libelle: string;
  NC_Description: string;
  NC_Gravite: 'MAJEURE' | 'MINEURE';
}

export default function RapportAuditPage() {
  const params = useParams();
  const id = params?.id as string; 
  const router = useRouter();
  
  const [audit, setAudit] = useState<AuditDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [findings, setFindings] = useState<Finding[]>([{ FI_Description: '', FI_Type: 'CONFORMITE' }]);
  const [ncs, setNcs] = useState<NonConformityDraft[]>([]);

  useEffect(() => {
    const fetchAudit = async () => {
      if (!id) return;
      try {
        const res = await apiClient.get<AuditDetails>(`/audits/${id}`);
        setAudit(res.data);
      } catch (err) { 
        console.error("Erreur chargement rapport", err);
        toast.error("Impossible de charger les données de l'audit.");
      } finally { 
        setLoading(false); 
      }
    };
    fetchAudit();
  }, [id]);

  const addFinding = () => setFindings([...findings, { FI_Description: '', FI_Type: 'CONFORMITE' }]);
  
  const removeFinding = (idx: number) => {
    setFindings(findings.filter((_, i) => i !== idx));
    // Optionnel : Retirer également la NC associée si elle existe
    setNcs(ncs.filter((n) => n.index !== idx));
  };

  const updateFinding = (index: number, field: keyof Finding, value: string) => {
    const newFindings = [...findings];
    newFindings[index] = { ...newFindings[index], [field]: value };
    setFindings(newFindings);

    if (field === 'FI_Type') {
      if (value === 'NC_MINEURE' || value === 'NC_MAJEURE') {
        // Ajoute la NC si elle n'existe pas encore pour cet index
        if (!ncs.find(n => n.index === index)) {
          setNcs([...ncs, { 
            index, 
            NC_Libelle: `Écart: ${audit?.AU_Title || 'Audit'}`, 
            NC_Description: newFindings[index].FI_Description,
            NC_Gravite: value === 'NC_MAJEURE' ? 'MAJEURE' : 'MINEURE'
          }]);
        } else {
          // Met à jour la gravité si elle change entre mineure/majeure
          setNcs(ncs.map(n => n.index === index ? { ...n, NC_Gravite: value === 'NC_MAJEURE' ? 'MAJEURE' : 'MINEURE' } : n));
        }
      } else {
        // Supprime la NC si le type redevient une conformité/observation
        setNcs(ncs.filter(n => n.index !== index));
      }
    } else if (field === 'FI_Description') {
      // Met à jour la description de la NC en temps réel si elle existe
      setNcs(ncs.map(n => n.index === index ? { ...n, NC_Description: value } : n));
    }
  };

  const handleSubmitReport = async () => {
    if (!id) return;
    try {
      setSubmitting(true);
      await apiClient.post(`/audits/${id}/submit-report`, { findings, nonConformites: ncs });
      toast.success("Rapport clôturé et transmis !");
      router.push('/dashboard/audits');
    } catch (err) { 
      console.error(err);
      toast.error("Erreur lors de la clôture."); 
    } finally { 
      setSubmitting(false); 
    }
  };

  if (loading) {
    return (
      <div className="ml-72 flex h-screen items-center justify-center bg-[#0B0F1A]">
        <Loader2 className="animate-spin text-blue-500" size={40}/>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-[#0B0F1A] min-h-screen p-10 ml-72 text-white font-sans italic text-left">
      <div className="max-w-6xl mx-auto space-y-10">
        <header className="flex justify-between items-center border-b border-white/5 pb-10">
          <div className="flex items-center gap-6 text-left">
            <button onClick={() => router.back()} className="p-4 bg-white/5 rounded-2xl hover:bg-white/10 transition-all text-slate-400 cursor-pointer">
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-4xl font-black uppercase italic tracking-tighter text-white leading-none">
                Rapport d&apos;<span className="text-blue-500">Audit</span>
              </h1>
              <p className="text-slate-500 text-[9px] font-bold uppercase tracking-[0.3em] mt-2 italic">
                Réf: {audit?.AU_Reference} • {audit?.AU_Processus?.PR_Libelle}
              </p>
            </div>
          </div>
          <button 
            onClick={handleSubmitReport} 
            disabled={submitting} 
            className="bg-emerald-600 hover:bg-emerald-500 text-white px-10 py-5 rounded-3xl font-black uppercase italic text-xs shadow-2xl flex items-center gap-3 active:scale-95 disabled:opacity-50 transition-all cursor-pointer"
          >
            {submitting ? <Loader2 className="animate-spin" size={16} /> : <Save size={18} />} Clôturer Rapport
          </button>
        </header>

        <div className="bg-slate-900/40 border border-white/5 rounded-[3.5rem] p-10 space-y-8">
          <div className="flex justify-between items-center border-b border-white/5 pb-6">
            <h2 className="text-xl font-black uppercase italic flex items-center gap-3 text-white">
              <FileText className="text-blue-500" /> Constats terrain
            </h2>
            <button onClick={addFinding} className="bg-blue-600 p-3 rounded-xl transition-all text-white shadow-xl hover:bg-blue-500 cursor-pointer">
              <Plus size={20} />
            </button>
          </div>

          <div className="space-y-6">
            {findings.map((f, index) => (
              <div key={index} className="grid grid-cols-12 gap-6 p-8 bg-white/2 border border-white/5 rounded-[2.5rem] items-start transition-all hover:border-blue-500/20">
                <div className="col-span-8 space-y-3">
                  <label className="text-[8px] font-black text-slate-500 uppercase italic ml-2">Description factuelle (Preuve / Écart)</label>
                  <textarea 
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 text-xs font-bold text-white outline-none focus:border-blue-500 min-h-24 italic"
                    value={f.FI_Description} 
                    onChange={(e) => updateFinding(index, 'FI_Description', e.target.value)} 
                    placeholder="Saisissez le constat ici..." 
                  />
                </div>
                <div className="col-span-3 space-y-3">
                  <label className="text-[8px] font-black text-slate-500 uppercase italic ml-2">Classification</label>
                  <select 
                    className="w-full bg-slate-900 border border-white/10 rounded-2xl p-5 text-[10px] font-black uppercase outline-none text-blue-400 italic cursor-pointer"
                    value={f.FI_Type} 
                    onChange={(e) => updateFinding(index, 'FI_Type', e.target.value)}
                  >
                    <option value="CONFORMITE">Conformité</option>
                    <option value="POINT_FORT">Point Fort</option>
                    <option value="OBSERVATION">Observation</option>
                    <option value="NC_MINEURE">NC Mineure</option>
                    <option value="NC_MAJEURE">NC Majeure</option>
                  </select>
                </div>
                <div className="col-span-1 pt-12 text-right">
                  <button onClick={() => removeFinding(index)} className="text-slate-700 hover:text-red-500 transition-all cursor-pointer">
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {ncs.length > 0 && (
          <div className="bg-red-500/5 border border-red-500/20 rounded-[3rem] p-10 space-y-6 animate-in slide-in-from-bottom-4 text-left">
            <h3 className="text-red-500 font-black uppercase italic flex items-center gap-3 text-sm">
              <ShieldAlert size={20}/> Génération automatique de {ncs.length} Non-Conformité(s)
            </h3>
            <div className="grid gap-4">
              {ncs.map((nc, i) => (
                <div key={i} className="flex justify-between items-center bg-white/5 p-6 rounded-2xl border border-white/5">
                  <p className="text-[10px] font-bold italic text-slate-300">
                    &quot;{nc.NC_Description.substring(0, 120)}{nc.NC_Description.length > 120 ? '...' : ''}&quot;
                  </p>
                  <span className="bg-red-600 text-[8px] font-black px-4 py-1.5 rounded-full uppercase italic text-white shadow-xl shrink-0 ml-4">
                    {nc.NC_Gravite}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}