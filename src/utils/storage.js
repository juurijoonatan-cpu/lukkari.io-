const KEY = "lukkari.v1";

export function safeGetItem(key) {
  try { return localStorage.getItem(key); } catch { return null; }
}

export function safeSetItem(key, value) {
  try { localStorage.setItem(key, value); return true; } catch { return false; }
}

export function safeRemoveItem(key) {
  try { localStorage.removeItem(key); } catch {}
}

export function safeGetJSON(key, fallback = null) {
  const raw = safeGetItem(key);
  if (raw == null) return fallback;
  try { return JSON.parse(raw); } catch { return fallback; }
}

export function loadState() {
  return safeGetJSON(KEY, null);
}

export function saveState(s) {
  try { safeSetItem(KEY, JSON.stringify(s)); } catch {}
}

export function clearStoredSelections() {
  const r = loadState();
  if (r) { r.selections = {}; safeSetItem(KEY, JSON.stringify(r)); }
}
