export interface Color {
  hex: string;
  rgb: {
    r: number;
    g: number;
    b: number;
  };
  hsl: {
    h: number;
    s: number;
    l: number;
  };
  description?: string;
}

export interface Palette {
  colors: Color[];
  name?: string;
  description?: string;
}

export type ColorHarmony =
  | "analogous"
  | "complementary"
  | "triadic"
  | "tetradic"
  | "monochromatic";

export type GenerationMode = "ai" | "basic";

export interface AIPaletteProps {
  keyword?: string;
  image?: File | string;
  count?: number;
  format?: "hex" | "rgb" | "hsl";
  type?: ColorHarmony;
  mode?: GenerationMode;
  onGenerate?: (palette: Palette) => void;
  onError?: (error: Error) => void;
}

export interface AIPaletteHookOptions
  extends Omit<AIPaletteProps, "onGenerate" | "onError"> {
  autoGenerate?: boolean;
}
