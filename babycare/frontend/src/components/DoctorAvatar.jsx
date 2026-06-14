/**
 * DoctorAvatar — Reusable component
 * 
 * Usage:
 *   <DoctorAvatar photoUrl={doc.profile_photo_url} name={doc.full_name} size={50} />
 * 
 * Agar photo hai to image dikhata hai, warna initials with colored background.
 */

const COLORS = ["#2a9d5c", "#1a5c8a", "#7c3aed", "#b45309", "#0e7490", "#be123c"];

export default function DoctorAvatar({
  photoUrl,
  name = "",
  size = 50,
  fontSize,
  borderColor,
  showBorder = false,
}) {
  // First letter from name
  const initial = name.trim()
    ? name.trim().charAt(0).toUpperCase()
    : "?";

  // Pick a stable color based on name (har naam ka same color rahega)
  const colorIndex = name.length % COLORS.length;
  const bgColor = COLORS[colorIndex];

  // Auto font-size based on container size
  const computedFontSize = fontSize || Math.round(size * 0.4);

  const baseStyle = {
    width: size,
    height: size,
    borderRadius: "50%",
    flexShrink: 0,
    boxShadow: "0 4px 14px rgba(0,0,0,0.15)",
    ...(showBorder ? { border: `3px solid ${borderColor || "#fff"}` } : {}),
  };

  // Agar photo URL hai to image dikhao
  if (photoUrl) {
    return (
      <img
        src={photoUrl}
        alt={name}
        style={{
          ...baseStyle,
          objectFit: "cover",
        }}
        onError={(e) => {
          // Agar image load fail ho jaye to fallback
          e.target.style.display = "none";
          if (e.target.nextElementSibling) {
            e.target.nextElementSibling.style.display = "flex";
          }
        }}
      />
    );
  }

  // Initials fallback
  return (
    <div
      style={{
        ...baseStyle,
        background: `linear-gradient(135deg, ${bgColor}, ${bgColor}dd)`,
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: computedFontSize,
        fontWeight: 900,
        fontFamily: "'Nunito', sans-serif",
      }}
    >
      {initial}
    </div>
  );
}
