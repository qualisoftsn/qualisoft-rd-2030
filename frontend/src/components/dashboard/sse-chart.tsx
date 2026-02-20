'use client';
/**
 * 📊 MODULE : SSE ANALYTICS CHART
 * -------------------------------------------------------------------------
 * FONCTION : Représentation graphique des incidents par catégorie.
 * RÔLE : Aide à la décision pour le Responsable SMI (ISO 45001 / 14001).
 * ISOLATION : Reçoit les données déjà filtrées par le Tenant via les hooks Master.
 */

import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Cell 
} from 'recharts';

interface SSEChartProps {
  // Structure scellée provenant de l'agrégation NestJS
  data: { type: string; _count: number }[];
}

// Palette chromatique Qualisoft Elite (Haute Visibilité)
const COLORS = ['#ef4444', '#f59e0b', '#3b82f6', '#10b981', '#6366f1', '#8b5cf6'];

export function SSEChart({ data }: SSEChartProps) {
  /**
   * 🛠️ FORMATEUR DE DONNÉES KERNEL
   * Nettoie les énumérations système (SNAKE_CASE) pour un affichage humain.
   */
  const formattedData = data.map(item => ({
    name: item.type.replace(/_/g, ' '),
    total: item._count
  }));

  // Gestion de l'état "Registre Vierge"
  if (data.length === 0) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-slate-50/50 rounded-3xl border border-dashed border-slate-200">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Aucune donnée SSE enregistrée</p>
      </div>
    );
  }

  return (
    <div className="h-87.5 w-full animate-in fade-in duration-1000">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={formattedData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          {/* Grille de structure horizontale uniquement */}
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          
          <XAxis 
            dataKey="name" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#64748b', fontSize: 10, fontWeight: 900, textTransform: 'uppercase' }} 
            dy={10}
          />
          
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }} 
          />
          
          <Tooltip 
            cursor={{ fill: '#f8fafc' }}
            contentStyle={{ 
              borderRadius: '1.5rem', 
              border: 'none', 
              boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
              fontSize: '11px',
              fontWeight: 900,
              textTransform: 'uppercase',
              fontStyle: 'italic'
            }}
          />
          
          <Bar dataKey="total" radius={[8, 8, 0, 0]} barSize={40}>
            {formattedData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}