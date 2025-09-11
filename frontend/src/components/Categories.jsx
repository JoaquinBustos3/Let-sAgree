import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../component-styles/Categories.css';
// Import your icons
import RestaurantIcon from '../images/restaurant.png';
import DeliveryIcon from '../images/takeout.png';
import ShowsIcon from '../images/shows.svg';
import MoviesIcon from '../images/movies.png';
import IndoorDateIcon from '../images/indoor-date.png';
import OutdoorDateIcon from '../images/outdoor-date.png';
import NearbyIcon from '../images/nearby.png';
import WeekendIcon from '../images/weekend.png';
import GamesIcon from '../images/games.png';

function Categories() {
  const navigate = useNavigate();

  // Define categories and their icons with URL-friendly slugs
  const categories = [
    { name: "RESTAURANTS", icon: RestaurantIcon, slug: "Restaurants" },
    { name: "TAKEOUT/DELIVERY", icon: DeliveryIcon, slug: "Delivery" },
    { name: "SHOWS", icon: ShowsIcon, slug: "Shows" },
    { name: "MOVIES", icon: MoviesIcon, slug: "Movies" },
    { name: "INDOOR DATE ACTIVITIES", icon: IndoorDateIcon, slug: "Indoor Date Activities" },
    { name: "OUTDOOR DATE ACTIVITIES", icon: OutdoorDateIcon, slug: "Outdoor Date Activities" },
    { name: "THINGS TO DO NEARBY", icon: NearbyIcon, slug: "Things To Do Nearby" },
    { name: "WEEKEND TRIP IDEAS", icon: WeekendIcon, slug: "Weekend Trip Ideas" },
    { name: "GAMES", icon: GamesIcon, slug: "Games" },
  ];

  const handleCategoryClick = (category) => {
    navigate(`/category/${category.slug}`, { state: category });
  };

  return (
    <div className="categories-container">
      <div className="inner-container">
        {categories.map((category, index) => (
          <div 
            className="box" 
            key={index}
            onClick={() => handleCategoryClick(category)}
          >
            <img src={category.icon} alt={category.name} className="category-icon" />
            <span className="category-name">{category.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Categories;
