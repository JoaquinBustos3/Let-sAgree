import React, { useEffect, useState } from 'react';
import Card from './Card';
import '../component-styles/CardStack.css';
import Fireworks from "react-canvas-confetti/dist/presets/fireworks"


function CardStack({ cardsReceived }) {

  const [cards, setCards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  //turn 1, turn 2, turn 3 (for choosing how to continue game)
  const [currentTurn, setCurrentTurn] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [tempLikedCards, setTempLikedCards] = useState([]);
  const [matches, setMatches] = useState([]);   

  useEffect(() => {
    if (cardsReceived && cardsReceived.length > 0) {
      setCards(cardsReceived);
    }
  }, [cardsReceived]);

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
        
        console.log("Random index chosen: ", randomIndex);
        setCurrentIndex(randomIndex);
    }
    else{
        //another round
        setCurrentIndex(0);
        setCurrentTurn(0);
        setMatches([]);
        setTempLikedCards([]);
    }
  }

  const finishTurn = () => {
    console.log("Finishing turn of: ", currentTurn);
    //end of turn 1
    if (currentTurn == 0) {
        setMatches(tempLikedCards); //will match with tempLikedCards next turn
        setCurrentIndex(0);
        setTempLikedCards([]);
        setCurrentTurn(1);
        setCards(cards.map(card => ({ ...card, isLiked: null }))); //reset isLiked for all cards
    }
    //end of turn 2
    else if (currentTurn == 1) {
        setCurrentIndex(0);
        setCurrentTurn(2);
        //find matches
        const newMatches = cards.filter(card => tempLikedCards.includes(card) && matches.includes(card));
        setMatches(newMatches);
        setTempLikedCards([]);
        setCards(matches);
    }
  }

  const handleSwipe = (direction) => {
    switch(direction) {
      case 'left':
        // Next card
        if (currentIndex < cards.length - 1) {
          setCurrentIndex(currentIndex + 1);
        }
        //reached last card
        break;
        
      case 'right':
        // Previous card
        if (currentIndex > 0) {
          setCurrentIndex(currentIndex - 1);
        }
        break;
        
      case 'up':
        // Mark as liked and accept current card
        setCards(cards.map((card, index) => 
          index === currentIndex ? { ...card, isLiked: true } : card
        ));
        if (!tempLikedCards.includes(cards[currentIndex])) {
          setTempLikedCards([...tempLikedCards, cards[currentIndex]]);
        }
        console.log(`Temp liked cards: ${tempLikedCards.map(card => card.name || card.title).join(', ')}`);

        // If last card, do nothing; otherwise move to next
        if (currentIndex < cards.length - 1) {
          setCurrentIndex(currentIndex + 1);
        }

        break;
        
      case 'down':
        // Mark as disliked and reject current card
        setCards(cards.map((card, index) => 
          index === currentIndex ? { ...card, isLiked: false } : card
        ));
        setTempLikedCards(tempLikedCards.filter((card) => { 
            const firstKey = Object.keys(card)[0];
            return (card[firstKey] !== (cards[currentIndex][firstKey]));
        }));
        console.log(`current index is ${currentIndex} and card is ${cards[currentIndex].name || cards[currentIndex].title}`);
        console.log(`Temp liked cards: ${tempLikedCards.map(card => card.name || card.title).join(', ')}`);

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
        {cardsReceived ? "No cards found" : "Loading cards..."}
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
            <p>Swipe up or down on the {cards[0].type}! <strong>User {currentTurn + 1}'s Turn.</strong></p> : 
            <div className ="turn3-info-container">
                <p>Congrats! You have <strong>{cards.length} {cards.length > 1 ? "matches!" : "match!"}</strong></p>
                <div onClick={() => handleTurn3(1)} className="turn3-button choose">Agree on Current</div>
                <div onClick={() => handleTurn3(2)} className="turn3-button random">Random Pick</div>
                <div onClick={() => handleTurn3(3)} className="turn3-button next">Next Round</div>
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
