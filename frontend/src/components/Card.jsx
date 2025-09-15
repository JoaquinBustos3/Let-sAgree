import React, { useState, useRef, useEffect } from 'react';
import '../component-styles/Card.css';
import filledHeart from '../images/heart-filled.svg';
import xBubble from '../images/x-bubble.svg';
import { stopPropagationProps } from '../utils/eventHelper';

const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;

/**
 * Card Component
 * 
 * Displays an individual recommendation card with swipeable functionality.
 * This component renders a card with image, description, and metadata based on its category.
 * It supports drag gestures for swiping left/right (dislike/like) and implements
 * visual effects for position, scale, and opacity based on its position in the stack.
 * 
 * @param {Object} props
 * @param {Object} props.data - The card data with category-specific fields
 * @param {number} props.index - The card's index in the overall stack
 * @param {number} props.currentIndex - The index of the currently active card
 * @param {Function} props.onSwipe - Callback function when user swipes (accepts direction)
 * @param {Object} props.category - The category object with slug and icon
 * 
 * @returns {JSX.Element|null} A card component or null if the card is too far from currentIndex
 */
function Card({ data, index, currentIndex, onSwipe, category }) {
  // State for tracking drag movement
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [heartOpacity, setHeartOpacity] = useState(0);
  const [trashOpacity, setTrashOpacity] = useState(0);
  const [isMobileView, setIsMobileView] = useState(window.innerWidth <= 550);
  const startPos = useRef({ x: 0, y: 0 });
  
  // Add window resize listener to detect mobile view
  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth <= 550);
    };
    
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const schemaFieldMap = {
    Restaurants: ["name", "description", "priceRange", "rating", "distance", "location", "cuisine", "vibe", "images", "attribution"],
    Games: ["title", "description", "playerCount", "averagePlaytime", "type", "platform", "difficulty", "vibe", "images", "attribution"],
    "Weekend Trip Ideas": ["destination", "description", "cost", "distance", "lodging", "mainAttractions", "season", "vibe", "images", "attribution"],
    Movies: ["title", "description", "rating", "runtime", "releaseYear", "platform", "genre", "vibe", "images", "attribution"],
    "Delivery": ["name", "description", "priceRange", "rating", "deliveryTime", "deliveryPlatform", "cuisine", "vibe", "images", "attribution"],
    "Indoor Date Activities": ["title", "description", "cost", "duration", "idealTime", "supplies", "messLevel", "vibe", "images", "attribution"],
    "Outdoor Date Activities": ["title", "description", "cost", "duration", "distance", "location", "idealTime", "vibe", "images", "attribution"],
    Shows: ["title", "description", "seasons", "rating", "releaseYear", "platform", "genre", "vibe", "images", "attribution"],
    "Things To Do Nearby": ["name", "description", "price", "rating", "distance", "location", "hours", "vibe", "images", "attribution"]
  };
  const fields = schemaFieldMap[category.slug] || [];
  
  // Threshold for triggering a swipe action (in pixels)
  const SWIPE_THRESHOLD = 100;

  // Calculate position class based on relation to currentIndex
  const getCardPositionClass = () => {
    if (index === currentIndex) return 'card-current';
    if (index < currentIndex && index >= currentIndex - 2) return 'card-previous';
    if (index > currentIndex && index <= currentIndex + 2) return 'card-next';
    return 'card-hidden';
  };
  
  // Calculate distance from current card (for scaling effect)
  const getDistance = () => {
    return Math.abs(index - currentIndex);
  };
  
  // Only render cards that are visible (current and 2 on each side)
  if (getDistance() > 2) {
    return null;
  }
  
  // Calculate horizontal position offset - reduced for tighter packing
  const getXOffset = () => {
    if (index < currentIndex) {
      // Previous cards: reduced offset (-20% for first, -35% for second)
      return -20 * getDistance();
    } else if (index > currentIndex) {
      // Next cards: reduced offset (20% for first, 35% for second)
      return 20 * getDistance();
    }
    return 0; // Current card centered
  };
  
  // Calculate scale factor (current = 100%, first away = 92%, second away = 84%)
  const getScaleFactor = () => {
    return 1 - (getDistance() * 0.05); // Less scaling for better visibility
  };

  // Calculate opacity (current = 100%, first = 75%, second = 40%)
  const getOpacity = () => {
    if (getDistance() === 0) return 1;   // Current card fully visible
    if (getDistance() === 1) return 0.75; // First level slightly transparent
    return 0.25; // Second level very transparent
  };
  
  // Handle start of drag/touch
  const handleDragStart = (e) => {
    if (index !== currentIndex) return; // Only allow dragging the current card

    if (isMobileView && e.type.includes('touch')) {
      e.preventDefault();
      document.body.style.overflow = 'hidden';
    }
    
    setIsDragging(true);
    
    // Handle both mouse and touch events
    const clientX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
    const clientY = e.type.includes('mouse') ? e.clientY : e.touches[0].clientY;
    
    startPos.current = { x: clientX, y: clientY };
  };
  
  // Handle drag/touch movement
  const handleDragMove = (e) => {
    if (!isDragging) return;
    
    // Prevent default scrolling behavior on mobile
    if (isMobileView) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    // Handle both mouse and touch events
    const clientX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
    const clientY = e.type.includes('mouse') ? e.clientY : e.touches[0].clientY;
    
    const deltaX = clientX - startPos.current.x;
    const deltaY = clientY - startPos.current.y;
    
    setDragOffset({ x: deltaX, y: deltaY });
    
    // Calculate heart/x-bubble opacity based on horizontal movement (changed from vertical)
    if (deltaX > 0) {
      // Map deltaX from [0, SWIPE_THRESHOLD] to [0, 1] for heart opacity
      const newOpacity = Math.min(1, Math.abs(deltaX) / SWIPE_THRESHOLD);
      setHeartOpacity(newOpacity);
      setTrashOpacity(0);
    } else if (deltaX < 0) {
      // Map deltaX from [0, -SWIPE_THRESHOLD] to [0, 1] for trash opacity
      const newOpacity = Math.min(1, Math.abs(deltaX) / SWIPE_THRESHOLD);
      setTrashOpacity(newOpacity);
      setHeartOpacity(0);
    } else {
      setHeartOpacity(0);
      setTrashOpacity(0);
    }
  };
  
  // Handle end of drag/touch
  const handleDragEnd = () => {
    if (!isDragging) return;

    if (isMobileView) {
      document.body.style.overflow = '';
    }
    
    // Determine direction and if threshold was met
    if (Math.abs(dragOffset.x) > Math.abs(dragOffset.y)) {
      // Horizontal swipe takes priority for previous/next navigation
      if (Math.abs(dragOffset.x) > SWIPE_THRESHOLD) {
        onSwipe(dragOffset.x > 0 ? 'right' : 'left');
      }
    } else {
      // Vertical swipe for accept/reject
      if (Math.abs(dragOffset.y) > SWIPE_THRESHOLD) {
        onSwipe(dragOffset.y > 0 ? 'down' : 'up');
      }
    }
    
    // Reset heart and trash opacity
    setHeartOpacity(0);
    setTrashOpacity(0);
    
    // Reset state
    setIsDragging(false);
    setDragOffset({ x: 0, y: 0 });
  };
  
  // Additional transform based on drag state
  const getDragStyle = () => {
    if (index !== currentIndex) return {};
    
    return {
      transform: `translateX(${getXOffset() + dragOffset.x}px) 
                 translateY(${dragOffset.y}px)
                 scale(${getScaleFactor()})
                 rotate(${dragOffset.x * 0.05}deg)`,
      transition: isDragging ? 'none' : 'all 0.3s ease',
    };
  };

  const determineAttributionMsg = () => {
    if (!data.attribution) {
      console.log("No attribution data found");
      return "";
    }
    else {

      switch(data.attribution.provider) {
        case "Unsplash":
          return (
          <p>
            Image from{" "}
            <a target="_blank" rel="noopener noreferrer" href={`${data.attribution.link}?utm_source=Let's_Agree&utm_medium=referral`}>
              {data.attribution.author} 
            </a> on{" "}
            <a target="_blank" rel="noopener noreferrer" href="https://unsplash.com?utm_source=Let's_Agree&utm_medium=referral" > 
              {data.attribution.provider}
            </a>
          </p>);
        case "TMDB":
          return (<p>Image provided by <a target="_blank" rel="noopener noreferrer" href={data.attribution.link}>{data.attribution.provider}</a></p>);
        case "Foursquare":
          return (<p>Image provided by <a target="_blank" rel="noopener noreferrer" href={data.attribution.link}>{data.attribution.provider}</a></p>);
        case "RAWG":
          return (<p>Image provided by <a target="_blank" rel="noopener noreferrer" href={data.attribution.link}>{data.attribution.provider}</a></p>);
        default:
          return data.attribution.message;
      }

    }
  }

  return (
    <div 
      className={`card ${getCardPositionClass()} ${isDragging ? 'dragging' : ''}`}
      style={{
        zIndex: 1000 - getDistance(),
        touchAction: isMobileView ? 'none' : 'auto',
        ...(isDragging ? getDragStyle() : {
          transform: `translateX(${getXOffset()}%) scale(${getScaleFactor()})`,
        }),
        opacity: getOpacity(),
      }}
      onMouseDown={index === currentIndex ? handleDragStart : undefined}
      onMouseMove={index === currentIndex ? handleDragMove : undefined}
      onMouseUp={index === currentIndex ? handleDragEnd : undefined}
      onMouseLeave={index === currentIndex ? handleDragEnd : undefined}
      onTouchStart={index === currentIndex ? handleDragStart : undefined}
      onTouchMove={index === currentIndex ? handleDragMove : undefined}
      onTouchEnd={index === currentIndex ? handleDragEnd : undefined}
    >
      <div className="card-content">

        {data[fields[8]] && Array.isArray(data[fields[8]]) && data[fields[8]][0] ? 
          <img 
            className="card-image" 
            src={data[fields[8]][0]} 
            alt="result"
          /> :
          <div className="card-image-fallback">
            <img  
            src={category.icon} 
            alt="result"
          />
          </div>
        }

        {/* Add the liked/disliked indicator overlay here */}
        {
            (data.isLiked && data.isLiked != null) ? 
            (<img 
                src={filledHeart} 
                alt="Liked" 
                className="liked-indicator" 
            />) : (!data.isLiked && data.isLiked != null) ? 
            (<img 
                src={xBubble} 
                alt="Disliked" 
                className="disliked-indicator" 
            />) : <></>
        }
        
        {/* Heart overlay - only visible when being dragged upward */}
        {index === currentIndex && (
          <div 
            className="heart-overlay"
            style={{ opacity: heartOpacity }}
          >
            <img src={filledHeart} alt="Like" />
          </div>
        )}
        
        {/* X Bubble overlay - only visible when being dragged downward */}
        {index === currentIndex && (
          <div 
            className="trash-overlay"
            style={{ opacity: trashOpacity }}
          >
            <img src={xBubble} alt="Dislike" />
          </div>
        )}
        
        <div className="card-text-overlay">
          <h1>{data[fields[0]] ? data[fields[0]].toUpperCase() : ""}</h1>
          <p>{data[fields[1]] ? data[fields[1]] : ""}</p>
        </div>

        <div className="img-attribution">{determineAttributionMsg()}</div>
        <div {...(isMobileView ? stopPropagationProps() : {})} className="card-stats">
          <div>{data[fields[2]] ? data[fields[2]] : ""}</div>
          •
          <div>{data[fields[3]] ? data[fields[3]] : ""}</div>
          •
          <div>{data[fields[4]] ? data[fields[4]] : ""}</div>
        </div>
        <div className='card-second-row'>{data[fields[5]] ? data[fields[5]] : ""}</div>
        <div {...(isMobileView ? stopPropagationProps() : {})} className="card-final-row-info">
          <div>{data[fields[6]] ? data[fields[6]] : ""}</div>
          •
          <div>{data[fields[7]] ? data[fields[7]] : ""}</div>
        </div>
      </div>
    </div>
  );
}

export default Card;

