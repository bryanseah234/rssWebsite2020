const { XMLParser } = require('fast-xml-parser');
const sanitizeHtml = require('sanitize-html');

// In-memory cache with 60-minute TTL
const cache = new Map();
const CACHE_TTL = 60 * 60 * 1000; // 60 minutes in milliseconds

/**
 * Sanitize text by stripping all HTML tags, images, scripts
 * @param {string} html - Input HTML string
 * @returns {string} - Plain text output
 */
function stripHtml(html) {
  if (!html) return '';
  
  // Use sanitize-html to strip all tags
  const text = sanitizeHtml(html, {
    allowedTags: [],
    allowedAttributes: {},
    textFilter: (text) => text.replace(/\s+/g, ' ')
  });
  
  return text.trim();
}

/**
 * Parse date string to ISO format
 * @param {string} dateStr - Input date string
 * @returns {string} - ISO date string or original string
 */
function parseDate(dateStr) {
  if (!dateStr) return '';
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return date.toISOString();
  } catch {
    return dateStr;
  }
}

/**
 * Extract items from RSS 2.0 feed
 * @param {object} feed - Parsed feed object
 * @param {number} limit - Maximum number of items
 * @returns {Array} - Array of feed items
 */
function parseRss2(feed, limit) {
  const channel = feed.rss?.channel;
  if (!channel) return { title: 'Unknown Feed', items: [] };
  
  const title = channel.title || 'Unknown Feed';
  let items = channel.item || [];
  
  // Ensure items is an array
  if (!Array.isArray(items)) {
    items = [items];
  }
  
  const parsedItems = items.slice(0, limit).map(item => ({
    title: stripHtml(item.title || 'No title'),
    link: item.link || '',
    pubDate: parseDate(item.pubDate),
    text: stripHtml(item.description || item['content:encoded'] || '')
  }));
  
  return { title, items: parsedItems };
}

/**
 * Extract items from Atom feed
 * @param {object} feed - Parsed feed object
 * @param {number} limit - Maximum number of items
 * @returns {object} - Object with title and items
 */
function parseAtom(feed, limit) {
  const atomFeed = feed.feed;
  if (!atomFeed) return { title: 'Unknown Feed', items: [] };
  
  const title = atomFeed.title || 'Unknown Feed';
  let entries = atomFeed.entry || [];
  
  // Ensure entries is an array
  if (!Array.isArray(entries)) {
    entries = [entries];
  }
  
  const parsedItems = entries.slice(0, limit).map(entry => {
    // Handle different link formats in Atom
    let link = '';
    if (entry.link) {
      if (typeof entry.link === 'string') {
        link = entry.link;
      } else if (Array.isArray(entry.link)) {
        // Find alternate link or first available link
        const alternate = entry.link.find(l => l['@_rel'] === 'alternate' || !l['@_rel']);
        if (alternate) {
          link = alternate['@_href'] || alternate;
        } else if (entry.link[0]) {
          link = entry.link[0]['@_href'] || entry.link[0];
        }
      } else if (entry.link['@_href']) {
        link = entry.link['@_href'];
      }
    }
    
    // Handle different content formats
    let text = '';
    if (entry.content) {
      text = typeof entry.content === 'string' ? entry.content : (entry.content['#text'] || '');
    } else if (entry.summary) {
      text = typeof entry.summary === 'string' ? entry.summary : (entry.summary['#text'] || '');
    }
    
    return {
      title: stripHtml(typeof entry.title === 'string' ? entry.title : (entry.title?.['#text'] || 'No title')),
      link: link,
      pubDate: parseDate(entry.updated || entry.published),
      text: stripHtml(text)
    };
  });
  
  return { title, items: parsedItems };
}

/**
 * Fetch and parse RSS/Atom feed
 * @param {string} feedUrl - URL of the feed
 * @param {number} limit - Maximum number of items
 * @returns {Promise<object>} - Parsed feed data
 */
async function fetchFeed(feedUrl, limit) {
  // Check cache
  const cacheKey = `${feedUrl}:${limit}`;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    console.log(`[Cache Hit] ${feedUrl}`);
    return cached.data;
  }
  
  console.log(`[Fetching] ${feedUrl}`);
  
  // Create abort controller for timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);
  
  try {
    const response = await fetch(feedUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; RSS Reader/1.0)',
        'Accept': 'application/rss+xml, application/xml, application/atom+xml, text/xml, */*'
      },
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
  
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
  
    const xml = await response.text();
  
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '@_'
    });
  
    const feed = parser.parse(xml);
  
    let result;
  
    // Detect feed type and parse accordingly
    if (feed.rss) {
      result = parseRss2(feed, limit);
    } else if (feed.feed) {
      result = parseAtom(feed, limit);
    } else if (feed['rdf:RDF']) {
      // RSS 1.0 / RDF format
      const rdf = feed['rdf:RDF'];
      const title = rdf.channel?.title || 'Unknown Feed';
      let items = rdf.item || [];
      if (!Array.isArray(items)) items = [items];
    
      result = {
        title,
        items: items.slice(0, limit).map(item => ({
          title: stripHtml(item.title || 'No title'),
          link: item.link || '',
          pubDate: parseDate(item['dc:date'] || item.pubDate),
          text: stripHtml(item.description || '')
        }))
      };
    } else {
      throw new Error('Unknown feed format');
    }
  
    // Update cache
    cache.set(cacheKey, {
      timestamp: Date.now(),
      data: result
    });
  
    console.log(`[Parsed] ${feedUrl} - ${result.items.length} items`);
    return result;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Vercel serverless function handler
 */
module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  const { feedUrl, limit = '5' } = req.query;
  
  // Validate feedUrl parameter
  if (!feedUrl) {
    return res.status(400).json({ error: 'Missing feedUrl parameter' });
  }
  
  // Validate URL format
  try {
    new URL(feedUrl);
  } catch {
    return res.status(400).json({ error: 'Invalid feedUrl format' });
  }
  
  // Parse and validate limit
  const parsedLimit = Math.min(Math.max(parseInt(limit, 10) || 5, 1), 20);
  
  try {
    const data = await fetchFeed(feedUrl, parsedLimit);
    
    // Set cache headers
    res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=600');
    
    return res.status(200).json(data);
  } catch (error) {
    console.error(`[Error] ${feedUrl}:`, error.message);
    
    // Return appropriate error status
    if (error.message.includes('HTTP 404')) {
      return res.status(404).json({ error: 'Feed not found' });
    } else if (error.message.includes('timeout') || error.name === 'AbortError') {
      return res.status(504).json({ error: 'Feed request timed out' });
    } else if (error.message.includes('Unknown feed format')) {
      return res.status(422).json({ error: 'Unable to parse feed format' });
    }
    
    return res.status(500).json({ error: 'Failed to fetch feed' });
  }
};
