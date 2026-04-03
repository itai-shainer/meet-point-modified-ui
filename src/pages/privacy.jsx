import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, Sun, Moon } from "lucide-react";
import { Link } from "react-router-dom";

const getInitialDarkMode = () => {
  const saved = localStorage.getItem('darkMode');
  if (saved !== null) return saved === 'true';
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
};

export default function PrivacyPolicy() {
  const [darkMode, setDarkMode] = useState(getInitialDarkMode);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('dir', 'ltr');
      if (darkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      localStorage.setItem('darkMode', darkMode.toString());
    }
  }, [darkMode]);

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-4xl mx-auto p-4 md:p-8">
        <div className="mb-8 flex justify-between items-center">
          <Button asChild variant="outline" className={darkMode ? 'bg-gray-800 border-gray-700 text-white' : ''}>
            <Link to="/">
              <ArrowRight className="w-4 h-4 mr-2" />
              Back to Home
            </Link>
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setDarkMode(!darkMode)}
            className={darkMode ? 'bg-gray-800 border-gray-700' : ''}
          >
            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </Button>
        </div>

        <div className={`rounded-2xl shadow-xl p-8 md:p-12 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className={`text-3xl md:text-4xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Privacy Policy
              </h1>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Last updated: January 15, 2026
              </p>
            </div>
          </div>

          <div className={`space-y-6 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            <section>
              <h2 className={`text-2xl font-bold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                1. Information We Collect
              </h2>
              <p className="mb-3">
                Meet Point collects the following information to provide our route optimization service:
              </p>
              <ul className="list-disc list-inside space-y-2 mr-4">
                <li>Email address and name (via Google OAuth authentication)</li>
                <li>Location data you provide (addresses for route calculation)</li>
                <li>Search history and saved routes</li>
                <li>Usage data and preferences</li>
              </ul>
            </section>

            <section>
              <h2 className={`text-2xl font-bold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                2. How We Use Your Information
              </h2>
              <p className="mb-3">We use your information to:</p>
              <ul className="list-disc list-inside space-y-2 mr-4">
                <li>Provide route optimization and meeting point calculations</li>
                <li>Save your search history and favorite routes</li>
                <li>Improve our service and user experience</li>
                <li>Communicate important updates about the service</li>
              </ul>
            </section>

            <section>
              <h2 className={`text-2xl font-bold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                3. Data Storage and Security
              </h2>
              <p>
                Your data is securely stored using industry-standard encryption. We use Base44 platform 
                for data management, which employs advanced security measures to protect your information. 
                Route calculations are performed using Google Maps API and our proprietary optimization algorithm.
              </p>
            </section>

            <section>
              <h2 className={`text-2xl font-bold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                4. Third-Party Services
              </h2>
              <p className="mb-3">We integrate with the following third-party services:</p>
              <ul className="list-disc list-inside space-y-2 mr-4">
                <li>Google OAuth for authentication</li>
                <li>Google Maps API for geocoding and route calculation</li>
                <li>Our backend optimization API for route planning</li>
              </ul>
              <p className="mt-3">
                These services have their own privacy policies governing the use of your information.
              </p>
            </section>

            <section>
              <h2 className={`text-2xl font-bold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                5. Your Rights
              </h2>
              <p className="mb-3">You have the right to:</p>
              <ul className="list-disc list-inside space-y-2 mr-4">
                <li>Access your personal data</li>
                <li>Request deletion of your data</li>
                <li>Export your saved routes and search history</li>
                <li>Opt-out of data collection (by not using the service)</li>
              </ul>
            </section>

            <section>
              <h2 className={`text-2xl font-bold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                6. Cookies and Local Storage
              </h2>
              <p>
                We use browser local storage to save your preferences (such as dark mode settings) 
                and to maintain your session. We do not use tracking cookies for advertising purposes.
              </p>
            </section>

            <section>
              <h2 className={`text-2xl font-bold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                7. Children's Privacy
              </h2>
              <p>
                Our service is not directed to children under 13. We do not knowingly collect 
                personal information from children under 13.
              </p>
            </section>

            <section>
              <h2 className={`text-2xl font-bold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                8. Changes to Privacy Policy
              </h2>
              <p>
                We may update this privacy policy from time to time. We will notify users of any 
                material changes by updating the "Last updated" date at the top of this policy.
              </p>
            </section>

            <section className={`p-6 rounded-xl border-2 ${darkMode ? 'border-blue-500/40 bg-blue-900/20' : 'border-blue-200 bg-blue-50'}`}>
              <h2 className={`text-2xl font-bold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                9. Data Retention and Account Deletion
              </h2>
              <p>
                To request the deletion of your MeetPoint account, location history, and all associated data, please send an email to{' '}
                <a href="mailto:meetpointhq@gmail.com" className="text-blue-500 hover:underline font-medium">meetpointhq@gmail.com</a>{' '}
                from your registered email address with the subject line <strong>"Account Deletion Request"</strong>. Your data will be completely removed from our servers within 30 days.
              </p>
            </section>

            <section>
              <h2 className={`text-2xl font-bold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                10. Contact Us
              </h2>
              <p>
                If you have any questions about this Privacy Policy, please contact us through 
                the app's support channels.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}