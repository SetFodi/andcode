// app/problems/[id]/page.js
"use client";

import CodeEditor from "@/components/CodeEditor";
import ProblemDetail from './ProblemDetail';

export default function Page({ params }) {
  return (
    <div>
      <ProblemDetail params={params} />
    </div>
  );
}
