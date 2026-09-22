import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from "recharts";
import { api } from "../api.js";

export default function WeatherCharts({ region }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    api
      .getStateCharts(region)
      .then((d) => {
        if (!cancelled) setData(d);
      })
      .catch((err) => {
        console.error("Failed to load charts:", err);
        if (!cancelled) setError("Couldn't load real chart data right now.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [region]);

  if (loading) return <p className="muted">Loading real chart data…</p>;
  if (error) return <div className="form-error">{error}</div>;
  if (!data) return null;

  const hourly = (data.hourly || []).map((h) => ({
    ...h,
    label: new Date(h.time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }));
  const daily = (data.daily || []).map((d) => ({
    ...d,
    label: new Date(d.date).toLocaleDateString([], { month: "short", day: "numeric" })
  }));

  return (
    <div className="charts-block">
      <p className="data-disclaimer muted">
        ⚠️ Real data — hourly forecast source: {data.hourlySource || "n/a"}. Daily history source:{" "}
        {data.dailySource || "n/a"}.
      </p>

      {hourly.length > 0 && (
        <div className="chart-card">
          <h4>Next 24 Hours — Rainfall &amp; Temperature</h4>
          <ResponsiveContainer width="100%" height={220}>
            <ComposedChart data={hourly}>
              <defs>
                <linearGradient id="rainGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0f6d84" stopOpacity={0.5} />
                  <stop offset="95%" stopColor="#0f6d84" stopOpacity={0.03} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="label" fontSize={12} />
              <YAxis yAxisId="left" fontSize={12} label={{ value: "mm", angle: -90, position: "insideLeft" }} />
              <YAxis
                yAxisId="right"
                orientation="right"
                fontSize={12}
                label={{ value: "°C", angle: 90, position: "insideRight" }}
              />
              <Tooltip />
              <Legend />
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="rainfall"
                name="Rainfall (mm)"
                stroke="#0f6d84"
                strokeWidth={2}
                fill="url(#rainGradient)"
              />
              <Line yAxisId="right" type="monotone" dataKey="temperature" name="Temperature (°C)" stroke="#f59e0b" strokeWidth={2} dot={false} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      )}

      {hourly.length > 0 && (
        <div className="chart-card">
          <h4>Next 24 Hours — Humidity &amp; Wind Speed</h4>
          <ResponsiveContainer width="100%" height={220}>
            <ComposedChart data={hourly}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="label" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="humidity" name="Humidity (%)" stroke="#2563eb" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="windSpeed" name="Wind Speed (km/h)" stroke="#16a34a" strokeWidth={2} dot={false} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      )}

      {daily.length > 0 && (
        <div className="chart-card">
          <h4>Past 7 Days — Real Recorded Rainfall (day by day)</h4>
          <ResponsiveContainer width="100%" height={220}>
            <ComposedChart data={daily}>
              <defs>
                <linearGradient id="rainGradientDaily" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0f6d84" stopOpacity={0.5} />
                  <stop offset="95%" stopColor="#0f6d84" stopOpacity={0.03} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="label" fontSize={12} />
              <YAxis fontSize={12} label={{ value: "mm", angle: -90, position: "insideLeft" }} />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="rainfall" name="Rainfall (mm)" stroke="#0f6d84" strokeWidth={2} fill="url(#rainGradientDaily)" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      )}

      {daily.length > 0 && (
        <div className="chart-card">
          <h4>Past 7 Days — Real Recorded Temperature Range</h4>
          <ResponsiveContainer width="100%" height={220}>
            <ComposedChart data={daily}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="label" fontSize={12} />
              <YAxis fontSize={12} label={{ value: "°C", angle: -90, position: "insideLeft" }} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="tempMax" name="Max Temp (°C)" stroke="#dc2626" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="tempMin" name="Min Temp (°C)" stroke="#2563eb" strokeWidth={2} dot={false} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
