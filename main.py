import json
import feedparser
from flask import Flask, render_template
from datetime import datetime
from dateutil import parser as date_parser
import requests
from functools import lru_cache
import time

app = Flask(__name__, template_folder='templates')


def load_feeds_config():
    with open('feeds.json', 'r') as f:
        return json.load(f)


@lru_cache(maxsize=128)
def fetch_rss_feed(url, limit=5):
    """Fetch and parse RSS feed with caching"""
    try:
        # Set timeout and user agent
        headers = {'User-Agent': 'Mozilla/5.0 (compatible; RSS Reader/1.0)'}
        response = requests.get(url, headers=headers, timeout=10)

        feed = feedparser.parse(response.content)

        items = []
        for entry in feed.entries[:limit]:
            # Parse published date
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
                'published': time_ago,
                'summary': entry.get('summary', '')[:200] if entry.get('summary') else ''
            })

        return items
    except Exception as e:
        print(f"Error fetching {url}: {e}")
        return []


def get_time_ago(dt):
    """Convert datetime to relative time"""
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


@lru_cache(maxsize=32)
def fetch_reddit(subreddit, limit=10):
    """Fetch Reddit posts"""
    try:
        url = f'https://www.reddit.com/r/{subreddit}/top.json?limit={limit}&t=day'
        headers = {'User-Agent': 'Mozilla/5.0 (compatible; RSS Reader/1.0)'}
        response = requests.get(url, headers=headers, timeout=10)
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
    response.cache_control.max_age = 0
    return response


@app.route('/', methods=['GET'])
def root():
    config = load_feeds_config()

    # Fetch all RSS feeds
    for section in config['sections']:
        for feed in section['feeds']:
            feed['items'] = fetch_rss_feed(feed['url'], feed.get('limit', 5))

    # Fetch Reddit posts
    reddit_data = []
    for subreddit in config.get('subreddits', []):
        posts = fetch_reddit(subreddit, 5)
        if posts:
            reddit_data.append({
                'name': f'r/{subreddit}',
                'posts': posts
            })

    return render_template('index.html', config=config, reddit_data=reddit_data)
