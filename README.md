# 🚫 Website Blocker Chrome Extension

A powerful Chrome extension that helps you stay focused by blocking distracting websites. Perfect for productivity, studying, or maintaining focus during work hours.

## ✨ Features

- **Smart Website Blocking**: Block specific websites or entire domains
- **Real-time Protection**: Blocks sites as you type URLs or click links
- **Easy Management**: Simple popup interface to add/remove blocked sites
- **Statistics Tracking**: Monitor how many sites you've blocked and your daily progress
- **Toggle Control**: Easily enable/disable the extension when needed
- **Beautiful UI**: Modern, responsive design with smooth animations
- **Cross-tab Protection**: Works across all browser tabs and windows

## 🚀 Installation

### Method 1: Load as Unpacked Extension (Recommended for Development)

1. **Download/Clone** this repository to your computer
2. **Open Chrome** and navigate to `chrome://extensions/`
3. **Enable Developer Mode** by toggling the switch in the top-right corner
4. **Click "Load unpacked"** and select the folder containing this extension
5. **Pin the extension** to your toolbar for easy access

### Method 2: Install from Chrome Web Store (Coming Soon)

*This extension will be available on the Chrome Web Store soon for easy installation.*

## 📱 Usage

### Adding Websites to Block

1. **Click the extension icon** in your Chrome toolbar
2. **Type a website URL** (e.g., `facebook.com`, `youtube.com`)
3. **Click "Add Site"** or press Enter
4. The website is now blocked!

### Managing Blocked Sites

- **View all blocked sites** in the popup
- **Remove sites** by clicking the "Remove" button
- **Toggle the extension** on/off using the switch
- **Monitor statistics** including total blocked sites and today's count

### What Happens When You Visit a Blocked Site?

- **Immediate redirect** to a beautiful blocked page
- **Statistics display** showing your progress
- **Options to go back** or manage the extension
- **Fallback protection** with content script overlay

## 🛠️ Technical Details

### Files Structure

```
WebsiteBlocker/
├── manifest.json          # Extension configuration
├── popup.html            # Main popup interface
├── popup.js              # Popup functionality
├── background.js         # Background service worker
├── content.js            # Content script for additional protection
├── blocked.html          # Blocked page template
├── styles.css            # Popup styling
└── README.md             # This file
```

### Permissions Used

- **`storage`**: Save blocked sites and settings
- **`webNavigation`**: Intercept and block navigation
- **`tabs`**: Update tabs when blocking sites
- **`<all_urls>`**: Access to all websites for blocking

### How It Works

1. **Background Script**: Monitors all web navigation and blocks access to blocked sites
2. **Content Script**: Provides additional protection and fallback blocking
3. **Popup Interface**: Manages blocked sites and extension settings
4. **Storage Sync**: Saves your preferences across devices (if signed into Chrome)

## 🎨 Customization

### Adding Custom Blocked Sites

The extension automatically normalizes URLs:
- Removes `http://` and `https://`
- Removes `www.` prefix
- Removes trailing slashes
- Validates domain format

### Styling

All styles are in `styles.css` and can be customized:
- Color scheme
- Typography
- Layout dimensions
- Animation effects

## 🔧 Troubleshooting

### Extension Not Working?

1. **Check if enabled**: Ensure the toggle switch is ON in the popup
2. **Refresh pages**: Try refreshing the page you want to block
3. **Check permissions**: Verify the extension has necessary permissions
4. **Restart Chrome**: Sometimes a browser restart helps

### Can't Block a Specific Site?

1. **Check URL format**: Use domain names like `site.com` not full URLs
2. **Verify blocking**: Check if the site appears in your blocked list
3. **Clear cache**: Try clearing browser cache and cookies

### Performance Issues?

1. **Limit blocked sites**: Too many blocked sites may impact performance
2. **Update Chrome**: Ensure you're using the latest Chrome version
3. **Disable other extensions**: Conflicts with other extensions may occur

## 📊 Statistics

The extension tracks:
- **Total blocked sites**: How many sites you've blocked
- **Daily blocking**: How many sites were blocked today
- **Focus time**: Estimated time saved from blocking distractions

## 🔒 Privacy & Security

- **No data collection**: Your blocked sites are stored locally
- **No tracking**: We don't track your browsing habits
- **Open source**: Full transparency of what the extension does
- **Local storage**: All data stays on your device

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Commit your changes** (`git commit -m 'Add amazing feature'`)
4. **Push to the branch** (`git push origin feature/amazing-feature`)
5. **Open a Pull Request**

### Development Setup

1. Clone the repository
2. Make your changes
3. Test in Chrome with Developer Mode enabled
4. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Chrome Extensions API documentation
- Modern CSS techniques and design inspiration
- Community feedback and testing

## 📞 Support

If you encounter any issues or have questions:

1. **Check this README** for common solutions
2. **Open an issue** on GitHub
3. **Review the code** to understand how it works

---

**Happy focusing! 🎯**

*Built with ❤️ to help you stay productive and focused.* 