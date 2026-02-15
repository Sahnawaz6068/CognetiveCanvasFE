import React, { useRef, useState, useCallback, useEffect } from 'react'
import { Tldraw, useEditor } from 'tldraw'
import 'tldraw/tldraw.css'
import {
  Presentation,
  Users,
  Share2,
  FileDown,
  Sparkles,
  Save,
  Loader2
} from 'lucide-react';

/* ================= EDITOR TRACKER ================= */
/**
 * This component sits INSIDE Tldraw to grab the editor instance
 */
const EditorTracker = ({ onReady }) => {
  const editor = useEditor()
  
  useEffect(() => {
    if (editor) {
      onReady(editor)
    }
  }, [editor, onReady])

  return null
}

/* ================= MAIN COMPONENT ================= */
const Canvas = () => {
  // Use a ref for the editor to avoid re-renders, but state for the "Ready" UI
  const editorRef = useRef(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isReady, setIsReady] = useState(false)
  const [canvasId, setCanvasId] = useState(null) // To track existing document for updates

  const handleEditorReady = useCallback((editor) => {
    console.log('Editor is ready and captured')
    editorRef.current = editor
    setIsReady(true)
  }, [])

  /* ---------------- SAVE LOGIC ---------------- */
  const handleSaveCanvas = async () => {
    // Robust check for the editor and store
    if (!editorRef.current || !editorRef.current.store) {
      return alert('Canvas is still initializing...')
    }

    setIsSaving(true)
    try {
      /**
       * Version Safe Snapshot Capture:
       * Try getSnapshot() first, fallback to serialize() if using older tldraw
       */
      const store = editorRef.current.store
      const snapshot = typeof store.getSnapshot === 'function' 
        ? store.getSnapshot() 
        : store.serialize()
      
      const response = await fetch('http://localhost:3000/api/v1/canvas', {
        method: 'POST', // Use POST (your service layer handles create vs update logic)
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: canvasId, // Send this so backend knows to update instead of create
          title: 'System Design – OS Basics',
          snapshot
        })
      })

      const result = await response.json()
      
      if (!result.success) throw new Error(result.message)
      
      // Update our local ID state so next click is an UPDATE
      if (result.data?._id) {
        setCanvasId(result.data._id)
      }

      alert('Canvas saved successfully!')
    } catch (err) {
      console.error('Save error details:', err)
      alert(`Save failed: ${err.message}`)
    } finally {
      setIsSaving(false)
    }
  }

  /* ---------------- PPT GENERATION ---------------- */
  const handleGeneratePPT = async () => {
    if (!editorRef.current) return

    const shapes = Array.from(editorRef.current.getCurrentPageShapes())
    if (shapes.length === 0) {
      alert('Canvas is empty! Draw something first.')
      return
    }

    setIsGenerating(true)
    // Simulate API delay
    setTimeout(() => {
      setIsGenerating(false)
      alert('PPT structure generated from shapes!')
    }, 1500)
  }

  return (
    <div className="flex h-screen w-full bg-[#1e1e1e] overflow-hidden font-sans text-zinc-200">
      
      {/* LEFT SIDEBAR */}
      <aside className="w-16 border-r border-zinc-800 bg-[#0a0a0a] flex flex-col items-center py-6 gap-8 z-50">
        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
          <Sparkles size={20} className="text-white" />
        </div>
        <nav className="flex flex-col gap-6">
          <IconButton icon={<Users size={22} />} label="Collab" />
          <IconButton icon={<Share2 size={22} />} label="Share" />
          <IconButton icon={<FileDown size={22} />} label="Export" />
        </nav>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col relative">
        <header className="h-16 border-b border-zinc-800 bg-[#0a0a0a] flex items-center justify-between px-8 z-10 shadow-sm">
          <div>
            <h2 className="text-sm font-semibold tracking-wide uppercase text-zinc-500">Project</h2>
            <p className="text-base font-medium text-zinc-100">System Design – OS Basics</p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleSaveCanvas}
              disabled={isSaving || !isReady}
              className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 px-5 py-2 rounded-lg text-sm font-medium transition-all active:scale-95"
            >
              {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {isSaving ? 'Saving...' : 'Save'}
            </button>

            <button
              onClick={handleGeneratePPT}
              disabled={isGenerating || !isReady}
              className="flex items-center gap-2 bg-white text-black hover:bg-zinc-200 disabled:opacity-50 px-5 py-2 rounded-lg text-sm font-bold transition-all active:scale-95 shadow-md"
            >
              {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <Presentation size={16} />}
              {isGenerating ? 'Processing...' : 'Generate PPT'}
            </button>
          </div>
        </header>

        {/* CANVAS */}
        <div className="flex-1 relative bg-[#121212]">
          <Tldraw 
            inferDarkMode 
            persistenceKey="cognetive-canvas-1"
          >
            <EditorTracker onReady={handleEditorReady} />
          </Tldraw>
        </div>
      </main>
    </div>
  )
}

function IconButton({ icon, label }) {
  return (
    <button title={label} className="p-2.5 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-xl transition-all group">
      {React.cloneElement(icon, { strokeWidth: 1.5 })}
    </button>
  )
}

export default Canvas