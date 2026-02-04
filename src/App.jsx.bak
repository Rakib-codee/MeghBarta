import React, { useEffect, useMemo, useRef, useState } from "react";

const API_BASE = "https://api.weatherapi.com/v1";
const API_KEY = import.meta.env.VITE_WEATHER_API_KEY;

const fallbackLocation = {
  label: "Bengaluru",
  query: "Bengaluru"
};

const toCelsius = (f) => (f - 32) * (5 / 9);

const formatTemp = (value) => `${Math.round(value)}°`;

const formatTime = (date) =>
  date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

const getTimePercent = (now, sunrise, sunset) => {
  if (!sunrise || !sunset) return 0.5;
  const total = sunset - sunrise;
  const elapsed = Math.min(Math.max(now - sunrise, 0), total);
  return total > 0 ? elapsed / total : 0.5;
};

const parseAstroTime = (dateBase, timeString) => {
  if (!timeString) return null;
  const [time, meridiem] = timeString.split(" ");
  const [rawHour, minute] = time.split(":").map(Number);
  let hour = rawHour % 12;
  if (meridiem.toLowerCase() === "pm") hour += 12;
  const date = new Date(dateBase);
  date.setHours(hour, minute, 0, 0);
  return date;
};

const getAQILabel = (index) => {
  if (index === 1) return "Good";
  if (index === 2) return "Moderate";
  if (index === 3) return "Unhealthy (SG)";
  if (index === 4) return "Unhealthy";
  if (index === 5) return "Very Unhealthy";
  if (index === 6) return "Hazardous";
  return "Unknown";
};

const extractErrorMessage = async (response) => {
  try {
    const data = await response.json();
    return data?.error?.message || data?.message || response.statusText;
  } catch {
    return response.statusText || "Request failed.";
  }
};

const fetchForecast = async (query) => {
  const url = `${API_BASE}/forecast.json?key=${API_KEY}&q=${encodeURIComponent(
    query
  )}&days=3&aqi=no&alerts=no`;

  const response = await fetch(url);
  if (!response.ok) {
    const message = await extractErrorMessage(response);
    throw new Error(`Unable to fetch weather data. ${message}`);
  }
  return response.json();
};

const fetchSearch = async (query) => {
  const url = `${API_BASE}/search.json?key=${API_KEY}&q=${encodeURIComponent(
    query
  )}`;
  const response = await fetch(url);
  if (!response.ok) {
    const message = await extractErrorMessage(response);
    throw new Error(`Unable to search locations. ${message}`);
  }
  return response.json();
};

export default function App() {
  const [unit, setUnit] = useState("C");
  const [location, setLocation] = useState(null);
  const [data, setData] = useState(null);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const debounceRef = useRef();

  const isC = unit === "C";

  // Get user's current location on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({
            label: "Your location",
            query: `${latitude},${longitude}`
          });
        },
        () => {
          // Fallback to default location if geolocation fails
          setLocation(fallbackLocation);
        }
      );
    } else {
      // Fallback if geolocation is not supported
      setLocation(fallbackLocation);
    }
  }, []);

  useEffect(() => {
    if (!API_KEY) {
      setStatus("error");
      setError("Missing WeatherAPI key. Add it to .env as VITE_WEATHER_API_KEY.");
      return;
    }

    if (!location) {
      return; // Wait for location to be set
    }

    setStatus("loading");
    fetchForecast(location.query)
      .then((response) => {
        setData(response);
        setStatus("ready");
      })
      .catch((err) => {
        setStatus("error");
        setError(err.message || "Something went wrong.");
      });
  }, [location]);

  useEffect(() => {
    if (!search.trim()) {
      setResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchSearch(search)
        .then((items) => {
          setResults(items);
          setIsSearching(false);
        })
        .catch(() => {
          setIsSearching(false);
        });
    }, 350);

    return () => clearTimeout(debounceRef.current);
  }, [search]);

  const handleUseLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported on this device.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLocation({
          label: "Live location",
          query: `${latitude},${longitude}`
        });
      },
      () => {
        setError("Unable to access location. Please allow permissions.");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const current = data?.current;
  const forecast = data?.forecast?.forecastday || [];
  const today = forecast[0];

  const sunrise = useMemo(() => {
    if (!today?.astro?.sunrise || !data?.location?.localtime) return null;
    const baseDate = new Date(data.location.localtime);
    return parseAstroTime(baseDate, today.astro.sunrise);
  }, [today, data]);

  const sunset = useMemo(() => {
    if (!today?.astro?.sunset || !data?.location?.localtime) return null;
    const baseDate = new Date(data.location.localtime);
    return parseAstroTime(baseDate, today.astro.sunset);
  }, [today, data]);

  const sunProgress = useMemo(() => {
    if (!data?.location?.localtime) return 0.5;
    const now = new Date(data.location.localtime);
    return getTimePercent(now, sunrise, sunset);
  }, [data, sunrise, sunset]);

  const sunPercent = Math.round(sunProgress * 100);

  const feelTemp = current
    ? isC
      ? current.feelslike_c
      : current.feelslike_f
    : 0;

  const displayTemp = current
    ? isC
      ? current.temp_c
      : current.temp_f
    : 0;

  const displayHigh = today
    ? isC
      ? today.day.maxtemp_c
      : today.day.maxtemp_f
    : 0;

  const displayLow = today
    ? isC
      ? today.day.mintemp_c
      : today.day.mintemp_f
    : 0;

  const wind = current
    ? isC
      ? `${current.wind_kph} km/h`
      : `${current.wind_mph} mph`
    : "";

  const visibility = current
    ? isC
      ? `${current.vis_km} km`
      : `${current.vis_miles} mi`
    : "";

  const aqiIndex = current?.air_quality?.["us-epa-index"] ?? null;
  const aqiLabel = getAQILabel(aqiIndex);
  const aqiValue = aqiIndex ?? 0;
  const aqiRing = `conic-gradient(var(--accent) 0deg ${
    (aqiValue / 6) * 260
  }deg, rgba(255, 255, 255, 0.08) 0deg)`;

  return (
    <div className="app">
      <div className="bg">
        <span className="blob b1"></span>
        <span className="blob b2"></span>
        <span className="blob b3"></span>
        <span className="grid"></span>
      </div>

      <main className="shell">
        <header className="topbar">
          <div className="brand">
            <div className="logo">
              <span className="dot"></span>
            </div>
            <div className="brand-text">
              <span className="title">MeghBarta</span>
              <span className="subtitle">Live climate, artfully</span>
            </div>
          </div>

          <div className="search">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              type="text"
              placeholder="Search city"
            />
            <button onClick={handleUseLocation} type="button">
              Live
            </button>
          </div>

          <div className="units">
            <button
              className={`unit-btn ${unit === "C" ? "active" : ""}`}
              onClick={() => setUnit("C")}
            >
              °C
            </button>
            <button
              className={`unit-btn ${unit === "F" ? "active" : ""}`}
              onClick={() => setUnit("F")}
            >
              °F
            </button>
          </div>
        </header>

        {results.length > 0 && (
          <div className="search-results">
            {results.map((item) => (
              <button
                key={`${item.lat}-${item.lon}`}
                className="result"
                onClick={() => {
                  setLocation({
                    label: `${item.name}, ${item.country}`,
                    query: `${item.lat},${item.lon}`
                  });
                  setResults([]);
                  setSearch("");
                }}
              >
                <span>{item.name}</span>
                <small>{item.region}, {item.country}</small>
              </button>
            ))}
          </div>
        )}

        {isSearching && <p className="hint">Searching locations...</p>}

        {status === "error" && <p className="error">{error}</p>}

        {status === "ready" && data && (
          <>
            <section className="hero">
              <div className="hero-card">
                <div className="hero-left">
                  <p className="eyebrow">Right now</p>
                  <h1 className="temp">{formatTemp(displayTemp)}</h1>
                  <div className="meta">
                    <span>{data.location.name}</span>
                    <span className="divider">•</span>
                    <span>{current.condition.text}</span>
                  </div>
                  <div className="highlow">
                    <span>H {formatTemp(displayHigh)}</span>
                    <span>L {formatTemp(displayLow)}</span>
                  </div>
                </div>
                <div className="hero-right">
                  <div className="ring">
                    <div className="sun"></div>
                    <div className="orbit"></div>
                  </div>
                  <div className="stats">
                    <div className="stat">
                      <p>Humidity</p>
                      <strong>{current.humidity}%</strong>
                    </div>
                    <div className="stat">
                      <p>Wind</p>
                      <strong>{wind}</strong>
                    </div>
                    <div className="stat">
                      <p>Feels</p>
                      <strong>{formatTemp(feelTemp)}</strong>
                    </div>
                  </div>
                </div>
              </div>

              <div className="hero-strip">
                <div className="strip-card">
                  <p>UV Index</p>
                  <strong>{current.uv}</strong>
                  <span className="tag">{current.uv <= 5 ? "Moderate" : "High"}</span>
                </div>
                <div className="strip-card">
                  <p>Visibility</p>
                  <strong>{visibility}</strong>
                  <span className="tag">Clear</span>
                </div>
                <div className="strip-card">
                  <p>Pressure</p>
                  <strong>{current.pressure_mb} hPa</strong>
                  <span className="tag">Stable</span>
                </div>
              </div>
            </section>

            <section className="panels">
              <div className="panel">
                <div className="panel-head">
                  <h2>Hourly</h2>
                  <button className="ghost">Next 24h</button>
                </div>
                <div className="hourly">
                  {today?.hour?.slice(0, 12).map((hour, index) => (
                    <div className="hour" style={{ animationDelay: `${index * 0.08}s` }} key={hour.time_epoch}>
                      <span>{formatTime(new Date(hour.time))}</span>
                      <strong>{formatTemp(isC ? hour.temp_c : hour.temp_f)}</strong>
                      <span>{hour.condition.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="panel">
                <div className="panel-head">
                  <h2>7‑Day Outlook</h2>
                  <button className="ghost">Details</button>
                </div>
                <div className="daily">
                  {forecast.map((day) => (
                    <div className="day" key={day.date_epoch}>
                      <strong>{new Date(day.date).toLocaleDateString(undefined, { weekday: "short" })}</strong>
                      <span>{day.day.condition.text}</span>
                      <span>
                        {formatTemp(isC ? day.day.maxtemp_c : day.day.maxtemp_f)} / {formatTemp(
                          isC ? day.day.mintemp_c : day.day.mintemp_f
                        )}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className="panel timeline">
              <div className="panel-head">
                <h2>Sunrise / Sunset</h2>
                <button className="ghost">Today</button>
              </div>
              <div className="sun-track">
                <div className="sunline"></div>
                <div className="sun-progress" style={{ width: `${sunPercent}%` }}></div>
                <div className="sun-dot" style={{ left: `${sunPercent}%` }}></div>
                <div className="sun-labels">
                  <span>{today?.astro?.sunrise ?? "—"}</span>
                  <span>{today?.astro?.sunset ?? "—"}</span>
                </div>
              </div>
            </section>

            <section className="panel air">
              <div className="panel-head">
                <h2>Air Quality</h2>
                <button className="ghost">View Map</button>
              </div>
              <div className="air-grid">
                <div className="aqi">
                  <div className="aqi-ring" style={{ background: aqiRing }}>
                    <span>{aqiValue || "—"}</span>
                    <small>{aqiLabel}</small>
                  </div>
                </div>
                <div className="air-metrics">
                  <div className="metric">
                    <span>PM2.5</span>
                    <strong>{current.air_quality?.pm2_5?.toFixed(1) ?? "—"}</strong>
                  </div>
                  <div className="metric">
                    <span>PM10</span>
                    <strong>{current.air_quality?.pm10?.toFixed(1) ?? "—"}</strong>
                  </div>
                  <div className="metric">
                    <span>NO₂</span>
                    <strong>{current.air_quality?.no2?.toFixed(1) ?? "—"}</strong>
                  </div>
                  <div className="metric">
                    <span>O₃</span>
                    <strong>{current.air_quality?.o3?.toFixed(1) ?? "—"}</strong>
                  </div>
                </div>
              </div>
            </section>
          </>
        )}
      </main>

      <footer className="footer">Designed for phone and web • Smooth by default</footer>
    </div>
  );
}
