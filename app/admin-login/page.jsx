"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const login = async () => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert(error.message);
      return;
    }

    if (!data.user) {
      alert("Login failed");
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", data.user.id);

    if (!profile || profile.length === 0) {
      alert("Account not found in profiles table");
      return;
    }

    if (profile[0].role !== "admin") {
      alert("Access Denied");
      return;
    }

    router.push("/dashboard/admin");
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-800 via-purple-800 to-pink-700 overflow-hidden">

      {/* Background Glow */}
      <div className="absolute w-96 h-96 bg-purple-500 rounded-full blur-3xl opacity-30 -top-20 -left-20"></div>
      <div className="absolute w-96 h-96 bg-pink-500 rounded-full blur-3xl opacity-30 -bottom-20 -right-20"></div>

      {/* Glass Card */}
      <div className="relative backdrop-blur-xl bg-white/20 border border-white/30 p-10 rounded-3xl shadow-2xl w-[420px] text-white transition-all duration-500 hover:scale-105">

        <h2 className="text-3xl font-extrabold text-center mb-8 tracking-wide">
          🛡 Admin Login
        </h2>

        <div className="space-y-6">

          {/* Email Input */}
          <div>
            <label className="block text-sm mb-2 text-gray-200">
              Email Address
            </label>
            <input
              type="email"
              placeholder="admin@example.com"
              className="w-full p-3 rounded-xl bg-white/30 border border-white/40 placeholder-gray-200 text-white focus:outline-none focus:ring-2 focus:ring-pink-400 transition"
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* Password Input */}
          <div>
            <label className="block text-sm mb-2 text-gray-200">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                className="w-full p-3 rounded-xl bg-white/30 border border-white/40 placeholder-gray-200 text-white focus:outline-none focus:ring-2 focus:ring-pink-400 transition"
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

          {/* Login Button */}
          <button
            onClick={login}
            className="w-full py-3 rounded-xl bg-pink-500 hover:bg-pink-600 font-semibold text-lg shadow-lg hover:shadow-pink-500/50 transition-all duration-300 hover:-translate-y-1"
          >
            Login to Dashboard
          </button>

        </div>

        {/* Footer */}
        <p className="mt-8 text-center text-sm text-gray-200 opacity-80">
          Secure Admin Access Only
        </p>
      </div>
    </div>
  );
}