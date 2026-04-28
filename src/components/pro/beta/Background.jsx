import { useEffect, useRef, useState } from 'react';

/**
 * Load the bg video for everyone except users who explicitly opted out:
 *  - prefers-reduced-motion
 *  - Save-Data header
 *  - 2g connection
 * Phones now get it too (per design request).
 */
function shouldLoadVideo() {
  if (typeof window === 'undefined') return false;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
  const c = navigator.connection;
  if (c?.saveData) return false;
  if (c?.effectiveType && /^(slow-)?2g$/.test(c.effectiveType)) return false;
  return true;
}

export function Background({ theme, playbackRate = 0.5 }) {
  const [enabled, setEnabled] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => {
    setEnabled(shouldLoadVideo());
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = () => setEnabled(shouldLoadVideo());
    mq.addEventListener?.('change', onChange);
    return () => mq.removeEventListener?.('change', onChange);
  }, []);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.playbackRate = playbackRate;
    const apply = () => { v.playbackRate = playbackRate; };
    v.addEventListener('loadedmetadata', apply);
    v.addEventListener('play', apply);
    return () => {
      v.removeEventListener('loadedmetadata', apply);
      v.removeEventListener('play', apply);
    };
  }, [enabled, theme, playbackRate]);

  return (
    <>
      {enabled && (
        <video
          ref={videoRef}
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
