export const NER_STATES = [
  "Assam",
  "Meghalaya",
  "Manipur",
  "Mizoram",
  "Nagaland",
  "Tripura",
  "Sikkim",
  "Arunachal Pradesh"
];

export const CATEGORIES = [
  { key: "landslide", label: "Landslide", match: ["landslide", "landslip"] },
  { key: "flood", label: "Flood", match: ["flood", "flash flood", "glacial lake", "glof"] },
  { key: "earthquake", label: "Earthquake", match: ["earthquake", "quake", "tremor"] },
  { key: "rainfall", label: "Rainfall", match: ["rainfall", "heavy rain", "downpour", "monsoon"] }
];

function detectState(title) {
  return NER_STATES.find((s) => title.toLowerCase().includes(s.toLowerCase())) || null;
}

function detectCategory(title) {
  const t = title.toLowerCase();
  const found = CATEGORIES.find((c) => c.match.some((m) => t.includes(m)));
  return found ? found.key : "other";
}

// Single shared shape both News Headlines (Insights) and the History
// timeline read from — real fields only, nothing invented.
export function enrichNewsItem(item, { historical = false } = {}) {
  return {
    id: item.id,
    title: item.title,
    source: item.source,
    publishedAt: item.publishedAt,
    url: item.link,
    state: detectState(item.title),
    category: detectCategory(item.title),
    description: null, // RSS doesn't reliably provide a clean summary — never fabricated
    historical
  };
}

export function categoryLabel(key) {
  if (key === "other") return "Other";
  return CATEGORIES.find((c) => c.key === key)?.label || key;
}
