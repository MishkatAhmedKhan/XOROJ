import { useEffect, useMemo, useRef, useState } from "react";

/**
 * XorOJ – Polygon‑style Problem Creator
 * -------------------------------------------------------------
 * Drop this file into: src/pages/ProblemCreator.jsx (or .tsx)
 * Requires Tailwind + (optionally) DaisyUI classes in your app.
 * No external deps; markdown preview is plain by default. See notes inside.
 */

// ---------- Small utilities ----------
const slugify = (s) =>
  s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

const downloadJSON = (obj, filename) => {
  const blob = new Blob([JSON.stringify(obj, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

const readJSONFile = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        resolve(JSON.parse(reader.result));
      } catch (e) {
        reject(e);
      }
    };
    reader.onerror = reject;
    reader.readAsText(file);
  });

const LANGS = [
  "C++17",
  "C++20",
  "Java 21",
  "Python 3.11",
  "Go 1.22",
  "Rust 1.79",
  "Kotlin 2.0",
  "JavaScript (Node 20)",
];

const DEFAULT_FORM = {
  meta: {
    title: "",
    code: "",
    slug: "",
    source: "",
    author: "",
    visibility: "private", // private | contest | public
    tags: [],
    difficulty: 1200,
    license: "Original",
  },
  statement: {
    markdown: "# Problem Statement\nDescribe the task...\n\n## Input\n...\n\n## Output\n...\n",
    notes: "",
    samples: [
      { input: "", output: "", explanation: "" },
    ],
  },
  io: {
    inputSpec: "Describe the input format.",
    outputSpec: "Describe the output format.",
    constraints: "1 ≤ n ≤ 2e5",
  },
  limits: {
    timeDefaultMs: 1000,
    memoryDefaultMB: 256,
    perLanguage: LANGS.map((name) => ({ name, timeMs: 0, memoryMB: 0 })), // 0 => use default
    inputFile: "standard input",
    outputFile: "standard output",
  },
  tests: {
    pretests: [], // {id, input, output, points}
    system: [], // {id, input, output, group}
    groups: [], // {name, points, dependencies: [names]}
  },
  checker: {
    type: "diff", // diff | token | float | custom
    floatAbs: 1e-6,
    floatRel: 1e-6,
    lang: "C++17",
    code: "", // for custom
  },
  validator: {
    lang: "C++17",
    code: "",
  },
  solutions: [
    { lang: "C++20", code: "", role: "reference" }, // role: reference | accepted | wrong | tle | mle
  ],
  package: {
    version: "1.0.0",
    readme: "This package was exported from XorOJ Problem Creator.",
  },
};

const STORAGE_KEY = "xoroj_problem_draft_v1";

export default function ProblemCreatorPage() {
  const [form, setForm] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : DEFAULT_FORM;
    } catch {
      return DEFAULT_FORM;
    }
  });
  const [tab, setTab] = useState(0);
  const fileInputRef = useRef(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(form));
  }, [form]);

  const update = (path, value) => {
    setForm((prev) => setDeep(prev, path, value));
  };

  const validation = useMemo(() => validateForm(form), [form]);

  const handleExport = () => {
    const bundle = buildExportBundle(form);
    downloadJSON(bundle, `${form.meta.slug || slugify(form.meta.title) || "problem"}.json`);
  };

  const handleImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const json = await readJSONFile(file);
      setForm(json.__xoroj?.form || json); // accept our exported bundle or raw form
      setTab(0);
    } catch (err) {
      alert("Invalid JSON file");
      console.error(err);
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleReset = () => {
    if (confirm("Clear the current draft?")) setForm(DEFAULT_FORM);
  };

  const importFromCodeforces = async () => {
    const s = prompt("Enter Codeforces problem ID (e.g., 1739C):");
    if (!s) return;
    // NOTE: Stub. Hook this to your backend that fetches Polygon/CF statement.
    alert(
      `Import stub: In your backend, map '${s}' to contestId + index, fetch statement & samples, then set form.statement, form.meta.title, etc.`
    );
  };

  return (
    <div className="min-h-screen bg-base-200">
      {/* Sticky header */}
      <header className="navbar bg-base-100 shadow-sm sticky top-0 z-30 px-4">
        <div className="flex-1 gap-3 items-center">
          <div className="font-bold text-xl">XorOJ • Problem Creator</div>
          <span className="badge badge-primary badge-outline">Polygon‑style</span>
        </div>
        <div className="flex-none gap-2">
          <button className="btn btn-outline" onClick={importFromCodeforces}>Import CF</button>
          <label className="btn btn-outline" htmlFor="import-json">Import JSON</label>
          <input id="import-json" type="file" accept="application/json"
                 className="hidden" ref={fileInputRef} onChange={handleImport}/>
          <button className="btn" onClick={() => localStorage.setItem(STORAGE_KEY, JSON.stringify(form))}>Save draft</button>
          <button className="btn btn-primary" onClick={handleExport}>Export package</button>
          <button className="btn btn-error btn-outline" onClick={handleReset}>Reset</button>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto p-4">
        <Tabs tab={tab} setTab={setTab}
          items={[
            "Metadata",
            "Statement",
            "I/O & Constraints",
            "Limits",
            "Samples",
            "Tests",
            "Checker & Validator",
            "Solutions",
            "Preview",
          ]}
        />

        <div className="mt-4">
          {tab === 0 && (
            <MetadataTab form={form} update={update} />
          )}
          {tab === 1 && (
            <StatementTab form={form} update={update} />
          )}
          {tab === 2 && (
            <IoConstraintsTab form={form} update={update} />
          )}
          {tab === 3 && (
            <LimitsTab form={form} update={update} />
          )}
          {tab === 4 && (
            <SamplesTab form={form} update={update} />
          )}
          {tab === 5 && (
            <TestsTab form={form} update={update} />
          )}
          {tab === 6 && (
            <CheckerValidatorTab form={form} update={update} />
          )}
          {tab === 7 && (
            <SolutionsTab form={form} update={update} />
          )}
          {tab === 8 && (
            <PreviewTab form={form} issues={validation.issues} onExport={handleExport} />
          )}
        </div>
      </main>
    </div>
  );
}

// ---------- Tabs ----------
function Tabs({ items, tab, setTab }) {
  return (
    <div role="tablist" className="tabs tabs-boxed bg-base-100 p-1 shadow-sm">
      {items.map((label, i) => (
        <a key={i} role="tab" className={`tab ${tab === i ? "tab-active" : ""}`} onClick={() => setTab(i)}>
          {label}
        </a>
      ))}
    </div>
  );
}

// ---------- Tab: Metadata ----------
function MetadataTab({ form, update }) {
  const m = form.meta;
  return (
    <div className="grid md:grid-cols-2 gap-4">
      <div className="card bg-base-100 shadow-sm">
        <div className="card-body">
          <h2 className="card-title">Basics</h2>
          <div className="grid grid-cols-1 gap-3">
            <LabeledInput label="Title" value={m.title} onChange={(v) => update(["meta", "title"], v)} placeholder="E.g., Distinct Routes" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <LabeledInput label="Problem Code" value={m.code} onChange={(v) => update(["meta", "code"], v)} placeholder="E.g., XOROJ1001" />
              <div className="form-control">
                <label className="label"><span className="label-text">Slug</span></label>
                <div className="join w-full">
                  <input className="input input-bordered join-item w-full" value={m.slug} placeholder="auto-from-title" onChange={(e) => update(["meta", "slug"], e.target.value)} />
                  <button className="btn join-item" onClick={() => update(["meta", "slug"], slugify(m.title))}>Auto</button>
                </div>
              </div>
            </div>
            <LabeledInput label="Source (optional)" value={m.source} onChange={(v) => update(["meta", "source"], v)} placeholder="IUT Intra 2025" />
            <LabeledInput label="Author" value={m.author} onChange={(v) => update(["meta", "author"], v)} placeholder="Your Name" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="form-control">
                <label className="label"><span className="label-text">Visibility</span></label>
                <select className="select select-bordered" value={m.visibility} onChange={(e) => update(["meta", "visibility"], e.target.value)}>
                  <option value="private">Private</option>
                  <option value="contest">Contest</option>
                  <option value="public">Public</option>
                </select>
              </div>
              <LabeledNumber label="Difficulty" value={m.difficulty} min={800} max={4000} step={100} onChange={(v) => update(["meta", "difficulty"], v)} />
              <LabeledInput label="License" value={m.license} onChange={(v) => update(["meta", "license"], v)} placeholder="Original / CC BY‑SA" />
            </div>
          </div>
        </div>
      </div>

      <div className="card bg-base-100 shadow-sm">
        <div className="card-body">
          <h2 className="card-title">Tags</h2>
          <TagEditor tags={m.tags} setTags={(t) => update(["meta", "tags"], t)} />
          <div className="text-sm opacity-70">Examples: graph, dp, flows, math, greedy, fenwick, segment-tree</div>
        </div>
      </div>
    </div>
  );
}

// ---------- Tab: Statement ----------
function StatementTab({ form, update }) {
  const s = form.statement;
  return (
    <div className="grid lg:grid-cols-2 gap-4">
      <div className="card bg-base-100 shadow-sm">
        <div className="card-body">
          <h2 className="card-title">Markdown</h2>
          <textarea className="textarea textarea-bordered h-[520px] font-mono"
            value={s.markdown}
            onChange={(e) => update(["statement", "markdown"], e.target.value)}
          />
          <div className="form-control">
            <label className="label"><span className="label-text">Editorial/Notes (optional)</span></label>
            <textarea className="textarea textarea-bordered h-24"
              value={s.notes}
              onChange={(e) => update(["statement", "notes"], e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="card bg-base-100 shadow-sm">
        <div className="card-body">
          <h2 className="card-title">Live Preview (plain)</h2>
          <div className="prose max-w-none whitespace-pre-wrap">
            {s.markdown}
          </div>
          <div className="text-xs opacity-70 mt-2">
            Tip: For rich preview, integrate <code>react-markdown</code> in your app and render <i>statement.markdown</i>.
          </div>
        </div>
      </div>

      <div className="lg:col-span-2">
        <SamplesEditor samples={s.samples} onChange={(v) => update(["statement", "samples"], v)} />
      </div>
    </div>
  );
}

// ---------- Tab: I/O & Constraints ----------
function IoConstraintsTab({ form, update }) {
  const io = form.io;
  return (
    <div className="grid lg:grid-cols-2 gap-4">
      <div className="card bg-base-100 shadow-sm">
        <div className="card-body">
          <h2 className="card-title">Input</h2>
          <textarea className="textarea textarea-bordered h-48"
            value={io.inputSpec}
            onChange={(e) => update(["io", "inputSpec"], e.target.value)}
          />
        </div>
      </div>
      <div className="card bg-base-100 shadow-sm">
        <div className="card-body">
          <h2 className="card-title">Output</h2>
          <textarea className="textarea textarea-bordered h-48"
            value={io.outputSpec}
            onChange={(e) => update(["io", "outputSpec"], e.target.value)}
          />
        </div>
      </div>
      <div className="lg:col-span-2 card bg-base-100 shadow-sm">
        <div className="card-body">
          <h2 className="card-title">Constraints</h2>
          <textarea className="textarea textarea-bordered h-28"
            value={io.constraints}
            onChange={(e) => update(["io", "constraints"], e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}

// ---------- Tab: Limits ----------
function LimitsTab({ form, update }) {
  const L = form.limits;
  return (
    <div className="grid lg:grid-cols-2 gap-4">
      <div className="card bg-base-100 shadow-sm">
        <div className="card-body gap-3">
          <h2 className="card-title">Default Limits</h2>
          <div className="grid grid-cols-2 gap-3">
            <LabeledNumber label="Time (ms)" value={L.timeDefaultMs} min={250} step={50}
              onChange={(v) => update(["limits", "timeDefaultMs"], v)} />
            <LabeledNumber label="Memory (MB)" value={L.memoryDefaultMB} min={32} step={32}
              onChange={(v) => update(["limits", "memoryDefaultMB"], v)} />
            <LabeledInput label="Input file" value={L.inputFile} onChange={(v) => update(["limits", "inputFile"], v)} />
            <LabeledInput label="Output file" value={L.outputFile} onChange={(v) => update(["limits", "outputFile"], v)} />
          </div>
          <div className="text-sm opacity-70">Set per‑language overrides below (0 = use default).</div>
        </div>
      </div>

      <div className="card bg-base-100 shadow-sm">
        <div className="card-body">
          <h2 className="card-title">Per‑language Overrides</h2>
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Language</th>
                  <th>Time (ms)</th>
                  <th>Memory (MB)</th>
                </tr>
              </thead>
              <tbody>
                {L.perLanguage.map((row, idx) => (
                  <tr key={row.name}>
                    <td className="whitespace-nowrap">{row.name}</td>
                    <td>
                      <input type="number" className="input input-bordered input-sm w-28"
                        value={row.timeMs}
                        onChange={(e) => {
                          const v = +e.target.value;
                          const arr = [...L.perLanguage];
                          arr[idx] = { ...row, timeMs: isNaN(v) ? 0 : v };
                          update(["limits", "perLanguage"], arr);
                        }}/>
                    </td>
                    <td>
                      <input type="number" className="input input-bordered input-sm w-28"
                        value={row.memoryMB}
                        onChange={(e) => {
                          const v = +e.target.value;
                          const arr = [...L.perLanguage];
                          arr[idx] = { ...row, memoryMB: isNaN(v) ? 0 : v };
                          update(["limits", "perLanguage"], arr);
                        }}/>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------- Tab: Samples ----------
function SamplesTab({ form, update }) {
  const samples = form.statement.samples;
  const setSamples = (arr) => update(["statement", "samples"], arr);
  return (
    <div className="card bg-base-100 shadow-sm">
      <div className="card-body">
        <h2 className="card-title">Sample I/O</h2>
        <div className="flex flex-col gap-4">
          {samples.map((s, i) => (
            <div key={i} className="grid md:grid-cols-2 gap-3 border rounded-box p-3">
              <div className="form-control">
                <label className="label"><span className="label-text">Sample Input #{i+1}</span></label>
                <textarea className="textarea textarea-bordered h-28 font-mono" value={s.input}
                  onChange={(e) => {
                    const arr = [...samples]; arr[i] = { ...s, input: e.target.value }; setSamples(arr);
                  }}/>
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text">Sample Output #{i+1}</span></label>
                <textarea className="textarea textarea-bordered h-28 font-mono" value={s.output}
                  onChange={(e) => {
                    const arr = [...samples]; arr[i] = { ...s, output: e.target.value }; setSamples(arr);
                  }}/>
              </div>
              <div className="md:col-span-2 form-control">
                <label className="label"><span className="label-text">Explanation (optional)</span></label>
                <textarea className="textarea textarea-bordered h-20" value={s.explanation}
                  onChange={(e) => {
                    const arr = [...samples]; arr[i] = { ...s, explanation: e.target.value }; setSamples(arr);
                  }}/>
              </div>
              <div className="md:col-span-2 flex justify-end gap-2">
                <button className="btn btn-outline btn-sm" onClick={() => {
                  const arr = [...samples]; arr.splice(i, 1); setSamples(arr);
                }}>Remove</button>
              </div>
            </div>
          ))}
          <div>
            <button className="btn btn-primary" onClick={() => setSamples([...samples, { input: "", output: "", explanation: "" }])}>
              + Add sample
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------- Tab: Tests ----------
function TestsTab({ form, update }) {
  const T = form.tests;
  const setPre = (arr) => update(["tests", "pretests"], arr);
  const setSys = (arr) => update(["tests", "system"], arr);
  const setGroups = (arr) => update(["tests", "groups"], arr);

  const addTest = (kind) => {
    const blank = { id: nextId(), input: "", output: "", points: 0, group: "" };
    if (kind === "pre") setPre([...(T.pretests || []), blank]);
    else setSys([...(T.system || []), blank]);
  };

  const moveRow = (arr, from, to) => {
    if (to < 0 || to >= arr.length) return arr;
    const copy = arr.slice();
    const [x] = copy.splice(from, 1);
    copy.splice(to, 0, x);
    return copy;
  };

  return (
    <div className="grid lg:grid-cols-2 gap-4">
      <div className="card bg-base-100 shadow-sm">
        <div className="card-body">
          <div className="flex items-center justify-between">
            <h2 className="card-title">Pretests</h2>
            <button className="btn btn-sm" onClick={() => addTest("pre")}>+ Add</button>
          </div>
          <TestTable rows={T.pretests || []}
            onChange={(rows) => setPre(rows)}
            onMove={(i, dir) => setPre(moveRow(T.pretests || [], i, i + dir))}
            kind="pre"
          />
        </div>
      </div>
      <div className="card bg-base-100 shadow-sm">
        <div className="card-body">
          <div className="flex items-center justify-between">
            <h2 className="card-title">System Tests</h2>
            <button className="btn btn-sm" onClick={() => addTest("sys")}>+ Add</button>
          </div>
          <TestTable rows={T.system || []}
            onChange={(rows) => setSys(rows)}
            onMove={(i, dir) => setSys(moveRow(T.system || [], i, i + dir))}
            kind="sys"
          />
        </div>
      </div>

      <div className="lg:col-span-2 card bg-base-100 shadow-sm">
        <div className="card-body">
          <div className="flex items-center justify-between">
            <h2 className="card-title">Groups (scoring)</h2>
            <button className="btn btn-sm" onClick={() => setGroups([...(T.groups || []), { name: `G${(T.groups?.length || 0)+1}`, points: 0, dependencies: [] }])}>+ Add group</button>
          </div>
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr><th>Name</th><th>Points</th><th>Depends on</th><th></th></tr>
              </thead>
              <tbody>
                {(T.groups || []).map((g, i) => (
                  <tr key={i}>
                    <td>
                      <input className="input input-bordered input-sm w-28" value={g.name}
                        onChange={(e) => {
                          const arr = [...(T.groups || [])]; arr[i] = { ...g, name: e.target.value }; setGroups(arr);
                        }}/>
                    </td>
                    <td>
                      <input type="number" className="input input-bordered input-sm w-24" value={g.points}
                        onChange={(e) => {
                          const arr = [...(T.groups || [])]; arr[i] = { ...g, points: +e.target.value || 0 }; setGroups(arr);
                        }}/>
                    </td>
                    <td>
                      <input className="input input-bordered input-sm w-64" placeholder="Comma separated group names"
                        value={(g.dependencies || []).join(", ")}
                        onChange={(e) => {
                          const arr = [...(T.groups || [])]; arr[i] = { ...g, dependencies: e.target.value.split(/\s*,\s*/).filter(Boolean) }; setGroups(arr);
                        }}/>
                    </td>
                    <td className="text-right">
                      <button className="btn btn-outline btn-sm" onClick={() => { const arr = [...(T.groups || [])]; arr.splice(i, 1); setGroups(arr); }}>Remove</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function TestTable({ rows, onChange, onMove, kind }) {
  return (
    <div className="overflow-x-auto">
      <table className="table">
        <thead>
          <tr>
            <th className="w-14">#</th>
            <th>Input</th>
            <th>Output</th>
            {kind === "pre" ? <th className="w-24">Points</th> : <th className="w-32">Group</th>}
            <th className="w-28"></th>
          </tr>
        </thead>
        <tbody>
          {rows.map((t, i) => (
            <tr key={t.id}>
              <td className="align-top pt-3">{i + 1}</td>
              <td>
                <textarea className="textarea textarea-bordered textarea-sm font-mono h-32"
                  value={t.input}
                  onChange={(e) => { const arr = [...rows]; arr[i] = { ...t, input: e.target.value }; onChange(arr); }} />
              </td>
              <td>
                <textarea className="textarea textarea-bordered textarea-sm font-mono h-32"
                  value={t.output}
                  onChange={(e) => { const arr = [...rows]; arr[i] = { ...t, output: e.target.value }; onChange(arr); }} />
              </td>
              {kind === "pre" ? (
                <td>
                  <input type="number" className="input input-bordered input-sm w-20"
                    value={t.points || 0}
                    onChange={(e) => { const arr = [...rows]; arr[i] = { ...t, points: +e.target.value || 0 }; onChange(arr); }} />
                </td>
              ) : (
                <td>
                  <input className="input input-bordered input-sm w-28"
                    value={t.group || ""}
                    onChange={(e) => { const arr = [...rows]; arr[i] = { ...t, group: e.target.value }; onChange(arr); }} />
                </td>
              )}
              <td className="align-top pt-2 text-right space-x-1 whitespace-nowrap">
                <button className="btn btn-xs" onClick={() => onMove(i, -1)}>↑</button>
                <button className="btn btn-xs" onClick={() => onMove(i, +1)}>↓</button>
                <button className="btn btn-outline btn-xs" onClick={() => { const arr = [...rows]; arr.splice(i, 1); onChange(arr); }}>Remove</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ---------- Tab: Checker & Validator ----------
function CheckerValidatorTab({ form, update }) {
  const C = form.checker;
  const V = form.validator;
  return (
    <div className="grid lg:grid-cols-2 gap-4">
      <div className="card bg-base-100 shadow-sm">
        <div className="card-body gap-3">
          <h2 className="card-title">Checker</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="form-control">
              <label className="label"><span className="label-text">Type</span></label>
              <select className="select select-bordered" value={C.type} onChange={(e) => update(["checker", "type"], e.target.value)}>
                <option value="diff">diff (exact)</option>
                <option value="token">token (ignore spaces)</option>
                <option value="float">float (eps)</option>
                <option value="custom">custom</option>
              </select>
            </div>
            {C.type === "float" && (
              <>
                <LabeledNumber label="Abs eps" value={C.floatAbs} step={1e-6}
                  onChange={(v) => update(["checker", "floatAbs"], v)} />
                <LabeledNumber label="Rel eps" value={C.floatRel} step={1e-6}
                  onChange={(v) => update(["checker", "floatRel"], v)} />
              </>
            )}
            {C.type === "custom" && (
              <div className="form-control">
                <label className="label"><span className="label-text">Language</span></label>
                <select className="select select-bordered" value={C.lang} onChange={(e) => update(["checker", "lang"], e.target.value)}>
                  {LANGS.map((x) => <option key={x}>{x}</option>)}
                </select>
              </div>
            )}
          </div>
          {C.type === "custom" && (
            <div className="form-control">
              <label className="label"><span className="label-text">Checker code</span></label>
              <textarea className="textarea textarea-bordered h-64 font-mono"
                value={C.code}
                onChange={(e) => update(["checker", "code"], e.target.value)}
                placeholder={"// Return code 0 for AC, non‑zero for WA\n// Args: input, expected, actual"}
              />
            </div>
          )}
        </div>
      </div>

      <div className="card bg-base-100 shadow-sm">
        <div className="card-body gap-3">
          <h2 className="card-title">Validator</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="form-control">
              <label className="label"><span className="label-text">Language</span></label>
              <select className="select select-bordered" value={V.lang} onChange={(e) => update(["validator", "lang"], e.target.value)}>
                {LANGS.map((x) => <option key={x}>{x}</option>)}
              </select>
            </div>
          </div>
          <div className="form-control">
            <label className="label"><span className="label-text">Validator code</span></label>
            <textarea className="textarea textarea-bordered h-64 font-mono"
              value={V.code}
              onChange={(e) => update(["validator", "code"], e.target.value)}
              placeholder={"// Read input; if invalid, exit non‑zero"}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------- Tab: Solutions ----------
function SolutionsTab({ form, update }) {
  const rows = form.solutions || [];
  const setRows = (r) => update(["solutions"], r);
  return (
    <div className="card bg-base-100 shadow-sm">
      <div className="card-body">
        <div className="flex items-center justify-between">
          <h2 className="card-title">Solutions</h2>
          <button className="btn" onClick={() => setRows([...rows, { lang: LANGS[0], code: "", role: "accepted" }])}>+ Add</button>
        </div>
        <div className="space-y-4">
          {rows.map((s, i) => (
            <div key={i} className="border rounded-box p-3 grid md:grid-cols-2 gap-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="form-control">
                  <label className="label"><span className="label-text">Language</span></label>
                  <select className="select select-bordered" value={s.lang} onChange={(e) => { const arr = [...rows]; arr[i] = { ...s, lang: e.target.value }; setRows(arr); }}>
                    {LANGS.map((x) => <option key={x}>{x}</option>)}
                  </select>
                </div>
                <div className="form-control">
                  <label className="label"><span className="label-text">Role</span></label>
                  <select className="select select-bordered" value={s.role} onChange={(e) => { const arr = [...rows]; arr[i] = { ...s, role: e.target.value }; setRows(arr); }}>
                    <option value="reference">reference</option>
                    <option value="accepted">accepted</option>
                    <option value="wrong">wrong</option>
                    <option value="tle">tle</option>
                    <option value="mle">mle</option>
                  </select>
                </div>
              </div>
              <div className="md:col-span-2 form-control">
                <label className="label"><span className="label-text">Code</span></label>
                <textarea className="textarea textarea-bordered h-64 font-mono" value={s.code}
                  onChange={(e) => { const arr = [...rows]; arr[i] = { ...s, code: e.target.value }; setRows(arr); }} />
              </div>
              <div className="md:col-span-2 text-right">
                <button className="btn btn-outline btn-sm" onClick={() => { const arr = [...rows]; arr.splice(i, 1); setRows(arr); }}>Remove</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ---------- Tab: Preview ----------
function PreviewTab({ form, issues, onExport }) {
  const bundle = useMemo(() => buildExportBundle(form), [form]);
  return (
    <div className="grid lg:grid-cols-2 gap-4">
      <div className="card bg-base-100 shadow-sm">
        <div className="card-body">
          <h2 className="card-title">Validation</h2>
          {issues.length === 0 ? (
            <div className="alert alert-success">Looks good! No blocking issues.</div>
          ) : (
            <ul className="list-disc pl-6 space-y-1">
              {issues.map((s, i) => <li key={i}>{s}</li>)}
            </ul>
          )}
          <div className="mt-3">
            <button className="btn btn-primary" onClick={onExport}>Download JSON package</button>
          </div>
        </div>
      </div>

      <div className="card bg-base-100 shadow-sm">
        <div className="card-body">
          <h2 className="card-title">Package Preview</h2>
          <pre className="bg-base-200 rounded-box p-3 max-h-[480px] overflow-auto text-xs">{JSON.stringify(bundle, null, 2)}</pre>
        </div>
      </div>
    </div>
  );
}

// ---------- Reusable bits ----------
function LabeledInput({ label, value, onChange, placeholder }) {
  return (
    <div className="form-control">
      <label className="label"><span className="label-text">{label}</span></label>
      <input className="input input-bordered" value={value}
        onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
    </div>
  );
}

function LabeledNumber({ label, value, onChange, min, max, step }) {
  return (
    <div className="form-control">
      <label className="label"><span className="label-text">{label}</span></label>
      <input type="number" className="input input-bordered" value={value}
        min={min} max={max} step={step}
        onChange={(e) => {
          const n = +e.target.value; onChange(isNaN(n) ? 0 : n);
        }}/>
    </div>
  );
}

function TagEditor({ tags, setTags }) {
  const [input, setInput] = useState("");
  const add = () => {
    const t = input.trim().toLowerCase();
    if (!t) return; if (tags.includes(t)) return; setTags([...tags, t]); setInput("");
  };
  return (
    <div className="flex flex-col gap-2">
      <div className="join w-full">
        <input className="input input-bordered join-item w-full" placeholder="Add a tag and press +" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && add()} />
        <button className="btn join-item" onClick={add}>+</button>
      </div>
      <div className="flex flex-wrap gap-2">
        {tags.map((t) => (
          <span key={t} className="badge badge-lg gap-2">
            {t}
            <button className="btn btn-ghost btn-xs" onClick={() => setTags(tags.filter((x) => x !== t))}>✕</button>
          </span>
        ))}
      </div>
    </div>
  );
}

function SamplesEditor({ samples, onChange }) {
  return (
    <div className="card bg-base-100 shadow-sm">
      <div className="card-body">
        <h3 className="card-title">Samples (for statement)</h3>
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr><th>#</th><th>Input</th><th>Output</th><th>Explanation</th><th></th></tr>
            </thead>
            <tbody>
              {samples.map((s, i) => (
                <tr key={i}>
                  <td>{i + 1}</td>
                  <td>
                    <textarea className="textarea textarea-bordered textarea-sm font-mono h-24 w-full" value={s.input}
                      onChange={(e) => { const arr = [...samples]; arr[i] = { ...s, input: e.target.value }; onChange(arr); }}/>
                  </td>
                  <td>
                    <textarea className="textarea textarea-bordered textarea-sm font-mono h-24 w-full" value={s.output}
                      onChange={(e) => { const arr = [...samples]; arr[i] = { ...s, output: e.target.value }; onChange(arr); }}/>
                  </td>
                  <td>
                    <textarea className="textarea textarea-bordered textarea-sm h-24 w-full" value={s.explanation}
                      onChange={(e) => { const arr = [...samples]; arr[i] = { ...s, explanation: e.target.value }; onChange(arr); }}/>
                  </td>
                  <td className="text-right">
                    <button className="btn btn-outline btn-xs" onClick={() => { const arr = [...samples]; arr.splice(i, 1); onChange(arr); }}>Remove</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button className="btn btn-primary" onClick={() => onChange([...samples, { input: "", output: "", explanation: "" }])}>+ Add sample</button>
      </div>
    </div>
  );
}

// ---------- Validation & Export ----------
function validateForm(form) {
  const issues = [];
  if (!form.meta.title) issues.push("Title is required (Meta → Title)");
  if (!form.meta.author) issues.push("Author is required (Meta → Author)");
  if (!form.statement.markdown?.trim()) issues.push("Statement markdown is empty");
  if ((form.tests.pretests || []).length === 0) issues.push("Add at least one pretest");
  if ((form.tests.system || []).length === 0) issues.push("Add at least one system test");
  return { ok: issues.length === 0, issues };
}

function buildExportBundle(form) {
  // Create a Polygon-like but XorOJ‑friendly bundle.
  const bundle = {
    __xoroj: {
      version: 1,
      exportedAt: new Date().toISOString(),
      form,
    },
    meta: form.meta,
    statement: {
      markdown: form.statement.markdown,
      notes: form.statement.notes,
      samples: form.statement.samples,
    },
    io: form.io,
    limits: form.limits,
    tests: form.tests,
    checker: form.checker,
    validator: form.validator,
    solutions: form.solutions,
    package: form.package,
  };
  return bundle;
}

// ---------- Deep helpers ----------
function setDeep(obj, path, value) {
  const copy = structuredClone(obj);
  let cur = copy;
  for (let i = 0; i < path.length - 1; i++) cur = cur[path[i]];
  cur[path[path.length - 1]] = value;
  return copy;
}
function nextId() { return Math.random().toString(36).slice(2, 8); }
