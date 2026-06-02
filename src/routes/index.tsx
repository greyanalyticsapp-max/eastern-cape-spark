import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useApp } from "@/context/AppContext";

export const Route = createFileRoute("/")({ component: IndexRedirect });

function IndexRedirect() {
  const { user } = useApp();
  return <Navigate to={user ? "/dashboard" : "/login"} />;
}
