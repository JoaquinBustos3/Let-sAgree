import dotenv from "dotenv";
import { url } from "inspector/promises";
import fetch from "node-fetch";
import { ca } from "zod/v4/locales";

dotenv.config();

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const FSQ_API_KEY = process.env.FSQ_API_KEY;
const RAWG_API_KEY = process.env.RAWG_API_KEY;
const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_API_KEY;

export async function retrieveImages(category: string, results: any[], zip: number) {

    console.log("Inside retrieveImages");

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
                    };

                }
                catch (error) {
                    console.error("Error fetching TMDB data:", error);
                    return {
                        ...item,
                        images: [],
                    };
                }
            })

        );

        console.log("Enriched results with images:", enriched);
        return enriched;

    }
    // Foursquare API
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
                const addr = (category !== "Delivery") ? item[Object.keys(item)[5]!] + ", " : "";
                const location = addr ? addr : zip;
                const categoryQuery = (category === "Delivery" || category === "Restaurants") ? "&fsq_category_ids=4d4b7105d754a06374d81259" : "";
                const params = new URLSearchParams({
                    query: itemName,
                    near: String(location),
                    sort: "DISTANCE",
                    limit: "1"
                });
                const fsqSearchUrl = `https://places-api.foursquare.com/places/search?${params.toString()}${categoryQuery}`;
                console.log("Fetching Foursquare ID with URL Addr:", addr, zip);

                try{

                    const response = await fetch(fsqSearchUrl, options);
                    const data = await response.json() as { results: { fsq_place_id: string }[] };
                    // console.log("Fetched Foursquare data:", JSON.stringify(data, null, 2));

                    const fsqId = data.results?.[0]?.fsq_place_id || "";
                    FsqIDs.set(itemName, fsqId);

                }
                catch (error) {
                    console.error("Error fetching Foursquare data:", error);
                    FsqIDs.set(itemName, "");
                }

            })
        );

        console.log("Fetched Foursquare IDs:", FsqIDs.size);

        // then get images for each place
        const enriched = await Promise.all(

            results.map(async (item) => {

                const itemName = item[Object.keys(item)[0]!];
                const fsqId = FsqIDs.get(itemName);
                console.log("FSQ ID for", itemName, "is", fsqId);
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
                            console.log(`Fetched photo URL for ${itemName}: ${photo.prefix}600x400${photo.suffix}`);
                            imagesUrl.push(`${photo.prefix}600x400${photo.suffix}`);
                        });
                    } else {
                        console.warn("No photos returned for", itemName);
                        console.log("Response data for", itemName, ": ", data);
                    }

                    return {
                        ...item,
                        images: imagesUrl,
                    };

                }
                catch (error) {
                    console.error("Error fetching Foursquare images:", error);
                    return {
                        ...item,
                        images: [],
                    };
                }

            })

        );

        // filter results with images and those without into two seperate arrays
        const enrichedWithImages = [];
        const missingImages = [];
        for (const item of enriched) {
            if (item.images.length !== 0) {
                enrichedWithImages.push(item);
            } else {
                missingImages.push(item);
            }
        }

        // get unsplash images for those with missing images
        let unsplashResults = [];
        if (missingImages.length !== 0) {
            unsplashResults = await fetchUnsplashImages(missingImages);
        }

        return [...enrichedWithImages, ...unsplashResults];
        return enriched;

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
                    console.log("Fetched RAWG ID:", ID, "for game:", gameName);
                    GameIDs.set(gameName, ID);
                    
                }
                catch (error) {
                    console.error("Error fetching RAWG data:", error);
                    GameIDs.set(gameName, -9999);
                }

            })
        );

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
                    console.log("Fetched RAWG image for game:", gameName, "Image URL:", data.background_image);

                    return {
                        ...item,
                        images: data.background_image ? [data.background_image] : [],
                    };

                }
                catch (error) {
                    console.error("Error fetching RAWG game data:", error);
                    return { ...item, images: [] };
                }
            })

        );

        return [...enriched, ...enrichedNonVideoGames];

    }
    // Unsplash API
    else {
        return await fetchUnsplashImages(results);
    }

}

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
                const data = await response.json() as { results: { urls: { regular: string } }[] };
                console.log("Fetched Unsplash image for:", item[Object.keys(item)[0]!], "Image URL:", data.results?.[0]?.urls.regular);

                return {
                        ...item,
                        images: data.results?.[0]?.urls.regular ? [data.results?.[0]?.urls.regular] : [],
                    };

            }
            catch (error) {
                console.error("Error fetching Unsplash data:", error);
                return {
                    ...item,
                    images: [],
                };
            }

        })
    );

    return enriched;
}