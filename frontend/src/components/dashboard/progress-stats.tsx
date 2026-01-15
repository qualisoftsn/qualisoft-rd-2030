'use client';

export function ProgressStats({ total, done }: { total: number, done: number }) {
  const percentage = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
      <div className="flex justify-between items-end mb-4">
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Taux de réalisation</p>
          <h3 className="text-4xl font-black text-slate-900">{percentage}%</h3>
        </div>
        <p className="text-sm font-bold text-slate-500">{done} sur {total} actions levées</p>
      </div>
      
      {/* Barre de progression stylisée */}
      <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden">
        <div 
          className="h-full bg-blue-600 rounded-full transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(37,99,235,0.4)]"
          style={{ width: `${percentage}%` }}
        />
      </div>

      <div className="grid grid-cols-2 gap-4 mt-8">
        <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
          <p className="text-[10px] font-bold text-emerald-600 uppercase">Clôturées (Done)</p>
          <p className="text-xl font-black text-emerald-700">{done}</p>
        </div>
        <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100">
          <p className="text-[10px] font-bold text-amber-600 uppercase">En cours (Pending)</p>
          <p className="text-xl font-black text-amber-700">{total - done}</p>
        </div>
      </div>
    </div>
  );
}