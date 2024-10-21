import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { PlusIcon, EyeIcon, MapIcon } from "@heroicons/react/24/outline";

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
}

const Dashboard: React.FC = () => {
  const [pixels, setPixels] = useState<Pixel[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPixels = async () => {
      try {
        const response = await axios.get(
          "https://email-logger.onrender.com/pixel/stats",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setPixels(response.data.pixels);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching pixels:", error);
        setIsLoading(false);
      }
    };

    fetchPixels();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-gray-900">
              Email Tracking Dashboard
            </h2>
            <Link
              to="/create-pixel"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
              Create New Pixel
            </Link>
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
            <div className="grid gap-6 mb-8 md:grid-cols-2 xl:grid-cols-3">
              {pixels.map((pixel) => (
                <div
                  key={pixel.id}
                  className="bg-white overflow-hidden shadow rounded-lg"
                >
                  <div className="px-4 py-5 sm:p-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 truncate">
                      {pixel.emailSubject}
                    </h3>
                    <div className="mt-2 max-w-xl text-sm text-gray-500">
                      <p className="truncate">To: {pixel.recipientEmail}</p>
                      <p>View Count: {pixel.viewCount}</p>
                      <p>
                        Created:{" "}
                        {new Date(pixel.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="mt-3">
                      <h4 className="text-sm font-medium text-gray-900">
                        Recent Views:
                      </h4>
                      <ul className="mt-2 divide-y divide-gray-200">
                        {pixel.views.slice(0, 5).map((view, index) => (
                          <li key={index} className="py-2">
                            <div className="flex items-center space-x-3">
                              <EyeIcon
                                className="flex-shrink-0 h-5 w-5 text-gray-400"
                                aria-hidden="true"
                              />
                              <p className="text-sm text-gray-600">
                                {new Date(view.viewedAt).toLocaleString()}
                              </p>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
