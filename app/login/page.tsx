import { Suspense } from "react";
import LoginClient from "@/app/login/LoginClient";

export const dynamic = "force-dynamic";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center text-sm text-text-secondary">
          Cargando...
        </div>
      }
    >
      <LoginClient />
    </Suspense>
  );
}
