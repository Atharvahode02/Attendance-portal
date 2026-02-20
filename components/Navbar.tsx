"use client";

import Navbar from "@/components/Navbar";


export default function AdminDashboard() {
  return (
    <div className="flex min-h-screen">

      {/* Sidebar */}
      <div className="w-64 bg-gray-900 text-white p-6">
        <h2 className="text-xl font-bold mb-6">Admin Panel</h2>

        <ul className="space-y-4">
          <li className="hover:text-gray-300 cursor-pointer">Dashboard</li>
          <li className="hover:text-gray-300 cursor-pointer">Students</li>
          <li className="hover:text-gray-300 cursor-pointer">Teachers</li>
          <li className="hover:text-gray-300 cursor-pointer">Analytics</li>
        </ul>
      </div>

      {/* Main Section */}
      <div className="flex-1 bg-gray-100">

        <Navbar />

        <div className="p-8">
          <h1 className="text-3xl font-bold">
            Welcome Admin
          </h1>
        </div>

      </div>
    </div>
  );
}
