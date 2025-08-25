import React, { useEffect, useState, useRef } from "react";
import './App.css';
import Navbar from './components/Navbar.jsx';
import Description from './components/Description.jsx';
import Categories from './components/Categories.jsx';
import Footer from './components/Footer.jsx';

function App() {
  const [descriptionOpacity, setDescriptionOpacity] = useState(1);
  const descriptionRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const windowHeight = window.innerHeight;
      
      // Calculate opacity based on scroll position
      // Description should be fully transparent by the time user scrolls 30% of viewport height
      const opacity = Math.max(0, 1 - (scrollPosition / (windowHeight * 0.3)));
      setDescriptionOpacity(opacity);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div className="root-background">
      <Navbar />
      <div 
        ref={descriptionRef}
        className="description-wrapper"
        style={{ opacity: descriptionOpacity }}
      >
        <Description />
      </div>
      <Categories />
      <Footer />
    </div>
  );
}

export default App;
