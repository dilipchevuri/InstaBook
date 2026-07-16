import Parser from "rss-parser";
import sources from "./sources";

export async function fetchNews({ hoursBack = 36, maxPerFeed = 12 } = {}) {
  const parser = new Parser({ timeout: 10000 });
  const cutoff = Date.now() - hoursBack * 60 * 60 * 1000;
  const items = [];
  const feedErrors = [];

  await Promise.all(
    sources.map(async (source) => {
      try {
        const feed = await parser.parseURL(source.url);
        const recent = (feed.items || [])
          .filter((item) => {
            const published = item.pubDate ? new Date(item.pubDate).getTime() : Date.now();
            return published >= cutoff;
          })
          .slice(0, maxPerFeed)
          .map((item) => ({
            source: source.name,
            title: item.title?.trim() || "",
            summary: (item.contentSnippet || item.content || "").replace(/\s+/g, " ").trim().slice(0, 400),
            link: item.link,
            pubDate: item.pubDate,
          }));
        items.push(...recent);
      } catch (err) {
        // One dead feed should never take down the whole daily run.
        feedErrors.push({ source: source.name, error: err.message });
      }
    })
  );

  return { items, feedErrors };
}
