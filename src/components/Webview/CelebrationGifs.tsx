import React, { useState, useEffect } from "react";
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
  const [isLoading, setIsLoading] = useState(false);
  const [hasPlayedSound, setHasPlayedSound] = useState(false);

  const gf = new GiphyFetch("Di6sZg5SfZYwsfb5wvzjqOEjkp7Pzida");

  const fetchCelebrationGifs = async () => {
    try {
      setIsLoading(true);
      const result = await gf.search("mario luigi mansion sonic", {
        limit: 10,
        rating: "g",
        type: "gifs",
      });

      const gifData: GifData[] = result.data.map((gif: any) => ({
        id: gif.id,
        url: gif.images.fixed_height.url,
        width: Number(gif.images.fixed_height.width),
        height: Number(gif.images.fixed_height.height),
      }));

      setGifs(gifData);

      if (gifData.length) {
        const randomIndex = Math.floor(Math.random() * gifData.length);
        setSelectedGif(gifData[randomIndex]);
      } else {
        setSelectedGif(null);
      }
    } catch (error) {
      console.error("❌ Error fetching celebration GIFs:", error);
    } finally {
      // ✅ make sure we stop showing the spinner
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isVisible && gifs.length === 0) {
      fetchCelebrationGifs();
    } else if (!isVisible) {
      setHasPlayedSound(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isVisible]);

  useEffect(() => {
    if (isVisible && selectedGif && !hasPlayedSound) {
      const audio = new Audio("/audio/victory.wav"); // ensure this path exists in your app
      audio.volume = 0.7;
      audio.play().catch((e) => console.log("Audio play failed:", e.message));
      setHasPlayedSound(true);
    }
  }, [isVisible, selectedGif, hasPlayedSound]);

  useEffect(() => {
    if (isVisible && selectedGif) {
      const timer = setTimeout(() => onComplete?.(), 5000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, selectedGif, onComplete]);

  if (!isVisible) return null;

  return (
    <div className="celebration-gifs-overlay">
      <div className="celebration-gifs-container">
        {isLoading && !selectedGif ? (
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Loading celebration GIF... 🎉</p>
          </div>
        ) : selectedGif ? (
          <div className="celebration-gif">
            <img
              src={selectedGif.url}
              alt="Celebration!"
              width={selectedGif.width}
              height={selectedGif.height}
            />
          </div>
        ) : (
          <p style={{ color: "white" }}>No GIFs found.</p>
        )}
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
          pointer-events: none;
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
          animation: celebrationEntrance 2.5s cubic-bezier(0.25,0.46,0.45,0.94) forwards;
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
          100% {
            opacity: 1; /* ✅ make it visible */
            transform: translate(-50%, -50%) scale(1.0) rotate(360deg);
          }
        }

        .loading-spinner {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 18px;
        }

        .spinner {
          width: 40px;
          height: 40px;
          border: 4px solid rgba(255, 255, 255, 0.3);
          border-top: 4px solid white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 16px;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default CelebrationGifs;
