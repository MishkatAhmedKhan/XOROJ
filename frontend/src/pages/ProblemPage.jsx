import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";

import { apiFetch } from "../api/client";
import Card from "../components/Card";
import IDE from "../components/IDE.jsx";
import MathRenderer from "../components/MathRenderer.jsx";

import "../styles/styles.css";

export default function ProblemPage() {
  const { pid } = useParams();
  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Lifted code/language from IDE for submission
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

  // No longer needed as submission is handled by the IDE component

  if (loading) return <p className="text-center mt-6">Loading problem...</p>;
  if (error) return <p className="text-red-500 mt-6 text-center">Error: {error}</p>;
  if (!problem) return <p className="text-center mt-6">Problem not found.</p>;

  return (
    <div className="h-full min-h-0 flex flex-col">
      {/* MOBILE / SMALL SCREENS */}
      <div className="flex-1 lg:hidden flex flex-col min-h-0">
        <PanelGroup direction="vertical" className="flex-1 min-h-0">
          <Panel defaultSize={50} minSize={25} className="overflow-auto">
            <div className="p-3 sm:p-4 space-y-4 pb-4">
              <Card className="text-center bg-gray-50 p-4 rounded-lg shadow">
                <h1 className="text-xl sm:text-2xl font-bold">{problem.title}</h1>
                <div className="flex flex-col sm:flex-row justify-center gap-2 sm:gap-6 mt-2 text-xs sm:text-sm text-gray-700 themed-text">
                  <span>Time Limit: {problem.timeLimit} ms</span>
                  <span>Memory Limit: {problem.memoryLimit / 1000} MB</span>
                </div>
              </Card>

              <Card title="Description"><MathRenderer content={problem.description} /></Card>
              <Card title="Input Format"><MathRenderer content={problem.inputFormat} /></Card>
              {problem.outputFormat && <Card title="Output Format"><MathRenderer content={problem.outputFormat} /></Card>}
              <Card title="Sample Input"><pre className="text-sm overflow-x-auto">{problem.sampleInput}</pre></Card>
              <Card title="Sample Output"><pre className="text-sm overflow-x-auto">{problem.sampleOutput}</pre></Card>
              <Card title="Difficulty">
                <div className="flex flex-wrap gap-2 items-center">
                  <span className="font-medium text-sm">Rating: {problem.difficultyRating}</span>
                  {problem.tags?.map((tag) => (
                    <span key={tag} className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full text-xs sm:text-sm">{tag}</span>
                  ))}
                </div>
              </Card>
              {problem.notes && <Card title="Notes"><MathRenderer content={problem.notes} /></Card>}
            </div>
          </Panel>

          <PanelResizeHandle className="h-2 bg-gray-200 hover:bg-gray-300 transition-colors flex-shrink-0" />

          {/* BOTTOM - IDE */}
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

      {/* DESKTOP / LG+ SCREENS */}
      <div className="hidden lg:flex flex-1 min-h-0">
        <PanelGroup direction="horizontal" className="flex-1 min-h-0">
          <Panel defaultSize={45} minSize={30} className="overflow-auto">
            <div className="p-4 space-y-4 pb-4">
              <Card className="text-center bg-gray-50 p-4 rounded-lg shadow">
                <h1 className="text-2xl xl:text-3xl font-bold">{problem.title}</h1>
                <div className="flex justify-center gap-6 mt-2 text-sm text-gray-700 themed-text">
                  <span>Time Limit: {problem.timeLimit} ms</span>
                  <span>Memory Limit: {problem.memoryLimit / 1000} MB</span>
                </div>
              </Card>

              <Card title="Description"><MathRenderer content={problem.description} /></Card>
              <Card title="Input Format"><MathRenderer content={problem.inputFormat} /></Card>
              {problem.outputFormat && <Card title="Output Format"><MathRenderer content={problem.outputFormat} /></Card>}
              <Card title="Sample Input"><pre className="text-sm overflow-x-auto">{problem.sampleInput}</pre></Card>
              <Card title="Sample Output"><pre className="text-sm overflow-x-auto">{problem.sampleOutput}</pre></Card>
              <Card title="Difficulty & Tags">
                <div className="flex flex-wrap gap-2 items-center">
                  <span className="font-medium">Rating: {problem.difficultyRating}</span>
                  {problem.tags?.map((tag) => (
                    <span key={tag} className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full text-sm">{tag}</span>
                  ))}
                </div>
              </Card>
              {problem.notes && <Card title="Notes"><MathRenderer content={problem.notes} /></Card>}
            </div>
          </Panel>

          <PanelResizeHandle className="w-2 bg-gray-200 hover:bg-gray-300 transition-colors flex-shrink-0" />

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
