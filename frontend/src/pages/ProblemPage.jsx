import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";

import { apiFetch } from "../api/client";
import Card from "../components/Card";
import IDE from "../components/IDE.jsx";
import MathRenderer from "../components/MathRenderer.jsx";

import "../styles/styles.css";

const ProblemStatement = ({ problem }) => (
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

const MySubmissions = ({ pid, submitResult }) => {
  const [subs, setSubs] = useState([]);
  const [loadingSubs, setLoadingSubs] = useState(true);
  const [subError, setSubError] = useState(null);

  useEffect(() => {
    setLoadingSubs(true);
    apiFetch(`/api/submissions/problems/${pid}/my`)
      .then(setSubs)
      .catch(err => setSubError(err.message))
      .finally(() => setLoadingSubs(false));
  }, [pid]);

  // Also refresh if submitResult changes (meaning user just submitted)
  useEffect(() => {
    if (submitResult) {
      apiFetch(`/api/submissions/problems/${pid}/my`)
        .then(setSubs)
        .catch(console.error);
    }
  }, [submitResult, pid]);

  if (loadingSubs) return <div className="p-4 text-center opacity-60">Loading submissions...</div>;
  if (subError) return <div className="p-4 text-red-500">Error: {subError}</div>;
  if (subs.length === 0) return <div className="p-4 text-center opacity-60">You have no submissions for this problem outside of contests.</div>;

  return (
    <div className="p-3 sm:p-4">
      <div className="overflow-x-auto rounded-lg border" style={{ borderColor: 'var(--border-primary)' }}>
        <table className="w-full text-sm text-left">
          <thead style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}>
            <tr>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2">Language</th>
              <th className="px-4 py-2">Time</th>
              <th className="px-4 py-2">Memory</th>
              <th className="px-4 py-2">Submitted At</th>
            </tr>
          </thead>
          <tbody className="divide-y" style={{ borderColor: 'var(--border-primary)' }}>
            {subs.map(s => (
              <tr key={s.id} style={{ backgroundColor: 'var(--card-bg)' }}>
                <td className={`px-4 py-2 font-medium ${s.status === 'ACCEPTED' ? 'text-green-600' : s.status === 'WRONG_ANSWER' ? 'text-red-600' : 'text-yellow-600'}`}>
                  {s.status}
                </td>
                <td className="px-4 py-2" style={{ color: 'var(--text-primary)' }}>{s.language}</td>
                <td className="px-4 py-2" style={{ color: 'var(--text-primary)' }}>{s.executionTime !== null ? `${s.executionTime} ms` : '-'}</td>
                <td className="px-4 py-2" style={{ color: 'var(--text-primary)' }}>{s.memoryUsed !== null ? `${s.memoryUsed} KB` : '-'}</td>
                <td className="px-4 py-2" style={{ color: 'var(--text-secondary)' }}>{new Date(s.submissionTime).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const LeftPanelContent = ({ activeTab, setActiveTab, problem, pid, submitResult }) => (
  <div className="flex flex-col h-full bg-base-100">
    <div className="flex border-b" style={{ borderColor: 'var(--border-primary)' }}>
      <button
        className={`px-4 py-3 font-medium text-sm transition-colors ${activeTab === 'problem' ? 'border-b-2' : 'opacity-70 hover:opacity-100'}`}
        style={{
          borderColor: activeTab === 'problem' ? 'var(--accent-500)' : 'transparent',
          color: activeTab === 'problem' ? 'var(--accent-500)' : 'var(--text-primary)'
        }}
        onClick={() => setActiveTab('problem')}
      >
        Problem Request
      </button>
      <button
        className={`px-4 py-3 font-medium text-sm transition-colors ${activeTab === 'submissions' ? 'border-b-2' : 'opacity-70 hover:opacity-100'}`}
        style={{
          borderColor: activeTab === 'submissions' ? 'var(--accent-500)' : 'transparent',
          color: activeTab === 'submissions' ? 'var(--accent-500)' : 'var(--text-primary)'
        }}
        onClick={() => setActiveTab('submissions')}
      >
        My Submissions
      </button>
    </div>
    <div className="flex-1 overflow-auto">
      {activeTab === 'problem' ? <ProblemStatement problem={problem} /> : <MySubmissions pid={pid} submitResult={submitResult} />}
    </div>
  </div>
);

export default function ProblemPage() {
  const { pid } = useParams();
  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("cpp");
  const [submitResult, setSubmitResult] = useState(null);
  const [activeTab, setActiveTab] = useState("problem");

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



  return (
    <div className="h-full min-h-0 flex flex-col">
      {/* MOBILE */}
      <div className="flex-1 lg:hidden flex flex-col min-h-0">
        <PanelGroup direction="vertical" className="flex-1 min-h-0">
          <Panel defaultSize={50} minSize={25} className="min-h-0 flex flex-col">
            <LeftPanelContent activeTab={activeTab} setActiveTab={setActiveTab} problem={problem} pid={pid} submitResult={submitResult} />
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
              endpointSubmit={`/api/submissions/problems/${pid}/submit`}
              onResult={result => setSubmitResult(result)}
            />
          </Panel>
        </PanelGroup>
      </div>

      {/* DESKTOP */}
      <div className="hidden lg:flex flex-1 min-h-0">
        <PanelGroup direction="horizontal" className="flex-1 min-h-0">
          <Panel defaultSize={45} minSize={30} className="min-h-0 flex flex-col">
            <LeftPanelContent activeTab={activeTab} setActiveTab={setActiveTab} problem={problem} pid={pid} submitResult={submitResult} />
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
              endpointSubmit={`/api/submissions/problems/${pid}/submit`}
              onResult={result => setSubmitResult(result)}
            />
          </Panel>
        </PanelGroup>
      </div>
    </div>
  );
}
