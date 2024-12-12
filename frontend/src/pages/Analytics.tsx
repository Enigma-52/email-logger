import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  ChartBarIcon,
  ClockIcon,
  UserGroupIcon,
  GlobeAltIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";
import { Link, useNavigate } from "react-router-dom";

interface CategoryStats {
  id: number;
  name: string;
  pixelCount: number;
  totalViews: number;
  recentViews: number;
}
interface AnalyticsData {
  totalViews: number;
  totalPixels: number;
  activePixels: number;
  viewsToday: number;
  viewsThisWeek: number;
  viewsThisMonth: number;
  topPixels: {
    emailSubject: string;
    recipientEmail: string;
    viewCount: number;
    createdAt: string;
  }[];
  recentActivity: {
    emailSubject: string;
    recipientEmail: string;
    viewedAt: string;
  }[];
  viewsByDay: {
    date: string;
    count: number;
  }[];
}

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL;
const Analytics: React.FC = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("week"); // week, month, year
  const [categoryStats, setCategoryStats] = useState<CategoryStats[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategoryStats = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/categories/stats`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        console.log(response.data);

        setCategoryStats(response.data);
      } catch (error) {
        console.error("Error fetching category stats:", error);
      }
    };

    fetchCategoryStats();
  }, [timeRange]);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/pixel/analytics?range=${timeRange}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setAnalyticsData(response.data);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching analytics:", error);
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, [timeRange]);

  // Add this section to your render method
  const renderCategoryStats = () => (
    <div className="mt-8 bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
          Category Performance
        </h3>
        <div className="space-y-4">
          {categoryStats.map((category) => (
            <div key={category.id} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-900">
                  {category.name}
                </span>
                <span className="text-sm text-gray-500">
                  {category.totalViews} views
                </span>
              </div>
              <div className="relative">
                <div className="overflow-hidden h-2 text-xs flex rounded bg-indigo-200">
                  <div
                    style={{
                      width: `${
                        (category.recentViews / category.totalViews) * 100 || 0
                      }%`,
                    }}
                    className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-indigo-600"
                  />
                </div>
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span>{category.pixelCount} pixels</span>
                <span>{category.recentViews} views this week</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Add this to your existing timeframe-based stats
  const getCategoryDistribution = () => {
    const total = categoryStats.reduce((sum, cat) => sum + cat.totalViews, 0);
    return categoryStats.map((cat) => ({
      name: cat.name,
      percentage: ((cat.totalViews / total) * 100).toFixed(1),
    }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white relative overflow-hidden py-12">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white relative overflow-hidden py-12 px-4 sm:px-6 lg:px-8">
      {/* Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-48 bg-gradient-to-b from-blue-50 to-transparent" />
        <div className="absolute -top-32 -right-32 w-[600px] h-[600px] bg-blue-100 rounded-full blur-3xl opacity-30 animate-pulse" />
        <div className="absolute top-1/2 -left-32 w-[500px] h-[500px] bg-blue-50 rounded-full blur-3xl opacity-30 animate-pulse delay-700" />
      </div>

      <div className="max-w-7xl mx-auto relative">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-4">
            <div className="bg-blue-600 p-3 rounded-xl rotate-3 hover:rotate-6 transition-transform duration-300">
              <ChartBarIcon className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
              Analytics Dashboard
            </h1>
          </div>
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center px-4 py-2 text-blue-600 bg-blue-50 rounded-xl hover:bg-blue-100 transition-all duration-300"
          >
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            Back to Dashboard
          </button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              title: "Total Views",
              value: analyticsData?.totalViews,
              icon: ChartBarIcon,
            },
            {
              title: "Active Pixels",
              value: analyticsData?.activePixels,
              icon: UserGroupIcon,
            },
            {
              title: "Views Today",
              value: analyticsData?.viewsToday,
              icon: ClockIcon,
            },
            {
              title: "Views This Week",
              value: analyticsData?.viewsThisWeek,
              icon: GlobeAltIcon,
            },
          ].map((stat, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl border-2 border-blue-100 shadow-xl hover:shadow-2xl transition-all duration-300 p-6"
            >
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <stat.icon className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <p className="text-sm font-medium text-gray-500 truncate">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold text-blue-600">
                    {stat.value}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Top Performing Pixels */}
        <div className="mt-8 bg-white rounded-2xl border-2 border-blue-100 shadow-xl p-6">
          <h3 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent mb-6">
            Top Performing Pixels
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email Subject
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Recipient
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Views
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {analyticsData?.topPixels.map((pixel, index) => (
                  <tr
                    key={index}
                    className="hover:bg-blue-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {pixel.emailSubject}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {pixel.recipientEmail}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-lg">
                        {pixel.viewCount} views
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {new Date(pixel.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Category Performance */}
        <div className="mt-8 bg-white rounded-2xl border-2 border-blue-100 shadow-xl p-6">
          <h3 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent mb-6">
            Category Performance
          </h3>
          <div className="space-y-6">
            {categoryStats.map((category) => (
              <div key={category.id} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-900">
                    {category.name}
                  </span>
                  <span className="text-sm text-blue-600 font-medium">
                    {category.totalViews} views
                  </span>
                </div>
                <div className="relative">
                  <div className="h-2 bg-blue-100 rounded-full overflow-hidden">
                    <div
                      style={{
                        width: `${
                          (category.recentViews / category.totalViews) * 100 ||
                          0
                        }%`,
                      }}
                      className="h-full bg-blue-600 rounded-full transition-all duration-500"
                    />
                  </div>
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>{category.pixelCount} pixels</span>
                  <span>{category.recentViews} views this week</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Average Views by Category */}
        {/* Average Views by Category */}
        <div className="mt-8 bg-white rounded-2xl border-2 border-blue-100 shadow-xl p-6">
          <h3 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent mb-6">
            Average Views per Category
          </h3>
          <div className="space-y-4">
            {categoryStats.map((category) => {
              const averageViews =
                category.pixelCount > 0
                  ? (category.totalViews / category.pixelCount).toFixed(2)
                  : "0";

              return (
                <div
                  key={category.id}
                  className="flex items-center justify-between p-4 rounded-xl border-2 border-blue-50 hover:border-blue-100 transition-all duration-300"
                >
                  <div className="flex items-center space-x-3">
                    <span className="font-medium text-gray-900">
                      {category.name}
                    </span>
                    <span className="text-sm text-gray-500">
                      ({category.pixelCount} pixels)
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-lg font-bold text-blue-600">
                      {averageViews}
                    </span>
                    <span className="text-sm text-gray-500">
                      avg views/pixel
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mt-8 bg-white rounded-2xl border-2 border-blue-100 shadow-xl p-6">
          <h3 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent mb-6">
            Recent Activity
          </h3>
          <div className="flow-root">
            <ul className="space-y-6">
              {analyticsData?.recentActivity.map((activity, index) => (
                <li key={index} className="relative">
                  <div className="flex space-x-4">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 rounded-xl bg-blue-100 flex items-center justify-center">
                        <ChartBarIcon className="h-6 w-6 text-blue-600" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900">
                        {activity.emailSubject}
                      </div>
                      <p className="text-sm text-gray-500">
                        Recipient: {activity.recipientEmail}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(activity.viewedAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
