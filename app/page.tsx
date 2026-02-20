"use client";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-700 via-purple-700 to-pink-600 overflow-hidden">
      
      {/* Background Glow Effects */}
      <div className="absolute w-96 h-96 bg-purple-500 rounded-full blur-3xl opacity-30 -top-20 -left-20"></div>
      <div className="absolute w-96 h-96 bg-pink-500 rounded-full blur-3xl opacity-30 -bottom-20 -right-20"></div>

      {/* Main Card */}
      <div className="relative backdrop-blur-xl bg-white/20 border border-white/30 rounded-3xl shadow-2xl p-12 w-[500px] text-center text-white transition-all duration-500 hover:scale-105">
        
        <h1 className="text-4xl font-extrabold mb-3 tracking-wide">
          🎓 Attendance Portal
        </h1>

        <p className="text-gray-200 mb-10 text-lg">
          Select your role to continue
        </p>

        <div className="space-y-5">
          
          {/* Student Button */}
          <button
            onClick={() => router.push("/student-login")}
            className="group w-full flex items-center justify-center gap-3 py-4 rounded-2xl bg-blue-500/90 hover:bg-blue-600 text-white font-semibold text-lg shadow-lg hover:shadow-blue-500/50 transition-all duration-300 hover:-translate-y-1"
          >
            <span className="text-2xl group-hover:scale-110 transition">🎓</span>
            Student Login
          </button>

          {/* Teacher Button */}
          <button
            onClick={() => router.push("/teacher-login")}
            className="group w-full flex items-center justify-center gap-3 py-4 rounded-2xl bg-green-500/90 hover:bg-green-600 text-white font-semibold text-lg shadow-lg hover:shadow-green-500/50 transition-all duration-300 hover:-translate-y-1"
          >
            <span className="text-2xl group-hover:scale-110 transition">👩‍🏫</span>
            Teacher Login
          </button>

          {/* Admin Button */}
          <button
            onClick={() => router.push("/admin-login")}
            className="group w-full flex items-center justify-center gap-3 py-4 rounded-2xl bg-red-500/90 hover:bg-red-600 text-white font-semibold text-lg shadow-lg hover:shadow-red-500/50 transition-all duration-300 hover:-translate-y-1"
          >
            <span className="text-2xl group-hover:scale-110 transition">🛡</span>
            Admin Login
          </button>
        </div>

        {/* Footer */}
        <p className="mt-10 text-sm text-gray-200 opacity-80">
          © {new Date().getFullYear()} Attendance System
        </p>
      </div>
    </div>
  );
}