import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import '../component-styles/CardGeneration.css';
import loadingIcon from '../images/loading.png';
import CardStack from './CardStack';

function CardGeneration() {
  const location = useLocation();
  const { category, userInput, zipCode } = location.state || {};
  const [isLoading, setIsLoading] = useState(true);
  const [cards, setCards] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        await new Promise((resolve) => setTimeout(resolve, 2000));
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
            type: category,
            isLiked: null
        }))
        setCards(cardsWithType);
      } catch (error) {
        console.error('Error fetching cards:', error);
        // Provide fallback data for testing
        setCards([
          { name: 'Longer Name Card 1', description: 'Description for card 1', priceRange: '$$', rating: '4.4 stars', distance: '4.3 mi', location: '123 Main St, City, State', cuisine: 'Italian', vibe: 'fancy, cool', type: "Restaurants", isLiked: null },
          { name: 'Longer Longer Name Card 2', description: 'Actually long description for card 2 that describes the item more clearly more more mroe more more more ', priceRange: '$', rating: '4.0 stars', distance: '2.1 mi', location: '456 Elm St, City, State', cuisine: 'Mexican, Latino', vibe: 'casual, vibrant, epic, awesome, more awesome', type: "Restaurants", isLiked: null },
          { name: 'Card 3', description: 'Description for card 3', priceRange: '$$$', rating: '4.8 stars', distance: '3.5 mi', location: '789 Oak St, City, State', cuisine: 'Japanese', vibe: 'elegant, serene', type: "Restaurants", isLiked: null },
          { name: 'Card 4', description: 'Description for card 4', priceRange: '$$', rating: '4.4 stars', distance: '4.3 mi', location: '123 Main St, City, State', cuisine: 'Italian', vibe: 'fancy, cool', type: "Restaurants", isLiked: null },
          { name: 'Card 5', description: 'Description for card 5', priceRange: '$', rating: '4.0 stars', distance: '2.1 mi', location: '456 Elm St, City, State', cuisine: 'Mexican', vibe: 'casual, vibrant', type: "Restaurants", isLiked: null },
          { name: 'Card 6', description: 'Description for card 6', priceRange: '$$$', rating: '4.8 stars', distance: '3.5 mi', location: '789 Oak St, City, State', cuisine: 'Japanese', vibe: 'elegant, serene', type: "Restaurants", isLiked: null },
          { name: 'Card 7', description: 'Description for card 7', priceRange: '$$', rating: '4.4 stars', distance: '4.3 mi', location: '123 Main St, City, State', cuisine: 'Italian', vibe: 'fancy, cool', type: "Restaurants", isLiked: null },
          { name: 'Card 8', description: 'Description for card 8', priceRange: '$', rating: '4.0 stars', distance: '2.1 mi', location: '456 Elm St, City, State', cuisine: 'Mexican', vibe: 'casual, vibrant', type: "Restaurants", isLiked: null },
          { name: 'Card 9', description: 'Description for card 9', priceRange: '$$$', rating: '4.8 stars', distance: '3.5 mi', location: '789 Oak St, City, State', cuisine: 'Japanese', vibe: 'elegant, serene', type: "Restaurants", isLiked: null },

        // { title: 'Card 1', type: "video", description: 'Description for card 1', vibe: "fancy, cool", playerCount: "2-4", averagePlaytime: "1 hr", platform: "PS5", difficulty: "Hard", type: "Game" },
        // { title: 'Card 2', type: "video", description: 'Description for card 2', vibe: "casual, vibrant", playerCount: "1-2", averagePlaytime: "30 min", platform: "PC", difficulty: "Easy", type: "Game" },
        // { title: 'Card 3', type: "video", description: 'Description for card 3', vibe: "intense, immersive", playerCount: "4-8", averagePlaytime: "2 hrs", platform: "Xbox", difficulty: "Medium", type: "Game" },
        // { title: 'Card 4', type: "video", description: 'Description for card 4', vibe: "fancy, cool", playerCount: "2-4", averagePlaytime: "1 hr", platform: "PS5", difficulty: "Hard", type: "Game" },
        // { title: 'Card 5', type: "video", description: 'Description for card 5', vibe: "casual, vibrant", playerCount: "1-2", averagePlaytime: "30 min", platform: "PC", difficulty: "Easy", type: "Game" },
        // { title: 'Card 6', type: "video", description: 'Description for card 6', vibe: "intense, immersive", playerCount: "4-8", averagePlaytime: "2 hrs", platform: "Xbox", difficulty: "Medium", type: "Game" },
        // { title: 'Card 7', type: "video", description: 'Description for card 7', vibe: "fancy, cool", playerCount: "2-4", averagePlaytime: "1 hr", platform: "PS5", difficulty: "Hard", type: "Game" },
        // { title: 'Card 8', type: "video", description: 'Description for card 8', vibe: "casual, vibrant", playerCount: "1-2", averagePlaytime: "30 min", platform: "PC", difficulty: "Easy", type: "Game" },
        // { title: 'Card 9', type: "video", description: 'Description for card 9', vibe: "intense, immersive", playerCount: "4-8", averagePlaytime: "2 hrs", platform: "Xbox", difficulty: "Medium", type: "Game" },

        ]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

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
      {/* <p>{category}: <strong>Partner 1 Turn</strong></p> */}
      <CardStack 
      cardsReceived={cards} 
      />
    </div>
  );
}

export default CardGeneration;
