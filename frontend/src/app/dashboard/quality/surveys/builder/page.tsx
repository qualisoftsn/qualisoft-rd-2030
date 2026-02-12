/* NOM ABSOLU : src/app/dashboard/quality/surveys/builder/page.tsx
  FONCTION : Éditeur dynamique de questions pour les enquêtes Qualisoft
  UTILISATION : Définition des critères d'évaluation par cible (Clients, Fournisseurs, RH)
*/

'use client';

import { useState } from 'react';
import { 
  Plus, Trash2, Send, ChevronLeft, Layout, 
  Settings, Save, Globe, AlertCircle 
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

export default function SurveyBuilderMaster() {
  const router = useRouter();
  const [surveyTitle, setSurveyTitle] = useState("ENQUÊTE DE PERFORMANCE 2026");
  const [questions, setQuestions] = useState([{ id: 1, text: "Niveau de satisfaction globale ?", type: "SCALE" }]);

  const addQuestion = () => {
    setQuestions([...questions, { id: Date.now(), text: "", type: "SCALE" }]);
  };

  const scellerEnquete = () => {
    toast.success("Enquête scellée dans le Noyau Qualisoft");
    router.push('/dashboard/quality/surveys');
  };

  return (
    <div className="p-10 bg-[#0B0F1A] min-h-screen ml-72 text-white italic font-sans overflow-hidden">
      
      {/* 🛰️ NAV BAR BUILDER */}
      <div className="flex justify-between items-center mb-12">
        <button onClick={() => router.back()} className="flex items-center gap-3 text-slate-500 font-black uppercase text-[10px] tracking-widest hover:text-white transition-all border-none bg-transparent cursor-pointer">
          <ChevronLeft size={16} /> Retour au Cockpit
        </button>
        <div className="flex gap-4">
           <button className="bg-white/5 border border-white/10 px-6 py-4 rounded-2xl text-[10px] font-black uppercase italic tracking-widest flex items-center gap-3 hover:bg-white/10 transition-all cursor-pointer">
              <Settings size={16} /> Paramètres Avancés
           </button>
           <button onClick={scellerEnquete} className="bg-blue-600 px-10 py-4 rounded-2xl text-[10px] font-black uppercase italic tracking-widest flex items-center gap-3 shadow-2xl hover:bg-blue-500 transition-all border-none cursor-pointer">
              <Save size={16} /> Sceller l&apos;Enquête
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        
        {/* COLONNE ÉDITION (LE COEUR) */}
        <div className="lg:col-span-2 space-y-8">
           <div className="bg-white/5 p-10 rounded-[3rem] border border-white/5">
              <input 
                value={surveyTitle}
                onChange={(e) => setSurveyTitle(e.target.value.toUpperCase())}
                className="bg-transparent border-none text-5xl font-black uppercase italic tracking-tighter w-full outline-none text-emerald-500"
              />
              <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.4em] mt-4 flex items-center gap-3 italic">
                 <Layout size={14}/> Structure de l&apos;enquête dynamique § ISO 9001
              </p>
           </div>

           <div className="space-y-4">
              {questions.map((q, idx) => (
                <div key={q.id} className="bg-slate-900/60 border border-white/5 p-8 rounded-[2.5rem] flex items-center gap-6 group hover:border-emerald-500/30 transition-all">
                   <div className="text-4xl font-black text-slate-800 italic group-hover:text-emerald-500/20 transition-colors">0{idx + 1}</div>
                   <input 
                      placeholder="ENTREZ VOTRE QUESTION STRATÉGIQUE..."
                      className="bg-transparent border-none outline-none flex-1 font-black uppercase italic text-lg text-white placeholder-slate-800"
                      value={q.text}
                      onChange={(e) => {
                        const newQ = [...questions];
                        newQ[idx].text = e.target.value;
                        setQuestions(newQ);
                      }}
                   />
                   <select className="bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-[10px] font-black uppercase italic text-slate-400 outline-none">
                      <option>ÉCHELLE (1-10)</option>
                      <option>TEXTE LIBRE</option>
                      <option>OUI / NON</option>
                   </select>
                   <button 
                    onClick={() => setQuestions(questions.filter(item => item.id !== q.id))}
                    className="p-3 text-slate-700 hover:text-rose-500 transition-colors border-none bg-transparent cursor-pointer"
                   >
                     <Trash2 size={20} />
                   </button>
                </div>
              ))}
              
              <button 
                onClick={addQuestion}
                className="w-full py-8 border-2 border-dashed border-white/5 rounded-[2.5rem] flex items-center justify-center gap-4 text-slate-600 hover:border-emerald-500/50 hover:text-emerald-500 transition-all cursor-pointer font-black uppercase italic text-xs tracking-widest"
              >
                <Plus size={20} /> Ajouter une dimension d&apos;analyse
              </button>
           </div>
        </div>

        {/* COLONNE DIFFUSION (LE LINK) */}
        <div className="space-y-8">
           <div className="bg-linear-to-br from-blue-600/10 to-transparent border border-blue-600/20 p-10 rounded-[3.5rem] backdrop-blur-3xl shadow-2xl">
              <h3 className="text-2xl font-black uppercase italic mb-8 flex items-center gap-3">
                 <Globe className="text-blue-500" /> Diffusion Master
              </h3>
              <div className="space-y-6">
                 <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase italic tracking-widest block mb-3">Lien Hypertexte Public</label>
                    <div className="flex gap-2">
                       <div className="flex-1 bg-black/40 border border-white/10 p-4 rounded-xl text-[10px] font-mono text-blue-400 truncate italic">
                          https://qualisoft.sn/survey/RD2026-XQ
                       </div>
                    </div>
                 </div>
                 <button className="w-full bg-blue-600 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl flex items-center justify-center gap-3 italic">
                    <Send size={16} /> Envoyer par Mail Groupé
                 </button>
              </div>
           </div>

           <div className="bg-slate-900/40 border border-white/5 p-10 rounded-[3.5rem] shadow-2xl">
              <div className="flex items-center gap-3 text-amber-500 mb-6">
                 <AlertCircle size={20} />
                 <h4 className="text-sm font-black uppercase italic tracking-widest">Conseil ISO 9001</h4>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed italic font-bold">
                 Assurez-vous de définir des questions mesurables. Pour les fournisseurs (§8.4), privilégiez le respect des délais et la conformité technique.
              </p>
           </div>
        </div>
      </div>
    </div>
  );
}