import MeetPoint from './pages/MeetPoint';
import RouteHistory from './pages/RouteHistory';
import Favorites from './pages/Favorites';
import utils from './pages/utils';


export const PAGES = {
    "MeetPoint": MeetPoint,
    "RouteHistory": RouteHistory,
    "Favorites": Favorites,
    "utils": utils,
}

export const pagesConfig = {
    mainPage: "MeetPoint",
    Pages: PAGES,
};