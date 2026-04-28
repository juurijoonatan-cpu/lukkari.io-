import { useEffect, useState } from 'react';

/**
 * Skip the heavy mp4 bg on phones, save-data, or reduced-motion.
 * The CSS gradient fallback in proBeta.css carries the look.
 */
function shouldLoadVideo() {
  if (typeof window === 'undefined') return false;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
  if (window.matchMedia('(max-width: 720px)').matches) return false;
  const c = navigator.connection;
  if (c?.saveData) return false;
  if (c?.effectiveType && /^(slow-)?2g$/.test(c.effectiveType)) return false;
  return true;
}

export function Background({ theme }) {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    setEnabled(shouldLoadVideo());
    const mq = window.matchMedia('(max-width: 720px)');
    const onChange = () => setEnabled(shouldLoadVideo());
    mq.addEventListener?.('change', onChange);
    return () => mq.removeEventListener?.('change', onChange);
  }, []);

  return (
    <>
      {enabled && (
        <video
          key={theme}
          className="pb-bg-video"
          autoPlay loop muted playsInline
          preload="metadata"
          src={theme === 'dark' ? '/bg-dark.mp4' : '/bg-light.mp4'}
        />
      )}
      <div className="pb-bg-tint" />
    </>
  );
}
