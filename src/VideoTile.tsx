import { useEffect, useRef, useState } from "react";
import type { Aspect } from "./data";

// Only one tile plays with sound at a time.
let audible: HTMLVideoElement | null = null;
const takeSound = (v: HTMLVideoElement) => {
  if (audible && audible !== v) {
    audible.muted = true;
    // tap-to-play tiles stop entirely when another takes the sound
    if (audible.dataset.manual) audible.pause();
  }
  audible = v;
  v.muted = false;
};

const SoundIcon = ({ on }: { on: boolean }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <path d="M11 5 6 9H2v6h4l5 4V5z" />
    {on ? <path d="M15.5 8.5a5 5 0 0 1 0 7M19 5a10 10 0 0 1 0 14" /> : <path d="m22 9-6 6M16 9l6 6" />}
  </svg>
);
const PlayIcon = ({ on }: { on: boolean }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    {on ? <path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z" /> : <path d="M8 5.5v13a.6.6 0 0 0 .9.5l10.2-6.5a.6.6 0 0 0 0-1L8.9 5a.6.6 0 0 0-.9.5z" />}
  </svg>
);

type Props = {
  id: string; aspect: Aspect; title: string; className?: string;
  src?: string; poster?: string;
  autoplay?: boolean;  // false: poster until tapped, then plays with sound
};

export function VideoTile({ id, aspect, title, className = "", src, poster, autoplay = true }: Props) {
  const ref = useRef<HTMLButtonElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const el = ref.current, v = video.current;
    if (!el || !v) return;
    // autoplay tiles run muted while mostly in view; every tile stops when it leaves
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && autoplay) v.play().catch(() => {});
      else if (!e.isIntersecting) { v.pause(); v.muted = true; }
    }, { threshold: autoplay ? 0.55 : 0 });
    io.observe(el);
    const sync = () => { setMuted(v.muted); setPlaying(!v.paused); };
    ["volumechange", "play", "pause"].forEach(ev => v.addEventListener(ev, sync));
    return () => { io.disconnect(); ["volumechange", "play", "pause"].forEach(ev => v.removeEventListener(ev, sync)); };
  }, [autoplay]);

  // tap-to-play tiles preview silently on hover (mouse/trackpad only; phones keep tap-to-play)
  const canHover = () => matchMedia("(hover: hover) and (pointer: fine)").matches;
  const previewStart = () => {
    const v = video.current;
    if (autoplay || !v || !canHover() || !v.paused) return;
    v.muted = true;
    v.play().catch(() => {});
  };
  const previewEnd = () => {
    const v = video.current;
    if (autoplay || !v || !v.muted) return; // a clip playing with sound keeps going
    v.pause();
  };

  const toggle = () => {
    const v = video.current;
    if (!v) return;
    if (!autoplay) {
      // paused or silent hover preview → play with sound; playing with sound → pause
      if (v.paused || v.muted) { takeSound(v); v.play().catch(() => {}); }
      else v.pause();
    } else if (v.muted) {
      takeSound(v);
      v.currentTime = 0;
      v.play().catch(() => {});
    } else {
      v.muted = true;
    }
  };

  const label = autoplay
    ? (muted ? `Play ${title} with sound` : `Mute ${title}`)
    : (playing && !muted ? `Pause ${title}` : `Play ${title} with sound`);

  return (
    <button ref={ref} className={`media ${className}`} data-ar={aspect} onClick={toggle} aria-label={label}
            onMouseEnter={previewStart} onMouseLeave={previewEnd}>
      <video ref={video} muted loop playsInline preload="none" poster={poster ?? `/media/${id}.jpg`}
             data-manual={autoplay ? undefined : "1"}>
        <source src={src ?? `/media/${id}.mp4`} type="video/mp4" />
      </video>
      {autoplay
        ? <span className="sound icon"><SoundIcon on={!muted} /></span>
        : <span className={`sound${playing ? "" : " icon"}`}>
            {playing && muted ? <SoundIcon on={false} /> : <PlayIcon on={playing} />}{playing && title}
          </span>}
    </button>
  );
}
