"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function TeacherDashboard() {
  const router = useRouter();

  const [teacherName, setTeacherName] = useState("");
  const [subjects, setSubjects] = useState([]);
  const [students, setStudents] = useState([]);

  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  const [attendance, setAttendance] = useState({});
  const [history, setHistory] = useState([]);
  const [editMode, setEditMode] = useState(false);

  const [analytics, setAnalytics] = useState({
    totalClasses: 0,
    totalStudents: 0,
    average: 0,
  });

  useEffect(() => {
    fetchTeacherData();
    fetchHistory();
  }, []);

  // ================= FETCH DATA =================

  const fetchTeacherData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: profile } = await supabase
      .from("profiles")
      .select("name")
      .eq("id", user.id)
      .single();

    if (profile) setTeacherName(profile.name);

    const { data: subjectData } = await supabase
      .from("subjects")
      .select("*")
      .eq("teacher_id", user.id);

    setSubjects(subjectData || []);

    const { data: studentData } = await supabase
      .from("profiles")
      .select("*")
      .eq("role", "student");

    setStudents(studentData || []);
  };

  // ================= SAVE / UPDATE =================

  const saveAttendance = async () => {
    if (!selectedSubject || !selectedDate || !startTime || !endTime) {
      alert("Select subject, date and time range");
      return;
    }

    if (endTime <= startTime) {
      alert("End time must be after start time");
      return;
    }

    const { data: existing } = await supabase
      .from("attendance")
      .select("id")
      .eq("subject_id", selectedSubject)
      .eq("date", selectedDate)
      .eq("start_time", startTime)
      .eq("end_time", endTime);

    if (existing.length > 0 && !editMode) {
      alert("Attendance already marked for this time!");
      return;
    }

    const entries = Object.keys(attendance).map((studentId) => ({
      student_id: studentId,
      subject_id: selectedSubject,
      status: attendance[studentId],
      date: selectedDate,
      start_time: startTime,
      end_time: endTime,
    }));

    if (editMode) {
      await supabase
        .from("attendance")
        .delete()
        .eq("subject_id", selectedSubject)
        .eq("date", selectedDate)
        .eq("start_time", startTime)
        .eq("end_time", endTime);

      await supabase.from("attendance").insert(entries);
      alert("Attendance Updated Successfully");
      setEditMode(false);
    } else {
      await supabase.from("attendance").insert(entries);
      alert("Attendance Saved Successfully");
    }

    fetchHistory();
  };

  // ================= LOAD FOR EDIT =================

  const loadForEdit = async (item) => {
    const { data } = await supabase
      .from("attendance")
      .select("*")
      .eq("subject_id", item.subject_id)
      .eq("date", item.date)
      .eq("start_time", item.start_time)
      .eq("end_time", item.end_time);

    const map = {};
    data.forEach((row) => {
      map[row.student_id] = row.status;
    });

    setSelectedSubject(item.subject_id);
    setSelectedDate(item.date);
    setStartTime(item.start_time);
    setEndTime(item.end_time);
    setAttendance(map);
    setEditMode(true);
  };

  // ================= HISTORY + ANALYTICS =================

  const fetchHistory = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  // 🔥 STEP 1: Get this teacher's subjects
  const { data: teacherSubjects } = await supabase
    .from("subjects")
    .select("id")
    .eq("teacher_id", user.id);

  if (!teacherSubjects || teacherSubjects.length === 0) {
    setHistory([]);
    setAnalytics({
      totalClasses: 0,
      totalStudents: 0,
      average: 0,
    });
    return;
  }

  const subjectIds = teacherSubjects.map((s) => s.id);

  // 🔥 STEP 2: Get attendance only for those subjects
  const { data } = await supabase
    .from("attendance")
    .select("subject_id, date, start_time, end_time, status, subjects(subject_name)")
    .in("subject_id", subjectIds)
    .order("date", { ascending: false });

  if (!data || data.length === 0) {
    setHistory([]);
    setAnalytics({
      totalClasses: 0,
      totalStudents: 0,
      average: 0,
    });
    return;
  }

  const grouped = {};

  data.forEach((item) => {
    const key =
      item.subject_id +
      item.date +
      item.start_time +
      item.end_time;

    if (!grouped[key]) {
      grouped[key] = {
        subject_name: item.subjects?.subject_name,
        subject_id: item.subject_id,
        date: item.date,
        start_time: item.start_time,
        end_time: item.end_time,
        total: 0,
        present: 0,
      };
    }

    grouped[key].total++;
    if (item.status === "Present") {
      grouped[key].present++;
    }
  });

  const values = Object.values(grouped);
  setHistory(values);

  const totalClasses = values.length;
  let totalStudents = 0;
  let totalPresent = 0;

  values.forEach((item) => {
    totalStudents += item.total;
    totalPresent += item.present;
  });

  const average =
    totalStudents > 0
      ? ((totalPresent / totalStudents) * 100).toFixed(1)
      : 0;

  setAnalytics({ totalClasses, totalStudents, average });
};

  // ================= LOGOUT =================

  const logout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  // ================= UI =================

  return (
    <div className="min-h-screen bg-gray-100">

      {/* Navbar */}
      <div className="flex justify-between items-center bg-white p-6 shadow">
        <h1 className="text-2xl font-bold">
          Welcome Teacher, {teacherName}
        </h1>
        <button
          onClick={logout}
          className="bg-red-500 text-white px-4 py-2 rounded"
        >
          Logout
        </button>
      </div>

      <div className="p-8 space-y-8">

        {/* Analytics */}
        <div className="grid grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded shadow">
            <h3>Total Classes</h3>
            <p className="text-3xl font-bold text-blue-600">
              {analytics.totalClasses}
            </p>
          </div>

          <div className="bg-white p-6 rounded shadow">
            <h3>Total Students</h3>
            <p className="text-3xl font-bold text-green-600">
              {analytics.totalStudents}
            </p>
          </div>

          <div className="bg-white p-6 rounded shadow">
            <h3>Average Attendance</h3>
            <p className="text-3xl font-bold text-purple-600">
              {analytics.average}%
            </p>
          </div>
        </div>

        {/* Subject & Time Selection */}
        <div className="bg-white p-6 rounded shadow flex gap-4">
          <select
            className="border p-3 rounded w-full"
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
          >
            <option value="">Select Subject</option>
            {subjects.map((subject) => (
              <option key={subject.id} value={subject.id}>
                {subject.subject_name}
              </option>
            ))}
          </select>

          <input
            type="date"
            className="border p-3 rounded w-full"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />

          <input
            type="time"
            className="border p-3 rounded w-full"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
          />

          <input
            type="time"
            className="border p-3 rounded w-full"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
          />
        </div>

        {/* Attendance Table */}
        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-xl font-semibold mb-4">
            {editMode ? "Edit Attendance" : "Mark Attendance"}
          </h2>

          {students.map((student) => (
            <div key={student.id} className="flex justify-between border-b py-3">
              <div>{student.name}</div>

              <div className="flex gap-4">
                <label>
                  <input
                    type="radio"
                    checked={attendance[student.id] === "Present"}
                    onChange={() =>
                      setAttendance({
                        ...attendance,
                        [student.id]: "Present",
                      })
                    }
                  />
                  Present
                </label>

                <label>
                  <input
                    type="radio"
                    checked={attendance[student.id] === "Absent"}
                    onChange={() =>
                      setAttendance({
                        ...attendance,
                        [student.id]: "Absent",
                      })
                    }
                  />
                  Absent
                </label>
              </div>
            </div>
          ))}

          <button
            onClick={saveAttendance}
            className="mt-6 bg-green-600 text-white px-6 py-3 rounded"
          >
            {editMode ? "Update Attendance" : "Save Attendance"}
          </button>
        </div>

        {/* History */}
        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-xl font-semibold mb-4">
            Attendance History
          </h2>

          {history.map((item, index) => (
            <div key={index} className="flex justify-between border-b py-3">
              <div>
                {item.subject_name} - {item.date}
                ({item.start_time} - {item.end_time})
              </div>

              <button
                onClick={() => loadForEdit(item)}
                className="text-blue-600 underline"
              >
                Edit
              </button>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
