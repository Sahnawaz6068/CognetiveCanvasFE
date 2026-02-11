import { useState } from "react";
import {
  Sparkles,
  Loader2,
  Save,
  Maximize2,
  Minimize2,
} from "lucide-react";
import { motion } from "framer-motion";

export default function GeneratePPT() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [focusMode, setFocusMode] = useState(false);

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-[1600px] mx-auto px-6 lg:px-10 py-8">

        {/* HEADER */}
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

        {/* MAIN GRID */}
        <div
          className={`grid gap-6 transition-all ${
            focusMode
              ? "grid-cols-1"
              : "grid-cols-1 lg:grid-cols-[1fr_3fr]"
          }`}
        >
          {/* LEFT INPUT PANEL */}
          {!focusMode && (
            <div className="bg-zinc-950 border border-white/10 rounded-xl p-6">
              <h2 className="text-lg font-semibold mb-4">
                Input
              </h2>

              <div className="mb-6">
                <label className="block text-xs uppercase tracking-wide text-zinc-500 mb-2">
                  Topic
                </label>
                <input
                  type="text"
                  placeholder="Introduction to Machine Learning"
                  className="w-full bg-black border border-white/10 rounded-md px-4 py-3
                  text-sm placeholder:text-zinc-600 focus:border-white
                  focus:ring-1 focus:ring-white/30 outline-none transition"
                />
              </div>

              <div className="mb-6">
                <label className="block text-xs uppercase tracking-wide text-zinc-500 mb-2">
                  Slides
                </label>
                <select
                  className="w-full bg-black border border-white/10 rounded-md px-4 py-3
                  text-sm focus:border-white focus:ring-1 focus:ring-white/30 outline-none transition"
                >
                  <option>6 Slides</option>
                  <option>8 Slides</option>
                  <option>10 Slides</option>
                </select>
              </div>

              <button
                onClick={() => setIsGenerating(true)}
                className="w-full flex items-center justify-center gap-2
                bg-white text-black py-3 rounded-md font-medium
                hover:bg-zinc-200 transition"
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

          {/* RIGHT PREVIEW */}
          <div className="bg-zinc-950 border border-white/10 rounded-xl p-4 relative">
            {/* TOP ACTION BAR */}
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold">
                Preview
              </h2>

              <div className="flex gap-2">
                <button
                  onClick={() => setFocusMode(!focusMode)}
                  className="p-2 border border-white/10 rounded-md
                  hover:bg-white/5 transition"
                >
                  {focusMode ? (
                    <Minimize2 size={16} />
                  ) : (
                    <Maximize2 size={16} />
                  )}
                </button>
              </div>
            </div>

            {/* SLIDES */}
            <div className="h-[560px] overflow-y-auto space-y-6 pr-2">
              <Slide
                title="Introduction to Machine Learning"
                points={[
                  "What is Machine Learning?",
                  "Why it matters",
                  "Real-world applications",
                ]}
              />

              <Slide
                title="Types of Machine Learning"
                points={[
                  "Supervised Learning",
                  "Unsupervised Learning",
                  "Reinforcement Learning",
                ]}
              />
            </div>

            {/* SAVE */}
            {!focusMode && (
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

function Slide({ title, points }) {
  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      transition={{ duration: 0.2 }}
      className="aspect-video bg-white text-black rounded-md p-6 shadow-md"
    >
      <h3 className="text-xl font-semibold mb-4">
        {title}
      </h3>
      <ul className="list-disc pl-5 space-y-2 text-sm">
        {points.map((p, i) => (
          <li key={i}>{p}</li>
        ))}
      </ul>
    </motion.div>
  );
}
