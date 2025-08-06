// Video Player module
class VideoPlayer {
    constructor() {
        this.video = document.getElementById('video-player');
        this.currentAnime = null;
        this.currentEpisode = null;
        this.episodes = [];
        this.sources = [];
        this.subtitles = [];
        this.autoplayCountdown = null;
        this.settings = appStorage.getSettings();
        
        this.initializePlayer();
    }

    // Initialize video player
    initializePlayer() {
        if (!this.video) return;

        this.setupVideoEvents();
        this.setupControlEvents();
        this.setupKeyboardShortcuts();
    }

    // Setup video element events
    setupVideoEvents() {
        this.video.addEventListener('loadstart', () => {
            this.updatePlayerInfo();
        });

        this.video.addEventListener('canplay', () => {
            this.applyDefaultSettings();
        });

        this.video.addEventListener('timeupdate', () => {
            this.saveProgress();
        });

        this.video.addEventListener('ended', () => {
            this.onVideoEnded();
        });

        this.video.addEventListener('error', (e) => {
            console.error('Video error:', e);
            uiManager.showToast('Video playback error', 'error');
        });

        // Progress tracking for continue watching
        this.video.addEventListener('timeupdate', () => {
            if (this.currentAnime && this.currentEpisode) {
                const progress = this.video.currentTime / this.video.duration;
                if (progress > 0.05) { // Save progress after 5% watched
                    appStorage.addToContinueWatching(
                        this.currentAnime, 
                        this.currentEpisode, 
                        progress
                    );
                }
            }
        });
    }

    // Setup control events
    setupControlEvents() {
        // Quality selector
        const qualitySelect = document.getElementById('quality-select');
        qualitySelect?.addEventListener('change', (e) => {
            this.changeQuality(e.target.value);
        });

        // Subtitle controls
        const subtitleToggle = document.getElementById('subtitle-toggle');
        const subtitleLanguage = document.getElementById('subtitle-language');
        
        subtitleToggle?.addEventListener('click', () => {
            this.toggleSubtitles();
        });

        subtitleLanguage?.addEventListener('change', (e) => {
            this.changeSubtitleLanguage(e.target.value);
        });

        // Episode navigation
        document.getElementById('prev-episode-btn')?.addEventListener('click', () => {
            this.playPrevious();
        });

        document.getElementById('next-episode-btn')?.addEventListener('click', () => {
            this.playNext();
        });

        // Autoplay countdown controls
        document.getElementById('cancel-autoplay')?.addEventListener('click', () => {
            this.cancelAutoplay();
        });

        document.getElementById('play-next-now')?.addEventListener('click', () => {
            this.playNext();
        });
    }

    // Setup keyboard shortcuts
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            if (uiManager.currentPage !== 'player') return;

            switch (e.code) {
                case 'Space':
                    e.preventDefault();
                    this.togglePlayback();
                    break;
                case 'ArrowLeft':
                    if (e.ctrlKey || e.metaKey) {
                        e.preventDefault();
                        this.playPrevious();
                    } else {
                        this.seekBackward();
                    }
                    break;
                case 'ArrowRight':
                    if (e.ctrlKey || e.metaKey) {
                        e.preventDefault();
                        this.playNext();
                    } else {
                        this.seekForward();
                    }
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    this.increaseVolume();
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    this.decreaseVolume();
                    break;
                case 'KeyF':
                    e.preventDefault();
                    this.toggleFullscreen();
                    break;
                case 'KeyM':
                    e.preventDefault();
                    this.toggleMute();
                    break;
                case 'KeyC':
                    e.preventDefault();
                    this.toggleSubtitles();
                    break;
            }
        });
    }

    // Load episode
    async loadEpisode(anime, episode, sources) {
        this.currentAnime = anime;
        this.currentEpisode = episode;
        this.episodes = anime.episodeList || [];
        this.sources = sources.sources || [];
        this.subtitles = sources.subtitles || [];

        // Update player info
        this.updatePlayerInfo();

        // Load video source
        if (this.sources.length > 0) {
            this.loadVideoSource(this.sources[0]);
        }

        // Setup quality options
        this.setupQualitySelector();

        // Setup subtitle options
        this.setupSubtitleSelector();

        // Update navigation buttons
        this.updateNavigationButtons();

        // Load saved progress
        this.loadSavedProgress();
    }

    // Update player info display
    updatePlayerInfo() {
        if (!this.currentAnime || !this.currentEpisode) return;

        document.getElementById('player-anime-title').textContent = this.currentAnime.title;
        document.getElementById('player-episode-title').textContent = 
            `Episode ${this.currentEpisode.number}: ${this.currentEpisode.title}`;
    }

    // Load video source
    loadVideoSource(source) {
        this.video.src = source.url;
        this.video.load();
    }

    // Setup quality selector
    setupQualitySelector() {
        const qualitySelect = document.getElementById('quality-select');
        if (!qualitySelect) return;

        qualitySelect.innerHTML = '<option value="auto">Auto</option>';

        // Group sources by quality
        const qualityGroups = {};
        this.sources.forEach(source => {
            if (!qualityGroups[source.quality]) {
                qualityGroups[source.quality] = [];
            }
            qualityGroups[source.quality].push(source);
        });

        // Add quality options
        Object.keys(qualityGroups).sort((a, b) => {
            const qualityOrder = { '1080p': 4, '720p': 3, '480p': 2, '360p': 1 };
            return (qualityOrder[b] || 0) - (qualityOrder[a] || 0);
        }).forEach(quality => {
            const option = document.createElement('option');
            option.value = quality;
            option.textContent = quality;
            qualitySelect.appendChild(option);
        });

        // Set default quality
        const defaultQuality = this.settings.defaultQuality || 'auto';
        if (defaultQuality !== 'auto' && qualityGroups[defaultQuality]) {
            qualitySelect.value = defaultQuality;
            this.changeQuality(defaultQuality);
        }
    }

    // Setup subtitle selector
    setupSubtitleSelector() {
        const subtitleLanguage = document.getElementById('subtitle-language');
        if (!subtitleLanguage) return;

        subtitleLanguage.innerHTML = '<option value="">No Subtitles</option>';

        this.subtitles.forEach(subtitle => {
            const option = document.createElement('option');
            option.value = subtitle.language;
            option.textContent = subtitle.label;
            subtitleLanguage.appendChild(option);
        });

        // Set default subtitle language
        const defaultLang = this.settings.defaultSubtitleLang;
        if (defaultLang && this.subtitles.find(sub => sub.language === defaultLang)) {
            subtitleLanguage.value = defaultLang;
            this.changeSubtitleLanguage(defaultLang);
        }
    }

    // Change video quality
    changeQuality(quality) {
        const currentTime = this.video.currentTime;
        const wasPlaying = !this.video.paused;

        if (quality === 'auto' && this.sources.length > 0) {
            this.loadVideoSource(this.sources[0]);
        } else {
            const source = this.sources.find(s => s.quality === quality);
            if (source) {
                this.loadVideoSource(source);
            }
        }

        // Restore playback position
        this.video.addEventListener('canplay', function restoreTime() {
            this.currentTime = currentTime;
            if (wasPlaying) {
                this.play();
            }
            this.removeEventListener('canplay', restoreTime);
        });
    }

    // Toggle subtitles
    toggleSubtitles() {
        const subtitleTrack = document.getElementById('subtitle-track');
        const subtitleToggle = document.getElementById('subtitle-toggle');
        const subtitleLanguage = document.getElementById('subtitle-language');

        if (subtitleTrack.mode === 'showing') {
            subtitleTrack.mode = 'hidden';
            subtitleToggle.classList.remove('active');
            subtitleLanguage.style.display = 'none';
        } else {
            subtitleTrack.mode = 'showing';
            subtitleToggle.classList.add('active');
            subtitleLanguage.style.display = 'block';
        }
    }

    // Change subtitle language
    changeSubtitleLanguage(language) {
        const subtitleTrack = document.getElementById('subtitle-track');
        
        if (language === '') {
            subtitleTrack.mode = 'hidden';
            return;
        }

        const subtitle = this.subtitles.find(sub => sub.language === language);
        if (subtitle) {
            subtitleTrack.src = subtitle.url;
            subtitleTrack.mode = 'showing';
            
            // Apply subtitle size setting
            this.applySubtitleStyling();
        }
    }

    // Apply subtitle styling
    applySubtitleStyling() {
        const size = this.settings.subtitleSize || 'medium';
        const sizeMap = {
            'small': '14px',
            'medium': '18px',
            'large': '22px'
        };

        // Apply CSS styling to subtitle track
        const style = document.createElement('style');
        style.textContent = `
            video::cue {
                font-size: ${sizeMap[size]};
                background-color: rgba(0, 0, 0, 0.8);
                color: white;
                font-weight: bold;
            }
        `;
        document.head.appendChild(style);
    }

    // Apply default settings
    applyDefaultSettings() {
        // Apply default volume
        const savedVolume = localStorage.getItem('videoVolume');
        if (savedVolume) {
            this.video.volume = parseFloat(savedVolume);
        }

        // Apply subtitle settings
        this.applySubtitleStyling();
    }

    // Save video progress
    saveProgress() {
        if (this.video.duration && this.video.currentTime) {
            const progress = this.video.currentTime / this.video.duration;
            localStorage.setItem(`progress-${this.currentAnime?.id}-${this.currentEpisode?.number}`, progress.toString());
            
            // Save volume
            localStorage.setItem('videoVolume', this.video.volume.toString());
        }
    }

    // Load saved progress
    loadSavedProgress() {
        if (!this.currentAnime || !this.currentEpisode) return;

        const savedProgress = localStorage.getItem(`progress-${this.currentAnime.id}-${this.currentEpisode.number}`);
        if (savedProgress) {
            const progress = parseFloat(savedProgress);
            if (progress > 0.05 && progress < 0.9) { // Don't restore if at beginning or end
                this.video.addEventListener('canplay', function restoreProgress() {
                    this.currentTime = this.duration * progress;
                    this.removeEventListener('canplay', restoreProgress);
                });
            }
        }
    }

    // Video ended handler
    onVideoEnded() {
        if (this.settings.autoplayNext) {
            this.startAutoplayCountdown();
        }

        // Mark episode as completed
        if (this.currentAnime && this.currentEpisode) {
            appStorage.addToContinueWatching(this.currentAnime, this.currentEpisode, 1.0);
        }
    }

    // Start autoplay countdown
    startAutoplayCountdown() {
        const countdownElement = document.getElementById('next-episode-countdown');
        const timerElement = document.getElementById('countdown-timer');
        
        if (!this.hasNextEpisode()) return;

        let timeLeft = this.settings.autoplayCountdown || 10;
        
        countdownElement.style.display = 'block';
        timerElement.textContent = timeLeft.toString();

        this.autoplayCountdown = setInterval(() => {
            timeLeft--;
            timerElement.textContent = timeLeft.toString();

            if (timeLeft <= 0) {
                this.playNext();
            }
        }, 1000);
    }

    // Cancel autoplay countdown
    cancelAutoplay() {
        if (this.autoplayCountdown) {
            clearInterval(this.autoplayCountdown);
            this.autoplayCountdown = null;
        }
        
        const countdownElement = document.getElementById('next-episode-countdown');
        countdownElement.style.display = 'none';
    }

    // Update navigation buttons
    updateNavigationButtons() {
        const prevBtn = document.getElementById('prev-episode-btn');
        const nextBtn = document.getElementById('next-episode-btn');

        if (prevBtn) {
            prevBtn.disabled = !this.hasPreviousEpisode();
        }

        if (nextBtn) {
            nextBtn.disabled = !this.hasNextEpisode();
        }
    }

    // Check if has previous episode
    hasPreviousEpisode() {
        if (!this.currentEpisode || !this.episodes.length) return false;
        return this.currentEpisode.number > 1;
    }

    // Check if has next episode
    hasNextEpisode() {
        if (!this.currentEpisode || !this.episodes.length) return false;
        return this.currentEpisode.number < this.episodes.length;
    }

    // Play previous episode
    async playPrevious() {
        if (!this.hasPreviousEpisode()) return;

        const prevEpisode = this.episodes.find(ep => ep.number === this.currentEpisode.number - 1);
        if (prevEpisode) {
            uiManager.playEpisode(prevEpisode);
        }
    }

    // Play next episode
    async playNext() {
        this.cancelAutoplay();
        
        if (!this.hasNextEpisode()) return;

        const nextEpisode = this.episodes.find(ep => ep.number === this.currentEpisode.number + 1);
        if (nextEpisode) {
            uiManager.playEpisode(nextEpisode);
        }
    }

    // Playback controls
    togglePlayback() {
        if (this.video.paused) {
            this.video.play();
        } else {
            this.video.pause();
        }
    }

    seekForward(seconds = 10) {
        this.video.currentTime = Math.min(this.video.currentTime + seconds, this.video.duration);
    }

    seekBackward(seconds = 10) {
        this.video.currentTime = Math.max(this.video.currentTime - seconds, 0);
    }

    increaseVolume() {
        this.video.volume = Math.min(this.video.volume + 0.1, 1);
    }

    decreaseVolume() {
        this.video.volume = Math.max(this.video.volume - 0.1, 0);
    }

    toggleMute() {
        this.video.muted = !this.video.muted;
    }

    toggleFullscreen() {
        if (document.fullscreenElement) {
            document.exitFullscreen();
        } else {
            this.video.requestFullscreen();
        }
    }
}

// Initialize video player
window.videoPlayer = new VideoPlayer();
