import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import '../component-styles/CardGeneration.css';
import loadingIcon from '../images/loading.png';
import CardStack from './CardStack';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

function CardGeneration() {
  const location = useLocation();
  const { category, userInput, zipCode } = location.state || {};

  // Persist category slug and user input in sessionStorage
  const [categorySlug, setCategorySlug] = useState(() => {
    return category?.slug || sessionStorage.getItem('categorySlug') || '';
  });
  const [userInputState, setUserInputState] = useState(() => {
    return userInput || sessionStorage.getItem('userInput') || '';
  });
  const [zipCodeState, setZipCodeState] = useState(() => {
    return zipCode || sessionStorage.getItem('zipCode') || '';
  });

  useEffect(() => {
    if (category?.slug) sessionStorage.setItem('categorySlug', category.slug);
    if (userInput) sessionStorage.setItem('userInput', userInput);
    if (zipCode) sessionStorage.setItem('zipCode', zipCode);
  }, [category, userInput, zipCode]);

  const storageKeyCards = `${categorySlug}-${userInputState}-cards`;
  const storageKeyLoaded = `${categorySlug}-${userInputState}-loaded`;

  // Initialize cards from sessionStorage
  const [cards, setCards] = useState(() => {
    const storedCards = sessionStorage.getItem(storageKeyCards);
    return storedCards ? JSON.parse(storedCards) : [];
  });

  const [isLoading, setIsLoading] = useState(cards.length === 0);
  const [hasLoaded, setHasLoaded] = useState(() => {
    if (cards.length > 0) return true;
    return sessionStorage.getItem(storageKeyLoaded) === 'true';
  });

  const [errorMessage, setErrorMessage] = useState('');
  const isFetchingRef = useRef(false);

  const fetchData = async () => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    setIsLoading(true);
    setErrorMessage('');

    try {
      const response = await fetch(`${API_BASE_URL}/prompt-input/${categorySlug}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          input: userInputState,
          zipCode: parseInt(zipCodeState) || 0,
        }),
      });

      if (!response.ok) {
        const message = response.status === 429
          ? 'Sorry, you have more than 5 requests in 24 hours! Contact us for further access.'
          : 'An error occurred while generating your cards!';
        setErrorMessage(message);
        throw new Error(`Failed to fetch cards with status: ${response.status}`);
      }

      const data = await response.json();
      const cardsWithType = data.map(card => ({ ...card, isLiked: null }));
      setCards(cardsWithType);

      try {
        sessionStorage.setItem(storageKeyCards, JSON.stringify(cardsWithType));
        sessionStorage.setItem(storageKeyLoaded, 'true');
      } catch (storageError) {
        console.warn('Failed to save to sessionStorage:', storageError);
      }

      setHasLoaded(true);
    } catch (error) {
      console.error('Error fetching cards:', error.message);
    } finally {
      setIsLoading(false);
      isFetchingRef.current = false;
    }
  };

  useEffect(() => {
    if (cards.length === 0 && !hasLoaded) {
      fetchData();
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && cards.length === 0 && !hasLoaded) {
        fetchData();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [categorySlug, userInputState, zipCodeState, cards.length, hasLoaded]);

  if (isLoading) {
    return (
      <div className="card-generation-container">
        <h1>Finding results...</h1>
        <p>This may take a couple minutes. You can leave and return!</p>
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
      <CardStack cardsReceived={cards} category={category} />
    </div>
  );
}

export default CardGeneration;
