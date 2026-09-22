# NER Disaster Monitoring System

AI-based landslide early warning & risk monitoring dashboard for the North Eastern Region of India.
Frontend and backend are kept fully separate, talking over a JSON REST API.

```
ner-landslide-warning/
├── backend/     Express API — risk scoring, zones, roads, field reports, forecast
└── frontend/    React (Vite) dashboard — map, cards, simulator, reports
```

## What's included

- **Live risk dashboard** — rainfall / soil moisture / slope / previous-landslide cards + an AI risk %
  driven by a simple, swappable weighted model (`backend/utils/riskModel.js`)
- **Environmental Data Simulator** — sliders + "Simulate Disaster Conditions" button that post to the
  backend and get a real risk score back
- **Leaflet risk map** — NER risk zones (colour-coded by severity) plus citizen/official field reports as pins
- **Field Reports** — submit a report (location, severity, description, attachment name) via a form; it's
  saved on the backend and shows up on the map immediately
- **Risk Severity summary**, **Road Connectivity** status, **Weather & Risk Forecast** (mock hourly feed),
  and an **Emergency Priority** list ranked by zone severity
- **System Activity log** of everything sent to the backend

## Run it

**Backend**
```bash
cd backend
npm install
npm run dev        # http://localhost:5000
```

**Frontend** (separate terminal)
```bash
cd frontend
npm install
npm run dev         # http://localhost:5173
```

The frontend reads the API base URL from `VITE_API_URL` (defaults to `http://localhost:5000/api`).
To point at a deployed backend, create `frontend/.env`:
```
VITE_API_URL=https://your-backend-url/api
```

## API

| Method | Route                | Purpose                                   |
|--------|-----------------------|--------------------------------------------|
| GET    | `/api/health`          | Backend status check                       |
| GET    | `/api/zones`            | NER risk zones                             |
| GET    | `/api/zones/roads`      | Road connectivity status                   |
| GET    | `/api/reports`          | Field reports                              |
| POST   | `/api/reports`          | Submit a field report                      |
| GET    | `/api/weather/:region`  | Mock hourly rainfall + risk forecast       |
| POST   | `/api/risk/predict`     | Score environmental readings → risk %      |
| GET    | `/api/risk/activity`    | Recent predictions (server-side log)       |

## Where to go next (Phase 1+)

- Swap `nerZones.js` mock data for real district/slope-unit boundaries + live sensor feeds
- Replace the weighted-score model in `riskModel.js` with a trained ML model (scikit-learn/XGBoost
  served via a small Python microservice, called from `routes/risk.js`)
- Swap the mock `weather.js` generator for a real feed (IMD / OpenWeather / Sentinel rainfall products)
- Persist reports and activity to a real database (Postgres/Mongo) instead of in-memory arrays
- Add auth for "Official" reporters and an admin view for verifying citizen reports
- Push notifications / SMS alerts when a zone crosses the High-risk threshold
