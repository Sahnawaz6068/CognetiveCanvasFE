import React from 'react'
import { motion } from 'framer-motion';

function CanvasCard({ title, description, tags }) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="bg-zinc-950 border border-white/10 rounded-lg p-5 cursor-pointer
      hover:border-white/20 transition"
    >
      <h2 className="text-lg font-semibold tracking-tight mb-1">
        {title}
      </h2>

      <p className="text-sm text-zinc-400 mb-4">
        {description}
      </p>

      <div className="flex flex-wrap gap-2">
        {tags.map((tag, index) => (
          <span
            key={index}
            className="text-xs bg-white/5 border border-white/10
            px-2 py-1 rounded-md text-zinc-300"
          >
            {tag}
          </span>
        ))}
      </div>
    </motion.div>
  );
}

export default CanvasCard