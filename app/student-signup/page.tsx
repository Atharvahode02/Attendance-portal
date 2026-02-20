"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function StudentSignup() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!name || !email || !password) {
      alert("Please fill all fields");
      return;
    }

    try {
      setLoading(true);

      // 1️⃣ Create Auth User (Solution 3 Applied)
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      const user = data.user;

      if (!user) {
        throw new Error("Signup failed. Try again.");
      }

      // 2️⃣ Insert into profiles table
      const { error: profileError } = await supabase
        .from("profiles")
        .insert({
          id: user.id,
          name: name,
          email: email,
          role: "student",
          status: "approved",
        });

      if (profileError) throw profileError;

      alert("Account created successfully!");
      router.push("/student-login");

    } catch (err : any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-600 to-pink-600">
      <div className="bg-white w-[400px] p-8 rounded-2xl shadow-2xl">
        <h2 className="text-2xl font-bold text-center mb-6">
          Student Sign Up
        </h2>

        <div className="space-y-4">

          <input
            type="text"
            placeholder="Full Name"
            className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <input
            type="email"
            placeholder="Email"
            className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            onClick={handleSignup}
            disabled={loading}
            className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition disabled:bg-gray-400"
          >
            {loading ? "Creating..." : "Create Account"}
          </button>

        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{" "}
          <span
            onClick={() => router.push("/student-login")}
            className="text-purple-600 font-semibold cursor-pointer hover:underline"
          >
            Login
          </span>
        </p>
      </div>
    </div>
  );
}