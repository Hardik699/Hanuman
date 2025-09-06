import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";
import AppNav from "@/components/Navigation";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-deep-900 via-blue-deep-800 to-slate-900">
      {/* Navigation */}
      <AppNav />

      {/* 404 Content */}
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] p-4">
        <div className="text-center">
          <div className="mb-8">
            <h1 className="text-8xl font-bold text-blue-400 mb-4">404</h1>
            <h2 className="text-2xl font-semibold text-white mb-2">
              Page Not Found
            </h2>
            <p className="text-slate-400 text-lg mb-8 max-w-md">
              Oops! The page you're looking for doesn't exist or has been moved.
            </p>
          </div>

          <Button
            onClick={() => (window.location.href = "/")}
            className="bg-blue-500 hover:bg-blue-600 text-white transition-all duration-300 hover:scale-105"
          >
            <Home className="h-4 w-4 mr-2" />
            Return to Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
