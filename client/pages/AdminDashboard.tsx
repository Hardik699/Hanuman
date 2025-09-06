import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Users, User, Trash2, Settings, ArrowLeft } from "lucide-react";
import AppNav from "@/components/Navigation";

interface User {
  id: string;
  username: string;
  createdAt: string;
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [userRole, setUserRole] = useState("");

  // Check authentication and admin access
  useEffect(() => {
    const isAuthenticated = localStorage.getItem("isAuthenticated");
    const role = localStorage.getItem("userRole");

    if (!isAuthenticated) {
      navigate("/login");
    } else if (role !== "admin") {
      navigate("/"); // Redirect non-admin users to home
    } else {
      setUserRole(role);
    }
  }, [navigate]);

  // Load users from localStorage
  useEffect(() => {
    if (userRole === "admin") {
      const savedUsers = localStorage.getItem("users");
      if (savedUsers) {
        setUsers(JSON.parse(savedUsers));
      }
    }
  }, [userRole]);

  // Save users to localStorage
  const saveUsers = (updatedUsers: User[]) => {
    setUsers(updatedUsers);
    localStorage.setItem("users", JSON.stringify(updatedUsers));
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername.trim() || !newPassword.trim()) {
      alert("Please enter both username and password");
      return;
    }

    // Check if username already exists
    if (users.some((user) => user.username === newUsername.trim())) {
      alert("Username already exists");
      return;
    }

    setIsLoading(true);

    // Create new user
    const newUser: User = {
      id: Date.now().toString(),
      username: newUsername.trim(),
      createdAt: new Date().toISOString(),
    };

    // Save user credentials separately
    const credentials = JSON.parse(
      localStorage.getItem("userCredentials") || "{}",
    );
    credentials[newUsername.trim()] = newPassword;
    localStorage.setItem("userCredentials", JSON.stringify(credentials));

    const updatedUsers = [...users, newUser];
    saveUsers(updatedUsers);

    // Reset form
    setNewUsername("");
    setNewPassword("");
    setIsLoading(false);
  };

  const handleDeleteUser = (userId: string) => {
    const userToDelete = users.find((u) => u.id === userId);
    if (!userToDelete) return;

    if (
      confirm(
        `Are you sure you want to delete user "${userToDelete.username}"?`,
      )
    ) {
      // Remove from users list
      const updatedUsers = users.filter((user) => user.id !== userId);
      saveUsers(updatedUsers);

      // Remove credentials
      const credentials = JSON.parse(
        localStorage.getItem("userCredentials") || "{}",
      );
      delete credentials[userToDelete.username];
      localStorage.setItem("userCredentials", JSON.stringify(credentials));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-deep-900 via-blue-deep-800 to-slate-900">
      {/* Navigation */}
      <AppNav />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Admin Dashboard
            </h1>
            <p className="text-slate-400">Manage users and system settings</p>
          </div>
          <Button
            onClick={() => navigate("/")}
            variant="outline"
            className="border-slate-600 text-slate-300 hover:bg-slate-700"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Create User Card */}
          <Card
            id="create-user-section"
            className="bg-slate-900/50 border-slate-700 backdrop-blur-sm scroll-mt-20"
          >
            <CardHeader>
              <CardTitle className="text-white flex items-center space-x-2">
                <Plus className="h-5 w-5 text-blue-400" />
                <span>Create New User</span>
              </CardTitle>
              <CardDescription className="text-slate-400">
                Add a new user to the system with username and password
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateUser} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-slate-300">
                    Username
                  </Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="Enter username"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    className="bg-slate-800/50 border-slate-700 text-white placeholder-slate-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-slate-300">
                    Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="bg-slate-800/50 border-slate-700 text-white placeholder-slate-500 focus:border-blue-500"
                    required
                  />
                </div>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white"
                >
                  {isLoading ? "Creating..." : "Create User"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Users List Card */}
          <Card
            id="users-section"
            className="bg-slate-900/50 border-slate-700 backdrop-blur-sm scroll-mt-20"
          >
            <CardHeader>
              <CardTitle className="text-white flex items-center space-x-2">
                <Users className="h-5 w-5 text-green-400" />
                <span>Users</span>
                <Badge
                  variant="secondary"
                  className="bg-slate-700 text-slate-300"
                >
                  {users.length}
                </Badge>
              </CardTitle>
              <CardDescription className="text-slate-400">
                Manage existing users in the system
              </CardDescription>
            </CardHeader>
            <CardContent>
              {users.length === 0 ? (
                <div className="text-center py-8">
                  <User className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-400">No users created yet</p>
                  <p className="text-slate-500 text-sm">
                    Create your first user using the form
                  </p>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {users.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg border border-slate-700"
                    >
                      <div>
                        <p className="text-white font-medium">
                          {user.username}
                        </p>
                        <p className="text-slate-400 text-sm">
                          Created:{" "}
                          {new Date(user.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <Button
                        onClick={() => handleDeleteUser(user.id)}
                        variant="outline"
                        size="sm"
                        className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Stats Overview */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-slate-900/50 border-slate-700 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Total Users</p>
                  <p className="text-2xl font-semibold text-white">
                    {users.length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <Users className="h-6 w-6 text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-700 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Admin Access</p>
                  <p className="text-2xl font-semibold text-green-400">
                    Active
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <Settings className="h-6 w-6 text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-700 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Recent Activity</p>
                  <p className="text-2xl font-semibold text-purple-400">
                    {users.length > 0 ? "Active" : "None"}
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <User className="h-6 w-6 text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
