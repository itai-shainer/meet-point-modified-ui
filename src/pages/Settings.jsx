import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useTheme } from "@/lib/ThemeProvider";
import { Button } from "@/components/ui/button";
import { Home, Sun, Moon, Trash2, User } from "lucide-react";
import MeetPointLogo from "../components/MeetPointLogo";
import DeleteAccountDialog from "../components/DeleteAccountDialog";

export default function Settings() {
  const { darkMode, setDarkMode } = useTheme();
  const [user, setUser] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const me = await base44.auth.me();
        setUser(me);
      } catch (e) {
        // not logged in
      }
    };
    loadUser();
  }, []);

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? "bg-gray-900" : "bg-gray-50"}`}>
      <div className="max-w-2xl mx-auto p-4 pb-24">
        {/* Header */}
        <div className={`flex items-center justify-between gap-2 mb-6 p-3 rounded-2xl backdrop-blur-md border shadow-xl ${darkMode ? "bg-gray-900/90 border-white/10" : "bg-white/90 border-white/20"}`}>
          <div className="flex items-center gap-2">
            <MeetPointLogo size="sm" darkMode={darkMode} customDarkSrc="https://media.base44.com/images/public/68de300ce9a2edafebb3ebe5/78d40b603_AdobeExpress-file.png" />
            <h1 className={`text-xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>הגדרות</h1>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline" size="icon" className={`hidden md:inline-flex ${darkMode ? "bg-gray-800/50 border-gray-700/50 text-white" : ""}`}>
              <Link to="/" onClick={() => sessionStorage.setItem('viewLanding', '1')}><Home className="w-5 h-5" /></Link>
            </Button>
            <Button variant="outline" size="icon" onClick={() => setDarkMode(!darkMode)} className={darkMode ? "bg-gray-800/50 border-gray-700/50 text-white" : ""}>
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* User Info */}
        {user && (
          <div className={`rounded-2xl p-5 mb-4 border ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${darkMode ? "bg-gray-700" : "bg-gray-100"}`}>
                <User className={`w-6 h-6 ${darkMode ? "text-gray-300" : "text-gray-600"}`} />
              </div>
              <div>
                <p className={`font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>{user.full_name || "משתמש"}</p>
                <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>{user.email}</p>
              </div>
            </div>
          </div>
        )}

        {/* Appearance */}
        <div className={`rounded-2xl p-5 mb-4 border ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
          <h2 className={`text-sm font-semibold mb-3 uppercase tracking-wide ${darkMode ? "text-gray-400" : "text-gray-500"}`}>מראה</h2>
          <div className="flex items-center justify-between">
            <span className={`font-medium ${darkMode ? "text-white" : "text-gray-800"}`}>מצב כהה</span>
            <div
              dir="ltr"
              onClick={() => setDarkMode(!darkMode)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${darkMode ? "bg-blue-600" : "bg-gray-300"}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${darkMode ? "translate-x-6" : "translate-x-1"}`} />
            </div>
          </div>
        </div>

        {/* Account Actions */}
        <div className={`rounded-2xl p-5 border ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
          <h2 className={`text-sm font-semibold mb-3 uppercase tracking-wide ${darkMode ? "text-gray-400" : "text-gray-500"}`}>חשבון</h2>
          <button
            onClick={() => base44.auth.logout("/")}
            className={`w-full text-right px-4 py-3 rounded-xl mb-2 font-medium transition-colors ${darkMode ? "text-gray-200 hover:bg-gray-700" : "text-gray-700 hover:bg-gray-50"}`}
          >
            התנתק
          </button>
          <div className={`border-t my-2 ${darkMode ? "border-gray-700" : "border-gray-100"}`} />
          <button
            onClick={() => setShowDeleteDialog(true)}
            className="w-full text-right px-4 py-3 rounded-xl font-medium transition-colors text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            מחק חשבון
          </button>
          <p className={`text-xs mt-2 px-1 ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
            מחיקת החשבון תמחק לצמיתות את כל הנתונים שלך ואינה ניתנת לביטול.
          </p>
        </div>
      </div>

      <DeleteAccountDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        darkMode={darkMode}
      />
    </div>
  );
}