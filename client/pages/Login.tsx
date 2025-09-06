import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowRight, Eye, EyeOff } from "lucide-react";
import AppNav from "@/components/Navigation";

export default function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Check admin credentials
    if (username === "admin" && password === "admin") {
      localStorage.setItem("isAuthenticated", "true");
      localStorage.setItem("userRole", "admin");
      localStorage.setItem("currentUser", "admin");
      navigate("/");
    } else {
      // Check created user credentials
      const credentials = JSON.parse(
        localStorage.getItem("userCredentials") || "{}",
      );
      if (credentials[username] && credentials[username] === password) {
        localStorage.setItem("isAuthenticated", "true");
        localStorage.setItem("userRole", "user");
        localStorage.setItem("currentUser", username);
        navigate("/");
      } else {
        alert(
          "Invalid credentials. Use admin/admin or a created user account.",
        );
      }
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-deep-900 via-blue-deep-800 to-slate-900">
      {/* Navigation */}
      <AppNav />

      {/* Login Content */}
      <div className="flex items-center justify-center p-4 min-h-[calc(100vh-4rem)]">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        {/* Login Card */}
        <div className="relative w-full max-w-md">
          <div className="glass-dark rounded-2xl p-8 shadow-2xl border border-white/10 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/20 hover:border-blue-500/30 hover:bg-slate-800/60 group">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-500/30 transition-all duration-300 group-hover:bg-blue-500/30 group-hover:border-blue-400/50 group-hover:scale-110">
                <div className="w-6 h-6 bg-blue-500 rounded-full transition-all duration-300 group-hover:bg-blue-400 group-hover:shadow-lg group-hover:shadow-blue-400/50"></div>
              </div>
              <h1 className="text-2xl font-semibold text-white mb-2">
                Welcome back
              </h1>
              <p className="text-slate-400 text-sm">
                Please enter your details to sign in
              </p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleLogin} className="space-y-6">
              {/* Username Field */}
              <div className="space-y-2">
                <Label
                  htmlFor="username"
                  className="text-slate-300 text-sm font-medium"
                >
                  Username
                </Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="bg-slate-800/50 border-slate-700 text-white placeholder-slate-500 h-12 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-300 hover:bg-slate-700/50 hover:border-slate-600"
                  required
                />
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label
                  htmlFor="password"
                  className="text-slate-300 text-sm font-medium"
                >
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-slate-800/50 border-slate-700 text-white placeholder-slate-500 h-12 rounded-xl pr-12 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-300 hover:bg-slate-700/50 hover:border-slate-600"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center space-x-2 group/checkbox">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={(checked) =>
                    setRememberMe(checked as boolean)
                  }
                  className="border-slate-600 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500 transition-all duration-300 hover:border-slate-500 hover:bg-slate-700/30"
                />
                <Label
                  htmlFor="remember"
                  className="text-sm text-slate-400 cursor-pointer transition-colors duration-300 group-hover/checkbox:text-slate-300"
                >
                  Remember me
                </Label>
              </div>

              {/* Login Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white h-12 rounded-xl font-medium transition-all duration-200 flex items-center justify-center space-x-2 group hover:shadow-lg hover:shadow-blue-500/25 hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>{isLoading ? "Signing in..." : "Sign in"}</span>
                {!isLoading && (
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                )}
              </Button>
            </form>

            {/* Footer */}
            <div className="text-center mt-8">
              <p className="text-slate-400 text-sm">
                Don't have an account?{" "}
                <button className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
                  Create Account
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
