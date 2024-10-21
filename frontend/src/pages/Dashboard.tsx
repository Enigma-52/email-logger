import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

interface View {
  viewedAt: string;
  userAgent: string | null;
  ipAddress: string | null;
}

interface Pixel {
  id: number;
  token: string;
  viewCount: number;
  createdAt: string;
  views: View[];
}

const Dashboard: React.FC = () => {
  const [pixels, setPixels] = useState<Pixel[]>([]);

  useEffect(() => {
    const fetchPixels = async () => {
      try {
        const response = await axios.get("http://localhost:3000/pixel/stats", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setPixels(response.data.pixels);
      } catch (error) {
        console.error("Error fetching pixels:", error);
      }
    };

    fetchPixels();
  }, []);

  return (
    <div>
      <h2>Dashboard</h2>
      <Link to="/create-pixel">Create New Pixel</Link>
      {pixels.map((pixel) => (
        <div key={pixel.id}>
          <h3>Pixel Token: {pixel.token}</h3>
          <p>View Count: {pixel.viewCount}</p>
          <p>Created At: {new Date(pixel.createdAt).toLocaleString()}</p>
          <h4>Recent Views:</h4>
          <ul>
            {pixel.views.slice(0, 5).map((view, index) => (
              <li key={index}>
                Viewed at: {new Date(view.viewedAt).toLocaleString()}
                <br />
                User Agent: {view.userAgent}
                <br />
                IP Address: {view.ipAddress}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

export default Dashboard;
