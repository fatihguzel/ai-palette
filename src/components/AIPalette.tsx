import React, { useCallback, useRef, useState } from "react";
import { AIPaletteProps, Color } from "../types";
import useAIPalette from "../hooks/useAIPalette";

const AIPalette: React.FC<AIPaletteProps> = ({
  keyword,
  image,
  count = 5,
  format = "hex",
  type,
  mode = "basic",
  onGenerate,
  onError,
}) => {
  const { palette, loading, error, generateFromImage, generateFromKeyword } =
    useAIPalette({
      count,
      format: format as "hex" | "rgb" | "hsl",
      type,
      mode,
    });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [copiedColor, setCopiedColor] = useState<string | null>(null);

  const handleImageUpload = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        generateFromImage(file);
      }
    },
    [generateFromImage]
  );

  const handleKeywordSubmit = useCallback(
    (event: React.FormEvent) => {
      event.preventDefault();
      if (keyword) {
        generateFromKeyword(keyword);
      }
    },
    [keyword, generateFromKeyword]
  );

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedColor(text);
      setTimeout(() => setCopiedColor(null), 2000); // Reset after 2 seconds
    });
  };

  React.useEffect(() => {
    if (error && onError) {
      onError(error);
    }
  }, [error, onError]);

  React.useEffect(() => {
    if (palette && onGenerate) {
      onGenerate(palette);
    }
  }, [palette, onGenerate]);

  const renderColor = (color: Color, index: number) => {
    const getColorString = () => {
      switch (format) {
        case "rgb":
          return `RGB(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b})`;
        case "hsl":
          return `HSL(${color.hsl.h}, ${color.hsl.s}%, ${color.hsl.l}%)`;
        case "hex":
        default:
          return color.hex;
      }
    };

    const colorString = getColorString();
    const isCopied = copiedColor === colorString;

    return (
      <div
        key={index}
        className="color-item"
        style={{
          backgroundColor: color.hex,
          width: "200px",
          minHeight: "200px",
          height: "auto",
          margin: "5px",
          borderRadius: "8px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          alignItems: "center",
          color: color.hsl.l > 50 ? "#000" : "#fff",
          padding: "16px",
          textAlign: "center",
          cursor: "pointer",
          position: "relative",
          transition: "all 0.2s ease",
          overflow: "visible",
        }}
        onClick={() => copyToClipboard(colorString)}
        title="Click to copy color code"
      >
        {isCopied && (
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              background: "rgba(0,0,0,0.7)",
              color: "#fff",
              padding: "8px 16px",
              borderRadius: "4px",
              fontSize: "0.9em",
              fontWeight: "500",
              zIndex: 2,
              animation: "fadeIn 0.2s ease",
            }}
          >
            Copied!
          </div>
        )}
        <span
          style={{
            fontFamily: "monospace",
            fontSize: "0.9em",
            fontWeight: "500",
            padding: "4px 8px",
            background: "rgba(0,0,0,0.1)",
            borderRadius: "4px",
            marginBottom: "16px",
            width: "auto",
            display: "inline-block",
          }}
        >
          {colorString}
        </span>
        {color.description && (
          <span
            style={{
              fontSize: "0.85em",
              lineHeight: "1.4",
              opacity: 0.9,
              padding: "8px 12px",
              background: "rgba(0,0,0,0.1)",
              borderRadius: "4px",
              width: "85%",
              wordBreak: "normal",
              whiteSpace: "normal",
              marginTop: "auto",
            }}
          >
            {color.description}
          </span>
        )}
      </div>
    );
  };

  return (
    <div className="ai-palette">
      <style>
        {`
                    @keyframes fadeIn {
                        from { opacity: 0; }
                        to { opacity: 1; }
                    }
                    .color-item:hover {
                        transform: translateY(-2px);
                        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                    }
                    .palette {
                        display: flex;
                        flex-wrap: wrap;
                        gap: 16px;
                        justify-content: center;
                        padding: 16px;
                    }
                `}
      </style>
      <div className="controls">
        {keyword && (
          <form onSubmit={handleKeywordSubmit}>
            <button type="submit" disabled={loading}>
              Generate from "{keyword}"
            </button>
          </form>
        )}
        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          ref={fileInputRef}
          style={{ display: "none" }}
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={loading}
        >
          Upload Image
        </button>
      </div>

      {loading && <div className="loading">Generating palette...</div>}
      {error && <div className="error">{error.message}</div>}

      {palette && (
        <div
          className="palette"
          style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}
        >
          {palette.colors.map((color, index) => renderColor(color, index))}
        </div>
      )}
    </div>
  );
};

export default AIPalette;
