// Demo-mode gate. Demo is always public — any visitor can try it.
export const isDemoAllowed = () => true;

export const isDemoActive = () => {
  try { return localStorage.getItem('lukkari.proDemo') === '1'; } catch { return false; }
};

export const enableDemo = () => {
  try { localStorage.setItem('lukkari.proDemo', '1'); } catch {}
  return true;
};

export const disableDemo = () => {
  try { localStorage.removeItem('lukkari.proDemo'); } catch {}
};
