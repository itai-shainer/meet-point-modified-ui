import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { MapPin, Clock, Users, TrendingUp, ArrowRight, CheckCircle2, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createPageUrl } from "@/utils";

const getInitialDarkMode = () => {
  const saved = localStorage.getItem('darkMode');
  if (saved !== null) {
    return saved === 'true';
  }
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
};

export default function Home() {
  const [scrolled, setScrolled] = useState(false);
  const [darkMode, setDarkMode] = useState(getInitialDarkMode);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      if (darkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      localStorage.setItem('darkMode', darkMode.toString());
    }
  }, [darkMode]);

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-white via-blue-50/30 to-white'}`} dir="rtl">
      {/* Navbar */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? (darkMode ? 'bg-gray-800/80 backdrop-blur-lg shadow-sm' : 'bg-white/80 backdrop-blur-lg shadow-sm') : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <span className={`text-2xl font-bold ${darkMode ? 'text-white' : 'bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent'}`}>
                Meet Point
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setDarkMode(!darkMode)}
                className={darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'}
              >
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </Button>
              <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all">
                <Link to={createPageUrl('App')}>
                  התחבר
                  <ArrowRight className="w-4 h-4 mr-2" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-right">
              <h1 className={`text-4xl md:text-6xl font-bold mb-6 leading-tight ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                מצא את נקודת המפגש <br />
                <span className="bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                  המושלמת
                </span>
              </h1>
              <p className={`text-lg md:text-xl mb-8 leading-relaxed ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                מחשבון נקודת המפגש החכם שחוסך לך ולחבריך זמן ונסיעה. <br />
                הוגן לכולם, בכל פעם.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all text-lg px-8 py-6 rounded-full hover:scale-105 transition-transform">
                  <Link to={createPageUrl('App')}>
                    <MapPin className="w-5 h-5 ml-2" />
                    מצא נקודת מפגש
                  </Link>
                </Button>
              </div>
              <div className={`flex items-center gap-6 mt-8 justify-center lg:justify-start text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <span>ללא התחייבות</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <span>התחבר עם Google</span>
                </div>
              </div>
            </div>

            {/* Visual Mockup */}
            <div className="relative hidden lg:block">
              <div className="relative">
                {/* Glassmorphism Card */}
                <div className="bg-white/60 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20">
                  <div className="space-y-4">
                    <div className="h-12 bg-gradient-to-r from-blue-100 to-blue-50 rounded-xl animate-pulse"></div>
                    <div className="h-12 bg-gradient-to-r from-green-100 to-green-50 rounded-xl animate-pulse delay-75"></div>
                    <div className="h-12 bg-gradient-to-r from-purple-100 to-purple-50 rounded-xl animate-pulse delay-150"></div>
                    <div className="h-32 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl flex items-center justify-center">
                      <MapPin className="w-16 h-16 text-blue-500" />
                    </div>
                  </div>
                </div>
                {/* Floating Elements */}
                <div className="absolute -top-6 -right-6 w-20 h-20 bg-blue-500 rounded-full opacity-20 blur-2xl animate-pulse"></div>
                <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-purple-500 rounded-full opacity-20 blur-3xl animate-pulse delay-300"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className={`py-20 px-4 md:px-8 ${darkMode ? 'bg-gray-800/50' : 'bg-white/50'}`}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              למה Meet Point?
            </h2>
            <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              חישוב חכם, חיסכון בזמן, הוגנות מרבית
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className={`backdrop-blur-sm rounded-2xl p-8 shadow-lg border hover:shadow-xl transition-all ${darkMode ? 'bg-gray-800/80 border-gray-700' : 'bg-white/80 border-gray-100'}`}>
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6">
                <Users className="w-7 h-7 text-white" />
              </div>
              <h3 className={`text-xl font-bold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>הוגנות מלאה</h3>
              <p className={`leading-relaxed ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                האלגוריתם שלנו מחשב את נקודת המפגש האופטימלית לכל המשתתפים, כך שאף אחד לא נוסע יותר מדי.
              </p>
            </div>

            {/* Feature 2 */}
            <div className={`backdrop-blur-sm rounded-2xl p-8 shadow-lg border hover:shadow-xl transition-all ${darkMode ? 'bg-gray-800/80 border-gray-700' : 'bg-white/80 border-gray-100'}`}>
              <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mb-6">
                <Clock className="w-7 h-7 text-white" />
              </div>
              <h3 className={`text-xl font-bold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>חיסכון בזמן</h3>
              <p className={`leading-relaxed ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                פתרון מיידי תוך שניות. אין יותר צורך בחישובים ידניים או ויכוחים ארוכים על מיקום המפגש.
              </p>
            </div>

            {/* Feature 3 */}
            <div className={`backdrop-blur-sm rounded-2xl p-8 shadow-lg border hover:shadow-xl transition-all ${darkMode ? 'bg-gray-800/80 border-gray-700' : 'bg-white/80 border-gray-100'}`}>
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6">
                <TrendingUp className="w-7 h-7 text-white" />
              </div>
              <h3 className={`text-xl font-bold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>אינטגרציה עם תחבורה ציבורית</h3>
              <p className={`leading-relaxed ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                תמיכה מלאה בתחבורה ציבורית, כולל חישוב מסלולי אוטובוס ורכבת לנוחות מקסימלית.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 md:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-3xl p-12 md:p-16 text-center shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIxLTEuNzktNC00LTRINTJ2NGMwIDIuMjEgMS43OSA0IDQgNHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-50"></div>
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                מוכן למצוא את נקודת המפגש המושלמת?
              </h2>
              <p className="text-xl text-blue-100 mb-8">
                הצטרף אלינו והתחל לחסוך זמן כבר היום
              </p>
              <Button asChild size="lg" className="bg-white hover:bg-gray-100 text-blue-600 shadow-lg hover:shadow-xl transition-all text-lg px-10 py-6 rounded-full hover:scale-105 transition-transform">
                <Link to={createPageUrl('App')}>
                  <MapPin className="w-5 h-5 ml-2" />
                  התחל עכשיו
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={`py-12 px-4 md:px-8 border-t ${darkMode ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-white/50'}`}>
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600">
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <span className={`text-xl font-bold ${darkMode ? 'text-white' : 'bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent'}`}>
                Meet Point
              </span>
            </div>
            <div className={`flex flex-wrap items-center gap-6 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              <span>© 2026 Meet Point</span>
              <a href="#" className="hover:text-blue-600 transition-colors">פרטיות</a>
              <a href="#" className="hover:text-blue-600 transition-colors">תנאי שימוש</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}