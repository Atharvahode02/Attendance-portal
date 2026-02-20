"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function StudentDashboard() {
  const router = useRouter();

  const [student, setStudent] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [activeTab, setActiveTab] = useState("attendance");

  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");

  const [attendanceData, setAttendanceData] = useState([]);
  const [subjectAttendance, setSubjectAttendance] = useState([]);

  const [totalSubjects, setTotalSubjects] = useState(0);
  const [totalPresent, setTotalPresent] = useState(0);
  const [totalAbsent, setTotalAbsent] = useState(0);
  const [overallPercentage, setOverallPercentage] = useState(0);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return router.push("/student-login");

    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    setStudent(profile);

    const { data: subjectData } = await supabase
      .from("subjects")
      .select("*");

    setSubjects(subjectData || []);
  };

  // 🔹 Fetch Date-wise Attendance (All Subjects)
const fetchAttendanceByDate = async (date) => {
  setSelectedDate(date);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const formattedDate = new Date(date).toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("attendance")
    .select(`
      date,
      start_time,
      end_time,
      status,
      subjects(
        subject_name,
        profiles(name)
      )
    `)
    .eq("student_id", user.id)
    .eq("date", formattedDate)  // 🔥 FIXED
    .order("start_time", { ascending: true });

  if (error) {
    console.log(error);
    return;
  }

  setAttendanceData(data || []);

  const total = data?.length || 0;
  const present = data?.filter(a => a.status === "Present").length || 0;
  const absent = total - present;

  setTotalSubjects(total);
  setTotalPresent(present);
  setTotalAbsent(absent);
  setOverallPercentage(total > 0 ? ((present / total) * 100).toFixed(1) : 0);
};

  // 🔹 Fetch Subject + Date Attendance
  const fetchSubjectAttendance = async () => {
  if (!selectedSubject || !selectedDate) return;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const formattedDate = new Date(selectedDate)
    .toISOString()
    .split("T")[0];

  const { data, error } = await supabase
    .from("attendance")
    .select(`
      date,
      start_time,
      end_time,
      status,
      subjects(
        subject_name,
        profiles(name)
      )
    `)
    .eq("student_id", user.id)
    .eq("subject_id", selectedSubject)
    .eq("date", formattedDate)
    .order("start_time", { ascending: true });

  if (error) {
    console.log(error);
    return;
  }

  setSubjectAttendance(data || []);
};
  const logout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  return (
    <div className="flex min-h-screen bg-gray-100">

      {/* Sidebar */}
      <div className="w-64 bg-gradient-to-b from-blue-800 to-blue-600 text-white p-6">
        <div className="flex flex-col items-center mb-8">
          <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center">
            <span className="text-3xl text-blue-700 font-bold">
              {student?.name?.charAt(0)?.toUpperCase() || "S"}
            </span>
          </div>
          <h3 className="mt-3 font-semibold">{student?.name}</h3>
        </div>

        <div className="space-y-3">
          <div
            onClick={() => setActiveTab("attendance")}
            className="cursor-pointer hover:bg-blue-500 p-2 rounded"
          >
            My Attendance
          </div>

          <div
            onClick={() => setActiveTab("subjects")}
            className="cursor-pointer hover:bg-blue-500 p-2 rounded"
          >
            Subjects
          </div>
        </div>
      </div>

      {/* Main */}
      <div className="flex-1">

        <div className="flex justify-between items-center bg-white px-8 py-4 shadow">
          <h1 className="text-2xl font-bold">Student Dashboard</h1>
          <button
            onClick={logout}
            className="bg-red-500 text-white px-4 py-2 rounded"
          >
            Logout
          </button>
        </div>

        <div className="p-8">

          {/* MY ATTENDANCE TAB */}
          {activeTab === "attendance" && (
            <>
              <div className="bg-white p-6 rounded shadow mb-6">
                <h2 className="font-semibold mb-4">Select Date</h2>

                <input
                  type="date"
                  className="border p-2 rounded"
                  onChange={(e) => fetchAttendanceByDate(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="bg-white p-4 rounded shadow">
                  <p>Total Subjects</p>
                  <h2 className="text-2xl font-bold">{totalSubjects}</h2>
                </div>

                <div className="bg-white p-4 rounded shadow">
                  <p>Total Present</p>
                  <h2 className="text-2xl font-bold text-green-600">
                    {totalPresent}
                  </h2>
                </div>

                <div className="bg-white p-4 rounded shadow">
                  <p>Total Absent</p>
                  <h2 className="text-2xl font-bold text-red-600">
                    {totalAbsent}
                  </h2>
                </div>

                <div className="bg-white p-4 rounded shadow">
                  <p>Overall %</p>
                  <h2 className="text-2xl font-bold text-blue-600">
                    {overallPercentage}%
                  </h2>
                </div>
              </div>

              <div className="bg-white p-6 rounded shadow">
                <h2 className="font-semibold mb-4">Lecture Details</h2>

               {attendanceData.length === 0 ? (
  <p>No lectures found for this date.</p>
) : (
  attendanceData.map((item, i) => (
    <div key={i} className="border-b py-3">

      <div className="font-semibold">
        {item.subjects?.subject_name}
      </div>

      <div className="text-sm text-gray-600">
        Teacher: {item.subjects?.profiles?.name}
      </div>

      <div className="text-sm text-gray-600">
        Time: {item.start_time} - {item.end_time}
      </div>

      <div className={
        item.status === "Present"
          ? "text-green-600 font-semibold"
          : "text-red-600 font-semibold"
      }>
        Status: {item.status}
      </div>

    </div>
  ))
)}
              </div>
            </>
          )}

          {/* SUBJECT TAB */}
          {activeTab === "subjects" && (
            <div className="bg-white p-6 rounded shadow">
              <h2 className="font-semibold mb-4">Select Subject & Date</h2>

              <div className="flex gap-4 mb-4">
                <select
                  className="border p-2 rounded"
                  onChange={(e) => setSelectedSubject(e.target.value)}
                >
                  <option value="">Select Subject</option>
                  {subjects.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.subject_name}
                    </option>
                  ))}
                </select>

                <input
                  type="date"
                  className="border p-2 rounded"
                  onChange={(e) => setSelectedDate(e.target.value)}
                />

                <button
                  onClick={fetchSubjectAttendance}
                  className="bg-blue-600 text-white px-4 rounded"
                >
                  Check
                </button>
              </div>

              {subjectAttendance.length === 0 ? (
  <p>No lecture found.</p>
) : (
  subjectAttendance.map((item, i) => (
    <div key={i} className="border-b py-3">

      <div className="font-semibold">
        {item.subjects?.subject_name}
      </div>

      <div className="text-sm text-gray-600">
        Teacher: {item.subjects?.profiles?.name}
      </div>

      <div className="text-sm text-gray-600">
        Time: {item.start_time} - {item.end_time}
      </div>

      <div className={
        item.status === "Present"
          ? "text-green-600 font-semibold"
          : "text-red-600 font-semibold"
      }>
        {item.date} — {item.status}
      </div>

    </div>
  ))
)}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
