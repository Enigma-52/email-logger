import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  ClipboardDocumentIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";
import { Dialog, Transition } from "@headlessui/react";

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL;

const CreatePixel: React.FC = () => {
  const [recipientEmail, setRecipientEmail] = useState("");
  const [emailSubject, setEmailSubject] = useState("");
  const [pixelToken, setPixelToken] = useState("");
  const [isCopied, setIsCopied] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleCreatePixel = async () => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/pixel/create`,
        { recipientEmail, emailSubject },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
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
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-8">
          Create Tracking Pixel
        </h2>
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            {!pixelToken ? (
              <div className="space-y-6">
                <div>
                  <label
                    htmlFor="recipient-email"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Recipient Email
                  </label>
                  <input
                    type="email"
                    id="recipient-email"
                    value={recipientEmail}
                    onChange={(e) => setRecipientEmail(e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="email-subject"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Email Subject
                  </label>
                  <input
                    type="text"
                    id="email-subject"
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    required
                  />
                </div>
                {error && <div className="text-red-600 text-sm">{error}</div>}
                <button
                  onClick={handleCreatePixel}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Generate Pixel
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Your tracking pixel has been created
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Follow the instructions below to use it in your emails.
                  </p>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-900">
                    Instructions for Gmail:
                  </h4>
                  <ol className="mt-2 list-decimal list-inside text-sm text-gray-600 space-y-1">
                    <li>Copy the URL below</li>
                    <li>In Gmail, start composing a new email</li>
                    <li>
                      Click on the "Insert image" button (it looks like a
                      picture)
                    </li>
                    <li>In the popup, click on the "Web Address (URL)" tab</li>
                    <li>
                      Paste the tracking pixel URL in the "Paste an image URL
                      here:" field
                    </li>
                    <li>
                      Click "Insert" to add the invisible tracking pixel to your
                      email
                    </li>
                  </ol>
                </div>

                <div>
                  <label
                    htmlFor="pixel-url"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Tracking Pixel URL
                  </label>
                  <div className="mt-1 flex rounded-md shadow-sm">
                    <input
                      type="text"
                      name="pixel-url"
                      id="pixel-url"
                      readOnly
                      value={invisiblePixelUrl}
                      className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-l-md focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300"
                    />
                    <button
                      type="button"
                      onClick={() => handleCopy(invisiblePixelUrl)}
                      className="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 rounded-r-md bg-gray-50 text-gray-500 text-sm hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <ClipboardDocumentIcon
                        className="h-5 w-5"
                        aria-hidden="true"
                      />
                    </button>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-900">
                    For other email clients (HTML insertion):
                  </h4>
                  <p className="mt-1 text-sm text-gray-500">
                    If your email client supports HTML insertion, you can use
                    this HTML snippet:
                  </p>
                  <div className="mt-2">
                    <textarea
                      readOnly
                      value={imageHtml}
                      rows={3}
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border border-gray-300 rounded-md"
                    />
                  </div>
                  <div className="mt-2">
                    <button
                      type="button"
                      onClick={() => handleCopy(imageHtml)}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      <ClipboardDocumentIcon
                        className="-ml-0.5 mr-2 h-4 w-4"
                        aria-hidden="true"
                      />
                      Copy HTML to Clipboard
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6">
          <button
            onClick={() => navigate("/dashboard")}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <ArrowLeftIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            Back to Dashboard
          </button>
        </div>
      </div>

      <Transition show={isCopied} as={React.Fragment}>
        <Dialog
          as="div"
          className="fixed inset-0 z-10 overflow-y-auto"
          onClose={() => setIsCopied(false)}
        >
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <Transition.Child
              as={React.Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Dialog.Panel className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
            </Transition.Child>

            <span
              className="hidden sm:inline-block sm:align-middle sm:h-screen"
              aria-hidden="true"
            >
              &#8203;
            </span>
            <Transition.Child
              as={React.Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-sm sm:w-full sm:p-6">
                <div>
                  <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                    <ClipboardDocumentIcon
                      className="h-6 w-6 text-green-600"
                      aria-hidden="true"
                    />
                  </div>
                  <div className="mt-3 text-center sm:mt-5">
                    <Dialog.Title
                      as="h3"
                      className="text-lg leading-6 font-medium text-gray-900"
                    >
                      Copied to clipboard!
                    </Dialog.Title>
                  </div>
                </div>
              </div>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
};

export default CreatePixel;
