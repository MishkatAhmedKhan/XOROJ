// src/pages/ProblemPage.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Header from "../components/Header";
import Card from "../components/Card";
import Button from "../components/Button";
import { apiFetch } from "../api/client";

export default function ProblemPage() {
  const { id } = useParams();
  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [code, setCode] = useState("// Write your code here\n");
  const [language, setLanguage] = useState("cpp");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);
  const [submissions, setSubmissions] = useState([]);

  // Fetch problem details
  useEffect(() => {
    apiFetch(`/api/problems/${id}`)
      .then((data) => {
        setProblem(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch problem", err);
        setError(err.message);
        setLoading(false);
      });
  }, [id]);

  // Placeholder submit handler - to be implemented later
  const handleSubmit = () => {
    setSubmitting(true);
    setMessage(null);

    // Simulate submission
    setTimeout(() => {
      setMessage("Submission feature coming soon!");
      setSubmitting(false);
    }, 1000);
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto mt-6 px-4">
        <p className="text-center">Loading problem...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-5xl mx-auto mt-6 px-4">
        <Card>
          <p className="text-red-500">Error: {error}</p>
        </Card>
      </div>
    );
  }

  if (!problem) {
    return (
      <div className="max-w-5xl mx-auto mt-6 px-4">
        <Card>
          <p className="text-center">Problem not found.</p>
        </Card>
      </div>
    );
  }

  return (
    <>
    <Header />
    <div className="max-w-5xl mx-auto mt-6 px-4 space-y-6">
      {/* Problem Header */}
      <Card>
        <h1 className="text-2xl font-bold text-gray-800">{problem.title}</h1>
        <div className="flex flex-wrap gap-3 mt-2 text-sm text-gray-500">
          <span>Author: {problem.author}</span>
          <span>Time Limit: {problem.timeLimit} sec</span>
          <span>Memory Limit: {problem.memoryLimit} MB</span>
        </div>
      </Card>

      {/* Problem Statement */}
      <Card title="Problem Statement">
        <div
          className="prose max-w-none text-gray-700"
          dangerouslySetInnerHTML={{ __html: problem.statement }}
        />
      </Card>

      {/* Submit Panel */}
      <Card title="Submit Solution">
        <div className="flex flex-col space-y-3">
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="w-32 rounded-md border px-2 py-1"
          >
            <option value="cpp">C++</option>
            <option value="py">Python</option>
            <option value="java">Java</option>
          </select>

          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            rows={10}
            className="w-full border rounded-lg p-2 font-mono text-sm"
          />

          <div className="flex items-center gap-3">
            <Button onClick={handleSubmit} loading={submitting}>
              Submit
            </Button>
            {message && <span className="text-gray-600">{message}</span>}
          </div>
        </div>
      </Card>

      {/* My Submissions - Coming Soon */}
      <Card title="My Submissions">
        <p className="text-gray-500">Submissions feature coming soon!</p>
      </Card>
    </div>
    </>
  );
}
