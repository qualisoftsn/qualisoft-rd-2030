"use client"
import { useState } from 'react';
import { useOnboarding } from '../../hooks/useOnboarding';

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const { completeOnboarding } = useOnboarding();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    companyName: '',
    sector: 'SERVICES',
    //primaryGoal: 'CERTIFICATION'
  });

  const handleNext = () => setStep((s) => s + 1);
  
  const handleSubmit = async () => {
    setLoading(true);
    await completeOnboarding(formData);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="bg-white max-w-md w-full rounded-3xl shadow-xl p-10">
        
        {/* Progress Bar */}
        <div className="mb-10">
          <div className="flex justify-between text-xs font-bold text-slate-400 uppercase mb-2">
            <span>Étape {step} / 3</span>
            <span>{step === 1 ? 'Identité' : step === 2 ? 'Organisation' : 'Finalisation'}</span>
          </div>
          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-600 transition-all duration-500" 
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>
        </div>

        {/* STEP 1: Accès Sécurisé */}
        {step === 1 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-900">Créez votre accès Elite</h2>
            <div className="space-y-4">
              <input 
                type="text" placeholder="Prénom & Nom" 
                className="w-full p-4 border rounded-xl focus:ring-2 focus:ring-blue-600 outline-none"
                onChange={(e) => setFormData({...formData, firstName: e.target.value})}
              />
              <input 
                type="email" placeholder="Email professionnel" 
                className="w-full p-4 border rounded-xl focus:ring-2 focus:ring-blue-600 outline-none"
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
              <input 
                type="password" placeholder="Mot de passe" 
                className="w-full p-4 border rounded-xl focus:ring-2 focus:ring-blue-600 outline-none"
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
            </div>
            <button 
              onClick={handleNext}
              className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-100"
            >
              Continuer
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-900">Votre Entreprise</h2>
            <div className="space-y-4">
              <input 
                type="text" placeholder="Nom de l'organisation" 
                className="w-full p-4 border rounded-xl focus:ring-2 focus:ring-blue-600 outline-none"
                onChange={(e) => setFormData({...formData, companyName: e.target.value})}
              />
              <select 
                className="w-full p-4 border rounded-xl outline-none"
                onChange={(e) => setFormData({...formData, sector: e.target.value})}
              >
                <option value="SERVICES">Services / Conseil</option>
                <option value="LOGISTICS">Logistique & Transport</option>
                <option value="HEALTH">Santé / Pharma</option>
                <option value="CONSTRUCTION">BTP / Industrie</option>
                <option value="MINING">Mines & Énergie</option>
              </select>
            </div>
            <button 
              onClick={handleNext}
              className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 transition"
            >
              Dernière étape
            </button>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <div className="text-center">
              <div className="text-5xl mb-4">💎</div>
              <h2 className="text-2xl font-bold text-slate-900">Prêt pour l&apos;expérience Elite ?</h2>
              <p className="text-slate-500 mt-2">Nous allons configurer votre environnement multi-tenant sécurisé.</p>
            </div>
            <button 
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-green-600 text-white py-4 rounded-xl font-bold hover:bg-green-700 transition shadow-lg shadow-green-100"
            >
              {loading ? "Déploiement en cours..." : "Activer mon accès gratuit"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}