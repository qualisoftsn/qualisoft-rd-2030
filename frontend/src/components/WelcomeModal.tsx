import React from 'react';

interface WelcomeModalProps {
  userName: string;
  onClose: () => void;
}

export default function WelcomeModal({ userName, onClose }: WelcomeModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-9999">
      <div className="bg-white p-8 rounded-xl shadow-2xl max-w-md text-center">
        <div className="text-5xl mb-4">🚀</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Bienvenue, {userName} !
        </h2>
        <p className="text-gray-600 mb-6">
          Votre instance <strong>Qualisoft Elite</strong> est prête. Nous avons configuré votre siège social et vos accès administrateur.
        </p>
        <button 
          onClick={onClose}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors"
        >
          C&apos;est parti, je commence !
        </button>
      </div>
    </div>
  );
}