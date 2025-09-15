import React, { useEffect, useState } from 'react';
import Card from './Card';
import '../component-styles/CardStack.css';
import Fireworks from "react-canvas-confetti/dist/presets/fireworks"

/**
 * CardStack Component
 * 
 * Manages a stack of swipeable cards and the turn-based interaction flow between two users.
 * This component handles the core game logic including:
 * - Two-turn swiping system where each user likes/dislikes cards
 * - Tracking matches between users' choices
 * - Final decision phase with options to:
 *   1. Choose current card
 *   2. Get random selection from matches
 *   3. Start new round with matched cards
 * 
 * The component maintains different states for:
 * - Current turn (0 = User 1, 1 = User 2, 2 = Final decision)
 * - Temporary liked cards for current user
 * - Matched cards between both users
 * - Navigation through card stack
 * 
 * @param {Object} props
 * @param {Array} props.cardsReceived - Array of card objects to display
 * @param {Object} props.category - Category object containing slug and other metadata
 * @returns {JSX.Element} Stack of cards with turn indicators and control buttons
 */
function CardStack({ cardsReceived, category }) {

  const [cards, setCards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  //turn 1, turn 2, turn 3 (for choosing how to continue game)
  const [currentTurn, setCurrentTurn] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [tempLikedCards, setTempLikedCards] = useState([]);
  const [matches, setMatches] = useState([]);   
  const [prevMatches, setPrevMatches] = useState([]);  //used to try again when there are no matches in the round

  useEffect(() => {
    if (cardsReceived && cardsReceived.length > 0) {
      setCards(cardsReceived);
    }
  }, [cardsReceived]);

  //determines if arr contains object with same first key value as obj
  const contains = (arr, obj) => {
    const firstKey = Object.keys(obj)[0]; // e.g. "id", "title", etc.
    return arr.some((each) => each[firstKey] === obj[firstKey]);
  }

  const resetCurrentCardsLikes = () => {
    setCards(cards.map(card => ({ ...card, isLiked: null })));
  }

  const handleRetry = () => {
    setCurrentIndex(0);
    setCurrentTurn(0);
    setMatches([]);
    setTempLikedCards([]);
    setCards(prevMatches.map(card => ({ ...card, isLiked: null }))); //have to perform atomically since setCards() is asynchronous in nature
  }

  const handleTurn3 = (numOption) => {
    //options - 1) choose together, 2) random option, 3) onto another round
    if (numOption == 1) {
        //current index card is chosen
        setIsFinished(true);
    }
    else if (numOption == 2) {
        //random option from matches
        if (cards.length <= 1) {
          // No need to randomize if there's only one card
          return;
        }
        
        // Generate initial random index
        let randomIndex = Math.floor(Math.random() * cards.length);
        
        // If the random index happens to be the current index, move to adjacent card
        if (randomIndex === currentIndex) {
          // Choose next card circularly (if at end, wrap to beginning)
          if (currentIndex === cards.length - 1) {
            randomIndex = 0;
          } else {
            randomIndex = currentIndex + 1;
          }
        }
        
        setCurrentIndex(randomIndex);
    }
    else{
        //another round - cards already set by finishTurn() turn 2
        setCurrentIndex(0);
        setCurrentTurn(0);
        setMatches([]);
        setTempLikedCards([]);
        resetCurrentCardsLikes();
    }
  }

  const finishTurn = () => {
    //end of turn 1
    if (currentTurn == 0) {
        setMatches(tempLikedCards); //will match with tempLikedCards next turn
        setCurrentIndex(0);
        setTempLikedCards([]);
        setCurrentTurn(1);
        resetCurrentCardsLikes();
    }
    //end of turn 2
    else if (currentTurn == 1) {
        setCurrentIndex(0);
        setCurrentTurn(2);
        //find matches
        const newMatches = cards.filter(card => contains(tempLikedCards, card) && contains(matches, card));
        
        //set matches only if there are matches, else for later on logic - we will retry
        if (newMatches.length == 0)
            setPrevMatches(cards);

        setMatches(newMatches); 
        setTempLikedCards([]);
        setCards(newMatches); 

    }
  }

  const handleSwipe = (direction) => {
    switch(direction) {
      case 'up': //left
        // Next card
        if (currentIndex < cards.length - 1) {
          setCurrentIndex(currentIndex + 1);
        }
        //reached last card
        break;
        
      case 'down': //right
        // Previous card
        if (currentIndex > 0) {
          setCurrentIndex(currentIndex - 1);
        }
        break;
        
      case 'right': { //up
        // Mark as liked and accept current card
        setCards(cards.map((card, index) => 
          index === currentIndex ? { ...card, isLiked: true } : card
        ));

        if (!contains(tempLikedCards, cards[currentIndex])) {
          setTempLikedCards([...tempLikedCards, cards[currentIndex]]);
        }

        // If last card, do nothing; otherwise move to next
        if (currentIndex < cards.length - 1) {
          setCurrentIndex(currentIndex + 1);
        }

        break;
    }
      case 'left': //down
        // Mark as disliked and reject current card
        setCards(cards.map((card, index) => 
          index === currentIndex ? { ...card, isLiked: false } : card
        ));
        setTempLikedCards(tempLikedCards.filter((card) => { 
            const firstKey = Object.keys(card)[0];
            return (card[firstKey] !== (cards[currentIndex][firstKey]));
        }));

        // If last card, do nothing; otherwise move to next
        if (currentIndex < cards.length - 1) {
          setCurrentIndex(currentIndex + 1);
        }

        break;
    }
  };
  
  // Show better loading indicator when cards array is empty
  if (!cards || cards.length === 0) {
    return (
      <div className="no-cards">
        {cardsReceived ? 
        <div className='no-matches-block'>
            <strong>No Matches...</strong>
            Let's try again. There's something we can agree on!
            <div onClick={() => handleRetry()} className='card-button no-matches'> Try Again </div>
        </div> : 
        <div><strong>Loading cards...</strong></div>
        }
      </div>
    );
  }

  if (isFinished) {
    return (
        <>
            <Fireworks autorun={{ speed: 2}}/>
            <h1 className='final-agreement'>Congratulations! You Agreed on {cards[currentIndex].name}</h1>
            <div className="card-stack">
                <Card 
                index = {currentIndex}
                data={cards[currentIndex]}
                currentIndex={currentIndex}
                onSwipe={handleSwipe}
                finishTurn={finishTurn}
                turn3={handleTurn3}
                />
            </div>
        </>
    );
  }

  return (
    <>
        {
            currentTurn < 2 ?  
            // Add a unique key based on currentTurn to force re-rendering and animation restart
            <p key={`turn-${currentTurn}`} className="user-turn">
              See FAQ on how to swipe on the {category.slug}! <strong>User {currentTurn + 1}'s Turn.</strong>
            </p> : 
            <div className="turn3-info-container">
                <p>Congrats! You have <strong>{cards.length} {cards.length > 1 ? "matches!" : "match!"}</strong></p>
                <div className="turn3-buttons-container">
                  <div onClick={() => handleTurn3(1)} className="card-button choose">Agree on Current</div>
                  <div onClick={() => handleTurn3(2)} className="card-button random">Random Pick</div>
                  <div onClick={() => handleTurn3(3)} className="card-button next">Next Round</div>
                </div>
            </div>
        }
        <div className="card-stack">
            {/* Render all cards but only the ones close to current index will be visible */}
            {cards.map((card, index) => (
                <Card 
                key={index}
                data={card}
                index={index}
                currentIndex={currentIndex}
                onSwipe={handleSwipe}
                finishTurn={finishTurn}
                turn3={handleTurn3}
                category={category}
                />
            ))}
            
            {
                (currentIndex === cards.length - 1 && currentTurn != 2) ? 
                (
                    <div onClick={() => finishTurn()} className="end-turn-button">
                        Finish Turn
                    </div>
                ) : 
                (
                    <div className="stack-indicator">
                        {currentIndex + 1} of {cards.length}
                    </div>
                )
            }
        </div>
    </>
  );
}

export default CardStack;
