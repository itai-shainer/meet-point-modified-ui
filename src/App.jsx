import './App.css'
import { AnimatePresence, motion } from "framer-motion"
import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { pagesConfig } from './pages.config'
import { BrowserRouter as Router, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import { ThemeProvider } from '@/lib/ThemeProvider';
import MobileBottomNav from '@/components/MobileBottomNav';

const PageTransition = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, x: 24 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -24 }}
    transition={{ duration: 0.22, ease: "easeInOut" }}
    style={{ willChange: "opacity, transform" }}
  >
    {children}
  </motion.div>
);

const { Pages, Layout, mainPage, publicPages = [] } = pagesConfig;
const mainPageKey = mainPage ?? Object.keys(Pages)[0];
const MainPage = mainPageKey ? Pages[mainPageKey] : () => null;

const LayoutWrapper = ({ children, currentPageName }) => Layout ?
  <Layout currentPageName={currentPageName}>{children}</Layout>
  : <>{children}</>;

const FullPageSpinner = () => (
  <div className="fixed inset-0 flex items-center justify-center">
    <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
  </div>
);

/**
 * Gate for pages that need a signed-in user. Sends visitors to /Login and
 * remembers where they were headed.
 */
const RequireAuth = ({ children }) => {
  const { isAuthenticated, isLoadingAuth } = useAuth();
  const location = useLocation();

  if (isLoadingAuth) return <FullPageSpinner />;
  if (!isAuthenticated) {
    const returnTo = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/Login?returnTo=${returnTo}`} replace />;
  }
  return children;
};

const AppRoutes = () => {
  const location = useLocation();
  const isPublic = (pageKey) => publicPages.includes(pageKey);

  const wrap = (pageKey, element) =>
    isPublic(pageKey) ? element : <RequireAuth>{element}</RequireAuth>;

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route
          path="/"
          element={wrap(
            mainPageKey,
            <LayoutWrapper currentPageName={mainPageKey}>
              <PageTransition><MainPage /></PageTransition>
            </LayoutWrapper>
          )}
        />
        {Object.entries(Pages).map(([path, Page]) => (
          <Route
            key={path}
            path={`/${path}`}
            element={wrap(
              path,
              <LayoutWrapper currentPageName={path}>
                <PageTransition><Page /></PageTransition>
              </LayoutWrapper>
            )}
          />
        ))}
        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </AnimatePresence>
  );
};

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <ThemeProvider>
          <Router>
            <AppRoutes />
            <MobileBottomNav />
          </Router>
          <Toaster />
        </ThemeProvider>
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App
