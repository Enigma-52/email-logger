import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  ClipboardIcon,
  ArrowLeftIcon,
  CheckIcon,
  PlusIcon,
  BellIcon,
} from "@heroicons/react/24/outline";
import { Dialog, Transition } from "@headlessui/react";

interface Category {
  id: number;
  name: string;
}

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL;

const CreatePixel: React.FC = () => {
  const [recipientEmail, setRecipientEmail] = useState("");
  const [emailSubject, setEmailSubject] = useState("");
  const [pixelToken, setPixelToken] = useState("");
  const [isCopied, setIsCopied] = useState(false);
  const [error, setError] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    null
  );
  const [newCategory, setNewCategory] = useState("");
  const [showCategoryInput, setShowCategoryInput] = useState(false);
  const navigate = useNavigate();
  const [enableNotifications, setEnableNotifications] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/categories/`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
          },
        });
        setCategories(response.data);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
  }, []);

  const handleCreateCategory = async () => {
    if (!newCategory.trim()) return;

    try {
      const response = await axios.post(
        `${API_BASE_URL}/categories/`,
        { name: newCategory.trim() },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
          },
        }
      );
      setCategories([...categories, response.data]);
      setSelectedCategoryId(response.data.id);
      setNewCategory("");
      setShowCategoryInput(false);
    } catch (error) {
      console.error("Error creating category:", error);
      setError("Failed to create category. Please try again.");
    }
  };

  const handleCreatePixel = async () => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/pixel/create`,
        {
          recipientEmail,
          emailSubject,
          categoryId: selectedCategoryId,
          notifications: enableNotifications,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
          },
        }
      );
      setPixelToken(response.data.pixelToken);
      setError("");
    } catch (error) {
      console.error("Error creating pixel:", error);
      setError("Failed to create pixel. Please try again.");
    }
  };

  const invisiblePixelUrl = `${API_BASE_URL}/pixel/invisible/${pixelToken}.jpg`;
  const imageHtml = `<img src="${invisiblePixelUrl}" alt="" width="1" height="1" style="display:none;" />`;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-white relative overflow-hidden py-12 px-4 sm:px-6 lg:px-8">
      {/* Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-48 bg-gradient-to-b from-blue-50 to-transparent" />
        <div className="absolute -top-32 -right-32 w-[600px] h-[600px] bg-blue-100 rounded-full blur-3xl opacity-30 animate-pulse" />
        <div className="absolute top-1/2 -left-32 w-[500px] h-[500px] bg-blue-50 rounded-full blur-3xl opacity-30 animate-pulse delay-700" />
      </div>

      <div className="max-w-3xl mx-auto relative">
        {/* Header Section */}
        <div className="flex items-center justify-center space-x-4 mb-8">
          <div className="bg-blue-600 p-3 rounded-xl rotate-3 hover:rotate-6 transition-transform duration-300">
            <PlusIcon className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
            Create Tracking Pixel
          </h2>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-2xl border-2 border-blue-100 shadow-xl hover:shadow-2xl transition-all duration-300">
          <div className="p-8">
            {!pixelToken ? (
              <div className="space-y-6">
                {/* Email Input */}
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Recipient Email
                  </label>
                  <input
                    type="email"
                    value={recipientEmail}
                    onChange={(e) => setRecipientEmail(e.target.value)}
                    className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 focus:border-blue-500 focus:ring-0 transition-colors"
                    required
                  />
                </div>

                {/* Subject Input */}
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Email Subject
                  </label>
                  <input
                    type="text"
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 focus:border-blue-500 focus:ring-0 transition-colors"
                    required
                  />
                </div>

                {/* Category Section */}
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Category
                  </label>
                  <div className="flex space-x-3">
                    <select
                      value={selectedCategoryId || ""}
                      onChange={(e) =>
                        setSelectedCategoryId(
                          e.target.value ? Number(e.target.value) : null
                        )
                      }
                      className="flex-1 border-2 border-gray-100 rounded-xl px-4 py-3 focus:border-blue-500 focus:ring-0 transition-colors"
                    >
                      <option value="">Select Category</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => setShowCategoryInput(true)}
                      className="flex items-center px-4 py-2 text-blue-600 bg-blue-50 rounded-xl hover:bg-blue-100 transition-all duration-300"
                    >
                      <PlusIcon className="w-5 h-5 mr-2" />
                      New
                    </button>
                  </div>
                </div>

                {/* New Category Input */}
                <Transition
                  show={showCategoryInput}
                  enter="transition ease-out duration-200"
                  enterFrom="opacity-0 translate-y-1"
                  enterTo="opacity-100 translate-y-0"
                  leave="transition ease-in duration-150"
                  leaveFrom="opacity-100 translate-y-0"
                  leaveTo="opacity-0 translate-y-1"
                >
                  <div className="bg-blue-50 rounded-xl p-4 space-y-3">
                    <div className="flex space-x-3">
                      <input
                        type="text"
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        placeholder="Enter category name"
                        className="flex-1 border-2 border-blue-100 rounded-xl px-4 py-2 focus:border-blue-500 focus:ring-0 transition-colors"
                      />
                      <button
                        type="button"
                        onClick={handleCreateCategory}
                        className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                      >
                        Add
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowCategoryInput(false)}
                        className="px-4 py-2 bg-white text-gray-600 rounded-xl hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </Transition>

                {/* Notifications Toggle */}
                <div className="bg-blue-50 rounded-xl p-4">
                  <div className="flex items-start space-x-3">
                    <div className="flex items-center h-6">
                      <input
                        type="checkbox"
                        checked={enableNotifications}
                        onChange={(e) =>
                          setEnableNotifications(e.target.checked)
                        }
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-900 font-medium cursor-pointer">
                        Enable Email Notifications
                      </label>
                      <p className="text-gray-600 text-sm mt-1">
                        Get notified when this email is viewed
                      </p>
                    </div>
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm">
                    {error}
                  </div>
                )}

                {/* Generate Button */}
                <button
                  onClick={handleCreatePixel}
                  className="w-full flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-100 hover:shadow-blue-200"
                >
                  <PlusIcon className="w-5 h-5 mr-2" />
                  Generate Tracking Pixel
                </button>
              </div>
            ) : (
              <div className="space-y-8">
                {/* Success Header */}
                <div className="text-center">
                  <div className="mx-auto w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                    <CheckIcon className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                    Your Tracking Pixel is Ready!
                  </h3>
                  <p className="mt-2 text-gray-600">
                    Follow these steps to add it to your email
                  </p>
                  {enableNotifications && (
                    <div className="mt-4 inline-flex items-center px-4 py-2 bg-blue-50 rounded-xl text-blue-700">
                      <BellIcon className="w-5 h-5 mr-2" />
                      Email notifications enabled
                    </div>
                  )}
                </div>

                {/* Gmail Instructions */}
                <div className="bg-blue-50 rounded-xl p-6">
                  <h4 className="font-semibold text-gray-900 mb-4">
                    Instructions for Gmail:
                  </h4>
                  <ol className="space-y-2 text-gray-600">
                    {[
                      "Copy the URL below",
                      "In Gmail, start composing a new email",
                      'Click on the "Insert image" button',
                      'Click on the "Web Address (URL)" tab',
                      "Paste the tracking pixel URL",
                      "Click Insert to add the invisible tracking pixel",
                    ].map((step, index) => (
                      <li key={index} className="flex items-start">
                        <span className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-sm mr-3">
                          {index + 1}
                        </span>
                        {step}
                      </li>
                    ))}
                  </ol>
                </div>

                {/* Tracking URL Section */}
                <div className="space-y-3">
                  <label className="block text-gray-700 font-medium">
                    Tracking Pixel URL
                  </label>
                  <div className="flex rounded-xl border-2 border-gray-100 overflow-hidden group hover:border-blue-200 transition-colors">
                    <input
                      type="text"
                      readOnly
                      value={invisiblePixelUrl}
                      className="flex-1 px-4 py-3 text-gray-600 bg-transparent border-0 focus:ring-0"
                    />
                    <button
                      onClick={() => handleCopy(invisiblePixelUrl)}
                      className="px-4 bg-gray-50 hover:bg-blue-50 border-l-2 border-gray-100 transition-colors group-hover:border-blue-200"
                    >
                      <ClipboardIcon className="w-5 h-5 text-gray-400 group-hover:text-blue-600" />
                    </button>
                  </div>
                </div>

                {/* HTML Snippet Section */}
                <div className="space-y-3">
                  <label className="block text-gray-700 font-medium">
                    HTML Snippet for Other Email Clients
                  </label>
                  <div className="rounded-xl border-2 border-gray-100 overflow-hidden hover:border-blue-200 transition-colors">
                    <textarea
                      readOnly
                      value={imageHtml}
                      rows={3}
                      className="w-full px-4 py-3 text-gray-600 bg-transparent border-0 focus:ring-0"
                    />
                  </div>
                  <button
                    onClick={() => handleCopy(imageHtml)}
                    className="flex items-center px-4 py-2 text-blue-600 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors"
                  >
                    <ClipboardIcon className="w-5 h-5 mr-2" />
                    Copy HTML to Clipboard
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Back Button */}
        <div className="mt-6">
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center px-4 py-2 text-blue-600 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            Back to Dashboard
          </button>
        </div>

        {/* Copy Success Modal */}
        <Transition show={isCopied} as={React.Fragment}>
          <Dialog
            as="div"
            className="fixed inset-0 z-50 overflow-y-auto"
            onClose={() => setIsCopied(false)}
          >
            <div className="flex items-center justify-center min-h-screen p-4">
              <Transition.Child
                as={React.Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <Dialog.Panel className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
              </Transition.Child>

              <Transition.Child
                as={React.Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <div className="relative bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full mx-auto">
                  <div className="text-center">
                    <div className="mx-auto w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                      <ClipboardIcon className="w-6 h-6 text-blue-600" />
                    </div>
                    <Dialog.Title className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                      Copied to clipboard!
                    </Dialog.Title>
                  </div>
                </div>
              </Transition.Child>
            </div>
          </Dialog>
        </Transition>
      </div>
    </div>
  );
};

export default CreatePixel;
