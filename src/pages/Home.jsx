import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Users,
  ShieldCheck,
  Presentation,
  History,
  ArrowRight,
} from "lucide-react";
import Canvas from "./CanvasPage";

export default function Home() {
  const navigate = useNavigate();
  return (
    <div className="bg-black text-white">
      {/* NAVBAR */}
      <nav className="sticky top-0 z-50 backdrop-blur border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-lg font-semibold tracking-tight">
            Cognitive Canvas
          </h1>

          <div className="hidden md:flex items-center gap-8 text-sm text-zinc-400">
            <a href="#features" className="hover:text-white">
              Features
            </a>
            <a href="#how" className="hover:text-white">
              How it works
            </a>
            <a
              href="#start"
              className="text-white border border-white/10 px-4 py-1.5 rounded-md hover:bg-white/5"
            >
              Get Started
            </a>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 py-32 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <motion.h2
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-5xl md:text-6xl font-semibold leading-tight tracking-tight"
            >
              Collaborate on ideas.
              <br />
              <span className="text-zinc-400">
                Turn knowledge into presentations.
              </span>
            </motion.h2>

            <p className="mt-8 text-zinc-400 max-w-xl text-lg leading-relaxed">
              Cognitive Canvas is a real-time collaborative workspace for
              students and teachers to structure knowledge and generate
              AI-powered presentations with controlled access.
            </p>

            <div className="mt-12 flex items-center gap-6">
              <button className="bg-white text-black px-7 py-3 rounded-md font-medium hover:bg-zinc-200 transition">
                Start Collaborating
              </button>
              <button className="flex items-center gap-2 text-zinc-400 hover:text-white transition">
                View Demo <ArrowRight size={16} />
              </button>
            </div>
          </div>

          {/* Visual placeholder (grid principle) */}
          <div className="hidden lg:block" onClick={()=>navigate("/canvas")}>
            <div className="aspect-[4/3] rounded-xl border border-white/10 overflow-hidden">
              <Canvas />
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="border-t border-white/5 bg-zinc-950">
        <div className="max-w-7xl mx-auto px-6 py-28">
          <div className="max-w-2xl mb-20">
            <h3 className="text-3xl font-semibold tracking-tight">
              Designed for serious collaboration
            </h3>
            <p className="mt-4 text-zinc-400 leading-relaxed">
              Built with real-time systems, access control, and structured
              workflows to support academic collaboration.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-14">
            <Feature
              icon={Users}
              title="Real-Time Collaboration"
              desc="Multiple users work on the same canvas with live presence, block-level updates, and conflict handling."
            />
            <Feature
              icon={ShieldCheck}
              title="Role-Based Access Control"
              desc="Fine-grained permissions for admins, editors, and viewers ensure secure academic workflows."
            />
            <Feature
              icon={Presentation}
              title="Canvas to PPT Generation"
              desc="Transform structured notes into AI-assisted presentations using a deterministic pipeline."
            />
            <Feature
              icon={History}
              title="Versioning & History"
              desc="Track changes over time and restore previous versions of canvases and presentations."
            />
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-28">
          <h3 className="text-3xl font-semibold tracking-tight mb-20">
            How it works
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
            <Step
              step="01"
              title="Create or join a workspace"
              desc="Set up a collaborative canvas for your class, subject, or group."
            />
            <Step
              step="02"
              title="Collaborate with control"
              desc="Edit notes together in real time with permissions and version tracking."
            />
            <Step
              step="03"
              title="Generate presentations"
              desc="Convert finalized content into AI-powered PPTs in seconds."
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section
        id="start"
        className="border-t border-white/5 bg-gradient-to-b from-zinc-950 to-black"
      >
        <div className="max-w-4xl mx-auto px-6 py-32 text-center">
          <h3 className="text-4xl font-semibold tracking-tight">
            Built for learning. Designed for scale.
          </h3>
          <p className="mt-6 text-zinc-400 text-lg leading-relaxed">
            Organize knowledge, collaborate securely, and generate presentations
            with confidence.
          </p>
          <button className="mt-12 bg-white text-black px-10 py-3 rounded-md font-medium hover:bg-zinc-200 transition">
            Get Started
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-8 text-sm text-zinc-500 text-center">
          © {new Date().getFullYear()} Cognitive Canvas. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

/* ---------- SUB COMPONENTS ---------- */

function Feature({ icon: Icon, title, desc }) {
  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ type: "spring", stiffness: 260 }}
      className="flex gap-5"
    >
      <div className="flex-shrink-0">
        <Icon size={28} />
      </div>
      <div>
        <h4 className="text-lg font-medium tracking-tight">{title}</h4>
        <p className="mt-2 text-zinc-400 leading-relaxed">{desc}</p>
      </div>
    </motion.div>
  );
}

function Step({ step, title, desc }) {
  return (
    <div>
      <span className="text-sm text-zinc-500 tracking-wider">{step}</span>
      <h4 className="mt-4 text-xl font-medium tracking-tight">{title}</h4>
      <p className="mt-3 text-zinc-400 leading-relaxed">{desc}</p>
    </div>
  );
}
