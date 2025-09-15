import dotenv from "dotenv";
import fetch from "node-fetch";
import loggerInit from "../logger/index";

dotenv.config();

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const FSQ_API_KEY = process.env.FSQ_API_KEY;
const RAWG_API_KEY = process.env.RAWG_API_KEY;
const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_API_KEY;
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
const logger = loggerInit("utils/img-retrieval.ts");
import { incrementMetric } from "./db";

/**
 * Retrieves images for generated cards based on category type and enriches the data
 * 
 * This function takes an array of generated cards and fetches relevant images
 * from the appropriate API based on the category:
 * - Movies/Shows: Uses TMDB API to get movie/show poster images
 * - Restaurants/Delivery/Things To Do Nearby: Uses Foursquare API with fallback to Unsplash
 * - Games: Uses RAWG API for video games, Unsplash for non-video games
 * - All others: Uses Unsplash API
 *
 * The function also adds attribution information for each image source.
 * 
 * @param category - The category of the cards (e.g. "Movies", "Restaurants")
 * @param results - The array of card objects to be enriched with images
 * @param zip - Optional zip code for location-based searches
 * @returns An array of the same objects enriched with images and attribution
 */
export async function retrieveImages(category: string, results: any[], zip: number) {

    logger.debug("Inside retrieveImages");

    // TMDB API
    if (category === "Movies" || category === "Shows") {

        const tvOrMovie = category === "Movies" ? "movie" : "tv";
        const enriched = await Promise.all(

            results.map(async (item) => {
                const query = encodeURIComponent(item[Object.keys(item)[0]!]);
                const params = new URLSearchParams({
                    api_key: TMDB_API_KEY!,
                    query: query,
                    include_adult: "false",
                    language: "en-US",
                    page: "1"
                });

                const tmdbSearchUrl = `https://api.themoviedb.org/3/search/${tvOrMovie}?${params.toString()}`;

                try {
                    const response = await fetch(tmdbSearchUrl);
                    const data = await response.json() as { results: { poster_path: string | null }[] };

                    const imageUrl = data.results[0]?.poster_path
                    ? `https://image.tmdb.org/t/p/w500${data.results[0].poster_path}`
                    : null;

                    return {
                        ...item,
                        images: imageUrl ? [imageUrl] : [],
                        attribution: {
                            provider: "TMDB",
                            link: "https://www.themoviedb.org/"
                        }
                    };

                }
                catch (error) {
                    logger.error("Error fetching TMDB data: ", error);
                    return {
                        ...item,
                        images: [],
                        attribution: null
                    };
                }
            })

        );

        await Promise.all(enriched.map(() => incrementMetric("TMDB_requests")));

        return enriched;

    }
    // Foursquare
    else if (category === "Restaurants" || category === "Delivery" || category === "Things To Do Nearby") {

        // get IDs of places first
        const FsqIDs: Map <string, string> = new Map();
        const getIDs = await Promise.all(
            results.map(async (item) => {

                const options = {
                    method: 'GET',
                    headers: {
                        accept: 'application/json',
                        'X-Places-Api-Version': '2025-06-17',
                        authorization: `Bearer ${FSQ_API_KEY}`
                    }
                };
                const itemName = item[Object.keys(item)[0]!];
                const addr = item.location ? item.location : "";
                const location = addr ? addr : zip;
                const categoryQuery = (category === "Delivery" || category === "Restaurants") ? "&fsq_category_ids=4d4b7105d754a06374d81259" : "";
                const params = new URLSearchParams({
                    query: itemName,
                    near: String(location),
                    sort: "DISTANCE",
                    limit: "1"
                });
                const fsqSearchUrl = `https://places-api.foursquare.com/places/search?${params.toString()}${categoryQuery}`;

                try{

                    const response = await fetch(fsqSearchUrl, options);
                    const data = await response.json() as { results: { fsq_place_id: string }[] };
                    // console.log("Fetched Foursquare data:", JSON.stringify(data, null, 2));

                    const fsqId = data.results?.[0]?.fsq_place_id || "";
                    FsqIDs.set(itemName, fsqId);

                }
                catch (error) {
                    logger.error("Error fetching Foursquare data/IDs: ", error);
                    FsqIDs.set(itemName, "");
                }

            })
        );

        await Promise.all(results.map(() => incrementMetric("FSQ_requests")));

        // then get images for each place
        const enriched = await Promise.all(

            results.map(async (item) => {

                const itemName = item[Object.keys(item)[0]!];
                const fsqId = FsqIDs.get(itemName);
                if (!fsqId) return { ...item, images: [] };

                const options = {
                    method: 'GET',
                    headers: {
                        accept: 'application/json',
                        'X-Places-Api-Version': '2025-06-17',
                        authorization: `Bearer ${FSQ_API_KEY}`
                    }
                };
                const params = new URLSearchParams({
                    sort: "POPULAR",
                    limit: "3",
                    classifications: "food_or_drink,outdoor_or_storefront"
                });
                const fsqImagesUrl = `https://places-api.foursquare.com/places/${fsqId}/photos?${params.toString()}`;

                try {

                    const response = await fetch(fsqImagesUrl, options);
                    const data = await response.json() as { prefix: string, suffix: string }[];
                    const imagesUrl: string[] = [];
                    if (Array.isArray(data)) {
                        data.forEach(photo => {
                            imagesUrl.push(`${photo.prefix}600x400${photo.suffix}`);
                        });
                    }

                    return {
                        ...item,
                        images: imagesUrl,
                        attribution: {
                            provider: "Foursquare",
                            link: "https://foursquare.com"
                        }
                    };

                }
                catch (error) {
                    logger.error("Error fetching Foursquare images: ", error);
                    return {
                        ...item,
                        images: [],
                        attribution: null
                    };
                }

            })

        );

        await Promise.all(enriched.map(() => incrementMetric("FSQ_requests")));

        // filter results with images and those without into two seperate arrays
        const enrichedWithFsqImages = [];
        const missingImages = [];
        for (const item of enriched) {
            if (item.images.length !== 0) {
                enrichedWithFsqImages.push(item);
            } else {
                missingImages.push(item);
            }
        }

        // get unsplash images for those with missing images
        let unsplashResults = [];
        if (missingImages.length !== 0) {
            unsplashResults = await fetchUnsplashImages(missingImages);
        }

        // return [...enrichedWithFsqImages, ...unsplashResults];
        return [...enrichedWithFsqImages, ...unsplashResults];

    }
    // RAWG API
    else if (category === "Games") {

        //get images for non video games
        const nonVideoGames = results.filter(item => item[Object.keys(item)[4]!] !== "Video Game");
        const videoGames = results.filter(item => item[Object.keys(item)[4]!] === "Video Game");
        let enrichedNonVideoGames: object[] = [];
        if (nonVideoGames.length !== 0) {
            enrichedNonVideoGames = await fetchUnsplashImages(nonVideoGames);
        }

        // get IDs of games first
        const GameIDs: Map <string, number> = new Map(); 
        const getIDs = await Promise.all(
            videoGames.map(async (item) => {

                const gameName = item[Object.keys(item)[0]!];
                const params = new URLSearchParams({
                    key: RAWG_API_KEY!,
                    search: gameName,
                    page_size: "1"
                });
                const searchGameUrl = `https://api.rawg.io/api/games?${params.toString()}`;

                try {

                    const response = await fetch(searchGameUrl);
                    const data = await response.json() as { results: { id: number }[] };

                    const ID = data.results?.[0]?.id || 0;
                    GameIDs.set(gameName, ID);
                    
                }
                catch (error) {
                    logger.error("Error fetching RAWG data/IDs: ", error);
                    GameIDs.set(gameName, -9999);
                }

            })
        );

        await Promise.all(videoGames.map(() => incrementMetric("RAWG_requests")));

        // then get images for each game
        const enriched = await Promise.all(

            videoGames.map(async (item) => {

                const gameName = item[Object.keys(item)[0]!];
                const gameId = GameIDs.get(gameName);
                if (!gameId || gameId === -9999) return { ...item, images: [] };
                const params = new URLSearchParams({
                    key: RAWG_API_KEY!
                });

                const fetchGameUrl = `https://api.rawg.io/api/games/${gameId}?${params.toString()}`;

                try {

                    const response = await fetch(fetchGameUrl);
                    const data = await response.json() as { background_image: string | null };

                    return {
                        ...item,
                        images: data.background_image ? [data.background_image] : [],
                        attribution: {
                            provider: "RAWG",
                            link: "https://rawg.io"
                        }
                    };

                }
                catch (error) {
                    logger.error("Error fetching RAWG game data: ", error);
                    return { ...item, images: [], attribution: null};
                }
            })

        );

        await Promise.all(enriched.map(() => incrementMetric("RAWG_requests")));

        return [...enriched, ...enrichedNonVideoGames];

    }
    // Unsplash API
    else {
        return await fetchUnsplashImages(results);
    }

}

/**
 * Fetches images from Unsplash API based on keywords extracted from the 'vibe' field
 * 
 * This helper function is used to get images for cards that either:
 * - Belong to a category that uses Unsplash as primary image source
 * - Failed to get images from their primary API (fallback mechanism)
 * 
 * It extracts keywords from the 'vibe' field (index 7) of each item,
 * queries Unsplash for a relevant image, and adds proper attribution
 * including the photographer's name and profile link.
 * 
 * @param results - Array of card objects that need images
 * @returns Array of the same objects enriched with Unsplash images and attribution
 */
async function fetchUnsplashImages(results: any[]) {

    const enriched = await Promise.all(

        results.map(async (item) => {

            const commas = item[Object.keys(item)[7]!];
            const keywords = commas.replaceAll(",", "");
            const params = new URLSearchParams({
                query: keywords,
                per_page: "1",
                orientation: "portrait",
                client_id: UNSPLASH_ACCESS_KEY!
            });
            const searchImageUrl = `https://api.unsplash.com/search/photos?${params.toString()}`;

            try {

                const response = await fetch(searchImageUrl);
                const data = await response.json() as 
                {
                    results: {
                        urls: {
                            regular: string;
                        };
                        user: {
                            name: string;
                            links: {
                                html: string;
                            }
                        };
                    }[];
                };

                return {
                    ...item,
                    images: data.results?.[0]?.urls.regular ? [data.results?.[0]?.urls.regular] : [],
                    attribution: {
                        provider: "Unsplash",
                        author: data.results?.[0]?.user?.name,
                        link: data.results?.[0]?.user?.links.html
                    }
                };

            }
            catch (error) {
                logger.error("Error fetching Unsplash images: ", error);
                return {
                    ...item,
                    images: [],
                    attribution: null
                };
            }

        })
    );

    await Promise.all(enriched.map(() => incrementMetric("Unsplash_requests")));

    return enriched;
}