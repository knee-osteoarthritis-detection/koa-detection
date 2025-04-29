import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../styles/home.css";

const HomePage = () => {
  const [imageError, setImageError] = useState(false);

  return (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container-custom">
          <div className="hero-grid">
            <div>
              <h1 className="hero-title">
                Knee Osteoarthritis <span className="hero-title-highlight">Detection</span>
              </h1>
              <p className="hero-description">
                Deep learning model for accurate detection and classification of knee osteoarthritis from X-ray images.
              </p>
              <div className="hero-actions">
                <Link to="/upload" className="btn btn-primary">
                  Try it now
                  <svg className="ml-2" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                </Link>
                <Link to="/about" className="btn btn-outline">
                  Learn more
                </Link>
              </div>
            </div>
            <div className="hero-image-container">
              <div className="hero-image-wrapper">
                <div className="hero-image-blob"></div>
                {!imageError ? (
                  <img 
                    src="/images/home.jpg"
                    alt="Knee X-ray showing lateral and frontal views" 
                    className="hero-image"
                    onError={(e) => {
                      console.error('Error loading image');
                      setImageError(true);
                    }}
                    style={{
                      objectFit: 'cover',
                      maxHeight: '100%',
                      width: 'auto'
                    }}
                  />
                ) : (
                  <div className="hero-image-placeholder">
                    <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 48 48">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 10v28a2 2 0 002 2h32a2 2 0 002-2V10a2 2 0 00-2-2H8a2 2 0 00-2 2zm26 6h4m-4 8h4m-4 8h4M12 16h12m-12 8h12m-12 8h12"/>
                    </svg>
                    <p className="mt-2 text-sm text-gray-500">Unable to load X-ray image</p>
                    <p className="text-xs text-gray-400">Please check if the image is correctly placed in public/images</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Overview Section */}
      <section className="page-section">
        <div className="container-custom">
          <h2 className="section-title text-center">Overview of Knee Osteoarthritis</h2>
          <div className="overview-grid">
            <div className="overview-card">
              <h3 className="section-subtitle">What is Knee Osteoarthritis?</h3>
              <p>
                Knee osteoarthritis (KOA) is a degenerative joint disease where joint tissues break down over time. 
                It is the most common type of arthritis, primarily affecting elderly people. The condition occurs due 
                to cartilage breakdown and can be caused by aging, joint injury, repetitive stress, and in females, 
                menopause.
              </p>
              <p style={{ marginTop: "1rem" }}>
                The condition progressively worsens over time, causing pain, stiffness, and decreased mobility. 
                Early detection is crucial for effective management and treatment planning.
              </p>
            </div>
            
            <div className="overview-card">
              <h3 className="section-subtitle">Why Detection Matters</h3>
              <p>
                Traditional diagnosis of KOA relies on radiologists' expertise to interpret X-rays, which can be 
                subjective and time-consuming. Our AI-powered solution offers:
              </p>
              <ul style={{ listStyleType: "disc", paddingLeft: "1.5rem", marginTop: "0.5rem" }}>
                <li>Faster analysis of knee X-ray images</li>
                <li>Consistent and objective assessment</li>
                <li>Early detection of subtle cartilage changes</li>
                <li>Classification of KOA severity using the Kellgren-Lawrence scale</li>
                <li>Support for healthcare professionals in diagnosis</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works-section page-section">
        <div className="container-custom">
          <h2 className="section-title text-center">How It Works</h2>
          <div className="how-it-works-grid">
            <div className="how-it-works-card">
              <div className="step-number">
                <span className="step-number-text">1</span>
              </div>
              <h3 className="step-title">Upload</h3>
              <p className="step-description">
                Upload a knee X-ray image through our simple interface.
              </p>
            </div>
            
            <div className="how-it-works-card">
              <div className="step-number">
                <span className="step-number-text">2</span>
              </div>
              <h3 className="step-title">Analysis</h3>
              <p className="step-description">
                Our model analyzes the image for signs of osteoarthritis.
              </p>
            </div>
            
            <div className="how-it-works-card">
              <div className="step-number">
                <span className="step-number-text">3</span>
              </div>
              <h3 className="step-title">Results</h3>
              <p className="step-description">
                Receive detailed analysis with severity classification and visual feedback.
              </p>
            </div>
          </div>
          
          <div className="cta-section">
            <Link to="/upload" className="btn btn-primary">
              Try the detection tool
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
