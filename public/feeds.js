/**
 * Feed configuration for the RSS Reader
 * Organized by category with name, URL, and item limit
 */
const FEEDS = {
  youtube: [
    { name: 'Linus Tech Tips', url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCXuqSBlHAE6Xw-yeJA0Tunw', limit: 3 },
    { name: 'MKBHD', url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCBJycsmduvYEL83R_U4JriQ', limit: 3 },
    { name: 'The Verge', url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCddiUEpeqJcYeBxX1IVBKvQ', limit: 3 },
    { name: 'Lofi Girl', url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCSJ4gkVC6NrvII8umztf0Ow', limit: 3 },
    { name: 'ChilledCow', url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCOxqgCwgOqC2lMqC5PYz_Dg', limit: 3 },
    { name: 'Philip DeFranco', url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UClFSU9_bUb4Rc6OYfTt5SPw', limit: 3 }
  ],
  blogs: [
    { name: 'Guan Jie', url: 'https://guanjiefung.com/feed/', limit: 3 },
    { name: 'Raymond Yeh', url: 'https://geek.sg/rss', limit: 3 },
    { name: 'daniel', url: 'https://daniel.haxx.se/blog/feed/', limit: 3 },
    { name: 'awakened1712', url: 'https://awakened1712.github.io/feed.xml', limit: 3 },
    { name: 'chooyikai', url: 'https://chooyikai.github.io/feed.xml', limit: 3 },
    { name: 'Spaceraccoon', url: 'https://spaceraccoon.dev/posts/feed.xml', limit: 3 },
    { name: 'Rob Mensching', url: 'https://robmensching.com/blog/rss.xml', limit: 3 },
    { name: 'Ali', url: 'https://blog.ali.dev/index.xml', limit: 3 },
    { name: 'maia', url: 'https://maia.crimew.gay/feed.xml', limit: 3 },
    { name: 'chewingwrite', url: 'https://chewingwrite.wordpress.com/feed/', limit: 3 },
    { name: 'Making Building Stuff', url: 'https://makingbuildingstuff.blogspot.com/feeds/posts/default?alt=rss', limit: 3 },
    { name: 'eva', url: 'https://kibty.town/blog.rss', limit: 3 },
    { name: 'MrBruh', url: 'https://mrbruh.com/index.xml', limit: 3 },
    { name: 'Hillel Wayne', url: 'https://www.hillelwayne.com/index.xml', limit: 3 },
    { name: 'Bounded Rationality', url: 'https://bjlkeng.io//rss.xml', limit: 3 },
    { name: 'On my Om', url: 'https://om.co/feed/', limit: 3 },
    { name: 'Brian Lovin', url: 'https://brianlovin.com/writing/rss.xml', limit: 3 },
    { name: 'David Lim', url: 'https://davidlhw.dev/rss.xml', limit: 3 },
    { name: 'The Blue and Gold', url: 'https://www.theblueandgold.sg/blog-feed.xml', limit: 3 },
    { name: 'Avery Lim', url: 'https://blog.averylim.com/rss.xml', limit: 3 },
    { name: 'ntietz', url: 'https://ntietz.com/atom.xml', limit: 3 },
    { name: 'sadgrl', url: 'https://sadgrl.online/posts/rss.xml', limit: 3 },
    { name: 'Vaughn Tan', url: 'https://vaughntan.org/feed.rss', limit: 3 },
    { name: 'freyavie', url: 'https://freyavie.blog/feed/?type=rss', limit: 3 },
    { name: 'ryeones', url: 'https://www.ryeones.com/feed.xml', limit: 3 }
  ],
  security: [
    { name: 'Hackread', url: 'https://hackread.com/feed/', limit: 5 },
    { name: 'Check Point Research', url: 'https://research.checkpoint.com/feed', limit: 5 },
    { name: 'ZERO DAY', url: 'https://www.zetter-zeroday.com/rss/', limit: 5 },
    { name: 'Unit 42', url: 'https://unit42.paloaltonetworks.com/category/top-cyberthreats/feed/', limit: 5 },
    { name: 'Microsoft', url: 'https://blogs.microsoft.com/on-the-issues/feed/', limit: 5 },
    { name: 'Hive Mind Security', url: 'https://hivemindsecurity.com/blog?format=rss', limit: 5 },
    { name: 'Zack Whittaker', url: 'https://techcrunch.com/author/zack-whittaker/feed/', limit: 5 },
    { name: 'Labs Detectify', url: 'https://labs.detectify.com/feed', limit: 5 },
    { name: 'Schneier on Security', url: 'https://www.schneier.com/feed/', limit: 5 },
    { name: 'Sector035', url: 'https://sector035.nl/articles.rss', limit: 5 },
    { name: 'Security Affairs', url: 'https://securityaffairs.com/feed', limit: 5 },
    { name: 'Collecting Flags', url: 'https://collectingflags.com/feed/', limit: 5 }
  ],
  subreddits: [
    { name: 'r/pwned', url: 'https://www.reddit.com/r/pwned/.rss', limit: 5 },
    { name: 'r/cybersecurity', url: 'https://www.reddit.com/r/cybersecurity/.rss', limit: 5 },
    { name: 'r/iosbeta', url: 'https://www.reddit.com/r/iosbeta/.rss', limit: 5 },
    { name: 'r/shortcuts', url: 'https://www.reddit.com/r/shortcuts/.rss', limit: 5 },
    { name: 'r/nostupidquestions', url: 'https://www.reddit.com/r/nostupidquestions/.rss', limit: 5 },
    { name: 'r/dumbphones', url: 'https://www.reddit.com/r/dumbphones/.rss', limit: 5 }
  ],
  twitch: [
    { name: 'pokimane', url: 'https://twitchrss.appspot.com/vod/pokimane', limit: 3 },
    { name: 'xQc', url: 'https://twitchrss.appspot.com/vod/xQc', limit: 3 },
    { name: 'Ninja', url: 'https://twitchrss.appspot.com/vod/Ninja', limit: 3 },
    { name: 'scarra', url: 'https://twitchrss.appspot.com/vod/scarra', limit: 3 },
    { name: 'lilypichu', url: 'https://twitchrss.appspot.com/vod/lilypichu', limit: 3 },
    { name: 'disguisedtoast', url: 'https://twitchrss.appspot.com/vod/disguisedtoast', limit: 3 },
    { name: 'michaelreeves', url: 'https://twitchrss.appspot.com/vod/michaelreeves', limit: 3 },
    { name: 'quarterjade', url: 'https://twitchrss.appspot.com/vod/quarterjade', limit: 3 },
    { name: 'masayoshi', url: 'https://twitchrss.appspot.com/vod/masayoshi', limit: 3 },
    { name: 'sydeon', url: 'https://twitchrss.appspot.com/vod/sydeon', limit: 3 },
    { name: 'yvonnie', url: 'https://twitchrss.appspot.com/vod/yvonnie', limit: 3 },
    { name: 'fuslie', url: 'https://twitchrss.appspot.com/vod/fuslie', limit: 3 },
    { name: 'jasontheween', url: 'https://twitchrss.appspot.com/vod/jasontheween', limit: 3 },
    { name: 'qtcinderella', url: 'https://twitchrss.appspot.com/vod/qtcinderella', limit: 3 },
    { name: 'mayahiga', url: 'https://twitchrss.appspot.com/vod/mayahiga', limit: 3 }
  ]
};

// Export for use in index.html
if (typeof window !== 'undefined') {
  window.FEEDS = FEEDS;
}
