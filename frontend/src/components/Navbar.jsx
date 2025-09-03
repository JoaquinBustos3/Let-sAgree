import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import "../component-styles/Navbar.css";
import logo from "../images/logo.svg"; 
import { smoothScrollTo } from "../utils/scrollUtils";

function Navbar({ isBlue }) {
  const navigate = useNavigate(); // Initialize the navigate function
  const [hideAmount, setHideAmount] = useState(0); // 0-1 value for partial hiding
  const [lastScrollY, setLastScrollY] = useState(0);

  // Make Navbar hide on scroll down and show on scroll up
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const scrollThreshold = 200; // Amount of scroll before fully hiding
      
      // Always fully show navbar when at or very near the top of the page
      if (currentScrollY <= 20) {
        setHideAmount(0);
      } else if (currentScrollY > lastScrollY) {
        // Scrolling down - gradually hide based on scroll amount
        const newHideAmount = Math.min(1, currentScrollY / scrollThreshold);
        setHideAmount(newHideAmount);
      } else {
        // Scrolling up - gradually show
        // For faster response when scrolling up quickly, decrease more aggressively
        const decreaseAmount = currentScrollY < 100 ? 0.2 : 0.1;
        const newHideAmount = Math.max(0, hideAmount - decreaseAmount);
        setHideAmount(newHideAmount);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY, hideAmount]);

  // Use Utils function for smooth scrolling to sections
  const handleNavLinkClick = (e, target) => {
    e.preventDefault();
    smoothScrollTo(target, 1500, navigate); // Pass the navigate function to smoothScrollTo
  };

  return (
    <nav 
      className={isBlue ? "navbar blue" : "navbar"} 
      style={{ 
        transform: `translateY(-${hideAmount * 100}%)` 
      }}
    >
      <div onClick={() => navigate('/')} className="navbar-left">
        <img src={logo} alt="Logo" className="logo-image" /> 
      </div>
      <div className="navbar-right">
        <a 
          href="#categories" 
          className="navbar-link"
          onClick={(e) => handleNavLinkClick(e, '.categories-container')}
        >
          Categories
        </a>
        <a 
          href="#faq" 
          className="navbar-link"
          onClick={(e) => handleNavLinkClick(e, '.faq-container')}
        >
          FAQ
        </a>
        <div className="beta-box">Beta</div>
      </div>
    </nav>
  );
}

export default Navbar;
