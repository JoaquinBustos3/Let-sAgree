import React, { useState } from 'react';
import '../component-styles/FAQ.css';

function FAQ() {
  // FAQ data with questions and answers
  const faqItems = [
    {
      question: "What is Let's Agree?",
      answer: "Let's Agree is a platform designed to help people come to agreements on contentious everyday decisions by providing options based on your preferences and finding matches that both parties will enjoy."
    },
    {
      question: "How does the matching process work?",
      answer: "After you and your partner/friend select a category, you'll input your preferences for results you'd like to see. Our algorithm will then generate options and let you both swipe on what you like. With your matches, you can make a decision you both agree on or continue onto another round of swiping!"
    },
    {
      question: "Which way do I swipe?",
      answer: "Swiping left indicates a dislike, while swiping right indicates a like. Swiping up simply navigates to the next card without indicating a like or dislike, while swiping down navigates to the previous card."
    },
    {
      question: "How accurate are the recommendations?",
      answer: "Our recommendations are generated based on the preferences you provide. The more specific you are, the better the matches will be."
    },
    {
      question: "Is Let's Agree free to use?",
      answer: "Yes! Let's Agree is currently in beta and free for all users."
    },
    {
      question: "What's to come?",
      answer: "In the future, you can expect the capability to synchronously swipe with your peer, specify any category, include more than 2 people, save sets of generated results, and more!"
    }
  ];

  // State to track which FAQ item is expanded
  const [activeIndex, setActiveIndex] = useState(null);

  // Toggle function to expand/collapse FAQ items
  const toggleFAQ = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <div className="faq-container" id="faq">
      <h2 className="faq-title">Frequently Asked Questions</h2>
      <div className="faq-list">
        {faqItems.map((item, index) => (
          <div 
            key={index} 
            className={`faq-item ${activeIndex === index ? 'active' : ''}`}
          >
            <div 
              className="faq-question" 
              onClick={() => toggleFAQ(index)}
            >
              {item.question}
              <span className="faq-icon">
                {activeIndex === index ? '−' : '+'}
              </span>
            </div>
            <div className="faq-answer">
              <p>{item.answer}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default FAQ;
