"use client";

import React, { useState, useEffect } from "react";
import { notFound } from "next/navigation";
import CodeEditor from "@/components/CodeEditor";
import { Timer, BookOpen, RefreshCcw, CheckCircle, XCircle, ChevronRight, Terminal } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import LoadingSpinner from "@/components/LoadingSpinner";

// Supported languages with Piston API versions
const LANGUAGES = [
  { name: "JavaScript", value: "javascript", version: "18.15.0", extension: "js" },
  { name: "Python", value: "python", version: "3.10.0", extension: "py" },
  { name: "Java", value: "java", version: "15.0.2", extension: "java" },
];

async function validateSolution(code, testCases, language) {
  if (!testCases || !Array.isArray(testCases) || testCases.length === 0) {
    throw new Error("No test cases available for validation");
  }

  const selectedLang = LANGUAGES.find((lang) => lang.value === language);
  if (!selectedLang) throw new Error("Unsupported language");

  const results = [];
  let passedCount = 0;

  for (const [index, testCase] of testCases.entries()) {
    try {
      const payload = {
        language: selectedLang.value,
        version: selectedLang.version,
        files: [{ name: `main.${selectedLang.extension}`, content: code }],
        stdin: testCase.input,
        args: [],
      };

      const res = await fetch("https://emkc.org/api/v2/piston/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error(`API error: ${res.status}`);
      }

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
    } catch (error) {
      console.error(`Test case ${index + 1} execution error:`, error);
      results.push({
        testCase: index + 1,
        input: testCase.input,
        expected: testCase.expectedOutput.trim(),
        output: `Error: ${error.message}`,
        passed: false,
        executionTime: 0,
        memoryUsage: 0,
      });
    }
  }

  return {
    correct: passedCount === testCases.length,
    passedCount,
    totalTests: testCases.length,
    results,
  };
}

export default function ProblemDetail({ params }) {
  const { id } = React.use(params);
  const { user } = useAuth();

  const [problem, setProblem] = useState(null);
  const [code, setCode] = useState("// Write your solution here\n");
  const [results, setResults] = useState(null);
  const [timer, setTimer] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [fontSize, setFontSize] = useState(14);
  const [showHints, setShowHints] = useState(false);
  const [userNotes, setUserNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("javascript"); // Default language

  useEffect(() => {
    let interval;
    if (isRunning) {
      interval = setInterval(() => setTimer((t) => t + 1), 1000);
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

  const handleRunCode = async () => {
    try {
      const selectedLang = LANGUAGES.find((lang) => lang.value === selectedLanguage);
      const payload = {
        language: selectedLang.value,
        version: selectedLang.version,
        files: [{ name: `main.${selectedLang.extension}`, content: code }],
        stdin: "",
        args: [],
      };

      const res = await fetch("https://emkc.org/api/v2/piston/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error(`API error: ${res.status}`);
      }

      const data = await res.json();
      setResults({ type: "run", output: data.run.stdout });
    } catch (error) {
      console.error("Run code error:", error);
      setResults({ type: "error", message: `Error running code: ${error.message}` });
    }
  };

  const handleSubmitSolution = async () => {
    try {
      if (!problem.testCases?.length) {
        setResults({ type: "error", message: "No test cases available for validation." });
        return;
      }

      setIsSubmitting(true);
      setResults({ type: "loading", message: "Testing your solution..." });

      const validation = await validateSolution(code, problem.testCases, selectedLanguage);
      await handleSubmission(validation);
    } catch (error) {
      console.error("Validation error:", error);
      setResults({ type: "error", message: `Error: ${error.message}` });
      setIsSubmitting(false);
    }
  };

  const handleSubmission = async (testResults) => {
    try {
      setIsSubmitting(true);

      const userId = user ? (user._id || user.userId) : "anonymous";
      console.log("User ID from auth:", userId);

      const selectedLang = LANGUAGES.find((lang) => lang.value === selectedLanguage);
      const submission = {
        userId: userId,
        problemId: id,
        code,
        language: selectedLang.value, // Store selected language
        status: testResults.correct ? "ACCEPTED" : "FAILED",
        executionTime: testResults.results[0]?.executionTime || 0,
        memoryUsed: testResults.results[0]?.memoryUsage || 0,
      };

      console.log("Submission payload:", submission);

      const response = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submission),
      });

      const responseData = await response.json();
      console.log("Submission response:", responseData);

      if (!response.ok) {
        throw new Error(responseData.message || `Server error: ${response.status}`);
      }

      setResults({
        type: "submit",
        ...testResults,
        message: testResults.correct
          ? "Solution accepted! Your progress has been saved."
          : "Solution incorrect. Keep trying!",
      });

      if (testResults.correct) {
        setIsRunning(false);
      }
    } catch (error) {
      console.error("Failed to save submission:", error);
      setResults({ 
        type: "error", 
        message: `Error saving your submission: ${error.message}` 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!problem) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <LoadingSpinner className="w-12 h-12 text-blue-500" />
      </div>
    );
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <nav className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-2">
              <a href="/problems" className="hover:text-blue-600 dark:hover:text-blue-400">Problems</a>
              <ChevronRight className="w-4 h-4 mx-2" />
              <span className="text-blue-600 dark:text-blue-400">{problem.title}</span>
            </nav>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">{problem.title}</h1>
          </div>
          <div className="flex items-center gap-4 bg-white dark:bg-gray-800 px-4 py-2 rounded-lg shadow-sm">
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
              <Timer className="w-5 h-5" />
              <span className="font-mono">{formatTime(timer)}</span>
            </div>
            <button
              onClick={() => setShowHints(!showHints)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-yellow-100 hover:bg-yellow-200 dark:bg-yellow-900/30 dark:hover:bg-yellow-800/40 transition-colors"
            >
              <BookOpen className="w-5 h-5" />
              <span className="text-sm font-medium">Hints</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Problem Section */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Problem Statement</h3>
              <pre className="whitespace-pre-wrap text-gray-600 dark:text-gray-400 leading-relaxed">{problem.statement}</pre>
            </div>

            {showHints && (
              <div className="bg-yellow-50/50 dark:bg-yellow-900/20 rounded-xl p-6 shadow-sm border border-yellow-100 dark:border-yellow-900/30">
                <h3 className="text-lg font-semibold mb-3 text-yellow-800 dark:text-yellow-200">
                  <BookOpen className="w-5 h-5 inline-block mr-2" />
                  Hints & Guidance
                </h3>
                <ul className="space-y-3 text-yellow-700 dark:text-yellow-300">
                  <li className="flex items-start">
                    <span className="text-yellow-500 mr-2">•</span>
                    Consider different edge cases and boundary conditions
                  </li>
                  <li className="flex items-start">
                    <span className="text-yellow-500 mr-2">•</span>
                    Analyze time and space complexity before implementing
                  </li>
                  <li className="flex items-start">
                    <span className="text-yellow-500 mr-2">•</span>
                    Break the problem into smaller, manageable functions
                  </li>
                </ul>
              </div>
            )}

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">Your Notes</h3>
              <textarea
                className="w-full h-32 px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Jot down your thoughts, observations, or approach..."
                value={userNotes}
                onChange={(e) => setUserNotes(e.target.value)}
              />
            </div>
          </div>

          {/* Coding Section */}
          <div className="space-y-6">
            <div className="rounded-xl overflow-hidden shadow-lg">
              <div className="flex items-center justify-between bg-gray-800 dark:bg-gray-700 px-4 py-3">
                <div className="flex items-center gap-2">
                  <Terminal className="w-5 h-5 text-green-400" />
                  <select
                    value={selectedLanguage}
                    onChange={(e) => setSelectedLanguage(e.target.value)}
                    className="bg-transparent text-gray-300 font-mono text-sm focus:outline-none"
                  >
                    {LANGUAGES.map((lang) => (
                      <option key={lang.value} value={lang.value} className="text-black dark:text-white">
                        {lang.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setCode("// Write your solution here\n")}
                    className="p-2 hover:bg-gray-700 dark:hover:bg-gray-600 rounded-lg transition-colors text-gray-300 hover:text-white"
                  >
                    <RefreshCcw className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <CodeEditor
                initialCode={code}
                language={selectedLanguage}
                onChange={setCode}
                fontSize={fontSize}
              />
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleRunCode}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-all"
                disabled={isSubmitting}
              >
                <span>Run Code</span>
              </button>
              <button
                onClick={handleSubmitSolution}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <LoadingSpinner className="w-5 h-5" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    <span>Submit Solution</span>
                  </>
                )}
              </button>
            </div>

            {results && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                {results.type === "loading" && (
                  <div className="flex items-center justify-center gap-3 py-4">
                    <LoadingSpinner className="w-6 h-6 text-blue-500" />
                    <span className="text-gray-600 dark:text-gray-400">{results.message}</span>
                  </div>
                )}

                {results.type === "run" && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-4">
                      <Terminal className="w-5 h-5 text-gray-500" />
                      <h4 className="font-semibold text-gray-800 dark:text-gray-200">Execution Output</h4>
                    </div>
                    <pre className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg text-sm font-mono text-gray-800 dark:text-gray-300 whitespace-pre-wrap">
                      {results.output || "No output"}
                    </pre>
                  </div>
                )}

                {results.type === "submit" && (
                  <div className="space-y-6">
                    <div className={`flex items-center gap-3 p-4 rounded-lg ${results.correct ? 
                      "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800" : 
                      "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"}`}>
                      {results.correct ? (
                        <CheckCircle className="w-8 h-8 text-green-500" />
                      ) : (
                        <XCircle className="w-8 h-8 text-red-500" />
                      )}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                          {results.correct ? "Solution Accepted!" : "Submission Failed"}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400">{results.message}</p>
                        <p className="mt-2 text-sm font-mono">
                          Passed {results.passedCount}/{results.totalTests} test cases
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Test Cases</h4>
                      <div className="space-y-3">
                        {results.results.map((result, idx) => (
                          <div
                            key={idx}
                            className={`p-4 rounded-lg border ${
                              result.passed
                                ? "border-green-100 dark:border-green-900/30 bg-green-50/50 dark:bg-green-900/10"
                                : "border-red-100 dark:border-red-900/30 bg-red-50/50 dark:bg-red-900/10"
                            }`}
                          >
                            <div className="flex items-center gap-2 mb-2">
                              {result.passed ? (
                                <CheckCircle className="w-4 h-4 text-green-500" />
                              ) : (
                                <XCircle className="w-4 h-4 text-red-500" />
                              )}
                              <span className="font-medium">Case {idx + 1}</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div className="text-gray-600 dark:text-gray-400">Input:</div>
                              <div className="font-mono">{result.input || "None"}</div>
                              <div className="text-gray-600 dark:text-gray-400">Expected:</div>
                              <div className="font-mono">{result.expected}</div>
                              <div className="text-gray-600 dark:text-gray-400">Output:</div>
                              <div className="font-mono">{result.output}</div>
                            </div>
                            <div className="flex gap-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                              <span>Time: {result.executionTime}ms</span>
                              <span>Memory: {result.memoryUsage}KB</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {results.type === "error" && (
                  <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                    <XCircle className="w-6 h-6 text-red-500" />
                    <div className="text-red-600 dark:text-red-400">{results.message}</div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}