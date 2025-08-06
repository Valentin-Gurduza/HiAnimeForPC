// Main application entry point
class HiAnimeApp {
    constructor() {
        this.isInitialized = false;
        this.downloadManager = null;
        this.notificationManager = null;
        
        this.initialize();
    }

    // Initialize the application
    async initialize() {
        try {
            // Wait for DOM to be ready
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => this.start());
            } else {
                this.start();
            }
        } catch (error) {
            console.error('Failed to initialize app:', error);
        }
    }

    // Start the application
    async start() {
        console.log('Starting HiAnime For PC...');
        
        try {
            // Initialize core components
            await this.initializeComponents();
            
            // Setup global error handling
            this.setupErrorHandling();
            
            // Setup periodic tasks
            this.setupPeriodicTasks();
            
            // Load initial content
            await this.loadInitialContent();
            
            // Setup app-specific features
            this.setupAppFeatures();
            
            this.isInitialized = true;
            console.log('HiAnime For PC initialized successfully');
            
        } catch (error) {
            console.error('Failed to start app:', error);
            this.showErrorMessage('Failed to start application');
        }
    }

    // Initialize core components
    async initializeComponents() {
        // Components are already initialized via their respective files
        // This method can be used for any additional initialization
        
        // Initialize download manager
        this.downloadManager = new DownloadManager();
        
        // Initialize notification manager
        this.notificationManager = new NotificationManager();
        
        // Setup keyboard shortcuts
        this.setupGlobalKeyboardShortcuts();
    }

    // Setup global error handling
    setupErrorHandling() {
        window.addEventListener('error', (event) => {
            console.error('Global error:', event.error);
            this.handleError(event.error);
        });

        window.addEventListener('unhandledrejection', (event) => {
            console.error('Unhandled promise rejection:', event.reason);
            this.handleError(event.reason);
        });
    }

    // Handle errors gracefully
    handleError(error) {
        if (error.name === 'NetworkError' || error.message.includes('fetch')) {
            uiManager.showToast('Network connection error. Please check your internet connection.', 'error');
        } else if (error.message.includes('video') || error.message.includes('player')) {
            uiManager.showToast('Video playback error. Trying alternative source...', 'error');
        } else {
            uiManager.showToast('An unexpected error occurred', 'error');
        }
    }

    // Setup periodic tasks
    setupPeriodicTasks() {
        // Check for new episodes of favorited anime (every 30 minutes)
        setInterval(() => {
            this.checkForNewEpisodes();
        }, 30 * 60 * 1000);

        // Clean up old cache data (every hour)
        setInterval(() => {
            this.cleanupCache();
        }, 60 * 60 * 1000);

        // Save app state (every 5 minutes)
        setInterval(() => {
            this.saveAppState();
        }, 5 * 60 * 1000);
    }

    // Load initial content
    async loadInitialContent() {
        // Load home page content by default
        if (uiManager) {
            await uiManager.loadPageContent('home');
        }
    }

    // Setup app-specific features
    setupAppFeatures() {
        // Setup download functionality
        this.setupDownloadFeature();
        
        // Setup notification feature
        this.setupNotificationFeature();
        
        // Setup app menu integration
        this.setupAppMenuIntegration();
    }

    // Setup global keyboard shortcuts
    setupGlobalKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + S: Quick search
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                const searchInput = document.getElementById('search-input');
                searchInput?.focus();
            }
            
            // Ctrl/Cmd + F: Toggle favorites
            if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
                e.preventDefault();
                uiManager.navigateToPage('favorites');
            }
            
            // Ctrl/Cmd + H: Go to home
            if ((e.ctrlKey || e.metaKey) && e.key === 'h') {
                e.preventDefault();
                uiManager.navigateToPage('home');
            }
            
            // Escape: Go back or close modals
            if (e.key === 'Escape') {
                this.handleEscapeKey();
            }
        });
    }

    // Handle escape key
    handleEscapeKey() {
        // Close any open modals or overlays
        const modals = document.querySelectorAll('.modal, .overlay');
        modals.forEach(modal => {
            if (modal.style.display !== 'none') {
                modal.style.display = 'none';
            }
        });
        
        // Exit fullscreen if active
        if (document.fullscreenElement) {
            document.exitFullscreen();
        }
    }

    // Setup download feature
    setupDownloadFeature() {
        // Download button functionality is handled in UI manager
        // This method can be used for additional download setup
    }

    // Setup notification feature
    setupNotificationFeature() {
        if ('Notification' in window) {
            // Request permission for notifications
            if (Notification.permission === 'default') {
                Notification.requestPermission().then(permission => {
                    console.log('Notification permission:', permission);
                });
            }
        }
    }

    // Setup app menu integration
    setupAppMenuIntegration() {
        // Menu integration is handled in main.js
        // This method can be used for additional menu setup
    }

    // Check for new episodes
    async checkForNewEpisodes() {
        if (!appStorage.getSetting('notifications')) return;
        
        const favorites = appStorage.getFavorites();
        
        for (const favorite of favorites) {
            try {
                const details = await hiAnimeAPI.getAnimeDetails(favorite.id);
                if (details && details.episodes !== favorite.episodes) {
                    // New episodes detected
                    this.notificationManager.showNewEpisodeNotification(favorite, details.episodes);
                    
                    // Update favorite with new episode count
                    appStorage.addToFavorites({ ...favorite, episodes: details.episodes });
                }
            } catch (error) {
                console.error('Failed to check for new episodes:', error);
            }
        }
    }

    // Clean up cache
    cleanupCache() {
        // Clear old API cache
        if (hiAnimeAPI && hiAnimeAPI.cache) {
            const now = Date.now();
            const cacheTimeout = 30 * 60 * 1000; // 30 minutes
            
            for (const [key, value] of hiAnimeAPI.cache.entries()) {
                if (now - value.timestamp > cacheTimeout) {
                    hiAnimeAPI.cache.delete(key);
                }
            }
        }
        
        // Clear old localStorage items
        this.cleanupLocalStorage();
    }

    // Clean up localStorage
    cleanupLocalStorage() {
        const keys = Object.keys(localStorage);
        const now = Date.now();
        
        keys.forEach(key => {
            if (key.startsWith('temp-') || key.startsWith('cache-')) {
                try {
                    const data = JSON.parse(localStorage.getItem(key));
                    if (data.timestamp && now - data.timestamp > 24 * 60 * 60 * 1000) {
                        localStorage.removeItem(key);
                    }
                } catch (error) {
                    // Remove invalid items
                    localStorage.removeItem(key);
                }
            }
        });
    }

    // Save app state
    saveAppState() {
        const state = {
            currentPage: uiManager?.currentPage,
            currentAnime: uiManager?.currentAnime?.id,
            currentEpisode: uiManager?.currentEpisode?.number,
            timestamp: Date.now()
        };
        
        localStorage.setItem('appState', JSON.stringify(state));
    }

    // Restore app state
    restoreAppState() {
        try {
            const state = JSON.parse(localStorage.getItem('appState'));
            if (state && Date.now() - state.timestamp < 24 * 60 * 60 * 1000) {
                // Restore state if less than 24 hours old
                if (state.currentPage && state.currentPage !== 'home') {
                    uiManager.navigateToPage(state.currentPage);
                }
            }
        } catch (error) {
            console.error('Failed to restore app state:', error);
        }
    }

    // Show error message
    showErrorMessage(message) {
        if (uiManager) {
            uiManager.showToast(message, 'error');
        } else {
            alert(message);
        }
    }

    // App lifecycle methods
    onBeforeUnload() {
        this.saveAppState();
    }

    onUnload() {
        // Cleanup resources
        if (this.downloadManager) {
            this.downloadManager.cleanup();
        }
    }
}

// Download Manager
class DownloadManager {
    constructor() {
        this.activeDownloads = new Map();
        this.downloadQueue = [];
    }

    // Start download
    async startDownload(anime, episode) {
        try {
            if (window.electronAPI) {
                const result = await window.electronAPI.showSaveDialog();
                if (!result.canceled) {
                    const download = appStorage.addDownload(anime, episode, result.filePath);
                    this.processDownload(download);
                    uiManager.showToast('Download started', 'success');
                }
            } else {
                uiManager.showToast('Download not available in browser', 'error');
            }
        } catch (error) {
            console.error('Download failed:', error);
            uiManager.showToast('Download failed', 'error');
        }
    }

    // Process download
    async processDownload(download) {
        // This is a placeholder - actual download implementation would
        // require additional backend services or integration with download libraries
        
        appStorage.updateDownload(download.id, { status: 'downloading', progress: 0 });
        
        // Simulate download progress
        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.random() * 10;
            if (progress >= 100) {
                progress = 100;
                clearInterval(interval);
                appStorage.updateDownload(download.id, { status: 'completed', progress: 100 });
                uiManager.showToast(`${download.anime.title} episode ${download.episode.number} downloaded`, 'success');
            } else {
                appStorage.updateDownload(download.id, { progress: Math.floor(progress) });
            }
        }, 1000);
    }

    cleanup() {
        // Cleanup any active downloads
        this.activeDownloads.clear();
    }
}

// Notification Manager
class NotificationManager {
    constructor() {
        this.notificationQueue = [];
    }

    // Show new episode notification
    showNewEpisodeNotification(anime, newEpisodeCount) {
        if ('Notification' in window && Notification.permission === 'granted') {
            const notification = new Notification('New Episode Available!', {
                body: `${anime.title} has new episodes (${newEpisodeCount} total)`,
                icon: anime.poster || '../assets/icon.png',
                tag: `new-episode-${anime.id}`
            });

            notification.onclick = () => {
                // Focus the app and navigate to the anime
                window.focus();
                if (uiManager) {
                    uiManager.showAnimeDetails(anime);
                }
                notification.close();
            };
        }
    }

    // Show download complete notification
    showDownloadCompleteNotification(anime, episode) {
        if ('Notification' in window && Notification.permission === 'granted') {
            const notification = new Notification('Download Complete!', {
                body: `${anime.title} - Episode ${episode.number}`,
                icon: anime.poster || '../assets/icon.png',
                tag: `download-complete-${anime.id}-${episode.number}`
            });

            notification.onclick = () => {
                window.focus();
                notification.close();
            };
        }
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    window.hiAnimeApp = new HiAnimeApp();
});

// Handle app lifecycle events
window.addEventListener('beforeunload', () => {
    if (window.hiAnimeApp) {
        window.hiAnimeApp.onBeforeUnload();
    }
});

window.addEventListener('unload', () => {
    if (window.hiAnimeApp) {
        window.hiAnimeApp.onUnload();
    }
});
