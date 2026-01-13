import Favorites from './pages/Favorites';
import Home from './pages/Home';
import MeetPoint from './pages/MeetPoint';
import RouteHistory from './pages/RouteHistory';
import App from './pages/App';


export const PAGES = {
    "Favorites": Favorites,
    "Home": Home,
    "MeetPoint": MeetPoint,
    "RouteHistory": RouteHistory,
    "App": App,
}

export const pagesConfig = {
    mainPage: "MeetPoint",
    Pages: PAGES,
};