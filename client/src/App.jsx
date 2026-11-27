import StudentDashboard from "./pages/StudentDashboard";
import FacultyDashboard from "./pages/FacultyDashboard";
import { useState } from "react";
import {
  GraduationCap,
  ShieldCheck,
  UserRound,
  Mail,
  Lock,
  Eye,
  EyeOff,
  BrainCircuit,
  ArrowRight,
  FileCheck2,
} from "lucide-react";

import { loginUser, registerUser } from "./services/authService";

function App() {
  const [role, setRole] = useState("Student");
  const [isRegister, setIsRegister] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [message, setMessage] = useState({
    type: "",
    text: "",
  });

  const [loggedInUser, setLoggedInUser] = useState(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const roles = [
    { name: "Student", icon: GraduationCap },
    { name: "Faculty", icon: UserRound },
    { name: "Admin", icon: ShieldCheck },
  ];

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleRoleChange = (selectedRole) => {
    setRole(selectedRole);
    setMessage({ type: "", text: "" });

    // Admin accounts cannot be publicly registered
    if (selectedRole === "Admin") {
      setIsRegister(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage({ type: "", text: "" });

    if (isRegister && role === "Admin") {
      setMessage({
        type: "error",
        text: "Admin registration is not available.",
      });
      return;
    }

    try {
      setLoading(true);

      if (isRegister) {
        // STUDENT / FACULTY REGISTRATION

        const response = await registerUser({
          name: form.name.trim(),
          email: form.email.trim().toLowerCase(),
          password: form.password,
          role,
        });

        setMessage({
          type: "success",
          text: response.message + ". Please sign in.",
        });

        setIsRegister(false);

        setForm({
          name: "",
          email: form.email.trim(),
          password: "",
        });
      } else {
        // LOGIN

        const response = await loginUser({
          email: form.email.trim().toLowerCase(),
          password: form.password,
          role,
        });

        setLoggedInUser(response.user);

        setMessage({
          type: "success",
          text: "Login successful! Welcome to IntelliCheck.",
        });
      }
    } catch (error) {
      setMessage({
        type: "error",
        text:
          error.response?.data?.message ||
          "Unable to connect to the server. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");

    setLoggedInUser(null);
    setForm({
      name: "",
      email: "",
      password: "",
    });

    setMessage({
      type: "",
      text: "",
    });
  };

  // TEMPORARY LOGIN SUCCESS SCREEN
  // We will build the actual dashboards next.
if (loggedInUser) {
  if (loggedInUser.role === "Student") {
    return (
      <StudentDashboard
        user={loggedInUser}
        onLogout={handleLogout}
      />
    );
  }
  if (loggedInUser.role === "Faculty") {
  return (
    <FacultyDashboard
      user={loggedInUser}
      onLogout={handleLogout}
    />
  );
}

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-3xl font-bold">
          Welcome, {loggedInUser.name}
        </h1>
        <p className="text-slate-400 mt-3">
          {loggedInUser.role} dashboard is coming next.
        </p>
        <button
          onClick={handleLogout}
          className="bg-indigo-600 px-6 py-3 rounded-xl mt-6"
        >
          Logout
        </button>
      </div>
    </div>
  );
}

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-5">

      <div className="w-full max-w-6xl grid md:grid-cols-2 bg-slate-900 rounded-3xl overflow-hidden border border-slate-800 shadow-2xl">

        {/* LEFT SIDE */}

        <div className="hidden md:flex flex-col justify-between p-12 bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950">

          <div>
            <div className="flex items-center gap-3">
              <div className="bg-indigo-600 p-3 rounded-xl">
                <BrainCircuit size={30} />
              </div>

              <div>
                <h1 className="text-xl font-bold">
                  IntelliCheck
                </h1>

                <p className="text-xs text-slate-400">
                  AI Assignment Analysis
                </p>
              </div>
            </div>

            <div className="mt-24">
              <p className="text-indigo-400 font-semibold mb-4">
                SMARTER ACADEMIC INTEGRITY
              </p>

              <h2 className="text-4xl font-bold leading-tight">
                Detect Similarity.
                <br />
                Discover Connections.
                <br />
                Ensure Originality.
              </h2>

              <p className="text-slate-400 mt-6 leading-7">
                An intelligent assignment analysis platform
                that helps faculty identify duplicate content
                and potentially suspicious similarities using
                Artificial Intelligence and NLP.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">

            <div className="bg-slate-800/70 p-5 rounded-xl">
              <BrainCircuit className="text-indigo-400 mb-3" />
              <h3 className="font-semibold">AI Powered</h3>
              <p className="text-xs text-slate-400 mt-2">
                Semantic text analysis
              </p>
            </div>

            <div className="bg-slate-800/70 p-5 rounded-xl">
              <FileCheck2 className="text-green-400 mb-3" />
              <h3 className="font-semibold">Smart Reports</h3>
              <p className="text-xs text-slate-400 mt-2">
                Assignment similarity reports
              </p>
            </div>

          </div>
        </div>

        {/* RIGHT SIDE */}

        <div className="p-7 sm:p-12 flex flex-col justify-center">

          <div className="mb-8">

            <div className="flex items-center gap-2 text-indigo-400 mb-5 md:hidden">
              <BrainCircuit size={27} />
              <span className="font-bold text-white">
                IntelliCheck
              </span>
            </div>

            <h2 className="text-3xl font-bold">
              {isRegister ? "Create Account" : "Welcome Back"}
            </h2>

            <p className="text-slate-400 mt-2">
              {isRegister
                ? "Register to access your academic workspace."
                : "Sign in to your academic workspace."}
            </p>

          </div>

          {/* ROLE SELECTION */}

          <label className="text-sm text-slate-300 font-medium mb-3">
            Select your role
          </label>

          <div className="grid grid-cols-3 gap-3 mb-7">

            {roles.map((item) => {
              const Icon = item.icon;

              return (
                <button
                  key={item.name}
                  type="button"
                  onClick={() => handleRoleChange(item.name)}
                  className={`rounded-xl border p-3 flex flex-col items-center gap-2 transition ${
                    role === item.name
                      ? "bg-indigo-600/20 border-indigo-500 text-indigo-400"
                      : "bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500"
                  }`}
                >
                  <Icon size={23} />

                  <span className="text-sm font-medium">
                    {item.name}
                  </span>
                </button>
              );
            })}

          </div>

          {/* FORM */}

          <form onSubmit={handleSubmit} className="space-y-5">

            {isRegister && (
              <div>
                <label className="text-sm text-slate-300">
                  Full Name
                </label>

                <div className="relative mt-2">
                  <UserRound
                    className="absolute left-4 top-3.5 text-slate-500"
                    size={19}
                  />

                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    required
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 pl-12 pr-4 outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="text-sm text-slate-300">
                Email Address
              </label>

              <div className="relative mt-2">
                <Mail
                  className="absolute left-4 top-3.5 text-slate-500"
                  size={19}
                />

                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="name@example.com"
                  required
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 pl-12 pr-4 outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="text-sm text-slate-300">
                Password
              </label>

              <div className="relative mt-2">
                <Lock
                  className="absolute left-4 top-3.5 text-slate-500"
                  size={19}
                />

                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  required
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 pl-12 pr-12 outline-none focus:border-indigo-500"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-3.5 text-slate-400"
                >
                  {showPassword
                    ? <EyeOff size={19} />
                    : <Eye size={19} />}
                </button>
              </div>
            </div>

            {/* ERROR / SUCCESS MESSAGE */}

            {message.text && (
              <div
                role="alert"
                className={`p-3 rounded-xl text-sm ${
                  message.type === "success"
                    ? "bg-green-500/10 text-green-400 border border-green-500/30"
                    : "bg-red-500/10 text-red-400 border border-red-500/30"
                }`}
              >
                {message.text}
              </div>
            )}

            {!isRegister && (
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() =>
                    setMessage({
                      type: "error",
                      text: "Password recovery will be available soon.",
                    })
                  }
                  className="text-sm text-indigo-400 hover:text-indigo-300"
                >
                  Forgot Password?
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 transition"
            >
              {loading
                ? "Please wait..."
                : isRegister
                  ? "Create Account"
                  : "Sign In"}

              {!loading && <ArrowRight size={19} />}
            </button>

          </form>

          {/* REGISTER / LOGIN TOGGLE */}

          {role !== "Admin" ? (
            <div className="text-center mt-7 text-sm text-slate-400">

              {isRegister
                ? "Already have an account?"
                : "Don't have an account?"}

              <button
                type="button"
                onClick={() => {
                  setIsRegister(!isRegister);
                  setMessage({ type: "", text: "" });
                  setForm({
                    name: "",
                    email: form.email,
                    password: "",
                  });
                }}
                className="text-indigo-400 font-semibold ml-2 hover:text-indigo-300"
              >
                {isRegister ? "Sign In" : "Register"}
              </button>

            </div>
          ) : (
            <p className="text-center mt-7 text-xs text-slate-500">
              Admin accounts are created through a secure setup process.
            </p>
          )}

          <p className="text-center text-xs text-slate-600 mt-10">
            © 2026 IntelliCheck. AI-Powered Assignment Analysis.
          </p>

        </div>
      </div>
    </div>
  );
}

export default App;
