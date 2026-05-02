// Demo-mode gate. In production, the Pro demo is hidden unless build-time
// flag VITE_ALLOW_DEMO=true is set. In dev, the demo is always available.
export const isDemoAllowed = () =>
  import.meta.env.DEV ||
  import.meta.env.VITE_ALLOW_DEMO === 'true';

export const isDemoActive = () =>
  isDemoAllowed() && localStorage.getItem('lukkari.proDemo') === '1';

export const enableDemo = () => {
  if (!isDemoAllowed()) return false;
  try { localStorage.setItem('lukkari.proDemo', '1'); } catch {}
  return true;
};

export const disableDemo = () => {
  try { localStorage.removeItem('lukkari.proDemo'); } catch {}
};
