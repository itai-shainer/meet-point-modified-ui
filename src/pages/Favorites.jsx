import React, { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  MapPin, ArrowRight, Clock, Award, Calendar, 
  Loader2, Sun, Moon, ChevronLeft, User, Navigation, Star, History, Home
} from "lucide-react";
import { Link } from "react-router-dom";
const createPageUrl = (pageName) => `/${pageName}`;
import { format } from "date-fns";
import MapView from "../components/MapView";
import JourneyDetails from "../components/MeetPoint/JourneyDetails";
import PullToRefresh from "../components/PullToRefresh";
import { useTheme } from "@/lib/ThemeProvider";

const formatDuration = (minutes) => {
  if (minutes < 60) {
    return `${minutes} דקות`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (remainingMinutes === 0) {
    return hours === 1 ? 'שעה' : `${hours} שעות`;
  }
  return hours === 1 
    ? `שעה ו-${remainingMinutes} דקות`
    : `${hours} שעות ו-${remainingMinutes} דקות`;
};

export default function Favorites() {
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const { darkMode, setDarkMode, autoMode } = useTheme();
  const [selectedFavorite, setSelectedFavorite] = useState(null);
  const [mapApiLoaded, setMapApiLoaded] = useState(false);
  const [togglingFavorite, setTogglingFavorite] = useState(null);
  const queryClient = useQueryClient();

  // Auth Guard
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const isAuthenticated = await base44.auth.isAuthenticated();
        if (!isAuthenticated) {
          base44.auth.redirectToLogin(window.location.pathname);
          return;
        }
        setIsAuthChecking(false);
      } catch (error) {
        base44.auth.redirectToLogin(window.location.pathname);
      }
    };
    checkAuth();
  }, []);

  useEffect(() => {
    if (window.google && window.google.maps) {
      setMapApiLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyCrZ3JRWhLuwsP1sWCL3R48oXFMqKuatAw&libraries=places,geometry`;
    script.async = true;
    script.defer = true;
    script.onload = () => setMapApiLoaded(true);
    script.onerror = () => console.error("Failed to load Google Maps API");
    document.head.appendChild(script);
  }, []);

  const { data: allFavorites = [], isLoading } = useQuery({
    queryKey: ['favorites'],
    queryFn: async () => {
      const allRoutes = await base44.entities.RouteHistory.list('-created_date');
      return allRoutes.filter(route => route.is_favorite === true);
    },
  });

  const toggleFavorite = async (e, item) => {
    e.stopPropagation();
    setTogglingFavorite(item.id);
    try {
      await base44.entities.RouteHistory.update(item.id, {
        is_favorite: false
      });
      await queryClient.invalidateQueries({ queryKey: ['favorites'] });
      // If we're viewing this favorite, go back to list
      if (selectedFavorite?.id === item.id) {
        setSelectedFavorite(null);
      }
    } catch (error) {
      console.error("Failed to toggle favorite:", error);
    } finally {
      setTogglingFavorite(null);
    }
  };

  const driverOriginLatLng = useMemo(() => {
    if (!selectedFavorite || !window.google) return null;
    return new window.google.maps.LatLng(
      selectedFavorite.driver_origin_lat,
      selectedFavorite.driver_origin_lng
    );
  }, [selectedFavorite]);

  const passengerOriginLatLng = useMemo(() => {
    if (!selectedFavorite || !window.google) return null;
    return new window.google.maps.LatLng(
      selectedFavorite.passenger_origin_lat,
      selectedFavorite.passenger_origin_lng
    );
  }, [selectedFavorite]);

  const destinationLatLng = useMemo(() => {
    if (!selectedFavorite || !window.google) return null;
    return new window.google.maps.LatLng(
      selectedFavorite.destination_lat,
      selectedFavorite.destination_lng
    );
  }, [selectedFavorite]);

  const FavoriteCard = ({ item }) => {
    const plan = item.api_response?.best_plan;
    if (!plan) return null;

    return (
      <Card 
        className={`cursor-pointer transition-all hover:shadow-2xl hover:-translate-y-1 relative backdrop-blur-sm border ${
          darkMode ? 'bg-gray-800/90 border-gray-700/50 hover:border-yellow-500/50' : 'bg-white/90 border-gray-200/50 hover:border-yellow-400/50'
        }`}
        onClick={() => setSelectedFavorite(item)}
      >
        <CardContent className="p-4 md:p-6">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <Calendar className="w-4 h-4" />
              <span>{format(new Date(item.created_date), 'dd/MM/yyyy HH:mm')}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => toggleFavorite(e, item)}
                disabled={togglingFavorite === item.id}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
              >
                {togglingFavorite === item.id ? (
                  <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                ) : (
                  <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                )}
              </button>
              <ChevronLeft className="w-5 h-5 text-gray-400" />
            </div>
          </div>

          <div className="space-y-2 mb-4">
            <div className="flex items-start gap-2 text-sm">
              <User className="w-4 h-4 mt-0.5 text-blue-500 flex-shrink-0" />
              <span className={`line-clamp-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {item.driver_origin_address}
              </span>
            </div>
            <div className="flex items-start gap-2 text-sm">
              <User className="w-4 h-4 mt-0.5 text-green-500 flex-shrink-0" />
              <span className={`line-clamp-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {item.passenger_origin_address}
              </span>
            </div>
            <div className="flex items-start gap-2 text-sm">
              <Navigation className="w-4 h-4 mt-0.5 text-red-500 flex-shrink-0" />
              <span className={`line-clamp-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {item.destination_address}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 text-sm">
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-blue-500" />
              <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                {formatDuration(plan.driver_total_eta_min)}
              </span>
            </div>
            {plan.direct_route_eta_min && (
              <div className="flex items-center gap-1.5">
                <ArrowRight className="w-4 h-4 text-gray-500" />
                <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                  {formatDuration(plan.direct_route_eta_min)} ישיר
                </span>
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <Award className="w-4 h-4 text-purple-500" />
              <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                {plan.type.replace('_', ' ')}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const ResultHeader = ({ plan }) => (
    <Card className={`mb-4 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50'}`}>
        <CardContent className="p-3 md:p-4 grid grid-cols-2 md:flex md:flex-wrap items-center justify-around gap-4 text-center">
            <div className="flex flex-col items-center">
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                    <Clock className="w-5 h-5"/>
                    <span className="font-semibold">זמן נסיעה עם עצירות</span>
                </div>
                <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {formatDuration(plan.driver_total_eta_min)}
                </span>
            </div>

            {plan.direct_route_eta_min && (
                <div className="flex flex-col items-center">
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                        <ArrowRight className="w-5 h-5"/>
                        <span className="font-semibold">זמן נסיעה ישיר</span>
                    </div>
                    <span className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                      {formatDuration(plan.direct_route_eta_min)}
                    </span>
                </div>
            )}

            <div className="flex flex-col items-center">
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                    <Award className="w-5 h-5"/>
                    <span className="font-semibold">סוג תוכנית</span>
                </div>
                <span className="text-lg font-bold text-gray-800 dark:text-gray-200">
                          {plan.type === 'shared_meeting' ? 'מפגש משותף' : 
                           plan.type === 'direct_pickup' ? 'איסוף ישיר' :
                           plan.type === 'direct_pickups' ? 'איסוף ישיר' : 
                           plan.type === 'transit_only' ? 'תחבורה ציבורית' : 
                           plan.type.replace('_', ' ')}
                        </span>
            </div>
        </CardContent>
    </Card>
  );

  if (isAuthChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-gray-600">בודק הרשאות...</p>
        </div>
      </div>
    );
  }

  if (selectedFavorite) {
    const plan = selectedFavorite.api_response?.best_plan;
    
    return (
      <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-blue-50 via-white to-indigo-50'}`}>
        <div className="max-w-7xl mx-auto p-4 md:p-8">
          <div className={`flex justify-between items-center mb-8 p-4 rounded-xl ${darkMode ? 'bg-gray-800/50' : 'bg-white/80 shadow-sm'}`}>
            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                onClick={() => setSelectedFavorite(null)}
                className={darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300'}
              >
                <ArrowRight className="w-4 h-4 ml-2" />
                חזרה למועדפים
              </Button>
            </div>
            {!autoMode && (
              <Button
                variant="outline"
                size="icon"
                onClick={() => setDarkMode(!darkMode)}
                className={darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'}
              >
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </Button>
            )}
          </div>

          <div className={`mb-4 p-3 rounded-lg ${darkMode ? 'bg-gray-800/30' : 'bg-white/60'}`}>
            <div className={`flex items-center gap-2 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-700'}`}>
              <Calendar className="w-4 h-4" />
              <span className="font-medium">{format(new Date(selectedFavorite.created_date), 'dd MMMM yyyy, HH:mm')}</span>
            </div>
          </div>

          <ResultHeader plan={plan} />

          <div className="grid lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <JourneyDetails 
                plan={plan}
                originAddress={selectedFavorite.driver_origin_address}
                passengerAddress={selectedFavorite.passenger_origin_address}
                destinationAddress={selectedFavorite.destination_address}
                darkMode={darkMode}
                isDirectPickup={selectedFavorite.is_direct_pickup}
              />
            </div>

            <div className="lg:sticky lg:top-4 h-fit">
              <MapView
                mapApiLoaded={mapApiLoaded}
                driverOrigin={driverOriginLatLng}
                friendOrigin={passengerOriginLatLng}
                commonDestination={destinationLatLng}
                meetingPoints={plan?.stops || []}
                highlightedIndex={-1}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 relative ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Subtle mesh gradient background */}
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none" 
           style={{
             backgroundImage: darkMode 
               ? 'radial-gradient(at 27% 37%, hsla(215, 98%, 61%, 0.5) 0px, transparent 50%), radial-gradient(at 97% 21%, hsla(125, 98%, 72%, 0.5) 0px, transparent 50%), radial-gradient(at 52% 99%, hsla(354, 98%, 61%, 0.5) 0px, transparent 50%), radial-gradient(at 10% 29%, hsla(256, 96%, 67%, 0.5) 0px, transparent 50%), radial-gradient(at 97% 96%, hsla(38, 60%, 74%, 0.5) 0px, transparent 50%), radial-gradient(at 33% 50%, hsla(222, 67%, 73%, 0.5) 0px, transparent 50%), radial-gradient(at 79% 53%, hsla(343, 68%, 79%, 0.5) 0px, transparent 50%)'
               : 'radial-gradient(at 27% 37%, hsla(215, 98%, 61%, 0.2) 0px, transparent 50%), radial-gradient(at 97% 21%, hsla(125, 98%, 72%, 0.2) 0px, transparent 50%), radial-gradient(at 52% 99%, hsla(354, 98%, 61%, 0.2) 0px, transparent 50%), radial-gradient(at 10% 29%, hsla(256, 96%, 67%, 0.2) 0px, transparent 50%), radial-gradient(at 97% 96%, hsla(38, 60%, 74%, 0.2) 0px, transparent 50%), radial-gradient(at 33% 50%, hsla(222, 67%, 73%, 0.2) 0px, transparent 50%), radial-gradient(at 79% 53%, hsla(343, 68%, 79%, 0.2) 0px, transparent 50%)'
           }}
      />
      <div className="max-w-7xl mx-auto p-4 md:p-8 relative z-10">
        {/* Glass navbar */}
        <div className={`flex flex-wrap justify-between items-center gap-4 mb-8 p-4 rounded-2xl backdrop-blur-md border shadow-xl ${darkMode ? 'bg-gray-900/90 border-white/10' : 'bg-white/90 border-white/20'}`}>
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="p-3 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-600 shadow-lg flex-shrink-0">
              <Star className="w-8 h-8 text-white fill-white" />
            </div>
            <div className="text-right min-w-0">
              <h1 className={`text-2xl md:text-4xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                המסלולים המועדפים שלי
              </h1>
              <p className={`text-xs md:text-sm ${darkMode ? 'text-gray-400' : 'text-gray-700'}`}>
                כל המסלולים שסימנת בכוכב
              </p>
            </div>
          </div>

          <div className="flex gap-2 justify-end flex-shrink-0">
            <Button
              asChild
              variant="outline"
              size="icon"
              className={`hidden md:inline-flex backdrop-blur-sm transition-all ${darkMode ? 'bg-gray-800/50 border-gray-700/50 hover:bg-gray-700/50' : 'bg-white/50 border-gray-200/50 hover:bg-white/70'}`}
            >
              <Link to="/" onClick={() => sessionStorage.setItem('viewLanding', '1')}>
                <Home className="w-5 h-5" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="icon"
              className={`hidden md:inline-flex backdrop-blur-sm transition-all ${darkMode ? 'bg-gray-800/50 border-gray-700/50 hover:bg-gray-700/50' : 'bg-white/50 border-gray-200/50 hover:bg-white/70'}`}
            >
              <Link to={createPageUrl('RouteHistory')}>
                <History className="w-5 h-5" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className={`hidden md:inline-flex backdrop-blur-sm transition-all ${darkMode ? 'bg-gray-800/50 border-gray-700/50 hover:bg-gray-700/50 text-white' : 'bg-white/50 border-gray-200/50 hover:bg-white/70 text-gray-900'}`}
            >
              <Link to={createPageUrl('App')}>
                <ArrowRight className="w-4 h-4 ml-2" />
                חיפוש חדש
              </Link>
            </Button>
            {!autoMode && (
              <Button
                variant="outline"
                size="icon"
                onClick={() => setDarkMode(!darkMode)}
                className={`backdrop-blur-sm transition-all ${darkMode ? 'bg-gray-800/50 border-gray-700/50 hover:bg-gray-700/50' : 'bg-white/50 border-gray-200/50 hover:bg-white/70'}`}
              >
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </Button>
            )}
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-yellow-600 dark:text-yellow-400" />
              <p className={`text-lg ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>טוען מועדפים...</p>
            </div>
          </div>
        ) : allFavorites.length === 0 ? (
          <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'} rounded-2xl shadow-xl p-12 border-2 text-center`}>
            <div className={`inline-flex p-6 rounded-full mb-4 ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <Star className={`w-12 h-12 ${darkMode ? 'text-gray-400' : 'text-gray-400'}`} />
            </div>
            <h2 className={`text-2xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              אין עדיין מסלולים מועדפים
            </h2>
            <p className={`text-lg mb-6 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              סמן מסלולים בכוכב כדי לשמור אותם כמועדפים
            </p>
            <Button asChild className="bg-yellow-600 hover:bg-yellow-700">
              <Link to={createPageUrl('App')}>
                <MapPin className="w-4 h-4 ml-2" />
                חפש מסלול
              </Link>
            </Button>
          </div>
        ) : (
          <PullToRefresh
            darkMode={darkMode}
            onRefresh={() => queryClient.invalidateQueries({ queryKey: ['favorites'] })}
          >
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {allFavorites.map((item) => (
                <FavoriteCard key={item.id} item={item} />
              ))}
            </div>
          </PullToRefresh>
        )}
      </div>
    </div>
  );
}