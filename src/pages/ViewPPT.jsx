import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Home, LayoutGrid } from "lucide-react";

export default function ViewPPT() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [ppt, setPpt] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPPT = async () => {
      try {
        const res = await fetch(`http://localhost:3000/api/v1/ppt/${id}`);
        const data = await res.json();

        if (data.success) {
          setPpt(data.data);
        }
      } catch (error) {
        console.error("Failed to load PPT:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPPT();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!ppt) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        PPT not found
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-6xl mx-auto px-6 py-6">
        {/* TOP BAR */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {/* BACK */}
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-md
              border border-white/10 text-sm text-zinc-300
              hover:bg-white/5 transition"
            >
              <ArrowLeft size={16} />
              Back
            </button>

            {/* CANVAS */}
            <button
              onClick={() => navigate("/canvas")}
              className="flex items-center gap-2 px-3 py-1.5 rounded-md
              border border-white/10 text-sm text-zinc-300
              hover:bg-white/5 transition"
            >
              <LayoutGrid size={16} />
              Canvas
            </button>

            {/* HOME */}
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-2 px-3 py-1.5 rounded-md
              border border-white/10 text-sm text-zinc-300
              hover:bg-white/5 transition"
            >
              <Home size={16} />
              Home
            </button>
          </div>
        </div>

        {/* TITLE */}
        <h1 className="text-2xl font-semibold mb-4">{ppt.topic}</h1>

        {/* PPT PREVIEW */}
        <iframe
          title="ppt-preview"
          srcDoc={ppt.htmlContent}
          className="w-full h-[80vh] border border-white/10 rounded-md bg-white"
        />
      </div>
    </div>
  );
}
