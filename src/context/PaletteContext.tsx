import React, { createContext, useContext } from "react";

export interface PaletteConfig {
    apiKey?: string;
    maxColors?: number;
    defaultFormat?: "hex" | "rgb" | "hsl";
    defaultHarmony?:
        | "analogous"
        | "complementary"
        | "triadic"
        | "tetradic"
        | "monochromatic";
    cacheEnabled?: boolean;
    cacheDuration?: number;
    errorHandler?: (error: Error) => void;
    onGenerate?: (palette: any) => void;
}

interface PaletteContextType {
    config: PaletteConfig;
}

const defaultConfig: PaletteConfig = {
    maxColors: 10,
    defaultFormat: "hex",
    defaultHarmony: "complementary",
    cacheEnabled: true,
    cacheDuration: 5 * 60 * 1000, // 5 minutes
};

const PaletteContext = createContext<PaletteContextType>({
    config: defaultConfig,
});

export interface PaletteProviderProps {
    config?: PaletteConfig;
    children: React.ReactNode;
}

export const PaletteProvider: React.FC<PaletteProviderProps> = ({
    config = {},
    children,
}) => {
    const mergedConfig = {
        ...defaultConfig,
        ...config,
    };

    return (
        <PaletteContext.Provider value={{ config: mergedConfig }}>
            {children}
        </PaletteContext.Provider>
    );
};

export const usePaletteConfig = () => {
    const context = useContext(PaletteContext);
    if (!context) {
        throw new Error(
            "usePaletteConfig must be used within a PaletteProvider"
        );
    }
    return context.config;
};

export default PaletteContext;
