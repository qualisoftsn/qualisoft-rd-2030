import { LucideIcon } from 'lucide-react';
import { clsx } from 'clsx';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  trend?: string;
  variant: 'danger' | 'warning' | 'success' | 'info';
}

export function StatCard({ title, value, icon: Icon, trend, variant }: StatCardProps) {
  const styles = {
    danger: 'bg-red-50 text-red-700 border-red-100',
    warning: 'bg-amber-50 text-amber-700 border-amber-100',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    info: 'bg-blue-50 text-blue-700 border-blue-100',
  };

  return (
    <div className={clsx('p-6 rounded-xl border shadow-sm transition-all hover:shadow-md', styles[variant])}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium opacity-80 uppercase tracking-wider">{title}</p>
          <h3 className="text-3xl font-bold mt-1">{value}</h3>
          {trend && <p className="text-xs mt-2 font-semibold">{trend}</p>}
        </div>
        <div className={clsx('p-3 rounded-lg bg-white/50')}>
          <Icon size={28} />
        </div>
      </div>
    </div>
  );
}