import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense } from "react";

const AdminApp = lazy(() => import("@/valens-admin/AdminApp"));

export const Route = createFileRoute("/admin/$")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Admin — Valens" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminRoute,
});

function AdminRoute() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <AdminApp />
    </Suspense>
  );
}
