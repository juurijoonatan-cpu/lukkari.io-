import { useEffect, useRef } from 'react';

/**
 * Always render the bg video and explicitly kick `.play()` — desktop Chrome
 * regularly stalls muted autoplay when `preload` only fetched metadata,
 * which is why the demo looked frozen on desktop while phones (which use
 * different autoplay heuristics) worked fine.
 *
 * We intentionally don't gate on `prefers-reduced-motion` here: the user
 * explicitly wants the Pro demo alive on every device. The OS-level
 * accessibility setting still slows down the animations (see proBeta.css)
 * but we keep the video and the wash visible so the page never looks dead.
 */
function kick(v) {
  if (!v) return;
  const p = v.play();
  if (p && typeof p.catch === 'function') p.catch(() => {});
}

export function Background({ theme, playbackRate = 0.5 }) {
  const videoRef = useRef(null);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.playbackRate = playbackRate;
    const apply = () => { v.playbackRate = playbackRate; };
    v.addEventListener('loadedmetadata', apply);
    v.addEventListener('play', apply);
    kick(v);
    const onVis = () => { if (!document.hidden) kick(v); };
    document.addEventListener('visibilitychange', onVis);
    return () => {
      v.removeEventListener('loadedmetadata', apply);
      v.removeEventListener('play', apply);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, [theme, playbackRate]);

  return (
    <>
      {/* Always-on animated gradient wash — sits behind the bg video so the
          page breathes even before the heavy mp4 finishes buffering on
          slow desktop networks. */}
      <div className="pb-bg-wash" aria-hidden="true" />
      <video
        ref={videoRef}
        key={theme}
        className="pb-bg-video"
        autoPlay loop muted playsInline
        preload="auto"
        disablePictureInPicture
        src={theme === 'dark' ? '/bg-dark.mp4' : '/bg-light.mp4'}
      />
      <div className="pb-bg-tint" />
    </>
  );
}
