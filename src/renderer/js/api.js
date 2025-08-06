// API module for HiAnime.to scraping and data fetching
class HiAnimeAPI {
    constructor() {
        this.baseURL = 'https://hianime.to';
        this.apiURL = 'https://hianime.to'; // We'll use direct scraping
        this.cache = new Map();
        this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
    }

    // Utility method to make HTTP requests
    async makeRequest(url, options = {}) {
        const defaultOptions = {
            method: 'GET',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5',
                'Accept-Encoding': 'gzip, deflate',
                'Connection': 'keep-alive',
                'Upgrade-Insecure-Requests': '1',
            },
            ...options
        };

        try {
            const response = await fetch(url, defaultOptions);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.text();
        } catch (error) {
            console.error('Request failed:', error);
            throw error;
        }
    }

    // Cache management
    getCached(key) {
        const cached = this.cache.get(key);
        if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
            return cached.data;
        }
        return null;
    }

    setCache(key, data) {
        this.cache.set(key, {
            data,
            timestamp: Date.now()
        });
    }

    // Parse anime data from HTML
    parseAnimeList(html) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const animeCards = doc.querySelectorAll('.flw-item');
        
        return Array.from(animeCards).map(card => {
            const link = card.querySelector('.film-poster a');
            const img = card.querySelector('.film-poster img');
            const title = card.querySelector('.film-detail .film-name a');
            const meta = card.querySelector('.film-detail .fd-infor');
            
            return {
                id: link ? link.getAttribute('href').split('/').pop() : '',
                title: title ? title.textContent.trim() : '',
                poster: img ? img.getAttribute('data-src') || img.src : '',
                url: link ? link.getAttribute('href') : '',
                year: meta ? this.extractYear(meta.textContent) : '',
                type: meta ? this.extractType(meta.textContent) : '',
                episodes: meta ? this.extractEpisodes(meta.textContent) : ''
            };
        });
    }

    // Helper methods for parsing metadata
    extractYear(text) {
        const yearMatch = text.match(/\b(19|20)\d{2}\b/);
        return yearMatch ? yearMatch[0] : '';
    }

    extractType(text) {
        const types = ['TV', 'Movie', 'OVA', 'ONA', 'Special'];
        for (const type of types) {
            if (text.includes(type)) return type;
        }
        return 'TV';
    }

    extractEpisodes(text) {
        const episodeMatch = text.match(/(\d+)\s*eps?/i);
        return episodeMatch ? episodeMatch[1] : '';
    }

    // Get trending anime
    async getTrendingAnime() {
        const cacheKey = 'trending';
        const cached = this.getCached(cacheKey);
        if (cached) return cached;

        try {
            const html = await this.makeRequest(`${this.baseURL}/home`);
            const trending = this.parseAnimeList(html);
            this.setCache(cacheKey, trending);
            return trending;
        } catch (error) {
            console.error('Failed to fetch trending anime:', error);
            return [];
        }
    }

    // Get new releases
    async getNewReleases() {
        const cacheKey = 'new-releases';
        const cached = this.getCached(cacheKey);
        if (cached) return cached;

        try {
            const html = await this.makeRequest(`${this.baseURL}/new-release`);
            const newReleases = this.parseAnimeList(html);
            this.setCache(cacheKey, newReleases);
            return newReleases;
        } catch (error) {
            console.error('Failed to fetch new releases:', error);
            return [];
        }
    }

    // Get ongoing anime
    async getOngoingAnime() {
        const cacheKey = 'ongoing';
        const cached = this.getCached(cacheKey);
        if (cached) return cached;

        try {
            const html = await this.makeRequest(`${this.baseURL}/ongoing`);
            const ongoing = this.parseAnimeList(html);
            this.setCache(cacheKey, ongoing);
            return ongoing;
        } catch (error) {
            console.error('Failed to fetch ongoing anime:', error);
            return [];
        }
    }

    // Search anime
    async searchAnime(query, page = 1) {
        if (!query.trim()) return [];

        const cacheKey = `search-${query}-${page}`;
        const cached = this.getCached(cacheKey);
        if (cached) return cached;

        try {
            const searchURL = `${this.baseURL}/search?keyword=${encodeURIComponent(query)}&page=${page}`;
            const html = await this.makeRequest(searchURL);
            const results = this.parseAnimeList(html);
            this.setCache(cacheKey, results);
            return results;
        } catch (error) {
            console.error('Failed to search anime:', error);
            return [];
        }
    }

    // Get anime details
    async getAnimeDetails(animeId) {
        const cacheKey = `details-${animeId}`;
        const cached = this.getCached(cacheKey);
        if (cached) return cached;

        try {
            const html = await this.makeRequest(`${this.baseURL}/watch/${animeId}`);
            const details = this.parseAnimeDetails(html);
            this.setCache(cacheKey, details);
            return details;
        } catch (error) {
            console.error('Failed to fetch anime details:', error);
            return null;
        }
    }

    // Parse anime details from HTML
    parseAnimeDetails(html) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        
        const title = doc.querySelector('.anisc-detail h3')?.textContent.trim() || '';
        const poster = doc.querySelector('.film-poster img')?.src || '';
        const synopsis = doc.querySelector('.film-description .text')?.textContent.trim() || '';
        
        // Parse metadata
        const metaItems = doc.querySelectorAll('.anisc-info .item');
        const metadata = {};
        
        metaItems.forEach(item => {
            const label = item.querySelector('.item-title')?.textContent.trim().toLowerCase();
            const value = item.querySelector('.name')?.textContent.trim() || item.textContent.trim();
            
            if (label) {
                metadata[label] = value;
            }
        });

        // Parse genres
        const genreElements = doc.querySelectorAll('.item:has(.item-title:contains("Genres")) a');
        const genres = Array.from(genreElements).map(el => el.textContent.trim());

        // Parse episodes
        const episodes = this.parseEpisodeList(doc);

        return {
            title,
            poster,
            synopsis,
            year: metadata['aired'] || '',
            status: metadata['status'] || '',
            episodes: metadata['episodes'] || episodes.length.toString(),
            rating: metadata['mal score'] || '',
            genres,
            episodeList: episodes
        };
    }

    // Parse episode list
    parseEpisodeList(doc) {
        const episodeElements = doc.querySelectorAll('.ss-list a');
        return Array.from(episodeElements).map((el, index) => ({
            number: index + 1,
            title: el.textContent.trim() || `Episode ${index + 1}`,
            url: el.getAttribute('href') || '',
            id: el.getAttribute('data-id') || ''
        }));
    }

    // Get video sources for an episode
    async getEpisodeSources(episodeId) {
        try {
            // This is a simplified version - in a real implementation,
            // you would need to handle the complex streaming URL extraction
            const response = await this.makeRequest(`${this.baseURL}/ajax/v2/episode/sources?id=${episodeId}`);
            const data = JSON.parse(response);
            
            return {
                sources: [
                    {
                        url: data.link || '',
                        quality: '1080p',
                        type: 'mp4'
                    }
                ],
                subtitles: [
                    {
                        url: '',
                        language: 'en',
                        label: 'English'
                    }
                ]
            };
        } catch (error) {
            console.error('Failed to fetch episode sources:', error);
            return { sources: [], subtitles: [] };
        }
    }

    // Get genres list
    async getGenres() {
        const cacheKey = 'genres';
        const cached = this.getCached(cacheKey);
        if (cached) return cached;

        try {
            const html = await this.makeRequest(`${this.baseURL}/genre`);
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            
            const genreElements = doc.querySelectorAll('.genre-list a');
            const genres = Array.from(genreElements).map(el => ({
                name: el.textContent.trim(),
                url: el.getAttribute('href')
            }));
            
            this.setCache(cacheKey, genres);
            return genres;
        } catch (error) {
            console.error('Failed to fetch genres:', error);
            return [];
        }
    }

    // Get anime by genre
    async getAnimeByGenre(genreName, page = 1) {
        try {
            const genreURL = `${this.baseURL}/genre/${genreName.toLowerCase()}?page=${page}`;
            const html = await this.makeRequest(genreURL);
            return this.parseAnimeList(html);
        } catch (error) {
            console.error('Failed to fetch anime by genre:', error);
            return [];
        }
    }

    // Get anime calendar/schedule
    async getAnimeCalendar() {
        const cacheKey = 'calendar';
        const cached = this.getCached(cacheKey);
        if (cached) return cached;

        try {
            // This would need to be implemented based on HiAnime's schedule page
            const html = await this.makeRequest(`${this.baseURL}/schedule`);
            const calendar = this.parseCalendarData(html);
            this.setCache(cacheKey, calendar);
            return calendar;
        } catch (error) {
            console.error('Failed to fetch anime calendar:', error);
            return {};
        }
    }

    parseCalendarData(html) {
        // Parse schedule data from HTML
        // This is a placeholder implementation
        const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
        const schedule = {};
        
        days.forEach(day => {
            schedule[day] = [];
        });
        
        return schedule;
    }
}

// Export the API instance
window.hiAnimeAPI = new HiAnimeAPI();
