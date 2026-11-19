import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
/** Merge conditional class names; a later conflicting utility wins (same helper as the Console's). */
export function cn(...inputs) {
    return twMerge(clsx(inputs));
}
