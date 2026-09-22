import { useState } from "react";

const DEFAULTS = {
  source: "Citizen",
  lat: "",
  lng: "",
  severity: "Medium",
  description: ""
};

// Keep base64 photos modest in size for the in-memory backend — this is a
// prototype without real file storage, so we downscale before storing.
function readAndResizeImage(file, maxDim = 900) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Couldn't read the photo file."));
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          const scale = maxDim / Math.max(width, height);
          width = Math.round(width * scale);
          height = Math.round(height * scale);
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        canvas.getContext("2d").drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", 0.75));
      };
      img.onerror = () => reject(new Error("Couldn't process the photo file."));
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

export default function ReportForm({ onSubmit }) {
  const [values, setValues] = useState(DEFAULTS);
  const [error, setError] = useState("");
  const [locating, setLocating] = useState(false);
  const [photo, setPhoto] = useState(null);
  const [photoProcessing, setPhotoProcessing] = useState(false);

  const set = (key) => (e) => setValues((v) => ({ ...v, [key]: e.target.value }));

  const useMyLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation isn't available in this browser.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setValues((v) => ({
          ...v,
          lat: pos.coords.latitude.toFixed(6),
          lng: pos.coords.longitude.toFixed(6)
        }));
        setLocating(false);
      },
      () => {
        setError("Couldn't get your location. Enter coordinates manually.");
        setLocating(false);
      }
    );
  };

  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoProcessing(true);
    setError("");
    try {
      const dataUrl = await readAndResizeImage(file);
      setPhoto(dataUrl);
    } catch (err) {
      console.error("Photo processing failed:", err);
      setError("Couldn't process that photo — try a different one.");
    } finally {
      setPhotoProcessing(false);
    }
  };

  const submit = (e) => {
    e.preventDefault();
    const lat = Number(values.lat);
    const lng = Number(values.lng);

    if (Number.isNaN(lat) || Number.isNaN(lng) || !values.description.trim()) {
      setError("Latitude, longitude and a description are required.");
      return;
    }

    setError("");
    onSubmit({
      source: values.source,
      lat,
      lng,
      severity: values.severity,
      description: values.description.trim(),
      attachment: null,
      photo: photo || null
    });
    setValues(DEFAULTS);
    setPhoto(null);
  };

  return (
    <form className="report-form" onSubmit={submit}>
      {error && <div className="form-error">{error}</div>}

      <div className="form-row">
        <label>
          Reporter type
          <select value={values.source} onChange={set("source")}>
            <option value="Citizen">Citizen</option>
            <option value="Official">Official</option>
          </select>
        </label>
        <label>
          Severity
          <select value={values.severity} onChange={set("severity")}>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
        </label>
      </div>

      <div className="form-row">
        <label>
          Latitude
          <input type="text" placeholder="17.394462" value={values.lat} onChange={set("lat")} />
        </label>
        <label>
          Longitude
          <input type="text" placeholder="78.492224" value={values.lng} onChange={set("lng")} />
        </label>
        <button type="button" className="btn btn-ghost btn-sm" onClick={useMyLocation} disabled={locating}>
          📍 {locating ? "Locating…" : "Use My Location"}
        </button>
      </div>

      <label>
        Description
        <textarea
          rows={3}
          placeholder="What did you observe? Cracks, falling rocks, road blockage..."
          value={values.description}
          onChange={set("description")}
        />
      </label>

      <div className="photo-capture-row">
        <label className="btn btn-ghost btn-sm photo-btn">
          🖼️ Choose from Gallery
          <input type="file" accept="image/*" onChange={handlePhotoChange} hidden />
        </label>
        {photoProcessing && <span className="muted">Processing photo…</span>}
      </div>
      {photo && (
        <div className="photo-preview">
          <img src={photo} alt="Report preview" />
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => setPhoto(null)}>
            ✕ Remove photo
          </button>
        </div>
      )}

      <button type="submit" className="btn btn-primary">
        Submit Report
      </button>
    </form>
  );
}
