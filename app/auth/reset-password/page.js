import { Suspense } from "react";
import ResetPasswordClient from "@/components/ResetPasswordClient";

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      }
    >
      <ResetPasswordClient />
    </Suspense>
  );
}