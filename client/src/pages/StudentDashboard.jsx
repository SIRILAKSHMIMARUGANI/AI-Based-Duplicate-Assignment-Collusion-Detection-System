
import { useEffect, useState } from "react";
import {
  BookOpen,
  ClipboardList,
  FileText,
  LogOut,
  RefreshCw,
  Upload,
} from "lucide-react";
import API from "../services/api";

function StudentDashboard({ user, onLogout }) {
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [files, setFiles] = useState({});
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState("");
  const [message, setMessage] = useState("");

  const token = sessionStorage.getItem("token");

  const fetchData = async () => {
    try {
      setLoading(true);

      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };

      const [assignmentResponse, submissionResponse] =
        await Promise.all([
          API.get("/assignments", config),
          API.get("/submissions/my", config),
        ]);

      setAssignments(assignmentResponse.data.assignments);
      setSubmissions(submissionResponse.data.submissions);
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Unable to load dashboard."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  
const handleUpload = async (assignmentId) => {
  const file = files[assignmentId];

  console.log("Assignment ID:", assignmentId);
  console.log("Selected file:", file);

  if (!assignmentId || !file) {
    setMessage("Please select a file first.");
    return;
  }

  const formData = new FormData();
  formData.append("assignmentId", assignmentId);
  formData.append("file", file);

  try {
    setUploading(assignmentId);
    setMessage("");

    const response = await API.post("/submissions", formData, {
      headers: {
        Authorization: `Bearer ${sessionStorage.getItem("token")}`,
      },
    });

    setMessage(response.data.message);
    await fetchData();

  } catch (error) {
    console.error("Upload error:", error.response?.data || error);

    setMessage(
      error.response?.data?.message || "Upload failed. Check browser console."
    );
  } finally {
    setUploading("");
  }
};


  const submittedIds = submissions.map(
    (submission) => submission.assignment?._id
  );

  const availableAssignments = assignments.filter(
    (assignment) =>
      assignment.status === "Active" &&
      new Date(assignment.deadline) > new Date()
  );

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="flex items-center justify-between border-b border-slate-800 px-6 py-5">
        <div>
          <h1 className="text-2xl font-bold text-indigo-400">
            IntelliCheck
          </h1>
          <p className="text-sm text-slate-400">Student Dashboard</p>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-sm text-slate-300">{user.name}</span>
          <button
            onClick={onLogout}
            className="flex items-center gap-2 rounded-lg bg-slate-800 px-4 py-2"
          >
            <LogOut size={17} /> Logout
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-8 px-6 py-8">
        <section>
          <h2 className="text-3xl font-bold">
            Welcome, {user.name}!
          </h2>
          <p className="mt-2 text-slate-400">
            View assignments and submit your work.
          </p>
        </section>

        <section className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <BookOpen className="mb-3 text-indigo-400" size={28} />
            <p className="text-sm text-slate-400">Total Assignments</p>
            <p className="mt-2 text-3xl font-bold">
              {assignments.length}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <ClipboardList className="mb-3 text-green-400" size={28} />
            <p className="text-sm text-slate-400">Available Assignments</p>
            <p className="mt-2 text-3xl font-bold">
              {availableAssignments.length}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <FileText className="mb-3 text-purple-400" size={28} />
            <p className="text-sm text-slate-400">My Submissions</p>
            <p className="mt-2 text-3xl font-bold">
              {submissions.length}
            </p>
          </div>
        </section>

        {message && (
          <div className="rounded-lg border border-indigo-800 bg-indigo-950/40 p-4 text-indigo-200">
            {message}
          </div>
        )}

        <section>
          <div className="mb-5 flex items-center justify-between">
            <h3 className="text-xl font-semibold">
              Available Assignments
            </h3>

            <button
              onClick={fetchData}
              className="flex items-center gap-2 rounded-lg bg-slate-800 px-4 py-2 text-sm"
            >
              <RefreshCw size={16} /> Refresh
            </button>
          </div>

          {loading ? (
            <p className="text-slate-400">Loading...</p>
          ) : assignments.length === 0 ? (
            <p className="text-slate-400">No assignments available.</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {assignments.map((assignment) => {
                const expired =
                  new Date(assignment.deadline) <= new Date() ||
                  assignment.status !== "Active";

                const submitted = submittedIds.includes(
                  assignment._id
                );

                return (
                  <div
                    key={assignment._id}
                    className="rounded-xl border border-slate-800 bg-slate-900 p-5"
                  >
                    <h4 className="text-lg font-semibold">
                      {assignment.title}
                    </h4>

                    <p className="mt-2 text-sm text-indigo-300">
                      {assignment.subject}
                    </p>

                    <p className="mt-3 text-sm text-slate-400">
                      {assignment.description}
                    </p>

                    <p className="mt-3 text-xs text-slate-500">
                      Faculty: {assignment.faculty?.name || "Faculty"}
                    </p>

                    <p className="mt-2 text-xs text-slate-500">
                      Deadline:{" "}
                      {new Date(assignment.deadline).toLocaleString()}
                    </p>

                    {submitted ? (
                      <p className="mt-5 rounded-lg bg-green-900/40 p-3 text-sm text-green-300">
                        Assignment submitted successfully
                      </p>
                    ) : expired ? (
                      <p className="mt-5 text-sm text-red-400">
                        Submission deadline closed
                      </p>
                    ) : (
                      <div className="mt-5 space-y-3">
                        <input
                          type="file"
                          accept=".pdf,.docx,.txt"
                          onChange={(e) =>
                            setFiles((previous) => ({
                              ...previous,
                              [assignment._id]: e.target.files[0],
                            }))
                          }
                          className="w-full text-sm text-slate-400 file:mr-3 file:rounded-lg file:border-0 file:bg-indigo-600 file:px-3 file:py-2 file:text-white"
                        />

                        <button
                          onClick={() => handleUpload(assignment._id)}
                          disabled={uploading === assignment._id}
                          className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-3 font-semibold hover:bg-indigo-500 disabled:opacity-50"
                        >
                          <Upload size={17} />
                          {uploading === assignment._id
                            ? "Uploading..."
                            : "Submit Assignment"}
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <section>
          <h3 className="mb-5 text-xl font-semibold">
            My Submission History
          </h3>

          {submissions.length === 0 ? (
            <p className="text-slate-400">
              You haven't submitted any assignments yet.
            </p>
          ) : (
            <div className="space-y-3">
              {submissions.map((submission) => (
                <div
                  key={submission._id}
                  className="rounded-xl border border-slate-800 bg-slate-900 p-5"
                >
                  <p className="font-semibold">
                    {submission.assignment?.title || "Assignment"}
                  </p>
                  <p className="mt-2 text-sm text-slate-400">
                    File: {submission.fileName}
                  </p>
                  <p className="mt-2 text-sm text-green-300">
                    Status: {submission.status}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Submitted:{" "}
                    {new Date(submission.submittedAt).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default StudentDashboard;
