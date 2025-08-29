/**
 * Core Utils Module
 * Utility functions and helpers
 */

export function formatDate(date: Date): string {
  return date.toISOString();
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
