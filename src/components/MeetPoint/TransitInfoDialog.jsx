import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { 
    Bus, 
    Footprints, 
    Clock, 
    Train, 
    MapPin, 
    ChevronRight, 
    Info,
    CircleDot
} from 'lucide-react';

export default function TransitInfoDialog({ passengerArrival, darkMode }) {
    if (!passengerArrival) return null;

    const steps = passengerArrival.transit_steps || [];
    const totalDuration = Math.round(passengerArrival.eta_min);

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button 
                    variant="outline" 
                    size="sm"
                    className={`${darkMode ? 'bg-blue-900/30 border-blue-800 text-blue-300 hover:bg-blue-900/50' : 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100'} w-full mt-2 flex items-center justify-center gap-2`}
                >
                    <Info className="w-4 h-4" />
                    הצג פרטי מסלול מלאים
                </Button>
            </DialogTrigger>
            <DialogContent className={`max-w-md ${darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white'}`}>
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl">
                        <Bus className="w-6 h-6 text-blue-500" />
                        מסלול תחבורה ציבורית
                    </DialogTitle>
                    <DialogDescription className={darkMode ? 'text-gray-400' : 'text-gray-500'}>
                        פרטי הגעה לנוסע - סה״כ {totalDuration} דקות
                    </DialogDescription>
                </DialogHeader>
                
                <div className="max-h-[60vh] overflow-y-auto mt-4 pr-2">
                    <div className="space-y-6 relative pb-4">
                        {/* Timeline Line */}
                        <div className={`absolute top-2 bottom-2 right-[19px] w-0.5 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`} />

                        {steps.length === 0 ? (
                            <div className={`text-center py-8 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                <Bus className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                <p>לא התקבל פירוט תחנות עבור מסלול זה.</p>
                            </div>
                        ) : steps.map((step, idx) => {
                            const isLast = idx === steps.length - 1;
                            const isWalking = step.travel_mode === 'WALKING';
                            
                            return (
                                <div key={idx} className="relative flex gap-4 mr-1">
                                    {/* Icon Bubble */}
                                    <div className={`relative z-10 flex items-center justify-center w-10 h-10 rounded-full border-4 ${
                                        darkMode ? 'bg-gray-800 border-gray-800' : 'bg-white border-white'
                                    } shadow-sm shrink-0`}>
                                        <div className={`flex items-center justify-center w-full h-full rounded-full ${
                                            isWalking 
                                                ? (darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600')
                                                : (darkMode ? 'bg-blue-900 text-blue-300' : 'bg-blue-100 text-blue-600')
                                        }`}>
                                            {isWalking ? <Footprints className="w-5 h-5" /> : <Bus className="w-5 h-5" />}
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className={`flex-1 pt-1 pb-6 ${!isLast ? `border-b ${darkMode ? 'border-gray-700' : 'border-gray-100'}` : ''}`}>
                                        <div className="flex justify-between items-start mb-2">
                                            <h4 className="font-bold text-base">
                                                {isWalking ? 'הליכה' : 'נסיעה בתחבורה ציבורית'}
                                            </h4>
                                            <Badge variant="secondary" className="text-xs">
                                                {Math.round(step.duration?.value / 60) || 0} דק׳
                                            </Badge>
                                        </div>

                                        {step.travel_mode === 'TRANSIT' && step.transit_details && (
                                            <div className={`rounded-lg p-3 text-sm space-y-2 ${darkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                                                <div className="flex items-center gap-2 font-bold text-blue-500 text-base">
                                                    <Train className="w-4 h-4" />
                                                    קו {step.transit_details.line.short_name || step.transit_details.line.name}
                                                </div>
                                                <div className="flex items-start gap-2 text-xs">
                                                    <CircleDot className="w-3 h-3 mt-0.5 text-green-500" />
                                                    <div>
                                                        <span className={`block font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>מוצא:</span>
                                                        {step.transit_details.departure_stop.name}
                                                    </div>
                                                </div>
                                                <div className="flex items-start gap-2 text-xs">
                                                    <MapPin className="w-3 h-3 mt-0.5 text-red-500" />
                                                    <div>
                                                        <span className={`block font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>יעד:</span>
                                                        {step.transit_details.arrival_stop.name}
                                                    </div>
                                                </div>
                                                {step.transit_details.num_stops && (
                                                    <div className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                                        {step.transit_details.num_stops} תחנות
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {isWalking && step.html_instructions && (
                                            <div 
                                                className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}
                                                dangerouslySetInnerHTML={{ __html: step.html_instructions }} 
                                            />
                                        )}
                                        
                                        {isWalking && step.distance && (
                                            <div className={`text-xs mt-1 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                                                מרחק: {step.distance.text}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}