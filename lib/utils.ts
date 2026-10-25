import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { FuelType } from './types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Calculates distance in kilometers between two GPS coordinates using Haversine formula
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

/**
 * Formats a price per liter in Euros (e.g. 1.549 €/L)
 */
export function formatPrice(price?: number, currency = '€'): string {
  if (price === undefined || price === null || isNaN(price) || price <= 0) {
    return '—';
  }
  return `${price.toFixed(3)} ${currency}/L`;
}

export function formatPriceDiff(diff?: number): { text: string; isPositive: boolean; isNeutral: boolean } {
  if (diff === undefined || diff === null || isNaN(diff)) {
    return { text: '0.00 €', isPositive: false, isNeutral: true };
  }
  const rounded = Math.round(diff * 1000) / 1000;
  if (Math.abs(rounded) < 0.001) {
    return { text: '0.00 €', isPositive: false, isNeutral: true };
  }
  if (rounded > 0) {
    return { text: `+${rounded.toFixed(3)} €`, isPositive: true, isNeutral: false };
  }
  return { text: `${rounded.toFixed(3)} €`, isPositive: false, isNeutral: false };
}

/**
 * Formats ISO date to human relative time in Lithuanian (e.g. "prieš 15 min.", "prieš 2 val.")
 */
export function formatRelativeTimeLt(isoDateString?: string): string {
  if (!isoDateString) return 'Nežinoma';
  try {
    const date = new Date(isoDateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    if (diffMs < 0) return 'Ką tik';
    
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHours = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMin < 1) return 'Ką tik';
    if (diffMin < 60) return `prieš ${diffMin} min.`;
    if (diffHours === 1) return 'prieš 1 val.';
    if (diffHours < 24) return `prieš ${diffHours} val.`;
    if (diffDays === 1) return 'vakar';
    if (diffDays < 7) return `prieš ${diffDays} d.`;
    return date.toLocaleDateString('lt-LT', { month: 'short', day: 'numeric' });
  } catch {
    return 'Nežinoma';
  }
}

export function getFuelLabel(fuelType: FuelType): { lt: string; short: string; color: string } {
  switch (fuelType) {
    case 'gasoline_95':
      return { lt: 'Benzinas 95 (A95)', short: '95', color: 'emerald' };
    case 'diesel':
      return { lt: 'Dyzelinas (B7)', short: 'D', color: 'blue' };
    case 'lpg':
      return { lt: 'Suskystintos dujos (LPG)', short: 'LPG', color: 'amber' };
    case 'gasoline_98':
      return { lt: 'Benzinas 98 (A98)', short: '98', color: 'cyan' };
    case 'diesel_plus':
      return { lt: 'Dyzelinas Plius / Žiema', short: 'D+', color: 'violet' };
    default:
      return { lt: 'Kuras', short: 'Kuras', color: 'gray' };
  }
}

export function getBrandStyle(brand: string): { bg: string; text: string; border: string; hex: string } {
  const b = brand.toLowerCase();
  if (b.includes('circle k')) {
    return { bg: 'bg-red-600/10 dark:bg-red-500/20', text: 'text-red-700 dark:text-red-400', border: 'border-red-500/30', hex: '#E11414' };
  }
  if (b.includes('neste')) {
    return { bg: 'bg-blue-600/10 dark:bg-blue-500/20', text: 'text-blue-700 dark:text-blue-400', border: 'border-blue-500/30', hex: '#005EA5' };
  }
  if (b.includes('viada')) {
    return { bg: 'bg-yellow-600/10 dark:bg-yellow-500/20', text: 'text-yellow-700 dark:text-yellow-400', border: 'border-yellow-500/30', hex: '#E5A200' };
  }
  if (b.includes('orlen')) {
    return { bg: 'bg-rose-700/10 dark:bg-rose-500/20', text: 'text-rose-700 dark:text-rose-400', border: 'border-rose-500/30', hex: '#C8102E' };
  }
  if (b.includes('baltic petroleum')) {
    return { bg: 'bg-sky-600/10 dark:bg-sky-500/20', text: 'text-sky-700 dark:text-sky-400', border: 'border-sky-500/30', hex: '#0284C7' };
  }
  if (b.includes('emsi')) {
    return { bg: 'bg-purple-600/10 dark:bg-purple-500/20', text: 'text-purple-700 dark:text-purple-400', border: 'border-purple-500/30', hex: '#8B5CF6' };
  }
  if (b.includes('saurida')) {
    return { bg: 'bg-orange-600/10 dark:bg-orange-500/20', text: 'text-orange-700 dark:text-orange-400', border: 'border-orange-500/30', hex: '#EA580C' };
  }
  if (b.includes('jozita')) {
    return { bg: 'bg-emerald-600/10 dark:bg-emerald-500/20', text: 'text-emerald-700 dark:text-emerald-400', border: 'border-emerald-500/30', hex: '#059669' };
  }
  if (b.includes('alauša')) {
    return { bg: 'bg-teal-600/10 dark:bg-teal-500/20', text: 'text-teal-700 dark:text-teal-400', border: 'border-teal-500/30', hex: '#0D9488' };
  }
  return { bg: 'bg-slate-500/10 dark:bg-slate-400/20', text: 'text-slate-700 dark:text-slate-300', border: 'border-slate-400/30', hex: '#64748B' };
}

/**
 * Exponential backoff fetcher with automatic per-request timeout protection
 */
export async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  retries = 1,
  backoffMs = 300,
  timeoutMs = 6000
): Promise<Response> {
  let attempt = 0;
  while (true) {
    let timer: NodeJS.Timeout | null = null;
    try {
      const controller = new AbortController();
      timer = setTimeout(() => {
        controller.abort(new Error(`Timeout after ${timeoutMs}ms for ${url}`));
      }, timeoutMs);

      if (options.signal) {
        options.signal.addEventListener('abort', () => controller.abort());
      }

      const response = await fetch(url, { ...options, signal: controller.signal });
      if (timer) clearTimeout(timer);

      if (!response.ok && attempt < retries && (response.status >= 500 || response.status === 429)) {
        throw new Error(`HTTP ${response.status}`);
      }
      return response;
    } catch (err) {
      if (timer) clearTimeout(timer);
      if (attempt >= retries) {
        throw err;
      }
      attempt++;
      const waitTime = backoffMs * Math.pow(2, attempt);
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }
  }
}
