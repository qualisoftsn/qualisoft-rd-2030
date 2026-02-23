import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * 🛠️ UTILITAIRE : FUSION DE CLASSES TACTIQUES
 * @description Combine clsx et tailwind-merge pour éviter les doublons CSS.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}