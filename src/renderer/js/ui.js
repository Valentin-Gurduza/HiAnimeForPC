// UI Management module
class UIManager {
    constructor() {
        this.currentPage = 'home';
        this.currentAnime = null;
        this.currentEpisode = null;
        this.loadingOverlay = document.getElementById('loading-overlay');
        this.toastContainer = document.getElementById('toast-container');
        this.searchTimeout = null;
        
        this.initializeEventListeners();
        this.applyTheme();
    }

    // Initialize all event listeners
    initializeEventListeners() {
        // Navigation
        this.setupNavigation();
        
        // Search
        this.setupSearch();
        
        // Theme toggle
        this.setupThemeToggle();
        
        // Settings
        this.setupSettings();
        
        // Electron menu handlers
        this.setupElectronHandlers();
    }

    // Setup navigation
    setupNavigation() {
        const menuItems = document.querySelectorAll('.menu-item');
        menuItems.forEach(item => {
            item.addEventListener('click', () => {
                const page = item.dataset.page;
                this.navigateToPage(page);
                
                // Update active menu item
                menuItems.forEach(mi => mi.classList.remove('active'));
                item.classList.add('active');
            });
        });

        // Back buttons
        document.getElementById('back-btn')?.addEventListener('click', () => {
            this.navigateToPage('home');
        });

        document.getElementById('player-back-btn')?.addEventListener('click', () => {
            if (this.currentAnime) {
                this.showAnimeDetails(this.currentAnime);
            } else {
                this.navigateToPage('home');
            }
        });
    }

    // Setup search functionality
    setupSearch() {
        const searchInput = document.getElementById('search-input');
        const searchBtn = document.getElementById('search-btn');

        const performSearch = () => {
            const query = searchInput.value.trim();
            if (query) {
                this.searchAnime(query);
                appStorage.addToSearchHistory(query);
            }
        };

        searchBtn?.addEventListener('click', performSearch);
        
        searchInput?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                performSearch();
            }
        });

        // Real-time search suggestions (debounced)
        searchInput?.addEventListener('input', (e) => {
            clearTimeout(this.searchTimeout);
            this.searchTimeout = setTimeout(() => {
                const query = e.target.value.trim();
                if (query.length >= 2) {
                    this.showSearchSuggestions(query);
                }
            }, 300);
        });
    }

    // Setup theme toggle
    setupThemeToggle() {
        const themeToggle = document.getElementById('theme-toggle');
        themeToggle?.addEventListener('click', () => {
            this.toggleTheme();
        });
    }

    // Setup settings
    setupSettings() {
        const settingsBtn = document.getElementById('settings-btn');
        settingsBtn?.addEventListener('click', () => {
            this.navigateToPage('settings');
        });
    }

    // Setup Electron menu handlers
    setupElectronHandlers() {
        if (window.electronAPI) {
            window.electronAPI.onOpenSettings(() => {
                this.navigateToPage('settings');
            });

            window.electronAPI.onTogglePlayback(() => {
                this.toggleVideoPlayback();
            });

            window.electronAPI.onNextEpisode(() => {
                this.playNextEpisode();
            });

            window.electronAPI.onPreviousEpisode(() => {
                this.playPreviousEpisode();
            });

            window.electronAPI.onToggleFullscreen(() => {
                this.toggleVideoFullscreen();
            });
        }
    }

    // Navigation methods
    navigateToPage(pageName) {
        // Hide all pages
        const pages = document.querySelectorAll('.page');
        pages.forEach(page => page.classList.remove('active'));

        // Show target page
        const targetPage = document.getElementById(`${pageName}-page`);
        if (targetPage) {
            targetPage.classList.add('active');
            this.currentPage = pageName;

            // Load page-specific content
            this.loadPageContent(pageName);
        }
    }

    // Load content for specific pages
    async loadPageContent(pageName) {
        this.showLoading();

        try {
            switch (pageName) {
                case 'home':
                    await this.loadHomePage();
                    break;
                case 'trending':
                    await this.loadTrendingPage();
                    break;
                case 'new-releases':
                    await this.loadNewReleasesPage();
                    break;
                case 'ongoing':
                    await this.loadOngoingPage();
                    break;
                case 'history':
                    this.loadHistoryPage();
                    break;
                case 'downloads':
                    this.loadDownloadsPage();
                    break;
                case 'calendar':
                    await this.loadCalendarPage();
                    break;
                case 'settings':
                    this.loadSettingsPage();
                    break;
            }
        } catch (error) {
            console.error(`Failed to load ${pageName} page:`, error);
            this.showToast('Failed to load content', 'error');
        } finally {
            this.hideLoading();
        }
    }

    // Home page loading
    async loadHomePage() {
        const continueWatching = appStorage.getContinueWatching();
        if (continueWatching.length > 0) {
            document.getElementById('continue-watching-section').style.display = 'block';
            this.renderAnimeGrid('continue-watching-grid', continueWatching.slice(0, 6));
        }

        // Load trending, new releases, and ongoing in parallel
        const [trending, newReleases, ongoing] = await Promise.all([
            hiAnimeAPI.getTrendingAnime(),
            hiAnimeAPI.getNewReleases(),
            hiAnimeAPI.getOngoingAnime()
        ]);

        this.renderAnimeGrid('trending-grid', trending.slice(0, 12));
        this.renderAnimeGrid('new-releases-grid', newReleases.slice(0, 12));
        this.renderAnimeGrid('ongoing-grid', ongoing.slice(0, 12));
    }

    // Other page loading methods
    async loadTrendingPage() {
        const trending = await hiAnimeAPI.getTrendingAnime();
        document.querySelector('#trending-page .page-title').textContent = 'Trending Anime';
        this.renderAnimeGrid('trending-grid', trending);
    }

    async loadNewReleasesPage() {
        const newReleases = await hiAnimeAPI.getNewReleases();
        document.querySelector('#new-releases-page .page-title').textContent = 'New Releases';
        this.renderAnimeGrid('new-releases-grid', newReleases);
    }

    async loadOngoingPage() {
        const ongoing = await hiAnimeAPI.getOngoingAnime();
        document.querySelector('#ongoing-page .page-title').textContent = 'Ongoing Anime';
        this.renderAnimeGrid('ongoing-grid', ongoing);
    }

    loadHistoryPage() {
        const history = appStorage.getWatchHistory();
        this.renderAnimeGrid('history-grid', history);
    }

    loadDownloadsPage() {
        const downloads = appStorage.getDownloads();
        this.renderDownloadsList(downloads);
    }

    async loadCalendarPage() {
        const calendar = await hiAnimeAPI.getAnimeCalendar();
        this.renderCalendar(calendar);
    }

    loadSettingsPage() {
        const settings = appStorage.getSettings();
        this.populateSettings(settings);
    }

    // Render anime grid
    renderAnimeGrid(containerId, animeList) {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = '';

        animeList.forEach(anime => {
            const card = this.createAnimeCard(anime);
            container.appendChild(card);
        });
    }

    // Create anime card element
    createAnimeCard(anime) {
        const card = document.createElement('div');
        card.className = 'anime-card fade-in';
        card.innerHTML = `
            <div class="anime-poster">
                <img src="${anime.poster}" alt="${anime.title}" loading="lazy" onerror="this.src='../assets/placeholder.png'">
            </div>
            <div class="anime-info">
                <h3 class="anime-title">${anime.title}</h3>
                <div class="anime-meta">
                    ${anime.year ? `<span class="meta-item">${anime.year}</span>` : ''}
                    ${anime.type ? `<span class="meta-item">${anime.type}</span>` : ''}
                    ${anime.episodes ? `<span class="meta-item">${anime.episodes} eps</span>` : ''}
                </div>
            </div>
        `;

        card.addEventListener('click', () => {
            this.showAnimeDetails(anime);
        });

        return card;
    }

    // Show anime details
    async showAnimeDetails(anime) {
        this.showLoading();
        
        try {
            const details = await hiAnimeAPI.getAnimeDetails(anime.id);
            if (details) {
                this.currentAnime = { ...anime, ...details };
                this.renderAnimeDetails(this.currentAnime);
                this.navigateToPage('anime-detail');
                
                // Add to watch history
                appStorage.addToWatchHistory(this.currentAnime);
            }
        } catch (error) {
            console.error('Failed to load anime details:', error);
            this.showToast('Failed to load anime details', 'error');
        } finally {
            this.hideLoading();
        }
    }

    // Render anime details
    renderAnimeDetails(anime) {
        document.getElementById('detail-poster').src = anime.poster;
        document.getElementById('detail-title').textContent = anime.title;
        document.getElementById('detail-year').textContent = anime.year;
        document.getElementById('detail-status').textContent = anime.status;
        document.getElementById('detail-episodes').textContent = `${anime.episodes} episodes`;
        document.getElementById('detail-rating').textContent = anime.rating;
        document.getElementById('detail-synopsis').textContent = anime.synopsis;

        // Render genres
        const genresContainer = document.getElementById('detail-genres');
        genresContainer.innerHTML = '';
        anime.genres?.forEach(genre => {
            const tag = document.createElement('span');
            tag.className = 'genre-tag';
            tag.textContent = genre;
            genresContainer.appendChild(tag);
        });

        // Render episodes
        this.renderEpisodesList(anime.episodeList || []);

        // Update favorite button
        const favoriteBtn = document.getElementById('favorite-btn');
        const isFav = appStorage.isFavorite(anime.id);
        favoriteBtn.innerHTML = isFav ? 
            '<i class="fas fa-heart"></i> Remove from List' : 
            '<i class="fas fa-heart"></i> Add to List';
        favoriteBtn.className = isFav ? 'action-btn favorite-btn active' : 'action-btn favorite-btn';

        favoriteBtn.onclick = () => {
            if (appStorage.isFavorite(anime.id)) {
                appStorage.removeFromFavorites(anime.id);
                this.showToast('Removed from favorites', 'info');
            } else {
                appStorage.addToFavorites(anime);
                this.showToast('Added to favorites', 'success');
            }
            this.renderAnimeDetails(anime); // Refresh the button state
        };
    }

    // Render episodes list
    renderEpisodesList(episodes) {
        const container = document.getElementById('episodes-grid');
        container.innerHTML = '';

        episodes.forEach(episode => {
            const episodeCard = document.createElement('div');
            episodeCard.className = 'episode-card';
            episodeCard.innerHTML = `
                <div class="episode-number">Episode ${episode.number}</div>
                <div class="episode-title">${episode.title}</div>
            `;

            episodeCard.addEventListener('click', () => {
                this.playEpisode(episode);
            });

            container.appendChild(episodeCard);
        });
    }

    // Play episode
    async playEpisode(episode) {
        if (!this.currentAnime) return;

        this.showLoading();
        this.currentEpisode = episode;

        try {
            const sources = await hiAnimeAPI.getEpisodeSources(episode.id);
            if (sources.sources.length > 0) {
                this.navigateToPage('player');
                await window.videoPlayer.loadEpisode(this.currentAnime, episode, sources);
                
                // Add to continue watching
                appStorage.addToContinueWatching(this.currentAnime, episode, 0);
            } else {
                this.showToast('No video sources available', 'error');
            }
        } catch (error) {
            console.error('Failed to load episode:', error);
            this.showToast('Failed to load episode', 'error');
        } finally {
            this.hideLoading();
        }
    }

    // Search anime
    async searchAnime(query) {
        this.showLoading();
        
        try {
            const results = await hiAnimeAPI.searchAnime(query);
            this.renderSearchResults(results, query);
            this.navigateToPage('search');
        } catch (error) {
            console.error('Search failed:', error);
            this.showToast('Search failed', 'error');
        } finally {
            this.hideLoading();
        }
    }

    // Render search results
    renderSearchResults(results, query) {
        document.querySelector('#search-page .page-title').textContent = `Search Results for "${query}"`;
        this.renderAnimeGrid('search-results-grid', results);
    }

    // Theme management
    toggleTheme() {
        const body = document.body;
        const themeToggle = document.getElementById('theme-toggle');
        
        if (body.classList.contains('theme-dark')) {
            body.classList.remove('theme-dark');
            body.classList.add('theme-light');
            themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
            appStorage.setSetting('theme', 'light');
        } else {
            body.classList.remove('theme-light');
            body.classList.add('theme-dark');
            themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
            appStorage.setSetting('theme', 'dark');
        }
    }

    applyTheme() {
        const theme = appStorage.getSetting('theme') || 'dark';
        const body = document.body;
        const themeToggle = document.getElementById('theme-toggle');
        
        body.className = `theme-${theme}`;
        
        if (themeToggle) {
            themeToggle.innerHTML = theme === 'dark' ? 
                '<i class="fas fa-moon"></i>' : 
                '<i class="fas fa-sun"></i>';
        }
    }

    // Video playback controls
    toggleVideoPlayback() {
        if (window.videoPlayer) {
            window.videoPlayer.togglePlayback();
        }
    }

    playNextEpisode() {
        if (window.videoPlayer) {
            window.videoPlayer.playNext();
        }
    }

    playPreviousEpisode() {
        if (window.videoPlayer) {
            window.videoPlayer.playPrevious();
        }
    }

    toggleVideoFullscreen() {
        if (window.videoPlayer) {
            window.videoPlayer.toggleFullscreen();
        }
    }

    // Loading state
    showLoading() {
        this.loadingOverlay.style.display = 'flex';
    }

    hideLoading() {
        this.loadingOverlay.style.display = 'none';
    }

    // Toast notifications
    showToast(message, type = 'info', duration = 3000) {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const icon = type === 'success' ? 'check-circle' : 
                     type === 'error' ? 'exclamation-circle' : 
                     'info-circle';
        
        toast.innerHTML = `
            <i class="fas fa-${icon}"></i>
            <span>${message}</span>
        `;

        this.toastContainer.appendChild(toast);

        // Auto remove
        setTimeout(() => {
            toast.remove();
        }, duration);
    }

    // Settings population
    populateSettings(settings) {
        Object.keys(settings).forEach(key => {
            const element = document.getElementById(key.replace(/([A-Z])/g, '-$1').toLowerCase());
            if (element) {
                if (element.type === 'checkbox') {
                    element.checked = settings[key];
                } else {
                    element.value = settings[key];
                }
            }
        });
    }
}

// Initialize UI Manager
window.uiManager = new UIManager();
