# AI Palette Generator 🎨

`ai-palette` is a powerful and flexible color palette generator for React applications that combines AI-powered suggestions with algorithmic color harmonies. Generate beautiful, harmonious color palettes from keywords, images, or let AI suggest the perfect colors for your project.

## ✨ Features

-   🎨 **Two Generation Modes:**
    -   **AI Mode**: Uses OpenAI's GPT to generate contextually relevant color palettes with detailed descriptions
    -   **Basic Mode**: Generates harmonious color palettes using advanced color theory algorithms
-   🌈 **Multiple Color Harmonies:**
    -   Analogous - Colors next to each other on the color wheel
    -   Complementary - Opposite colors that create strong contrast
    -   Triadic - Three colors equally spaced around the wheel
    -   Tetradic - Four colors in a balanced arrangement
    -   Monochromatic - Various shades of a single color
-   📊 **Multiple Color Formats:**
    -   HEX (#RRGGBB)
    -   RGB (Red, Green, Blue)
    -   HSL (Hue, Saturation, Lightness)
-   🖼️ **Image-based Generation**
-   📝 **Detailed Color Descriptions**
-   📋 **One-Click Color Copy**
-   🎯 **Customizable Output Size**
-   🔄 **Real-time Updates**
-   💅 **Modern and Responsive UI**
-   ⚡ **Fast and Lightweight**
-   🔬 **Smart Color Analysis**
-   🎭 **Accessibility Features**

## 🚀 Quick Start

### Installation

```bash
npm install ai-palette
# or
yarn add ai-palette
```

### Basic Usage

```jsx
import { AIPalette } from "ai-palette";

function App() {
    return (
        <AIPalette
            keyword="sunset"
            count={5}
            format="hex"
            type="complementary"
            mode="basic"
        />
    );
}
```

### AI-Powered Mode

```jsx
import { AIPalette, PaletteProvider } from "ai-palette";

function AppWithAI() {
    return (
        <PaletteProvider config={{ apiKey: "your_openai_api_key" }}>
            <AIPalette
                keyword="sunset"
                count={5}
                format="hex"
                type="complementary"
                mode="ai"
            />
        </PaletteProvider>
    );
}
```

## 📦 Compatibility

-   **React Version:** 16.8.0 or higher
-   **Node Version:** 14.0.0 or higher
-   **TypeScript:** Full type support included
-   **Frameworks:** Works with Next.js, Create React App, Vite, and more
-   **Browsers:** Modern browsers (Chrome, Firefox, Safari, Edge)

## 🛠️ Props & Configuration

### AIPalette Component

| Prop       | Type                                                                         | Default   | Description                                |
| ---------- | ---------------------------------------------------------------------------- | --------- | ------------------------------------------ |
| keyword    | string                                                                       | -         | The theme or concept for generating colors |
| image      | File                                                                         | -         | Image file for extracting colors           |
| count      | number                                                                       | 5         | Number of colors to generate               |
| format     | 'hex' \| 'rgb' \| 'hsl'                                                      | 'hex'     | Color format                               |
| type       | 'analogous' \| 'complementary' \| 'triadic' \| 'tetradic' \| 'monochromatic' | 'default' | Color harmony type                         |
| mode       | 'ai' \| 'basic'                                                              | 'basic'   | Generation mode                            |
| onGenerate | (palette: Palette) => void                                                   | -         | Callback when palette is generated         |
| onError    | (error: Error) => void                                                       | -         | Callback when error occurs                 |

### PaletteProvider Props

| Prop   | Type                | Description                      |
| ------ | ------------------- | -------------------------------- |
| config | { apiKey?: string } | Configuration object for AI mode |

## 🎯 Features in Detail

### Generation Modes

#### Basic Mode

-   Uses advanced color theory algorithms
-   Generates harmonious color palettes instantly
-   Provides detailed descriptions of color characteristics
-   No API key required
-   Perfect for quick prototypes and basic needs

#### AI Mode

-   Uses OpenAI's GPT for intelligent color suggestions
-   Generates contextually relevant palettes
-   Provides rich, context-aware color descriptions
-   Requires OpenAI API key
-   Ideal for brand-specific and themed palettes

### 🎨 Color Harmonies

-   **Analogous**: Colors that are next to each other on the color wheel, creating smooth transitions
-   **Complementary**: Colors that are opposite each other, creating strong contrast
-   **Triadic**: Three colors equally spaced around the color wheel, offering balanced and vibrant combinations
-   **Tetradic**: Four colors arranged into two complementary pairs, providing rich and complex harmonies
-   **Monochromatic**: Different shades and saturations of the same color, perfect for subtle and sophisticated designs

### 🎭 Accessibility Features

-   WCAG contrast ratio calculations
-   Automatic text color adjustment
-   Color blindness simulation
-   Accessible color combinations

## 📝 Examples

### Basic Mode Example

```jsx
<AIPalette
    keyword="ocean"
    count={5}
    format="hex"
    type="analogous"
    mode="basic"
    onGenerate={(palette) => console.log("Generated palette:", palette)}
/>
```

### AI Mode Example

```jsx
<PaletteProvider config={{ apiKey: "your_openai_api_key" }}>
    <AIPalette
        keyword="sunset"
        count={5}
        format="rgb"
        type="complementary"
        mode="ai"
        onGenerate={(palette) => console.log("Generated palette:", palette)}
        onError={(error) => console.error("Error:", error)}
    />
</PaletteProvider>
```

### Image-based Generation

```jsx
<AIPalette
    image={imageFile}
    count={5}
    format="hsl"
    onGenerate={(palette) => console.log("Generated from image:", palette)}
/>
```

## ⚠️ Error Handling

The component includes built-in error handling for:

-   Invalid API keys
-   Network errors
-   Invalid image files
-   Unsupported color formats
-   Generation failures
-   Input validation errors

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🌟 Stay in Touch

-   Author: Fatih Güzel
-   GitHub: [https://github.com/fatihguzel/ai-palette](https://github.com/fatihguzel/ai-palette)
-   Issues: [https://github.com/fatihguzel/ai-palette/issues](https://github.com/fatihguzel/ai-palette/issues)
