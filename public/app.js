/**
 * RSS Dashboard - Main Application Logic
 * Handles swipeable navigation, modal, infinite scroll, and feed loading
 */

// Constants
const CONCURRENCY_LIMIT = 6;
const API_ENDPOINT = '/api/rss';
const EXTENDED_FETCH_LIMIT = 50; // Increased to support infinite scroll in modal
const MODAL_LOAD_INCREMENT = 10;
const MS_PER_DAY = 1000 * 60 * 60 * 24;

// State
let currentSection = 'youtube';
let loadedFeeds = 0;
let totalFeeds = 0;
const failedFeeds = [];
const feedDataCache = new Map();
const sectionScrollPositions = {};

// View state per section (timeline or cards)
const sectionViewState = {
  youtube: 'timeline',
  blogs: 'timeline',
  security: 'timeline',
  subreddits: 'timeline',
  twitch: 'timeline'
};

// Touch handling state
let touchStartX = 0;
let touchStartY = 0;
let touchCurrentX = 0;
let isSwiping = false;

/**
 * Initialize the application
 */
async function init() {
  // Set current year
  document.getElementById('year').textContent = new Date().getFullYear();
  
  // Setup theme toggle
  setupThemeToggle();
  
  // Setup sections and load feeds
  await setupSections();
  
  // Setup event listeners
  setupTabNavigation();
  setupTouchNavigation();
  setupKeyboardNavigation();
  setupModal();
  
  // Load initial section (YouTube) in timeline view
  switchSection('youtube');
  
  console.log(`[RSS Dashboard] Initialized with ${totalFeeds} feeds`);
}

/**
 * Setup all sections and create feed cards
 */
async function setupSections() {
  const feedConfigs = [];
  
  // YouTube section
  if (window.FEEDS?.youtube) {
    const grid = document.getElementById('youtube-grid');
    FEEDS.youtube.forEach(feed => {
      const card = createFeedCard(feed.name, 'youtube');
      grid.appendChild(card);
      feedConfigs.push({ feed, card, grid, section: 'youtube' });
    });
  }
  
  // Blogs section
  if (window.FEEDS?.blogs) {
    const grid = document.getElementById('blogs-grid');
    FEEDS.blogs.forEach(feed => {
      const card = createFeedCard(feed.name, 'blogs');
      grid.appendChild(card);
      feedConfigs.push({ feed, card, grid, section: 'blogs' });
    });
  }
  
  // Security section
  if (window.FEEDS?.security) {
    const grid = document.getElementById('security-grid');
    FEEDS.security.forEach(feed => {
      const card = createFeedCard(feed.name, 'security');
      grid.appendChild(card);
      feedConfigs.push({ feed, card, grid, section: 'security' });
    });
  }
  
  // Subreddits section
  if (window.FEEDS?.subreddits) {
    const grid = document.getElementById('subreddits-grid');
    FEEDS.subreddits.forEach(feed => {
      const card = createFeedCard(feed.name, 'subreddits');
      grid.appendChild(card);
      feedConfigs.push({ feed, card, grid, section: 'subreddits' });
    });
  }
  
  // Twitch section
  if (window.FEEDS?.twitch) {
    const grid = document.getElementById('twitch-grid');
    FEEDS.twitch.forEach(feed => {
      const card = createFeedCard(feed.name, 'twitch');
      grid.appendChild(card);
      feedConfigs.push({ feed, card, grid, section: 'twitch' });
    });
  }
  
  totalFeeds = feedConfigs.length;
  
  // Fetch all feeds with concurrency limit
  await fetchFeedsWithConcurrency(feedConfigs, CONCURRENCY_LIMIT);
  
  // Sort feeds by recency within each section
  sortFeedsByRecency();
  
  // Move failed/empty feed cards to offline section by hiding them from main grid
  document.querySelectorAll('.feed-card.error').forEach(card => {
    card.style.display = 'none';
  });
  
  // Display offline feeds section if any
  if (failedFeeds.length > 0) {
    displayOfflineFeeds();
  }
}

/**
 * Create a feed card element
 */
function createFeedCard(name, category) {
  const card = document.createElement('div');
  card.className = 'feed-card loading';
  card.dataset.name = name.toLowerCase();
  card.dataset.category = category;
  card.innerHTML = `
    <div class="feed-card-header">
      <div style="display: flex; align-items: center; gap: 8px;">
        <span class="feed-card-title">${escapeHtml(name)}</span>
        <span class="feed-card-count">...</span>
      </div>
    </div>
    <ul class="feed-items">
      <li class="loading-skeleton">
        <div class="skeleton-line"></div>
        <div class="skeleton-line"></div>
        <div class="skeleton-line"></div>
      </li>
    </ul>
  `;
  return card;
}

/**
 * Fetch a single feed
 */
async function fetchFeed(feed, card) {
  try {
    const url = `${API_ENDPOINT}?feedUrl=${encodeURIComponent(feed.url)}&limit=${EXTENDED_FETCH_LIMIT}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const data = await response.json();
    
    // Cache the feed data
    feedDataCache.set(feed.name, data);
    
    updateFeedCard(card, data, feed.limit);
  } catch (error) {
    showFeedError(card, error.message, feed);
  } finally {
    loadedFeeds++;
  }
}

/**
 * Fetch feeds with concurrency limit
 */
async function fetchFeedsWithConcurrency(feedConfigs, limit) {
  const queue = [...feedConfigs];
  const executing = [];
  
  while (queue.length > 0 || executing.length > 0) {
    while (executing.length < limit && queue.length > 0) {
      const { feed, card } = queue.shift();
      const promise = fetchFeed(feed, card).then(() => {
        executing.splice(executing.indexOf(promise), 1);
      });
      executing.push(promise);
    }
    
    if (executing.length > 0) {
      await Promise.race(executing);
    }
  }
}

/**
 * Update feed card with data
 */
function updateFeedCard(card, data, initialLimit = 3) {
  card.classList.remove('loading');
  
  const headerEl = card.querySelector('.feed-card-header');
  const countEl = card.querySelector('.feed-card-count');
  const itemsEl = card.querySelector('.feed-items');
  
  if (data.items.length === 0) {
    // Treat as offline feed - mark as error for offline section
    card.classList.add('error');
    itemsEl.innerHTML = '<li class="error-message">No items available</li>';
    countEl.textContent = '0 items';
    
    // Track as failed feed for offline section
    const feedName = card.dataset.name || 'Unknown Feed';
    failedFeeds.push({
      name: feedName,
      url: '',
      category: card.dataset.category,
      error: 'No items available'
    });
    
    return;
  }
  
  // Store the most recent article date for sorting
  if (data.items[0]?.pubDate) {
    card.dataset.latestDate = data.items[0].pubDate;
    
    // Apply recency-based color class
    const recencyClass = getRecencyClass(data.items[0].pubDate);
    card.classList.add(recencyClass);
  }
  
  // Store all items in dataset
  card.dataset.allItems = JSON.stringify(data.items);
  card.dataset.visibleCount = Math.min(initialLimit, data.items.length);
  
  // Show initial items
  const initialItems = data.items.slice(0, initialLimit);
  itemsEl.innerHTML = initialItems.map((item, index) => {
    const articleRecencyClass = getRecencyClass(item.pubDate);
    return `
    <li class="feed-item ${articleRecencyClass}" data-index="${index}">
      <a href="${escapeHtml(item.link)}" class="feed-item-link" target="_blank" rel="noopener noreferrer">
        ${item.thumbnail ? `<img src="${escapeHtml(item.thumbnail)}" alt="" class="feed-item-thumbnail" loading="lazy">` : ''}
        <div class="feed-item-content">
          <div class="feed-item-title">${escapeHtml(item.title)}</div>
          ${item.text ? `<div class="feed-item-text">${escapeHtml(truncateText(item.text))}</div>` : ''}
          <div class="feed-item-meta">${formatRelativeTime(item.pubDate)}</div>
        </div>
      </a>
    </li>
  `;
  }).join('');
  
  // Add load more button to header if needed
  if (data.items.length > initialLimit) {
    // Remove existing load more button if any
    const existingBtn = headerEl.querySelector('.load-more-btn');
    if (existingBtn) existingBtn.remove();
    
    const loadMoreBtn = document.createElement('button');
    loadMoreBtn.className = 'load-more-btn';
    loadMoreBtn.textContent = `Load More (${data.items.length - initialLimit})`;
    loadMoreBtn.dataset.feedName = card.dataset.name;
    
    // Add click handler
    loadMoreBtn.addEventListener('click', (e) => {
      e.preventDefault();
      openModal(card.dataset.name, data);
    });
    
    headerEl.appendChild(loadMoreBtn);
  }
  
  countEl.textContent = `${initialItems.length} of ${data.items.length}`;
}

/**
 * Show error state on feed card
 */
function showFeedError(card, error, feed) {
  card.classList.remove('loading');
  card.classList.add('error');
  
  const countEl = card.querySelector('.feed-card-count');
  const itemsEl = card.querySelector('.feed-items');
  
  countEl.textContent = 'Error';
  itemsEl.innerHTML = '<li class="error-message">Failed to load feed</li>';
  
  // Track failed feed for grouping
  failedFeeds.push({
    name: feed.name,
    url: feed.url,
    category: card.dataset.category,
    error: error
  });
  
  console.error(`[Feed Error] ${card.dataset.name}:`, error);
}

/**
 * Display offline feeds section
 */
function displayOfflineFeeds() {
  // Filter based on current section
  filterOfflineFeeds(currentSection);
}

/**
 * Toggle offline feeds section
 */
function toggleOfflineSection() {
  const content = document.getElementById('offline-content');
  const header = document.querySelector('.offline-header');
  const indicator = document.querySelector('.offline-header .collapse-indicator');
  
  if (content.classList.contains('expanded')) {
    content.classList.remove('expanded');
    header.classList.remove('expanded');
    header.setAttribute('aria-expanded', 'false');
    indicator.textContent = '▼';
  } else {
    content.classList.add('expanded');
    header.classList.add('expanded');
    header.setAttribute('aria-expanded', 'true');
    indicator.textContent = '▲';
  }
}

// Make it globally accessible for onclick
window.toggleOfflineSection = toggleOfflineSection;

/**
 * Setup tab navigation with view toggle
 */
function setupTabNavigation() {
  const tabs = document.querySelectorAll('.header-tab');
  
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const section = tab.dataset.section;
      handleTabClick(section);
    });
  });
}

/**
 * Handle tab click - switch section or toggle view
 */
function handleTabClick(section) {
  if (section === currentSection) {
    // Same tab clicked - toggle view
    sectionViewState[section] = 
      sectionViewState[section] === 'timeline' ? 'cards' : 'timeline';
    renderSectionView(section);
    updateTabIndicator(section);
  } else {
    // Different tab clicked - switch section
    switchSection(section);
  }
}

/**
 * Setup theme toggle
 */
function setupThemeToggle() {
  const STORAGE_KEY = 'prawnfeeds-theme';
  const DEFAULT_THEME = 'system';
  
  function getSystemTheme() {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  
  function getSavedTheme() {
    return localStorage.getItem(STORAGE_KEY) || DEFAULT_THEME;
  }
  
  function applyTheme(theme) {
    let actualTheme = theme;
    if (theme === 'system') {
      actualTheme = getSystemTheme();
    }
    document.documentElement.setAttribute('data-theme', actualTheme);
    
    // Update active button
    document.querySelectorAll('.theme-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.theme === theme);
    });
  }
  
  function setTheme(theme) {
    localStorage.setItem(STORAGE_KEY, theme);
    applyTheme(theme);
  }
  
  // Apply theme immediately
  applyTheme(getSavedTheme());
  
  // Add click handlers
  document.querySelectorAll('.theme-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      setTheme(this.dataset.theme);
    });
  });
  
  // Listen for system theme changes
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function() {
    if (getSavedTheme() === 'system') {
      applyTheme('system');
    }
  });
}

/**
 * Setup touch navigation for swipe gestures
 */
function setupTouchNavigation() {
  const wrapper = document.getElementById('sections-wrapper');
  const container = document.querySelector('.sections-container');
  
  container.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    isSwiping = false;
  }, { passive: true });
  
  container.addEventListener('touchmove', (e) => {
    if (!touchStartX) return;
    
    touchCurrentX = e.touches[0].clientX;
    const touchCurrentY = e.touches[0].clientY;
    
    const diffX = touchCurrentX - touchStartX;
    const diffY = touchCurrentY - touchStartY;
    
    // Detect horizontal swipe (more horizontal than vertical)
    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 10) {
      isSwiping = true;
      container.classList.add('swiping');
    }
  }, { passive: true });
  
  container.addEventListener('touchend', (e) => {
    if (!isSwiping) {
      touchStartX = 0;
      touchStartY = 0;
      container.classList.remove('swiping');
      return;
    }
    
    const diffX = touchCurrentX - touchStartX;
    const threshold = 50; // Minimum swipe distance
    
    if (Math.abs(diffX) > threshold) {
      if (diffX > 0) {
        // Swipe right - previous section
        navigateToPreviousSection();
      } else {
        // Swipe left - next section
        navigateToNextSection();
      }
    }
    
    touchStartX = 0;
    touchStartY = 0;
    touchCurrentX = 0;
    isSwiping = false;
    container.classList.remove('swiping');
  }, { passive: true });
}

/**
 * Setup keyboard navigation
 */
function setupKeyboardNavigation() {
  document.addEventListener('keydown', (e) => {
    // Only handle arrow keys when modal is not open
    if (document.getElementById('modal-overlay').classList.contains('active')) {
      return;
    }
    
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      navigateToPreviousSection();
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      navigateToNextSection();
    }
  });
}

/**
 * Navigate to previous section
 */
function navigateToPreviousSection() {
  const sections = ['youtube', 'blogs', 'security', 'subreddits', 'twitch'];
  const currentIndex = sections.indexOf(currentSection);
  
  if (currentIndex > 0) {
    switchSection(sections[currentIndex - 1]);
  }
}

/**
 * Navigate to next section
 */
function navigateToNextSection() {
  const sections = ['youtube', 'blogs', 'security', 'subreddits', 'twitch'];
  const currentIndex = sections.indexOf(currentSection);
  
  if (currentIndex < sections.length - 1) {
    switchSection(sections[currentIndex + 1]);
  }
}

/**
 * Switch to a different section
 */
function switchSection(sectionName) {
  // Save scroll position of current section
  const currentSectionEl = document.querySelector(`#${currentSection}-section`);
  if (currentSectionEl) {
    sectionScrollPositions[currentSection] = window.scrollY;
  }
  
  // Update active states and ARIA attributes
  document.querySelectorAll('.section').forEach(s => {
    s.classList.remove('active');
    s.setAttribute('aria-hidden', 'true');
  });
  document.querySelectorAll('.header-tab').forEach(t => {
    t.classList.remove('active');
    t.setAttribute('aria-selected', 'false');
  });
  
  const newSection = document.getElementById(`${sectionName}-section`);
  const newTab = document.querySelector(`.header-tab[data-section="${sectionName}"]`);
  
  if (newSection && newTab) {
    newSection.classList.add('active');
    newSection.setAttribute('aria-hidden', 'false');
    newTab.classList.add('active');
    newTab.setAttribute('aria-selected', 'true');
    currentSection = sectionName;
    
    // Render section in its saved view mode
    renderSectionView(sectionName);
    updateTabIndicator(sectionName);
    
    // Restore scroll position
    setTimeout(() => {
      const savedPosition = sectionScrollPositions[sectionName] || 0;
      window.scrollTo(0, savedPosition);
    }, 50);
  }
  
  // Filter offline feeds by current section
  filterOfflineFeeds(sectionName);
}

/**
 * Update tab indicator to show current view mode
 */
function updateTabIndicator(section) {
  const tab = document.querySelector(`.header-tab[data-section="${section}"]`);
  if (!tab) return;
  
  const viewMode = sectionViewState[section];
  if (viewMode === 'timeline') {
    tab.classList.add('timeline-view');
  } else {
    tab.classList.remove('timeline-view');
  }
}

/**
 * Render section in current view mode (timeline or cards)
 */
function renderSectionView(section) {
  const grid = document.getElementById(`${section}-grid`);
  if (!grid) return;
  
  const viewMode = sectionViewState[section];
  
  if (viewMode === 'timeline') {
    renderTimelineView(section, grid);
  } else {
    renderCardView(section, grid);
  }
}

/**
 * Render timeline view - chronological list of all articles from last 30 days
 */
function renderTimelineView(section, grid) {
  // Get all feeds for this section
  const feeds = getSectionFeeds(section);
  if (!feeds || feeds.length === 0) {
    grid.innerHTML = '<div class="timeline-empty"><div class="timeline-empty-icon">📭</div><h3>No feeds available</h3><p>Check back later for updates</p></div>';
    return;
  }
  
  // Get timeline articles (last 30 days, sorted chronologically)
  const articles = getTimelineArticles(feeds);
  
  if (articles.length === 0) {
    grid.innerHTML = '<div class="timeline-empty"><div class="timeline-empty-icon">📭</div><h3>No recent articles</h3><p>No articles from the last 30 days</p></div>';
    return;
  }
  
  // Render timeline list
  const timelineHTML = `
    <div class="timeline-container">
      <ul class="timeline-list">
        ${articles.map(article => {
          const recencyClass = getRecencyClass(article.pubDate);
          return `
            <li class="timeline-item ${recencyClass}">
              <a href="${escapeHtml(article.link)}" class="timeline-item-link" target="_blank" rel="noopener noreferrer">
                ${article.thumbnail ? `<img src="${escapeHtml(article.thumbnail)}" alt="" class="timeline-item-thumbnail" loading="lazy">` : ''}
                <div class="timeline-item-content">
                  <div class="timeline-item-title">${escapeHtml(article.title)}</div>
                  <div class="timeline-item-source">${escapeHtml(article.sourceName)}</div>
                  ${article.text ? `<div class="timeline-item-text">${escapeHtml(truncateText(article.text, 120))}</div>` : ''}
                  <div class="timeline-item-meta">${formatRelativeTime(article.pubDate)}</div>
                </div>
              </a>
            </li>
          `;
        }).join('')}
      </ul>
    </div>
  `;
  
  grid.innerHTML = timelineHTML;
}

/**
 * Render card view - feeds grouped by source
 */
function renderCardView(section, grid) {
  // Restore original card view by re-showing all feed cards
  const cards = Array.from(grid.querySelectorAll('.feed-card'));
  
  if (cards.length === 0) {
    // No cards exist, need to recreate them
    grid.innerHTML = '';
    const feeds = getSectionFeeds(section);
    if (!feeds) return;
    
    feeds.forEach(feed => {
      const card = createFeedCard(feed.name, section);
      grid.appendChild(card);
      
      // Fetch and populate card data
      const cachedData = feedDataCache.get(feed.name);
      if (cachedData) {
        updateFeedCard(card, cachedData, feed.limit);
      }
    });
    
    // Sort cards by recency
    sortFeedsByRecencyInGrid(grid);
  } else {
    // Cards already exist, just make sure they're visible
    cards.forEach(card => {
      card.style.display = '';
    });
  }
}

/**
 * Get feeds for a section
 */
function getSectionFeeds(section) {
  if (!window.FEEDS) return null;
  
  const sectionMap = {
    'youtube': window.FEEDS.youtube,
    'blogs': window.FEEDS.blogs,
    'security': window.FEEDS.security,
    'subreddits': window.FEEDS.subreddits,
    'twitch': window.FEEDS.twitch
  };
  
  return sectionMap[section];
}

/**
 * Get timeline articles - merge all feeds, filter last 30 days, sort chronologically
 */
function getTimelineArticles(feeds) {
  const oneMonthAgo = new Date();
  oneMonthAgo.setDate(oneMonthAgo.getDate() - 30);
  
  const allArticles = [];
  
  feeds.forEach(feed => {
    const cachedData = feedDataCache.get(feed.name);
    if (cachedData && cachedData.items) {
      cachedData.items.forEach(item => {
        allArticles.push({
          ...item,
          sourceName: feed.name,
          sourceUrl: feed.url
        });
      });
    }
  });
  
  // Filter to last 30 days and sort by date (newest first)
  return allArticles
    .filter(article => {
      const articleDate = new Date(article.pubDate);
      return !isNaN(articleDate.getTime()) && articleDate >= oneMonthAgo;
    })
    .sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
}

/**
 * Setup modal functionality
 */
function setupModal() {
  const overlay = document.getElementById('modal-overlay');
  const closeBtn = document.getElementById('modal-close');
  
  // Close on button click
  closeBtn.addEventListener('click', closeModal);
  
  // Close on overlay click (outside modal)
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      closeModal();
    }
  });
  
  // Close on ESC key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay.classList.contains('active')) {
      closeModal();
    }
  });
  
  // Setup infinite scroll
  const modalBody = document.getElementById('modal-body');
  modalBody.addEventListener('scroll', handleModalScroll);
}

let modalLoadOffset = 0;
let modalTotalItems = 0;
let modalIsLoading = false;
let modalItems = [];

/**
 * Open modal with feed data
 */
function openModal(feedName, feedData) {
  const overlay = document.getElementById('modal-overlay');
  const title = document.getElementById('modal-title');
  const body = document.getElementById('modal-body');
  
  // Find feed name in cache
  const cacheKey = Object.keys(window.FEEDS).find(category => 
    window.FEEDS[category].some(f => f.name.toLowerCase() === feedName.toLowerCase())
  );
  
  if (cacheKey) {
    const feed = window.FEEDS[cacheKey].find(f => f.name.toLowerCase() === feedName.toLowerCase());
    title.textContent = feed.name;
  } else {
    title.textContent = feedName;
  }
  
  // Reset modal state
  modalLoadOffset = 15; // Show 15 total: skip 3 shown in card, display next 12 in modal
  modalItems = feedData.items;
  modalTotalItems = feedData.items.length;
  modalIsLoading = false;
  
  // Load initial items (skip first 3 that are already shown in card, show up to 15 total)
  const initialItems = modalItems.slice(3, modalLoadOffset);
  body.innerHTML = '<ul class="feed-items">' + 
    initialItems.map((item, index) => {
      const recencyClass = getRecencyClass(item.pubDate);
      return `<li class="feed-item ${recencyClass}" data-index="${index + 3}">${createFeedItemHTML(item, index + 3)}</li>`;
    }).join('') +
    '</ul>';
  
  // Show modal
  overlay.classList.add('active');
  document.body.classList.add('modal-open');
  
  // Reset scroll position
  body.scrollTop = 0;
}

/**
 * Close modal
 */
function closeModal() {
  const overlay = document.getElementById('modal-overlay');
  overlay.classList.remove('active');
  document.body.classList.remove('modal-open');
}

/**
 * Handle modal scroll for infinite loading
 */
function handleModalScroll() {
  const body = document.getElementById('modal-body');
  const loading = document.getElementById('modal-loading');
  
  // Check if near bottom (within 200px)
  const nearBottom = body.scrollHeight - body.scrollTop - body.clientHeight < 200;
  
  if (nearBottom && !modalIsLoading && modalLoadOffset < modalTotalItems) {
    modalIsLoading = true;
    loading.style.display = 'block';
    loading.setAttribute('aria-busy', 'true');
    
    // Simulate loading delay (can be adjusted)
    setTimeout(() => {
      loadMoreModalItems();
      loading.style.display = 'none';
      loading.setAttribute('aria-busy', 'false');
      modalIsLoading = false;
    }, 300);
  }
}

/**
 * Load more items in modal
 */
function loadMoreModalItems() {
  const body = document.getElementById('modal-body');
  const ul = body.querySelector('.feed-items');
  
  const nextOffset = Math.min(modalLoadOffset + MODAL_LOAD_INCREMENT, modalTotalItems);
  const newItems = modalItems.slice(modalLoadOffset, nextOffset);
  
  newItems.forEach((item, index) => {
    const li = document.createElement('li');
    const recencyClass = getRecencyClass(item.pubDate);
    li.className = `feed-item ${recencyClass}`;
    li.dataset.index = modalLoadOffset + index;
    li.innerHTML = createFeedItemHTML(item, modalLoadOffset + index);
    ul.appendChild(li);
  });
  
  modalLoadOffset = nextOffset;
}

/**
 * Create feed item HTML (inner content only, without <li> wrapper)
 */
function createFeedItemHTML(item, index) {
  return `
    <a href="${escapeHtml(item.link)}" class="feed-item-link" target="_blank" rel="noopener noreferrer">
      ${item.thumbnail ? `<img src="${escapeHtml(item.thumbnail)}" alt="" class="feed-item-thumbnail" loading="lazy">` : ''}
      <div class="feed-item-content">
        <div class="feed-item-title">${escapeHtml(item.title)}</div>
        ${item.text ? `<div class="feed-item-text">${escapeHtml(truncateText(item.text))}</div>` : ''}
        <div class="feed-item-meta">${formatRelativeTime(item.pubDate)}</div>
      </div>
    </a>
  `;
}

/**
 * Filter offline feeds to show only those relevant to current section
 */
function filterOfflineFeeds(sectionName) {
  const offlineGrid = document.getElementById('offline-grid');
  if (!offlineGrid) return;
  
  // Map section names to categories
  const sectionCategories = {
    'youtube': ['youtube'],
    'blogs': ['blogs'],
    'security': ['security'],
    'subreddits': ['subreddits'],
    'twitch': ['twitch']
  };
  
  const relevantCategories = sectionCategories[sectionName] || [];
  
  // Filter and display only relevant offline feeds
  const relevantFeeds = failedFeeds.filter(feed => 
    relevantCategories.includes(feed.category)
  );
  
  const offlineSection = document.getElementById('offline-section');
  const offlineCount = document.getElementById('offline-count');
  
  if (relevantFeeds.length === 0) {
    offlineSection.style.display = 'none';
    return;
  }
  
  offlineCount.textContent = relevantFeeds.length;
  
  offlineGrid.innerHTML = relevantFeeds.map(feed => `
    <div class="feed-card error offline-card">
      <div class="feed-card-header">
        <span class="feed-card-title">${escapeHtml(feed.name)}</span>
        <span class="feed-card-count">Error</span>
      </div>
      <ul class="feed-items">
        <li class="error-message">Failed to load feed</li>
        <li class="error-message" style="font-size: 11px; color: var(--text-muted);">Category: ${feed.category}</li>
        <li class="error-message" style="font-size: 11px; color: var(--text-tertiary);">${escapeHtml(feed.error)}</li>
      </ul>
    </div>
  `).join('');
  
  offlineSection.style.display = 'block';
}

/**
 * Format date to relative time
 */
function formatRelativeTime(dateStr) {
  if (!dateStr) return '';
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    
    const now = new Date();
    const diffMs = now - date;
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    const diffWeeks = Math.floor(diffDays / 7);
    
    if (diffSecs < 60) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    if (diffWeeks < 4) return `${diffWeeks}w ago`;
    
    return date.toLocaleDateString();
  } catch {
    return dateStr;
  }
}

/**
 * Truncate text to max length
 */
function truncateText(text, maxLength = 150) {
  if (!text || text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '...';
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Get recency class based on article age
 */
function getRecencyClass(dateStr) {
  if (!dateStr) return 'recency-old';
  
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return 'recency-old';
    
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / MS_PER_DAY);
    
    if (diffDays < 1) return 'recency-today';
    if (diffDays <= 7) return 'recency-week';
    if (diffDays <= 30) return 'recency-month';
    return 'recency-old';
  } catch {
    return 'recency-old';
  }
}

/**
 * Sort feed cards by recency within each section
 */
function sortFeedsByRecency() {
  const sections = ['youtube', 'blogs', 'security', 'subreddits', 'twitch'];
  
  sections.forEach(section => {
    const grid = document.getElementById(`${section}-grid`);
    if (!grid) return;
    sortFeedsByRecencyInGrid(grid);
  });
}

/**
 * Sort feed cards by recency in a specific grid
 */
function sortFeedsByRecencyInGrid(grid) {
  // Get all feed cards in this grid (excluding error cards)
  const cards = Array.from(grid.querySelectorAll('.feed-card:not(.error)'));
  
  // Sort by latest date (most recent first)
  cards.sort((a, b) => {
    const dateA = a.dataset.latestDate ? new Date(a.dataset.latestDate).getTime() : 0;
    const dateB = b.dataset.latestDate ? new Date(b.dataset.latestDate).getTime() : 0;
    
    // Handle NaN values (invalid dates) by treating them as 0
    return (isNaN(dateB) ? 0 : dateB) - (isNaN(dateA) ? 0 : dateA);
  });
  
  // Re-append cards in sorted order
  cards.forEach(card => {
    grid.appendChild(card);
  });
}

// Start the app when DOM is ready
document.addEventListener('DOMContentLoaded', init);
