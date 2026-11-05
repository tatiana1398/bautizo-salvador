import { Music, X } from "lucide-react";
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";

type YTPlayer = {
  playVideo: () => void;
  pauseVideo: () => void;
  setVolume: (volume: number) => void;
};

declare global {
  interface Window {
    YT?: {
      Player: new (element: HTMLElement, options: Record<string, unknown>) => YTPlayer;
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

export type MusicPlayerHandle = {
  /** Debe llamarse dentro del toque del usuario para que el celular permita el sonido. */
  play: () => void;
};

type MusicPlayerProps = {
  videoId: string;
};

const loadYouTubeApi = () =>
  new Promise<void>((resolve) => {
    if (window.YT?.Player) return resolve();
    const previous = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      previous?.();
      resolve();
    };
    if (!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
      const script = document.createElement("script");
      script.src = "https://www.youtube.com/iframe_api";
      document.head.appendChild(script);
    }
  });

/**
 * Música de fondo desde YouTube. YouTube exige que el reproductor sea visible
 * (mínimo 200 × 200 px) mientras suena, así que se muestra en una esquina y se puede cerrar.
 */
export const MusicPlayer = forwardRef<MusicPlayerHandle, MusicPlayerProps>(({ videoId }, ref) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<YTPlayer | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void loadYouTubeApi().then(() => {
      if (cancelled || !mountRef.current || !window.YT) return;
      playerRef.current = new window.YT.Player(mountRef.current, {
        videoId,
        width: "100%",
        height: "100%",
        playerVars: {
          loop: 1,
          playlist: videoId,
          playsinline: 1,
          rel: 0,
          modestbranding: 1,
        },
        events: {
          onReady: () => playerRef.current?.setVolume(60),
        },
      });
    });
    return () => {
      cancelled = true;
    };
  }, [videoId]);

  useImperativeHandle(ref, () => ({
    play: () => {
      setVisible(true);
      playerRef.current?.playVideo();
    },
  }));

  const close = () => {
    playerRef.current?.pauseVideo();
    setVisible(false);
  };

  const reopen = () => {
    setVisible(true);
    playerRef.current?.playVideo();
  };

  return (
    <div className="print:hidden">
      <div
        className={`fixed bottom-4 right-4 z-40 h-[200px] w-[200px] overflow-hidden border border-line bg-card shadow-[var(--shadow-lift)] transition-opacity duration-500 ${
          visible ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <div ref={mountRef} className="h-full w-full" />
        <button
          type="button"
          onClick={close}
          aria-label="Cerrar música"
          className="absolute right-1 top-1 flex h-7 w-7 items-center justify-center rounded-full bg-navy/80 text-white transition-colors hover:bg-navy"
        >
          <X className="h-4 w-4" strokeWidth={1.5} />
        </button>
      </div>

      {visible ? null : (
        <button
          type="button"
          onClick={reopen}
          aria-label="Poner música"
          className="fixed bottom-4 right-4 z-40 flex h-11 w-11 items-center justify-center rounded-full border border-line bg-card text-navy shadow-[var(--shadow-lift)] transition-colors hover:bg-sky"
        >
          <Music className="h-5 w-5" strokeWidth={1.5} />
        </button>
      )}
    </div>
  );
});

MusicPlayer.displayName = "MusicPlayer";

export default MusicPlayer;
