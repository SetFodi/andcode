// components/CodeEditor.js
"use client";
import dynamic from "next/dynamic";
import { useState } from "react";

// Dynamically import MonacoEditor to avoid SSR issues.
const MonacoEditor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

export default function CodeEditor({ initialCode = "", language = "javascript", onChange }) {
  const [code, setCode] = useState(initialCode);

  const handleEditorChange = (value, event) => {
    setCode(value);
    if (onChange) onChange(value);
  };

  return (
    <div className="border rounded overflow-hidden">
      <MonacoEditor
        height="400px"
        defaultLanguage={language}
        value={code}
        onChange={handleEditorChange}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
        }}
      />
    </div>
  );
}
