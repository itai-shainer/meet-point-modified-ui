import App from './pages/App';
import Favorites from './pages/Favorites';
import RouteHistory from './pages/RouteHistory';
import index from './pages/index';
import privacy from './pages/privacy';
import terms from './pages/terms';


export const PAGES = {
    "App": App,
    "Favorites": Favorites,
    "RouteHistory": RouteHistory,
    "index": index,
    "privacy": privacy,
    "terms": terms,
}

export const pagesConfig = {
    mainPage: "index",
    Pages: PAGES,
};