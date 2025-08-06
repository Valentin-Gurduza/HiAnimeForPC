// Settings management module
class SettingsManager {
    constructor() {
        this.settingsForm = null;
        this.initializeSettings();
    }

    // Initialize settings page
    initializeSettings() {
        this.setupSettingsEventListeners();
        this.loadCurrentSettings();
    }

    // Setup event listeners for settings
    setupSettingsEventListeners() {
        // Save settings button
        const saveBtn = document.getElementById('save-settings');
        saveBtn?.addEventListener('click', () => {
            this.saveSettings();
        });

        // Reset settings button
        const resetBtn = document.getElementById('reset-settings');
        resetBtn?.addEventListener('click', () => {
            this.resetSettings();
        });

        // Browse download directory
        const browseBtn = document.getElementById('browse-download-dir');
        browseBtn?.addEventListener('click', async () => {
            await this.browseDownloadDirectory();
        });

        // Theme setting change
        const themeSetting = document.getElementById('theme-setting');
        themeSetting?.addEventListener('change', (e) => {
            this.applyTheme(e.target.value);
        });

        // Real-time setting updates
        this.setupRealTimeUpdates();
    }

    // Setup real-time setting updates
    setupRealTimeUpdates() {
        const settingInputs = document.querySelectorAll('.setting-checkbox, .setting-select, .setting-input');
        
        settingInputs.forEach(input => {
            input.addEventListener('change', () => {
                this.updateSetting(input);
            });
        });
    }

    // Load current settings into the form
    loadCurrentSettings() {
        const settings = appStorage.getSettings();
        
        // Populate all setting fields
        Object.keys(settings).forEach(key => {
            this.setSettingField(key, settings[key]);
        });
    }

    // Set a setting field value
    setSettingField(key, value) {
        // Convert camelCase to kebab-case for element IDs
        const elementId = key.replace(/([A-Z])/g, '-$1').toLowerCase();
        const element = document.getElementById(elementId);
        
        if (element) {
            if (element.type === 'checkbox') {
                element.checked = value;
            } else {
                element.value = value;
            }
        }
    }

    // Update a single setting
    updateSetting(inputElement) {
        const key = this.getSettingKey(inputElement.id);
        const value = inputElement.type === 'checkbox' ? inputElement.checked : inputElement.value;
        
        appStorage.setSetting(key, value);
        
        // Apply setting immediately if needed
        this.applySettingImmediately(key, value);
    }

    // Convert element ID to setting key
    getSettingKey(elementId) {
        return elementId.replace(/-([a-z])/g, (match, letter) => letter.toUpperCase());
    }

    // Apply setting immediately
    applySettingImmediately(key, value) {
        switch (key) {
            case 'theme':
                this.applyTheme(value);
                break;
            case 'subtitleSize':
                if (window.videoPlayer) {
                    window.videoPlayer.applySubtitleStyling();
                }
                break;
            // Add other immediate settings here
        }
    }

    // Save all settings
    saveSettings() {
        const settingsData = {};
        
        // Collect all setting values
        const settingElements = document.querySelectorAll('[id^="default-"], [id^="autoplay-"], [id^="subtitle-"], [id^="download-"], [id^="theme-"], [id^="notifications"]');
        
        settingElements.forEach(element => {
            const key = this.getSettingKey(element.id);
            const value = element.type === 'checkbox' ? element.checked : element.value;
            settingsData[key] = value;
        });
        
        // Save to storage
        appStorage.setSettings(settingsData);
        
        // Apply settings
        this.applyAllSettings(settingsData);
        
        // Show success message
        uiManager.showToast('Settings saved successfully', 'success');
    }

    // Reset settings to default
    resetSettings() {
        if (confirm('Are you sure you want to reset all settings to default?')) {
            appStorage.resetSettings();
            this.loadCurrentSettings();
            this.applyAllSettings(appStorage.getSettings());
            uiManager.showToast('Settings reset to default', 'info');
        }
    }

    // Browse for download directory
    async browseDownloadDirectory() {
        if (window.electronAPI) {
            try {
                const result = await window.electronAPI.showFolderDialog();
                if (!result.canceled && result.filePaths.length > 0) {
                    const selectedPath = result.filePaths[0];
                    document.getElementById('download-directory').value = selectedPath;
                    appStorage.setSetting('downloadDirectory', selectedPath);
                }
            } catch (error) {
                console.error('Failed to open folder dialog:', error);
                uiManager.showToast('Failed to open folder selector', 'error');
            }
        }
    }

    // Apply theme
    applyTheme(theme) {
        const body = document.body;
        const themeToggle = document.getElementById('theme-toggle');
        
        // Remove existing theme classes
        body.classList.remove('theme-dark', 'theme-light');
        
        // Add new theme class
        body.classList.add(`theme-${theme}`);
        
        // Update theme toggle icon
        if (themeToggle) {
            themeToggle.innerHTML = theme === 'dark' ? 
                '<i class="fas fa-moon"></i>' : 
                '<i class="fas fa-sun"></i>';
        }
        
        // Save theme setting
        appStorage.setSetting('theme', theme);
    }

    // Apply all settings
    applyAllSettings(settings) {
        // Apply theme
        this.applyTheme(settings.theme || 'dark');
        
        // Apply video player settings
        if (window.videoPlayer) {
            window.videoPlayer.settings = settings;
            window.videoPlayer.applySubtitleStyling();
        }
        
        // Setup notifications if enabled
        if (settings.notifications) {
            this.setupNotifications();
        }
    }

    // Setup notifications
    setupNotifications() {
        if ('Notification' in window) {
            if (Notification.permission === 'default') {
                Notification.requestPermission();
            }
        }
    }

    // Get video quality options
    getQualityOptions() {
        return [
            { value: 'auto', label: 'Auto' },
            { value: '1080p', label: '1080p' },
            { value: '720p', label: '720p' },
            { value: '480p', label: '480p' },
            { value: '360p', label: '360p' }
        ];
    }

    // Get subtitle language options
    getSubtitleLanguageOptions() {
        return [
            { value: '', label: 'None' },
            { value: 'en', label: 'English' },
            { value: 'es', label: 'Spanish' },
            { value: 'fr', label: 'French' },
            { value: 'de', label: 'German' },
            { value: 'ja', label: 'Japanese' },
            { value: 'ko', label: 'Korean' },
            { value: 'zh', label: 'Chinese' }
        ];
    }

    // Get subtitle size options
    getSubtitleSizeOptions() {
        return [
            { value: 'small', label: 'Small' },
            { value: 'medium', label: 'Medium' },
            { value: 'large', label: 'Large' }
        ];
    }

    // Export settings
    exportSettings() {
        const settings = appStorage.exportData();
        const blob = new Blob([settings], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = 'hianime-settings.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        uiManager.showToast('Settings exported successfully', 'success');
    }

    // Import settings
    importSettings() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const data = e.target.result;
                        if (appStorage.importData(data)) {
                            this.loadCurrentSettings();
                            this.applyAllSettings(appStorage.getSettings());
                            uiManager.showToast('Settings imported successfully', 'success');
                        } else {
                            uiManager.showToast('Failed to import settings', 'error');
                        }
                    } catch (error) {
                        console.error('Import error:', error);
                        uiManager.showToast('Invalid settings file', 'error');
                    }
                };
                reader.readAsText(file);
            }
        };
        
        input.click();
    }

    // Validate settings
    validateSettings(settings) {
        const errors = [];
        
        // Validate autoplay countdown
        if (settings.autoplayCountdown < 5 || settings.autoplayCountdown > 30) {
            errors.push('Autoplay countdown must be between 5 and 30 seconds');
        }
        
        // Validate download directory
        if (settings.downloadDirectory && !this.isValidPath(settings.downloadDirectory)) {
            errors.push('Invalid download directory path');
        }
        
        return errors;
    }

    // Check if path is valid
    isValidPath(path) {
        // Basic path validation - can be enhanced
        return path && typeof path === 'string' && path.length > 0;
    }

    // Get storage usage statistics
    getStorageStats() {
        const stats = appStorage.getStats();
        const storageSize = new Blob([appStorage.exportData()]).size;
        
        return {
            ...stats,
            storageSize: this.formatBytes(storageSize)
        };
    }

    // Format bytes to human readable format
    formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // Setup advanced settings
    setupAdvancedSettings() {
        // Add advanced settings panel
        const advancedSection = document.createElement('div');
        advancedSection.className = 'settings-section';
        advancedSection.innerHTML = `
            <h3>Advanced Settings</h3>
            <div class="setting-item">
                <label>Storage Usage</label>
                <span id="storage-usage">${this.getStorageStats().storageSize}</span>
            </div>
            <div class="setting-item">
                <button class="btn secondary" onclick="settingsManager.exportSettings()">Export Settings</button>
                <button class="btn secondary" onclick="settingsManager.importSettings()">Import Settings</button>
            </div>
            <div class="setting-item">
                <button class="btn secondary" onclick="appStorage.clearAllData(); uiManager.showToast('All data cleared', 'info');">Clear All Data</button>
            </div>
        `;
        
        const settingsContainer = document.querySelector('.settings-sections');
        if (settingsContainer) {
            settingsContainer.appendChild(advancedSection);
        }
    }
}

// Initialize settings manager
window.settingsManager = new SettingsManager();
