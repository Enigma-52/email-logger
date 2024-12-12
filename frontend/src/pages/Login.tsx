import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  LogIn,
} from "lucide-react";

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL;

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, {
        email,
        password,
      });
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("auth_status", "ACTIVE");
      navigate("/dashboard");
    } catch (error) {
      console.error("Login failed:", error);
      setError("Invalid email or password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white relative overflow-hidden py-12 px-4 sm:px-6 lg:px-8">
      {/* Background decorative elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-full h-48 bg-gradient-to-b from-blue-50 to-transparent" />
        <div className="absolute -top-32 -right-32 w-[600px] h-[600px] bg-blue-100 rounded-full blur-3xl opacity-50 animate-pulse" />
        <div className="absolute top-1/2 -left-32 w-[500px] h-[500px] bg-blue-50 rounded-full blur-3xl opacity-50 animate-pulse delay-700" />
      </div>

      <div className="max-w-md w-full space-y-8 relative">
        {/* Logo */}
        <div className="flex justify-center animate-fade-in-down">
          <div className="relative bg-blue-600 p-3 rounded-xl rotate-3 hover:rotate-6 transition-transform duration-300">
            <Mail className="w-8 h-8 text-white" />
          </div>
        </div>

        <div className="bg-white p-8 rounded-2xl border-2 border-blue-100 shadow-xl animate-fade-in-up">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
            Welcome Back !
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative group">
              <Mail className="w-5 h-5 text-gray-400 absolute left-3 top-3.5 group-hover:text-blue-600 transition-colors" />
              <input
                type="email"
                required
                className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-gray-100 focus:border-blue-600 focus:ring-0 text-gray-900 transition-all hover:border-blue-600"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="relative group">
              <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-3.5 group-hover:text-blue-600 transition-colors" />
              <input
                type={showPassword ? "text" : "password"}
                required
                className="w-full pl-10 pr-12 py-3 rounded-xl border-2 border-gray-100 focus:border-blue-600 focus:ring-0 text-gray-900 transition-all hover:border-blue-600"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="absolute right-3 top-3.5 text-gray-400 hover:text-blue-600 transition-colors"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>

            {error && (
              <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg animate-fade-in">
                <AlertCircle className="w-5 h-5" />
                <p className="text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-blue-200 group disabled:opacity-50"
            >
              <LogIn className="w-5 h-5" />
              <span>{isLoading ? "Signing in..." : "Sign in"}</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>

            <div className="mt-6 text-center">
              <p className="text-gray-600">
                Don't have an account?{" "}
                <Link
                  to="/register"
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Sign up
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
