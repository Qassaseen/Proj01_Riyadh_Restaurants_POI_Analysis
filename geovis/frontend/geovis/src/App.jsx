import React, { useState } from "react";

import Sidebar from "./components/Sidebar";
import MapComponent from "./components/MapComponent";

export default function App() {
  const [theme, setTheme] = useState("light");
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("http://localhost:5000/restaurants");
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const jsonData = await response.json();
      setData(jsonData);
    } catch (error) {
      console.error("Error fetching data:", error);
      alert("Failed to load data from backend. Make sure server.py is running.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      <Sidebar
        theme={theme}
        setTheme={setTheme}
        onLoadData={fetchData}
        data={data}
        isLoading={isLoading}
      />
      <MapComponent theme={theme} data={data} />
    </div>
  );
}
