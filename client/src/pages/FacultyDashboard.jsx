
import { useEffect, useState } from "react";
import {
  PlusCircle,
  BookOpen,
  LogOut,
  RefreshCw,
  BrainCircuit,
} from "lucide-react";
import API from "../services/api";
import AnalysisResults from "./AnalysisResults";

function FacultyDashboard({ user, onLogout }) {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [message, setMessage] = useState("");
  const [selectedAssignmentId, setSelectedAssignmentId] = useState(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    subject: "",
    deadline: "",
  });

  const getAssignments = async () => {
    try {
      setLoading(true);

      const token = sessionStorage.getItem("token");

      const response = await API.get("/assignments", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setAssignments(response.data.assignments);
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Could not load assignments."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getAssignments();
  }, []);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      setCreating(true);

      const token = sessionStorage.getItem("token");

      await API.post("/assignments", form, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setMessage("Assignment created successfully!");

      setForm({
        title: "",
        description: "",
        subject: "",
        deadline: "",
      });

      await getAssignments();
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Failed to create assignment."
      );
    } finally {
      setCreating(false);
    }
  };

  // Show analysis page when faculty clicks Analyze Assignment
  if (selectedAssignmentId) {
    return (
      <AnalysisResults
        assignmentId={selectedAssignmentId}
        onBack={() => setSelectedAssignmentId(null)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="flex items-center justify-between border-b border-slate-800 px-6 py-5">
        <div>
          <h1 className="text-2xl font-bold text-indigo-400">
            IntelliCheck
          </h1>
          <p className="text-sm text-slate-400">Faculty Dashboard</p>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-sm text-slate-300">{user.name}</span>

          <button
            onClick={onLogout}
            className="flex items-center gap-2 rounded-lg bg-slate-800 px-4 py-2 hover:bg-slate-700"
          >
            <LogOut size={17} /> Logout
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-8 px-6 py-8">
        <section>
          <h2 className="text-3xl font-bold">Welcome, {user.name}!</h2>
          <p className="mt-2 text-slate-400">
            Create assignments and manage student work.
          </p>
        </section>

        <section className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <BookOpen className="mb-3 text-indigo-400" size={28} />
            <p className="text-sm text-slate-400">Total Assignments</p>
            <p className="mt-2 text-3xl font-bold">{assignments.length}</p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <RefreshCw className="mb-3 text-green-400" size={28} />
            <p className="text-sm text-slate-400">Dashboard Status</p>
            <p className="mt-2 text-xl font-semibold">Connected</p>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <h3 className="mb-6 flex items-center gap-2 text-xl font-semibold">
            <PlusCircle className="text-indigo-400" />
            Create New Assignment
          </h3>

          <form onSubmit={handleSubmit} className="grid gap-5">
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Assignment title"
              required
              className="rounded-lg border border-slate-700 bg-slate-950 p-3 outline-none focus:border-indigo-500"
            />

            <input
              name="subject"
              value={form.subject}
              onChange={handleChange}
              placeholder="Subject name"
              required
              className="rounded-lg border border-slate-700 bg-slate-950 p-3 outline-none focus:border-indigo-500"
            />

            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Assignment description and instructions"
              required
              rows="4"
              className="rounded-lg border border-slate-700 bg-slate-950 p-3 outline-none focus:border-indigo-500"
            />

            <div>
              <label className="mb-2 block text-sm text-slate-400">
                Submission deadline
              </label>

              <input
                type="datetime-local"
                name="deadline"
                value={form.deadline}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-slate-700 bg-slate-950 p-3 text-white"
              />
            </div>

            <button
              type="submit"
              disabled={creating}
              className="rounded-lg bg-indigo-600 px-5 py-3 font-semibold hover:bg-indigo-500 disabled:opacity-50"
            >
              {creating ? "Creating..." : "Create Assignment"}
            </button>
          </form>

          {message && (
            <p className="mt-4 text-sm text-indigo-300">{message}</p>
          )}
        </section>

        <section>
          <div className="mb-5 flex items-center justify-between">
            <h3 className="text-xl font-semibold">All Assignments</h3>

            <button
              onClick={getAssignments}
              className="flex items-center gap-2 rounded-lg bg-slate-800 px-4 py-2 text-sm hover:bg-slate-700"
            >
              <RefreshCw size={16} /> Refresh
            </button>
          </div>

          {loading ? (
            <p className="text-slate-400">Loading assignments...</p>
          ) : assignments.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-700 p-10 text-center text-slate-400">
              No assignments created yet.
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {assignments.map((assignment) => (
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

                  <p className="mt-4 text-xs text-slate-500">
                    Deadline:{" "}
                    {new Date(assignment.deadline).toLocaleString()}
                  </p>

                  <span className="mt-4 inline-block rounded-full bg-green-900/40 px-3 py-1 text-xs text-green-300">
                    {assignment.status}
                  </span>

                  <button
                    onClick={() =>
                      setSelectedAssignmentId(assignment._id)
                    }
                    className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-3 font-semibold hover:bg-indigo-500"
                  >
                    <BrainCircuit size={18} />
                    Analyze Assignment
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default FacultyDashboard;
