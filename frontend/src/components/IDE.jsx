import { useCallback, useEffect, useMemo, useState } from "react";
import { apiFetch } from "../api/client";
import CodeEditor from "./CodeEditor";
import Button from "./Button";

export default function IDE({
  endpointRun = "/api/submissions/test",
  endpointSubmit = "/api/submissions/submit",
  defaultLanguage = "cpp",
  initialCode,
  initialStdin = "5\n90 12 33 33 45\n",
  showLanguageSelector = true,
  onResult, // optional callback(result)
  code: parentCode, // optional controlled code from parent
  setCode: setParentCode, // optional setter from parent
  language: parentLanguage,
  setLanguage: setParentLanguage,
}) {
  const DEFAULT_SNIPPETS = {
    cpp: `#include <bits/stdc++.h>
using namespace std;
int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n; cin >> n;
    return 0;
}
`,
    java: `import java.io.*;
import java.util.*;
public class Main {
    public static void main(String[] args) throws Exception {
        var sc = new Scanner(System.in);
        int n = sc.hasNextInt() ? sc.nextInt() : 0;
    }
}
`,
    python: `import sys
data = sys.stdin.read().strip().split()
if not data:
    print(0)
    sys.exit(0)
n = int(data[0])
`,
  };

  const [language, setLanguage] = useState(parentLanguage ?? defaultLanguage);
  const [code, setCode] = useState(parentCode ?? (initialCode ?? DEFAULT_SNIPPETS[defaultLanguage] ?? ""));
  const [stdinText, setStdinText] = useState(initialStdin);
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [verdict, setVerdict] = useState(null); // separate verdict state

  // Keep parent state in sync if provided
  useEffect(() => {
    if (setParentCode) setParentCode(code);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

  useEffect(() => {
    if (setParentLanguage) setParentLanguage(language);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language]);

  // Reset snippet if language changes and no initialCode
  useEffect(() => {
    if (!initialCode) {
      setCode(DEFAULT_SNIPPETS[language] || "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language]);

  const canRun = useMemo(() => code.trim().length > 0 && !isRunning && !isSubmitting, [code, isRunning, isSubmitting]);

  const normalizeResult = (d) => ({
    stdout: d?.stdout ?? d?.out ?? "",
    stderr: d?.stderr ?? d?.error ?? "",
    time: d?.timeUsedMillis ?? d?.timeused ?? d?.time_ms ?? "",
    memory: d?.memoryUsedKB ?? d?.memoryused ?? d?.memory_kb ?? "",
    exitCode: d?.exitCode,
  });

  const runCode = useCallback(async () => {
    if (!canRun) return;
    setIsRunning(true);
    setError("");
    setResult(null);
    setVerdict(null); // clear verdict when running
    try {
      const data = await apiFetch(endpointRun, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          language,
          stdin: stdinText,
        }),
      });
      const normalized = normalizeResult(data);
      setResult(normalized);
      onResult?.(normalized);
    } catch (e) {
      setError(e?.message || "Run failed");
    } finally {
      setIsRunning(false);
    }
  }, [canRun, code, language, stdinText, endpointRun, onResult]);

  const submitCode = useCallback(async () => {
    if (!canRun) return;
    setIsSubmitting(true);
    setError("");
    setResult(null);
    setVerdict(null);
    try {
      const data = await apiFetch(endpointSubmit, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          language,
        }),
      });
      // The submit endpoint returns a verdict string (e.g. "ACCEPTED")
      if (typeof data === 'string') {
        setVerdict(data);
        onResult?.({ verdict: data });
      } else {
        const normalized = normalizeResult(data);
        setResult(normalized);
        if (data?.verdict || data?.status) {
          setVerdict(data.verdict || data.status);
        }
        onResult?.(normalized);
      }
    } catch (e) {
      setError(e?.message || "Submission failed");
    } finally {
      setIsSubmitting(false);
    }
  }, [canRun, code, language, endpointSubmit, onResult]);

  // Ctrl/Cmd + Enter to run
  useEffect(() => {
    const handler = (e) => {
      const isMac = /Mac|iPhone|iPad|iPod/.test(navigator.userAgent);
      if ((isMac ? e.metaKey : e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        runCode();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [runCode]);

  const verdictColor = (v) => {
    if (!v) return "";
    const s = v.toUpperCase();
    if (s === "ACCEPTED") return "var(--verdict-accepted, #16a34a)";
    if (s.includes("WRONG")) return "var(--verdict-wrong, #ef4444)";
    if (s.includes("TIME")) return "var(--verdict-tle, #f59e0b)";
    if (s.includes("MEMORY")) return "var(--verdict-mle, #8b5cf6)";
    if (s.includes("RUNTIME") || s.includes("ERROR")) return "var(--verdict-re, #ef4444)";
    if (s.includes("COMPILATION")) return "var(--verdict-ce, #f97316)";
    return "var(--colour-2)";
  };

  return (
    <div className="ide-container">
      {/* Language selector + Run/Submit buttons */}
      {showLanguageSelector && (
        <div className="ide-toolbar">
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="ide-lang-select"
            aria-label="Language"
          >
            <option value="cpp">C++17</option>
            <option value="java">Java 17</option>
            <option value="python">Python 3</option>
          </select>

          <div className="ide-btn-group">
            <button
              onClick={runCode}
              disabled={!canRun}
              className={`ide-btn ide-btn-run ${!canRun ? "ide-btn-disabled" : ""}`}
              title="Run (Ctrl/Cmd + Enter)"
            >
              {isRunning ? (
                <><span className="ide-spinner" /> Running…</>
              ) : (
                <>▶ Run</>
              )}
            </button>
            {endpointSubmit && (
              <button
                onClick={submitCode}
                disabled={!canRun}
                className={`ide-btn ide-btn-submit ${!canRun ? "ide-btn-disabled" : ""}`}
              >
                {isSubmitting ? (
                  <><span className="ide-spinner" /> Submitting…</>
                ) : (
                  <>⬆ Submit</>
                )}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Main content area */}
      <div className="ide-content">
        {/* Code editor */}
        <section className="ide-section">
          <label className="ide-label">Code Editor</label>
          <div className="ide-editor-wrap">
            <CodeEditor
              language={language}
              value={code}
              onChange={setCode}
              height="100%"
            />
          </div>
        </section>

        {/* STDIN input */}
        <section className="ide-section">
          <label className="ide-label">Program Input (STDIN)</label>
          <textarea
            value={stdinText}
            onChange={(e) => setStdinText(e.target.value)}
            className="ide-textarea"
            placeholder="Provide input for your program…"
          />
        </section>

        {/* Verdict (separate from output) */}
        {verdict && (
          <section className="ide-verdict-section">
            <div className="ide-verdict-badge" style={{ borderColor: verdictColor(verdict) }}>
              <span className="ide-verdict-label">Verdict</span>
              <span className="ide-verdict-value" style={{ color: verdictColor(verdict) }}>
                {verdict.replace(/_/g, " ")}
              </span>
            </div>
          </section>
        )}

        {/* Results */}
        <section className="ide-results-grid">
          <div className="ide-result-box">
            <div className="ide-result-header">
              <h2 className="ide-result-title">Output</h2>
              <Metrics result={result} />
            </div>
            <pre className="ide-output-pre">
              {result
                ? result.stdout?.length > 0
                  ? String(result.stdout)
                  : <span className="ide-placeholder">No output</span>
                : <span className="ide-placeholder">—</span>}
            </pre>
          </div>

          <div className="ide-result-box">
            <h2 className="ide-result-title">
              Errors
              {result?.exitCode !== undefined && result?.exitCode !== 0 && (
                <span className="ide-exit-code">(exit code: {result.exitCode})</span>
              )}
            </h2>
            <pre className={`ide-output-pre ${result?.stderr?.length > 0 ? "ide-error-pre" : ""}`}>
              {result
                ? result.stderr?.length > 0
                  ? String(result.stderr)
                  : <span className="ide-placeholder">No errors</span>
                : <span className="ide-placeholder">—</span>}
            </pre>
          </div>
        </section>
      </div>

      {/* Error message */}
      {error && (
        <div className="ide-error-banner">
          {error}
        </div>
      )}
    </div>
  );
}

function Metrics({ result }) {
  if (!result) return <div className="ide-metrics">time: — | memory: —</div>;
  return (
    <div className="ide-metrics">
      time: <span className="ide-mono">{String(result.time ?? "—")}</span>{" "}
      | memory: <span className="ide-mono">{String(result.memory ?? "—")}</span>
    </div>
  );
}
