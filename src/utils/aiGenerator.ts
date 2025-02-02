import { Palette, GenerationMode } from "../types";
import axios from "axios";

interface GenerateOptions {
    count?: number;
    format?: "hex" | "rgb" | "hsl";
    type?:
        | "analogous"
        | "complementary"
        | "triadic"
        | "tetradic"
        | "monochromatic";
    mode?: GenerationMode;
}

// Önceden tanımlanmış tema renkleri
const themeColors: { [key: string]: { h: number; s: number; l: number } } = {
    // Doğa
    sunset: { h: 25, s: 85, l: 55 }, // Turuncu-kırmızı
    sunrise: { h: 45, s: 90, l: 60 }, // Altın sarısı
    ocean: { h: 200, s: 85, l: 45 }, // Deniz mavisi
    forest: { h: 120, s: 70, l: 35 }, // Koyu yeşil
    sky: { h: 210, s: 80, l: 70 }, // Açık mavi
    grass: { h: 95, s: 75, l: 45 }, // Çimen yeşili
    sand: { h: 45, s: 50, l: 85 }, // Kum beji

    // Mevsimler
    spring: { h: 95, s: 80, l: 60 }, // Canlı yeşil
    summer: { h: 45, s: 95, l: 60 }, // Parlak sarı
    autumn: { h: 25, s: 90, l: 45 }, // Turuncu-kahve
    winter: { h: 210, s: 50, l: 85 }, // Buz mavisi

    // Duygular
    happy: { h: 45, s: 95, l: 65 }, // Parlak sarı
    calm: { h: 180, s: 50, l: 75 }, // Açık turkuaz
    energetic: { h: 0, s: 90, l: 60 }, // Canlı kırmızı
    peaceful: { h: 150, s: 40, l: 80 }, // Soft yeşil
    romantic: { h: 340, s: 80, l: 70 }, // Pembe

    // Zaman
    morning: { h: 45, s: 85, l: 70 }, // Sabah sarısı
    noon: { h: 200, s: 80, l: 70 }, // Öğlen mavisi
    evening: { h: 25, s: 80, l: 50 }, // Akşam turuncusu
    night: { h: 240, s: 70, l: 25 }, // Gece mavisi

    // Mekanlar
    beach: { h: 35, s: 85, l: 80 }, // Kumsal
    mountain: { h: 200, s: 30, l: 40 }, // Dağ grisi
    desert: { h: 35, s: 70, l: 60 }, // Çöl kahvesi
    tropical: { h: 150, s: 90, l: 45 }, // Tropikal yeşil
    urban: { h: 220, s: 30, l: 45 }, // Şehir grisi

    // Sıcaklık
    warm: { h: 25, s: 90, l: 55 }, // Sıcak turuncu
    cold: { h: 200, s: 85, l: 60 }, // Soğuk mavi
    hot: { h: 0, s: 95, l: 50 }, // Ateş kırmızısı
    cool: { h: 180, s: 60, l: 75 }, // Serin turkuaz
};

// HSL renk uzayında başlangıç rengi oluştur
const generateBaseColor = (
    keyword: string
): { h: number; s: number; l: number } => {
    // Keyword'u küçük harfe çevir ve boşlukları kaldır
    const cleanKeyword = keyword.toLowerCase().trim();

    // Önceden tanımlı temalardan eşleşen var mı diye kontrol et
    for (const [theme, color] of Object.entries(themeColors)) {
        if (cleanKeyword.includes(theme)) {
            return color;
        }
    }

    // Eşleşme yoksa varsayılan bir renk üret
    const hash = cleanKeyword.split("").reduce((acc, char) => {
        return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);

    return {
        h: Math.abs(hash % 360),
        s: 70 + (hash % 20),
        l: 45 + (hash % 20),
    };
};

// ChatGPT'den renk önerileri al
const getColorSuggestionsFromGPT = async (
    keyword: string,
    count: number,
    apiKey?: string
): Promise<Array<{ hex: string; description: string }>> => {
    try {
        if (!apiKey) {
            throw new Error(
                "OpenAI API key is required for AI mode. Please provide an API key in the PaletteProvider config or switch to basic mode"
            );
        }

        const response = await axios.post(
            "https://api.openai.com/v1/chat/completions",
            {
                model: "gpt-3.5-turbo",
                messages: [
                    {
                        role: "system",
                        content:
                            "You are a color palette generator. Generate colors that match the given theme or keyword. Return only a JSON array of colors with hex codes and descriptions.",
                    },
                    {
                        role: "user",
                        content: `Generate ${count} colors that represent "${keyword}". For each color, provide a hex code and a brief description of why it fits the theme. Return as JSON array like this: [{"hex": "#XXXXXX", "description": "explanation"}]`,
                    },
                ],
                temperature: 0.7,
            },
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${apiKey}`,
                },
            }
        );

        const suggestions = JSON.parse(
            response.data.choices[0].message.content
        );
        return suggestions;
    } catch (error: any) {
        console.error(
            "Error getting color suggestions:",
            error.response?.data || error.message
        );
        throw new Error(
            error.response?.data?.error?.message ||
                "Failed to get color suggestions from GPT"
        );
    }
};

// HSL'den RGB'ye dönüşüm
const hslToRgb = (
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

// Hex'ten HSL'ye dönüşüm
const hexToHsl = (hex: string): { h: number; s: number; l: number } => {
    // Hex'i RGB'ye çevir
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) {
        throw new Error(`Invalid hex color: ${hex}`);
    }

    const r = parseInt(result[1], 16) / 255;
    const g = parseInt(result[2], 16) / 255;
    const b = parseInt(result[3], 16) / 255;

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

// Renk harmonisi oluştur
const generateHarmony = (
    baseHsl: { h: number; s: number; l: number },
    type: string,
    count: number
): Array<{ h: number; s: number; l: number }> => {
    const colors = [];
    const { h, s, l } = baseHsl;

    // Renk çarkında daha uyumlu geçişler için yardımcı fonksiyon
    const adjustHarmonyColor = (
        hue: number,
        saturation: number,
        lightness: number
    ) => {
        // Doygunluğu ana renge yakın tut
        const adjustedS = Math.max(30, Math.min(90, saturation));
        // Parlaklığı dengeli tut
        const adjustedL = Math.max(20, Math.min(80, lightness));
        return {
            h: ((hue % 360) + 360) % 360, // 0-360 arasında tut
            s: adjustedS,
            l: adjustedL,
        };
    };

    switch (type) {
        case "analogous":
            // Ana rengin her iki yanından yakın renkler
            const analogStep = 30; // 30 derece aralıklarla
            for (let i = 0; i < count; i++) {
                const step = (i - Math.floor(count / 2)) * analogStep;
                colors.push(
                    adjustHarmonyColor(
                        h + step,
                        s - Math.abs(step) / 10, // Merkeze yakın renkler daha doygun
                        l + (i % 2 === 0 ? 5 : -5) // Alternatif olarak biraz daha açık/koyu
                    )
                );
            }
            break;

        case "complementary":
            // Ana renk ve karşıt renk, artı ara geçiş renkleri
            colors.push(adjustHarmonyColor(h, s, l)); // Ana renk
            if (count >= 2) {
                colors.push(adjustHarmonyColor(h + 180, s - 10, l)); // Karşıt renk
            }
            // Ara geçiş renkleri
            const compStep = 180 / (count - 1);
            for (let i = 2; i < count; i++) {
                const step = (i - 1) * compStep;
                colors.push(
                    adjustHarmonyColor(
                        h + step,
                        s - 15, // Ara renkler biraz daha soft
                        l + (i % 2 === 0 ? 10 : -10)
                    )
                );
            }
            break;

        case "triadic":
            // 120 derece aralıklarla üç ana renk ve ara tonlar
            const triadicBase = [0, 120, 240];
            for (let i = 0; i < count; i++) {
                const baseIndex = Math.floor(i / Math.ceil(count / 3));
                const hue = h + triadicBase[baseIndex % 3];
                colors.push(
                    adjustHarmonyColor(
                        hue,
                        s - baseIndex * 5, // Her grup biraz daha soft
                        l + ((i % 2) * 10 - 5) // Alternatif açık/koyu
                    )
                );
            }
            break;

        case "tetradic":
            // 90 derece aralıklarla dört ana renk ve ara tonlar
            const tetradicBase = [0, 90, 180, 270];
            for (let i = 0; i < count; i++) {
                const baseIndex = Math.floor(i / Math.ceil(count / 4));
                const hue = h + tetradicBase[baseIndex % 4];
                colors.push(
                    adjustHarmonyColor(
                        hue,
                        s - baseIndex * 5,
                        l + ((i % 2) * 10 - 5)
                    )
                );
            }
            break;

        case "monochromatic":
            // Aynı rengin farklı ton ve doygunlukları
            for (let i = 0; i < count; i++) {
                const step = i / (count - 1); // 0 ile 1 arası
                colors.push({
                    h,
                    s: Math.max(30, Math.min(90, s - step * 20)), // Doygunluk azalır
                    l: 25 + step * 50, // Koyudan açığa doğru (25-75 arası)
                });
            }
            break;

        default:
            // Varsayılan olarak dengeli bir renk dağılımı
            const defaultStep = 360 / count;
            for (let i = 0; i < count; i++) {
                colors.push(
                    adjustHarmonyColor(
                        h + i * defaultStep,
                        s - Math.abs(i - count / 2) * 5, // Ortadaki renkler daha doygun
                        l + (i % 2 === 0 ? 5 : -5)
                    )
                );
            }
    }

    // Son kontrol ve yuvarlama
    return colors.map((color) => ({
        h: Math.round(color.h),
        s: Math.round(color.s),
        l: Math.round(color.l),
    }));
};

// Basic modda renk önerileri oluştur
const getBasicColorSuggestions = (
    keyword: string,
    count: number,
    type: string = "default"
): Array<{ hex: string; description: string }> => {
    const baseColor = generateBaseColor(keyword);
    const hslColors = generateHarmony(baseColor, type, count);

    return hslColors.map((hsl, index) => {
        const rgb = hslToRgb(hsl.h, hsl.s, hsl.l);
        const hex = rgbToHex(rgb.r, rgb.g, rgb.b);

        let description = "";
        const colorTemperature =
            hsl.h >= 0 && hsl.h < 60
                ? "warm"
                : hsl.h >= 60 && hsl.h < 180
                ? "cool"
                : hsl.h >= 180 && hsl.h < 300
                ? "cool"
                : "warm";

        const intensity =
            hsl.s > 70 ? "vibrant" : hsl.s > 40 ? "balanced" : "subtle";

        const brightness =
            hsl.l > 70 ? "light" : hsl.l > 30 ? "medium" : "dark";

        switch (type) {
            case "analogous":
                description =
                    index === 0
                        ? `A ${intensity} ${colorTemperature} ${brightness} tone that serves as the foundation of the ${keyword} theme`
                        : `A harmonious ${intensity} ${colorTemperature} ${brightness} shade that complements the base color, creating a smooth transition in the ${keyword} palette`;
                break;
            case "complementary":
                description =
                    index === 0
                        ? `The primary ${intensity} ${colorTemperature} ${brightness} color that embodies the essence of ${keyword}`
                        : `A contrasting ${intensity} ${colorTemperature} ${brightness} tone that creates a striking balance with the primary color`;
                break;
            case "monochromatic":
                description = `A ${brightness} ${intensity} variation that explores the depth of the ${keyword} theme through subtle changes in brightness and saturation`;
                break;
            case "triadic":
                description = `A ${intensity} ${colorTemperature} ${brightness} hue that forms part of a balanced three-color harmony, adding dynamic energy to the ${keyword} palette`;
                break;
            case "tetradic":
                description = `A ${intensity} ${colorTemperature} ${brightness} tone that contributes to a rich and complex four-color harmony in the ${keyword} theme`;
                break;
            default:
                description = `A ${intensity} ${colorTemperature} ${brightness} color that captures the essence of ${keyword}`;
        }

        return { hex, description };
    });
};

export const generatePaletteFromKeyword = async (
    keyword: string,
    options: GenerateOptions = {},
    apiKey?: string
): Promise<Palette> => {
    const count = options.count || 5;
    const mode = options.mode || "basic";
    const type = options.type || "default";

    try {
        const suggestions =
            mode === "ai"
                ? await getColorSuggestionsFromGPT(keyword, count, apiKey)
                : getBasicColorSuggestions(keyword, count, type);

        const colors = suggestions.map((suggestion) => {
            const hsl = hexToHsl(suggestion.hex);
            const rgb = hslToRgb(hsl.h, hsl.s, hsl.l);

            return {
                hex: suggestion.hex,
                rgb,
                hsl,
                description: suggestion.description,
            };
        });

        return {
            colors,
            name: `${keyword} palette`,
            description: `${
                mode === "ai" ? "AI" : "Basic"
            } generated color palette based on "${keyword}"${
                type !== "default" ? ` with ${type} harmony` : ""
            }`,
        };
    } catch (error) {
        console.error("Error generating palette:", error);
        throw error;
    }
};

const rgbToHex = (r: number, g: number, b: number): string => {
    const toHex = (n: number) => {
        const hex = n.toString(16);
        return hex.length === 1 ? "0" + hex : hex;
    };
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};
