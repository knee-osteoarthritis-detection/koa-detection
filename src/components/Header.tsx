
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "../styles/header.css";

const navItems = [
  { name: "Home", path: "/" },
  { name: "About", path: "/about" },
  { name: "Implementation", path: "/implementation" },
  { name: "Upload", path: "/upload" },
  { name: "Our Team", path: "/team" },
];

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  
  const toggleMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <header className="header">
      <div className="container-custom header-container">
        <div>
          <Link to="/" className="logo">
            <span className="logo-text-bold">KOA</span>
            <span className="logo-text-light">Detect</span>
          </Link>
        </div>
        
        {/* Desktop navigation */}
        <div className="desktop-nav">
          {navItems.map((item) => (
            <Link key={item.path} to={item.path} className="nav-link">
              <button 
                className={
                  location.pathname === item.path 
                    ? "nav-button nav-button-active" 
                    : "nav-button"
                }
              >
                {item.name}
              </button>
            </Link>
          ))}
        </div>
        
        {/* Mobile menu button */}
        <div>
          <button className="mobile-menu-button" onClick={toggleMenu}>
            {mobileMenuOpen ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            )}
          </button>
        </div>
      </div>
      
      {/* Mobile navigation */}
      {mobileMenuOpen && (
        <div className="container-custom">
          <div className="mobile-nav">
            {navItems.map((item) => (
              <Link 
                key={item.path} 
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={
                  location.pathname === item.path
                    ? "mobile-nav-link mobile-nav-link-active"
                    : "mobile-nav-link"
                }
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
