import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import './App.css';
import Navbar from './components/Navbar.jsx';
import Description from './components/Description.jsx';
import Categories from './components/Categories.jsx';
import InputPrompt from './components/InputPrompt.jsx';
import FAQ from './components/FAQ.jsx';
import Footer from './components/Footer.jsx';

function App() {
  const [descriptionOpacity, setDescriptionOpacity] = useState(1);

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
    <Router>
      <Routes>
        {/* Home route */}
        <Route path="/" element={
          <div className="root-background">
            <Navbar 
            isBlue={false}
            />
            <div className="description-wrapper" style={{ opacity: descriptionOpacity }}>
              <Description />
            </div>
            <Categories />
            <FAQ />
            <Footer />
          </div>
        } />
        
        {/* Category routes */}
        <Route path="/category/:categoryName" element={
          <div className="root-background prompt-page">
            <Navbar 
            isBlue={true}
            />
            <InputPrompt />
            <Footer />
          </div>
        } />
      </Routes>
    </Router>
  );
}

export default App;
