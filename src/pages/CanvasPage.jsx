import React, { useRef, useState, useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Tldraw, useEditor } from 'tldraw'
import 'tldraw/tldraw.css'
import {
  Presentation,
  Users,
  Share2,
  FileDown,
  Sparkles,
  Save,
  Loader2,
  ArrowLeft,
  LayoutGrid
} from 'lucide-react'

/* ================= EDITOR TRACKER ================= */
const EditorTracker = ({ onReady }) => {
  const editor = useEditor()

  useEffect(() => {
    if (editor) onReady(editor)
  }, [editor, onReady])

  return null
}

/* ================= MAIN COMPONENT ================= */
const Canvas = () => {
  const navigate = useNavigate()

  const editorRef = useRef(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isReady, setIsReady] = useState(false)
  const [canvasId, setCanvasId] = useState(null)

  const handleEditorReady = useCallback((editor) => {
    editorRef.current = editor
    setIsReady(true)
  }, [])

  /* ---------------- SAVE ---------------- */
  const handleSaveCanvas = async () => {
    if (!editorRef.current || !editorRef.current.store) {
      return alert('Canvas is still initializing...')
    }

    setIsSaving(true)
    try {
      const store = editorRef.current.store
      const snapshot =
        typeof store.getSnapshot === 'function'
          ? store.getSnapshot()
          : store.serialize()

      const res = await fetch('http://localhost:3000/api/v1/canvas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: canvasId,
          title: 'System Design – OS Basics',
          snapshot
        })
      })

      const result = await res.json()
      if (!result.success) throw new Error(result.message)

      if (result.data?._id) setCanvasId(result.data._id)
      alert('Canvas saved successfully!')
    } catch (err) {
      alert(`Save failed: ${err.message}`)
    } finally {
      setIsSaving(false)
    }
  }

  /* ---------------- GENERATE PPT ---------------- */
  const handleGeneratePPT = async () => {
    if (!editorRef.current) return

    const shapes = Array.from(editorRef.current.getCurrentPageShapes())
    if (!shapes.length) return alert('Canvas is empty')

    setIsGenerating(true)
    setTimeout(() => {
      setIsGenerating(false)
      alert('PPT generated from canvas!')
    }, 1500)
  }

  return (
    <div className="flex h-screen w-full bg-[#1e1e1e] overflow-hidden text-zinc-200">
      {/* LEFT SIDEBAR */}
      <aside className="w-16 border-r border-zinc-800 bg-[#0a0a0a] flex flex-col items-center py-6 gap-8">
        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
          <Sparkles size={20} className="text-white" />
        </div>
        <nav className="flex flex-col gap-6">
          <IconButton icon={<Users size={22} />} label="Collab" />
          <IconButton icon={<Share2 size={22} />} label="Share" />
          <IconButton icon={<FileDown size={22} />} label="Export" />
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
              className="flex items-center gap-2 px-3 py-1.5 text-sm
              border border-white/10 rounded-md text-zinc-300 hover:bg-white/5"
            >
              <ArrowLeft size={16} />
              Back
            </button>

            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2 px-3 py-1.5 text-sm
              border border-white/10 rounded-md text-zinc-300 hover:bg-white/5"
            >
              <LayoutGrid size={16} />
              Dashboard
            </button>

            <div>
              <p className="text-xs uppercase text-zinc-500">Project</p>
              <p className="text-sm font-medium">System Design – OS Basics</p>
            </div>
          </div>

          {/* RIGHT */}
          <div className="flex gap-3">
            <button
              onClick={handleSaveCanvas}
              disabled={isSaving || !isReady}
              className="flex items-center gap-2 bg-zinc-800 px-4 py-2 rounded-lg text-sm disabled:opacity-50"
            >
              {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              Save
            </button>

            <button
              onClick={handleGeneratePPT}
              disabled={isGenerating || !isReady}
              className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-lg text-sm font-bold disabled:opacity-50"
            >
              {isGenerating ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Presentation size={16} />
              )}
              Generate PPT
            </button>
          </div>
        </header>

        {/* CANVAS */}
        <div className="flex-1 bg-[#121212]">
          <Tldraw inferDarkMode persistenceKey="cognitive-canvas-1">
            <EditorTracker onReady={handleEditorReady} />
          </Tldraw>
        </div>
      </main>
    </div>
  )
}

function IconButton({ icon, label }) {
  return (
    <button title={label} className="p-2.5 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-xl">
      {React.cloneElement(icon, { strokeWidth: 1.5 })}
    </button>
  )
}

export default Canvas
