export interface FaviconConversionResult {
  svgContent: string;
  isLoading: boolean;
  error: string;
}

export const convertFaviconToSVG = (
  faviconUrl: string,
  size: number,
  onUpdate: (result: FaviconConversionResult) => void
): (() => void) => {
  let attempts = 0;
  const maxAttempts = 2;
  let timeoutId: NodeJS.Timeout;

  try {
    // Create a canvas to process the image
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas context not available");

    // Create an image element and load the favicon directly
    const img = new Image();

    const tryLoadImage = () => {
      attempts++;

      if (attempts === 1) {
        img.crossOrigin = "anonymous";
      } else {
        img.crossOrigin = "";
      }

      img.src = faviconUrl;
    };

    const createFallbackSVG = () => {
      const fallbackSVG = `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <image href="${faviconUrl}" width="${size}" height="${size}" preserveAspectRatio="xMidYMid meet"/>
</svg>`;
      onUpdate({
        svgContent: fallbackSVG,
        isLoading: false,
        error: ""
      });
    };

    img.onload = () => {
      try {
        canvas.width = size;
        canvas.height = size;

        // Draw the image on canvas
        ctx.drawImage(img, 0, 0, size, size);

        // Get image data
        const imageData = ctx.getImageData(0, 0, size, size);
        const data = imageData.data;

        // Convert to SVG paths (simplified approach)
        let svgPaths = "";
        const step = Math.max(1, Math.floor(size / 32)); // Reduce resolution for performance

        for (let y = 0; y < size; y += step) {
          for (let x = 0; x < size; x += step) {
            const index = (y * size + x) * 4;
            const r = data[index];
            const g = data[index + 1];
            const b = data[index + 2];
            const a = data[index + 3];

            if (a > 128) {
              // Only draw visible pixels
              const color = `rgb(${r},${g},${b})`;
              svgPaths += `<rect x="${x}" y="${y}" width="${step}" height="${step}" fill="${color}"/>`;
            }
          }
        }

        const finalSVG = `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  ${svgPaths}
</svg>`;

        onUpdate({
          svgContent: finalSVG,
          isLoading: false,
          error: ""
        });
      } catch (canvasError) {
        console.warn(
          "Canvas processing failed, falling back to image display"
        );
        createFallbackSVG();
      }
    };

    img.onerror = () => {
      if (attempts < maxAttempts) {
        // Try again without crossOrigin
        tryLoadImage();
      } else {
        // All attempts failed, fall back to image display
        console.warn(
          "Favicon conversion failed, falling back to image display"
        );
        createFallbackSVG();
      }
    };

    // Start with first attempt
    tryLoadImage();

    // Add timeout fallback to prevent infinite loading
    timeoutId = setTimeout(() => {
      console.warn(
        "Favicon conversion timed out, falling back to image display"
      );
      onUpdate({
        svgContent: `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <image href="${faviconUrl}" width="${size}" height="${size}" preserveAspectRatio="xMidYMid meet"/>
</svg>`,
        isLoading: false,
        error: ""
      });
    }, 5000); // 5 second timeout

  } catch (err) {
    onUpdate({
      svgContent: "",
      isLoading: false,
      error: err instanceof Error ? err.message : "Conversion failed"
    });
  }

  // Return cleanup function
  return () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  };
};
