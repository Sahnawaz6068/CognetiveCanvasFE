import { Tldraw } from 'tldraw'
import 'tldraw/tldraw.css'
import React, { useState } from 'react'
import { 
  Presentation, 
  Users, 
  Share2, 
  FileDown, 
  Sparkles 
} from 'lucide-react'

const Canvas = () => {
  const [isGenerating, setIsGenerating] = useState(false)

  const handleGeneratePPT = () => {
    setIsGenerating(true)
    setTimeout(() => setIsGenerating(false), 2000)
  }

  return (
    <div className="flex h-screen w-full bg-[#1e1e1e] overflow-hidden">

      {/* LEFT SIDEBAR */}
      <aside className="w-14 border-r border-zinc-800 bg-[#0a0a0a]
        flex flex-col items-center py-4 gap-6">

        {/* LOGO / AI ENTRY */}
        <div className="w-9 h-9 bg-white rounded-md flex items-center justify-center">
          <Sparkles size={18} className="text-black" />
        </div>

        <div className="flex flex-col gap-3 mt-8">
          <IconButton icon={<Users size={20} />} />
          <IconButton icon={<Share2 size={20} />} />
          <IconButton icon={<FileDown size={20} />} />
        </div>
      </aside>

      {/* CENTER CANVAS */}
      <main className="flex-1 flex flex-col relative">

        {/* TOP BAR */}
        <header className="h-14 border-b border-zinc-800 bg-[#0a0a0a]
          flex items-center justify-between px-6">

          <div className="flex items-center gap-3">
            <h2 className="text-sm font-medium text-zinc-200">
              System Design – OS Basics
            </h2>
            <span className="px-2 py-0.5 rounded bg-zinc-800
              text-[10px] text-zinc-400 uppercase tracking-widest">
              Editing
            </span>
          </div>

          {/* PRIMARY ACTION */}
          <button
            onClick={handleGeneratePPT}
            className="flex items-center gap-2
              bg-white text-black px-4 py-1.5 rounded-md
              text-sm font-medium hover:bg-zinc-200 transition"
          >
            <Presentation size={16} />
            {isGenerating ? 'Generating…' : 'Generate PPT'}
          </button>
        </header>

        {/* DRAW SURFACE */}
        <div className="flex-1 relative">
          <Tldraw inferDarkMode />

          {/* COLLAB AVATARS */}
          <div className="absolute bottom-4 right-4 flex -space-x-2">
            {['JD', 'SP', '+3'].map((u, i) => (
              <div
                key={i}
                className="w-8 h-8 rounded-full border-2 border-[#1e1e1e]
                  bg-zinc-700 flex items-center justify-center
                  text-[10px] font-semibold text-white"
              >
                {u}
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* RIGHT PANEL – PPT PREVIEW */}
      <section className="hidden xl:flex w-80 border-l border-zinc-800
        bg-[#0a0a0a] flex-col">

        <div className="p-4 border-b border-zinc-800">
          <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
            Generated Slides
          </h3>
          <p className="text-[11px] text-zinc-500 mt-1">
            Derived from canvas
          </p>
        </div>

        <div className="flex-1 p-4 space-y-4 overflow-y-auto">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="aspect-video bg-zinc-900 rounded-md
                border border-zinc-800 p-3 cursor-pointer
                hover:border-zinc-600 transition"
            >
              <div className="space-y-2">
                <div className="h-2 w-2/3 bg-zinc-700 rounded" />
                <div className="h-1 w-full bg-zinc-800 rounded" />
                <div className="h-1 w-full bg-zinc-800 rounded" />
              </div>
              <span className="block mt-2 text-[10px] text-zinc-500">
                Slide {i}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

function IconButton({ icon }) {
  return (
    <button className="p-2 text-zinc-500 hover:text-white transition">
      {icon}
    </button>
  )
}

export default Canvas
