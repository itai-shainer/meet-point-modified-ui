import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { MapPin, Zap, Shield, Sparkles, ArrowRight, Check, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";

const getInitialDarkMode = () => {
  const saved = localStorage.getItem('darkMode');
  if (saved !== null) {
    return saved === 'true';
  }
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
};

// SEO Component
const SEOHead = () => {
  useEffect(() => {
    document.title = "Meet Point - The Fair Meeting Spot Calculator";
    
    // Add meta description
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', 'Find the perfect middle ground. The intelligent meeting point calculator that saves time, saves gas, and meets halfway—fairly.');
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = 'Find the perfect middle ground. The intelligent meeting point calculator that saves time, saves gas, and meets halfway—fairly.';
      document.head.appendChild(meta);
    }

    // Add JSON-LD Schema
    const schemaScript = document.createElement('script');
    schemaScript.type = 'application/ld+json';
    schemaScript.text = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "Meet Point",
      "url": window.location.origin,
      "description": "The intelligent meeting point calculator. Save time, save gas, and meet halfway—fairly."
    });
    document.head.appendChild(schemaScript);

    return () => {
      if (schemaScript.parentNode) {
        schemaScript.parentNode.removeChild(schemaScript);
      }
    };
  }, []);

  return null;
};

// Animated Meeting Point Visual
const MeetingAnimation = () => {
  return (
    <div className="relative w-full h-64 flex items-center justify-center">
      <svg className="w-full h-full" viewBox="0 0 400 200">
        {/* User A */}
        <motion.circle
          cx="50"
          cy="100"
          r="12"
          fill="#3B82F6"
          initial={{ cx: 50 }}
          animate={{ cx: [50, 170, 170, 50] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.text
          x="50"
          y="130"
          textAnchor="middle"
          fill="currentColor"
          className="text-xs font-medium fill-gray-600 dark:fill-gray-400"
          initial={{ x: 50 }}
          animate={{ x: [50, 170, 170, 50] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        >
          User A
        </motion.text>

        {/* User B */}
        <motion.circle
          cx="350"
          cy="100"
          r="12"
          fill="#10B981"
          initial={{ cx: 350 }}
          animate={{ cx: [350, 230, 230, 350] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.text
          x="350"
          y="130"
          textAnchor="middle"
          fill="currentColor"
          className="text-xs font-medium fill-gray-600 dark:fill-gray-400"
          initial={{ x: 350 }}
          animate={{ x: [350, 230, 230, 350] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        >
          User B
        </motion.text>

        {/* Meeting Point */}
        <motion.circle
          cx="200"
          cy="100"
          r="8"
          fill="#8B5CF6"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: [0, 1.5, 1, 1, 0], opacity: [0, 1, 1, 1, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", times: [0, 0.3, 0.4, 0.9, 1] }}
        />
        <motion.text
          x="200"
          y="80"
          textAnchor="middle"
          fill="currentColor"
          className="text-xs font-bold fill-purple-600 dark:fill-purple-400"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 1, 1, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", times: [0, 0.3, 0.4, 0.9, 1] }}
        >
          Meet Here
        </motion.text>

        {/* Connecting Lines */}
        <motion.line
          x1="50"
          y1="100"
          x2="200"
          y2="100"
          stroke="#3B82F6"
          strokeWidth="2"
          strokeDasharray="5,5"
          initial={{ x1: 50, x2: 50 }}
          animate={{ x1: [50, 50, 50, 50], x2: [50, 200, 200, 50] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", times: [0, 0.3, 0.9, 1] }}
        />
        <motion.line
          x1="350"
          y1="100"
          x2="200"
          y2="100"
          stroke="#10B981"
          strokeWidth="2"
          strokeDasharray="5,5"
          initial={{ x1: 350, x2: 350 }}
          animate={{ x1: [350, 350, 350, 350], x2: [350, 200, 200, 350] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", times: [0, 0.3, 0.9, 1] }}
        />
      </svg>
    </div>
  );
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
    <>
      <SEOHead />
      <div className="min-h-screen bg-white dark:bg-gray-950 relative overflow-hidden" dir="rtl">
        {/* Mesh Gradient Background */}
        <div className="fixed inset-0 -z-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>

        {/* Navbar */}
        <motion.nav 
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl shadow-lg' : 'bg-transparent'}`}
        >
          <div className="max-w-7xl mx-auto px-6 md:px-12 py-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg">
                  <MapPin className="w-7 h-7 text-white" />
                </div>
                <span className="text-3xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Meet Point
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setDarkMode(!darkMode)}
                  className="rounded-full hover:scale-110 transition-transform"
                >
                  {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </Button>
                <Button 
                  asChild 
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg rounded-full px-6 hover:scale-105 transition-all"
                >
                  <Link to={createPageUrl('App')}>
                    התחבר
                    <ArrowRight className="w-4 h-4 mr-2" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </motion.nav>

        {/* Hero Section */}
        <section className="pt-40 pb-20 px-6 md:px-12">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="text-center lg:text-right"
              >
                <motion.h1 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.8 }}
                  className="text-5xl md:text-7xl lg:text-8xl font-extrabold mb-6 leading-tight"
                  style={{ fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 800 }}
                >
                  <span className="text-gray-900 dark:text-white">Find the</span><br />
                  <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
                    Perfect Middle Ground
                  </span>
                </motion.h1>
                
                <motion.p 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.8 }}
                  className="text-xl md:text-2xl mb-10 text-gray-600 dark:text-gray-400 leading-relaxed max-w-2xl mx-auto lg:mx-0"
                >
                  The intelligent meeting point calculator. Save time, save gas, and meet halfway—fairly.
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.8 }}
                >
                  <Button 
                    asChild 
                    size="lg"
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-2xl text-xl px-12 py-8 rounded-full hover:scale-110 transition-all group"
                  >
                    <Link to={createPageUrl('App')}>
                      <span className="font-bold">Find a Meeting Point</span>
                      <ArrowRight className="w-6 h-6 mr-3 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8, duration: 0.8 }}
                  className="flex items-center gap-8 mt-10 justify-center lg:justify-start text-sm text-gray-600 dark:text-gray-400"
                >
                  <div className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-green-500" />
                    <span>No signup required</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-green-500" />
                    <span>Always free</span>
                  </div>
                </motion.div>
              </motion.div>

              {/* Animated Visual */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4, duration: 1 }}
                className="relative"
              >
                <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl rounded-3xl p-10 shadow-2xl border border-white/20 dark:border-gray-800/20">
                  <MeetingAnimation />
                </div>
                
                {/* Floating Orbs */}
                <div className="absolute -top-8 -right-8 w-24 h-24 bg-blue-500 rounded-full opacity-30 blur-2xl animate-pulse"></div>
                <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-purple-500 rounded-full opacity-30 blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Bento Grid Features */}
        <section className="py-24 px-6 md:px-12">
          <div className="max-w-7xl mx-auto">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-extrabold mb-4 text-gray-900 dark:text-white">
                Why Choose Meet Point?
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-400">
                Intelligent algorithms. Fair results. Zero hassle.
              </p>
            </motion.div>

            {/* Bento Grid Layout */}
            <div className="grid md:grid-cols-3 gap-6">
              {/* Large Feature 1 */}
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1, duration: 0.6 }}
                className="md:col-span-2 bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl rounded-3xl p-10 border border-white/20 dark:border-gray-800/20 shadow-xl hover:shadow-2xl transition-all hover:scale-105"
              >
                <div className="flex items-start gap-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
                    <Zap className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">Public Transit Integration</h3>
                    <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
                      Full support for buses, trains, and mixed-mode travel. We calculate the optimal meeting point considering all transportation options.
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Small Feature 1 */}
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl rounded-3xl p-10 border border-white/20 dark:border-gray-800/20 shadow-xl hover:shadow-2xl transition-all hover:scale-105"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                  <Shield className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">Fairness Algorithms</h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  Balanced travel times for everyone involved.
                </p>
              </motion.div>

              {/* Small Feature 2 */}
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl rounded-3xl p-10 border border-white/20 dark:border-gray-800/20 shadow-xl hover:shadow-2xl transition-all hover:scale-105"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                  <Sparkles className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">Secure Locations</h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  Safe, public meeting spots prioritized.
                </p>
              </motion.div>

              {/* Large Feature 2 */}
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="md:col-span-2 bg-gradient-to-br from-blue-600 to-purple-600 rounded-3xl p-10 shadow-xl hover:shadow-2xl transition-all hover:scale-105 text-white"
              >
                <h3 className="text-3xl font-bold mb-4">Real-Time Traffic & Transit Data</h3>
                <p className="text-xl text-blue-100 leading-relaxed">
                  Live updates ensure you always get the fastest, most efficient route—no matter what time of day.
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 px-6 md:px-12">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto"
          >
            <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl rounded-3xl p-16 text-center shadow-2xl border border-white/20 dark:border-gray-800/20 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10"></div>
              <div className="relative z-10">
                <h2 className="text-4xl md:text-5xl font-extrabold mb-6 text-gray-900 dark:text-white">
                  Ready to Find Your Perfect Meeting Spot?
                </h2>
                <p className="text-xl text-gray-600 dark:text-gray-400 mb-10">
                  Join thousands who've already saved time and gas. Get started in seconds.
                </p>
                <Button 
                  asChild 
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-2xl text-xl px-12 py-8 rounded-full hover:scale-110 transition-all"
                >
                  <Link to={createPageUrl('App')}>
                    <span className="font-bold">Start Now - It's Free</span>
                    <ArrowRight className="w-6 h-6 mr-3" />
                  </Link>
                </Button>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Footer */}
        <footer className="py-12 px-6 md:px-12 border-t border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600">
                  <MapPin className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Meet Point
                </span>
              </div>
              <div className="flex items-center gap-8 text-sm text-gray-600 dark:text-gray-400">
                <span>© 2026 Meet Point</span>
                <a href="#" className="hover:text-blue-600 transition-colors">Privacy</a>
                <a href="#" className="hover:text-blue-600 transition-colors">Terms</a>
              </div>
            </div>
          </div>
        </footer>

        {/* Blob Animation Styles */}
        <style>{`
          @keyframes blob {
            0%, 100% { transform: translate(0, 0) scale(1); }
            25% { transform: translate(20px, -30px) scale(1.1); }
            50% { transform: translate(-20px, 20px) scale(0.9); }
            75% { transform: translate(30px, 10px) scale(1.05); }
          }
          .animate-blob {
            animation: blob 15s infinite;
          }
          .animation-delay-2000 {
            animation-delay: 2s;
          }
          .animation-delay-4000 {
            animation-delay: 4s;
          }
        `}</style>
      </div>
    </>
  );
}