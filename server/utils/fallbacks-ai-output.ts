const criticalFields: Record<string, string[]> = {
        Restaurants: 
            ["name", "description", "priceRange", "distance", "rating"],
        "Delivery": 
            ["name", "description", "priceRange", "rating", "deliveryTime"],
        Shows: 
            ["title", "description", "rating", "releaseYear", "seasons"],
        Movies: 
            ["title", "description", "rating", "releaseYear", "runtime"],
        Games: 
            ["title", "description", "averagePlaytime", "playerCount", "type"],
        "Indoor Date Activities": 
            ["title", "description", "cost", "duration", "idealTime"],
        "Outdoor Date Activities": 
            ["title", "description", "cost", "duration", "distance"],
        "Things To Do Nearby": 
            ["name", "description", "price", "distance", "rating"],
        "Weekend Trip Ideas": 
            ["destination", "description", "distance", "cost", "lodging"],
    };

/**
 * Filters out cards that are missing critical values for their category
 * 
 * This function checks each card in the provided array against a list of
 * required fields for the specified category. Cards that don't have all
 * the required fields populated will be filtered out of the results.
 * 
 * @param category - The category name to determine which critical fields to check
 * @param cards - Array of card objects to filter
 * @returns Array of valid cards that contain all required fields for their category
 */
export function applyFallbacks(category: string, cards: any[]){
    return cards.filter(card => isValidCard(card, category));
}

function isValidCard(card: any, category: string): boolean {
  const required = criticalFields[category] ?? [];
  return required.every(field => card[field] !== null && card[field] !== undefined && card[field] !== "");
}
