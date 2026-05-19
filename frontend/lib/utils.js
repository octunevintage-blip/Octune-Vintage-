import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const formatINR = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

export const hoursLeftToDelete = (deleteAtDate) => {
  if (!deleteAtDate) return 0;
  const msLeft = new Date(deleteAtDate).getTime() - Date.now();
  if (msLeft <= 0) return 0;
  return Math.ceil(msLeft / (1000 * 60 * 60));
};

export const CATEGORIES = [
  'Jackets', 
  'Windbreakers', 
  'Tracktops', 
  'Trackpants', 
  'Jerseys', 
  'Shorts'
];
