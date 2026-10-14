import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Home } from "lucide-react";
import { EmptyStateIllustration } from "../components/brand/Illustrations";
import DashboardLayout from "../components/dashboard/DashboardLayout";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <DashboardLayout>
      <div className="flex min-h-[calc(100vh-5rem)] flex-col items-center justify-center bg-background px-6 py-12">
        <EmptyStateIllustration size={220} className="mb-8" />

        <h1 className="text-4xl md:text-5xl font-display font-semibold text-brand mb-3">404</h1>
        <p className="text-xl text-foreground font-semibold mb-2">Page not found</p>
        <p className="text-muted-foreground mb-8 text-center max-w-sm">
          The page you're looking for doesn't exist or has been moved.
        </p>

        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2 rounded-full" onClick={() => window.history.back()}>
            <ArrowLeft className="w-4 h-4" /> Go Back
          </Button>
          <Link to="/fundakamental">
            <Button className="gap-2 rounded-full bg-primary hover:bg-primary/90 text-white">
              <Home className="w-4 h-4" /> Home
            </Button>
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default NotFound;
