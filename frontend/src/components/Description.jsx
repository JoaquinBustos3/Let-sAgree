import "../component-styles/Description.css";

function Description() {

  // Custom slow scroll function with adjustable duration
  const scrollToCategories = () => {
    // Calculate a higher scroll position (40% instead of 60%)
    // This will position Categories higher on the screen
    const scrollTarget = window.innerHeight * 0.74;
    
    // Start position
    const startPosition = window.pageYOffset;
    // Total distance to scroll
    const distance = scrollTarget - startPosition;
    // Duration in milliseconds (longer for slower animation)
    const duration = 1500; // 1.5 seconds (slower transition)
    
    let start = null;
    
    // Animation function
    function animation(currentTime) {
      if (start === null) start = currentTime;
      const timeElapsed = currentTime - start;
      const progress = Math.min(timeElapsed / duration, 1);
      
      // Easing function for smoother animation
      const easeInOutQuad = (t) => 
        t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      
      window.scrollTo(0, startPosition + distance * easeInOutQuad(progress));
      
      if (timeElapsed < duration) {
        requestAnimationFrame(animation);
      }
    }
    
    // Start the animation
    requestAnimationFrame(animation);
  };

  return (
    <div className="description-container">
      <h1 className="large-text">Helping you come to an agreement</h1>
      <p className="medium-text">
        Pick a common topic of contention. Describe your preferences. Take turns swiping on your favorites results with your peer. Agree while having fun.
      </p>
      <p 
        className="medium-text actioncall"
        onClick={scrollToCategories}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && scrollToCategories()}
      >
        Let's Agree!
      </p>
    </div>
  );
  
}

export default Description;
