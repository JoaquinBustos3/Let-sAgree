import React, { useState, useRef } from 'react';
import Card from './Card';
import '../component-styles/CardStack.css';

function CardStack({ cards }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [swipeDirection, setSwipeDirection] = useState(null);
  const startX = useRef(0);
  const startY = useRef(0);

  const handleTouchStart = (e) => {
    startX.current = e.touches[0].clientX;
    startY.current = e.touches[0].clientY;
  };
  
  const handleTouchMove = (e) => {
    if (!startX.current || !startY.current) return;
    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    const diffX = currentX - startX.current;
    const diffY = currentY - startY.current;
    
    if (Math.abs(diffX) > 50) {
      setSwipeDirection(diffX > 0 ? 'right' : 'left');
    } else if (Math.abs(diffY) > 50) {
      setSwipeDirection(diffY > 0 ? 'down' : 'up');
    }
  };
  
  const handleTouchEnd = () => {
    if (swipeDirection) {
      handleSwipe(swipeDirection);
    }
    startX.current = 0;
    startY.current = 0;
    setSwipeDirection(null);
  };
  
  const handleSwipe = (direction) => {
    switch(direction) {
      case 'left':
        // Next card
        if (currentIndex < cards.length - 1) {
          setCurrentIndex(currentIndex + 1);
        }
        break;
        
      case 'right':
        // Previous card
        if (currentIndex > 0) {
          setCurrentIndex(currentIndex - 1);
        }
        break;
        
      case 'up':
        // Accept current card
        console.log(`Card accepted: ${cards[currentIndex]?.name || cards[currentIndex]?.title}`);
        // If last card, do nothing; otherwise move to next
        if (currentIndex < cards.length - 1) {
          setCurrentIndex(currentIndex + 1);
        }
        break;
        
      case 'down':
        // Reject current card
        console.log(`Card rejected: ${cards[currentIndex]?.name || cards[currentIndex]?.title}`);
        // If last card, do nothing; otherwise move to next
        if (currentIndex < cards.length - 1) {
          setCurrentIndex(currentIndex + 1);
        }
        break;
    }
  };
  
  if (!cards || cards.length === 0) {
    return <div className="no-cards">No cards available</div>;
  }

  // Calculate visible range for improved performance
  const startIdx = Math.max(0, currentIndex - 2);
  const endIdx = Math.min(cards.length - 1, currentIndex + 2);
  const visibleCards = cards.slice(startIdx, endIdx + 1);

  return (
    <div className="card-stack">
      {/* Render all cards but only the ones close to current index will be visible */}
      {cards.map((card, index) => (
        <Card 
          key={index}
          data={card}
          index={index}
          currentIndex={currentIndex}
          onSwipe={handleSwipe}
        />
      ))}
      
      <div className="stack-indicator">
        {currentIndex + 1} of {cards.length}
      </div>
    </div>
  );
}

export default CardStack;
