"use client";
import dynamic from "next/dynamic";
import { useTheme } from "@/contexts/ThemeContext";
import { RefreshCcw } from "lucide-react";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

export default function CodeEditor({ 
  initialCode = "", 
  language = "javascript", 
  onChange, 
  fontSize = 14 
}) {
  const { theme } = useTheme();
  const editorTheme = theme === "dark" ? "vs-dark" : "light";

  const handleEditorChange = (value) => {
    if (onChange) onChange(value);
  };

  const handleEditorDidMount = (editor, monaco) => {
    // Enable basic autocompletion and linting
    monaco.languages.registerCompletionItemProvider(language, {
      provideCompletionItems: (model, position) => {
        const suggestions = {
          javascript: [
            { label: "console.log", kind: monaco.languages.CompletionItemKind.Function, insertText: "console.log($1)", insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet },
            { label: "function", kind: monaco.languages.CompletionItemKind.Keyword, insertText: "function $1($2) {\n  $3\n}", insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet },
          ],
          python: [
            { label: "print", kind: monaco.languages.CompletionItemKind.Function, insertText: "print($1)", insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet },
            { label: "def", kind: monaco.languages.CompletionItemKind.Keyword, insertText: "def $1($2):\n    $3", insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet },
          ],
          java: [
            { label: "System.out.println", kind: monaco.languages.CompletionItemKind.Function, insertText: "System.out.println($1);", insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet },
            { label: "public static void main", kind: monaco.languages.CompletionItemKind.Snippet, insertText: "public static void main(String[] args) {\n    $1\n}", insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet },
          ],
        }[language] || [];

        return { suggestions };
      },
    });
  };

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden shadow-lg bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
      <div className="flex justify-between items-center px-4 py-2 bg-gray-100 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {language.charAt(0).toUpperCase() + language.slice(1)}
        </span>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {editorTheme === "vs-dark" ? "Dark" : "Light"} Theme
        </span>
      </div>
      <MonacoEditor
        height="400px"
        language={language}
        value={initialCode}
        onChange={handleEditorChange}
        theme={editorTheme}
        onMount={handleEditorDidMount}
        options={{
          minimap: { enabled: false },
          fontSize: fontSize,
          scrollBeyondLastLine: false,
          padding: { top: 10, bottom: 10 },
          wordWrap: "on",
          fontFamily: "'Fira Code', monospace",
          tabSize: 2,
          automaticLayout: true,
        }}
      />
    </div>
  );
}