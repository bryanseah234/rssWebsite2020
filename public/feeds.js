/**
 * Feed configuration for the RSS Reader
 * Organized by category with name, URL, and item limit
 */
const FEEDS = {
  blogs: [
    { name: 'Quinncheong', url: 'https://quinncheong.com/feed.xml', limit: 3 },
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
    { name: 'On my Om', url: 'https://om.co/feed/', limit: 3 }
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
    { name: 'The Blue and Gold', url: 'https://www.theblueandgold.sg/blog-feed.xml', limit: 5 },
    { name: 'Security Affairs', url: 'https://securityaffairs.com/feed', limit: 5 }
  ]
};

// Export for use in index.html
if (typeof window !== 'undefined') {
  window.FEEDS = FEEDS;
}
