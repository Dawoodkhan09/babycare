import { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, CircleMarker } from "react-leaflet";
import L from "leaflet";
import { FaLocationArrow, FaUserMd, FaSpinner } from "react-icons/fa";

const MINT = "#2a9d5c";
const MINT_LIGHT = "#e8f8ef";
const MINT_DARK = "#1a6e3f";
const TEXT_DARK = "#0a1f15";
const TEXT_BODY = "#3d5a48";
const TEXT_MUTED = "#5a7a6a";
const BORDER = "#e0ede6";

// Default center: Karachi, Pakistan
const DEFAULT_CENTER = [24.8607, 67.0011];
const DEFAULT_ZOOM = 12;

// ─── Custom Marker Icons (no broken default-image issue) ───
const doctorIcon = L.divIcon({
  className: "custom-doctor-icon",
  html: `
    <div style="
      width: 36px; height: 36px;
      background: linear-gradient(135deg, ${MINT}, ${MINT_DARK});
      border: 3px solid #fff;
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 4px 10px rgba(15,32,24,0.3);
      color: #fff; font-weight: 800; font-size: 13px;
    ">
      <svg width="16" height="16" viewBox="0 0 512 512" fill="#fff" xmlns="http://www.w3.org/2000/svg">
        <path d="M384 64h-32V32a32 32 0 00-32-32H192a32 32 0 00-32 32v32H128a64 64 0 00-64 64v320a64 64 0 0064 64h256a64 64 0 0064-64V128a64 64 0 00-64-64zm-160 0V32h64v32zm96 240a16 16 0 01-16 16h-32v32a16 16 0 01-16 16h-32a16 16 0 01-16-16v-32h-32a16 16 0 01-16-16v-32a16 16 0 0116-16h32v-32a16 16 0 0116-16h32a16 16 0 0116 16v32h32a16 16 0 0116 16z"/>
      </svg>
    </div>
  `,
  iconSize: [36, 36],
  iconAnchor: [18, 18],
  popupAnchor: [0, -18],
});

const doctorIconActive = L.divIcon({
  className: "custom-doctor-icon-active",
  html: `
    <div style="
      width: 44px; height: 44px;
      background: #f59e0b;
      border: 4px solid #fff;
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 6px 14px rgba(245,158,11,0.5);
      transform: scale(1.1);
    ">
      <svg width="20" height="20" viewBox="0 0 512 512" fill="#fff" xmlns="http://www.w3.org/2000/svg">
        <path d="M384 64h-32V32a32 32 0 00-32-32H192a32 32 0 00-32 32v32H128a64 64 0 00-64 64v320a64 64 0 0064 64h256a64 64 0 0064-64V128a64 64 0 00-64-64zm-160 0V32h64v32zm96 240a16 16 0 01-16 16h-32v32a16 16 0 01-16 16h-32a16 16 0 01-16-16v-32h-32a16 16 0 01-16-16v-32a16 16 0 0116-16h32v-32a16 16 0 0116-16h32a16 16 0 0116 16v32h32a16 16 0 0116 16z"/>
      </svg>
    </div>
  `,
  iconSize: [44, 44],
  iconAnchor: [22, 22],
  popupAnchor: [0, -22],
});

/**
 * DoctorsMap — Shows all doctors on a map + user's current location
 *
 * Props:
 *  - doctors: [{ id, full_name, specialty, latitude, longitude, ... }]
 *  - selectedDoctorId: number | null — highlights selected doctor
 *  - onDoctorClick: (doctorId) => void
 *  - height: number (default 500)
 */
export default function DoctorsMap({
  doctors = [],
  selectedDoctorId = null,
  onDoctorClick,
  height = 500,
}) {
  const [userLocation, setUserLocation] = useState(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState("");

  // Filter doctors with valid coordinates
  const doctorsWithCoords = doctors.filter(
    (d) => d.latitude && d.longitude && !isNaN(parseFloat(d.latitude))
  );

  // Detect user location
  const detectLocation = () => {
    if (!navigator.geolocation) {
      setGpsError("Your browser does not support geolocation");
      return;
    }
    setGpsLoading(true);
    setGpsError("");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        setGpsLoading(false);
      },
      (err) => {
        setGpsError("Location access denied");
        setGpsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Compute initial map center
  let initialCenter = DEFAULT_CENTER;
  if (doctorsWithCoords.length > 0) {
    initialCenter = [
      parseFloat(doctorsWithCoords[0].latitude),
      parseFloat(doctorsWithCoords[0].longitude),
    ];
  }

  return (
    <div style={s.wrap}>
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

          {/* ─── Doctor Markers ─── */}
          {doctorsWithCoords.map((doc) => (
            <Marker
              key={doc.id}
              position={[parseFloat(doc.latitude), parseFloat(doc.longitude)]}
              icon={selectedDoctorId === doc.id ? doctorIconActive : doctorIcon}
              eventHandlers={{
                click: () => onDoctorClick?.(doc.id),
              }}
            >
              <Popup>
                <div style={{ minWidth: 180 }}>
                  <div style={{ fontWeight: 800, fontSize: 14, color: TEXT_DARK, marginBottom: 4 }}>
                    Dr. {doc.full_name}
                  </div>
                  <div style={{ fontSize: 12, color: MINT_DARK, fontWeight: 700, marginBottom: 6 }}>
                    {doc.specialty}
                  </div>
                  {doc.clinic_address && (
                    <div style={{ fontSize: 11.5, color: TEXT_MUTED, marginBottom: 6 }}>
                      📍 {doc.clinic_address}
                    </div>
                  )}
                  <div style={{ fontSize: 12, color: TEXT_DARK, fontWeight: 700 }}>
                    Fee: <span style={{ color: MINT_DARK }}>Rs. {doc.consultation_fee}</span>
                  </div>
                  <button
                    onClick={() => onDoctorClick?.(doc.id)}
                    style={{
                      marginTop: 8,
                      width: "100%",
                      background: MINT_DARK,
                      color: "#fff",
                      border: "none",
                      padding: "7px 12px",
                      borderRadius: 7,
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    Select Doctor
                  </button>
                </div>
              </Popup>
            </Marker>
          ))}

          {/* ─── User Location Marker (blue pulse) ─── */}
          {userLocation && (
            <CircleMarker
              center={[userLocation.lat, userLocation.lng]}
              radius={10}
              pathOptions={{
                color: "#fff",
                fillColor: "#1d4ed8",
                fillOpacity: 1,
                weight: 3,
              }}
            >
              <Popup>
                <div style={{ fontWeight: 700, fontSize: 13, color: TEXT_DARK }}>
                  📍 You are here
                </div>
              </Popup>
            </CircleMarker>
          )}

          {/* Auto-fit to show all doctors */}
          <FitBounds doctors={doctorsWithCoords} userLocation={userLocation} />
        </MapContainer>

        {/* ─── GPS Button ─── */}
        <button
          type="button"
          style={s.gpsBtn}
          className="dm-gps-btn"
          onClick={detectLocation}
          disabled={gpsLoading}
        >
          {gpsLoading ? (
            <FaSpinner size={14} className="dm-spin" />
          ) : (
            <FaLocationArrow size={13} color={MINT_DARK} />
          )}
          <span>{gpsLoading ? "Finding..." : userLocation ? "Found" : "Find Me"}</span>
        </button>

        {/* ─── Empty state overlay ─── */}
        {doctorsWithCoords.length === 0 && (
          <div style={s.emptyOverlay}>
            <FaUserMd size={32} color={MINT_DARK} />
            <div style={s.emptyText}>No doctor locations yet</div>
            <div style={s.emptySub}>
              Doctors will appear here once their locations are set
            </div>
          </div>
        )}
      </div>

      {gpsError && <div style={s.errorMsg}>⚠️ {gpsError}</div>}

      {/* Inline animations */}
      <style>{`
        @keyframes dm-spin { to { transform: rotate(360deg); } }
        .dm-spin { animation: dm-spin 1s linear infinite; }
        .dm-gps-btn { transition: all 0.2s ease; }
        .dm-gps-btn:hover:not(:disabled) {
          background: ${MINT_LIGHT} !important;
          transform: translateY(-1px);
          box-shadow: 0 6px 14px rgba(15,32,24,0.2);
        }
        .leaflet-popup-content-wrapper {
          border-radius: 10px !important;
        }
        .leaflet-popup-content {
          margin: 12px 14px !important;
          font-family: 'Inter','Nunito',sans-serif !important;
        }
      `}</style>
    </div>
  );
}

/**
 * FitBounds — Auto-zoom map to fit all markers
 */
function FitBounds({ doctors, userLocation }) {
  const map = useMap();

  useEffect(() => {
    const points = [];
    doctors.forEach((d) => {
      const lat = parseFloat(d.latitude);
      const lng = parseFloat(d.longitude);
      if (!isNaN(lat) && !isNaN(lng)) {
        points.push([lat, lng]);
      }
    });
    if (userLocation) {
      points.push([userLocation.lat, userLocation.lng]);
    }

    if (points.length > 0) {
      const bounds = L.latLngBounds(points);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
    }
  }, [doctors, userLocation, map]);

  return null;
}

const s = {
  wrap: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  mapBox: {
    position: "relative",
    width: "100%",
    borderRadius: 14,
    overflow: "hidden",
    border: `1px solid ${BORDER}`,
    boxShadow: "0 4px 14px rgba(15,32,24,0.06)",
  },
  gpsBtn: {
    position: "absolute",
    bottom: 16,
    right: 16,
    background: "#fff",
    border: `1.5px solid ${BORDER}`,
    borderRadius: 22,
    padding: "9px 14px 9px 12px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: 7,
    fontSize: 12.5,
    fontWeight: 700,
    color: TEXT_DARK,
    fontFamily: "inherit",
    boxShadow: "0 4px 12px rgba(15,32,24,0.15)",
    zIndex: 500,
  },
  emptyOverlay: {
    position: "absolute",
    inset: 0,
    background: "rgba(255,255,255,0.92)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    zIndex: 600,
    padding: 20,
    textAlign: "center",
  },
  emptyText: {
    fontSize: 14,
    fontWeight: 800,
    color: TEXT_DARK,
  },
  emptySub: {
    fontSize: 12.5,
    color: TEXT_MUTED,
    fontWeight: 600,
    maxWidth: 280,
  },
  errorMsg: {
    fontSize: 12.5,
    color: "#991b1b",
    background: "#fee2e2",
    padding: "8px 12px",
    borderRadius: 8,
    fontWeight: 600,
    border: "1px solid #fecaca",
  },
};