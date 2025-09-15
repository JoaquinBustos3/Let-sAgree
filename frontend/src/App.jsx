import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import './App.css';
import Navbar from './components/Navbar.jsx';
import Description from './components/Description.jsx';
import Categories from './components/Categories.jsx';
import InputPrompt from './components/InputPrompt.jsx';
import CardGeneration from './components/CardGeneration.jsx';
import FAQ from './components/FAQ.jsx';
import Footer from './components/Footer.jsx';

/**
 * App Component
 * 
 * Root component that handles routing and layout for the entire application.
 * Features:
 * - Three main routes: home, category input, and card generation
 * - Scroll-based opacity animation for description
 * - Consistent navigation and footer across routes
 * - Theme variants for different pages (blue/default navbar)
 * 
 * Routes:
 * - / : Home page with description, categories, and FAQ
 * - /category/:categoryName : Input preferences for selected category
 * - /card-generation : Display and interact with generated cards
 * 
 * @returns {JSX.Element} Root application component with routing
 */
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

        {/* Card generation route */}
        <Route path="/card-generation" element={
          <div className="root-background card-generation-page">
            <Navbar 
            isBlue={false}
            />
            <CardGeneration />
            <Footer />
          </div>
        } />
      </Routes>
    </Router>
  );
}

export default App;
