import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { User, Shield, Users, ArrowRight } from "lucide-react";
import AppNav from "@/components/Navigation";

export default function Index() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState("");
  const [currentUser, setCurrentUser] = useState("");

  // Check authentication status
  useEffect(() => {
    const auth = localStorage.getItem("isAuthenticated");
    const role = localStorage.getItem("userRole");
    const user = localStorage.getItem("currentUser");

    setIsAuthenticated(!!auth);
    setUserRole(role || "");
    setCurrentUser(user || "");
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-deep-900 via-blue-deep-800 to-slate-900">
      {/* Navigation */}
      <AppNav />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            User Management
            <span className="block text-blue-400">System</span>
          </h1>
          <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
            {isAuthenticated
              ? `Welcome back, ${currentUser}! ${userRole === "admin" ? "Manage users and system settings." : "Your account is active and ready to use."}`
              : "A modern solution for user authentication and management. Secure, simple, and efficient."}
          </p>

          {!isAuthenticated && (
            <p className="text-slate-400 text-lg">
              Use the navigation above to login or contact an administrator for
              access.
            </p>
          )}
        </div>

        {/* Features/Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {/* Authentication Status */}
          <Card className="bg-slate-900/50 border-slate-700 backdrop-blur-sm hover:bg-slate-800/60 transition-all duration-300 hover:scale-105">
            <CardHeader>
              <CardTitle className="text-white flex items-center space-x-2">
                <User className="h-5 w-5 text-blue-400" />
                <span>Authentication</span>
              </CardTitle>
              <CardDescription className="text-slate-400">
                {isAuthenticated ? "You are logged in" : "Secure login system"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-4">
                <div
                  className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                    isAuthenticated
                      ? "bg-green-500/20 border border-green-500/30"
                      : "bg-slate-700/50 border border-slate-600"
                  }`}
                >
                  <User
                    className={`h-8 w-8 ${isAuthenticated ? "text-green-400" : "text-slate-400"}`}
                  />
                </div>
                <p
                  className={`font-medium ${isAuthenticated ? "text-green-400" : "text-slate-300"}`}
                >
                  {isAuthenticated ? "Active Session" : "Not Authenticated"}
                </p>
                {isAuthenticated && (
                  <p className="text-slate-400 text-sm mt-2">
                    Logged in as: {currentUser}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Admin Access */}
          <Card className="bg-slate-900/50 border-slate-700 backdrop-blur-sm hover:bg-slate-800/60 transition-all duration-300 hover:scale-105">
            <CardHeader>
              <CardTitle className="text-white flex items-center space-x-2">
                <Shield className="h-5 w-5 text-purple-400" />
                <span>Admin Access</span>
              </CardTitle>
              <CardDescription className="text-slate-400">
                {userRole === "admin"
                  ? "Full system access"
                  : "Administrative features"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-4">
                <div
                  className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                    userRole === "admin"
                      ? "bg-purple-500/20 border border-purple-500/30"
                      : "bg-slate-700/50 border border-slate-600"
                  }`}
                >
                  <Shield
                    className={`h-8 w-8 ${userRole === "admin" ? "text-purple-400" : "text-slate-400"}`}
                  />
                </div>
                <p
                  className={`font-medium ${userRole === "admin" ? "text-purple-400" : "text-slate-300"}`}
                >
                  {userRole === "admin"
                    ? "Admin Privileges"
                    : "Standard Access"}
                </p>
                {userRole === "admin" && (
                  <p className="text-slate-400 text-sm mt-2">
                    Create and manage users
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* User Management */}
          <Card className="bg-slate-900/50 border-slate-700 backdrop-blur-sm hover:bg-slate-800/60 transition-all duration-300 hover:scale-105">
            <CardHeader>
              <CardTitle className="text-white flex items-center space-x-2">
                <Users className="h-5 w-5 text-orange-400" />
                <span>User Management</span>
              </CardTitle>
              <CardDescription className="text-slate-400">
                {userRole === "admin"
                  ? "Manage system users"
                  : "User account features"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-4">
                <div className="w-16 h-16 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-orange-500/30">
                  <Users className="h-8 w-8 text-orange-400" />
                </div>
                <p className="text-orange-400 font-medium">
                  {userRole === "admin" ? "Full Control" : "Account Access"}
                </p>
                <p className="text-slate-400 text-sm mt-2">
                  {userRole === "admin"
                    ? "Add, edit, delete users"
                    : "View your account info"}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Instructions */}
        <Card className="bg-slate-900/30 border-slate-700 backdrop-blur-sm">
          <CardContent className="p-8 text-center">
            <h3 className="text-2xl font-semibold text-white mb-4">
              {isAuthenticated
                ? "Welcome to Your Dashboard"
                : "Getting Started"}
            </h3>
            <div className="space-y-3 text-slate-400 max-w-3xl mx-auto">
              {isAuthenticated ? (
                userRole === "admin" ? (
                  <>
                    <p className="flex items-center justify-center space-x-2">
                      <ArrowRight className="h-4 w-4 text-blue-400" />
                      <span>
                        Use the navigation above to create new users or manage
                        existing ones
                      </span>
                    </p>
                    <p className="flex items-center justify-center space-x-2">
                      <ArrowRight className="h-4 w-4 text-blue-400" />
                      <span>Click "New User" to add users to the system</span>
                    </p>
                    <p className="flex items-center justify-center space-x-2">
                      <ArrowRight className="h-4 w-4 text-blue-400" />
                      <span>
                        Click "View Users" to see and manage existing users
                      </span>
                    </p>
                  </>
                ) : (
                  <>
                    <p className="flex items-center justify-center space-x-2">
                      <ArrowRight className="h-4 w-4 text-green-400" />
                      <span>You're successfully logged into the system</span>
                    </p>
                    <p className="flex items-center justify-center space-x-2">
                      <ArrowRight className="h-4 w-4 text-green-400" />
                      <span>
                        Contact an administrator for additional permissions
                      </span>
                    </p>
                    <p className="flex items-center justify-center space-x-2">
                      <ArrowRight className="h-4 w-4 text-green-400" />
                      <span>
                        Use the profile menu in the navigation to manage your
                        account
                      </span>
                    </p>
                  </>
                )
              ) : (
                <>
                  <p className="flex items-center justify-center space-x-2">
                    <ArrowRight className="h-4 w-4 text-blue-400" />
                    <span>
                      Click "Login" in the navigation above to sign in
                    </span>
                  </p>
                  <p className="flex items-center justify-center space-x-2">
                    <ArrowRight className="h-4 w-4 text-blue-400" />
                    <span>
                      Admin credentials: username "admin", password "admin"
                    </span>
                  </p>
                  <p className="flex items-center justify-center space-x-2">
                    <ArrowRight className="h-4 w-4 text-blue-400" />
                    <span>
                      Contact an administrator to create your user account
                    </span>
                  </p>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
