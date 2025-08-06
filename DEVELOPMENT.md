# Development Guide

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- Git

### Initial Setup
1. Clone the repository:
   ```bash
   git clone https://github.com/Valentin-Gurduza/HiAnimeForPC.git
   cd HiAnimeForPC
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

### Development Commands

- **Start Development Server:**
  ```bash
  npm run dev
  ```
  Starts the Electron app in development mode with DevTools enabled.

- **Start Production Mode:**
  ```bash
  npm start
  ```
  Starts the app in production mode.

- **Build for Windows:**
  ```bash
  npm run build-win
  ```
  Creates a Windows installer in the `dist/` directory.

## Project Architecture

### Main Process (`src/main.js`)
- Handles window creation and management
- Manages application lifecycle
- Provides IPC (Inter-Process Communication) between main and renderer
- Handles native menu integration
- Manages settings and file dialogs

### Renderer Process (`src/renderer/`)
- **HTML** (`index.html`): Main application structure
- **CSS** (`css/`): Styling and themes
- **JavaScript** (`js/`): Application logic

### JavaScript Modules

#### `api.js` - HiAnime.to Integration
- Web scraping for anime data
- Search functionality
- Episode and source extraction
- Caching mechanisms

#### `storage.js` - Local Data Management
- Favorites management
- Watch history
- Continue watching
- Settings persistence
- Download tracking

#### `ui.js` - User Interface Management
- Page navigation
- Content rendering
- Event handling
- Theme management

#### `player.js` - Video Player
- Video playback controls
- Quality selection
- Subtitle management
- Episode navigation
- Keyboard shortcuts

#### `settings.js` - Settings Management
- Settings UI
- Preference handling
- Import/export functionality

#### `app.js` - Main Application Logic
- Application initialization
- Global error handling
- Periodic tasks
- Download management

## Key Features Implementation

### Web Scraping
The application uses DOM parsing to extract anime data from HiAnime.to:
- Trending anime lists
- Search results
- Episode information
- Video sources

### Video Player
Built on HTML5 video with custom controls:
- Multiple quality options
- Subtitle support
- Auto-play functionality
- Progress tracking

### Data Persistence
Uses localStorage for client-side data storage:
- User preferences
- Watch history
- Favorites list
- Continue watching progress

### Theme System
CSS custom properties enable dynamic theming:
- Dark theme (default)
- Light theme
- Smooth transitions

## Security Considerations

### Content Security
- No eval() or unsafe inline scripts
- Secure IPC communication
- Input validation and sanitization

### Privacy
- All data stored locally
- No external tracking
- Respects website terms of service

## Building and Distribution

### Electron Builder Configuration
The `package.json` includes electron-builder configuration for:
- Windows NSIS installer
- App signing (when configured)
- Auto-updater support
- File associations

### Distribution Files
After building, the `dist/` directory contains:
- Windows installer (.exe)
- Unpacked application files
- Update metadata

## Debugging

### Development Tools
- Electron DevTools (F12)
- Console logging
- Network monitoring
- Performance profiling

### Common Issues
1. **CORS Errors**: Add website to CSP if needed
2. **Video Playback**: Check codec support
3. **Memory Leaks**: Monitor object cleanup

## Contributing Guidelines

### Code Style
- Use ES6+ features
- Follow async/await patterns
- Add JSDoc comments for functions
- Use meaningful variable names

### Testing
- Test all major features
- Verify cross-platform compatibility
- Check error handling paths

### Pull Requests
1. Fork the repository
2. Create feature branch
3. Make changes with tests
4. Submit pull request

## Performance Optimization

### Memory Management
- Clean up event listeners
- Dispose of unused objects
- Limit cache sizes

### Network Optimization
- Implement request throttling
- Use efficient data structures
- Cache API responses

### UI Performance
- Use virtual scrolling for large lists
- Lazy load images
- Optimize CSS animations

## Troubleshooting

### Common Problems

#### Application Won't Start
- Check Node.js version
- Verify dependencies installation
- Check for port conflicts

#### Video Won't Play
- Verify codec support
- Check network connectivity
- Try different quality settings

#### Settings Not Saving
- Check localStorage permissions
- Verify file system access
- Clear browser cache

### Error Reporting
Enable detailed logging by running with:
```bash
npm run dev -- --verbose
```

## Deployment

### Production Build
```bash
npm run build-win
```

### Installer Testing
1. Build the installer
2. Test on clean Windows system
3. Verify all features work
4. Check uninstall process

### Distribution Channels
- GitHub Releases
- Direct download
- Package managers (future)
