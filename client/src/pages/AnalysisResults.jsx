
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  RefreshCw,
  AlertCircle,
  Download,
  BrainCircuit,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import API from "../services/api";

function AnalysisResults({ assignmentId, onBack }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const analyzeAssignment = async () => {
    try {
      setLoading(true);
      setError("");

      const token = sessionStorage.getItem("token");

      const response = await API.get(
        `/analysis/${assignmentId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setData(response.data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Unable to analyze assignment."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    analyzeAssignment();
  }, [assignmentId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <p className="text-indigo-400">
          AI is analyzing student submissions...
        </p>
      </div>
    );
  }

  const results = data?.results || [];

  const high = results.filter(
    (item) => item.similarityPercentage >= 70
  ).length;

  const moderate = results.filter(
    (item) =>
      item.similarityPercentage >= 40 &&
      item.similarityPercentage < 70
  ).length;

  const low = results.filter(
    (item) => item.similarityPercentage < 40
  ).length;

  const chartData = results.map((item, index) => ({
    name: `${item.student1} - ${item.student2}`,
    similarity: item.similarityPercentage,
  }));

  const pieData = [
    { name: "High", value: high },
    { name: "Moderate", value: moderate },
    { name: "Low", value: low },
  ].filter((item) => item.value > 0);

  const COLORS = ["#ef4444", "#eab308", "#22c55e"];

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      <div className="max-w-7xl mx-auto">

        <button
          onClick={onBack}
          className="flex items-center gap-2 text-indigo-400 mb-6"
        >
          <ArrowLeft size={20} />
          Back to Dashboard
        </button>

        <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">
              AI Assignment Analysis
            </h1>
            <p className="text-slate-400 mt-2">
              Similarity detection and matched passage analysis
            </p>
          </div>

          <button
            onClick={analyzeAssignment}
            className="flex items-center gap-2 bg-indigo-600 px-5 py-3 rounded-xl hover:bg-indigo-500"
          >
            <RefreshCw size={18} />
            Analyze Again
          </button>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-xl flex gap-3">
            <AlertCircle />
            {error}
          </div>
        )}

        {data && (
          <>
            {/* SUMMARY CARDS */}
            <div className="grid md:grid-cols-3 gap-5 mb-8">
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                <p className="text-slate-400">Assignment</p>
                <h2 className="text-xl font-bold mt-2">
                  {data.assignment}
                </h2>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                <p className="text-slate-400">Total Submissions</p>
                <h2 className="text-3xl font-bold mt-2">
                  {data.totalSubmissions}
                </h2>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                <p className="text-slate-400">Total Comparisons</p>
                <h2 className="text-3xl font-bold mt-2">
                  {data.totalComparisons}
                </h2>
              </div>
            </div>

            {/* CHARTS */}
            <div className="grid lg:grid-cols-2 gap-6 mb-8">

              <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                <h2 className="font-bold text-lg mb-5">
                  Pairwise Similarity
                </h2>

                {chartData.length === 0 ? (
                  <p className="text-slate-400">
                    No comparison data available.
                  </p>
                ) : (
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                        <XAxis
                          dataKey="name"
                          tick={{ fill: "#cbd5e1", fontSize: 11 }}
                          angle={-20}
                          textAnchor="end"
                          interval={0}
                          height={75}
                        />
                        <YAxis
                          domain={[0, 100]}
                          tick={{ fill: "#cbd5e1" }}
                        />
                        <Tooltip />
                        <Bar
                          dataKey="similarity"
                          name="Similarity %"
                          fill="#818cf8"
                          radius={[6, 6, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>

              <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                <h2 className="font-bold text-lg mb-5">
                  Similarity Distribution
                </h2>

                {pieData.length === 0 ? (
                  <p className="text-slate-400">
                    No comparison data available.
                  </p>
                ) : (
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          label
                        >
                          {pieData.map((entry, index) => (
                            <Cell
  key={entry.name}
  fill={
    entry.name === "High"
      ? "#ef4444"
      : entry.name === "Moderate"
      ? "#eab308"
      : "#22c55e"
  }
/>
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            </div>

            {/* SIMILARITY RESULTS */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-8">
              <h2 className="text-xl font-bold mb-5">
                Similarity Results
              </h2>

              {results.length === 0 ? (
                <p className="text-slate-400">
                  No valid file comparisons were completed.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-slate-700 text-slate-400">
                        <th className="p-3">Student 1</th>
                        <th className="p-3">Student 2</th>
                        <th className="p-3">File 1</th>
                        <th className="p-3">File 2</th>
                        <th className="p-3">Similarity</th>
                        <th className="p-3">Status</th>
                      </tr>
                    </thead>

                    <tbody>
                      {results.map((item, index) => {
                        const score = item.similarityPercentage;

                        return (
                          <tr
                            key={index}
                            className="border-b border-slate-800"
                          >
                            <td className="p-3">{item.student1}</td>
                            <td className="p-3">{item.student2}</td>
                            <td className="p-3">{item.file1}</td>
                            <td className="p-3">{item.file2}</td>
                            <td className="p-3 font-bold">{score}%</td>
                            <td className="p-3">
                              <span
                                className={`px-3 py-1 rounded-full text-xs ${
                                  score >= 70
                                    ? "bg-red-500/20 text-red-400"
                                    : score >= 40
                                    ? "bg-yellow-500/20 text-yellow-400"
                                    : "bg-green-500/20 text-green-400"
                                }`}
                              >
                                {score >= 70
                                  ? "High Similarity"
                                  : score >= 40
                                  ? "Moderate Similarity"
                                  : "Low Similarity"}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* MATCHED PASSAGES */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <h2 className="flex items-center gap-2 text-xl font-bold mb-5">
                <BrainCircuit className="text-indigo-400" />
                Matched Passages
              </h2>

              {results.map((item, index) => (
                <div
                  key={index}
                  className="border-b border-slate-800 py-5 last:border-0"
                >
                  <h3 className="font-semibold mb-3">
                    {item.student1} vs {item.student2}
                    <span className="ml-2 text-indigo-400">
                      ({item.similarityPercentage}%)
                    </span>
                  </h3>

                  {!item.matchedPassages ||
                  item.matchedPassages.length === 0 ? (
                    <p className="text-sm text-slate-500">
                      No matching passages were returned for this pair.
                    </p>
                  ) : (
                    item.matchedPassages.map((passage, passageIndex) => (
                      <div
                        key={passageIndex}
                        className="grid md:grid-cols-2 gap-4 mb-4"
                      >
                        <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl">
                          <p className="text-xs text-indigo-400 mb-2">
                            {item.student1}'s passage
                          </p>
                          <p className="text-sm text-slate-300">
                            {passage.passage1}
                          </p>
                        </div>

                        <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl">
                          <p className="text-xs text-green-400 mb-2">
                            {item.student2}'s passage
                          </p>
                          <p className="text-sm text-slate-300">
                            {passage.passage2}
                          </p>
                        </div>

                        <p className="md:col-span-2 text-xs text-slate-400">
                          Passage similarity:{" "}
                          {passage.similarity_percentage}%
                        </p>
                      </div>
                    ))
                  )}
                </div>
              ))}
            </div>

            <p className="text-xs text-slate-500 mt-6">
              Similarity scores indicate text overlap, not proof of
              academic misconduct. Faculty should review the original
              documents and matched passages before making decisions.
            </p>
          </>
        )}
      </div>
    </div>
  );
}

export default AnalysisResults;
