// app/problems/[id]/page.js
"use client";

import { useState } from 'react';
import { useSession } from "next-auth/react";
import CodeEditor from "@/components/CodeEditor";
import ProblemDetail from './ProblemDetail';

export default function Page({ params }) {
  const { data: session } = useSession();
  
  return (
    <div>
      <ProblemDetail params={params} session={session} />
    </div>
  );
}