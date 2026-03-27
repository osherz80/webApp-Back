import { getRecommendationPrompt } from './prompts';
import { GoogleBook } from '../types/googleBook';
import { askGemini } from "../services/gemini.service";

const getBookCoverUrl = async (title: string, author: string) => {
    try {
        const response = await fetch(`https://bookcover.longitood.com/bookcover?book_title=${title}&author_name=${author}&image_size=large`);

        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();

        return data.url;
    } catch (error) {
        console.error("Error fetching cover JSON:", error);
        return null;
    }
}


const generateBookCoverUrls = async (books: GoogleBook[]) => {
    const thumbnailPromises = books.map(async (book) => {
        const title = encodeURIComponent(book.volumeInfo.title);
        const author = encodeURIComponent(book.volumeInfo.authors?.[0] || "");

        try {
            const thumbnailUrl = await getBookCoverUrl(title, author);
            console.log("new thumbnailUrl", thumbnailUrl);

            if (thumbnailUrl) {
                book.volumeInfo.imageLinks = {
                    thumbnail: thumbnailUrl
                };
            }
        } catch (error) {
            console.error(`Failed to fetch book cover for: ${book.volumeInfo.title}`, error);
            return;
        }
    });

    const results = await Promise.allSettled(thumbnailPromises);

    const rejectedCount = results.filter(r => r.status === 'rejected').length;
    if (rejectedCount > 0) {
        console.warn(`Completed with ${rejectedCount} errors in images.`);
    }
};

export const generateBookRecommendations = async (bookContext: string, blacklist: string[] = [], dynamicModel?: string, catchRetry = true): Promise<GoogleBook[]> => {

    try {
        const prompt = getRecommendationPrompt(bookContext, blacklist);

        const result = await askGemini(prompt, dynamicModel, catchRetry);
        console.log("result", result);
        const responseText = result.response.text();


        console.log("responseText", responseText);


        const parsedData = JSON.parse(responseText);
        const recommendations: GoogleBook[] = parsedData.items.map((item: GoogleBook) => ({
            id: `${item.volumeInfo.title.replace(/\s+/g, '_')}_${(item.volumeInfo.authors || []).join('_').replace(/\s+/g, '_')}`,
            volumeInfo: item.volumeInfo
        })) || [];

        await generateBookCoverUrls(recommendations);

        console.log("recommendations after", recommendations);

        return recommendations;
    } catch (parseError: any) {
        console.error('Error parsing JSON from Gemini:', parseError);
        throw new Error('Failed to parse AI recommendations');
    }
};
