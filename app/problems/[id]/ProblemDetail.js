// app/problems/[id]/ProblemDetail.js
"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { notFound } from "next/navigation";
import CodeEditor from "@/components/CodeEditor";
import { Timer, BookOpen, Code, CheckCircle, XCircle, Settings, RefreshCcw } from "lucide-react";

// Enhanced validator with more detailed feedback
async function validateSolution(code, testCases) {
  const results = [];
  let passedCount = 0;
  
  for (const [index, testCase] of testCases.entries()) {
    const payload = {
      language: "javascript",
      version: "18.15.0",
      files: [{ name: "main.js", content: code }],
      stdin: testCase.input,
      args: [],
    };

    const res = await fetch("https://emkc.org/api/v2/piston/execute", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    
    const data = await res.json();
    const output = data.run.stdout.trim();
    const expected = testCase.expectedOutput.trim();
    const passed = output === expected;
    
    if (passed) passedCount++;
    
    results.push({
      testCase: index + 1,
      input: testCase.input,
      expected,
      output,
      passed,
      executionTime: data.run.time || 0,
      memoryUsage: data.run.memory || 0,
    });
  }

  return {
    correct: passedCount === testCases.length,
    passedCount,
    totalTests: testCases.length,
    results,
  };
}

export default function ProblemDetail({ params }) {
  const { id } = params;
  const { data: session } = useSession();
  const [problem, setProblem] = useState(null);
  const [code, setCode] = useState("// Write your solution here\n");
  const [results, setResults] = useState(null);
  const [timer, setTimer] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [theme, setTheme] = useState("vs-dark");
  const [fontSize, setFontSize] = useState(14);
  const [showHints, setShowHints] = useState(false);
  const [userNotes, setUserNotes] = useState("");

  useEffect(() => {
    let interval;
    if (isRunning) {
      interval = setInterval(() => setTimer(t => t + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  useEffect(() => {
    if (id) {
      fetchProblem();
    }
  }, [id]);

  const fetchProblem = async () => {
    try {
      const response = await fetch(`/api/problems/${id}`);
      if (!response.ok) {
        notFound();
        return;
      }
      const data = await response.json();
      setProblem(data);
      setIsRunning(true);
    } catch (error) {
      console.error("Failed to fetch problem:", error);
    }
  };

  const handleSubmission = async (testResults) => {
    if (!session) {
      setResults({
        type: "error",
        message: "Please login to submit solutions"
      });
      return;
    }

    try {
      const submission = {
        userId: session.user.id,
        problemId: id,
        code,
        language: "javascript",
        status: testResults.correct ? "ACCEPTED" : "FAILED",
        executionTime: testResults.results[0]?.executionTime || 0,
        memoryUsed: testResults.results[0]?.memoryUsage || 0,
      };

      const response = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submission),
      });

      if (!response.ok) throw new Error("Failed to save submission");

      setResults({
        type: "submit",
        ...testResults,
        message: testResults.correct ? 
          "Solution accepted! Your progress has been saved." : 
          "Solution incorrect. Keep trying!"
      });

      if (testResults.correct) {
        setIsRunning(false);
      }
    } catch (error) {
      console.error("Failed to save submission:", error);
      setResults({
        type: "error",
        message: "Error saving your submission"
      });
    }
  };

  if (!problem) return <div>Loading problem...</div>;

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">{problem.title}</h2>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-2">
            <Timer className="w-5 h-5" />
            {formatTime(timer)}
          </span>
          <button 
            onClick={() => setShowHints(!showHints)}
            className="flex items-center gap-2 px-3 py-1 rounded bg-yellow-100 hover:bg-yellow-200"
          >
            <BookOpen className="w-4 h-4" />
            Hints
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <div className="bg-gray-100 p-4 rounded mb-4">
            <h3 className="font-bold mb-2">Problem Statement</h3>
            <pre className="whitespace-pre-wrap text-sm">{problem.statement}</pre>
          </div>
          
          {showHints && (
            <div className="bg-yellow-50 p-4 rounded mb-4">
              <h3 className="font-bold mb-2">Hints</h3>
              <ul className="list-disc pl-4">
                <li>Consider edge cases in your solution</li>
                <li>Think about time and space complexity</li>
                <li>Try to break down the problem into smaller steps</li>
              </ul>
            </div>
          )}
          
          <div className="mb-4">
            <textarea
              className="w-full p-2 border rounded"
              placeholder="Add your notes here..."
              value={userNotes}
              onChange={(e) => setUserNotes(e.target.value)}
              rows="4"
            />
          </div>
        </div>

        <div>
          <div className="flex justify-end gap-2 mb-2">
            <button
              onClick={() => setTheme(theme === "vs-dark" ? "light" : "vs-dark")}
              className="p-2 rounded hover:bg-gray-200"
            >
              <Settings className="w-5 h-5" />
            </button>
            <button
              onClick={() => setCode("// Write your solution here\n")}
              className="p-2 rounded hover:bg-gray-200"
            >
              <RefreshCcw className="w-5 h-5" />
            </button>
          </div>

          <CodeEditor
            initialCode={code}
            language="javascript"
            onChange={setCode}
            theme={theme}
            options={{ fontSize }}
          />

          <div className="flex gap-4 mt-4">
            <button
              onClick={async () => {
                const payload = {
                  language: "javascript",
                  version: "18.15.0",
                  files: [{ name: "main.js", content: code }],
                  stdin: "",
                  args: [],
                };

                const res = await fetch("https://emkc.org/api/v2/piston/execute", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(payload),
                });
                const data = await res.json();
                setResults({
                  type: "run",
                  output: data.run.stdout,
                });
              }}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
            >
              Run Code
            </button>

            <button
              onClick={async () => {
                if (!problem.testCases?.length) {
                  setResults({
                    type: "error",
                    message: "No test cases available for validation."
                  });
                  return;
                }
                const validation = await validateSolution(code, problem.testCases);
                await handleSubmission(validation);
              }}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
            >
              Submit Solution
            </button>
          </div>

          {results && (
            <div className="mt-4 p-4 bg-gray-100 rounded">
              {results.type === "run" && (
                <pre className="whitespace-pre-wrap">{results.output}</pre>
              )}
              {results.type === "error" && (
                <div className="text-red-500">{results.message}</div>
              )}
              {results.type === "submit" && (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    {results.correct ? (
                      <CheckCircle className="w-6 h-6 text-green-500" />
                    ) : (
                      <XCircle className="w-6 h-6 text-red-500" />
                    )}
                    <span>
                      {results.message}
                    </span>
                  </div>
                  <div className="space-y-4">
                    {results.results.map((result, idx) => (
                      <div
                        key={idx}
                        className={`p-3 rounded ${
                          result.passed ? "bg-green-100" : "bg-red-100"
                        }`}
                      >
                        <div className="font-bold mb-1">Test Case {result.testCase}</div>
                        <div className="text-sm">
                          <div>Input: {result.input}</div>
                          <div>Expected: {result.expected}</div>
                          <div>Output: {result.output}</div>
                          <div>Time: {result.executionTime}ms</div>
                          <div>Memory: {result.memoryUsage}KB</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}