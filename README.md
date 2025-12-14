# PrawnFeeds

A modern, mobile-first RSS feed aggregator with swipeable navigation and advanced features.

## Features

### 🎯 Swipeable Section Navigation
- **5 Sections**: YouTube, Blogs, Security, Subreddits, Twitch
- **Touch Gestures**: Swipe left/right on mobile devices
- **Keyboard Navigation**: Use arrow keys (←/→) to navigate
- **Tab Buttons**: Click tabs for direct section access
- **Smooth 60fps Animations**: Hardware-accelerated CSS transitions
- **Dynamic Post Counts**: Real-time display of feed counts per section

### 📱 Modal Load More System
- **Initial Display**: Shows first 10 posts per feed
- **Load More Button**: Opens modal overlay for additional posts
- **Infinite Scroll**: Automatically loads 10 posts at a time as you scroll
- **Multiple Close Methods**:
  - ✕ button (top right)
  - ESC key
  - Click outside modal (on backdrop)
- **Smooth Animations**: Fade in/slide up effects
- **Scroll Position Preservation**: Returns to previous position after closing

### 📡 Grouped Offline Feeds
- **Auto-Detection**: Automatically identifies failed feed loads
- **Collapsible Section**: Collapsed by default to reduce clutter
- **Count Badge**: Shows number of offline feeds
- **Visual Distinction**: Red tinted cards for easy identification
- **Keyboard Accessible**: Toggle with Enter or Space key

### 🎨 Modern UI/UX
- **Mobile-First Design**: Optimized for mobile, scales beautifully to desktop
- **Touch-Friendly**: Minimum 44x44px touch targets
- **Skeleton Screens**: Loading states with shimmer animations
- **Error States**: Clear, helpful error messaging
- **Accessible**: Full ARIA labels and keyboard navigation support
- **Minimalist Newspaper Favicon**: Clean, monochrome design

## Usage

### Access Points
- **Main Interface** (Flask): Visit `/` for the traditional server-rendered interface
- **Modern Reader** (Client-side): Visit `/reader` for the swipeable, interactive experience

### Keyboard Shortcuts
- `←` / `→` Arrow keys: Navigate between sections
- `ESC`: Close modal
- `Enter` / `Space`: Toggle offline feeds section

### Mobile Gestures
- **Swipe Left**: Next section
- **Swipe Right**: Previous section
- **Tap Load More**: Open modal with additional posts
- **Scroll in Modal**: Auto-load more posts

## Configuration

Edit `feeds.json` to customize your feed sources:
- Add/remove RSS feeds
- Set custom limits per feed (default: 10)
- Organize feeds into sections

Edit `public/feeds.js` for client-side configuration.

## Technical Details

### Performance
- 60fps animations via hardware acceleration
- Efficient DOM manipulation
- Lazy loading for images
- Client-side caching (60-minute TTL)
- Debounced scroll handlers

### Accessibility
- ARIA labels and roles
- Keyboard navigation throughout
- Screen reader optimized
- Focus management
- Semantic HTML5

### Browser Support
- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers (iOS Safari, Chrome Mobile)
- Progressive enhancement approach

## Development

```bash
# Install dependencies
pip install -r requirements.txt
npm install

# Run locally
python main.py

# Deploy to Vercel
vercel deploy
```

## License

See LICENSE file for details.
