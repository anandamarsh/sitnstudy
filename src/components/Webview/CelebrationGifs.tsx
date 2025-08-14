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

  // Giphy API key
  const gf = new GiphyFetch("Di6sZg5SfZYwsfb5wvzjqOEjkp7Pzida");

  // Fetch celebration GIFs
  const fetchCelebrationGifs = async () => {
    try {
      setIsLoading(true);
      const result = await gf.search("mario luigi mansion sonic", {
        limit: 10,
        rating: "g",
        type: "gifs",
      });

      const gifData: GifData[] = result.data.map((gif) => ({
        id: gif.id,
        url: gif.images.fixed_height.url,
        width: Number(gif.images.fixed_height.width),
        height: Number(gif.images.fixed_height.height),
      }));

      setGifs(gifData);

      // Randomly select one GIF to display
      const randomIndex = Math.floor(Math.random() * gifData.length);
      const randomGif = gifData[randomIndex];
      setSelectedGif(randomGif);

      console.log("🎉 Celebration GIFs loaded:", gifData.length);
      console.log("🎉 Randomly selected GIF:", randomGif.id);
    } catch (error) {
      console.error("❌ Error fetching celebration GIFs:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Load GIFs when component becomes visible
  useEffect(() => {
    console.log(
      "🎉 CelebrationGifs: useEffect triggered, isVisible:",
      isVisible,
      "gifs.length:",
      gifs.length
    );
    if (isVisible && gifs.length === 0) {
      console.log("🎉 CelebrationGifs: Starting to fetch celebration GIFs...");
      fetchCelebrationGifs();
    } else if (isVisible) {
      console.log("🎉 CelebrationGifs: Already have GIFs, no need to fetch");
    } else {
      console.log("🎉 CelebrationGifs: Not visible, not fetching GIFs");
    }
  }, [isVisible]);

  // Auto-hide after animation completes
  useEffect(() => {
    console.log(
      "🎉 CelebrationGifs: Auto-hide useEffect triggered, isVisible:",
      isVisible,
      "selectedGif:",
      selectedGif?.id
    );
    if (isVisible && selectedGif) {
      console.log(
        "🎉 CelebrationGifs: Setting 5-second timer for auto-hide..."
      );
      const timer = setTimeout(() => {
        console.log(
          "🎉 CelebrationGifs: 5-second timer expired, calling onComplete..."
        );
        if (onComplete) {
          onComplete();
        }
      }, 5000); // Show for 5 seconds

      return () => {
        console.log("🎉 CelebrationGifs: Cleaning up auto-hide timer");
        clearTimeout(timer);
      };
    }
  }, [isVisible, selectedGif, onComplete]);

  console.log(
    "🎉 CelebrationGifs: render called, isVisible:",
    isVisible,
    "isLoading:",
    isLoading,
    "selectedGif:",
    selectedGif?.id
  );

  if (!isVisible) {
    console.log("🎉 CelebrationGifs: Not visible, returning null");
    return null;
  }

  return (
    <div className="celebration-gifs-overlay">
      <div className="celebration-gifs-container">
        {isLoading ? (
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
        ) : null}
      </div>

      <style>{`
        .celebration-gifs-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
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
          animation: celebrationEntrance 2.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
          opacity: 0;
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
          15% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(4.0) rotate(90deg);
          }
          30% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(3.0) rotate(180deg);
          }
          50% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(2.0) rotate(270deg);
          }
          70% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1.3) rotate(315deg);
          }
          85% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1.1) rotate(330deg);
          }
          100% {
            opacity: 0;
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
