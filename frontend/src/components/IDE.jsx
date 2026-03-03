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
  const [showExtras, setShowExtras] = useState(true);

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
    time: d?.timeused ?? d?.timeUsedMillis ?? d?.time_ms ?? "",
    memory: d?.memoryused ?? d?.memoryUsedKB ?? d?.memory_kb ?? "",
  });

  const runCode = useCallback(async () => {
    if (!canRun) return;
    setIsRunning(true);
    setError("");
    setResult(null);
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
      setError(e?.message || "Submit failed");
    } finally {
      setIsRunning(false);
    }
  }, [canRun, code, language, stdinText, endpointRun, onResult]);

  const submitCode = useCallback(async () => {
    if (!canRun) return;
    setIsSubmitting(true);
    setError("");
    setResult(null);
    try {
      const data = await apiFetch(endpointSubmit, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          language,
        }),
      });
      const normalized = normalizeResult(data);
      setResult(normalized);
      onResult?.(normalized);
      // Show success notification
      alert("Submission successful!");
    } catch (e) {
      setError(e?.message || "Submission failed");
      alert("Submission failed: " + (e?.message || "Unknown error"));
    } finally {
      setIsSubmitting(false);
    }
  }, [canRun, code, language, stdinText, endpointSubmit, onResult]);

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

  return (
    <div className="w-full min-h-0 flex flex-col p-3 sm:p-4 space-y-4 max-h-screen overflow-hidden">
      {/* Language selector + Run button */}
      {showLanguageSelector && (
        <div className="flex-shrink-0 flex flex-col sm:flex-row gap-3 sm:justify-between">
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="border rounded px-2 py-1 w-full sm:w-auto"
            aria-label="Language"
          >
            <option value="cpp">C++17</option>
            <option value="java">Java 17</option>
            <option value="python">Python 3</option>
          </select>

          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              onClick={runCode}
              disabled={!canRun}
              loading={isRunning}
              className={`px-3 py-1 w-full sm:w-auto ${canRun ? "bg-black text-white" : ""}`}
              title="Run (Ctrl/Cmd + Enter)"
            >
              {isRunning ? "Running…" : "Run"}
            </Button>
            {endpointSubmit && (
              <Button
                onClick={submitCode}
                disabled={!canRun}
                loading={isSubmitting}
                className={`px-3 py-1 w-full sm:w-auto ${canRun ? "bg-green-600 text-white hover:bg-green-700" : ""}`}
              >
                {isSubmitting ? "Submitting…" : "Submit"}
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Main content area - scrollable */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="space-y-4">
          {/* Code editor */}
          <section className="space-y-2">
            <label className="text-sm font-medium">Code Editor</label>
            <div className="h-[260px] sm:h-[310px] md:h-[360px] lg:h-[410px] xl:h-[460px]">
              <CodeEditor
                language={language}
                value={code}
                onChange={setCode}
                height="100%"
              />
            </div>
          </section>

          {/* STDIN input */}
          <section className="space-y-2">
            <label className="text-sm font-medium">Program Input (STDIN)</label>
            <textarea
              value={stdinText}
              onChange={(e) => setStdinText(e.target.value)}
              className="w-full h-24 sm:h-32 font-mono text-sm border rounded p-3 resize-none"
              placeholder="Provide input for your program…"
            />
          </section>

          {/* Results */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-4 pb-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold">Output</h2>
                <Metrics result={result} />
              </div>
              <pre className="w-full h-24 sm:h-32 border rounded p-3 overflow-auto whitespace-pre-wrap text-sm">
                {result
                  ? result.stdout?.length > 0
                    ? String(result.stdout)
                    : <span className="text-gray-400">No output</span>
                  : <span className="text-gray-400">—</span>}
              </pre>
            </div>

            <div className="space-y-2">
              <h2 className="font-semibold flex items-center gap-2">
                Errors
                {result?.exitCode !== undefined && (
                  <span className="text-xs text-gray-500">(exit code: {result.exitCode})</span>
                )}
              </h2>
              <pre
                className={`w-full h-24 sm:h-32 border rounded p-3 overflow-auto whitespace-pre-wrap text-sm ${result?.stderr?.length > 0 ? "bg-red-50 border-red-300 text-red-700" : ""
                  }`}
              >
                {result
                  ? result.stderr?.length > 0
                    ? String(result.stderr)
                    : <span className="text-gray-400">No errors</span>
                  : <span className="text-gray-400">—</span>}
              </pre>
            </div>
          </section>
        </div>
      </div>

      {/* Error message - fixed at bottom when present */}
      {error && (
        <div className="flex-shrink-0 border border-red-300 bg-red-50 text-red-700 rounded p-3">
          {error}
        </div>
      )}
    </div>
  );
}

function Metrics({ result }) {
  if (!result) return <div className="text-xs text-gray-500">time: — | memory: —</div>;
  return (
    <div className="text-xs text-gray-600">
      time: <span className="font-mono">{String(result.time ?? "—")}</span>{" "}
      | memory: <span className="font-mono">{String(result.memory ?? "—")}</span>
    </div>
  );
}
