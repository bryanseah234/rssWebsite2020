import json
import os
import feedparser
from flask import Flask, render_template
from datetime import datetime
from dateutil import parser as date_parser
import requests

app = Flask(__name__, template_folder='templates')

# Disable caching for serverless
app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 0

def load_feeds_config():
    """Load feeds configuration"""
    try:
        config_path = os.path.join(os.path.dirname(__file__), 'feeds.json')
        with open(config_path, 'r') as f:
            return json.load(f)
    except Exception as e:
        print(f"Error loading feeds.json: {e}")
        return {"sections": [], "subreddits": []}

def fetch_rss_feed(url, limit=5):
    """Fetch and parse RSS feed"""
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (compatible; RSS Reader/1.0)',
            'Accept': 'application/rss+xml, application/xml, text/xml'
        }
        response = requests.get(url, headers=headers, timeout=15)
        response.raise_for_status()
        
        feed = feedparser.parse(response.content)
        
        items = []
        for entry in feed.entries[:limit]:
            published = entry.get('published', entry.get('updated', ''))
            try:
                if published:
                    dt = date_parser.parse(published)
                    time_ago = get_time_ago(dt)
                else:
                    time_ago = ''
            except:
                time_ago = ''
            
            items.append({
                'title': entry.get('title', 'No title'),
                'link': entry.get('link', '#'),
                'published': time_ago
            })
        
        return items
    except Exception as e:
        print(f"Error fetching {url}: {e}")
        return []

def get_time_ago(dt):
    """Convert datetime to relative time"""
    try:
        now = datetime.now(dt.tzinfo) if dt.tzinfo else datetime.now()
        diff = now - dt
        seconds = diff.total_seconds()
        
        if seconds < 60:
            return 'just now'
        elif seconds < 3600:
            minutes = int(seconds / 60)
            return f'{minutes}m ago'
        elif seconds < 86400:
            hours = int(seconds / 3600)
            return f'{hours}h ago'
        elif seconds < 604800:
            days = int(seconds / 86400)
            return f'{days}d ago'
        else:
            weeks = int(seconds / 604800)
            return f'{weeks}w ago'
    except:
        return ''

def fetch_reddit(subreddit, limit=10):
    """Fetch Reddit posts"""
    try:
        url = f'https://www.reddit.com/r/{subreddit}/top.json?limit={limit}&t=day'
        headers = {'User-Agent': 'Mozilla/5.0 (compatible; RSS Reader/1.0)'}
        response = requests.get(url, headers=headers, timeout=15)
        response.raise_for_status()
        data = response.json()
        
        posts = []
        for post in data['data']['children'][:limit]:
            p = post['data']
            posts.append({
                'title': p.get('title', ''),
                'link': f"https://reddit.com{p.get('permalink', '')}",
                'score': p.get('score', 0),
                'comments': p.get('num_comments', 0)
            })
        return posts
    except Exception as e:
        print(f"Error fetching r/{subreddit}: {e}")
        return []

@app.after_request
def add_header(response):
    response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    response.headers["Pragma"] = "no-cache"
    response.headers["Expires"] = "0"
    return response

@app.route('/', methods=['GET'])
def root():
    try:
        config = load_feeds_config()
        
        # Fetch RSS feeds (limit to first 10 to avoid timeout)
        feed_count = 0
        max_feeds = 15
        
        for section in config['sections']:
            for feed in section['feeds']:
                if feed_count >= max_feeds:
                    feed['items'] = []
                    continue
                feed['items'] = fetch_rss_feed(feed['url'], feed.get('limit', 5))
                feed_count += 1
        
        # Fetch Reddit posts (limit to first 3 subreddits)
        reddit_data = []
        for subreddit in config.get('subreddits', [])[:3]:
            posts = fetch_reddit(subreddit, 5)
            if posts:
                reddit_data.append({
                    'name': f'r/{subreddit}',
                    'posts': posts
                })
        
        return render_template('index.html', config=config, reddit_data=reddit_data)
    except Exception as e:
        return f"Error: {str(e)}", 500

# Required for Vercel
if __name__ == '__main__':
    app.run(debug=False)
