"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function TeacherSignup() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const signup = async () => {
    if (!name || !email || !password) {
      alert("Please fill all fields");
      return;
    }

    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      alert(error.message);
      setLoading(false);
      return;
    }

    if (!data.user) {
      alert("Signup failed.");
      setLoading(false);
      return;
    }

    const { error: profileError } = await supabase
      .from("profiles")
      .insert([
        {
          id: data.user.id,
          name,
          email,
          role: "teacher",
          status: "pending",
        },
      ]);

    if (profileError) {
      alert(profileError.message);
      setLoading(false);
      return;
    }

    alert("🎉 Account created. Waiting for admin approval.");
    router.push("/teacher-login");
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-gradient-to-br from-emerald-700 via-green-600 to-teal-600 overflow-hidden">

      {/* Glow Background */}
      <div className="absolute w-96 h-96 bg-emerald-400 rounded-full blur-3xl opacity-30 -top-20 -left-20"></div>
      <div className="absolute w-96 h-96 bg-teal-400 rounded-full blur-3xl opacity-30 -bottom-20 -right-20"></div>

      {/* Glass Card */}
      <div className="relative backdrop-blur-xl bg-white/20 border border-white/30 w-[420px] p-10 rounded-3xl shadow-2xl text-white transition-all duration-500 hover:scale-105">

        <h2 className="text-3xl font-extrabold text-center mb-8 tracking-wide">
          👨‍🏫 Teacher Sign Up
        </h2>

        <div className="space-y-6">

          {/* Name */}
          <div>
            <label className="block text-sm mb-2 text-gray-200">
              Full Name
            </label>
            <input
              type="text"
              placeholder="John Smith"
              className="w-full p-3 rounded-xl bg-white/30 border border-white/40 placeholder-gray-200 text-white focus:outline-none focus:ring-2 focus:ring-emerald-400 transition"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm mb-2 text-gray-200">
              Email Address
            </label>
            <input
              type="email"
              placeholder="teacher@example.com"
              className="w-full p-3 rounded-xl bg-white/30 border border-white/40 placeholder-gray-200 text-white focus:outline-none focus:ring-2 focus:ring-emerald-400 transition"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm mb-2 text-gray-200">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Create strong password"
                className="w-full p-3 rounded-xl bg-white/30 border border-white/40 placeholder-gray-200 text-white focus:outline-none focus:ring-2 focus:ring-emerald-400 transition"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-sm text-gray-200 hover:text-white"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {/* Button */}
          <button
            onClick={signup}
            disabled={loading}
            className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 font-semibold text-lg shadow-lg hover:shadow-emerald-500/50 transition-all duration-300 hover:-translate-y-1 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>

        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-200 mt-8">
          Already have an account?{" "}
          <span
            onClick={() => router.push("/teacher-login")}
            className="font-semibold cursor-pointer hover:underline"
          >
            Login
          </span>
        </p>

      </div>
    </div>
  );
}