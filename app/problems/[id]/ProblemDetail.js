"use client";

import React, { useState, useEffect } from "react";
import { notFound } from "next/navigation";
import CodeEditor from "@/components/CodeEditor";
import { Timer, BookOpen, RefreshCcw, CheckCircle, XCircle, ChevronRight, Terminal } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import LoadingSpinner from "@/components/LoadingSpinner";

const LANGUAGES = [
  { name: "JavaScript", value: "javascript", version: "18.15.0", extension: "js", initialCode: "// Write your solution here\n" },
  { name: "Python", value: "python", version: "3.10.0", extension: "py", initialCode: "# Write your solution here\n" },
  { name: "Java", value: "java", version: "15.0.2", extension: "java", initialCode: "public class Main {\n    public static void main(String[] args) {\n        // Write your solution here\n    }\n}" },
];

// Enhanced validateSolution function to prevent hardcoding
async function validateSolution(code, testCases, language, problemTitle) {
  if (!testCases || !Array.isArray(testCases) || testCases.length === 0) {
    throw new Error("No test cases available for validation");
  }

  const selectedLang = LANGUAGES.find((lang) => lang.value === language);
  if (!selectedLang) throw new Error("Unsupported language");

  // Add additional test cases to prevent hardcoding
  const extendedTestCases = createExtendedTestCases(testCases, problemTitle);
  
  const results = [];
  let passedCount = 0;
  let dynamicTestsPassed = 0;
  let isDynamicTestsAvailable = extendedTestCases.some(tc => tc.isDynamic);

  // Check for some common hardcoding patterns directly in the submitted code
  const simpleHardcodingCheck = checkForSimpleHardcoding(code, extendedTestCases, language);
  if (simpleHardcodingCheck.isHardcoded) {
    return {
      correct: false,
      passedCount: 0,
      totalTests: extendedTestCases.length,
      results: [
        {
          testCase: 1,
          input: "N/A",
          expected: "N/A",
          output: simpleHardcodingCheck.message,
          passed: false,
          executionTime: 0,
          memoryUsage: 0,
          isDynamic: false
        }
      ],
      allDynamicTestsPassed: false
    };
  }

  for (const [index, testCase] of extendedTestCases.entries()) {
    try {
      // Wrap the user code in a solution checker that prevents hardcoding
      let wrappedCode = code;
      
      if (language === "javascript") {
        // JavaScript wrapper
        wrappedCode = wrapJavaScriptCode(code, testCase);
      } else if (language === "python") {
        // Python wrapper
        wrappedCode = wrapPythonCode(code, testCase);
      } else if (language === "java") {
        // Java wrapper
        wrappedCode = wrapJavaCode(code, testCase);
      }

      const payload = {
        language: selectedLang.value,
        version: selectedLang.version,
        files: [{ name: `main.${selectedLang.extension}`, content: wrappedCode }],
        stdin: testCase.input,
        args: [],
      };

      const res = await fetch("https://emkc.org/api/v2/piston/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`API error: ${res.status} - ${errorText}`);
      }

      const data = await res.json();
      console.log(`Test case ${index + 1} response:`, data);
      
      const output = data.run.stdout.trim();
      const stderr = data.run.stderr.trim();
      const expected = testCase.expectedOutput.trim();
      
      // Check if the output contains the expected result (might be surrounded by other content)
      const outputLines = output.split('\n');
      const passed = outputLines.some(line => line.trim() === expected);

      if (passed) {
        passedCount++;
        if (testCase.isDynamic) {
          dynamicTestsPassed++;
        }
      }

      results.push({
        testCase: index + 1,
        input: testCase.input,
        expected,
        output: stderr ? `Error: ${stderr}` : output,
        passed,
        executionTime: data.run.time || 0,
        memoryUsage: data.run.memory || 0,
        isDynamic: testCase.isDynamic || false
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
        memoryUsed: 0,
        isDynamic: testCase.isDynamic || false
      });
    }
  }

  // Check if all dynamic tests passed
  const allDynamicTestsPassed = isDynamicTestsAvailable ? 
    dynamicTestsPassed === extendedTestCases.filter(tc => tc.isDynamic).length : 
    true;

  return {
    correct: passedCount === extendedTestCases.length && allDynamicTestsPassed,
    passedCount,
    totalTests: extendedTestCases.length,
    results,
    allDynamicTestsPassed
  };
}

// Additional check for simple hardcoding patterns
function checkForSimpleHardcoding(code, testCases, language) {
  let isHardcoded = false;
  let message = "";
  
  // All expected outputs combined in a single string (to catch multiple hardcodings in one submission)
  const allExpectedOutputs = testCases.map(tc => tc.expectedOutput).join('|');
  
  if (language === "javascript") {
    // Check for a series of if/else statements that just return the expected outputs
    const ifElseHardcodingPattern = new RegExp(`if\\s*\\(.*?(${allExpectedOutputs}).*?\\)`, 'i');
    const switchCaseHardcodingPattern = new RegExp(`switch\\s*\\(.*?\\)\\s*{[^}]*?(${allExpectedOutputs})[^}]*?}`, 'i');
    
    if (ifElseHardcodingPattern.test(code) || switchCaseHardcodingPattern.test(code)) {
      isHardcoded = true;
      message = "Potential hardcoding detected. Your solution should work for any input, not just the test cases.";
    }
  } else if (language === "python") {
    // Similar checks for Python
    const ifElseHardcodingPattern = new RegExp(`if\\s+.*?(${allExpectedOutputs}).*?:`, 'i');
    
    if (ifElseHardcodingPattern.test(code)) {
      isHardcoded = true;
      message = "Potential hardcoding detected. Your solution should work for any input, not just the test cases.";
    }
  }
  
  return { isHardcoded, message };
}

// Function to create extended test cases to prevent hardcoding
function createExtendedTestCases(originalTestCases, problemTitle) {
  const extendedTestCases = [...originalTestCases];
  
  // Add dynamic test cases based on problem type
  if (problemTitle.includes("Reverse a String")) {
    // Add dynamic string reversal tests
    extendedTestCases.push({
      input: "javascript",
      expectedOutput: "tpircsavaj",
      isDynamic: true
    });
    extendedTestCases.push({
      input: "algorithm",
      expectedOutput: "mhtirogla",
      isDynamic: true
    });
  } 
  else if (problemTitle.includes("Sum of Two")) {
    // Add dynamic sum tests
    extendedTestCases.push({
      input: "8\n12",
      expectedOutput: "20",
      isDynamic: true
    });
    extendedTestCases.push({
      input: "15\n27",
      expectedOutput: "42",
      isDynamic: true
    });
  }
  else if (problemTitle.includes("Palindrome")) {
    // Add dynamic palindrome tests
    extendedTestCases.push({
      input: "level",
      expectedOutput: "true",
      isDynamic: true
    });
    extendedTestCases.push({
      input: "claude",
      expectedOutput: "false",
      isDynamic: true
    });
  }
  else if (problemTitle.includes("Maximum") || problemTitle.includes("Find Maximum")) {
    // Add dynamic max tests
    extendedTestCases.push({
      input: "[10,45,32,76,12]",
      expectedOutput: "76",
      isDynamic: true
    });
  }
  else if (problemTitle.includes("Minimum") || problemTitle.includes("Find Minimum")) {
    // Add dynamic min tests
    extendedTestCases.push({
      input: "[21,17,45,9,88]",
      expectedOutput: "9",
      isDynamic: true
    });
  }
  else if (problemTitle.includes("Vowels")) {
    // Add dynamic vowel counting tests
    extendedTestCases.push({
      input: "beautiful",
      expectedOutput: "5",
      isDynamic: true
    });
  }
  // Add more dynamic tests for other problem types as needed
  
  return extendedTestCases;
}

// Improved JavaScript wrapper that extracts and calls the user's function
function wrapJavaScriptCode(code, testCase) {
  // Look for console.log statements that directly output the expected result
  const hardcodingPattern = new RegExp(`console\\.log\\(['"\`]${testCase.expectedOutput}['"\`]\\)`, 'i');
  
  // Detect direct hardcoding attempts
  if (hardcodingPattern.test(code)) {
    return `
      console.log("Error: Direct hardcoding of test case answers is not allowed.");
      process.exit(1);
    `;
  }
  
  return `
    // Original user code
    ${code}
    
    // Test case runner
    const input = \`${testCase.input}\`.trim();
    
    // Inspect if the code has required solution patterns
    const codeStr = \`${code.replace(/`/g, '\\`')}\`;
    
    // Check for function declarations
    const hasFunctionDeclaration = /function\\s+([a-zA-Z0-9_]+)\\s*\\(/.test(codeStr);
    const hasArrowFunction = /const\\s+([a-zA-Z0-9_]+)\\s*=\\s*\\([^)]*\\)\\s*=>/.test(codeStr);
    const hasMethodDefinition = /([a-zA-Z0-9_]+)\\s*\\([^)]*\\)\\s*{/.test(codeStr);
    
    if (!(hasFunctionDeclaration || hasArrowFunction || hasMethodDefinition)) {
      console.log("Error: Your solution must define a function");
      process.exit(1);
    }
    
    // Extract the function name
    let functionName = "";
    let functionNameMatch;
    
    if (functionNameMatch = /function\\s+([a-zA-Z0-9_]+)\\s*\\(/.exec(codeStr)) {
      functionName = functionNameMatch[1];
    } else if (functionNameMatch = /const\\s+([a-zA-Z0-9_]+)\\s*=\\s*\\([^)]*\\)\\s*=>/.exec(codeStr)) {
      functionName = functionNameMatch[1];
    } else if (functionNameMatch = /let\\s+([a-zA-Z0-9_]+)\\s*=\\s*\\([^)]*\\)\\s*=>/.exec(codeStr)) {
      functionName = functionNameMatch[1];
    } else if (functionNameMatch = /var\\s+([a-zA-Z0-9_]+)\\s*=\\s*\\([^)]*\\)\\s*=>/.exec(codeStr)) {
      functionName = functionNameMatch[1];
    } else if (functionNameMatch = /([a-zA-Z0-9_]+)\\s*\\([^)]*\\)\\s*{/.exec(codeStr)) {
      functionName = functionNameMatch[1];
    }
    
    // Only execute for function found
    if (functionName && typeof eval(functionName) === 'function') {
      try {
        // Execute just the current test case
        if (input.includes("[") && input.includes("]")) {
          // Handle array input
          const arr = JSON.parse(input);
          console.log(eval(\`\${functionName}(arr)\`));
        } else if (input.includes("\\n")) {
          // Handle multiple inputs separated by newlines
          const inputs = input.split("\\n");
          if (inputs.length === 2) {
            console.log(eval(\`\${functionName}(\${inputs[0]}, \${inputs[1]})\`));
          } else {
            // For more parameters, we'll have to handle case by case
            console.log(eval(\`\${functionName}(\${inputs.join(", ")})\`));
          }
        } else {
          // Handle single string input
          console.log(eval(\`\${functionName}("\${input}")\`));
        }
      } catch (e) {
        console.log("Error: " + e.message);
      }
    } else {
      // If we couldn't determine the function name or it's not valid,
      // don't add our automatic execution - let existing code.log statements work
      console.log("Function could not be automatically executed, but found function definition.");
    }
  `;
}

// Improved Python wrapper that extracts and calls the user's function
function wrapPythonCode(code, testCase) {
  // Look for print statements that directly output the expected result
  const hardcodingPattern = new RegExp(`print\\(['"]${testCase.expectedOutput}['"]\\)`, 'i');
  
  // Detect direct hardcoding attempts
  if (hardcodingPattern.test(code)) {
    return `
print("Error: Direct hardcoding of test case answers is not allowed.")
import sys
sys.exit(1)
    `;
  }
  
  return `
# Original user code
${code}

# Test case runner
input_data = """${testCase.input}"""

# Inspect if the code has required solution patterns
code_str = """${code.replace(/"/g, '\\"')}"""

# Check for function declarations
import re
has_function = "def " in code_str

if not has_function:
    print("Error: Your solution must define a function")
    import sys
    sys.exit(1)

# Extract function name
function_match = re.search(r'def\\s+([a-zA-Z0-9_]+)\\s*\\(', code_str)
function_name = None

if function_match:
    function_name = function_match.group(1)
    
    # Auto-execute the function with the test input if we found a name
    try:
        # Handle different input types
        if '[' in input_data and ']' in input_data:
            # Array input
            import json
            arr = json.loads(input_data)
            exec(f"print({function_name}(arr))")
        elif '\\n' in input_data:
            # Multiple inputs
            inputs = input_data.split('\\n')
            if len(inputs) == 2:
                exec(f"print({function_name}({inputs[0]}, {inputs[1]}))")
            else:
                # For more parameters
                exec(f"print({function_name}({', '.join(inputs)}))")
        else:
            # Single string input
            exec(f"print({function_name}('{input_data}'))")
    except Exception as e:
        print(f"Error: {str(e)}")
  `;
}

// Improved Java wrapper that detects and runs the user's method
function wrapJavaCode(code, testCase) {
  // Look for System.out.println statements that directly output the expected result
  const hardcodingPattern = new RegExp(`System\\.out\\.println\\(["\']${testCase.expectedOutput}["\']\\)`, 'i');
  
  // Detect direct hardcoding attempts
  if (hardcodingPattern.test(code)) {
    return `
public class Main {
    public static void main(String[] args) {
        System.out.println("Error: Direct hardcoding of test case answers is not allowed.");
        System.exit(1);
    }
}
    `;
  }
  
  // Look for method declaration in the code
  const methodMatch = /public\s+static\s+(\w+)\s+(\w+)\s*\([^)]*\)/.exec(code);
  
  if (methodMatch) {
    const returnType = methodMatch[1];
    const methodName = methodMatch[2];
    
    // Create a more robust wrapper that calls the user's method
    return `
public class Main {
    public static void main(String[] args) {
        // Test case input
        String input = "${testCase.input}";
        
        // Original user code - method will be here
        ${code.includes("public class Main") ? "" : code}
        
        // Call the user's method with the test input
        try {
            ${returnType === "void" ? `${methodName}(input);` : `System.out.println(${methodName}(input));`}
        } catch (Exception e) {
            System.out.println("Error executing solution: " + e.getMessage());
            e.printStackTrace();
        }
    }

    // If user code doesn't contain the Main class already, include it here
    ${code.includes("public class Main") ? code : ""}
}`;
  } else {
    // If we can't find a clear method pattern, just wrap their code
    return `
public class Main {
    public static void main(String[] args) {
        // Test case input
        String input = "${testCase.input}";
        
        // Check for method declarations
        String codeStr = "${code.replace(/"/g, '\\"')}";
        boolean hasMethod = codeStr.matches(".*public\\\\s+[a-zA-Z0-9_<>]+\\\\s+[a-zA-Z0-9_]+\\\\s*\\\\([^\\\\)]*\\\\).*");
        
        if (!hasMethod) {
            System.out.println("Error: Your solution must define a method");
            System.exit(1);
        }
        
        // Original user code
        ${code.includes("public class Main") ? "" : code}
    }
    
    ${code.includes("public class Main") ? code : ""}
}`;
  }
}

export default function ProblemDetail({ params }) {
  const [id, setId] = useState(null);
  const { user, loading: authLoading } = useAuth();

  const [problem, setProblem] = useState(null);
  const [code, setCode] = useState(LANGUAGES[0].initialCode);
  const [customInput, setCustomInput] = useState("");
  const [results, setResults] = useState(null);
  const [timer, setTimer] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [fontSize, setFontSize] = useState(14);
  const [showHints, setShowHints] = useState(false);
  const [userNotes, setUserNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("javascript");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getId = async () => {
      const { id: paramId } = await params;
      setId(paramId);
    };
    getId();
  }, [params]);

  useEffect(() => {
    let interval;
    if (isRunning) {
      interval = setInterval(() => setTimer((t) => t + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  useEffect(() => {
    console.log("ProblemDetail useEffect: user:", user, "authLoading:", authLoading, "id:", id);
    if (!authLoading && id) {
      if (!user) {
        console.log("No user detected, redirecting to signin");
        window.location.href = "/auth/signin";
      } else {
        fetchProblem();
      }
    }
  }, [id, user, authLoading]);

  useEffect(() => {
    const newLang = LANGUAGES.find((lang) => lang.value === selectedLanguage);
    setCode(newLang.initialCode);
  }, [selectedLanguage]);

  const fetchProblem = async () => {
    if (!id) return;
    console.log("Fetching problem for ID:", id, "User:", user);
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch(`/api/problems/${id}`, {
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
      
      console.log("Fetch problem response status:", response.status);
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Failed to fetch problem: ${response.status} ${errorText}`);
        if (response.status === 401) {
          console.log("Unauthorized, redirecting to signin");
          window.location.href = "/auth/signin";
          return;
        }
        throw new Error(`Failed to load problem: ${response.status} - ${errorText}`);
      }
      
      const data = await response.json();
      console.log("Problem data:", data);
      
      if (!data || !data.title || !data.statement) {
        throw new Error("Invalid problem data received");
      }
      
      setProblem(data);
      setIsRunning(true);
    } catch (error) {
      console.error("Failed to fetch problem:", error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRunCode = async () => {
    if (!user || !user._id) {
      setResults({ type: "error", message: "Login required to run code" });
      return;
    }

    try {
      const selectedLang = LANGUAGES.find((lang) => lang.value === selectedLanguage);
      const payload = {
        language: selectedLang.value,
        version: selectedLang.version,
        files: [{ name: `main.${selectedLang.extension}`, content: code }],
        stdin: customInput || "",
        args: [],
      };

      console.log("Running code with payload:", payload);
      const res = await fetch("https://emkc.org/api/v2/piston/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`API error: ${res.status} - ${errorText}`);
      }

      const data = await res.json();
      console.log("Run code response:", data);

      const output = data.run.stdout.trim();
      const stderr = data.run.stderr.trim();
      setResults({ 
        type: "run", 
        output: stderr ? `Error: ${stderr}` : (output || "No output") 
      });
    } catch (error) {
      console.error("Run code error:", error);
      setResults({ type: "error", message: `Error running code: ${error.message}` });
    }
  };

  const handleSubmitSolution = async () => {
    if (!user || !user._id) {
      setResults({ type: "error", message: "Login required to submit" });
      return;
    }

    try {
      if (!problem.testCases?.length) {
        setResults({ type: "error", message: "No test cases available for validation." });
        return;
      }

      setIsSubmitting(true);
      setResults({ type: "loading", message: "Testing your solution..." });

      // Updated to pass problem title to the validation function
      const validation = await validateSolution(code, problem.testCases, selectedLanguage, problem.title);
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

      const userId = user._id;
      if (!userId) throw new Error("User ID not found");

      console.log("Submitting solution for user:", userId);
      const selectedLang = LANGUAGES.find((lang) => lang.value === selectedLanguage);
      const submission = {
        userId: userId,
        problemId: id,
        code,
        language: selectedLang.value,
        status: testResults.correct ? "ACCEPTED" : "FAILED",
        executionTime: testResults.results[0]?.executionTime || 0,
        memoryUsed: testResults.results[0]?.memoryUsage || 0,
      };

      const response = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(submission),
      });

      const responseData = await response.json();
      console.log("Submission response:", responseData);

      if (!response.ok) {
        if (response.status === 401) {
          console.log("Unauthorized submission, redirecting to signin");
          window.location.href = "/auth/signin";
          return;
        }
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
        message: `Error saving your submission: ${error.message}`,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <LoadingSpinner className="w-12 h-12 text-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-lg">
          <h2 className="text-2xl font-semibold text-red-700 dark:text-red-400">{error}</h2>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!problem) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-lg">
          <h2 className="text-2xl font-semibold text-red-700 dark:text-red-400">Problem not found</h2>
        </div>
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
          <div className="space-y-6">
          // Continuation of the ProblemDetail.jsx file from where it cut off:

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
        onClick={() => setCode(LANGUAGES.find((lang) => lang.value === selectedLanguage).initialCode)}
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
    disabled={isSubmitting || !user}
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
          <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Test Case Results</h4>
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
                  {result.isDynamic && (
                    <span className="text-xs text-blue-500 bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded-full">Dynamic Test</span>
                  )}
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