import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import {
  PlusIcon,
  EyeIcon,
  TrashIcon,
  LinkIcon,
  ClipboardDocumentIcon,
  XMarkIcon,
  MapIcon,
  ChartBarIcon,
  FunnelIcon,
} from "@heroicons/react/24/outline";
import { CheckIcon } from "@heroicons/react/24/solid";

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
  views: View[];
  categoryId: number;
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
        const url = selectedCategory
          ? `${API_BASE_URL}/pixel/stats?categoryId=${selectedCategory}`
          : `${API_BASE_URL}/pixel/stats`;

        const response = await axios.get(url, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        console.log("pixels", response.data.pixels);
        setPixels(response.data.pixels);
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
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex flex-col space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-bold text-gray-900">
                Email Tracking Dashboard
              </h2>
              <div className="flex space-x-2">
                <Link
                  to="/analytics"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-600 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <ChartBarIcon
                    className="-ml-1 mr-2 h-5 w-5"
                    aria-hidden="true"
                  />
                  Analytics
                </Link>
                {pixels.length > 0 && (
                  <Link
                    to="/create-pixel"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <PlusIcon
                      className="-ml-1 mr-2 h-5 w-5"
                      aria-hidden="true"
                    />
                    Create New Pixel
                  </Link>
                )}
              </div>
            </div>
            <div className="w-40 ml-auto relative">
              <select
                value={selectedCategory || ""}
                onChange={(e) =>
                  setSelectedCategory(
                    e.target.value ? Number(e.target.value) : null
                  )
                }
                className="w-full appearance-none bg-white border border-gray-300 rounded-md py-2 pl-3 pr-2 text-sm leading-5 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name} ({category._count.pixels})
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                <FunnelIcon
                  className="h-5 w-5 text-gray-400"
                  aria-hidden="true"
                />
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-500"></div>
            </div>
          ) : pixels.length === 0 ? (
            <div className="text-center py-12">
              <MapIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No tracked emails found
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by creating a new tracking pixel.
              </p>
              <div className="mt-6">
                <Link
                  to="/create-pixel"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                  Create New Pixel
                </Link>
              </div>
            </div>
          ) : (
            <div className="pt-2 grid gap-6 mb-8 md:grid-cols-2 xl:grid-cols-3">
              {pixels.map((pixel) => (
                <div
                  key={pixel.id}
                  className="bg-white overflow-hidden shadow rounded-lg relative group"
                >
                  {/* Action Buttons */}
                  <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleShowUrl(pixel)}
                      className="p-1.5 rounded-full text-gray-400 hover:text-indigo-600 hover:bg-gray-100"
                      title="View Tracking URL"
                    >
                      <LinkIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(pixel)}
                      className="p-1.5 rounded-full text-gray-400 hover:text-red-600 hover:bg-gray-100"
                      title="Delete Pixel"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>

                  <div className="px-4 py-5 sm:p-6">
                    {pixel.categoryId && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 mb-2">
                        {categories.find(
                          (category) => category.id === pixel.categoryId
                        )?.name || "Unknown Category"}
                      </span>
                    )}
                    <h3 className="text-lg leading-6 font-medium text-gray-900 truncate">
                      {pixel.emailSubject}
                    </h3>
                    <div className="mt-2 max-w-xl text-sm text-gray-500">
                      <p className="truncate">To: {pixel.recipientEmail}</p>
                      <div className="flex items-center justify-between mt-1">
                        <p className="flex items-center">
                          <EyeIcon className="h-4 w-4 mr-1" />
                          {pixel.viewCount}{" "}
                          {pixel.viewCount === 1 ? "view" : "views"}
                        </p>
                        <p className="text-xs">
                          Created:{" "}
                          {new Date(pixel.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-gray-900 flex items-center justify-between">
                        Recent Views
                        {pixel.views.length > 0 && (
                          <span className="text-xs text-gray-500">
                            Last viewed:{" "}
                            {new Date(pixel.views[0].viewedAt).toLocaleString()}
                          </span>
                        )}
                      </h4>
                      {pixel.views.length > 0 ? (
                        <ul className="mt-2 divide-y divide-gray-200">
                          {pixel.views.slice(0, 5).map((view, index) => (
                            <li key={index} className="py-2">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                  <EyeIcon
                                    className="flex-shrink-0 h-5 w-5 text-gray-400"
                                    aria-hidden="true"
                                  />
                                  <p className="text-sm text-gray-600">
                                    {new Date(view.viewedAt).toLocaleString()}
                                  </p>
                                </div>
                              </div>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-gray-500 mt-2 text-center py-4 bg-gray-50 rounded-md">
                          No views yet
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Delete Confirmation Modal */}
          {deleteModalOpen && (
            <div className="fixed inset-0 z-10 overflow-y-auto">
              <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
                <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
                  <div className="sm:flex sm:items-start">
                    <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                      <TrashIcon
                        className="h-6 w-6 text-red-600"
                        aria-hidden="true"
                      />
                    </div>
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                      <h3 className="text-lg font-medium text-gray-900">
                        Delete Tracking Pixel
                      </h3>
                      <div className="mt-2">
                        <p className="text-sm text-gray-500">
                          Are you sure you want to delete this tracking pixel?
                          This action cannot be undone.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                    <button
                      type="button"
                      className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                      onClick={confirmDelete}
                    >
                      Delete
                    </button>
                    <button
                      type="button"
                      className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm"
                      onClick={() => setDeleteModalOpen(false)}
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
            <div className="fixed inset-0 z-10 overflow-y-auto">
              <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
                <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
                  <div className="absolute top-0 right-0 pt-4 pr-4">
                    <button
                      type="button"
                      className="bg-white rounded-md text-gray-400 hover:text-gray-500"
                      onClick={() => setUrlModalOpen(false)}
                    >
                      <XMarkIcon className="h-6 w-6" />
                    </button>
                  </div>
                  <div className="sm:flex sm:items-start">
                    <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                      <h3 className="text-lg font-medium text-gray-900">
                        Tracking Pixel URL
                      </h3>
                      <div className="mt-4">
                        <div className="flex rounded-md shadow-sm">
                          <input
                            type="text"
                            readOnly
                            value={`https://email-logger.onrender.com/pixel/invisible/${currentPixel.token}.jpg`}
                            className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-l-md text-sm border border-gray-300"
                          />
                          <button
                            type="button"
                            onClick={() => handleCopyUrl(currentPixel.token)}
                            className="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 rounded-r-md bg-gray-50 text-gray-500 text-sm hover:bg-gray-100"
                          >
                            {copySuccess ? (
                              <CheckIcon className="h-5 w-5 text-green-600" />
                            ) : (
                              <ClipboardDocumentIcon className="h-5 w-5" />
                            )}
                          </button>
                        </div>
                        {copySuccess && (
                          <p className="mt-2 text-sm text-green-600">
                            Copied to clipboard!
                          </p>
                        )}
                      </div>
                    </div>
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
