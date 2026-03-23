// src/core/utils/icon.ts
import { type LucideProps } from 'lucide-react';

export type IconSize = 'sm' | 'md' | 'lg' | 'xl' | number;

export interface ResponsiveIconProps extends Omit<LucideProps, 'size'> {
  size?: IconSize;
  responsive?: boolean;
}

export const getIconSize = (size?: IconSize): number => {
  if (typeof size === 'number') return size;
  const sizes: Record<string, number> = { sm: 14, md: 16, lg: 20, xl: 24 };
  return sizes[size || 'md'];
};

export const getIconClasses = (size?: IconSize, responsive = false): string => {
  if (!responsive) return '';
  
  const classMap: Record<string, string> = {
    sm: 'w-3.5 h-3.5 md:w-4 md:h-4',
    md: 'w-4 h-4 md:w-5 md:h-5',
    lg: 'w-5 h-5 md:w-6 md:h-6',
    xl: 'w-6 h-6 md:w-7 md:h-7',
  };
  
  return typeof size === 'string' ? classMap[size] || '' : 'w-4 h-4 md:w-5 md:h-5';
};