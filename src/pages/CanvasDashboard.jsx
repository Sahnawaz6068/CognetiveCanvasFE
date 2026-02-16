import { useEffect, useState } from "react";
import { LayoutGrid, Plus, Search } from "lucide-react";
import CanvasCard from "../Components/CanvasCard";
import { useNavigate } from "react-router-dom";

export default function CanvasDashboard() {
  const [ppts, setPpts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPPTs = async () => {
      try {
        const res = await fetch("http://localhost:3000/api/v1/ppt");
        const data = await res.json();

        if (data.success) {
          setPpts(data.data);
        }
      } catch (error) {
        console.error("Failed to fetch PPTs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPPTs();
  }, []);

  const filteredPpts = ppts.filter((ppt) => {
    const matchesSearch = ppt.topic
      .toLowerCase()
      .includes(search.toLowerCase());

    if (filter === "AI_PPT") return matchesSearch;
    return matchesSearch; // ALL
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-8">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">
              Your Canvases
            </h1>
            <p className="text-sm text-zinc-400 mt-1">
              Create, organize, and collaborate on your workspaces
            </p>
          </div>

          <div className="flex gap-6">
            <button
              onClick={() => navigate("/canvas")}
              className="flex items-center gap-2 px-3 py-1.5 rounded-md
              border border-white/10 text-sm text-zinc-300
              hover:bg-white/5 transition"
            >
              <LayoutGrid size={16} />
              Canvas
            </button>
            <button
              className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-md
            font-medium hover:bg-zinc-200 transition"
            >
              <Plus size={18} />
              New Canvas
            </button>
          </div>
        </div>

        <div className="relative max-w-md mb-8">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
          />
          <input
            type="text"
            placeholder="Search by canvas name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-zinc-950 border border-white/10 rounded-md
            pl-10 pr-4 py-3 text-sm placeholder:text-zinc-600
            focus:border-white focus:ring-1 focus:ring-white/30
            outline-none transition"
          />
        </div>

        <div className="flex items-center gap-3 mb-10">
          <span className="text-sm text-zinc-400">Filter:</span>

          <button
            onClick={() => setFilter("ALL")}
            className={`px-3 py-1.5 rounded-md text-sm border border-white/10
            ${
              filter === "ALL"
                ? "bg-white text-black font-medium"
                : "text-zinc-300 hover:bg-white/5"
            } transition`}
          >
            All
          </button>

          <button
            onClick={() => setFilter("AI_PPT")}
            className={`px-3 py-1.5 rounded-md text-sm border border-white/10
            ${
              filter === "AI_PPT"
                ? "bg-white text-black font-medium"
                : "text-zinc-300 hover:bg-white/5"
            } transition`}
          >
            AI PPT
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPpts.map((ppt) => (
            <div
              key={ppt._id}
              onClick={() => navigate(`/ppt/${ppt._id}`)}
              className="cursor-pointer"
            >
              <CanvasCard
                title={ppt.topic}
                description={`Status: ${ppt.status}`}
                tags={["AI PPT"]}
              />
            </div>
          ))}
        </div>

        {filteredPpts.length === 0 && (
          <p className="text-zinc-400 mt-10">
            No matching presentations found.
          </p>
        )}
      </div>
    </div>
  );
}
