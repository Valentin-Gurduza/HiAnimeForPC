// Storage module for managing app data
class AppStorage {
    constructor() {
        this.storageKey = 'hiAnimeApp';
        this.data = this.loadData();
    }

    // Load data from localStorage
    loadData() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            return stored ? JSON.parse(stored) : this.getDefaultData();
        } catch (error) {
            console.error('Failed to load data from localStorage:', error);
            return this.getDefaultData();
        }
    }

    // Save data to localStorage
    saveData() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.data));
        } catch (error) {
            console.error('Failed to save data to localStorage:', error);
        }
    }

    // Get default data structure
    getDefaultData() {
        return {
            favorites: [],
            watchHistory: [],
            continueWatching: [],
            settings: {
                theme: 'dark',
                defaultQuality: 'auto',
                autoplayNext: true,
                autoplayCountdown: 10,
                defaultSubtitleLang: 'en',
                subtitleSize: 'medium',
                downloadDirectory: '',
                downloadQuality: '1080p',
                notifications: false
            },
            downloads: [],
            searchHistory: []
        };
    }

    // Favorites management
    getFavorites() {
        return this.data.favorites || [];
    }

    addToFavorites(anime) {
        if (!this.data.favorites) this.data.favorites = [];
        
        const exists = this.data.favorites.find(fav => fav.id === anime.id);
        if (!exists) {
            this.data.favorites.unshift({
                ...anime,
                addedAt: Date.now()
            });
            this.saveData();
            return true;
        }
        return false;
    }

    removeFromFavorites(animeId) {
        if (!this.data.favorites) return false;
        
        const index = this.data.favorites.findIndex(fav => fav.id === animeId);
        if (index !== -1) {
            this.data.favorites.splice(index, 1);
            this.saveData();
            return true;
        }
        return false;
    }

    isFavorite(animeId) {
        return this.data.favorites?.some(fav => fav.id === animeId) || false;
    }

    // Watch history management
    getWatchHistory() {
        return this.data.watchHistory || [];
    }

    addToWatchHistory(anime, episode = null) {
        if (!this.data.watchHistory) this.data.watchHistory = [];
        
        // Remove existing entry if present
        this.data.watchHistory = this.data.watchHistory.filter(item => item.id !== anime.id);
        
        // Add to beginning of list
        this.data.watchHistory.unshift({
            ...anime,
            lastWatched: Date.now(),
            lastEpisode: episode
        });
        
        // Keep only last 100 items
        if (this.data.watchHistory.length > 100) {
            this.data.watchHistory = this.data.watchHistory.slice(0, 100);
        }
        
        this.saveData();
    }

    clearWatchHistory() {
        this.data.watchHistory = [];
        this.saveData();
    }

    // Continue watching management
    getContinueWatching() {
        return this.data.continueWatching || [];
    }

    addToContinueWatching(anime, episode, progress = 0) {
        if (!this.data.continueWatching) this.data.continueWatching = [];
        
        // Remove existing entry
        this.data.continueWatching = this.data.continueWatching.filter(item => item.id !== anime.id);
        
        // Only add if not completed (progress < 90%)
        if (progress < 0.9) {
            this.data.continueWatching.unshift({
                ...anime,
                currentEpisode: episode,
                progress: progress,
                updatedAt: Date.now()
            });
            
            // Keep only last 20 items
            if (this.data.continueWatching.length > 20) {
                this.data.continueWatching = this.data.continueWatching.slice(0, 20);
            }
        }
        
        this.saveData();
    }

    removeFromContinueWatching(animeId) {
        if (!this.data.continueWatching) return;
        
        this.data.continueWatching = this.data.continueWatching.filter(item => item.id !== animeId);
        this.saveData();
    }

    // Settings management
    getSettings() {
        return { ...this.getDefaultData().settings, ...this.data.settings };
    }

    getSetting(key) {
        const settings = this.getSettings();
        return settings[key];
    }

    setSetting(key, value) {
        if (!this.data.settings) this.data.settings = {};
        this.data.settings[key] = value;
        this.saveData();
    }

    setSettings(newSettings) {
        this.data.settings = { ...this.getSettings(), ...newSettings };
        this.saveData();
    }

    resetSettings() {
        this.data.settings = this.getDefaultData().settings;
        this.saveData();
    }

    // Downloads management
    getDownloads() {
        return this.data.downloads || [];
    }

    addDownload(anime, episode, filePath, status = 'pending') {
        if (!this.data.downloads) this.data.downloads = [];
        
        const download = {
            id: `${anime.id}-${episode.number}`,
            anime: anime,
            episode: episode,
            filePath: filePath,
            status: status, // pending, downloading, completed, failed
            progress: 0,
            addedAt: Date.now(),
            completedAt: null
        };
        
        this.data.downloads.unshift(download);
        this.saveData();
        
        return download;
    }

    updateDownload(downloadId, updates) {
        if (!this.data.downloads) return false;
        
        const index = this.data.downloads.findIndex(dl => dl.id === downloadId);
        if (index !== -1) {
            this.data.downloads[index] = { ...this.data.downloads[index], ...updates };
            
            if (updates.status === 'completed') {
                this.data.downloads[index].completedAt = Date.now();
            }
            
            this.saveData();
            return true;
        }
        return false;
    }

    removeDownload(downloadId) {
        if (!this.data.downloads) return false;
        
        const index = this.data.downloads.findIndex(dl => dl.id === downloadId);
        if (index !== -1) {
            this.data.downloads.splice(index, 1);
            this.saveData();
            return true;
        }
        return false;
    }

    // Search history management
    getSearchHistory() {
        return this.data.searchHistory || [];
    }

    addToSearchHistory(query) {
        if (!query.trim()) return;
        
        if (!this.data.searchHistory) this.data.searchHistory = [];
        
        // Remove existing entry
        this.data.searchHistory = this.data.searchHistory.filter(item => item !== query);
        
        // Add to beginning
        this.data.searchHistory.unshift(query);
        
        // Keep only last 20 searches
        if (this.data.searchHistory.length > 20) {
            this.data.searchHistory = this.data.searchHistory.slice(0, 20);
        }
        
        this.saveData();
    }

    clearSearchHistory() {
        this.data.searchHistory = [];
        this.saveData();
    }

    // Export/Import data
    exportData() {
        return JSON.stringify(this.data, null, 2);
    }

    importData(jsonData) {
        try {
            const imported = JSON.parse(jsonData);
            this.data = { ...this.getDefaultData(), ...imported };
            this.saveData();
            return true;
        } catch (error) {
            console.error('Failed to import data:', error);
            return false;
        }
    }

    // Clear all data
    clearAllData() {
        this.data = this.getDefaultData();
        this.saveData();
    }

    // Statistics
    getStats() {
        const favorites = this.getFavorites().length;
        const watchHistory = this.getWatchHistory().length;
        const downloads = this.getDownloads().length;
        const completedDownloads = this.getDownloads().filter(dl => dl.status === 'completed').length;
        
        return {
            favorites,
            watchHistory,
            downloads,
            completedDownloads
        };
    }
}

// Create global storage instance
window.appStorage = new AppStorage();
