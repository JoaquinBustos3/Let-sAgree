import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../component-styles/InputPrompt.css';

function InputPrompt() {
  const location = useLocation();
  const navigate = useNavigate();
  const category = location.state || {};
  const [userInput, setUserInput] = useState('');
  const [zipCode, setZipCode] = useState('');

  const zipCodeCategories = ["Restaurants", "Outdoor Date Activities", "Delivery", "Things To Do Nearby", "Weekend Trip Ideas"];

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Submitting:', { category: category.slug, input: userInput, zipCode: zipCode || 0 });

    // Navigate to the card-generation route and pass data via state
    navigate('/card-generation', {
      state: {
        category: category,
        userInput,
        zipCode: zipCode || 0,
      },
    });
  };
  
  return (
    <div className="input-prompt-container">
      <img src={category.icon} alt={category.slug} className="prompt-category-icon" />
      <form className="form-container" onSubmit={handleSubmit}>

        <div className="form-group">
          <textarea 
            id="userInput"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder={`Share your preferences for ${category.slug}...`}
            required
          />
        </div>

        <div className="bottom-row-form">
            <div className="form-group">
                {zipCodeCategories.includes(category.slug) &&
                    <input 
                    type="text"
                    id="zipCode"
                    value={zipCode}
                    onChange={(e) => setZipCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="Enter zip code..."
                    maxLength={5}
                    required
                />}
            </div>
            <button type="submit">Find Agreements</button>
        </div>

      </form>
    </div>
  );
}

export default InputPrompt;
