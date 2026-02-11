import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

export default function Signin() {
    const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="w-full max-w-md bg-zinc-950/80 backdrop-blur border border-white/10 rounded-xl p-8"
      >
        <h1 className="text-3xl font-semibold tracking-tight">
          Welcome back
        </h1>
        <p className="mt-2 text-sm text-zinc-400">
          Sign in to continue to Cognitive Canvas
        </p>

        <form className="mt-8 space-y-5">
          <div>
            <label className="block text-xs uppercase tracking-wide text-zinc-500 mb-2">
              Email
            </label>
            <input
              type="email"
              placeholder="you@example.com"
              className="w-full bg-black border border-white/10 rounded-md px-4 py-3 text-sm
              placeholder:text-zinc-600 focus:border-white focus:ring-1 focus:ring-white/30 outline-none transition"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wide text-zinc-500 mb-2">
              Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full bg-black border border-white/10 rounded-md px-4 py-3 text-sm
              placeholder:text-zinc-600 focus:border-white focus:ring-1 focus:ring-white/30 outline-none transition"
            />
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 text-zinc-400">
              <input type="checkbox" className="accent-white" />
              Remember me
            </label>

            <button
              type="button"
              className="text-zinc-400 hover:text-white transition"
            >
              Forgot password?
            </button>
          </div>

          <button
            type="submit"
            className="w-full bg-white text-black py-3 rounded-md font-medium
            hover:bg-zinc-200 active:scale-[0.99] transition"
          >
            Sign In
          </button>
        </form>

        <div className="my-8 flex items-center gap-4">
          <div className="h-px flex-1 bg-white/10" />
          <span className="text-xs text-zinc-500">OR</span>
          <div className="h-px flex-1 bg-white/10" />
        </div>

        <button
          className="w-full border border-white/10 py-3 rounded-md text-sm
          text-zinc-300 hover:bg-white/5 transition"
        >
          Continue with Google
        </button>

        <p className="mt-6 text-sm text-zinc-400 text-center">
          Don’t have an account?{" "}
          <span onClick={()=>{navigate("/signup")}} className="text-white hover:underline cursor-pointer">
            Sign up
          </span>
        </p>
      </motion.div>
    </div>
  );
}
