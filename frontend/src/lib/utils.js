import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merges Tailwind CSS classes, resolving conflicts using tailwind-merge.
 * Useful for building reusable UI components with flexible styling.
 * 
 * @param {...(string|Object|Array)} inputs - Class names, conditionally applied classes, or arrays of classes.
 * @returns {string} The merged and conflict-resolved class string.
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
