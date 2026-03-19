import React from "react";

const LIGHT_LOGO = "https://media.base44.com/images/public/68de300ce9a2edafebb3ebe5/3bffa3adf_Screenshot2026-03-16at214122.png";

const DarkModeLogo = ({ size }) => {
  const px = { sm: 40, md: 52, lg: 64 }[size] || 52;
  return (
    <svg width={px} height={px} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="4" y="28" width="40" height="28" rx="3" stroke="white" strokeWidth="2.5" fill="none" />
      <path d="M4 38 Q24 32 44 38" stroke="white" strokeWidth="2" fill="none" />
      <path d="M14 28 Q18 18 24 28" stroke="white" strokeWidth="2" fill="none" />
      <path d="M30 28 Q34 18 40 28" stroke="white" strokeWidth="2" fill="none" />
      <circle cx="50" cy="18" r="8" stroke="#a78bfa" strokeWidth="2.5" fill="none" />
      <line x1="50" y1="26" x2="50" y2="34" stroke="#a78bfa" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="50" cy="18" r="2.5" fill="#a78bfa" />
    </svg>
  );
};

export default function MeetPointLogo({ size = "md", darkMode = false }) {
  const dimensions = {
    sm: "w-10 h-10",
    md: "w-13 h-13",
    lg: "w-16 h-16",
  };

  if (darkMode) {
    return <DarkModeLogo size={size} />;
  }

  return (
    <img
      src={LIGHT_LOGO}
      alt="Meet Point Logo"
      className={`${dimensions[size] || dimensions.md} object-contain flex-shrink-0`}
      style={{ mixBlendMode: 'multiply' }}
    />
  );
}