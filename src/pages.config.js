import App from './pages/App';
import Favorites from './pages/Favorites';
import RouteHistory from './pages/RouteHistory';
import index from './pages/index';


export const PAGES = {
    "App": App,
    "Favorites": Favorites,
    "RouteHistory": RouteHistory,
    "index": index,
}

export const pagesConfig = {
    mainPage: "index",
    Pages: PAGES,
};