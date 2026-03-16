import React from "react";

const DARK_LOGO = "https://media.base44.com/images/public/68de300ce9a2edafebb3ebe5/f576af030_Screenshot2026-03-16at214118.png";
const LIGHT_LOGO = "https://media.base44.com/images/public/68de300ce9a2edafebb3ebe5/3bffa3adf_Screenshot2026-03-16at214122.png";

export default function MeetPointLogo({ size = "md", darkMode = false }) {
  const dimensions = {
    sm: "w-12 h-12",
    md: "w-16 h-16",
    lg: "w-20 h-20",
  };

  return (
    <img
      src={darkMode ? DARK_LOGO : LIGHT_LOGO}
      alt="Meet Point Logo"
      className={`${dimensions[size] || dimensions.md} object-contain flex-shrink-0`}
    />
  );
}