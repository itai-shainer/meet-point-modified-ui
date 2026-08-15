import React from "react";
import logoLight from "@/assets/brand/logo-light.png";
import logoDark from "@/assets/brand/logo-dark.png";

export default function MeetPointLogo({ size = "md", darkMode = false, customDarkSrc = null }) {
  const dimensions = {
    sm: "w-16 h-16",
    md: "w-20 h-20",
    lg: "w-24 h-24",
  };

  const src = darkMode ? (customDarkSrc || logoDark) : logoLight;

  return (
    <img
      src={src}
      alt="Meet Point Logo"
      className={`${dimensions[size] || dimensions.md} object-contain flex-shrink-0 -ml-2`}
      style={{ mixBlendMode: darkMode ? 'lighten' : 'multiply' }}
    />
  );
}