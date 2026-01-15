import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, FileText, Sun, Moon } from "lucide-react";
import { Link } from "react-router-dom";

const getInitialDarkMode = () => {
  const saved = localStorage.getItem('darkMode');
  if (saved !== null) return saved === 'true';
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
};

export default function TermsOfService() {
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
              <FileText className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className={`text-3xl md:text-4xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Terms of Service
              </h1>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Last updated: January 15, 2026
              </p>
            </div>
          </div>

          <div className={`space-y-6 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            <section>
              <h2 className={`text-2xl font-bold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                1. Acceptance of Terms
              </h2>
              <p>
                By accessing and using Meet Point, you accept and agree to be bound by the terms 
                and provision of this agreement. If you do not agree to these terms, please do not 
                use our service.
              </p>
            </section>

            <section>
              <h2 className={`text-2xl font-bold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                2. Description of Service
              </h2>
              <p>
                Meet Point is a route optimization service that helps users find optimal meeting points 
                and travel routes. The service uses location data, mapping APIs, and proprietary algorithms 
                to calculate the best routes for drivers and passengers.
              </p>
            </section>

            <section>
              <h2 className={`text-2xl font-bold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                3. User Account
              </h2>
              <p className="mb-3">To use Meet Point, you must:</p>
              <ul className="list-disc list-inside space-y-2 mr-4">
                <li>Authenticate using a valid Google account</li>
                <li>Provide accurate and complete information</li>
                <li>Maintain the security of your account credentials</li>
                <li>Be at least 13 years old (or the legal age in your jurisdiction)</li>
              </ul>
            </section>

            <section>
              <h2 className={`text-2xl font-bold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                4. Acceptable Use
              </h2>
              <p className="mb-3">You agree not to:</p>
              <ul className="list-disc list-inside space-y-2 mr-4">
                <li>Use the service for any illegal or unauthorized purpose</li>
                <li>Attempt to gain unauthorized access to the service or its systems</li>
                <li>Interfere with or disrupt the service or servers</li>
                <li>Use automated systems to access the service without permission</li>
                <li>Violate any applicable local, state, national, or international law</li>
              </ul>
            </section>

            <section>
              <h2 className={`text-2xl font-bold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                5. Route Calculations and Accuracy
              </h2>
              <p>
                While we strive to provide accurate route calculations, Meet Point does not guarantee 
                the accuracy, completeness, or reliability of any route suggestions. Users should 
                always verify routes and use their own judgment when traveling. We are not responsible 
                for any delays, traffic conditions, or other factors that may affect your journey.
              </p>
            </section>

            <section>
              <h2 className={`text-2xl font-bold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                6. Intellectual Property
              </h2>
              <p>
                The service, including its original content, features, and functionality, is owned 
                by Meet Point and is protected by international copyright, trademark, and other 
                intellectual property laws.
              </p>
            </section>

            <section>
              <h2 className={`text-2xl font-bold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                7. Limitation of Liability
              </h2>
              <p>
                Meet Point shall not be liable for any indirect, incidental, special, consequential, 
                or punitive damages resulting from your use or inability to use the service. This 
                includes but is not limited to accidents, delays, or any other issues arising from 
                route planning.
              </p>
            </section>

            <section>
              <h2 className={`text-2xl font-bold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                8. Third-Party Services
              </h2>
              <p>
                Our service integrates with third-party services including Google Maps and Google OAuth. 
                Your use of these services is subject to their respective terms and conditions.
              </p>
            </section>

            <section>
              <h2 className={`text-2xl font-bold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                9. Data and Privacy
              </h2>
              <p>
                Your use of Meet Point is also governed by our Privacy Policy. Please review our 
                Privacy Policy to understand how we collect, use, and protect your information.
              </p>
            </section>

            <section>
              <h2 className={`text-2xl font-bold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                10. Service Modifications
              </h2>
              <p>
                We reserve the right to modify, suspend, or discontinue the service at any time 
                without prior notice. We will not be liable to you or any third party for any 
                modification, suspension, or discontinuation of the service.
              </p>
            </section>

            <section>
              <h2 className={`text-2xl font-bold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                11. Termination
              </h2>
              <p>
                We may terminate or suspend your access to the service immediately, without prior 
                notice or liability, for any reason, including breach of these Terms.
              </p>
            </section>

            <section>
              <h2 className={`text-2xl font-bold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                12. Changes to Terms
              </h2>
              <p>
                We reserve the right to modify these terms at any time. We will notify users of 
                material changes by updating the "Last updated" date. Your continued use of the 
                service after changes constitutes acceptance of the new terms.
              </p>
            </section>

            <section>
              <h2 className={`text-2xl font-bold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                13. Governing Law
              </h2>
              <p>
                These Terms shall be governed by and construed in accordance with the laws of 
                the jurisdiction in which Meet Point operates, without regard to its conflict 
                of law provisions.
              </p>
            </section>

            <section>
              <h2 className={`text-2xl font-bold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                14. Contact Information
              </h2>
              <p>
                If you have any questions about these Terms, please contact us through the app's 
                support channels.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}