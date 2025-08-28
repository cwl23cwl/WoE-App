// constants.ts
const isBrowser = typeof window !== 'undefined' && typeof navigator !== 'undefined';

export const IS_ANDROID = isBrowser && /\bandroid\b/i.test(navigator.userAgent);

export const IS_FIREFOX =
  isBrowser &&
  'netscape' in window &&
  navigator.userAgent.includes('rv:') &&
  navigator.userAgent.includes('Gecko');

export const IS_CHROME = isBrowser && navigator.userAgent.includes('Chrome');
