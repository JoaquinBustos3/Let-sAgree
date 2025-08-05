export interface PromptInput {
  category: "restaurant" | "movie" | "activity";
  filters: {
    priceRange?: string;
    vibe?: string;
    location?: string;
    [key: string]: string | undefined;
  };
}
