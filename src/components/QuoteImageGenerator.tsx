import React, { useState, useRef, useEffect } from "react";
import { X, Download, Image as ImageIcon, Sparkles, Check, Edit3 } from "lucide-react";
import type { Quote } from "../models/quote";
import { toast } from "sonner";

interface QuoteImageGeneratorProps {
  quote?: Quote;
  onClose: () => void;
}

const GRADIENTS = [
  {
    name: "Classic Spark",
    class: "bg-[linear-gradient(135deg,#6366F1,#8B5CF6,#EC4899)]",
    colors: ["#6366F1", "#8B5CF6", "#EC4899"],
  },
  {
    name: "Sunset Glow",
    class: "bg-[linear-gradient(135deg,#F97316,#E11D48,#9333EA)]",
    colors: ["#F97316", "#E11D48", "#9333EA"],
  },
  {
    name: "Ocean Breeze",
    class: "bg-[linear-gradient(135deg,#06B6D4,#3B82F6,#6366F1)]",
    colors: ["#06B6D4", "#3B82F6", "#6366F1"],
  },
  {
    name: "Forest Calm",
    class: "bg-[linear-gradient(135deg,#10B981,#14B8A6,#0284C7)]",
    colors: ["#10B981", "#14B8A6", "#0284C7"],
  },
  {
    name: "Midnight Sage",
    class: "bg-[linear-gradient(135deg,#1E293B,#0F172A,#581C87)]",
    colors: ["#1E293B", "#0F172A", "#581C87"],
  },
];

const FONTS = [
  { name: "Elegant Serif", family: "Georgia, serif" },
  { name: "Modern Sans", family: "'Poppins', sans-serif" },
  { name: "Classic Display", family: "Impact, Charcoal, sans-serif" },
];

export function QuoteImageGenerator({ quote, onClose }: QuoteImageGeneratorProps) {
  const [selectedGradient, setSelectedGradient] = useState(0);
  const [selectedFont, setSelectedFont] = useState(0);
  const [showBranding, setShowBranding] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  // Custom Affirmation Creator states
  const [isCustomMode, setIsCustomMode] = useState(!quote);
  const [customText, setCustomText] = useState(quote ? quote.quote : "");
  const [customAuthor, setCustomAuthor] = useState(quote ? quote.author : "");
  const [customCategory, setCustomCategory] = useState(quote ? quote.category : "My Spark");

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Sync state if quote changes
  useEffect(() => {
    if (quote && !isCustomMode) {
      setCustomText(quote.quote);
      setCustomAuthor(quote.author);
      setCustomCategory(quote.category);
    }
  }, [quote, isCustomMode]);

  const activeText = isCustomMode ? customText : quote?.quote || "";
  const activeAuthor = isCustomMode ? customAuthor : quote?.author || "Unknown";
  const activeCategory = isCustomMode ? customCategory : quote?.category || "My Spark";

  const handleExport = () => {
    const canvas = canvasRef.current;
    if (!canvas) {
      toast.error("Unable to generate image. Please try again.");
      return;
    }

    if (!activeText.trim()) {
      toast.error("Please enter affirmation text before exporting!");
      return;
    }

    setIsExporting(true);
    toast.info("Generating your high-resolution card...", { duration: 1500 });

    setTimeout(() => {
      try {
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("Could not get canvas context");

        // 1. Setup high-res canvas (1080x1080 for Instagram/Socials)
        const size = 1080;
        canvas.width = size;
        canvas.height = size;

        // 2. Draw Background Gradient
        const gradientInfo = GRADIENTS[selectedGradient];
        const grad = ctx.createLinearGradient(0, 0, size, size);
        grad.addColorStop(0, gradientInfo.colors[0]);
        grad.addColorStop(0.5, gradientInfo.colors[1]);
        grad.addColorStop(1, gradientInfo.colors[2]);

        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, size, size);

        // 3. Draw subtle glowing circles (premium touch)
        ctx.fillStyle = "rgba(255, 255, 255, 0.05)";
        ctx.beginPath();
        ctx.arc(size * 0.8, size * 0.2, 300, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "rgba(255, 255, 255, 0.03)";
        ctx.beginPath();
        ctx.arc(size * 0.2, size * 0.8, 350, 0, Math.PI * 2);
        ctx.fill();

        // 4. Draw large quote marks
        ctx.fillStyle = "rgba(255, 255, 255, 0.15)";
        ctx.font = "bold 240px Georgia, serif";
        ctx.textAlign = "left";
        ctx.textBaseline = "top";
        ctx.fillText("“", size * 0.08, size * 0.15);

        // 5. Draw Quote Text
        ctx.fillStyle = "#FFFFFF";
        const fontInfo = FONTS[selectedFont];
        ctx.font = `500 48px ${fontInfo.family}`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        const text = `“${activeText.trim()}”`;
        const maxWidth = size * 0.76;
        const words = text.split(" ");
        const lines: string[] = [];
        let currentLine = "";

        // Simple text wrap
        for (let n = 0; n < words.length; n++) {
          const testLine = currentLine + words[n] + " ";
          const metrics = ctx.measureText(testLine);
          if (metrics.width > maxWidth && n > 0) {
            lines.push(currentLine.trim());
            currentLine = words[n] + " ";
          } else {
            currentLine = testLine;
          }
        }
        lines.push(currentLine.trim());

        // Draw wrapped lines centered
        const lineHeight = 66;
        const startY = size / 2 - (lines.length / 2) * lineHeight;
        lines.forEach((line, index) => {
          ctx.fillText(line, size / 2, startY + index * lineHeight);
        });

        // 6. Draw Author
        const authorText = activeAuthor.trim() ? `— ${activeAuthor.trim()}` : "— Unknown";
        ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
        ctx.font = `italic 36px ${fontInfo.family}`;
        ctx.fillText(authorText, size / 2, startY + lines.length * lineHeight + 40);

        // 7. Draw Category Tag
        ctx.fillStyle = "rgba(255, 255, 255, 0.25)";
        ctx.font = "bold 26px 'Poppins', sans-serif";
        ctx.fillText(
          activeCategory.toUpperCase().trim(),
          size / 2,
          startY + lines.length * lineHeight + 110,
        );

        // 8. Draw branding watermark
        if (showBranding) {
          ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
          ctx.font = "bold 28px 'Poppins', sans-serif";
          ctx.fillText("DAILYSPARK", size / 2, size * 0.9);
        }

        // 9. Trigger file download
        const url = canvas.toDataURL("image/png");
        const link = document.createElement("a");
        link.download = `DailySpark_Card_${Date.now()}.png`;
        link.href = url;
        link.click();

        toast.success("Affirmation card saved successfully!", {
          description: "Downloaded to your device gallery.",
          className: "rounded-2xl",
        });
        onClose();
      } catch (err) {
        console.error("Canvas export error:", err);
        toast.error("Export failed. Please check permissions.");
      } finally {
        setIsExporting(false);
      }
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-background/80 backdrop-blur-md animate-fade-in"
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-lg overflow-y-auto max-h-[90vh] rounded-3xl bg-card border border-border p-6 shadow-glow animate-scale-in scrollbar-none">
        {/* Hidden high-res canvas */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg font-bold">
            <ImageIcon className="h-5 w-5 text-primary" /> Affirmation Designer
          </h2>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors hover:bg-muted/80 hover:text-foreground active:scale-95"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </div>

        {/* Mode Selector Toggle (only show if a quote was actually passed) */}
        {quote && (
          <div className="mt-4 flex rounded-2xl bg-muted p-1">
            <button
              onClick={() => setIsCustomMode(false)}
              className={`flex-1 rounded-xl py-2 text-xs font-bold transition-all ${
                !isCustomMode
                  ? "bg-card text-foreground shadow-soft"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Current Quote
            </button>
            <button
              onClick={() => setIsCustomMode(true)}
              className={`flex-1 rounded-xl py-2 text-xs font-bold transition-all ${
                isCustomMode
                  ? "bg-card text-foreground shadow-soft"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <span className="flex items-center justify-center gap-1.5">
                <Edit3 className="h-3.5 w-3.5" /> Custom Text
              </span>
            </button>
          </div>
        )}

        {/* Live Preview Card */}
        <div className="mt-5 flex justify-center">
          <div
            className={`relative aspect-square w-full max-w-[260px] overflow-hidden rounded-2xl shadow-soft p-5 text-white flex flex-col justify-between transition-all duration-300 ${GRADIENTS[selectedGradient].class}`}
          >
            <span className="text-4xl font-serif text-white/20 absolute left-3 top-2 select-none">
              “
            </span>
            <div className="absolute right-4 top-4">
              <span className="rounded-full bg-white/20 px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider backdrop-blur-sm truncate max-w-[100px]">
                {activeCategory || "My Spark"}
              </span>
            </div>

            <div
              style={{ fontFamily: FONTS[selectedFont].family }}
              className="flex-1 flex flex-col justify-center text-center px-1 mt-4 overflow-hidden"
            >
              <p className="text-[12px] font-semibold leading-relaxed mb-2 break-words max-h-[140px] overflow-y-auto scrollbar-none">
                {activeText.trim() ? `“${activeText.trim()}”` : "“Type your affirmation here...”"}
              </p>
              <p className="text-[9px] opacity-90 italic truncate">
                — {activeAuthor.trim() || "Unknown"}
              </p>
            </div>

            {showBranding && (
              <div className="text-center text-[8px] font-bold text-white/40 tracking-widest mt-2 select-none">
                DAILYSPARK
              </div>
            )}
          </div>
        </div>

        {/* Custom Text Editor Controls (Only in Custom Mode) */}
        {isCustomMode && (
          <div className="mt-5 space-y-3 bg-muted/30 border border-border/60 p-4 rounded-2xl animate-fade-in">
            <div>
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">
                Your Affirmation Text
              </label>
              <textarea
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                placeholder="Write something inspiring..."
                maxLength={200}
                className="w-full min-h-[60px] rounded-xl border border-border bg-card p-2.5 text-xs outline-none focus:border-primary/50 resize-none font-medium leading-relaxed"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">
                  Author / Signature
                </label>
                <input
                  type="text"
                  value={customAuthor}
                  onChange={(e) => setCustomAuthor(e.target.value)}
                  placeholder="e.g. My Mind"
                  maxLength={30}
                  className="w-full rounded-xl border border-border bg-card px-2.5 py-1.5 text-xs outline-none focus:border-primary/50 font-medium"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">
                  Tag Category
                </label>
                <input
                  type="text"
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  placeholder="e.g. Affirmation"
                  maxLength={20}
                  className="w-full rounded-xl border border-border bg-card px-2.5 py-1.5 text-xs outline-none focus:border-primary/50 font-medium"
                />
              </div>
            </div>
          </div>
        )}

        {/* Visual Settings Controls */}
        <div className="mt-5 space-y-4">
          {/* Gradient Chooser */}
          <div>
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              Card Background
            </label>
            <div className="flex gap-2 mt-1.5 overflow-x-auto pb-1 scrollbar-none">
              {GRADIENTS.map((g, idx) => (
                <button
                  key={g.name}
                  onClick={() => setSelectedGradient(idx)}
                  className={`relative flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl transition-transform active:scale-90 ${g.class}`}
                  title={g.name}
                >
                  {selectedGradient === idx && (
                    <div className="flex h-4.5 w-4.5 items-center justify-center rounded-full bg-white text-primary shadow-soft animate-scale-in">
                      <Check className="h-3 w-3 stroke-[3]" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Font Selector */}
          <div>
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              Font Style
            </label>
            <div className="flex gap-2 mt-1.5">
              {FONTS.map((f, idx) => (
                <button
                  key={f.name}
                  onClick={() => setSelectedFont(idx)}
                  className={`flex-1 rounded-xl py-2 px-3 text-xs font-semibold border transition-all ${
                    selectedFont === idx
                      ? "bg-primary border-primary text-primary-foreground shadow-soft"
                      : "bg-muted border-border text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  <span style={{ fontFamily: f.family }}>{f.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Options */}
          <div className="flex items-center justify-between border-t border-border pt-4">
            <span className="text-xs font-semibold text-foreground">Include DailySpark logo</span>
            <button
              role="switch"
              aria-checked={showBranding}
              onClick={() => setShowBranding(!showBranding)}
              className={`relative h-6 w-11 rounded-full transition-colors ${
                showBranding ? "bg-primary" : "bg-muted"
              }`}
            >
              <span
                className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-soft transition-transform ${
                  showBranding ? "translate-x-5.5" : "translate-x-0.5"
                }`}
              />
            </button>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={handleExport}
          disabled={isExporting}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-gradient py-3.5 text-sm font-bold text-white shadow-glow transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
        >
          {isExporting ? (
            <>
              <Sparkles className="h-4 w-4 animate-spin" /> Generating PNG...
            </>
          ) : (
            <>
              <Download className="h-4 w-4" /> Download Card Image
            </>
          )}
        </button>
      </div>
    </div>
  );
}
