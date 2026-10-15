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
      <div className="fk-hello flex min-h-[calc(100vh-5rem)] flex-col items-center justify-center px-6 py-12">
        <EmptyStateIllustration size={220} className="mb-8" />

        <p className="xt-eyebrow mb-2">Error 404</p>
        <h1 className="xt-title mb-3 text-center">Page not found</h1>
        <p className="text-muted-foreground mb-8 text-center max-w-sm">
          This FundaKaMental page doesn't exist or has moved. Head back to Home to search a company or open a report.
        </p>

        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2 rounded-xl font-bold" onClick={() => window.history.back()}>
            <ArrowLeft className="w-4 h-4" /> Go Back
          </Button>
          <Link to="/fundakamental">
            <Button className="gap-2 rounded-xl font-bold bg-brand-fill hover:bg-brand-hover text-white">
              <Home className="w-4 h-4" /> Home
            </Button>
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default NotFound;
