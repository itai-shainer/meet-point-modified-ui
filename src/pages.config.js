import Favorites from './pages/Favorites';
import Home from './pages/Home';
import RouteHistory from './pages/RouteHistory';
import App from './pages/App';


export const PAGES = {
    "Favorites": Favorites,
    "Home": Home,
    "RouteHistory": RouteHistory,
    "App": App,
}

export const pagesConfig = {
    mainPage: "Favorites",
    Pages: PAGES,
};