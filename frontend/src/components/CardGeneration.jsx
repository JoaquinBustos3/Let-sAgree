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
    const storageKey = `${category.slug}-${userInput}-cards`;
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
    const storageKey = `${category.slug}-${userInput}-loaded`;
    return sessionStorage.getItem(storageKey) === 'true';
  });

 const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    // Skip API call if we already have cards or if we've already loaded
    if (cards.length > 0 || hasLoaded) {
      console.log("Using cached data, skipping API call.");
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
        const response = await fetch(`/prompt-input/${category.slug}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            input: userInput,
            zipCode: parseInt(zipCode) || 0,
          }),
        });

        if (!response.ok) {
          const message = response.status === 429 ? 'Sorry, you have more than 5 requests in 24 hours! Contact us for further access.' : 'An error occurred while generating your cards!';
          setErrorMessage(message);
          const error = new Error('Failed to fetch cards with status: ' + response.status);
          error.status = response.status;
          throw error;
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
          sessionStorage.setItem(`${category.slug}-${userInput}-cards`, JSON.stringify(cardsWithType));
          // Mark as loaded
          sessionStorage.setItem(`${category.slug}-${userInput}-loaded`, 'true');
        } catch (storageError) {
          console.warn('Failed to save to sessionStorage:', storageError);
        }
        
        setHasLoaded(true);
      } catch (error) {
        console.error('Error fetching cards: ', error.message);
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

  if (errorMessage) {
    return (
      <div className="card-generation-container">
        <h1>{errorMessage}</h1>
        <p>Please click the logo and return to the main menu.</p>
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
