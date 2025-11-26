import React, { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  MapPin, Loader2, Search, ArrowRight, Car, Bus, User, Repeat,
  ParkingSquare, NavigationIcon, PanelTopClose, Clock, ExternalLink, Sun, Moon, Award, Gauge, History, Star
} from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { debounce } from "lodash";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

import MapView from "../components/MapView";
import JourneyDetails from "../components/MeetPoint/JourneyDetails";
import { Card, CardContent } from "@/components/ui/card";

const isDarkModeByTime = () => {
  const hour = new Date().getHours();
  return hour < 6 || hour >= 18;
};

const isDarkModeBySystem = () => {
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
};

const getInitialDarkMode = () => {
  // Try to get from localStorage first
  const saved = localStorage.getItem('darkMode');
  if (saved !== null) {
    return saved === 'true';
  }
  // Fallback to system preference
  return isDarkModeBySystem() || isDarkModeByTime();
};

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

export default function MeetPoint() {
  const [view, setView] = useState('search');
  const [darkMode, setDarkMode] = useState(getInitialDarkMode);

  const [origin1, setOrigin1] = useState("");
  const [origin2, setOrigin2] = useState("");
  const [destination, setDestination] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [driverOriginLatLng, setDriverOriginLatLng] = useState(null);
  const [friendOriginLatLng, setFriendOriginLatLng] = useState(null);
  const [destinationLatLng, setDestinationLatLng] = useState(null);
  
  const [isDirectPickup, setIsDirectPickup] = useState(false);
  const [useTransit, setUseTransit] = useState(false); // New state for transit mode
  
  const [apiResult, setApiResult] = useState(null);

  const [searchTerm1, setSearchTerm1] = useState("");
  const [searchTerm2, setSearchTerm2] = useState("");
  const [searchTermDest, setSearchTermDest] = useState("");
  const [addressSuggestions1, setAddressSuggestions1] = useState([]);
  const [addressSuggestions2, setAddressSuggestions2] = useState([]);
  const [addressSuggestionsDest, setAddressSuggestionsDest] = useState([]);
  const [loadingAddresses1, setLoadingAddresses1] = useState(false);
  const [loadingAddresses2, setLoadingAddresses2] = useState(false);
  const [loadingAddressesDest, setLoadingAddressesDest] = useState(false);
  const [showSuggestions1, setShowSuggestions1] = useState(false);
  const [showSuggestions2, setShowSuggestions2] = useState(false);
  const [showSuggestionsDest, setShowSuggestionsDest] = useState(false);

  const [hoveredIndex, setHoveredIndex] = useState(-1);
  const [mapApiLoaded, setMapApiLoaded] = useState(false);
  const mapApiLoadedRef = useRef(false);
  const [currentRouteId, setCurrentRouteId] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [togglingFavorite, setTogglingFavorite] = useState(false);
  const [preference, setPreference] = useState("driver");
  const [alternatives, setAlternatives] = useState([]);
  const [currentPlanIndex, setCurrentPlanIndex] = useState(0); // 0 = best_plan, 1+ = alternatives

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('dir', 'rtl');
      if (darkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      // Save to localStorage whenever darkMode changes
      localStorage.setItem('darkMode', darkMode.toString());
    }
  }, [darkMode]);

  useEffect(() => {
    if (mapApiLoadedRef.current) return;

    const loadGoogleMapsAPI = () => {
      if (window.google && window.google.maps) {
        setMapApiLoaded(true);
        mapApiLoadedRef.current = true;
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyCrZ3JRWhLuwsP1sWCL3R48oXFMqKuatAw&libraries=places,geometry`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        setMapApiLoaded(true);
        mapApiLoadedRef.current = true;
      };
      script.onerror = () => {
        console.error("Failed to load Google Maps API");
        setError("שגיאה בטעינת Google Maps API. אנא רענן את העמוד.");
      };
      document.head.appendChild(script);
    };

    loadGoogleMapsAPI();
  }, []);

  const fetchAddressSuggestions = useCallback((input, setterFunction, setLoadingFunction) => {
    if (!input || input.length < 2) {
      setterFunction([]);
      setLoadingFunction(false);
      return;
    }

    if (!window.google || !window.google.maps || !window.google.maps.places) {
      console.warn("Google Maps API not loaded yet");
      return;
    }

    setLoadingFunction(true);
    
    const service = new window.google.maps.places.AutocompleteService();
    service.getPlacePredictions({
      input: input,
      componentRestrictions: { country: 'il' }
    }, (predictions, status) => {
      setLoadingFunction(false);
      if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
        setterFunction(predictions.map(p => ({
          description: p.description,
          place_id: p.place_id
        })));
      } else {
        setterFunction([]);
      }
    });
  }, []);

  const debouncedFetchAddresses1 = useMemo(
    () => debounce((value) => fetchAddressSuggestions(value, setAddressSuggestions1, setLoadingAddresses1), 300),
    [fetchAddressSuggestions]
  );

  const debouncedFetchAddresses2 = useMemo(
    () => debounce((value) => fetchAddressSuggestions(value, setAddressSuggestions2, setLoadingAddresses2), 300),
    [fetchAddressSuggestions]
  );

  const debouncedFetchAddressesDest = useMemo(
    () => debounce((value) => fetchAddressSuggestions(value, setAddressSuggestionsDest, setLoadingAddressesDest), 300),
    [fetchAddressSuggestions]
  );
  
  const geocodeAddress = useCallback((address) => {
    return new Promise((resolve, reject) => {
        if (!address || address.trim() === "") {
            return reject("כתובת ריקה הוזנה");
        }
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ address: address }, (results, status) => {
            if (status === 'OK' && results[0]) {
                resolve(results[0].geometry.location);
            } else {
                reject(`לא ניתן היה למצוא את הכתובת: "${address}".`);
            }
        });
    });
  }, []);

  useEffect(() => {
    if (!mapApiLoaded) return;
    debouncedFetchAddresses1(searchTerm1);
  }, [searchTerm1, mapApiLoaded, debouncedFetchAddresses1]);

  useEffect(() => {
    if (!mapApiLoaded) return;
    debouncedFetchAddresses2(searchTerm2);
  }, [searchTerm2, mapApiLoaded, debouncedFetchAddresses2]);

  useEffect(() => {
    if (!mapApiLoaded) return;
    debouncedFetchAddressesDest(searchTermDest);
  }, [searchTermDest, mapApiLoaded, debouncedFetchAddressesDest]);

  const saveToHistory = async (origin1LatLng, origin2LatLng, destLatLng, result) => {
    try {
      const savedRoute = await base44.entities.RouteHistory.create({
        driver_origin_address: origin1,
        driver_origin_lat: origin1LatLng.lat(),
        driver_origin_lng: origin1LatLng.lng(),
        passenger_origin_address: origin2,
        passenger_origin_lat: origin2LatLng.lat(),
        passenger_origin_lng: origin2LatLng.lng(),
        destination_address: destination,
        destination_lat: destLatLng.lat(),
        destination_lng: destLatLng.lng(),
        api_response: result,
        is_direct_pickup: isDirectPickup,
        is_favorite: false,
        preference: preference,
      });
      console.log("Route saved to history successfully");
      setCurrentRouteId(savedRoute.id);
      setIsFavorite(false);
      return savedRoute;
    } catch (error) {
      console.error("Failed to save route to history:", error);
      setCurrentRouteId(null);
      return null;
    }
  };

  const toggleFavorite = async () => {
    if (!currentRouteId) return;
    
    setTogglingFavorite(true);
    try {
      const newFavoriteStatus = !isFavorite;
      await base44.entities.RouteHistory.update(currentRouteId, {
        is_favorite: newFavoriteStatus
      });
      setIsFavorite(newFavoriteStatus);
    } catch (error) {
      console.error("Failed to toggle favorite:", error);
    } finally {
      setTogglingFavorite(false);
    }
  };

  const handleSearch = async () => {
    setError("");
    console.log("--- Starting Optimization Search ---");
    
    if (!origin1 || !origin2 || !destination) {
      const errorMsg = "אנא מלא את כל שלוש הכתובות.";
      console.error("Validation Error:", errorMsg);
      setError(errorMsg);
      return;
    }

    setLoading(true);
    setApiResult(null);
    setIsDirectPickup(false);
    setAlternatives([]);
    setCurrentPlanIndex(0);

    let origin1LatLng, origin2LatLng, destLatLng;
    // Geocode addresses to get lat/lng for the map view
    try {
        [origin1LatLng, origin2LatLng, destLatLng] = await Promise.all([
            geocodeAddress(origin1),
            geocodeAddress(origin2),
            geocodeAddress(destination)
        ]);
        console.log("Geocoding successful:", { origin1LatLng, origin2LatLng, destLatLng });
        setDriverOriginLatLng(origin1LatLng);
        setFriendOriginLatLng(origin2LatLng);
        setDestinationLatLng(destLatLng);
    } catch (err) {
        const errorMsg = err.message || "אחת הכתובות שהוזנה אינה חוקית.";
        console.error("Geocoding Error:", errorMsg);
        setError(errorMsg);
        setLoading(false);
        return;
    }

    const requestBody = {
      origin: origin1,
      destination: destination,
      passengers: [
        {
          label: "passenger_1",
          address: origin2,
          transit_mode: useTransit
        }
      ],
      preference: preference
    };

    console.log('Sending API request to: https://meet-point-api-production.up.railway.app/api/v1/optimize');
    console.log('Request Body:', JSON.stringify(requestBody, null, 2));

    try {
      const response = await fetch('https://meet-point-api-production.up.railway.app/api/v1/optimize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      console.log('API Response Status:', response.status);

      if (!response.ok) {
        let errorMsg = `שגיאת שרת: ${response.status}`;
        try {
            const errorData = await response.json();
            console.error('API Error Response Body:', errorData);
            errorMsg = errorData.detail || errorMsg;
        } catch (e) {
            console.error("Could not parse error response as JSON.");
        }
        throw new Error(errorMsg);
      }

      const result = await response.json();
      console.log('Received API Result:', JSON.stringify(result, null, 2));
      
      // Extract alternatives if they exist
      if (result.alternatives && Array.isArray(result.alternatives)) {
        console.log(`Found ${result.alternatives.length} alternative plan(s)`);
        setAlternatives(result.alternatives);
      }
      
      if (result.best_plan && result.best_plan.stops.length === 0) {
        console.log("API returned no stops. Handling as a direct pickup scenario.");
        setIsDirectPickup(true);

        // Create a synthetic stop at the passenger's location for UI rendering
        if (origin2LatLng) {
          const syntheticStop = {
            lat: origin2LatLng.lat(),
            lng: origin2LatLng.lng(),
            label: "passenger_pickup_location",
            for: ["passenger_1"]
          };
          result.best_plan.stops.push(syntheticStop);

          // Ensure the leg points to this synthetic stop
          if (result.best_plan.legs && result.best_plan.legs.length > 0) {
            result.best_plan.legs[0].to = syntheticStop.label;
          }
        }

        setApiResult(result);
        setView('results');
        
        // Save to history
        await saveToHistory(origin1LatLng, origin2LatLng, destLatLng, result);
      } else if (result.best_plan && result.best_plan.stops.length > 0) {
        console.log("API returned a valid plan. Setting view to 'results'.");
        setApiResult(result);
        setView('results');
        
        // Save to history
        await saveToHistory(origin1LatLng, origin2LatLng, destLatLng, result);
      } else {
        console.log("API returned no best plan. Setting view to 'noResults'.");
        setView('noResults');
      }

    } catch (err) {
      console.error("API Fetch Error:", err);
      setError(err.message || "אירעה שגיאה בתקשורת עם השרת.");
    } finally {
      console.log("--- Search Finished ---");
      setLoading(false);
    }
  };

  const handleReset = () => {
    setView('search');
    setOrigin1("");
    setOrigin2("");
    setDestination("");
    setSearchTerm1("");
    setSearchTerm2("");
    setSearchTermDest("");
    setError("");
    setDriverOriginLatLng(null);
    setFriendOriginLatLng(null);
    setDestinationLatLng(null);
    setApiResult(null);
    setIsDirectPickup(false);
    setCurrentRouteId(null);
    setIsFavorite(false);
    setPreference("driver");
    setUseTransit(false);
    setAlternatives([]);
    setCurrentPlanIndex(0);
    };

  // Get the current plan to display (best_plan or alternative)
  const getCurrentPlan = () => {
    if (!apiResult) return null;
    if (currentPlanIndex === 0) return apiResult.best_plan;
    if (alternatives.length >= currentPlanIndex) return alternatives[currentPlanIndex - 1];
    return apiResult.best_plan;
  };
  
  const ResultHeader = ({ plan }) => (
    <Card className={`mb-4 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50'}`}>
        <CardContent className="p-4 flex flex-wrap items-center justify-around gap-4 text-center">
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

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-blue-50 via-white to-indigo-50'}`}>
      <div className="max-w-7xl mx-auto p-4 md:p-8">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-xl ${darkMode ? 'bg-blue-900' : 'bg-blue-500'} shadow-lg`}>
              <MapPin className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className={`text-3xl md:text-4xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Meet Point
              </h1>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                מצא את נקודת המפגש האופטימלית בדרך ליעד
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              asChild
              variant="outline"
              size="icon"
              className={darkMode ? 'bg-gray-800 border-gray-700' : ''}
            >
              <Link to={createPageUrl('Favorites')}>
                <Star className="w-5 h-5" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="icon"
              className={darkMode ? 'bg-gray-800 border-gray-700' : ''}
            >
              <Link to={createPageUrl('RouteHistory')}>
                <History className="w-5 h-5" />
              </Link>
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setDarkMode(!darkMode)}
              className={darkMode ? 'bg-gray-800 border-gray-700' : ''}
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {view === 'search' && (
          <div className="space-y-6">
            <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'} rounded-2xl shadow-xl p-6 md:p-8 border-2`}>
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="relative">
                    <Label className={`block mb-2 font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                      <User className="w-4 h-4 inline mr-2" />
                      נהג - כתובת מוצא
                    </Label>
                    <div className="relative">
                      <Input
                        type="text"
                        value={searchTerm1}
                        onChange={(e) => {
                          setSearchTerm1(e.target.value);
                          setOrigin1(e.target.value);
                          setShowSuggestions1(true);
                        }}
                        onFocus={() => setShowSuggestions1(true)}
                        onBlur={() => setTimeout(() => setShowSuggestions1(false), 200)}
                        placeholder="הכנס כתובת מלאה"
                        className={`pr-10 ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder:text-gray-400' : ''}`}
                      />
                      {loadingAddresses1 && (
                        <Loader2 className="absolute left-3 top-3 w-4 h-4 animate-spin text-blue-500" />
                      )}
                    </div>
                    {showSuggestions1 && addressSuggestions1.length > 0 && (
                      <div className={`absolute z-50 w-full mt-1 ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'} border-2 rounded-lg shadow-2xl max-h-60 overflow-y-auto`}>
                        {addressSuggestions1.map((suggestion, index) => (
                          <div
                            key={index}
                            className={`p-3 cursor-pointer transition-colors ${darkMode ? 'hover:bg-gray-600 text-gray-200' : 'hover:bg-blue-50 text-gray-800'} border-b ${darkMode ? 'border-gray-600' : 'border-gray-100'} last:border-b-0 flex items-start gap-2`}
                            onClick={() => {
                              setOrigin1(suggestion.description);
                              setSearchTerm1(suggestion.description);
                              setAddressSuggestions1([]);
                              setShowSuggestions1(false);
                            }}
                          >
                            <MapPin className={`w-4 h-4 mt-1 flex-shrink-0 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                            <span className="text-sm">{suggestion.description}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="relative">
                    <Label className={`block mb-2 font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                      <User className="w-4 h-4 inline mr-2" />
                      נוסע - כתובת מוצא
                    </Label>
                    <div className="relative">
                      <Input
                        type="text"
                        value={searchTerm2}
                        onChange={(e) => {
                          setSearchTerm2(e.target.value);
                          setOrigin2(e.target.value);
                          setShowSuggestions2(true);
                        }}
                        onFocus={() => setShowSuggestions2(true)}
                        onBlur={() => setTimeout(() => setShowSuggestions2(false), 200)}
                        placeholder="הכנס כתובת מלאה"
                        className={`pr-10 ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder:text-gray-400' : ''}`}
                      />
                      {loadingAddresses2 && (
                        <Loader2 className="absolute left-3 top-3 w-4 h-4 animate-spin text-blue-500" />
                      )}
                    </div>
                    {showSuggestions2 && addressSuggestions2.length > 0 && (
                      <div className={`absolute z-50 w-full mt-1 ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'} border-2 rounded-lg shadow-2xl max-h-60 overflow-y-auto`}>
                        {addressSuggestions2.map((suggestion, index) => (
                          <div
                            key={index}
                            className={`p-3 cursor-pointer transition-colors ${darkMode ? 'hover:bg-gray-600 text-gray-200' : 'hover:bg-blue-50 text-gray-800'} border-b ${darkMode ? 'border-gray-600' : 'border-gray-100'} last:border-b-0 flex items-start gap-2`}
                            onClick={() => {
                              setOrigin2(suggestion.description);
                              setSearchTerm2(suggestion.description);
                              setAddressSuggestions2([]);
                              setShowSuggestions2(false);
                            }}
                          >
                            <MapPin className={`w-4 h-4 mt-1 flex-shrink-0 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                            <span className="text-sm">{suggestion.description}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    </div>

                    {/* Transit Mode Toggle */}
                    <div className={`flex items-center gap-3 p-3 rounded-lg border ${darkMode ? 'bg-gray-700/50 border-gray-600' : 'bg-blue-50 border-blue-100'}`}>
                    <div 
                      dir="ltr"
                      onClick={() => setUseTransit(!useTransit)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 cursor-pointer ${useTransit ? 'bg-blue-600' : 'bg-gray-300'}`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${useTransit ? 'translate-x-6' : 'translate-x-1'}`}
                      />
                    </div>
                    <div className="flex-1 cursor-pointer" onClick={() => setUseTransit(!useTransit)}>
                      <span className={`text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                        הנוסע מתנייד בתחבורה ציבורית
                      </span>
                      <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        חישוב מסלול הכולל הגעה עצמאית של הנוסע לנקודת המפגש
                      </p>
                    </div>
                    <Bus className={`w-5 h-5 ${useTransit ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400'}`} />
                    </div>

                    <div className="relative">
                    <Label className={`block mb-2 font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                      <NavigationIcon className="w-4 h-4 inline mr-2" />
                      יעד משותף
                    </Label>
                    <div className="relative">
                      <Input
                        type="text"
                        value={searchTermDest}
                        onChange={(e) => {
                          setSearchTermDest(e.target.value);
                          setDestination(e.target.value);
                          setShowSuggestionsDest(true);
                        }}
                        onFocus={() => setShowSuggestionsDest(true)}
                        onBlur={() => setTimeout(() => setShowSuggestionsDest(false), 200)}
                        placeholder="הכנס כתובת היעד"
                        className={`pr-10 ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder:text-gray-400' : ''}`}
                      />
                      {loadingAddressesDest && (
                        <Loader2 className="absolute left-3 top-3 w-4 h-4 animate-spin text-blue-500" />
                      )}
                    </div>
                    {showSuggestionsDest && addressSuggestionsDest.length > 0 && (
                      <div className={`absolute z-50 w-full mt-1 ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'} border-2 rounded-lg shadow-2xl max-h-60 overflow-y-auto`}>
                        {addressSuggestionsDest.map((suggestion, index) => (
                          <div
                            key={index}
                            className={`p-3 cursor-pointer transition-colors ${darkMode ? 'hover:bg-gray-600 text-gray-200' : 'hover:bg-blue-50 text-gray-800'} border-b ${darkMode ? 'border-gray-600' : 'border-gray-100'} last:border-b-0 flex items-start gap-2`}
                            onClick={() => {
                              setDestination(suggestion.description);
                              setSearchTermDest(suggestion.description);
                              setAddressSuggestionsDest([]);
                              setShowSuggestionsDest(false);
                            }}
                          >
                            <MapPin className={`w-4 h-4 mt-1 flex-shrink-0 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                            <span className="text-sm">{suggestion.description}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Redesigned Preference Selector */}
                <div className="space-y-2">
                  <Label className={`text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    העדפת חישוב
                  </Label>
                  <div className={`inline-flex rounded-lg p-1 w-full ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    <button
                      type="button"
                      onClick={() => setPreference('driver')}
                      className={`flex-1 px-3 py-2 text-xs font-medium rounded-md transition-all ${
                        preference === 'driver'
                          ? darkMode
                            ? 'bg-blue-600 text-white shadow-md'
                            : 'bg-white text-blue-600 shadow-sm'
                          : darkMode
                          ? 'text-gray-300 hover:text-white'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      עדיפות לנהג
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreference('balanced')}
                      className={`flex-1 px-3 py-2 text-xs font-medium rounded-md transition-all ${
                        preference === 'balanced'
                          ? darkMode
                            ? 'bg-blue-600 text-white shadow-md'
                            : 'bg-white text-blue-600 shadow-sm'
                          : darkMode
                          ? 'text-gray-300 hover:text-white'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      מאוזן
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreference('passenger')}
                      className={`flex-1 px-3 py-2 text-xs font-medium rounded-md transition-all ${
                        preference === 'passenger'
                          ? darkMode
                            ? 'bg-blue-600 text-white shadow-md'
                            : 'bg-white text-blue-600 shadow-sm'
                          : darkMode
                          ? 'text-gray-300 hover:text-white'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      עדיפות לנוסע
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="bg-red-50 dark:bg-red-900 border-2 border-red-300 dark:border-700 text-red-800 dark:text-red-200 p-4 rounded-lg text-center">
                    {error}
                  </div>
                )}

                <Button
                  onClick={handleSearch}
                  disabled={loading || !mapApiLoaded}
                  className={`w-full ${darkMode ? 'bg-blue-700 hover:bg-blue-800' : 'bg-blue-600 hover:bg-blue-700'} text-white py-6 text-lg font-semibold rounded-xl shadow-lg`}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 ml-2 animate-spin" />
                      מעבד בקשה...
                    </>
                  ) : (
                    <>
                      <Search className="w-5 h-5 ml-2" />
                      מצא מסלול אופטימלי
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}

        {view === 'results' && apiResult && (
          <div className="space-y-6">
            <div className={`flex justify-between items-center flex-wrap gap-3 p-4 rounded-xl ${darkMode ? 'bg-gray-800/50' : 'bg-white/80 shadow-sm'}`}>
              <div>
                <h2 className={`text-2xl font-extrabold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {currentPlanIndex === 0 ? 'תוכנית הנסיעה המומלצת' : `תוכנית חלופית ${currentPlanIndex}`}
                </h2>
                <p className={`text-sm mt-1 font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-700'}`}>
                  העדפה: {preference === 'driver' ? 'טוב יותר לנהג' : preference === 'balanced' ? 'מאוזן' : 'טוב יותר לנוסע'}
                </p>
              </div>
              <div className="flex gap-2">
                {alternatives.length > 0 && (
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPlanIndex(currentPlanIndex === 0 ? 1 : 0)}
                    className={`font-semibold ${darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                  >
                    <Repeat className="w-4 h-4 ml-2" />
                    {currentPlanIndex === 0 ? 'הצג תוכנית חלופית' : 'חזור לתוכנית המומלצת'}
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={toggleFavorite}
                  disabled={togglingFavorite || !currentRouteId}
                  className={`font-semibold ${darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'} ${isFavorite ? 'bg-yellow-50 border-yellow-400 dark:bg-yellow-900/50' : ''}`}
                >
                  {togglingFavorite ? (
                    <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                  ) : (
                    <Star className={`w-4 h-4 ml-2 ${isFavorite ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                  )}
                  {isFavorite ? 'הסר מהמועדפים' : 'הוסף למועדפים'}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleReset} 
                  className={`font-semibold ${darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                >
                  <ArrowRight className="w-4 h-4 ml-2" />
                  חיפוש חדש
                </Button>
              </div>
            </div>
            
            <ResultHeader 
              plan={getCurrentPlan()} 
            />

            <div className="grid lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                 <JourneyDetails 
                    plan={getCurrentPlan()}
                    originAddress={origin1}
                    passengerAddress={origin2}
                    destinationAddress={destination}
                    darkMode={darkMode}
                    isDirectPickup={getCurrentPlan()?.stops?.length === 0}
                 />
              </div>

              <div className="lg:sticky lg:top-4 h-fit">
                <MapView
                  mapApiLoaded={mapApiLoaded}
                  driverOrigin={driverOriginLatLng}
                  friendOrigin={friendOriginLatLng}
                  commonDestination={destinationLatLng}
                  meetingPoints={getCurrentPlan()?.stops || []}
                  highlightedIndex={hoveredIndex}
                  transitRoutePolyline={getCurrentPlan()?.passenger_arrivals?.find(p => p.mode === 'transit')?.transit_route_polyline}
                />
              </div>
            </div>
          </div>
        )}

        {view === 'noResults' && (
             <div className="text-center space-y-6">
            <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'} rounded-2xl shadow-xl p-8 md:p-12 border-2`}>
              <div className="flex justify-center mb-6">
                <div className={`p-6 rounded-full ${darkMode ? 'bg-yellow-900' : 'bg-yellow-100'}`}>
                  <Search className={`w-16 h-16 ${darkMode ? 'text-yellow-400' : 'text-yellow-600'}`} />
                </div>
              </div>
              <h2 className={`text-2xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                לא נמצאו נקודות מפגש מתאימות
              </h2>
              <p className={`text-lg mb-6 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                המערכת לא מצאה תוכנית נסיעה אופטימלית עבור הנתונים שהוזנו.
              </p>
              <div className="flex gap-4 justify-center">
                <Button onClick={handleReset} variant="outline" className={darkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}>
                  <ArrowRight className="w-4 h-4 ml-2" />
                  נסה שוב
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}