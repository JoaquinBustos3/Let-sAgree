import "../component-styles/Description.css";
import { smoothScrollTo } from "../utils/scrollUtils";

/**
 * Description Component
 * 
 * Renders the landing page's main description section with the app's value proposition
 * and a call-to-action button. Features:
 * - Large heading explaining the app's purpose
 * - Concise explanation of the app's workflow
 * - Interactive "Let's Agree!" button that smoothly scrolls to categories
 * 
 * The component uses the smoothScrollTo utility for animated scrolling
 * and includes keyboard accessibility for the CTA button.
 * 
 * @returns {JSX.Element} Description section with heading, text, and CTA button
 */
function Description() {
  // Use the shared utility function
  const scrollToCategories = () => {
    smoothScrollTo('.categories-container');
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
      