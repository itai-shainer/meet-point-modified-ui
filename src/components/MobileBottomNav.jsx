import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Map, Star, History, Settings } from "lucide-react";
import { useTheme } from "@/lib/ThemeProvider";

const NAV_ITEMS = [
  { label: "מפה", icon: Map, path: "/App" },
  { label: "מועדפים", icon: Star, path: "/Favorites" },
  { label: "היסטוריה", icon: History, path: "/RouteHistory" },
  { label: "הגדרות", icon: Settings, path: "/Settings" },
];

export default function MobileBottomNav() {
  const { darkMode } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  // Only show on app sub-routes, not on landing page
  const showOnPaths = ["/App", "/Favorites", "/RouteHistory", "/Settings"];
  if (!showOnPaths.includes(location.pathname)) return null;

  const handleNavClick = (e, path) => {
    const isActive = location.pathname === path;
    if (isActive) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
      navigate(path, { replace: true });
    }
  };

  return (
    <nav
      className={`fixed bottom-0 left-0 right-0 z-50 flex md:hidden border-t select-none ${
        darkMode
          ? "bg-gray-900/95 border-gray-700/60 backdrop-blur-xl"
          : "bg-white/95 border-gray-200 backdrop-blur-xl"
      }`}
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      {NAV_ITEMS.map(({ label, icon: Icon, path }) => {
        const isActive = location.pathname === path;
        return (
          <Link
            key={path}
            to={path}
            onClick={(e) => handleNavClick(e, path)}
            className={`flex-1 flex flex-col items-center justify-center py-3 gap-1 transition-colors active:scale-95 min-h-[56px] ${
              isActive
                ? darkMode
                  ? "text-blue-400"
                  : "text-blue-600"
                : darkMode
                ? "text-gray-500 hover:text-gray-300"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            <Icon className={`w-5 h-5 ${isActive ? "stroke-2" : "stroke-[1.5]"}`} />
            <span className={`text-[10px] font-medium ${isActive ? "font-semibold" : ""}`}>
              {label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}