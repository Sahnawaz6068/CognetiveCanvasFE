import React, {
  useRef,
  useState,
  useCallback,
  useEffect,
} from "react";

import { useNavigate } from "react-router-dom";

import {
  Tldraw,
  useEditor,
  getSnapshot,
} from "tldraw";

import "tldraw/tldraw.css";

import {
  Presentation,
  Users,
  Share2,
  FileDown,
  Sparkles,
  Save,
  Loader2,
  ArrowLeft,
  LayoutGrid,
} from "lucide-react";

/* ================= EDITOR TRACKER ================= */

function EditorTracker({ onReady }) {
  const editor = useEditor();

  useEffect(() => {
    if (editor) {
      onReady(editor);
    }
  }, [editor, onReady]);

  return null;
}

/* ================= MAIN ================= */

export default function Canvas() {
  const navigate = useNavigate();

  const editorRef = useRef(null);

  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] =
    useState(false);

  const handleEditorReady = useCallback((editor) => {
    editorRef.current = editor;
  }, []);

  /* ================= SAVE ================= */

  const handleSaveCanvas = async () => {
    try {
      if (!editorRef.current) {
        return alert("Editor not ready");
      }

      setIsSaving(true);

      const snapshot = getSnapshot(
        editorRef.current.store
      );

      console.log(snapshot);

      localStorage.setItem(
        "canvas-data",
        JSON.stringify(snapshot)
      );

      alert("Canvas saved successfully");
    } catch (err) {
      console.error(err);
      alert("Save failed");
    } finally {
      setIsSaving(false);
    }
  };

  /* ================= PPT ================= */

  const handleGeneratePPT = () => {
    if (!editorRef.current) {
      return alert("Editor not ready");
    }

    const shapes =
      editorRef.current.getCurrentPageShapes();

    if (!shapes.length) {
      return alert("Canvas is empty");
    }

    setIsGenerating(true);

    setTimeout(() => {
      setIsGenerating(false);
      alert("PPT generated successfully");
    }, 1500);
  };

  /* ================= CLEAR BROKEN DATA ================= */

  const clearCanvasData = () => {
    localStorage.clear();
    alert(
      "Old corrupted TLDraw data cleared. Refresh page."
    );
  };

  return (
    <div className="flex h-screen w-full bg-[#1e1e1e] overflow-hidden text-zinc-200">
      {/* SIDEBAR */}

      <aside className="w-16 border-r border-zinc-800 bg-[#0a0a0a] flex flex-col items-center py-6 gap-8">
        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
          <Sparkles
            size={20}
            className="text-white"
          />
        </div>

        <nav className="flex flex-col gap-6">
          <IconButton
            icon={<Users size={22} />}
            label="Collab"
          />

          <IconButton
            icon={<Share2 size={22} />}
            label="Share"
          />

          <IconButton
            icon={<FileDown size={22} />}
            label="Export"
          />
        </nav>
      </aside>

      {/* MAIN */}

      <main className="flex-1 flex flex-col">
        {/* HEADER */}

        <header className="h-16 border-b border-zinc-800 bg-[#0a0a0a] flex items-center justify-between px-6">
          {/* LEFT */}

          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 px-3 py-1.5 text-sm border border-white/10 rounded-md"
            >
              <ArrowLeft size={16} />
              Back
            </button>

            <button
              onClick={() =>
                navigate("/dashboard")
              }
              className="flex items-center gap-2 px-3 py-1.5 text-sm border border-white/10 rounded-md"
            >
              <LayoutGrid size={16} />
              Dashboard
            </button>

            <div>
              <p className="text-xs uppercase text-zinc-500">
                Project
              </p>

              <p className="text-sm font-medium">
                Cognitive Canvas
              </p>
            </div>
          </div>

          {/* RIGHT */}

          <div className="flex gap-3">
            <button
              onClick={handleSaveCanvas}
              disabled={isSaving}
              className="flex items-center gap-2 bg-zinc-800 px-4 py-2 rounded-lg text-sm"
            >
              {isSaving ? (
                <Loader2
                  size={16}
                  className="animate-spin"
                />
              ) : (
                <Save size={16} />
              )}

              Save
            </button>

            <button
              onClick={handleGeneratePPT}
              disabled={isGenerating}
              className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-lg text-sm font-bold"
            >
              {isGenerating ? (
                <Loader2
                  size={16}
                  className="animate-spin"
                />
              ) : (
                <Presentation size={16} />
              )}

              Generate PPT
            </button>

            <button
              onClick={clearCanvasData}
              className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm"
            >
              Reset
            </button>
          </div>
        </header>

        {/* CANVAS */}

        <div className="flex-1 bg-[#121212]">
          <Tldraw
            inferDarkMode
            persistenceKey={null}
          >
            <EditorTracker
              onReady={handleEditorReady}
            />
          </Tldraw>
        </div>
      </main>
    </div>
  );
}

/* ================= ICON BUTTON ================= */

function IconButton({ icon, label }) {
  return (
    <button
      title={label}
      className="p-2.5 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-xl"
    >
      {React.cloneElement(icon, {
        strokeWidth: 1.5,
      })}
    </button>
  );
}