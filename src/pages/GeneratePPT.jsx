import { useState } from "react";
import { Sparkles, Loader2, Save, Maximize2, Minimize2 } from "lucide-react";
import { motion } from "framer-motion";

export default function GeneratePPT() {
  const [topic, setTopic] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  const [htmlContent, setHtmlContent] = useState("");

  const generatePpt = async () => {
    if (!topic.trim()) return;

    setIsGenerating(true);
    setHtmlContent("");

    try {
      const res = await fetch("http://localhost:3000/api/v1/ai-ppt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ topic }),
      });

      const json = await res.json();

      const rawHtml = json.data.htmlContent;

      const fixedHtml = rawHtml.replace(
        "</head>",
        `
  <style>
    * {
      box-sizing: border-box;
    }

    body {
      overflow: auto !important;
    }

    .slide, .content, .card, .panel {
      height: auto !important;
      max-height: none !important;
      overflow: visible !important;
    }

    p, li, span, div {
      white-space: normal !important;
      word-break: break-word !important;
      overflow-wrap: anywhere !important;
    }
  </style>
  </head>
  `,
      );
      setHtmlContent(fixedHtml);

    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-[1600px] mx-auto px-6 lg:px-10 py-8">
        {!focusMode && (
          <div className="mb-8">
            <h1 className="text-3xl font-semibold tracking-tight">
              Generate Presentation
            </h1>
            <p className="text-sm text-zinc-400 mt-1">
              Generate AI-powered slides and preview instantly
            </p>
          </div>
        )}

        <div
          className={`grid gap-6 transition-all ${
            focusMode ? "grid-cols-1" : "grid-cols-1 lg:grid-cols-[1fr_3fr]"
          }`}
        >
          {/* INPUT PANEL */}
          {!focusMode && (
            <div className="bg-zinc-950 border border-white/10 rounded-xl p-6">
              <h2 className="text-lg font-semibold mb-4">Input</h2>

              <div className="mb-6">
                <label className="block text-xs uppercase tracking-wide text-zinc-500 mb-2">
                  Topic
                </label>
                <input
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  type="text"
                  placeholder="Cloud Computing"
                  className="w-full bg-black border border-white/10 rounded-md px-4 py-3
                  text-sm placeholder:text-zinc-600 focus:border-white
                  focus:ring-1 focus:ring-white/30 outline-none transition"
                />
              </div>

              <button
                onClick={generatePpt}
                disabled={isGenerating}
                className="w-full flex items-center justify-center gap-2
                bg-white text-black py-3 rounded-md font-medium
                hover:bg-zinc-200 transition disabled:opacity-60"
              >
                {isGenerating ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles size={18} />
                    Generate PPT
                  </>
                )}
              </button>
            </div>
          )}

          {/* PREVIEW */}
          <div className="bg-zinc-950 border border-white/10 rounded-xl p-4 relative">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold">Preview</h2>

              <button
                onClick={() => setFocusMode(!focusMode)}
                className="p-2 border border-white/10 rounded-md
                hover:bg-white/5 transition"
              >
                {focusMode ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
              </button>
            </div>

            <div className="h-[560px] rounded-md overflow-hidden border border-white/10 bg-black">
              {isGenerating && (
                <div className="h-full flex items-center justify-center text-zinc-400">
                  Generating presentation…
                </div>
              )}

              {!isGenerating && htmlContent && (
                <div className="h-[600px] overflow-hidden border border-white/10 bg-black rounded-md">
                  {htmlContent && (
                    <iframe
                      title="AI PPT Preview"
                      srcDoc={htmlContent}
                      className="w-full h-full border-none"
                      style={{
                        transform: "scale(0.85)",
                        transformOrigin: "top center",
                      }}
                    />
                  )}
                </div>
              )}

              {!isGenerating && !htmlContent && (
                <div className="h-full flex items-center justify-center text-zinc-500">
                  No presentation generated yet
                </div>
              )}
            </div>

            {!focusMode && htmlContent && (
              <button
                className="mt-4 w-full flex items-center justify-center gap-2
                border border-white/10 py-3 rounded-md text-sm
                text-zinc-300 hover:bg-white/5 transition"
              >
                <Save size={16} />
                Save Presentation
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
