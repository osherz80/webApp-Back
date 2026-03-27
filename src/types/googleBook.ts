export interface GoogleBook {
    id: string;
    volumeInfo: {
        title: string;
        authors?: string[];
        description?: string;
        imageLinks?: {
            thumbnail: string;
        };
    };
}

export interface GoogleBookResponse {
    items: GoogleBook[];
}
