// Verified real historical landslide/landslide-triggered disaster events in
// the North Eastern Region. These are drawn from public news/encyclopedic
// reporting (Wikipedia, Reuters/AP wire coverage, Al Jazeera, national
// disaster authority bulletins) — not invented, and not a live feed. Figures
// (death tolls especially) can vary slightly between sources as counts were
// updated during multi-day rescue operations; we use the widely-cited final
// or near-final figure and note where sources differ.
export const landslideHistory = [
  {
    id: "hist-1",
    state: "Manipur",
    district: "Noney",
    place: "Noney District (Tupul railway construction site)",
    date: "2022-06-30",
    title: "Noney landslide",
    lat: 24.85,
    lng: 93.4,
    coordsNote: "Approximate — Noney district/Tupul area, not an exact incident-site survey coordinate",
    deaths: 58,
    missing: 3,
    injured: 18,
    summary:
      "A massive landslide struck a Territorial Army camp and railway construction site near Tupul in Noney district after days of heavy monsoon rain, burying soldiers, railway workers, and civilians. It remains one of the deadliest landslides recorded in the Northeast.",
    source: "Public reporting incl. Wikipedia \"2022 Manipur landslide\"; figures as widely reported in final tallies"
  },
  {
    id: "hist-2",
    state: "Mizoram",
    district: "Aizawl",
    place: "Melthum–Hlimen, Aizawl District (stone quarry site)",
    date: "2024-05-28",
    title: "Aizawl quarry collapse & landslides (Cyclone Remal)",
    lat: 23.71,
    lng: 92.69,
    coordsNote: "Approximate — southern Aizawl outskirts, not an exact incident-site survey coordinate",
    deaths: 29,
    missing: 7,
    injured: null,
    summary:
      "Cyclone Remal brought incessant rain that triggered a stone quarry collapse and multiple landslides on Aizawl's southern outskirts, cutting the city off from the rest of the country. The same system caused fatalities in Meghalaya and Nagaland the same week.",
    source: "Public news reporting (PTI/wire coverage); death toll rose over several days as recovery continued — different reports cite 27–29"
  },
  {
    id: "hist-3",
    state: "Sikkim",
    district: "North Sikkim",
    place: "South Lhonak Lake / Teesta River valley",
    date: "2023-10-04",
    title: "South Lhonak GLOF (landslide-triggered)",
    lat: 27.9,
    lng: 88.18,
    coordsNote: "Approximate — South Lhonak Lake area, not an exact incident-site survey coordinate. Falls in what this map's district dataset (2011 Census boundaries) still calls \"North Sikkim\" — Sikkim was administratively reorganized into more districts in 2022, which this boundary dataset doesn't yet reflect.",
    deaths: 55,
    missing: 74,
    injured: 26,
    summary:
      "A landslide into the South Lhonak glacial lake triggered a glacial lake outburst flood (GLOF) that swept down the Teesta valley, destroying the Teesta III dam and causing 45 secondary landslides along the valley. One of the most severe Himalayan disasters in recent years.",
    source: "Sattar et al. 2025, Science journal; SSDMA bulletins"
  }
];

// States without a single large, well-documented fatal event found in our
// research — this does NOT mean they're landslide-free; smaller, more
// frequent monsoon-season slides (road blockages, minor slips) are common
// across the whole NER but are not individually notable enough to cite here
// without risking inaccurate specifics.
export const statesWithoutMajorRecordedEvent = ["Assam", "Arunachal Pradesh", "Nagaland", "Tripura"];
