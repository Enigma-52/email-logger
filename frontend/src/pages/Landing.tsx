import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Mail,
  Eye,
  Clock,
  Bell,
  ChevronRight,
  Sparkles,
  BarChart,
  Zap,
  ArrowRight,
  CheckCircle,
  Inbox,
} from "lucide-react";

type ButtonVariant = "primary" | "ghost" | "outline";

const Button = ({
  children,
  variant = "primary" as ButtonVariant,
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  className?: string;
}) => {
  const baseStyles =
    "flex items-center justify-center px-6 py-3 rounded-xl font-medium transition-all duration-300";
  const variants = {
    primary:
      "bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-200 hover:shadow-blue-300 hover:-translate-y-0.5",
    ghost:
      "text-gray-600 hover:text-blue-600 hover:bg-blue-50 hover:-translate-y-0.5",
    outline:
      "border-2 border-blue-200 text-blue-600 hover:bg-blue-50 hover:-translate-y-0.5",
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

const LandingPage = () => {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const navigate = useNavigate();

  return (
    <div className="h-screen bg-white relative overflow-hidden">
      {/* Decorative background elements with enhanced animations */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-full h-48 bg-gradient-to-b from-blue-50 to-transparent animate-fade-in" />
        <div className="absolute -top-32 -right-32 w-[600px] h-[600px] bg-blue-100 rounded-full blur-3xl opacity-50 animate-pulse" />
        <div className="absolute top-1/2 -left-32 w-[500px] h-[500px] bg-blue-50 rounded-full blur-3xl opacity-50 animate-pulse delay-700" />
      </div>

      {/* Navigation */}
      <nav className="relative flex items-center justify-between p-8 animate-fade-in-down">
        <div className="flex items-center space-x-4">
          <div className="relative bg-blue-600 p-3 rounded-xl rotate-3 hover:rotate-6 transition-transform duration-300 hover:scale-110">
            <Mail className="w-8 h-8 text-white animate-bounce delay-300" />
            <Sparkles className="w-5 h-5 text-blue-200 absolute -top-1 -right-1 animate-pulse delay-150" />
          </div>
          <span className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent hover:scale-105 transition-transform">
            EmailTrack
          </span>
        </div>
        <div className="flex items-center space-x-8">
          <Button
            variant="ghost"
            className="text-lg animate-fade-in-down"
            style={{ animationDelay: "100ms" }}
          >
            Features
          </Button>
          <Button
            variant="ghost"
            className="text-lg animate-fade-in-down"
            style={{ animationDelay: "200ms" }}
          >
            Pricing
          </Button>
          <Button
            variant="ghost"
            className="text-lg animate-fade-in-down"
            style={{ animationDelay: "300ms" }}
          >
            Contact
          </Button>
          <Button
            className="group text-lg animate-fade-in-down"
            style={{ animationDelay: "400ms" }}
            onClick={() => navigate("/register")}
          >
            Start Free
            <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1" />
          </Button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="relative flex h-[calc(100vh-112px)] items-center">
        {/* Left Side with staggered animations */}
        <div className="w-1/2 pl-16 pr-8">
          <div className="space-y-8 max-w-2xl">
            <div
              className="flex items-center space-x-3 animate-fade-in-up"
              style={{ animationDelay: "200ms" }}
            >
              <div className="bg-blue-100 text-blue-600 px-6 py-2 rounded-full text-base font-medium animate-pulse hover:scale-105 transition-transform">
                Gmail Ready
              </div>
              <span className="text-gray-500 text-lg hover:text-blue-600 transition-colors">
                Seamless Gmail Integration
              </span>
            </div>
            <h1 className="text-7xl font-bold space-y-3">
              <span
                className="block text-gray-900 animate-fade-in-up"
                style={{ animationDelay: "400ms" }}
              >
                Track Emails
              </span>
              <span
                className="block bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent animate-fade-in-up"
                style={{ animationDelay: "600ms" }}
              >
                With Precision
              </span>
            </h1>
            <p
              className="text-2xl text-gray-600 leading-relaxed animate-fade-in-up"
              style={{ animationDelay: "800ms" }}
            >
              Track your Gmail messages in real-time with powerful insights and
              instant notifications when emails are read.
            </p>
            <div
              className="flex items-center space-x-6 pt-6 animate-fade-in-up"
              style={{ animationDelay: "1000ms" }}
            >
              <Button
                onClick={() => navigate("/register")}
                className="px-10 py-7 text-xl group hover:scale-105 transition-transform"
              >
                Get Started
                <Zap className="w-6 h-6 ml-3 group-hover:scale-110 transition-transform animate-pulse" />
              </Button>
              <Button
                onClick={() => navigate("/register")}
                variant="outline"
                className="px-10 py-7 text-xl hover:scale-105 transition-transform"
              >
                View Demo
              </Button>
            </div>

            {/* Metrics section with hover animations */}
            <div
              className="flex items-center space-x-12 pt-8 animate-fade-in-up"
              style={{ animationDelay: "1200ms" }}
            >
              {[
                { value: "500K+", label: "Active Users" },
                { value: "99.9%", label: "Gmail Compatible" },
                { value: "24/7", label: "Support" },
              ].map((metric, index) => (
                <div
                  key={index}
                  className="group hover:transform hover:scale-110 transition-all duration-300"
                >
                  <div className="text-3xl font-bold text-blue-600 group-hover:text-blue-700 transition-colors">
                    {metric.value}
                  </div>
                  <div className="text-gray-600 group-hover:text-blue-600 transition-colors">
                    {metric.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side - Features with enhanced hover effects */}
        <div className="w-1/2 p-16">
          <div className="grid grid-cols-2 gap-8">
            {[
              {
                icon: Inbox,
                title: "Gmail Integration",
                desc: "Works seamlessly with your Gmail inbox",
                gradient: "from-blue-500 to-blue-600",
              },
              {
                icon: Bell,
                title: "Instant Alerts",
                desc: "Get notified as soon as emails are read",
                gradient: "from-blue-700 to-blue-800",
              },
              {
                icon: BarChart,
                title: "Live Tracking",
                desc: "Real-time email open notifications",
                gradient: "from-blue-600 to-blue-700",
              },
              {
                icon: Mail,
                title: "Mass Tracking",
                desc: "Track unlimited emails at once",
                gradient: "from-blue-800 to-blue-900",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="group animate-fade-in-up"
                style={{ animationDelay: `${(index + 1) * 200}ms` }}
                onMouseEnter={() => setHoverIndex(index)}
                onMouseLeave={() => setHoverIndex(null)}
              >
                <div
                  className={`bg-white rounded-2xl border-2 border-blue-100 p-8 transition-all duration-300 
                  hover:shadow-2xl hover:shadow-blue-100 ${
                    hoverIndex === index ? "transform scale-105" : ""
                  }`}
                >
                  <div
                    className={`w-16 h-16 rounded-xl mb-6 flex items-center justify-center bg-gradient-to-r ${feature.gradient} group-hover:scale-110 transition-transform`}
                  >
                    <feature.icon className="w-8 h-8 text-white group-hover:animate-pulse" />
                  </div>
                  <h3 className="text-2xl font-semibold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-lg text-gray-600 group-hover:text-blue-600/80 transition-colors">
                    {feature.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
