import React, { useState, useEffect } from "react";
import "./AppCenter.css";

const apps = [
  {
    id: 1,
    name: "AgentDoc",
    description: "AI-powered documentation assistant for real-time collaboration.",
    fullDescription: "AgentDoc is a next-gen documentation tool that integrates AI for seamless collaboration in real time. It supports features like version control, AI-assisted editing, and multi-user collaboration.",
    image: "https://via.placeholder.com/800x400", // Replace with project image URL
    screenshots: ["https://via.placeholder.com/300", "https://via.placeholder.com/300"],
    icon: "📄",
  },
  {
    id: 2,
    name: "HBOS Scheduler",
    description: "Priority-based scheduler implemented in xv6.",
    fullDescription: "HBOS Scheduler is an advanced scheduling algorithm designed for operating systems. It optimizes process handling with priority-based task execution.",
    image: "https://via.placeholder.com/800x400",
    screenshots: ["https://via.placeholder.com/300"],
    icon: "⚙️",
  },
  {
    id: 3,
    name: "Desktop Portfolio",
    description: "Portfolio website emulating a desktop environment.",
    fullDescription: "This project demonstrates a unique desktop-style portfolio using React. Features include window management, taskbar navigation, and app-like interactions.",
    image: "https://via.placeholder.com/800x400",
    screenshots: ["https://via.placeholder.com/300"],
    icon: "🖥️",
  },
];

const AppCenter = () => {
  const [currentApp, setCurrentApp] = useState(null);
  const [carouselIndex, setCarouselIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCarouselIndex((prevIndex) => (prevIndex + 1) % apps.length);
    }, 10000); // Change every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const openApp = (app) => {
    setCurrentApp(app);
  };

  const goBack = () => {
    setCurrentApp(null);
  };

  return (
    <div className="app-center">
      {!currentApp ? (
        <div className="main-page">
          {/* Carousel Section */}
          <div className="carousel">
            <div
              className="carousel-item"
              style={{ backgroundImage: `url(${apps[carouselIndex].image})` }}
            >
              <div className="carousel-content">
                <h2>{apps[carouselIndex].name}</h2>
                <p>{apps[carouselIndex].description}</p>
                <button
                  className="details-button"
                  onClick={() => openApp(apps[carouselIndex])}
                >
                  See details
                </button>
              </div>
            </div>
          </div>

          {/* App List Section */}
          <div className="app-list">
            {apps.map((app) => (
              <div
                key={app.id}
                className="app-item"
                onClick={() => openApp(app)}
              >
                <div className="app-icon">{app.icon}</div>
                <div className="app-info">
                  <h3>{app.name}</h3>
                  <p>{app.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="app-page">
          <button className="back-button" onClick={goBack}>
            ← Back
          </button>
          <h2>{currentApp.name}</h2>
          <p>{currentApp.fullDescription}</p>
          <div className="screenshots">
            {currentApp.screenshots.map((src, index) => (
              <img key={index} src={src} alt={`${currentApp.name} screenshot`} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AppCenter;