"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function StudentLogin() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      alert("Please fill all fields");
      return;
    }

    try {
      setLoading(true);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (!data.user) {
        alert("Login failed. Check credentials.");
        return;
      }

      // Check profile role
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", data.user.id)
        .single();

      if (profileError || !profile) {
        alert("Profile not found");
        return;
      }

      if (profile.role !== "student") {
        alert("Access Denied. Not a student account.");
        return;
      }

      if (profile.status !== "approved") {
        alert("Your account is pending approval.");
        return;
      }

      // Redirect to student dashboard
      router.push("/dashboard/student");

    } catch (error : any) {
      alert(error.message || "An error occurred during login.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-600 to-indigo-700 overflow-hidden">

      {/* Background Glow */}
      <div className="absolute w-96 h-96 bg-blue-400 rounded-full blur-3xl opacity-30 -top-20 -left-20"></div>
      <div className="absolute w-96 h-96 bg-indigo-400 rounded-full blur-3xl opacity-30 -bottom-20 -right-20"></div>

      {/* Glass Card */}
      <div className="relative backdrop-blur-xl bg-white/20 border border-white/30 w-[420px] p-10 rounded-3xl shadow-2xl text-white transition-all duration-500 hover:scale-105">

        <h2 className="text-3xl font-extrabold text-center mb-8 tracking-wide">
          🎓 Student Login
        </h2>

        <div className="space-y-6">

          {/* Email */}
          <div>
            <label className="block text-sm mb-2 text-gray-200">Email</label>
            <input
              type="email"
              placeholder="student@example.com"
              className="w-full p-3 rounded-xl bg-white/30 border border-white/40 placeholder-gray-200 text-white focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm mb-2 text-gray-200">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                className="w-full p-3 rounded-xl bg-white/30 border border-white/40 placeholder-gray-200 text-white focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
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

          {/* Login Button */}
          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full py-3 rounded-xl bg-blue-500 hover:bg-blue-600 font-semibold text-lg shadow-lg hover:shadow-blue-500/50 transition-all duration-300 hover:-translate-y-1 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? "Logging in..." : "Login"}
          </button>

        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-200 mt-8">
          Don't have an account?{" "}
          <span
            onClick={() => router.push("/student-signup")}
            className="font-semibold cursor-pointer hover:underline"
          >
            Sign Up
          </span>
        </p>

      </div>
    </div>
  );
}