"use client";
import dynamic from "next/dynamic";
import { useTheme } from "@/contexts/ThemeContext";
import { Settings } from "lucide-react";

// Dynamically import MonacoEditor to avoid SSR issues
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
        defaultLanguage={language}
        value={initialCode}
        onChange={handleEditorChange}
        theme={editorTheme}
        options={{
          minimap: { enabled: false },
          fontSize: fontSize,
          scrollBeyondLastLine: false,
          padding: { top: 10, bottom: 10 },
          wordWrap: "on",
          fontFamily: "'Fira Code', monospace",
        }}
      />
    </div>
  );
}