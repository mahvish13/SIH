import { Router } from "express";

const router = Router();

const QUERY = 'landslide OR flood OR earthquake OR cyclone when:30d ("Northeast India" OR Assam OR Meghalaya OR Manipur OR Mizoram OR Nagaland OR Tripura OR Sikkim OR "Arunachal Pradesh")';
const RSS_URL = `https://news.google.com/rss/search?q=${encodeURIComponent(QUERY)}&hl=en-IN&gl=IN&ceid=IN:en`;

// Broader query, no 30-day window — Google News RSS's own index depth
// determines how far back this actually reaches (typically weeks to a
// couple of months for a search query like this, not years). Used for the
// History page's news-driven timeline entries, alongside the 3 separately
// verified older events.
const HISTORY_QUERY = 'landslide OR flood OR earthquake OR "glacial lake" OR cyclone ("Northeast India" OR Assam OR Meghalaya OR Manipur OR Mizoram OR Nagaland OR Tripura OR Sikkim OR "Arunachal Pradesh")';
const HISTORY_RSS_URL = `https://news.google.com/rss/search?q=${encodeURIComponent(HISTORY_QUERY)}&hl=en-IN&gl=IN&ceid=IN:en`;

function extractTag(block, tag) {
  const m = block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`));
  return m ? m[1].trim() : null;
}

function decodeEntities(str) {
  if (!str) return str;
  return str
    .replace(/<!\[CDATA\[/g, "")
    .replace(/\]\]>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .trim();
}

function parseRssItems(xml) {
  const blocks = xml.match(/<item>[\s\S]*?<\/item>/g) || [];
  return blocks
    .map((block, i) => {
      const rawTitle = extractTag(block, "title");
      const link = extractTag(block, "link");
      const pubDate = extractTag(block, "pubDate");
      const sourceMatch = block.match(/<source[^>]*>([\s\S]*?)<\/source>/);
      const title = decodeEntities(rawTitle);
      const source = sourceMatch ? decodeEntities(sourceMatch[1]) : null;

      if (!title || !link) return null;
      return {
        id: `news-${i}-${pubDate || Date.now()}`,
        title,
        link: link.trim(),
        source,
        publishedAt: pubDate ? new Date(pubDate).toISOString() : null
      };
    })
    .filter(Boolean);
}

async function fetchAndParse(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  try {
    const upstream = await fetch(url, { signal: controller.signal });
    if (!upstream.ok) throw new Error(`Google News RSS responded ${upstream.status}`);
    const xml = await upstream.text();
    return parseRssItems(xml).sort((a, b) => new Date(b.publishedAt || 0) - new Date(a.publishedAt || 0));
  } finally {
    clearTimeout(timeout);
  }
}

// GET /api/news — real, live headlines from Google News RSS (no key needed).
// Not filtered/verified by us beyond the search query itself — attributed
// plainly to Google News + each article's original outlet.
router.get("/", async (_req, res) => {
  try {
    const items = await fetchAndParse(RSS_URL);
    res.json({
      items,
      fetchedAt: new Date().toISOString(),
      source: "Google News RSS (live, real headlines — no API key required)"
    });
  } catch (err) {
    console.error("News fetch failed:", err.message);
    res.status(502).json({ error: "Live news data unavailable right now — the news source didn't respond." });
  }
});

// GET /api/news/history — broader query, feeds the History page's
// news-driven timeline. Same real source, wider net, no invented items.
router.get("/history", async (_req, res) => {
  try {
    const items = await fetchAndParse(HISTORY_RSS_URL);
    res.json({
      items,
      fetchedAt: new Date().toISOString(),
      source: "Google News RSS (live, real headlines — no API key required)"
    });
  } catch (err) {
    console.error("News history fetch failed:", err.message);
    res.status(502).json({ error: "Historical news data unavailable right now — the news source didn't respond." });
  }
});

export default router;
