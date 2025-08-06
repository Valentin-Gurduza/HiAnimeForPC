# HiAnime For PC

A full-featured Windows desktop anime streaming application powered by HiAnime.to. Built with Electron, this app provides a native desktop experience for watching anime with modern UI and comprehensive features.

## ✨ Features

### Core Features
- 🏠 **Modern UI** - Clean, responsive interface with dark/light themes
- 🔍 **Advanced Search** - Search anime by title, genre, or tags
- 📺 **Embedded Video Player** - Built-in player with multiple quality options
- 📱 **Responsive Design** - Adapts to different window sizes
- 🌙 **Theme Support** - Dark and light theme with toggle

### Content Features
- 🔥 **Trending Anime** - Discover what's popular
- ⭐ **New Releases** - Latest anime releases
- ▶️ **Ongoing Series** - Currently airing anime
- 📅 **Anime Calendar** - Airing schedules
- 🔖 **My List/Favorites** - Personal anime collection
- 📝 **Detailed Pages** - Complete anime information with synopsis, genres, ratings

### Video Features
- 🎬 **Multi-Quality Streaming** - Auto, 1080p, 720p, 480p, 360p options
- 🔄 **Auto-Play Next Episode** - Seamless episode progression
- ⏱️ **Continue Watching** - Resume from where you left off
- 🎯 **Episode Navigation** - Easy previous/next episode controls
- 📱 **Video Controls** - Play/pause, seek, volume, fullscreen

### Subtitle Features
- 📖 **Multiple Languages** - English, Spanish, French, German, and more
- 🎨 **Customizable Subtitles** - Adjustable size and styling
- 🔄 **Auto-Loading** - Automatic subtitle detection and loading

### Advanced Features
- 💾 **Download Episodes** - Save for offline viewing
- 📱 **Notifications** - New episode alerts for favorites
- ⌨️ **Keyboard Shortcuts** - Full keyboard navigation support
- 📊 **Watch History** - Track your viewing progress
- 🎮 **Playback Controls** - Comprehensive media controls

### Settings & Customization
- 🎛️ **Comprehensive Settings** - Video quality, subtitles, downloads
- 📁 **Download Management** - Choose directory and quality
- 🔔 **Notification Control** - Enable/disable episode notifications
- 💾 **Data Export/Import** - Backup and restore settings

## 🚀 Quick Start

### Prerequisites
- **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
- **Windows 10/11** (64-bit)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Valentin-Gurduza/HiAnimeForPC.git
   cd HiAnimeForPC
   ```

2. **Run setup script:**
   ```bash
   # Windows
   setup.bat
   
   # Or manually:
   npm install
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

### Building for Production

```bash
# Build Windows installer
npm run build-win

# The installer will be created in the 'dist' folder
```

## 🎮 Usage

### Navigation
- **Home**: Trending, new releases, and ongoing anime
- **Search**: Find anime by title or genre
- **My List**: Your favorite anime collection
- **History**: Previously watched anime
- **Downloads**: Manage offline content
- **Settings**: Customize the application

### Keyboard Shortcuts
- `Space` - Play/Pause video
- `F` - Toggle fullscreen
- `M` - Mute/Unmute
- `←/→` - Seek backward/forward (10s)
- `Ctrl + ←/→` - Previous/Next episode
- `↑/↓` - Volume up/down
- `C` - Toggle subtitles
- `Ctrl + S` - Quick search
- `Ctrl + H` - Go to home
- `Ctrl + ,` - Open settings
- `Escape` - Exit fullscreen/Close modals

### Video Player
- **Quality Selection**: Auto-detects best quality, manual override available
- **Subtitle Support**: Multiple languages with customizable appearance
- **Progress Tracking**: Automatically saves viewing progress
- **Auto-Play**: Configurable countdown for next episode

## 🔧 Development

### Project Structure
```
HiAnimeForPC/
├── src/
│   ├── main.js              # Electron main process
│   ├── preload.js           # Preload script for security
│   └── renderer/            # Frontend application
│       ├── index.html       # Main HTML file
│       ├── css/            # Stylesheets
│       │   ├── styles.css   # Main styles
│       │   ├── themes.css   # Theme definitions
│       │   └── components.css # Component styles
│       └── js/             # JavaScript modules
│           ├── api.js       # HiAnime.to API integration
│           ├── storage.js   # Local data management
│           ├── ui.js        # UI management
│           ├── player.js    # Video player controls
│           ├── settings.js  # Settings management
│           └── app.js       # Main application logic
├── assets/                  # Application assets
├── package.json            # Dependencies and scripts
└── README.md              # This file
```

### Scripts
- `npm start` - Start the application
- `npm run dev` - Start in development mode
- `npm run build` - Build for production
- `npm run build-win` - Build Windows installer

### Technologies Used
- **Electron** - Desktop application framework
- **Node.js** - JavaScript runtime
- **HTML5/CSS3** - Modern web standards
- **JavaScript ES6+** - Modern JavaScript features
- **Electron Builder** - Application packaging

## 📦 Installation Package Features

The Windows installer includes:
- **Easy Installation** - One-click setup process
- **Custom Install Path** - Choose installation directory
- **Desktop Shortcut** - Quick access from desktop
- **Start Menu Entry** - Integration with Windows Start Menu
- **Uninstaller** - Clean removal process
- **Auto-Updates** - Built-in update mechanism
- **Dependency Management** - All required components included

## ⚙️ Configuration

### Settings File Location
Settings are stored locally in:
```
%APPDATA%/hianime-for-pc/config.json
```

### Default Settings
```json
{
  "theme": "dark",
  "defaultQuality": "auto",
  "autoplayNext": true,
  "autoplayCountdown": 10,
  "defaultSubtitleLang": "en",
  "subtitleSize": "medium",
  "downloadDirectory": "",
  "downloadQuality": "1080p",
  "notifications": false
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -am 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE.txt](LICENSE.txt) file for details.

## ⚠️ Disclaimer

This application is for educational purposes only. Please respect the terms of service of HiAnime.to and any other websites. The developers are not responsible for any misuse of this application.

## 🙏 Acknowledgments

- HiAnime.to for providing anime content
- Electron community for the framework
- Open source contributors

## 📞 Support

If you encounter any issues or have suggestions:
1. Check the [Issues](https://github.com/Valentin-Gurduza/HiAnimeForPC/issues) page
2. Create a new issue with detailed information
3. Include screenshots and error messages when applicable

## 🔄 Version History

### v1.0.0 (Initial Release)
- Full-featured anime streaming application
- Modern UI with dark/light themes
- Video player with quality selection
- Subtitle support with multiple languages
- Download functionality
- Favorites and watch history
- Comprehensive settings panel
- Windows installer package

---

**Made with ❤️ for anime fans**
