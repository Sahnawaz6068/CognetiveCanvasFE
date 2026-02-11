import { Plus, Search } from "lucide-react";
import CanvasCard from "../Components/CanvasCard";

export default function CanvasDashboard() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* CENTERED CONTAINER */}
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-8">
        {/* HEADER */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">
              Your Canvases
            </h1>
            <p className="text-sm text-zinc-400 mt-1">
              Create, organize, and collaborate on your workspaces
            </p>
          </div>

          {/* CREATE BUTTON */}
          <button
            className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-md
            font-medium hover:bg-zinc-200 transition"
          >
            <Plus size={18} />
            New Canvas
          </button>
        </div>

        {/* SEARCH BAR */}
        <div className="relative max-w-md mb-10">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
          />
          <input
            type="text"
            placeholder="Search by canvas name or tag..."
            className="w-full bg-zinc-950 border border-white/10 rounded-md pl-10 pr-4 py-3
            text-sm placeholder:text-zinc-600 focus:border-white focus:ring-1
            focus:ring-white/30 outline-none transition"
          />
        </div>
        {/* FILTER BAR */}
        <div className="flex items-center gap-3 mb-10">
          <span className="text-sm text-zinc-400">Filter:</span>

          <button
            className="px-3 py-1.5 rounded-md text-sm border border-white/10
    bg-white text-black font-medium hover:bg-zinc-200 transition"
          >
            All
          </button>

          <button
            className="px-3 py-1.5 rounded-md text-sm border border-white/10
    text-zinc-300 hover:bg-white/5 transition"
          >
            Canvas
          </button>

          <button
            className="px-3 py-1.5 rounded-md text-sm border border-white/10
    text-zinc-300 hover:bg-white/5 transition"
          >
            AI PPT
          </button>
        </div>

        {/* CANVAS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <CanvasCard
            title="DSA Notes"
            description="Structured notes for interview preparation"
            tags={["DSA", "Interview", "Study"]}
          />

          <CanvasCard
            title="System Design"
            description="High-level architecture diagrams"
            tags={["Backend", "Architecture"]}
          />

          <CanvasCard
            title="AI PPT Generator"
            description="Slides generated from structured content"
            tags={["AI", "Presentation"]}
          />
        </div>
      </div>
    </div>
  );
}
