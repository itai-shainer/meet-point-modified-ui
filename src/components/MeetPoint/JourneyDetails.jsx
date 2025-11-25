import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, User, Clock, Car, Bus, Footprints, Info, Fuel, UtensilsCrossed, MapPinned, Flag, ParkingSquare, ShoppingBag, Train, ArrowRight } from 'lucide-react';
import TransitInfoDialog from './TransitInfoDialog';

// Helper to get icon and label for place type
const getPlaceTypeInfo = (placeType) => {
    switch (placeType) {
        case 'gas_station':
            return { 
                icon: <Fuel className="w-3.5 h-3.5" />, 
                label: 'תחנת דלק',
                color: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300'
            };
        case 'restaurant':
            return { 
                icon: <UtensilsCrossed className="w-3.5 h-3.5" />, 
                label: 'מסעדה',
                color: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
            };
        case 'transit_station':
            return { 
                icon: <Bus className="w-3.5 h-3.5" />, 
                label: 'תחנה מרכזית',
                color: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
            };
        case 'parking':
            return { 
                icon: <ParkingSquare className="w-3.5 h-3.5" />, 
                label: 'חניה',
                color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300'
            };
        case 'shopping_mall':
            return { 
                icon: <ShoppingBag className="w-3.5 h-3.5" />, 
                label: 'קניון',
                color: 'bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-300'
            };
        case 'generated_point':
            return { 
                icon: <MapPinned className="w-3.5 h-3.5" />, 
                label: 'נקודה מחושבת',
                color: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
            };
        default:
            return { 
                icon: <MapPin className="w-3.5 h-3.5" />, 
                label: 'נקודת מפגש',
                color: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300'
            };
    }
};



// Main component
export default function JourneyDetails({ plan, originAddress, passengerAddress, destinationAddress, darkMode, isDirectPickup }) {
    if (!plan) return null;

    // Find passenger arrival info (assuming single passenger for now)
    const passengerArrival = plan.passenger_arrivals?.[0];
    const isTransitMode = passengerArrival?.mode === 'transit';
    const isTransitOnlyPlan = plan.type === 'transit_only';

    // Helper to create universal Waze links
    const getUniversalWazeLink = (stop) => {
        if (!stop || !stop.lat || !stop.lng) return null;
        return `https://waze.com/ul?ll=${stop.lat},${stop.lng}&navigate=yes&zoom=17`;
    };

    return (
        <Card className={`shadow-lg ${darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}>
            <CardHeader className="pb-4">
                <CardTitle className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>פירוט מסלול</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                
                {/* Special Alerts */}
                {isDirectPickup && (
                    <div className={`px-4 py-3 rounded-lg flex items-center gap-3 ${darkMode ? 'bg-blue-500/10 border-blue-500/20' : 'bg-blue-50 border-blue-100'} border`}>
                        <Info className={`w-4 h-4 flex-shrink-0 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                        <p className={`text-sm ${darkMode ? 'text-blue-300' : 'text-blue-700'}`}>
                            איסוף ישיר - הנהג יאסוף את הנוסע מכתובתו
                        </p>
                    </div>
                )}
                {isTransitOnlyPlan && (
                    <div className={`px-4 py-3 rounded-lg flex items-center gap-3 ${darkMode ? 'bg-purple-500/10 border-purple-500/20' : 'bg-purple-50 border-purple-100'} border`}>
                        <Train className={`w-4 h-4 flex-shrink-0 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`} />
                        <p className={`text-sm ${darkMode ? 'text-purple-300' : 'text-purple-700'}`}>
                            נסיעה נפרדת - הנוסע יגיע ליעד בתחבורה ציבורית
                        </p>
                    </div>
                )}
                
                {/* Section for Addresses */}
                <div className="space-y-3">
                    <div className="flex items-center gap-3 py-2">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-500/10">
                            <Car className="w-4 h-4 text-blue-600 dark:text-blue-400"/>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className={`text-xs font-medium mb-0.5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>נהג</p>
                            <p className={`text-sm truncate ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>{originAddress}</p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-3 py-2">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-500/10">
                            <User className="w-4 h-4 text-green-600 dark:text-green-400"/>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className={`text-xs font-medium mb-0.5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>נוסע</p>
                            <p className={`text-sm truncate ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>{passengerAddress}</p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-3 py-2">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-red-500/10">
                            <Flag className="w-4 h-4 text-red-600 dark:text-red-400"/>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className={`text-xs font-medium mb-0.5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>יעד</p>
                            <p className={`text-sm truncate ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>{destinationAddress}</p>
                        </div>
                    </div>
                </div>

                <div className={`h-px ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}></div>

                {/* Passenger Transit Info */}
                {isTransitMode && passengerArrival && (
                    <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-700/30' : 'bg-gray-50'} border ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <Bus className={`w-4 h-4 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                                <h4 className={`font-medium text-sm ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>מסלול הנוסע (תחב״צ)</h4>
                            </div>
                            <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 hover:bg-blue-200">
                                סה״כ {Math.round(passengerArrival.eta_min)} דק׳
                            </Badge>
                        </div>
                        
                        <div className="mt-3">
                            {/* Summary Chips */}
                            {passengerArrival.transit_steps && passengerArrival.transit_steps.length > 0 && (
                                <div className="flex flex-wrap items-center gap-2 mb-3">
                                    {passengerArrival.transit_steps.map((step, idx) => (
                                        <React.Fragment key={idx}>
                                            <div className={`flex items-center text-xs px-2 py-1 rounded border ${darkMode ? 'bg-gray-800 border-gray-700 text-gray-300' : 'bg-white border-gray-200 text-gray-600'}`}>
                                                {step.travel_mode === 'WALKING' ? <Footprints className="w-3 h-3 ml-1"/> : <Bus className="w-3 h-3 ml-1"/>}
                                                <span className="font-medium">
                                                    {step.travel_mode === 'WALKING' 
                                                        ? 'הליכה' 
                                                        : (step.transit_details?.line?.short_name || step.transit_details?.line?.name || 'קו')}
                                                </span>
                                            </div>
                                            {idx < passengerArrival.transit_steps.length - 1 && (
                                                <div className={`w-1 h-1 rounded-full ${darkMode ? 'bg-gray-600' : 'bg-gray-300'}`} />
                                            )}
                                        </React.Fragment>
                                    ))}
                                </div>
                            )}

                            <TransitInfoDialog passengerArrival={passengerArrival} darkMode={darkMode} />
                        </div>
                    </div>
                )}

                {/* Section for Route Timeline (Driver) */}
                <div>
                    <h3 className={`text-sm font-medium mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {isTransitOnlyPlan ? 'מסלול הנהג (ישיר)' : 'ציר זמן משותף'}
                    </h3>
                    <div className="space-y-1">
                        {/* Start Point */}
                        <div className="flex items-center gap-3 py-2">
                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-500/10">
                                <div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div>
                            </div>
                            <div className="flex-1">
                                <p className={`text-sm ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>{originAddress}</p>
                            </div>
                        </div>

                        {/* Legs and Stops */}
                        {plan.legs.map((leg, index) => {
                             const stopInfo = plan.stops[index];
                             const isFinalLeg = index === plan.legs.length - 1;
                             const placeTypeInfo = stopInfo?.place_type ? getPlaceTypeInfo(stopInfo.place_type) : null;
                             const wazeLink = stopInfo ? getUniversalWazeLink(stopInfo) : null;

                             return (
                                <React.Fragment key={index}>
                                    {/* Travel time indicator */}
                                    <div className="flex items-center gap-3 py-2 pr-4">
                                        <div className={`w-px h-6 mr-4 ${darkMode ? 'bg-gray-700' : 'bg-gray-300'}`}></div>
                                        <div className="flex items-center gap-2">
                                            <Clock className={`w-3.5 h-3.5 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                                            <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                                {leg.eta_min} דק׳
                                            </span>
                                        </div>
                                    </div>

                                    {/* Stop or Final Destination */}
                                    {isFinalLeg ? (
                                        <div className="flex items-center gap-3 py-2">
                                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-red-500/10">
                                                <Flag className="w-4 h-4 text-red-500" />
                                            </div>
                                            <div className="flex-1">
                                                <p className={`text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>{destinationAddress}</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className={`flex items-start gap-3 py-3 px-3 -mx-3 rounded-lg ${darkMode ? 'bg-gray-700/30' : 'bg-gray-50'}`}>
                                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-500/10 flex-shrink-0 mt-0.5">
                                                <MapPin className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                    <p className={`text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                                                        {isDirectPickup ? 'איסוף נוסע' : `נקודת מפגש ${index + 1}`}
                                                    </p>
                                                    {placeTypeInfo && (
                                                        <Badge variant="outline" className={`text-xs flex items-center gap-1 border-0 ${placeTypeInfo.color}`}>
                                                            {placeTypeInfo.icon}
                                                            {placeTypeInfo.label}
                                                        </Badge>
                                                    )}
                                                </div>
                                                <p className={`text-xs mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                                    {stopInfo?.address || (isDirectPickup ? passengerAddress : 'כתובת לא זמינה')}
                                                </p>
                                                {wazeLink && (
                                                    <a 
                                                        href={wazeLink} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer"
                                                        className={`inline-flex items-center justify-center p-2 rounded-md transition-colors ${
                                                            darkMode 
                                                                ? 'border border-gray-600 hover:bg-gray-600' 
                                                                : 'border border-gray-300 hover:bg-gray-100'
                                                        }`}
                                                        title="נווט ב-Waze"
                                                    >
                                                        <img 
                                                            src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgvQ7cabTIUwn2Ob98X9QZHSvVbkg2yOS5pUJhLyK-jmQ3tcL7IwzG9tZexitc8QPk2XhvRJoa-eQUGfjJPIZdaHpYbpbp8LeOqzhKvU2HQpFSNIDMhmsE-wsyGUcqhVZl30eV5LzvAmoU/" 
                                                            alt="Waze" 
                                                            className="w-4 h-4"
                                                        />
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </React.Fragment>
                             )
                        })}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}