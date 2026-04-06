import { useQuery } from "@tanstack/react-query";
import { Navigate, useLocation } from "react-router-dom";
import { getMe } from "@/lib/auth";

type ProtectedRouteProps = {
  requiredRole?: string;
  children: React.ReactNode;
};

export default function ProtectedRoute({ requiredRole = "admin", children }: ProtectedRouteProps) {
  const location = useLocation();
  const { data, isLoading, isError } = useQuery({
    queryKey: ["auth", "me"],
    queryFn: getMe,
    retry: false,
  });

  if (isLoading) {
    return (
      <section className="container mx-auto px-6 py-24 md:py-32">
        <p className="text-muted-foreground">Checking access...</p>
      </section>
    );
  }

  if (isError || !data || data.role !== requiredRole) {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
  }

  return <>{children}</>;
}
