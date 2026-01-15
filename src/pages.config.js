import App from './pages/App';
import Favorites from './pages/Favorites';
import RouteHistory from './pages/RouteHistory';
import index from './pages/index';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';


export const PAGES = {
    "App": App,
    "Favorites": Favorites,
    "RouteHistory": RouteHistory,
    "index": index,
    "PrivacyPolicy": PrivacyPolicy,
    "TermsOfService": TermsOfService,
}

export const pagesConfig = {
    mainPage: "index",
    Pages: PAGES,
};