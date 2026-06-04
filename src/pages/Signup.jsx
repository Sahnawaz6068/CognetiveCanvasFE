import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import toast from "react-hot-toast";

export default function Signup() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // FIXED VALIDATION
    if (!form.username || !form.email || !form.password) {
      toast.error("All fields are required");
      return;
    }

    let toastId;

    try {
      setLoading(true);

      toastId = toast.loading("Creating account...");

      const res = await fetch("http://localhost:3000/api/v1/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Signup failed");
      }

      toast.success("Account created successfully", {
        id: toastId,
      });

      navigate("/signin");
    } catch (err) {
      toast.error(err.message || "Something went wrong", {
        id: toastId,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* NAVBAR */}
      <nav className="sticky top-0 z-50 border-b border-white/[0.06] bg-black/70 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1
            onClick={() => navigate("/")}
            className="text-lg font-semibold tracking-tight cursor-pointer"
          >
            Cognitive Canvas
          </h1>

          <div className="hidden md:flex items-center gap-8 text-sm text-zinc-500">
            <button
              onClick={() => navigate("/")}
              className="hover:text-white transition"
            >
              Home
            </button>

            <button
              onClick={() => navigate("/signin")}
              className="border border-white/10 px-4 py-2 rounded-lg text-white hover:bg-white hover:text-black transition"
            >
              Sign In
            </button>
          </div>
        </div>
      </nav>

      {/* MAIN */}
      <div className="relative flex items-center justify-center px-6 py-20">
        {/* BACKGROUND GLOW */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-white/[0.03] blur-3xl rounded-full" />

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="relative w-full max-w-md"
        >
          {/* GLASS CARD */}
          <div className="rounded-3xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-2xl overflow-hidden shadow-[0_0_0_1px_rgba(255,255,255,0.02)]">
            {/* TOP STRIP */}
            <div className="border-b border-white/[0.06] px-6 py-4 bg-black/30 flex items-center justify-between">
              <div>
                <p className="text-xs tracking-[0.2em] text-zinc-500">
                  CREATE ACCOUNT
                </p>

                <h2 className="mt-1 text-sm font-medium">
                  Cognitive Canvas
                </h2>
              </div>

              <div className="w-10 h-10 rounded-xl bg-[#7C3AED] flex items-center justify-center text-lg">
                ✦
              </div>
            </div>

            {/* CONTENT */}
            <div className="p-7">
              <div>
                <h1 className="text-3xl font-semibold tracking-tight">
                  Create account
                </h1>

                <p className="mt-3 text-sm text-zinc-400 leading-relaxed">
                  Join Cognitive Canvas and start collaborating with AI-powered
                  academic workflows.
                </p>
              </div>

              {/* FORM */}
              <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                {/* USERNAME */}
                <div>
                  <label className="text-sm text-zinc-500 mb-2 block">
                    Full Name
                  </label>

                  <input
                    type="text"
                    name="username"
                    value={form.username}
                    onChange={handleChange}
                    placeholder="Zeeshan Ahmad"
                    className="w-full bg-black/30 border border-white/[0.08] rounded-xl px-4 py-3.5 text-white placeholder:text-zinc-600 outline-none focus:border-white/20 focus:bg-black/40 transition"
                  />
                </div>

                {/* EMAIL */}
                <div>
                  <label className="text-sm text-zinc-500 mb-2 block">
                    Email Address
                  </label>

                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    className="w-full bg-black/30 border border-white/[0.08] rounded-xl px-4 py-3.5 text-white placeholder:text-zinc-600 outline-none focus:border-white/20 focus:bg-black/40 transition"
                  />
                </div>

                {/* PASSWORD */}
                <div>
                  <label className="text-sm text-zinc-500 mb-2 block">
                    Password
                  </label>

                  <input
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full bg-black/30 border border-white/[0.08] rounded-xl px-4 py-3.5 text-white placeholder:text-zinc-600 outline-none focus:border-white/20 focus:bg-black/40 transition"
                  />
                </div>

                {/* BUTTON */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-white text-black py-3.5 rounded-xl font-medium hover:bg-zinc-200 transition disabled:opacity-60"
                >
                  {loading ? "Creating account..." : "Create Account"}
                </button>
              </form>

              {/* FOOTER */}
              <p className="mt-8 text-sm text-zinc-500 text-center">
                Already have an account?{" "}
                <span
                  onClick={() => navigate("/signin")}
                  className="text-white cursor-pointer hover:underline"
                >
                  Sign in
                </span>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}