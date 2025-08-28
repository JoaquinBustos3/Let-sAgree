/**
 * Smoothly scrolls to a specific target element or position
 * @param {string|number} target - Either a selector string or a vertical scroll position
 * @param {number} duration - Duration of scroll animation in milliseconds
 * @param {function} navigate - Navigation function from react-router's useNavigate
 */
export const smoothScrollTo = (target, duration = 1500, navigate = null) => {

  // Ensure we are in landing page if navigate function is provided
  if (navigate && window.location.pathname !== '/') {
    navigate('/');
    // Wait a moment for the page to render
    setTimeout(() => {
      smoothScrollTo(target, duration);
    }, 300);
    return;
  }
  
  // Calculate the scroll target position
  let scrollTarget;
  
  if (typeof target === 'string') {
    // If target is a selector string, find the element
    const targetElement = document.querySelector(target);
    
    if (targetElement) {
      // Get the element's position relative to the top of the page
      const rect = targetElement.getBoundingClientRect();
      scrollTarget = rect.top + window.pageYOffset - 35; //subtract to center the element
    } else {
      console.error(`Element with selector ${target} not found`);
      return;
    }
  } else if (typeof target === 'number') {
    // If target is already a number, use it directly
    scrollTarget = target;
  } else {
    console.error('Invalid scroll target');
    return;
  }
  
  // Start position
  const startPosition = window.pageYOffset;
  // Total distance to scroll
  const distance = scrollTarget - startPosition;
  
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
