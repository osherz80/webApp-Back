export const getRecommendationPrompt = (bookContext: string) => {
    return `Based on these books I previously read and enjoyed:
${bookContext}

Recommend 5 new books that I would enjoy. 
The provided recommendations should be in the same structure provided by the google books api.
Specifically, return a JSON object with a "items" field containing an array of 5 book objects. Each book object should have a "volumeInfo" property with "title", "authors" (array), "description", and "imageLinks" (object with "thumbnail").
Format exactly like the Google Books API response.`;
};
