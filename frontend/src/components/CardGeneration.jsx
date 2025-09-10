import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import '../component-styles/CardGeneration.css';
import loadingIcon from '../images/loading.png';
import CardStack from './CardStack';

function CardGeneration() {
  const location = useLocation();
  const { category, userInput, zipCode } = location.state || {};
  
  // Initialize cards from sessionStorage and set loading state appropriately
  const [cards, setCards] = useState(() => {
    // Try to load cards from sessionStorage
    const storageKey = `${category}-${userInput}-cards`;
    const storedCards = sessionStorage.getItem(storageKey);
    
    if (storedCards) {
      console.log("Found cached cards in sessionStorage");
      return JSON.parse(storedCards);
    }
    return [];
  });
  
  // Only set isLoading to true if we don't have cards yet
  const [isLoading, setIsLoading] = useState(cards.length === 0);

  // Track if the API call has been made - use sessionStorage to persist across refreshes
  const [hasLoaded, setHasLoaded] = useState(() => {
    // If we already have cards, consider it loaded
    if (cards.length > 0) return true;
    
    // Otherwise check if we've already loaded this category+input combination
    const storageKey = `${category}-${userInput}-loaded`;
    return sessionStorage.getItem(storageKey) === 'true';
  });

  useEffect(() => {
    // Skip API call if we already have cards or if we've already loaded
    if (cards.length > 0 || hasLoaded) {
      console.log("Using cached data - skipping API call");
      // Ensure loading is set to false even when using cached data
      setIsLoading(false);
      return;
    }
    
    const fetchData = async () => {
      try {
        // Only set loading state if we don't have cards yet
        if (cards.length === 0) {
          setIsLoading(true);
        }
        // Make a real API call to your backend
        const response = await fetch(`/prompt-input/${category}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            input: userInput,
            zipCode: parseInt(zipCode) || 0,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to fetch cards');
        }

        const data = await response.json();
        //include category type in each card
        const cardsWithType = data.map(card => ({
            ...card,
            isLiked: null
        }))
        setCards(cardsWithType);
        
        // Save cards to sessionStorage
        try {
          sessionStorage.setItem(`${category}-${userInput}-cards`, JSON.stringify(cardsWithType));
          // Mark as loaded
          sessionStorage.setItem(`${category}-${userInput}-loaded`, 'true');
        } catch (storageError) {
          console.warn('Failed to save to sessionStorage:', storageError);
        }
        
        setHasLoaded(true);
        console.log('Fetched cards:', JSON.stringify(cardsWithType));
      } catch (error) {
        console.error('Error fetching cards:', error.message);
        // Provide fallback data for testing
        setCards([
          { name: 'Longer Name Card 1', description: 'Description for card 1', priceRange: '$$', rating: '4.4 stars', distance: '4.3 mi', location: '123 Main St, City, State', cuisine: 'Italian', vibe: 'fancy, cool', type: "Restaurants", isLiked: null },
          { name: 'Longer Longer Name Card 2', description: 'Actually long description for card 2 that describes the item more clearly more more mroe more more more ', priceRange: '$', rating: '4.0 stars', distance: '2.1 mi', location: '456 Elm St, City, State', cuisine: 'Mexican, Latino', vibe: 'casual, vibrant, epic, awesome, more awesome', type: "Restaurants", isLiked: null },
          { name: 'Card 3', description: 'Description for card 3', priceRange: '$$$', rating: '4.8 stars', distance: '3.5 mi', location: '789 Oak St, City, State', cuisine: 'Japanese', vibe: 'elegant, serene', type: "Restaurants", isLiked: null },
          { name: 'Card 4', description: 'Description for card 4', priceRange: '$$', rating: '4.4 stars', distance: '4.3 mi', location: '123 Main St, City, State', cuisine: 'Italian', vibe: 'fancy, cool', type: "Restaurants", isLiked: null },
          { name: 'Card 5', description: 'Description for card 5', priceRange: '$', rating: '4.0 stars', distance: '2.1 mi', location: '456 Elm St, City, State', cuisine: 'Mexican', vibe: 'casual, vibrant', type: "Restaurants", isLiked: null },
          { name: 'Card 6', description: 'Description for card 6', priceRange: '$$$', rating: '4.8 stars', distance: '3.5 mi', location: '789 Oak St, City, State', cuisine: 'Japanese', vibe: 'elegant, serene', type: "Restaurants", isLiked: null },
          { name: 'Card 7', description: 'Description for card 7', priceRange: '$$', rating: '4.4 stars', distance: '4.3 mi', location: '123 Main St, City, State', cuisine: 'Italian', vibe: 'fancy, cool', category: "Restaurants", isLiked: null },
          { name: 'Card 8', description: 'Description for card 8', priceRange: '$', rating: '4.0 stars', distance: '2.1 mi', location: '456 Elm St, City, State', cuisine: 'Mexican', vibe: 'casual, vibrant', category: "Restaurants", isLiked: null },
          { name: 'Card 9', description: 'Description for card 9', priceRange: '$$$', rating: '4.8 stars', distance: '3.5 mi', location: '789 Oak St, City, State', cuisine: 'Japanese', vibe: 'elegant, serene', category: "Restaurants", isLiked: null },
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [category, userInput, zipCode, cards.length, hasLoaded]);

  if (isLoading) {
    return (
      <div className="card-generation-container">
        <h1>Finding results...</h1>
        <p>This may take a couple minutes. Please stay with us.</p>
        <img className="category-loading-icon" src={loadingIcon} alt="loading icon" />
      </div>
    );
  }

  return (
    <div className="card-generation-container">
      <CardStack 
      cardsReceived={cards} 
      category={category}
      />
    </div>
  );
}

export default CardGeneration;
