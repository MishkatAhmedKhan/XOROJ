import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";

import { apiFetch } from "../api/client";
import Card from "../components/Card";
import IDE from "../components/IDE.jsx";
import MathRenderer from "../components/MathRenderer.jsx";

import "../styles/styles.css";

export default function ContestProblemPage() {
  const { id, pid } = useParams();
  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("cpp");
  const [submitResult, setSubmitResult] = useState(null);

  useEffect(() => {
    apiFetch(`/api/problems/${pid}`)
      .then((data) => {
        setProblem(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [pid]);

  if (loading) return <p className="text-center mt-6" style={{ color: "var(--text-secondary)" }}>Loading problem...</p>;
  if (error) return <p className="mt-6 text-center" style={{ color: "var(--danger)" }}>Error: {error}</p>;
  if (!problem) return <p className="text-center mt-6" style={{ color: "var(--text-secondary)" }}>Problem not found.</p>;

  const ProblemStatement = () => (
    <div className="p-3 sm:p-4 space-y-4 pb-4">
      <Card className="text-center">
        <h1 className="text-xl sm:text-2xl font-bold" style={{ color: "var(--text-primary)" }}>{problem.title}</h1>
        <div className="flex flex-col sm:flex-row justify-center gap-2 sm:gap-6 mt-2 text-xs sm:text-sm" style={{ color: "var(--text-secondary)" }}>
          <span>Time Limit: {problem.timeLimit} ms</span>
          <span>Memory Limit: {Math.round(problem.memoryLimit / 1024)} MB</span>
        </div>
      </Card>

      <Card title="Description"><MathRenderer content={problem.description} /></Card>
      <Card title="Input Format"><MathRenderer content={problem.inputFormat} /></Card>
      {problem.outputFormat && <Card title="Output Format"><MathRenderer content={problem.outputFormat} /></Card>}
      <Card title="Sample Input"><pre className="text-sm overflow-x-auto" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{problem.sampleInput}</pre></Card>
      <Card title="Sample Output"><pre className="text-sm overflow-x-auto" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{problem.sampleOutput}</pre></Card>
      <Card title="Difficulty & Tags">
        <div className="flex flex-wrap gap-2 items-center">
          <span className="badge-soft">{problem.difficultyRating}</span>
          {problem.tags?.map((tag) => (
            <span key={tag} className="badge-tag">{tag}</span>
          ))}
        </div>
      </Card>
      {problem.notes && <Card title="Notes"><MathRenderer content={problem.notes} /></Card>}
    </div>
  );

  return (
    <div className="h-full min-h-0 flex flex-col">
      {/* MOBILE */}
      <div className="flex-1 lg:hidden flex flex-col min-h-0">
        <PanelGroup direction="vertical" className="flex-1 min-h-0">
          <Panel defaultSize={50} minSize={25} className="overflow-auto">
            <ProblemStatement />
          </Panel>
          <PanelResizeHandle className="h-2 flex-shrink-0"
            style={{ background: "var(--border-primary)", cursor: "row-resize" }} />
          <Panel defaultSize={50} minSize={25} className="min-h-0">
            <IDE
              code={code}
              setCode={setCode}
              language={language}
              setLanguage={setLanguage}
              initialStdin={problem.sampleInput || ""}
              endpointSubmit={`/api/submissions/contests/${id}/problems/${pid}/submit`}
              onResult={result => setSubmitResult(result)}
            />
          </Panel>
        </PanelGroup>
      </div>

      {/* DESKTOP */}
      <div className="hidden lg:flex flex-1 min-h-0">
        <PanelGroup direction="horizontal" className="flex-1 min-h-0">
          <Panel defaultSize={45} minSize={30} className="overflow-auto">
            <ProblemStatement />
          </Panel>
          <PanelResizeHandle className="w-2 flex-shrink-0"
            style={{ background: "var(--border-primary)", cursor: "col-resize" }} />
          <Panel defaultSize={55} minSize={30} className="min-h-0">
            <IDE
              code={code}
              setCode={setCode}
              language={language}
              setLanguage={setLanguage}
              initialStdin={problem.sampleInput || ""}
              endpointSubmit={`/api/submissions/contests/${id}/problems/${pid}/submit`}
              onResult={result => setSubmitResult(result)}
            />
          </Panel>
        </PanelGroup>
      </div>
    </div>
  );
}
