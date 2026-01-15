// frontend/app/(marketing)/page.tsx
import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      {/* 1. NAVIGATION SIMPLE */}
      <nav className="flex justify-between items-center py-6 px-10 border-b">
        <div className="text-2xl font-bold text-blue-600">Qualisoft <span className="text-slate-400">Elite</span></div>
        <div className="space-x-8 font-medium text-slate-600">
          <Link href="#features" className="hover:text-blue-600">Fonctionnalités</Link>
          <Link href="#pricing" className="hover:text-blue-600">Tarifs</Link>
          <Link href="/login" className="px-5 py-2 rounded-lg border border-blue-600 text-blue-600 hover:bg-blue-50">Connexion</Link>
        </div>
      </nav>

      {/* 2. HERO SECTION : LA PROMESSE */}
      <section className="pt-20 pb-24 px-6 max-w-6xl mx-auto text-center">
        <h1 className="text-6xl font-extrabold leading-tight mb-6">
          Votre Conformité ISO 9001 sur <br />
          <span className="bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Pilote Automatique.
          </span>
        </h1>
        <p className="text-xl text-slate-500 mb-10 max-w-3xl mx-auto">
          La plateforme QHSE n°1 en Afrique de l&apos;Ouest qui transforme vos contraintes réglementaires 
          en leviers de performance. Sans Excel, sans stress.
        </p>
        <div className="flex justify-center gap-4">
          <Link href="/onboarding" className="bg-blue-600 text-white px-10 py-5 rounded-xl text-lg font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all hover:scale-105">
            Démarrer mon essai Elite gratuit
          </Link>
        </div>
        <p className="mt-4 text-sm text-slate-400">Essai de 14 jours — Aucune carte bancaire requise</p>
      </section>

      {/* 3. SECTION PREUVE SOCIALE / CONFIANCE */}
      
      <section id="features" className="py-20 bg-slate-50">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-3 gap-12">
          <div className="bg-white p-8 rounded-2xl shadow-sm">
            <div className="text-3xl mb-4">🛡️</div>
            <h3 className="text-xl font-bold mb-3">Zéro Risque Fuite</h3>
            <p className="text-slate-500">Isolation multi-tenant stricte. Vos données industrielles sont dans un coffre-fort numérique.</p>
          </div>
          <div className="bg-white p-8 rounded-2xl shadow-sm border-t-4 border-blue-600">
            <div className="text-3xl mb-4">📊</div>
            <h3 className="text-xl font-bold mb-3">Dashboard &quot;Pulse&quot;</h3>
            <p className="text-slate-500">Visualisez votre niveau de conformité en temps réel. Soyez prêt pour l&apos;audit à chaque instant.</p>
          </div>
          <div className="bg-white p-8 rounded-2xl shadow-sm">
            <div className="text-3xl mb-4">👷</div>
            <h3 className="text-xl font-bold mb-3">Module SSE Terrain</h3>
            <p className="text-slate-500">Déclarez les incidents depuis vos chantiers sur tablette. Réactivité maximale.</p>
          </div>
        </div>
      </section>

      {/* 4. SECTION PRICING : LE PIVOT BUSINESS */}
      <section id="pricing" className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-16">Choisissez votre niveau d&apos;ambition</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {/* PACK FREE */}
            <div className="p-10 border rounded-3xl text-left hover:border-blue-200 transition">
              <h3 className="text-xl font-bold mb-2">Pack FREE</h3>
              <p className="text-slate-400 mb-6">Pour les petites structures</p>
              <div className="text-4xl font-bold mb-8">0 FCFA <span className="text-sm font-normal text-slate-400">/mois</span></div>
              <ul className="space-y-4 mb-10 text-slate-600">
                <li>✓ Jusqu&apos;à 3 processus</li>
                <li>✓ Gestion documentaire de base</li>
                <li className="text-slate-300">✕ Module Risques & Opportunités</li>
                <li className="text-slate-300">✕ Rapports PDF automatiques</li>
              </ul>
              <Link href="/onboarding" className="block text-center py-3 rounded-lg border border-slate-200 font-semibold hover:bg-slate-50">S&apos;inscrire</Link>
            </div>

            {/* PACK ELITE */}
            <div className="p-10 bg-slate-900 text-white rounded-3xl text-left transform md:-translate-y-4 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-blue-600 text-xs font-bold px-4 py-1 rounded-bl-lg uppercase">Recommandé</div>
              <h3 className="text-xl font-bold mb-2">Pack ELITE</h3>
              <p className="text-slate-400 mb-6">Pour les leaders du marché</p>
              <div className="text-4xl font-bold mb-8">Sur Devis</div>
              <ul className="space-y-4 mb-10 text-slate-200">
                <li>✓ Processus illimités</li>
                <li>✓ Module Risques complet</li>
                <li>✓ Exports PDF & Rapports de Direction</li>
                <li>✓ Support Premium 24/7</li>
              </ul>
              <Link href="/onboarding" className="block text-center py-4 rounded-xl bg-blue-600 font-bold hover:bg-blue-500 transition">Essayer ELITE gratuitement</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}