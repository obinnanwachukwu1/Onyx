// @ts-nocheck
import React, { useState, useEffect, useRef } from "react";
import "./AppCenter.css";
import LoadingScreen from "../../Components/LoadingScreen/LoadingScreen";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFaceFrown } from '@fortawesome/free-regular-svg-icons';
import { faChevronLeft, faStar, faCalendarAlt, faCode, faDownload, faChevronRight, faSearch, faRefresh } from "@fortawesome/free-solid-svg-icons";

const AppCenter = () => {
  const [apps, setApps] = useState([]);
  const [currentApp, setCurrentApp] = useState(null);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionType, setTransitionType] = useState(""); // "to-detail" or "to-main"
  const containerRef = useRef(null)
  const [landingScrollPos, setLandingScrollPos] = useState(0);

  useEffect(() => {
    fetch('/projects/project_list.json', { cache: 'no-cache' })
      .then(response => {
        if (!response.ok) throw new Error('Failed to fetch projects');
        return response.json();
      })
      .then(data => {
        setApps(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [loading]);

  useEffect(() => {
    if (apps.length === 0) return;
    const interval = setInterval(() => {
      setCarouselIndex((prevIndex) => (prevIndex + 1) % apps.length);
    }, 10000);
    return () => clearInterval(interval);
  }, [apps]);

  const openApp = (app) => {
    setTransitionType("to-detail");
    setIsTransitioning(true);
    
    // Delay setting the current app to allow animation to start
    setTimeout(() => {
      setCurrentApp(app);
      window.scrollTo(0, 0);
      
      // End the transition after animation completes
      setTimeout(() => {
        setIsTransitioning(false);
      }, 300);
    }, 300);
  };

  const goBack = () => {
    setTransitionType("to-main");
    setIsTransitioning(true);
    
    // Delay clearing the current app to allow animation to start
    setTimeout(() => {
      setCurrentApp(null);
      
      // End the transition after animation completes
      setTimeout(() => {
        setIsTransitioning(false);
      }, 300);
    }, 300);
  };

  const nextCarouselSlide = () => {
    setCarouselIndex((prevIndex) => (prevIndex + 1) % apps.length);
  };

  const prevCarouselSlide = () => {
    setCarouselIndex((prevIndex) => (prevIndex === 0 ? apps.length - 1 : prevIndex - 1));
  };

  const getCategories = () => {
    if (!apps.length) return ["All"];
    const categories = apps.map(app => app.category).filter(Boolean);
    return ["All", ...new Set(categories)];
  };

  const filteredApps = apps.filter(app => {
    const matchesSearch = app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "All" || app.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const featuredApps = apps.filter(app => app.featured);

  // Add a function to handle image load errors
  const handleImageError = (e) => {
    e.target.parentNode.style.backgroundColor = '#0066cc';
  }

  return (
    <div className="app-center">
      {loading ? (
        <LoadingScreen />
      ) : error ? (
        <div className="error-state">
          <div className="error-icon">
            <FontAwesomeIcon icon={faFaceFrown} size="3x" />
          </div>
          <h2>Something Went Wrong</h2>
          <p>We're having trouble loading the App Center right now.</p>
          <p className="error-code">Error: {error}</p>
          <button className="app-primary-button" onClick={() => window.location.reload()}>
            Try Again
          </button>
        </div>
      ) : (
        <div ref={containerRef} className="app-center-container">
          <div className={`app-center-main ${currentApp ? 'hidden' : 'visible'} ${
            isTransitioning && transitionType === "to-detail" ? 'fade-out' : 
            isTransitioning && transitionType === "to-main" ? 'fade-in' : ''
          }`}>
            <header className="app-center-header">
              <h1>App Center</h1>
              <div className="app-center-header-buttons">
                <FontAwesomeIcon icon={faRefresh} className="refresh-icon" onClick={() => {setLoading(true)}}/>
                <div className="app-center-search">
                  <div className="search-input-container">
                    <FontAwesomeIcon icon={faSearch} className="search-icon" />
                    <input 
                      type="text" 
                      placeholder="Search apps..." 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </header>
            
            {/* Featured Carousel Section with Error Handling */}
            {apps.length > 0 && searchTerm.length === 0 && (
              <div className="app-featured-section">
                <h2 className="section-heading">Featured</h2>
                <div className="featured-carousel-container">
                  <button className="carousel-nav prev" onClick={prevCarouselSlide}>
                    <FontAwesomeIcon icon={faChevronLeft} />
                  </button>
                  <div className="featured-carousel">
                    <div
                      className="featured-item"
                      style={{ 
                        backgroundImage: apps[carouselIndex].image ? `url(${apps[carouselIndex].image})` : 'none',
                        backgroundColor: apps[carouselIndex].image ? 'transparent' : '#0066cc'
                      }}
                    >
                      <div className="featured-content">
                        <span className="featured-badge">Featured App</span>
                        <h2>{apps[carouselIndex].name}</h2>
                        <p>{apps[carouselIndex].description}</p>
                        <button
                          className="app-primary-button"
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent bubbling
                            openApp(apps[carouselIndex]);
                          }}
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                    <div className="carousel-indicators">
                      {apps.slice(0, Math.min(5, apps.length)).map((_, idx) => (
                        <span 
                          key={idx} 
                          className={`indicator ${idx === carouselIndex ? 'active' : ''}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setCarouselIndex(idx);
                          }}
                        />
                      ))}
                    </div>
                  </div>
                  <button className="carousel-nav next" onClick={nextCarouselSlide}>
                    <FontAwesomeIcon icon={faChevronRight} />
                  </button>
                </div>
              </div>
            )}

            {/* Category Navigation */}
            <div className="category-navigation">
              <div className="category-scroll">
                {getCategories().map(category => (
                  <button 
                    key={category}
                    className={`category-button ${selectedCategory === category ? 'active' : ''}`}
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
  
            {/* App Grid Section */}
            <div className="app-grid-section">
              <h2 className="section-heading">
                {selectedCategory === "All" ? "All Apps" : selectedCategory}
                {searchTerm && ` • Search results for "${searchTerm}"`}
              </h2>
              
              {filteredApps.length === 0 ? (
                <div className="no-results">
                  <FontAwesomeIcon icon={faSearch} size="3x" />
                  <h3>No apps found</h3>
                  <p>Try adjusting your search or filters</p>
                </div>
              ) : (
                <div className="app-grid">
                  {filteredApps.map((app) => (
                    <div
                      key={app.id}
                      className="app-card"
                      onClick={() => openApp(app)}
                    >
                      <img className="app-card-icon" src={app.icon}/>
                      <div className="app-card-content">
                        <h3 className="app-card-title">{app.name}</h3>
                        <p className="app-card-category">{app.category || "Application"}</p>
                        <p className="app-card-description">{app.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <div className={`app-detail-page ${!currentApp ? 'hidden' : 'visible'} ${
            isTransitioning && transitionType === "to-detail" ? 'fade-in' : 
            isTransitioning && transitionType === "to-main" ? 'fade-out' : ''
          }`}>
            <div className="app-detail-header">
              <button className="app-center-back-button" onClick={goBack}>
                <FontAwesomeIcon icon={faChevronLeft} />
                <span>Back to Apps</span>
              </button>
            </div>
            
            {currentApp && (
              <div className="app-detail-content">
                <div className="app-detail-hero">
                  <div className="app-detail-icon-container">
                    <div className="app-detail-icon">
                      {currentApp.icon && <img src={currentApp.icon} className="app-icon-large"/>}
                    </div>
                  </div>
                  
                  <div className="app-detail-info">
                    <h1 className="app-detail-name">{currentApp.name}</h1>
                    <div className="app-detail-meta">
                      <span className="app-detail-category">{currentApp.category || 'Application'}</span>
                      {currentApp.tags && (
                        <div className="app-detail-tags">
                          {currentApp.tags.map((tag, idx) => (
                            <span key={idx} className="app-tag">{tag}</span>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <div className="app-action-buttons">
                      {currentApp.canTry && (
                        <button className="app-primary-button" onClick={() => window.open(currentApp.trial)}>
                          <FontAwesomeIcon icon={faDownload} /> Try Now
                        </button>
                      )}
                      {currentApp.github && (
                        <button className="app-secondary-button" onClick={() => window.open(currentApp.github)}>
                          <FontAwesomeIcon icon={faCode} /> View Source
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="app-screenshots-section">
                  <h3 className="section-title">Screenshots</h3>
                  <div className="app-screenshots-gallery">
                    {currentApp.screenshots.map((src, index) => (
                      <div key={index} className="screenshot-item">
                        <img src={src} alt={`${currentApp.name} screenshot ${index + 1}`} />
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="app-description-section">
                  <h3 className="section-title">About this project</h3>
                  <div className="app-description">
                    <p>{currentApp.fullDescription}</p>
                  </div>
                  
                  <div className="app-additional-info">
                    <div className="info-item">
                      <FontAwesomeIcon icon={faCalendarAlt} />
                      <span>Released: {currentApp.releaseDate || 'N/A'}</span>
                    </div>
                    {currentApp.technologies && (
                      <div className="info-item">
                        <FontAwesomeIcon icon={faCode} />
                        <span>Built with: {currentApp.technologies.join(', ')}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AppCenter;
