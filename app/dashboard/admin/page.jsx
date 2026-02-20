"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function AdminDashboard() {
  const router = useRouter();

  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [rejectedTeachers, setRejectedTeachers] = useState([]);
  const [pendingTeachers, setPendingTeachers] = useState([]);
  const [subjectName, setSubjectName] = useState("");
  const [selectedTeacher, setSelectedTeacher] = useState("");

  // 🔐 Protect Route
  const checkAdmin = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/admin-login");
      return false;
    }

    const { data: profile, error } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (error || !profile || profile.role !== "admin") {
      alert("Access Denied");
      router.push("/");
      return false;
    }

    return true;
  };

  // 📥 Fetch All Data
  const fetchAllData = async () => {
    const { data: allProfiles, error: profilesError } = await supabase
      .from("profiles")
      .select("*");

    if (profilesError) {
      console.log(profilesError);
      return;
    }

    setStudents(allProfiles.filter((p) => p.role === "student"));
    setTeachers(
      allProfiles.filter((p) => p.role === "teacher" && p.status === "approved")
    );
    setPendingTeachers(
      allProfiles.filter((p) => p.role === "teacher" && p.status === "pending")
    );
    setRejectedTeachers(
      allProfiles.filter((p) => p.role === "teacher" && p.status === "rejected")
    );

    const { data: subjectsData } = await supabase
      .from("subjects")
      .select(`*, profiles(name)`);
    setSubjects(subjectsData || []);
  };

  useEffect(() => {
    const init = async () => {
      const isAdmin = await checkAdmin();
      if (isAdmin) {
        fetchAllData();
      }
    };
    init();
  }, []);

  // ✅ Approve pending teacher
const approveTeacher = async (id) => {
  const { data, error } = await supabase
    .from("profiles")
    .update({ status: "approved" })
    .eq("id", id)
    .select(); // returns the updated row

  if (error) return alert(error.message);

  // Update local state
  setTeachers((prev) => [...prev, data[0]]);
  setPendingTeachers((prev) => prev.filter((t) => t.id !== id));
};

// ❌ Reject pending teacher
const rejectTeacher = async (id) => {
  const { data, error } = await supabase
    .from("profiles")
    .update({ status: "rejected" })
    .eq("id", id)
    .select();

  if (error) return alert(error.message);

  // Update local state
  setRejectedTeachers((prev) => [...prev, data[0]]);
  setPendingTeachers((prev) => prev.filter((t) => t.id !== id));
};
  // 🗑️ Delete rejected teacher permanently
  const deleteTeacher = async (id) => {
    const { error } = await supabase.from("profiles").delete().eq("id", id);
    if (error) return alert(error.message);

    setRejectedTeachers((prev) => prev.filter((t) => t.id !== id));
    setTeachers((prev) => prev.filter((t) => t.id !== id));
  };

  // 🗑️ Delete student permanently
  const deleteStudent = async (id) => {
    const { error } = await supabase.from("profiles").delete().eq("id", id);
    if (error) return alert(error.message);

    setStudents((prev) => prev.filter((s) => s.id !== id));
  };
  // 🗑️ Delete Subject
const deleteSubject = async (id) => {
  const { error } = await supabase
    .from("subjects")
    .delete()
    .eq("id", id);

  if (error) {
    alert(error.message);
    return;
  }

  setSubjects((prev) => prev.filter((s) => s.id !== id));
};

 // ➕ Create Subject (updated)
const createSubject = async () => {
  if (!subjectName || !selectedTeacher) {
    return alert("Fill all fields");
  }

  // Insert into Supabase and fetch teacher name immediately
  const { data, error } = await supabase.from("subjects").insert({
    subject_name: subjectName,
    teacher_id: selectedTeacher,
  }).select(`*, profiles(name)`); // fetch teacher name

  if (error) return alert(error.message);

  // Add the new subject to state (reactive update)
  setSubjects((prev) => [...prev, data[0]]);

  setSubjectName("");
  setSelectedTeacher("");
};
  const logout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white p-8">
        <h2 className="text-2xl font-bold mb-10">Admin Panel</h2>
        <button
          onClick={logout}
          className="bg-red-600 px-6 py-3 rounded-lg hover:bg-red-700"
        >
          Logout
        </button>
      </aside>

      {/* Main */}
      <main className="flex-1 p-10 space-y-10">
        <h1 className="text-4xl font-bold">Admin Dashboard</h1>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow text-center">
            <p>Total Students</p>
            <h2 className="text-3xl text-blue-600 font-bold">{students.length}</h2>
          </div>

          <div className="bg-white p-6 rounded-xl shadow text-center">
            <p>Total Teachers</p>
            <h2 className="text-3xl text-green-600 font-bold">{teachers.length}</h2>
          </div>

          <div className="bg-white p-6 rounded-xl shadow text-center">
            <p>Total Subjects</p>
            <h2 className="text-3xl text-purple-600 font-bold">{subjects.length}</h2>
          </div>
        </div>

        {/* Create Subject */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-xl font-bold mb-4">Create Subject</h2>
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="Subject Name"
              className="border px-4 py-2 rounded w-full"
              value={subjectName}
              onChange={(e) => setSubjectName(e.target.value)}
            />
            <select
              className="border px-4 py-2 rounded w-full"
              value={selectedTeacher}
              onChange={(e) => setSelectedTeacher(e.target.value)}
            >
              <option value="">Select Teacher</option>
              {teachers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
            <button
              onClick={createSubject}
              className="bg-blue-600 text-white px-6 rounded"
            >
              Add
            </button>
          </div>
        </div>

       {/* Subjects List */}
<div className="bg-white p-6 rounded-xl shadow">
  <h2 className="text-xl font-bold mb-4">Subjects</h2>
  {subjects.length === 0 ? (
    <p>No subjects found</p>
  ) : (
    subjects.map((sub) => (
  <div key={sub.id} className="py-2 border-b flex justify-between items-center">
    <div>
      <div>{sub.subject_name}</div>
      <div className="text-gray-500 text-sm">
        Teacher: {sub.profiles?.name || "Not Assigned"}
      </div>
    </div>

    <button
      onClick={() => deleteSubject(sub.id)}
      className="bg-red-500 text-white px-3 py-1 rounded"
    >
      Delete
    </button>
  </div>
))
  )}
</div>
        {/* Pending Teachers */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-xl font-bold mb-4">Pending Teacher Requests</h2>
          {pendingTeachers.length === 0 ? (
            <p>No pending requests</p>
          ) : (
            pendingTeachers.map((t) => (
              <div key={t.id} className="flex justify-between py-2 border-b">
                <div>{t.name} - {t.email}</div>
                <div className="flex gap-3">
                  <button
                    onClick={() => approveTeacher(t.id)}
                    className="bg-green-500 text-white px-4 py-1 rounded"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => rejectTeacher(t.id)}
                    className="bg-red-500 text-white px-4 py-1 rounded"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Rejected Teachers */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-xl font-bold mb-4 text-red-600">Rejected Teachers</h2>
          {rejectedTeachers.length === 0 ? (
            <p>No rejected teachers</p>
          ) : (
            rejectedTeachers.map((t) => (
              <div key={t.id} className="flex justify-between py-2 border-b">
                <div>{t.name} - {t.email}</div>
                <button
                  onClick={() => deleteTeacher(t.id)}
                  className="bg-red-500 text-white px-3 py-1 rounded"
                >
                  Delete
                </button>
              </div>
            ))
          )}
        </div>

        {/* Approved Teachers */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-xl font-bold mb-4">Approved Teachers</h2>
          {teachers.length === 0 ? (
            <p>No teachers found</p>
          ) : (
            teachers.map((t) => (
              <div key={t.id} className="flex justify-between py-2 border-b">
                <div>{t.name} - {t.email}</div>
                <button
                  onClick={() => deleteTeacher(t.id)}
                  className="bg-red-500 text-white px-3 py-1 rounded"
                >
                  Delete
                </button>
              </div>
            ))
          )}
        </div>

        {/* Students */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-xl font-bold mb-4">Students</h2>
          {students.length === 0 ? (
            <p>No students found</p>
          ) : (
            students.map((s) => (
              <div key={s.id} className="flex justify-between py-2 border-b">
                <div>{s.name} - {s.email}</div>
                <button
                  onClick={() => deleteStudent(s.id)}
                  className="bg-red-500 text-white px-3 py-1 rounded"
                >
                  Delete
                </button>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}