import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const categories = [
  "Bank fees",
  "Home improvement",
  "Rent & utilities",
  "Entertainment",
  "Income",
  "Transfer in",
  "Food & drink",
  "Loan payments",
  "Transfer out",
  "General merchandise",
  "Medical",
  "Transportation",
  "General services",
  "Personal care",
  "Travel",
  "Government & non-profit"
];