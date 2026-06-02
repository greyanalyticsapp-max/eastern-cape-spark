import { createFileRoute, Navigate, Outlet } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { useApp } from "@/context/AppContext";

export const Route = createFileRoute("/_app")({ component: AppLayout });

function AppLayout() {
  const { user } = useApp();
  if (!user) return <Navigate to="/login" />;
  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}
