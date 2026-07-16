// Free, public RSS feeds — no API key needed.
// These are the standard sources UPSC/GS aspirants already track by hand.
// Swap or add feeds here any time; the automation picks up changes automatically.
// Note: coaching-institute feeds (Vision IAS, ForumIAS, NextIAS, Vajiram & Ravi) are
// best-effort URLs — if one breaks or moves, our code just skips it silently and logs
// why in run_logs, so it's safe to leave them in even if unverified.

const sources = [
  { name: "PIB (Press Information Bureau)", url: "https://pib.gov.in/RssMain.aspx?ModId=6&Lang=1&Regid=3" },
  { name: "PRS Legislative Research", url: "https://prsindia.org/rss.xml" },
  { name: "The Hindu - National", url: "https://www.thehindu.com/news/national/feeder/default.rss" },
  { name: "The Hindu - International", url: "https://www.thehindu.com/news/international/feeder/default.rss" },
  { name: "The Hindu - Business/Economy", url: "https://www.thehindu.com/business/Economy/feeder/default.rss" },
  { name: "Down To Earth (Environment)", url: "https://www.downtoearth.org.in/rss/india" },
  { name: "Indian Express - India", url: "https://indianexpress.com/section/india/feed/" },
  { name: "Drishti IAS", url: "https://www.drishtiias.com/rss.rss" },
  { name: "Vision IAS", url: "https://visionias.in/feed" },
  { name: "ForumIAS", url: "https://forumias.com/blog/feed/" },
  { name: "NextIAS", url: "https://www.nextias.com/blog/feed/" },
  { name: "Vajiram & Ravi", url: "https://vajiramandravi.com/feed/" },
];

export default sources;
