import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Smooth scroll utility function
export function smoothScrollTo(elementId: string, offset: number = 80) {
  const element = document.getElementById(elementId);
  if (element) {
    const elementPosition = element.offsetTop - offset;
    window.scrollTo({
      top: elementPosition,
      behavior: 'smooth'
    });
  }
}

// Handle anchor link clicks
export function handleAnchorClick(href: string, onClose?: () => void) {
  if (href.startsWith('#')) {
    const elementId = href.substring(1);
    smoothScrollTo(elementId);
    if (onClose) {
      onClose();
    }
    return true; // Indicates this was an anchor link
  }
  return false; // Indicates this was a regular link
}

// Re-export security utilities for easy access
export {
  sanitizeHtml,
  sanitizeInput,
  sanitizeUrl,
  escapeHtml,
  sanitizeFileName,
  RateLimiter,
  generateSecureRandomString,
  sanitizeJsonInput,
  CSRFProtection
} from './security';