import React from 'react';
import '../component-styles/Categories.css';
// Import your icons
import RestaurantIcon from '../images/restaurant.png';
import TakeoutIcon from '../images/takeout.png';
import ShowsIcon from '../images/shows.svg';
import MoviesIcon from '../images/movies.png';
import IndoorDateIcon from '../images/indoor-date.png';
import OutdoorDateIcon from '../images/outdoor-date.png';
import NearbyIcon from '../images/nearby.png';
import WeekendIcon from '../images/weekend.png';
import GamesIcon from '../images/games.png';

function Categories() {
  // Define categories and their icons
  const categories = [
    { name: "RESTAURANTS", icon: RestaurantIcon },
    { name: "TAKE-OUT/DELIVERY", icon: TakeoutIcon },
    { name: "SHOWS", icon: ShowsIcon },
    { name: "MOVIES", icon: MoviesIcon },
    { name: "INDOOR DATE ACTIVITIES", icon: IndoorDateIcon },
    { name: "OUTDOOR DATE ACTIVITIES", icon: OutdoorDateIcon },
    { name: "THINGS TO DO NEARBY", icon: NearbyIcon },
    { name: "WEEKEND TRIP IDEAS", icon: WeekendIcon },
    { name: "GAMES", icon: GamesIcon },
  ];

  return (
    <div className="categories-container">
      <div className="inner-container">
        {categories.map((category, index) => (
          <div className="box" key={index}>
            <img src={category.icon} alt={category.name} className="category-icon" />
            <span className="category-name">{category.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Categories;
