import { Music, Pause } from "lucide-react";
import { forwardRef, useImperativeHandle, useRef, useState } from "react";

export type MusicPlayerHandle = {
  /** Debe llamarse dentro del toque del usuario para que el celular permita el sonido. */
  play: () => void;
};

type MusicPlayerProps = {
  src: string;
};

/** Música de fondo con un botón flotante para pausarla o reanudarla. */
export const MusicPlayer = forwardRef<MusicPlayerHandle, MusicPlayerProps>(({ src }, ref) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [started, setStarted] = useState(false);

  const play = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = 0.6;
    setStarted(true);
    void audio.play().catch(() => setPlaying(false));
  };

  useImperativeHandle(ref, () => ({ play }));

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) play();
    else audio.pause();
  };

  return (
    <div className="print:hidden">
      <audio
        ref={audioRef}
        src={src}
        loop
        preload="auto"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      />
      {started ? (
        <button
          type="button"
          onClick={toggle}
          aria-label={playing ? "Pausar música" : "Poner música"}
          aria-pressed={playing}
          className="fixed bottom-4 right-4 z-40 flex h-11 w-11 items-center justify-center rounded-full border border-line bg-card text-navy shadow-[var(--shadow-lift)] transition-colors hover:bg-sky"
        >
          {playing ? (
            <Pause className="h-4 w-4" strokeWidth={1.5} />
          ) : (
            <Music className="h-5 w-5" strokeWidth={1.5} />
          )}
          {playing ? (
            <span
              aria-hidden="true"
              className="absolute inset-0 animate-ping rounded-full border border-navy/30"
            />
          ) : null}
        </button>
      ) : null}
    </div>
  );
});

MusicPlayer.displayName = "MusicPlayer";

export default MusicPlayer;
