import json
from flask import Flask, render_template
from urllib.parse import quote

app = Flask(__name__, template_folder='templates')

def load_feeds():
    with open('feeds.json', 'r') as f:
        return json.load(f)

def build_rssdog_url(feed_url):
    """Generate RSSdog iframe URL with standard parameters"""
    base = "https://www.rssdog.com/index.php"
    params = (
        f"?url={quote(feed_url)}"
        "&mode=html&showonly=&maxitems=0&showdescs=1&desctrim=0&descmax=0"
        "&tabwidth=100%25&excltitle=1&showdate=1&xmlbtn=1&linktarget=_blank"
        "&bordercol=transparent&headbgcol=%23999999&headtxtcol=%23ffffff"
        "&titlebgcol=%23f1eded&titletxtcol=%23000000&itembgcol=%23ffffff"
        "&itemtxtcol=%23000000&ctl=0"
    )
    return base + params

@app.after_request
def add_header(response):
    response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    response.headers["Pragma"] = "no-cache"
    response.headers["Expires"] = "0"
    response.cache_control.max_age = 0
    return response

@app.route('/', methods=['GET', 'POST'])
def root():
    config = load_feeds()
    return render_template('index.html', config=config, build_url=build_rssdog_url)
