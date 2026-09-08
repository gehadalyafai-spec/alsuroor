let globalQuotaExceeded = false;
// For daily quotas (e.g. Free daily write units per project), cooldown should be at least 6 hours
const DAILY_QUOTA_COOLDOWN_MS = 6 * 60 * 60 * 1000;
const BURST_QUOTA_COOLDOWN_MS = 15 * 60 * 1000; // 15 minutes for temporary bursts

export const FIRESTORE_UPGRADE_URL = 'https://console.firebase.google.com/project/precise-vision-96pck/firestore/databases/ai-studio-b319ae41-44db-44a9-a12e-dfa10b3349b3/data?openUpgradeDialog=true';
export const FIRESTORE_PRICING_URL = 'https://firebase.google.com/pricing#cloud-firestore';

export function markQuotaExceeded(isDaily: boolean = true): void {
  globalQuotaExceeded = true;
  try {
    localStorage.setItem('quran_firestore_quota_time', String(Date.now()));
    localStorage.setItem('quran_firestore_quota_is_daily', isDaily ? 'true' : 'false');
  } catch {}
}

export function resetQuotaExceeded(): void {
  globalQuotaExceeded = false;
  try {
    localStorage.removeItem('quran_firestore_quota_time');
    localStorage.removeItem('quran_firestore_quota_is_daily');
    localStorage.removeItem('quran_firestore_quota_exceeded');
  } catch {}
}

export function isDailyQuotaExceeded(): boolean {
  try {
    const isDaily = localStorage.getItem('quran_firestore_quota_is_daily') === 'true';
    return isQuotaExceeded() && isDaily;
  } catch {
    return false;
  }
}

export function isQuotaExceeded(): boolean {
  try {
    if (localStorage.getItem('quran_firestore_quota_exceeded') === 'true') {
      localStorage.removeItem('quran_firestore_quota_exceeded');
    }
    const timeStr = localStorage.getItem('quran_firestore_quota_time');
    if (timeStr) {
      const time = parseInt(timeStr, 10);
      const isDaily = localStorage.getItem('quran_firestore_quota_is_daily') === 'true';
      const cooldown = isDaily ? DAILY_QUOTA_COOLDOWN_MS : BURST_QUOTA_COOLDOWN_MS;
      if (Date.now() - time < cooldown) {
        return true;
      } else {
        resetQuotaExceeded();
        return false;
      }
    }
  } catch {
    return false;
  }
  return globalQuotaExceeded;
}

export function handleFirestoreError(err: any): boolean {
  if (!err) return false;
  const msg = (err.message || err.code || String(err)).toLowerCase();
  
  const isDaily = 
    msg.includes('daily write units') || 
    msg.includes('daily read units') || 
    msg.includes('free daily') || 
    msg.includes('quota metric') ||
    msg.includes('free tier database');

  if (
    msg.includes('resource-exhausted') ||
    msg.includes('quota limit exceeded') ||
    msg.includes('quota exceeded') ||
    msg.includes('write stream exhausted') ||
    msg.includes('timeout') ||
    isDaily
  ) {
    markQuotaExceeded(isDaily);
    return true;
  }
  return false;
}


