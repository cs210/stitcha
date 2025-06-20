import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Shadcn function to combine tailwind classes
export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}
