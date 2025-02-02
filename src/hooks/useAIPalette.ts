import { useState, useCallback, useEffect, useRef } from "react";
import ColorThief from "colorthief";
import { AIPaletteHookOptions, Palette, Color } from "../types";
import { rgbToHex, rgbToHsl } from "../utils/colorConverters";
import { generatePaletteFromKeyword } from "../utils/aiGenerator";
import { validateProps, ValidationError } from "../utils/validation";
import { usePaletteConfig } from "../context/PaletteContext";

interface CacheEntry {
  palette: Palette;
  timestamp: number;
  options: string;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const cache = new Map<string, CacheEntry>();

const useAIPalette = (options: AIPaletteHookOptions = {}) => {
  const { apiKey } = usePaletteConfig();
  const [palette, setPalette] = useState<Palette | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const getCacheKey = useCallback((opts: AIPaletteHookOptions): string => {
    return JSON.stringify({
      keyword: opts.keyword,
      count: opts.count,
      format: opts.format,
      type: opts.type,
      mode: opts.mode,
    });
  }, []);

  const clearCache = useCallback(() => {
    const now = Date.now();
    for (const [key, entry] of Array.from(cache.entries())) {
      if (now - entry.timestamp > CACHE_DURATION) {
        cache.delete(key);
      }
    }
  }, []);

  const generateFromImage = useCallback(
    async (imageFile: File | string) => {
      try {
        setLoading(true);
        setError(null);

        const colorThief = new ColorThief();
        const image = new Image();

        if (typeof imageFile === "string") {
          image.src = imageFile;
        } else {
          image.src = URL.createObjectURL(imageFile);
        }

        await new Promise((resolve) => {
          image.onload = resolve;
        });

        const colorPalette = colorThief.getPalette(image, options.count || 5);
        const colors: Color[] = colorPalette.map(
          (rgb: [number, number, number]) => {
            const [r, g, b] = rgb;
            const hex = rgbToHex(r, g, b);
            const hsl = rgbToHsl(r, g, b);
            return { hex, rgb: { r, g, b }, hsl };
          }
        );

        setPalette({
          colors,
          name: "Image-based palette",
          description: "Color palette generated from uploaded image",
        });
        setLoading(false);
      } catch (err) {
        setError(
          err instanceof Error
            ? err
            : new Error("Failed to generate palette from image")
        );
        setLoading(false);
      }
    },
    [options.count]
  );

  const generateFromKeyword = useCallback(
    async (keyword: string) => {
      try {
        setError(null);
        setLoading(true);

        // Validate props
        validateProps({ keyword, ...options });

        // Check cache
        const cacheKey = getCacheKey({ keyword, ...options });
        const cachedEntry = cache.get(cacheKey);
        if (
          cachedEntry &&
          Date.now() - cachedEntry.timestamp < CACHE_DURATION
        ) {
          setPalette(cachedEntry.palette);
          return;
        }

        // Cancel previous request if exists
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
        }

        // Create new abort controller
        abortControllerRef.current = new AbortController();

        const newPalette = await generatePaletteFromKeyword(
          keyword,
          {
            count: options.count,
            format: options.format,
            type: options.type,
            mode: options.mode,
          },
          options.mode === "ai" ? apiKey : undefined
        );

        // Cache the result
        cache.set(cacheKey, {
          palette: newPalette,
          timestamp: Date.now(),
          options: cacheKey,
        });

        setPalette(newPalette);
        clearCache(); // Clean old cache entries
      } catch (err) {
        if (err instanceof ValidationError) {
          setError(err);
        } else if (err instanceof Error) {
          setError(new Error(`Failed to generate palette: ${err.message}`));
        } else {
          setError(new Error("An unknown error occurred"));
        }
        setPalette(null);
      } finally {
        setLoading(false);
        abortControllerRef.current = null;
      }
    },
    [options, apiKey, getCacheKey, clearCache]
  );

  useEffect(() => {
    if (options.keyword && options.autoGenerate) {
      generateFromKeyword(options.keyword);
    }
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [options.keyword, options.autoGenerate, generateFromKeyword]);

  return {
    palette,
    loading,
    error,
    generateFromImage,
    generateFromKeyword,
  };
};

export default useAIPalette;
