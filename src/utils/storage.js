const KEY = "lukkari.v1";

export function loadState() {
  try { const r = localStorage.getItem(KEY); return r ? JSON.parse(r) : null; } catch { return null; }
}

export function saveState(s) {
  try { localStorage.setItem(KEY, JSON.stringify(s)); } catch {}
}

export function clearStoredSelections() {
  try {
    const r = loadState();
    if (r) { r.selections = {}; localStorage.setItem(KEY, JSON.stringify(r)); }
  } catch {}
}

const PRO_KEY = "lukkari.pro.key";
export const getProKey   = () => { try { return localStorage.getItem(PRO_KEY); } catch { return null; } };
export const setProKey   = (k) => { try { localStorage.setItem(PRO_KEY, k); } catch {} };
export const clearProKey = () => { try { localStorage.removeItem(PRO_KEY); } catch {} };

