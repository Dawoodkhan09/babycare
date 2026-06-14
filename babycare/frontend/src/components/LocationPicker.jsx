import { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, useMap, useMapEvents } from "react-leaflet";
import { FaMapMarkerAlt, FaLocationArrow, FaCheck, FaSpinner } from "react-icons/fa";

const MINT = "#2a9d5c";
const MINT_LIGHT = "#e8f8ef";
const MINT_DARK = "#1a6e3f";
const TEXT_DARK = "#0a1f15";
const TEXT_BODY = "#3d5a48";
const TEXT_MUTED = "#5a7a6a";
const BORDER = "#e0ede6";

// Default center: Karachi, Pakistan
const DEFAULT_CENTER = [24.8607, 67.0011];
const DEFAULT_ZOOM = 13;

/**
 * LocationPicker — Uber-style centered pin map
 *
 * Props:
 *  - value: { lat, lng } | null
 *  - onChange: (loc) => void  — called with { lat, lng, address, city }
 *  - height: number (default 380)
 *
 * Features:
 *  ✓ Centered fixed pin (Uber-style)
 *  ✓ Drag the map → pin selects new location
 *  ✓ "Use Current Location" button (GPS)
 *  ✓ Reverse geocoding via OpenStreetMap Nominatim (FREE, no API key)
 *  ✓ Auto-fills address & city
 */
export default function LocationPicker({ value, onChange, height = 380 }) {
  // Initial map center
  const initialCenter = value?.lat && value?.lng ? [value.lat, value.lng] : DEFAULT_CENTER;

  const [mapCenter, setMapCenter] = useState(initialCenter);
  const [address, setAddress] = useState(value?.address || "");
  const [city, setCity] = useState(value?.city || "");
  const [reverseLoading, setReverseLoading] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);

  // Debounce reverse geocoding (so we don't hammer Nominatim on every drag tick)
  const debounceRef = useRef(null);

  // Reverse geocoding using FREE OpenStreetMap Nominatim
  const reverseGeocode = async (lat, lng) => {
    setReverseLoading(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1&accept-language=en`,
        {
          headers: {
            // Nominatim asks for a User-Agent — browsers add this automatically
          },
        }
      );
      const data = await res.json();

      const displayAddress = data.display_name || "";
      const addr = data.address || {};
      const detectedCity =
        addr.city || addr.town || addr.village || addr.suburb || addr.county || "";

      setAddress(displayAddress);
      setCity(detectedCity);

      // Call parent onChange with full info
      onChange?.({
        lat,
        lng,
        address: displayAddress,
        city: detectedCity,
      });
    } catch (err) {
      console.error("Reverse geocoding failed:", err);
      // Still update lat/lng even if reverse geocoding fails
      onChange?.({ lat, lng, address: "", city: "" });
    } finally {
      setReverseLoading(false);
    }
  };

  // Map move handler — fires when user drags map
  const handleMapMove = (lat, lng) => {
    setMapCenter([lat, lng]);

    // Debounce reverse geocoding (wait 600ms after user stops dragging)
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      reverseGeocode(lat, lng);
    }, 600);
  };

  // Detect user's current location via GPS
  const detectCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Your browser does not support geolocation");
      return;
    }
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setMapCenter([lat, lng]);
        reverseGeocode(lat, lng);
        setGpsLoading(false);
      },
      (err) => {
        console.error("GPS error:", err);
        alert(
          "Location access denied.\n\n" +
            "Please allow location permission in your browser settings."
        );
        setGpsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // Initial reverse geocode if value passed
  useEffect(() => {
    if (value?.lat && value?.lng && !value.address) {
      reverseGeocode(value.lat, value.lng);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div style={s.wrap}>
      {/* MAP CONTAINER */}
      <div style={{ ...s.mapBox, height }}>
        <MapContainer
          center={initialCenter}
          zoom={DEFAULT_ZOOM}
          style={{ height: "100%", width: "100%" }}
          scrollWheelZoom={true}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />
          {/* Inner component: track center on move, sync programmatic moves */}
          <MapController
            mapCenter={mapCenter}
            onCenterChange={handleMapMove}
          />
        </MapContainer>

        {/* ─── Centered Fixed Pin (Uber-style) ─── */}
        <div style={s.centerPin} className="lp-center-pin">
          <FaMapMarkerAlt size={36} color={MINT_DARK} />
          <div style={s.pinShadow} />
        </div>

        {/* ─── GPS Button ─── */}
        <button
          type="button"
          style={s.gpsBtn}
          className="lp-gps-btn"
          onClick={detectCurrentLocation}
          disabled={gpsLoading}
          title="Use my current location"
        >
          {gpsLoading ? (
            <FaSpinner size={14} className="lp-spin" />
          ) : (
            <FaLocationArrow size={13} color={MINT_DARK} />
          )}
        </button>
      </div>

      {/* ─── Address Display ─── */}
      <div style={s.addressBox}>
        <div style={s.addressIcon}>
          {reverseLoading ? (
            <FaSpinner size={14} color={MINT_DARK} className="lp-spin" />
          ) : address ? (
            <FaCheck size={13} color={MINT_DARK} />
          ) : (
            <FaMapMarkerAlt size={13} color={TEXT_MUTED} />
          )}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={s.addressLabel}>
            {reverseLoading
              ? "Detecting address..."
              : address
              ? "Pinned location"
              : "Drag the map to set your location"}
          </div>
          <div style={s.addressText}>
            {address || (
              <span style={{ color: TEXT_MUTED, fontStyle: "italic" }}>
                Move the map and the pin will mark the location
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ─── Inline animations ─── */}
      <style>{`
        @keyframes lp-spin { to { transform: rotate(360deg); } }
        .lp-spin { animation: lp-spin 1s linear infinite; }

        .lp-gps-btn { transition: all 0.2s ease; }
        .lp-gps-btn:hover:not(:disabled) {
          background: ${MINT_LIGHT} !important;
          transform: scale(1.05);
        }

        @keyframes lp-bounce {
          0%, 100% { transform: translate(-50%, -100%); }
          50% { transform: translate(-50%, -110%); }
        }
        .lp-center-pin { animation: lp-bounce 2s ease-in-out infinite; }
      `}</style>
    </div>
  );
}

/**
 * MapController — listens to map move events and syncs center
 */
function MapController({ mapCenter, onCenterChange }) {
  const map = useMap();
  const isInternalMove = useRef(false);

  // Listen for user-driven map moves
  useMapEvents({
    moveend: () => {
      if (isInternalMove.current) {
        isInternalMove.current = false;
        return;
      }
      const c = map.getCenter();
      onCenterChange(c.lat, c.lng);
    },
  });

  // When mapCenter changes externally (e.g. GPS button), pan map programmatically
  useEffect(() => {
    const current = map.getCenter();
    const [lat, lng] = mapCenter;
    // Only animate if significantly different
    if (Math.abs(current.lat - lat) > 0.0001 || Math.abs(current.lng - lng) > 0.0001) {
      isInternalMove.current = true;
      map.flyTo([lat, lng], 15, { duration: 1.2 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapCenter]);

  return null;
}

const s = {
  wrap: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  mapBox: {
    position: "relative",
    width: "100%",
    borderRadius: 14,
    overflow: "hidden",
    border: `1px solid ${BORDER}`,
    boxShadow: "0 4px 14px rgba(15,32,24,0.06)",
  },
  centerPin: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -100%)",
    zIndex: 500,
    pointerEvents: "none",
    filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.3))",
  },
  pinShadow: {
    width: 10,
    height: 4,
    background: "rgba(0,0,0,0.3)",
    borderRadius: "50%",
    margin: "2px auto 0",
    filter: "blur(2px)",
  },
  gpsBtn: {
    position: "absolute",
    bottom: 16,
    right: 16,
    width: 44,
    height: 44,
    borderRadius: "50%",
    background: "#fff",
    border: `1.5px solid ${BORDER}`,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 4px 12px rgba(15,32,24,0.15)",
    zIndex: 500,
  },
  addressBox: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "12px 16px",
    background: MINT_LIGHT,
    border: `1px solid ${BORDER}`,
    borderRadius: 11,
  },
  addressIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    background: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  addressLabel: {
    fontSize: 11,
    color: MINT_DARK,
    fontWeight: 800,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  addressText: {
    fontSize: 13,
    color: TEXT_DARK,
    fontWeight: 700,
    lineHeight: 1.4,
    wordBreak: "break-word",
  },
};