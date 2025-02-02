import { AIPaletteProps, ColorHarmony, GenerationMode } from "../types";

export class ValidationError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "ValidationError";
    }
}

export const validateProps = (props: AIPaletteProps): void => {
    if (props.count !== undefined) {
        if (props.count < 1 || props.count > 10) {
            throw new ValidationError("Color count must be between 1 and 10");
        }
        if (!Number.isInteger(props.count)) {
            throw new ValidationError("Color count must be an integer");
        }
    }

    if (props.keyword !== undefined) {
        if (typeof props.keyword !== "string") {
            throw new ValidationError("Keyword must be a string");
        }
        if (props.keyword.trim().length === 0) {
            throw new ValidationError("Keyword cannot be empty");
        }
        if (props.keyword.length > 100) {
            throw new ValidationError(
                "Keyword is too long (max 100 characters)"
            );
        }
    }

    if (props.image !== undefined) {
        if (props.image instanceof File) {
            if (!props.image.type.startsWith("image/")) {
                throw new ValidationError("File must be an image");
            }
            if (props.image.size > 5 * 1024 * 1024) {
                // 5MB limit
                throw new ValidationError("Image size must be less than 5MB");
            }
        } else if (typeof props.image === "string") {
            try {
                new URL(props.image);
            } catch {
                throw new ValidationError("Invalid image URL");
            }
        } else {
            throw new ValidationError(
                "Image must be a File object or URL string"
            );
        }
    }

    if (props.mode !== undefined && !["ai", "basic"].includes(props.mode)) {
        throw new ValidationError("Invalid generation mode");
    }

    if (
        props.format !== undefined &&
        !["hex", "rgb", "hsl"].includes(props.format)
    ) {
        throw new ValidationError("Invalid color format");
    }

    const validTypes: ColorHarmony[] = [
        "analogous",
        "complementary",
        "triadic",
        "tetradic",
        "monochromatic",
    ];
    if (props.type !== undefined && !validTypes.includes(props.type)) {
        throw new ValidationError("Invalid harmony type");
    }
};

export const validateApiKey = (apiKey?: string): void => {
    if (!apiKey) {
        throw new ValidationError("OpenAI API key is required for AI mode");
    }
    if (typeof apiKey !== "string") {
        throw new ValidationError("Invalid API key format");
    }
    if (!apiKey.startsWith("sk-")) {
        throw new ValidationError("Invalid OpenAI API key format");
    }
};
