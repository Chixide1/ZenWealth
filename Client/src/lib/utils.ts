import {type ClassValue, clsx} from "clsx"
import {twMerge} from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function camelCaseToSentence(text: string) {
  // Step 1: Add space before capital letters
  const withSpaces = text.replace(/([A-Z])/g, ' $1');

  // Step 2: Capitalize the first letter and trim any leading space
  return withSpaces.charAt(0).toUpperCase() + withSpaces.slice(1).trim();
}

export const currencyParser = new Intl.NumberFormat(["en-US", "en-GB"], {
  style: "currency",
  currency: "GBP",
  currencyDisplay: "symbol",
})