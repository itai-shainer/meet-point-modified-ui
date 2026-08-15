/**
 * pages.config.js — page routing configuration.
 *
 * Every file in ./pages/ that should be reachable gets an entry in PAGES.
 * The key becomes the URL segment (e.g. "Favorites" -> /Favorites).
 *
 *   mainPage    — which page renders at "/"
 *   publicPages — keys reachable without a session. Everything else is
 *                 wrapped in RequireAuth (see src/App.jsx).
 */
import App from './pages/App';
import Favorites from './pages/Favorites';
import Login from './pages/Login';
import RouteHistory from './pages/RouteHistory';
import index from './pages/index';
import privacy from './pages/privacy';
import terms from './pages/terms';
import Settings from './pages/Settings';


export const PAGES = {
    "App": App,
    "Favorites": Favorites,
    "Login": Login,
    "RouteHistory": RouteHistory,
    "index": index,
    "privacy": privacy,
    "terms": terms,
    "Settings": Settings,
}

export const pagesConfig = {
    mainPage: "index",
    Pages: PAGES,
    publicPages: ["index", "Login", "privacy", "terms"],
};
