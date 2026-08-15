import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Loader2, Lock, Mail, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import MeetPointLogo from "../components/MeetPointLogo";
import { useAuth } from "@/lib/AuthContext";
import { useTheme } from "@/lib/ThemeProvider";

const MIN_PASSWORD_LENGTH = 8;

export default function Login() {
  const { darkMode } = useTheme();
  const { login, register, isAuthenticated, isLoadingAuth } = useAuth();
  const [searchParams] = useSearchParams();
  const returnTo = searchParams.get("returnTo") || "/App";

  const [mode, setMode] = useState("login"); // "login" | "register"
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Already signed in (e.g. arrived here via a stale link) — move along.
  useEffect(() => {
    if (!isLoadingAuth && isAuthenticated) {
      window.location.replace(returnTo);
    }
  }, [isLoadingAuth, isAuthenticated, returnTo]);

  const isRegister = mode === "register";

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (isRegister && password.length < MIN_PASSWORD_LENGTH) {
      setError(`הסיסמה חייבת להכיל לפחות ${MIN_PASSWORD_LENGTH} תווים.`);
      return;
    }

    setSubmitting(true);
    try {
      if (isRegister) {
        await register({ email, password, fullName });
      } else {
        await login({ email, password });
      }
      window.location.replace(returnTo);
    } catch (err) {
      setError(
        err?.status === 401
          ? "כתובת אימייל או סיסמה שגויים."
          : err?.status === 409
          ? "כתובת האימייל כבר רשומה. נסה להתחבר."
          : err?.message || "אירעה שגיאה. אנא נסה שוב."
      );
      setSubmitting(false);
    }
  };

  if (isLoadingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-950">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const inputClass = darkMode
    ? "bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
    : "bg-white border-gray-200";

  return (
    <div
      dir="rtl"
      className={`min-h-screen flex items-center justify-center p-4 ${darkMode ? "bg-gray-950" : "bg-gray-50"}`}
    >
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-6">
          <MeetPointLogo size="lg" darkMode={darkMode} />
          <h1 className={`text-2xl font-bold mt-2 ${darkMode ? "text-white" : "text-gray-900"}`}>
            {isRegister ? "יצירת חשבון" : "התחברות ל-Meet Point"}
          </h1>
          <p className={`text-sm mt-1 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
            {isRegister
              ? "הירשם כדי לשמור מסלולים ומועדפים"
              : "התחבר כדי לחשב נקודות מפגש ולשמור היסטוריה"}
          </p>
        </div>

        <div
          className={`rounded-2xl shadow-xl border p-6 ${
            darkMode ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200"
          }`}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <div>
                <Label className={`block mb-1.5 text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                  <UserIcon className="w-4 h-4 inline ml-1" />
                  שם מלא
                </Label>
                <Input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="ישראל ישראלי"
                  autoComplete="name"
                  className={inputClass}
                />
              </div>
            )}

            <div>
              <Label className={`block mb-1.5 text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                <Mail className="w-4 h-4 inline ml-1" />
                אימייל
              </Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                required
                dir="ltr"
                className={`text-left ${inputClass}`}
              />
            </div>

            <div>
              <Label className={`block mb-1.5 text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                <Lock className="w-4 h-4 inline ml-1" />
                סיסמה
              </Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete={isRegister ? "new-password" : "current-password"}
                minLength={isRegister ? MIN_PASSWORD_LENGTH : undefined}
                required
                dir="ltr"
                className={`text-left ${inputClass}`}
              />
              {isRegister && (
                <p className={`text-xs mt-1 ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
                  לפחות {MIN_PASSWORD_LENGTH} תווים.
                </p>
              )}
            </div>

            {error && (
              <div className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-800 dark:bg-red-900/30 dark:text-red-200">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={submitting}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-5 rounded-full font-semibold"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                  {isRegister ? "יוצר חשבון..." : "מתחבר..."}
                </>
              ) : isRegister ? (
                "צור חשבון"
              ) : (
                "התחבר"
              )}
            </Button>
          </form>

          <div className={`mt-5 pt-4 border-t text-center text-sm ${darkMode ? "border-gray-800" : "border-gray-100"}`}>
            <span className={darkMode ? "text-gray-400" : "text-gray-600"}>
              {isRegister ? "כבר יש לך חשבון?" : "אין לך חשבון עדיין?"}
            </span>{" "}
            <button
              type="button"
              onClick={() => {
                setMode(isRegister ? "login" : "register");
                setError("");
              }}
              className="font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400"
            >
              {isRegister ? "התחבר" : "הירשם"}
            </button>
          </div>
        </div>

        <p className={`text-center text-xs mt-4 ${darkMode ? "text-gray-600" : "text-gray-400"}`}>
          בהמשך השימוש אתה מסכים ל
          <a href="/terms" className="underline mx-1">
            תנאי השימוש
          </a>
          ול
          <a href="/privacy" className="underline mx-1">
            מדיניות הפרטיות
          </a>
        </p>
      </div>
    </div>
  );
}