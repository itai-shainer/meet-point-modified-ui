import App from './pages/App';
import Favorites from './pages/Favorites';
import Home from './pages/Home';
import RouteHistory from './pages/RouteHistory';


export const PAGES = {
    "App": App,
    "Favorites": Favorites,
    "Home": Home,
    "RouteHistory": RouteHistory,
}

export const pagesConfig = {
    mainPage: "Favorites",
    Pages: PAGES,
};