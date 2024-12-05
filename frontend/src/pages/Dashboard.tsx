import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import {
  Mail,
  Eye,
  Trash2,
  Link2,
  Copy,
  X,
  Map,
  BarChart2,
  Filter,
  AlertCircle,
  Plus,
  CheckCircle,
  Clock,
  Box,
} from "lucide-react";

interface Category {
  id: number;
  name: string;
  _count: {
    pixels: number;
  };
}

interface View {
  viewedAt: string;
}

interface Pixel {
  id: number;
  token: string;
  recipientEmail: string;
  emailSubject: string;
  viewCount: number;
  createdAt: string;
  categoryId: number | null;
  views: View[];
}

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL;

const Dashboard: React.FC = () => {
  const [pixels, setPixels] = useState<Pixel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [pixelToDelete, setPixelToDelete] = useState<Pixel | null>(null);
  const [urlModalOpen, setUrlModalOpen] = useState(false);
  const [currentPixel, setCurrentPixel] = useState<Pixel | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [maxPixels, setMaxPixels] = useState(0);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/categories`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        console.log(response.data);
        setCategories(response.data);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchPixels = async () => {
      try {
        setIsLoading(true);
        const url = new URL(`${API_BASE_URL}/pixel/stats`);
        if (selectedCategory) {
          url.searchParams.append("categoryId", selectedCategory.toString());
        }

        const response = await axios.get(url.toString(), {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        console.log("pixels", response.data.pixels);
        await setPixels(response.data.pixels);
        if (maxPixels == 0) {
          setMaxPixels(response.data.pixels.length);
        }
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching pixels:", error);
        setIsLoading(false);
      }
    };

    fetchPixels();
  }, [selectedCategory]);

  const handleDelete = (pixel: Pixel) => {
    setPixelToDelete(pixel);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (pixelToDelete) {
      try {
        await axios.delete(`${API_BASE_URL}/pixel/${pixelToDelete.id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setPixels(pixels.filter((p) => p.id !== pixelToDelete.id));
        setDeleteModalOpen(false);
        setPixelToDelete(null);
      } catch (error) {
        console.error("Error deleting pixel:", error);
        // Add error handling UI feedback
      }
    }
  };

  const handleShowUrl = (pixel: Pixel) => {
    setCurrentPixel(pixel);
    setUrlModalOpen(true);
  };

  const handleCopyUrl = (token: string) => {
    const url = `${API_BASE_URL}/pixel/invisible/${token}.jpg`;
    navigator.clipboard.writeText(url);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-48 bg-gradient-to-b from-blue-50 to-transparent" />
        <div className="absolute -top-32 -right-32 w-[600px] h-[600px] bg-blue-100 rounded-full blur-3xl opacity-30 animate-pulse" />
        <div className="absolute top-1/2 -left-32 w-[500px] h-[500px] bg-blue-50 rounded-full blur-3xl opacity-30 animate-pulse delay-700" />
      </div>

      <div className="relative max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="space-y-6">
          {/* Header Section */}
          <div className="flex flex-col space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <div className="bg-blue-600 p-3 rounded-xl rotate-3 hover:rotate-6 transition-transform duration-300">
                  <Mail className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                  Email Tracking Dashboard
                </h2>
              </div>

              <div className="flex space-x-3">
                <Link
                  to="/analytics"
                  className="flex items-center px-4 py-2 rounded-xl text-blue-600 bg-blue-50 hover:bg-blue-100 transition-all duration-300"
                >
                  <BarChart2 className="w-5 h-5 mr-2" />
                  Analytics
                </Link>
                {pixels.length > 0 && (
                  <Link
                    to="/create-pixel"
                    className="flex items-center px-4 py-2 rounded-xl text-white bg-blue-600 hover:bg-blue-700 transition-all duration-300 shadow-lg shadow-blue-200 hover:shadow-blue-300"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Create New Pixel
                  </Link>
                )}
              </div>
            </div>

            {/* Category Filter */}
            <div className="w-64 ml-auto">
              <div className="relative">
                <select
                  value={selectedCategory || ""}
                  onChange={(e) =>
                    setSelectedCategory(
                      e.target.value ? Number(e.target.value) : null
                    )
                  }
                  className="w-full appearance-none bg-white border-2 border-gray-100 rounded-xl py-2 pl-3 pr-10 text-gray-900 focus:border-blue-600 focus:ring-0 hover:border-blue-600 transition-colors"
                >
                  <option value="">All Categories ({maxPixels})</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name} ({category._count.pixels})
                    </option>
                  ))}
                </select>
                <Filter className="absolute right-3 top-2.5 w-5 h-5 text-gray-400" />
              </div>
              {selectedCategory && (
                <button
                  onClick={() => setSelectedCategory(null)}
                  className="mt-2 flex items-center text-sm text-gray-500 hover:text-blue-600 transition-colors"
                >
                  <X className="w-4 h-4 mr-1" />
                  Clear filter
                </button>
              )}
            </div>
          </div>

          {/* Loading State */}
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-600"></div>
            </div>
          ) : pixels.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border-2 border-blue-100 shadow-xl">
              <Box className="mx-auto h-16 w-16 text-blue-600 animate-bounce" />
              <h3 className="mt-4 text-xl font-medium text-gray-900">
                No tracked emails found
              </h3>
              <p className="mt-2 text-gray-600">
                Get started by creating a new tracking pixel.
              </p>
              <div className="mt-6">
                <Link
                  to="/create-pixel"
                  className="inline-flex items-center px-6 py-3 rounded-xl text-white bg-blue-600 hover:bg-blue-700 transition-all duration-300 shadow-lg shadow-blue-200 hover:shadow-blue-300"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Create New Pixel
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {pixels.map((pixel) => (
                <div
                  key={pixel.id}
                  className="bg-white rounded-2xl border-2 border-blue-100 shadow-xl hover:shadow-2xl transition-all duration-300 group"
                >
                  {/* Action Buttons */}
                  <div className="absolute top-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <button
                      onClick={() => handleShowUrl(pixel)}
                      className="p-2 rounded-xl text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                      title="View Tracking URL"
                    >
                      <Link2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(pixel)}
                      className="p-2 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      title="Delete Pixel"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="p-6">
                    {pixel.categoryId && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-50 text-blue-700">
                        {categories.find(
                          (category) => category.id === pixel.categoryId
                        )?.name || "Unknown Category"}
                      </span>
                    )}
                    <h3 className="text-xl font-semibold text-gray-900 mt-2 truncate">
                      {pixel.emailSubject}
                    </h3>
                    <div className="mt-3 space-y-2">
                      <p className="text-gray-600 truncate">
                        To: {pixel.recipientEmail}
                      </p>
                      <div className="flex items-center justify-between">
                        <p className="flex items-center text-gray-600">
                          <Eye className="w-4 h-4 mr-1.5 text-blue-600" />
                          {pixel.viewCount}{" "}
                          {pixel.viewCount === 1 ? "view" : "views"}
                        </p>
                        <p className="text-sm text-gray-500">
                          <Clock className="w-4 h-4 inline mr-1.5" />
                          {new Date(pixel.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="mt-6">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-gray-900">
                          Recent Views
                        </h4>
                        {pixel.views.length > 0 && (
                          <span className="text-sm text-gray-500">
                            Last:{" "}
                            {new Date(pixel.views[0].viewedAt).toLocaleString()}
                          </span>
                        )}
                      </div>
                      {pixel.views.length > 0 ? (
                        <ul className="space-y-2">
                          {pixel.views.slice(0, 5).map((view, index) => (
                            <li
                              key={index}
                              className="flex items-center justify-between py-2 border-t border-gray-100"
                            >
                              <div className="flex items-center space-x-3">
                                <Eye className="w-4 h-4 text-blue-600" />
                                <span className="text-sm text-gray-600">
                                  {new Date(view.viewedAt).toLocaleString()}
                                </span>
                              </div>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <div className="text-center py-6 bg-gray-50 rounded-xl">
                          <p className="text-gray-500">No views yet</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Delete Modal */}
          {deleteModalOpen && (
            <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-600 bg-opacity-50 backdrop-blur-sm">
              <div className="flex items-center justify-center min-h-screen px-4">
                <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md animate-fade-in-up">
                  <div className="flex items-start space-x-4">
                    <div className="p-3 bg-red-100 rounded-xl">
                      <AlertCircle className="w-6 h-6 text-red-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900">
                        Delete Tracking Pixel
                      </h3>
                      <p className="mt-2 text-gray-600">
                        Are you sure you want to delete this tracking pixel?
                        This action cannot be undone.
                      </p>
                    </div>
                  </div>
                  <div className="mt-6 flex space-x-3">
                    <button
                      onClick={confirmDelete}
                      className="flex-1 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors"
                    >
                      Delete
                    </button>
                    <button
                      onClick={() => setDeleteModalOpen(false)}
                      className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* URL Modal */}
          {urlModalOpen && currentPixel && (
            <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-600 bg-opacity-50 backdrop-blur-sm">
              <div className="flex items-center justify-center min-h-screen px-4">
                <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md animate-fade-in-up">
                  <div className="flex justify-between items-start">
                    <h3 className="text-xl font-bold text-gray-900">
                      Tracking Pixel URL
                    </h3>
                    <button
                      onClick={() => setUrlModalOpen(false)}
                      className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                  <div className="mt-4">
                    <div className="flex rounded-xl border-2 border-gray-100 overflow-hidden">
                      <input
                        type="text"
                        readOnly
                        value={`${API_BASE_URL}/pixel/invisible/${currentPixel.token}.jpg`}
                        className="flex-1 px-4 py-2 text-gray-600 bg-transparent border-0 focus:ring-0"
                      />
                      <button
                        onClick={() => handleCopyUrl(currentPixel.token)}
                        className="px-4 bg-gray-50 hover:bg-gray-100 border-l-2 border-gray-100 transition-colors"
                      >
                        {copySuccess ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : (
                          <Copy className="w-5 h-5 text-gray-400" />
                        )}
                      </button>
                    </div>
                    {copySuccess && (
                      <p className="mt-2 text-sm text-green-600 flex items-center">
                        <CheckCircle className="w-4 h-4 mr-1.5" />
                        Copied to clipboard!
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
