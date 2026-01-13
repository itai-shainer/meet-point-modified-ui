import Favorites from './pages/Favorites';
import Home from './pages/Home';
import MeetPoint from './pages/MeetPoint';
import RouteHistory from './pages/RouteHistory';


export const PAGES = {
    "Favorites": Favorites,
    "Home": Home,
    "MeetPoint": MeetPoint,
    "RouteHistory": RouteHistory,
}

export const pagesConfig = {
    mainPage: "MeetPoint",
    Pages: PAGES,
};