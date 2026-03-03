import { useEffect, useRef, useCallback, useState } from "react";
import Editor from "@monaco-editor/react";

export default function CodeEditor({
  language = "cpp",      // "cpp" | "java" | "python"
  value,
  onChange,
  height = "100%",
}) {
  const monacoRef = useRef(null);
  const editorRef = useRef(null);
  const [theme, setTheme] = useState("vs");

  // Follow <html data-theme="dark">
  useEffect(() => {
    const root = document.documentElement;
    const update = () =>
      setTheme(root.getAttribute("data-theme") === "dark" ? "vs-dark" : "vs");
    update();
    const mo = new MutationObserver(update);
    mo.observe(root, { attributes: true, attributeFilter: ["data-theme"] });
    return () => mo.disconnect();
  }, []);

  const lint = useCallback(() => {
    const monaco = monacoRef.current;
    const editor = editorRef.current;
    if (!monaco || !editor) return;

    const model = editor.getModel();
    const text = model.getValue();
    const markers = [];

    // quick brace balance
    const opens = (text.match(/[({[]/g) || []).length;
    const closes = (text.match(/[)}\]]/g) || []).length;
    if (opens !== closes) {
      markers.push({
        severity: monaco.MarkerSeverity.Error,
        message: "Unbalanced brackets/braces detected.",
        startLineNumber: 1, startColumn: 1, endLineNumber: 1, endColumn: 1,
      });
    }

    const langId = model.getLanguageId();
    if (langId === "cpp" && !/int\s+main\s*\(/.test(text)) {
      markers.push({
        severity: monaco.MarkerSeverity.Hint,
        message: "Tip: C++ usually needs an `int main(...)`.",
        startLineNumber: 1, startColumn: 1, endLineNumber: 1, endColumn: 1,
      });
    }
    if (langId === "java" && !/class\s+\w+/.test(text)) {
      markers.push({
        severity: monaco.MarkerSeverity.Hint,
        message: "Tip: Java requires a class (e.g., `public class Main {}` ).",
        startLineNumber: 1, startColumn: 1, endLineNumber: 1, endColumn: 1,
      });
    }

    monaco.editor.setModelMarkers(model, "ide-lint", markers);
  }, []);

  const handleMount = (editor, monaco) => {
    monacoRef.current = monaco;
    editorRef.current = editor;

    // simple helpful snippets
    const disposers = [];
    disposers.push(
      monaco.languages.registerCompletionItemProvider("cpp", {
        provideCompletionItems: () => ({
          suggestions: [
            {
              label: "main",
              kind: monaco.languages.CompletionItemKind.Snippet,
              insertText: [
                "int main(){",
                "\tstd::ios::sync_with_stdio(false);",
                "\tstd::cin.tie(nullptr);",
                "\t$0",
                "\treturn 0;",
                "}"
              ].join("\n"),
              documentation: "C++ main()",
            },
          ],
        }),
      })
    );
    disposers.push(
      monaco.languages.registerCompletionItemProvider("java", {
        provideCompletionItems: () => ({
          suggestions: [
            {
              label: "psvm",
              kind: monaco.languages.CompletionItemKind.Snippet,
              insertText:
                "public static void main(String[] args) throws Exception {\n\t$0\n}",
              documentation: "public static void main",
            },
          ],
        }),
      })
    );
    disposers.push(
      monaco.languages.registerCompletionItemProvider("python", {
        provideCompletionItems: () => ({
          suggestions: [
            {
              label: "main-guard",
              kind: monaco.languages.CompletionItemKind.Snippet,
              insertText: [
                "def main():",
                "\t$0",
                "",
                "if __name__ == \"__main__\":",
                "\tmain()",
              ].join("\n"),
              documentation: "__main__ guard",
            },
          ],
        }),
      })
    );

    lint();
    editor.onDidChangeModelContent(() => {
      clearTimeout(editor.__lintTimer);
      editor.__lintTimer = setTimeout(lint, 150);
    });

    editor.onDidDispose(() => disposers.forEach((d) => d.dispose?.()));
  };

  return (
    <div className="w-full h-full flex-1 min-h-0 border rounded overflow-auto">
      <Editor
        height="100%"
        width="100%"
        language={language}
        theme={theme}
        value={value}
        onChange={(v) => onChange?.(v ?? "")}
        onMount={handleMount}
        options={{
          fontSize: 15,
          fontLigatures: true,
          minimap: { enabled: false },
          automaticLayout: true,
          wordWrap: "on",
          tabSize: 2,
          insertSpaces: true,
          quickSuggestions: { other: true, comments: true, strings: true },
          suggestOnTriggerCharacters: true,
          acceptSuggestionOnEnter: "on",
          parameterHints: { enabled: true },
          renderWhitespace: "boundary",
          scrollBeyondLastLine: false,
          smoothScrolling: true,
          formatOnType: true,
          matchBrackets: "always",
        }}
      />
    </div>
  );
}
