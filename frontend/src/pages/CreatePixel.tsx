import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

// Replace this with your ngrok URL when testing, and with your actual server URL in production
const API_BASE_URL = "https://9547-103-51-148-131.ngrok-free.app"; // Replace with your ngrok URL

const CreatePixel: React.FC = () => {
  const [pixelToken, setPixelToken] = useState("");
  const navigate = useNavigate();

  const handleCreatePixel = async () => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/pixel/create`,
        {},
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setPixelToken(response.data.pixelToken);
    } catch (error) {
      console.error("Error creating pixel:", error);
    }
  };

  const invisiblePixelUrl = `${API_BASE_URL}/pixel/invisible/${pixelToken}.jpg`;

  const imageHtml = `<img src="${invisiblePixelUrl}" alt="" width="1" height="1" style="display:none;" />`;

  return (
    <div>
      <h2>Create Pixel</h2>
      <button onClick={handleCreatePixel}>Generate Pixel</button>
      {pixelToken && (
        <div>
          <p>Your tracking pixel has been created. Here's how to use it:</p>

          <h3>Instructions for Gmail:</h3>
          <ol>
            <li>
              Copy this URL:{" "}
              <input
                type="text"
                readOnly
                value={invisiblePixelUrl}
                style={{ width: "100%" }}
              />
            </li>
            <li>In Gmail, start composing a new email</li>
            <li>
              Click on the "Insert image" button (it looks like a picture)
            </li>
            <li>In the popup, click on the "Web Address (URL)" tab</li>
            <li>
              Paste the tracking pixel URL in the "Paste an image URL here:"
              field
            </li>
            <li>
              Click "Insert" to add the invisible tracking pixel to your email
            </li>
          </ol>

          <button
            onClick={() => navigator.clipboard.writeText(invisiblePixelUrl)}
          >
            Copy URL to Clipboard
          </button>

          <h3>For other email clients (HTML insertion):</h3>
          <p>
            If your email client supports HTML insertion, you can use this HTML
            snippet:
          </p>
          <textarea
            readOnly
            value={imageHtml}
            style={{ width: "100%", height: "100px" }}
          />
          <button onClick={() => navigator.clipboard.writeText(imageHtml)}>
            Copy HTML to Clipboard
          </button>
        </div>
      )}
      <button onClick={() => navigate("/dashboard")}>Back to Dashboard</button>
    </div>
  );
};

export default CreatePixel;
