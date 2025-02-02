import { Palette } from "../types";
import { hexToRgb, rgbToHsl } from "./colorConverters";

interface GenerateOptions {
    count?: number;
    format?: "tailwind" | "bootstrap" | "material" | "default";
    type?:
        | "analogous"
        | "complementary"
        | "triadic"
        | "tetradic"
        | "monochromatic";
}

const colorTheory = {
    analogous: (hue: number): number[] => {
        return [
            hue,
            (hue + 30) % 360,
            (hue + 60) % 360,
            (hue - 30 + 360) % 360,
            (hue - 60 + 360) % 360,
        ];
    },

    complementary: (hue: number): number[] => {
        return [hue, (hue + 180) % 360, (hue + 150) % 360, (hue + 210) % 360];
    },

    triadic: (hue: number): number[] => {
        return [hue, (hue + 120) % 360, (hue + 240) % 360];
    },

    tetradic: (hue: number): number[] => {
        return [hue, (hue + 90) % 360, (hue + 180) % 360, (hue + 270) % 360];
    },

    monochromatic: (hue: number): number[] => {
        return Array(5).fill(hue);
    },
};

const themeColors = {
    sunset: ["#FF7B89", "#FFB084", "#FFF6B7", "#F6C28B", "#5C374C"],
    ocean: ["#014F86", "#2A6F97", "#2C7DA0", "#468FAF", "#61A5C2"],
    forest: ["#2D6A4F", "#40916C", "#52B788", "#74C69D", "#95D5B2"],
    vintage: ["#CB997E", "#DDBEA9", "#FFE8D6", "#B7B7A4", "#A5A58D"],
    modern: ["#2B2D42", "#8D99AE", "#EDF2F4", "#EF233C", "#D90429"],
};

export const generatePaletteFromKeyword = (
    keyword: string,
    options: GenerateOptions = {}
): Palette => {
    try {
        if (keyword.toLowerCase() in themeColors) {
            const colors = themeColors[
                keyword.toLowerCase() as keyof typeof themeColors
            ].map((hex) => {
                const rgb = hexToRgb(hex);
                if (!rgb) throw new Error(`Invalid hex color: ${hex}`);
                const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
                return { hex, rgb, hsl };
            });

            return {
                colors: colors.slice(0, options.count || 5),
                name: `${keyword} palette`,
                description: `Theme-based color palette for "${keyword}"`,
            };
        }

        const baseHue = hashStringToNumber(keyword) % 360;
        const type = options.type || "analogous";
        const hues = colorTheory[type](baseHue);

        const colors = hues.map((hue, index) => {
            const saturation = type === "monochromatic" ? 70 : 85;
            const lightness = type === "monochromatic" ? 40 + index * 10 : 50;

            const rgb = hslToRgb(hue, saturation, lightness);
            const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
            const hsl = { h: hue, s: saturation, l: lightness };

            return { hex, rgb, hsl };
        });

        return {
            colors: colors.slice(0, options.count || 5),
            name: `${keyword} palette`,
            description: `${type} color palette based on "${keyword}"`,
        };
    } catch (error) {
        console.error("Error generating palette:", error);
        throw new Error("Failed to generate palette from keyword");
    }
};

const hashStringToNumber = (str: string): number => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash = hash & hash;
    }
    return Math.abs(hash);
};

const hslToRgb = (
    h: number,
    s: number,
    l: number
): { r: number; g: number; b: number } => {
    s /= 100;
    l /= 100;

    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = l - c / 2;
    let r = 0;
    let g = 0;
    let b = 0;

    if (0 <= h && h < 60) {
        r = c;
        g = x;
        b = 0;
    } else if (60 <= h && h < 120) {
        r = x;
        g = c;
        b = 0;
    } else if (120 <= h && h < 180) {
        r = 0;
        g = c;
        b = x;
    } else if (180 <= h && h < 240) {
        r = 0;
        g = x;
        b = c;
    } else if (240 <= h && h < 300) {
        r = x;
        g = 0;
        b = c;
    } else if (300 <= h && h < 360) {
        r = c;
        g = 0;
        b = x;
    }

    return {
        r: Math.round((r + m) * 255),
        g: Math.round((g + m) * 255),
        b: Math.round((b + m) * 255),
    };
};

const rgbToHex = (r: number, g: number, b: number): string => {
    const toHex = (n: number) => {
        const hex = n.toString(16);
        return hex.length === 1 ? "0" + hex : hex;
    };
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};
