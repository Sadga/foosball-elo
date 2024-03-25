import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { camelize, getCurrentInstance, toHandlerKey } from 'vue';

export function cn (...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function initials (name: string) {
  const initials = [...name.matchAll(/(\p{L}{1})\p{L}+/gu)] || [];

  return ((initials.shift()?.[1] || '') + (initials.pop()?.[1] || '')).toUpperCase();
}
