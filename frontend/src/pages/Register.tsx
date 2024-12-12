import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  UserPlus,
} from "lucide-react";

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL;

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Register, 2: OTP, 3: Success
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const navigate = useNavigate();

  useEffect(() => {
    const authStatus = localStorage.getItem("auth_status");
    if (authStatus && authStatus === "ACTIVE") {
      navigate("/dashboard");
    }
  }, []);

  const handleOtpChange = (element: HTMLInputElement, index: number) => {
    if (isNaN(Number(element.value))) return false;

    setOtp([...otp.map((d, idx) => (idx === index ? element.value : d))]);

    if (element.value && element.nextSibling) {
      (element.nextSibling as HTMLInputElement).focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setIsLoading(false);
      return;
    }

    try {
      await axios.post(`${API_BASE_URL}/auth/register`, {
        email,
        password,
      });
      setStep(2); // Move to OTP verification
    } catch (error: any) {
      setError(
        error.response?.data?.message ||
          "Registration failed. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOtp = async () => {
    setError("");
    setIsLoading(true);

    try {
      const otpString = otp.join("");
      console.log(otpString);
      const response = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, otpString }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error);
      }

      const data = await response.json();
      // Store token in localStorage
      localStorage.setItem("auth_token", data.token);
      localStorage.setItem("auth_status", "ACTIVE");
      setStep(3);
      setTimeout(() => {
        navigate("/dashboard", {
          state: {
            showWelcome: true,
            message: "Registration successful! Welcome to EmailTrack.",
          },
        });
      }, 2000);
    } catch (error: any) {
      setError(
        error.response?.data?.message || "Invalid OTP. Please try again."
      );
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

        {step === 1 && (
          <div className="bg-white p-8 rounded-2xl border-2 border-blue-100 shadow-xl animate-fade-in-up">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
              Create Account
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

              <div className="relative group">
                <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-3.5 group-hover:text-blue-600 transition-colors" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  className="w-full pl-10 pr-12 py-3 rounded-xl border-2 border-gray-100 focus:border-blue-600 focus:ring-0 text-gray-900 transition-all hover:border-blue-600"
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="absolute right-3 top-3.5 text-gray-400 hover:text-blue-600 transition-colors"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
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
                <UserPlus className="w-5 h-5" />
                <span>
                  {isLoading ? "Creating Account..." : "Create Account"}
                </span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-600">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="bg-white p-8 rounded-2xl border-2 border-blue-100 shadow-xl animate-fade-in">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">
              Verify Email
            </h2>
            <p className="text-gray-600 text-center mb-8">
              We've sent a code to {email}
            </p>
            <div className="flex justify-center space-x-3 mb-8">
              {otp.map((digit, idx) => (
                <input
                  key={idx}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(e.target, idx)}
                  className="w-12 h-12 text-center text-xl font-semibold border-2 border-gray-100 rounded-lg focus:border-blue-600 focus:ring-0 transition-all hover:border-blue-600"
                />
              ))}
            </div>

            {error && (
              <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg mb-6 animate-fade-in">
                <AlertCircle className="w-5 h-5" />
                <p className="text-sm">{error}</p>
              </div>
            )}

            <button
              onClick={verifyOtp}
              disabled={isLoading || otp.some((digit) => !digit)}
              className="w-full py-3 px-4 flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-blue-200 group disabled:opacity-50"
            >
              <span>{isLoading ? "Verifying..." : "Verify Email"}</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        )}

        {step === 3 && (
          <div className="bg-white p-8 rounded-2xl border-2 border-blue-100 shadow-xl animate-fade-in">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <CheckCircle className="w-8 h-8 text-green-500 animate-bounce" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Registration Successful!
              </h2>
              <p className="text-gray-600">Redirecting you to dashboard...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Register;
