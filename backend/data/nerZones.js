// Mock risk-zone dataset for the North Eastern Region.
// Replace with real district/slope-unit polygons + live sensor feeds in Phase 1.
export const nerZones = [
  {
    id: "zone-1",
    name: "Sohra (Cherrapunji) Ridge",
    state: "Meghalaya",
    district: "East Khasi Hills",
    lat: 25.2702,
    lng: 91.7323,
    severity: "High",
    rainfall: 210,
    soilMoisture: 86,
    slope: 42,
    previousLandslide: true
  },
  {
    id: "zone-2",
    name: "Itanagar Foothills",
    state: "Arunachal Pradesh",
    district: "Papum Pare",
    lat: 27.0844,
    lng: 93.6053,
    severity: "High",
    rainfall: 175,
    soilMoisture: 80,
    slope: 39,
    previousLandslide: true
  },
  {
    id: "zone-3",
    name: "Aizawl Hill Slope",
    state: "Mizoram",
    district: "Aizawl",
    lat: 23.7271,
    lng: 92.7176,
    severity: "Medium",
    rainfall: 120,
    soilMoisture: 65,
    slope: 30,
    previousLandslide: false
  },
  {
    id: "zone-4",
    name: "Along-Pasighat Road Belt",
    state: "Arunachal Pradesh",
    district: "East Siang",
    lat: 28.1667,
    lng: 95.326,
    severity: "Medium",
    rainfall: 110,
    soilMoisture: 60,
    slope: 27,
    previousLandslide: false
  },
  {
    id: "zone-5",
    name: "Kohima Ridge Road",
    state: "Nagaland",
    district: "Kohima",
    lat: 25.6751,
    lng: 94.1086,
    severity: "Low",
    rainfall: 60,
    soilMoisture: 40,
    slope: 18,
    previousLandslide: false
  }
];

export const nerRoads = [
  { id: "road-1", name: "Shillong - Cherrapunji Rd", state: "Meghalaya", status: "Blocked" },
  { id: "road-2", name: "Itanagar - Ziro Rd", state: "Arunachal Pradesh", status: "Blocked" },
  { id: "road-3", name: "Aizawl - Lunglei Rd", state: "Mizoram", status: "Partial" },
  { id: "road-4", name: "Along - Pasighat Rd", state: "Arunachal Pradesh", status: "Partial" },
  { id: "road-5", name: "Kohima - Dimapur Rd", state: "Nagaland", status: "Open" }
];
