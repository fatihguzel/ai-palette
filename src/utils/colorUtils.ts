import { Color } from "../types";

export const calculateContrast = (color1: string, color2: string): number => {
  const getLuminance = (hex: string): number => {
    const rgb = hex
      .replace("#", "")
      .match(/.{2}/g)!
      .map((x) => parseInt(x, 16));
    const [r, g, b] = rgb.map((val) => {
      val = val / 255;
      return val <= 0.03928
        ? val / 12.92
        : Math.pow((val + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };

  const l1 = getLuminance(color1);
  const l2 = getLuminance(color2);
  const brightest = Math.max(l1, l2);
  const darkest = Math.min(l1, l2);
  return (brightest + 0.05) / (darkest + 0.05);
};

export const isAccessible = (
  backgroundColor: string,
  textColor: string,
  level: "AA" | "AAA" = "AA"
): boolean => {
  const contrast = calculateContrast(backgroundColor, textColor);
  return level === "AA" ? contrast >= 4.5 : contrast >= 7;
};

export const getTextColor = (backgroundColor: string): string => {
  const contrast = calculateContrast(backgroundColor, "#FFFFFF");
  return contrast >= 4.5 ? "#FFFFFF" : "#000000";
};

export const darken = (color: Color, amount: number): Color => {
  const newL = Math.max(0, color.hsl.l - amount);
  const rgb = hslToRgb(color.hsl.h, color.hsl.s, newL);
  return {
    hex: rgbToHex(rgb.r, rgb.g, rgb.b),
    rgb,
    hsl: { ...color.hsl, l: newL },
    description: color.description,
  };
};

export const lighten = (color: Color, amount: number): Color => {
  const newL = Math.min(100, color.hsl.l + amount);
  const rgb = hslToRgb(color.hsl.h, color.hsl.s, newL);
  return {
    hex: rgbToHex(rgb.r, rgb.g, rgb.b),
    rgb,
    hsl: { ...color.hsl, l: newL },
    description: color.description,
  };
};

export const adjustSaturation = (color: Color, amount: number): Color => {
  const newS = Math.min(100, Math.max(0, color.hsl.s + amount));
  const rgb = hslToRgb(color.hsl.h, newS, color.hsl.l);
  return {
    hex: rgbToHex(rgb.r, rgb.g, rgb.b),
    rgb,
    hsl: { ...color.hsl, s: newS },
    description: color.description,
  };
};

export const hslToRgb = (
  h: number,
  s: number,
  l: number
): { r: number; g: number; b: number } => {
  s /= 100;
  l /= 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) =>
    l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));

  return {
    r: Math.round(255 * f(0)),
    g: Math.round(255 * f(8)),
    b: Math.round(255 * f(4)),
  };
};

export const rgbToHex = (r: number, g: number, b: number): string => {
  const toHex = (n: number) => {
    const hex = n.toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

export const hexToRgb = (hex: string): { r: number; g: number; b: number } => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) {
    throw new Error(`Invalid hex color: ${hex}`);
  }
  return {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  };
};

export const rgbToHsl = (
  r: number,
  g: number,
  b: number
): { h: number; s: number; l: number } => {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
};
