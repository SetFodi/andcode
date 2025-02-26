// app/auth/signin/page.js
import { Suspense } from "react";
import SignInForm from "./SignInForm";

export default function SignInPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-screen">Loading sign-in form...</div>}>
      <SignInForm />
    </Suspense>
  );
}