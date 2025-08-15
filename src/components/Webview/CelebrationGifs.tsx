import React, { useEffect, useRef, useState } from "react";
import { GiphyFetch } from "@giphy/js-fetch-api";

interface GifData {
  id: string | number;
  url: string;
  width: number;
  height: number;
}

interface CelebrationGifsProps {
  isVisible: boolean;
  onComplete?: () => void;
}

const CelebrationGifs: React.FC<CelebrationGifsProps> = ({
  isVisible,
  onComplete,
}) => {
  const [gifs, setGifs] = useState<GifData[]>([]);
  const [selectedGif, setSelectedGif] = useState<GifData | null>(null);

  // Data URL prepared from the selected GIF — we only render once this is ready
  const [preparedDataUrl, setPreparedDataUrl] = useState<string | null>(null);

  // Keep sound from playing repeatedly in the same session
  const [hasPlayedSound, setHasPlayedSound] = useState(false);

  // Abort controller to cancel pending fetches when visibility toggles/unmounts
  const abortRef = useRef<AbortController | null>(null);

  const gf = new GiphyFetch("Di6sZg5SfZYwsfb5wvzjqOEjkp7Pzida");

  // Helper: convert remote URL → Blob → DataURL
  const toDataURL = async (
    url: string,
    signal?: AbortSignal
  ): Promise<string> => {
    const res = await fetch(url, {
      signal,
      credentials: "omit",
      cache: "force-cache",
    });
    if (!res.ok) throw new Error(`Failed to fetch image: ${res.status}`);
    const blob = await res.blob();
    // Use FileReader for widest compatibility
    const dataUrl: string = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error("FileReader failed"));
      reader.readAsDataURL(blob);
    });
    return dataUrl;
  };

  // Fetch a batch of GIFs (or use cached) → pick one → prefetch and convert to dataURL
  const prepareGif = async () => {
    // Cancel any prior work
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      let pool = gifs;
      if (!pool.length) {
        const result = await gf.search("mario luigi mansion sonic", {
          rating: "g",
          type: "gifs",
        });
        const mapped: GifData[] = result.data.map((gif: any) => ({
          id: gif.id,
          url: gif.images.fixed_height.url,
          width: Number(gif.images.fixed_height.width),
          height: Number(gif.images.fixed_height.height),
        }));
        pool = mapped;
        setGifs(mapped);
      }

      if (!pool.length) {
        console.warn("🎉 CelebrationGifs: No GIFs found.");
        setSelectedGif(null);
        setPreparedDataUrl(null);
        return;
      }

      const pick = pool[Math.floor(Math.random() * pool.length)];
      setSelectedGif(pick);

      // Prefetch + convert to dataURL
      const dataUrl = await toDataURL(pick.url, controller.signal);
      // If we were aborted in the meantime, bail
      if (controller.signal.aborted) return;

      setPreparedDataUrl(dataUrl);
    } catch (err: any) {
      if (err?.name === "AbortError") {
        // Swallow aborts
        return;
      }
      console.error(
        "❌ CelebrationGifs: prepareGif failed:",
        err?.message || err
      );
      setSelectedGif(null);
      setPreparedDataUrl(null);
    }
  };

  // Kick off preparation ONLY when we become visible
  useEffect(() => {
    if (isVisible) {
      setPreparedDataUrl(null); // ensure we don't flash previous frame
      setHasPlayedSound(false); // allow sound to play for this session
      void prepareGif();
    } else {
      // Clean up & reset when hidden
      if (abortRef.current) abortRef.current.abort();
      setPreparedDataUrl(null);
      setSelectedGif(null);
      setHasPlayedSound(false);
    }
    // Cleanup on unmount
    return () => {
      if (abortRef.current) abortRef.current.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isVisible]);

  // Play victory sound AFTER dataURL is ready (i.e., first paint of animation)
  useEffect(() => {
    if (isVisible && preparedDataUrl && !hasPlayedSound) {
      const audio = new Audio("/audio/victory.wav"); // ensure this path exists in your app
      audio.volume = 0.7;
      audio
        .play()
        .catch((e) =>
          console.log("🎉 CelebrationGifs: Audio play failed:", e?.message)
        );
      setHasPlayedSound(true);
    }
  }, [isVisible, preparedDataUrl, hasPlayedSound]);

  // Auto-hide 5s after the animation starts (i.e., after dataURL is ready)
  useEffect(() => {
    if (isVisible && preparedDataUrl) {
      const timer = setTimeout(() => onComplete?.(), 5000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, preparedDataUrl, onComplete]);

  // Display NOTHING until the dataURL is fully prepared
  if (!isVisible || !preparedDataUrl || !selectedGif) return null;

  return (
    <div className="celebration-gifs-overlay" aria-hidden>
      <div className="celebration-gifs-container">
        <div className="celebration-gif">
          <img
            src={preparedDataUrl} // ✅ Data URL only
            alt="Celebration!"
            width={selectedGif.width}
            height={selectedGif.height}
          />
        </div>
      </div>

      <style>{`
        .celebration-gifs-overlay {
          position: fixed;
          inset: 0;
          background: transparent;
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
          pointer-events: none; /* don't block clicks */
        }

        .celebration-gifs-container {
          position: relative;
          width: 100%;
          height: 100%;
          overflow: hidden;
        }

        .celebration-gif {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          animation: celebrationEntrance 3.5s cubic-bezier(0.25,0.46,0.45,0.94) forwards;
          opacity: 0; /* start hidden, fade in via animation */
          will-change: transform, opacity;
        }

        .celebration-gif img {
          border-radius: 16px;
          border: 4px solid rgba(255, 255, 255, 0.9);
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.3);
          max-width: 95vw;
          max-height: 95vh;
        }

        @keyframes celebrationEntrance {
          0% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(5.0) rotate(0deg);
          }
          80% {
            opacity: 1; /* visible during most of the animation */
            transform: translate(-50%, -50%) scale(1.0) rotate(360deg);
          }
          100% {
            opacity: 0; /* fade out at the end */
            transform: translate(-50%, -50%) scale(1.0) rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
};

export default CelebrationGifs;
