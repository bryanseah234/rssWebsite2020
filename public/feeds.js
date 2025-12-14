/**
 * Feed configuration for the RSS Reader
 * Organized by category with name, URL, and item limit
 */
const FEEDS = {
  youtube: [
    { name: 'Linus Tech Tips', url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCXuqSBlHAE6Xw-yeJA0Tunw', limit: 10 },
    { name: 'MKBHD', url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCBJycsmduvYEL83R_U4JriQ', limit: 10 },
    { name: 'The Verge', url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCddiUEpeqJcYeBxX1IVBKvQ', limit: 10 },
    { name: 'Lofi Girl', url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCSJ4gkVC6NrvII8umztf0Ow', limit: 10 },
    { name: 'ChilledCow', url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCOxqgCwgOqC2lMqC5PYz_Dg', limit: 10 },
    { name: 'Philip DeFranco', url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UClFSU9_bUb4Rc6OYfTt5SPw', limit: 10 }
  ],
  blogs: [
    { name: 'Guan Jie', url: 'https://guanjiefung.com/feed/', limit: 10 },
    { name: 'Raymond Yeh', url: 'https://geek.sg/rss', limit: 10 },
    { name: 'daniel', url: 'https://daniel.haxx.se/blog/feed/', limit: 10 },
    { name: 'awakened1712', url: 'https://awakened1712.github.io/feed.xml', limit: 10 },
    { name: 'chooyikai', url: 'https://chooyikai.github.io/feed.xml', limit: 10 },
    { name: 'Spaceraccoon', url: 'https://spaceraccoon.dev/posts/feed.xml', limit: 10 },
    { name: 'Rob Mensching', url: 'https://robmensching.com/blog/rss.xml', limit: 10 },
    { name: 'Ali', url: 'https://blog.ali.dev/index.xml', limit: 10 },
    { name: 'maia', url: 'https://maia.crimew.gay/feed.xml', limit: 10 },
    { name: 'chewingwrite', url: 'https://chewingwrite.wordpress.com/feed/', limit: 10 },
    { name: 'Making Building Stuff', url: 'https://makingbuildingstuff.blogspot.com/feeds/posts/default?alt=rss', limit: 10 },
    { name: 'eva', url: 'https://kibty.town/blog.rss', limit: 10 },
    { name: 'MrBruh', url: 'https://mrbruh.com/index.xml', limit: 10 },
    { name: 'Hillel Wayne', url: 'https://www.hillelwayne.com/index.xml', limit: 10 },
    { name: 'Bounded Rationality', url: 'https://bjlkeng.io//rss.xml', limit: 10 },
    { name: 'On my Om', url: 'https://om.co/feed/', limit: 10 },
    { name: 'Brian Lovin', url: 'https://brianlovin.com/writing/rss.xml', limit: 10 },
    { name: 'David Lim', url: 'https://davidlhw.dev/rss.xml', limit: 10 },
    { name: 'The Blue and Gold', url: 'https://www.theblueandgold.sg/blog-feed.xml', limit: 10 },
    { name: 'Avery Lim', url: 'https://blog.averylim.com/rss.xml', limit: 10 },
    { name: 'ntietz', url: 'https://ntietz.com/atom.xml', limit: 10 },
    { name: 'sadgrl', url: 'https://sadgrl.online/posts/rss.xml', limit: 10 },
    { name: 'Vaughn Tan', url: 'https://vaughntan.org/feed.rss', limit: 10 },
    { name: 'freyavie', url: 'https://freyavie.blog/feed/?type=rss', limit: 10 },
    { name: 'ryeones', url: 'https://www.ryeones.com/feed.xml', limit: 10 }
  ],
  security: [
    { name: 'Hackread', url: 'https://hackread.com/feed/', limit: 10 },
    { name: 'Check Point Research', url: 'https://research.checkpoint.com/feed', limit: 10 },
    { name: 'ZERO DAY', url: 'https://www.zetter-zeroday.com/rss/', limit: 10 },
    { name: 'Unit 42', url: 'https://unit42.paloaltonetworks.com/category/top-cyberthreats/feed/', limit: 10 },
    { name: 'Microsoft', url: 'https://blogs.microsoft.com/on-the-issues/feed/', limit: 10 },
    { name: 'Hive Mind Security', url: 'https://hivemindsecurity.com/blog?format=rss', limit: 10 },
    { name: 'Zack Whittaker', url: 'https://techcrunch.com/author/zack-whittaker/feed/', limit: 10 },
    { name: 'Labs Detectify', url: 'https://labs.detectify.com/feed', limit: 10 },
    { name: 'Schneier on Security', url: 'https://www.schneier.com/feed/', limit: 10 },
    { name: 'Sector035', url: 'https://sector035.nl/articles.rss', limit: 10 },
    { name: 'Security Affairs', url: 'https://securityaffairs.com/feed', limit: 10 },
    { name: 'Collecting Flags', url: 'https://collectingflags.com/feed/', limit: 10 }
  ],
  subreddits: [
    { name: 'r/pwned', url: 'https://www.reddit.com/r/pwned/.rss', limit: 10 },
    { name: 'r/cybersecurity', url: 'https://www.reddit.com/r/cybersecurity/.rss', limit: 10 },
    { name: 'r/iosbeta', url: 'https://www.reddit.com/r/iosbeta/.rss', limit: 10 },
    { name: 'r/shortcuts', url: 'https://www.reddit.com/r/shortcuts/.rss', limit: 10 },
    { name: 'r/nostupidquestions', url: 'https://www.reddit.com/r/nostupidquestions/.rss', limit: 10 },
    { name: 'r/dumbphones', url: 'https://www.reddit.com/r/dumbphones/.rss', limit: 10 }
  ],
  twitch: [
    { name: 'pokimane', url: 'https://twitchrss.appspot.com/vod/pokimane', limit: 10 },
    { name: 'xQc', url: 'https://twitchrss.appspot.com/vod/xQc', limit: 10 },
    { name: 'Ninja', url: 'https://twitchrss.appspot.com/vod/Ninja', limit: 10 },
    { name: 'scarra', url: 'https://twitchrss.appspot.com/vod/scarra', limit: 10 },
    { name: 'lilypichu', url: 'https://twitchrss.appspot.com/vod/lilypichu', limit: 10 },
    { name: 'disguisedtoast', url: 'https://twitchrss.appspot.com/vod/disguisedtoast', limit: 10 },
    { name: 'michaelreeves', url: 'https://twitchrss.appspot.com/vod/michaelreeves', limit: 10 },
    { name: 'quarterjade', url: 'https://twitchrss.appspot.com/vod/quarterjade', limit: 10 },
    { name: 'masayoshi', url: 'https://twitchrss.appspot.com/vod/masayoshi', limit: 10 },
    { name: 'sydeon', url: 'https://twitchrss.appspot.com/vod/sydeon', limit: 10 },
    { name: 'yvonnie', url: 'https://twitchrss.appspot.com/vod/yvonnie', limit: 10 },
    { name: 'fuslie', url: 'https://twitchrss.appspot.com/vod/fuslie', limit: 10 },
    { name: 'jasontheween', url: 'https://twitchrss.appspot.com/vod/jasontheween', limit: 10 },
    { name: 'qtcinderella', url: 'https://twitchrss.appspot.com/vod/qtcinderella', limit: 10 },
    { name: 'mayahiga', url: 'https://twitchrss.appspot.com/vod/mayahiga', limit: 10 }
  ]
};

// Export for use in index.html
if (typeof window !== 'undefined') {
  window.FEEDS = FEEDS;
}
