from flask import Flask, render_template, jsonify
import json
import os
import sys
import traceback

app = Flask(__name__, template_folder='templates')

# Enable debug logging
app.config['DEBUG'] = True


def log(message):
    """Helper function for logging"""
    print(f"[LOG] {message}", file=sys.stderr, flush=True)


def load_feeds_config():
    """Load feeds configuration"""
    try:
        log("Loading feeds.json configuration")
        config_path = os.path.join(os.path.dirname(__file__), 'feeds.json')
        log(f"Config path: {config_path}")
        log(f"Current directory: {os.getcwd()}")
        log(f"Directory contents: {os.listdir(os.path.dirname(__file__) or '.')}")

        if not os.path.exists(config_path):
            log(f"ERROR: feeds.json not found at {config_path}")
            return {"sections": [], "subreddits": []}

        with open(config_path, 'r') as f:
            config = json.load(f)
            log(
                f"Successfully loaded config with {len(config.get('sections', []))} sections")
            return config
    except Exception as e:
        log(f"ERROR loading feeds.json: {e}")
        log(traceback.format_exc())
        return {"sections": [], "subreddits": []}


def fetch_rss_feed(url, limit=5):
    """Fetch and parse RSS feed"""
    try:
        log(f"Fetching RSS feed: {url}")
        import feedparser
        import requests
        from datetime import datetime
        from dateutil import parser as date_parser

        headers = {
            'User-Agent': 'Mozilla/5.0 (compatible; RSS Reader/1.0)',
            'Accept': 'application/rss+xml, application/xml, text/xml'
        }
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
        log(f"RSS fetch successful: {url} (status: {response.status_code})")

        feed = feedparser.parse(response.content)
        log(f"Parsed {len(feed.entries)} entries from {url}")

        items = []
        for entry in feed.entries[:limit]:
            published = entry.get('published', entry.get('updated', ''))
            try:
                if published:
                    dt = date_parser.parse(published)
                    time_ago = get_time_ago(dt)
                else:
                    time_ago = ''
            except Exception as e:
                log(f"Error parsing date: {e}")
                time_ago = ''

            items.append({
                'title': entry.get('title', 'No title')[:150],
                'link': entry.get('link', '#'),
                'published': time_ago
            })

        log(f"Returning {len(items)} items from {url}")
        return items
    except Exception as e:
        log(f"ERROR fetching {url}: {e}")
        log(traceback.format_exc())
        return []


def get_time_ago(dt):
    """Convert datetime to relative time"""
    try:
        from datetime import datetime
        now = datetime.now(dt.tzinfo) if dt.tzinfo else datetime.now()
        diff = now - dt
        seconds = diff.total_seconds()

        if seconds < 60:
            return 'just now'
        elif seconds < 3600:
            return f'{int(seconds / 60)}m ago'
        elif seconds < 86400:
            return f'{int(seconds / 3600)}h ago'
        elif seconds < 604800:
            return f'{int(seconds / 86400)}d ago'
        else:
            return f'{int(seconds / 604800)}w ago'
    except Exception as e:
        log(f"ERROR calculating time ago: {e}")
        return ''


def fetch_reddit(subreddit, limit=5):
    """Fetch Reddit posts"""
    try:
        log(f"Fetching Reddit: r/{subreddit}")
        import requests

        url = f'https://www.reddit.com/r/{subreddit}/top.json?limit={limit}&t=day'
        headers = {'User-Agent': 'Mozilla/5.0 (compatible; RSS Reader/1.0)'}
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
        data = response.json()

        log(f"Reddit fetch successful: r/{subreddit}")

        posts = []
        for post in data['data']['children'][:limit]:
            p = post['data']
            posts.append({
                'title': p.get('title', '')[:150],
                'link': f"https://reddit.com{p.get('permalink', '')}",
                'score': p.get('score', 0),
                'comments': p.get('num_comments', 0)
            })

        log(f"Returning {len(posts)} posts from r/{subreddit}")
        return posts
    except Exception as e:
        log(f"ERROR fetching r/{subreddit}: {e}")
        log(traceback.format_exc())
        return []


@app.after_request
def add_header(response):
    response.headers["Cache-Control"] = "public, max-age=300"
    return response


@app.route('/')
def root():
    try:
        log("=== Starting request to root route ===")

        # Load configuration
        config = load_feeds_config()
        log(f"Config loaded. Sections: {len(config.get('sections', []))}")

        # Fetch feeds (limit to prevent timeout)
        max_feeds = 10
        feed_count = 0

        sections = config.get('sections', [])
        log(f"Processing {len(sections)} sections")

        for idx, section in enumerate(sections):
            log(f"Processing section {idx + 1}: {section.get('title', 'Untitled')}")
            feeds = section.get('feeds', [])
            log(f"Section has {len(feeds)} feeds")

            for feed_idx, feed in enumerate(feeds):
                log(f"Processing feed {feed_idx + 1}: {feed.get('name', 'Unnamed')}")

                if feed_count >= max_feeds:
                    log(f"Reached max feeds limit ({max_feeds}), skipping remaining")
                    feed['items'] = []
                    continue

                feed['items'] = fetch_rss_feed(
                    feed['url'], feed.get('limit', 5))
                feed_count += 1

        log(f"Processed {feed_count} feeds total")

        # Fetch Reddit (limit to 2 subreddits)
        reddit_data = []
        subreddits = config.get('subreddits', [])[:2]
        log(f"Processing {len(subreddits)} subreddits")

        for subreddit in subreddits:
            posts = fetch_reddit(subreddit, 5)
            if posts:
                reddit_data.append({
                    'name': f'r/{subreddit}',
                    'posts': posts
                })

        log(f"Fetched data from {len(reddit_data)} subreddits")
        log("=== Rendering template ===")

        return render_template('index.html', config=config, reddit_data=reddit_data)

    except Exception as e:
        log(f"CRITICAL ERROR in root route: {e}")
        log(traceback.format_exc())

        # Return detailed error page
        error_html = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <title>Error</title>
            <style>
                body {{ font-family: monospace; padding: 20px; background: #1a1a1a; color: #fff; }}
                .error {{ background: #ff4444; padding: 20px; border-radius: 8px; margin: 20px 0; }}
                .trace {{ background: #2a2a2a; padding: 20px; border-radius: 8px; overflow-x: auto; }}
                pre {{ white-space: pre-wrap; word-wrap: break-word; }}
            </style>
        </head>
        <body>
            <h1>Application Error</h1>
            <div class="error">
                <h2>Error: {type(e).__name__}</h2>
                <p>{str(e)}</p>
            </div>
            <div class="trace">
                <h3>Traceback:</h3>
                <pre>{traceback.format_exc()}</pre>
            </div>
        </body>
        </html>
        """
        return error_html, 500


@app.route('/health')
def health():
    log("Health check endpoint called")
    return jsonify({
        "status": "ok",
        "python_version": sys.version,
        "cwd": os.getcwd(),
        "files": os.listdir('.')
    }), 200


@app.route('/debug')
def debug():
    """Debug endpoint to check configuration"""
    try:
        config = load_feeds_config()
        return jsonify({
            "status": "ok",
            "config_loaded": True,
            "sections_count": len(config.get('sections', [])),
            "subreddits_count": len(config.get('subreddits', [])),
            "config": config
        }), 200
    except Exception as e:
        return jsonify({
            "status": "error",
            "error": str(e),
            "traceback": traceback.format_exc()
        }), 500


# For Vercel
app = app
