import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { Loader2 } from "lucide-react";

// Utility to decode Google Maps encoded polyline
const decodePolyline = (encoded) => {
  if (!encoded) return [];
  const poly = [];
  let index = 0, len = encoded.length;
  let lat = 0, lng = 0;

  while (index < len) {
    let b, shift = 0, result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlat = ((result & 1) !== 0 ? ~(result >> 1) : (result >> 1));
    lat += dlat;

    shift = 0;
    result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlng = ((result & 1) !== 0 ? ~(result >> 1) : (result >> 1));
    lng += dlng;

    poly.push({ lat: lat / 1e5, lng: lng / 1e5 });
  }
  return poly;
};

export default function MapView({
  mapApiLoaded,
  driverOrigin,
  friendOrigin,
  commonDestination,
  meetingPoints = [], 
  highlightedIndex = -1,
  transitRoutePolyline = null // New prop for transit route
}) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const directionsRendererRef = useRef(null);
  const transitPathRef = useRef(null); // Ref for transit polyline
  const [activeInfoWindow, setActiveInfoWindow] = useState(null);

  const stableMeetingPoints = useMemo(() => JSON.stringify(meetingPoints), [meetingPoints]);

  const initMap = useCallback(() => {
    if (!mapApiLoaded || !mapRef.current || !window.google || !window.google.maps || mapInstanceRef.current) return;
    mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
      center: { lat: 31.7683, lng: 35.2137 },
      zoom: 8,
      mapTypeControl: false, 
      streetViewControl: false, 
      fullscreenControl: true, 
      zoomControl: true,
      gestureHandling: 'cooperative',
    });
    directionsRendererRef.current = new window.google.maps.DirectionsRenderer({ 
      map: mapInstanceRef.current, 
      suppressMarkers: true, 
      polylineOptions: { strokeColor: '#4285F4', strokeOpacity: 0.8, strokeWeight: 6 } 
    });
  }, [mapApiLoaded]);

  const clearMapElements = useCallback(() => {
    markersRef.current.forEach(marker => marker?.setMap(null));
    markersRef.current = [];
    
    if (directionsRendererRef.current) {
        directionsRendererRef.current.setDirections({ routes: [] });
    }
    
    if (transitPathRef.current) {
        if (transitPathRef.current.background) {
            transitPathRef.current.background.setMap(null);
        }
        transitPathRef.current.setMap(null);
        transitPathRef.current = null;
    }

    activeInfoWindow?.close();
    setActiveInfoWindow(null);
  }, [activeInfoWindow]);

  const addMarker = useCallback((position, title, bounds, label, isHighlighted, pointData) => {
    if (!mapInstanceRef.current || !position) return;

    const marker = new window.google.maps.Marker({
      position,
      map: mapInstanceRef.current,
      title: title,
      icon: {
        url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
          <svg width="38" height="48" viewBox="0 0 38 48" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 0C8.5 0 0 8.5 0 19c0 10.5 19 29 19 29s19-18.5 19-29C38 8.5 29.5 0 19 0z" fill="${isHighlighted ? '#FF6B6B' : (label ? '#4285F4' : '#34A853')}" stroke-width="1" stroke="white"/>
            ${label ? `<circle cx="19" cy="19" r="12" fill="white"/><text x="19" y="24" text-anchor="middle" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="${isHighlighted ? '#FF6B6B' : '#4285F4'}">${label}</text>` : `<circle cx="19" cy="19" r="6" fill="white"/>`}
          </svg>
        `)}`,
        anchor: new window.google.maps.Point(19, 48)
      }
    });

    if (pointData) {
      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="direction: rtl; text-align: right; font-family: Arial;">
            <h4 style="margin: 0 0 8px 0; color: #333;">${pointData.label}</h4>
          </div>
        `
      });

      marker.addListener('click', () => {
        if (activeInfoWindow) activeInfoWindow.close();
        infoWindow.open(mapInstanceRef.current, marker);
        setActiveInfoWindow(infoWindow);
      });
    }

    markersRef.current.push(marker);
    if(bounds) bounds.extend(position);
  }, [activeInfoWindow]);

  useEffect(() => {
    if (mapApiLoaded) initMap();
  }, [mapApiLoaded, initMap]);

  useEffect(() => {
    if (!mapApiLoaded || !mapInstanceRef.current || !driverOrigin || !commonDestination) return;
    
    clearMapElements();
    const bounds = new window.google.maps.LatLngBounds();
    const directionsService = new window.google.maps.DirectionsService();
    const parsedMeetingPoints = JSON.parse(stableMeetingPoints);
    
    // Draw driver route with stops
    const waypoints = parsedMeetingPoints.map(point => ({
        location: { lat: point.lat, lng: point.lng },
        stopover: true
    }));

    directionsService.route({
        origin: driverOrigin,
        destination: commonDestination,
        waypoints: waypoints,
        travelMode: window.google.maps.TravelMode.DRIVING,
    }, (result, status) => {
        if (status === 'OK' && directionsRendererRef.current) {
            directionsRendererRef.current.setDirections(result);
        } else {
            console.warn("Could not draw driver's route:", status);
        }
    });

    // Draw Transit Polyline if exists
    if (transitRoutePolyline) {
        const decodedPath = decodePolyline(transitRoutePolyline);

        // Create a dashed line for transit to distinguish it
        const lineSymbol = {
          path: 'M 0,-1 0,1',
          strokeOpacity: 1,
          scale: 4
        };

        transitPathRef.current = new window.google.maps.Polyline({
            path: decodedPath,
            geodesic: true,
            strokeColor: '#F59E0B', // Amber/Orange for transit
            strokeOpacity: 0, // Hide the solid line
            icons: [{
              icon: lineSymbol,
              offset: '0',
              repeat: '20px'
            }],
            strokeWeight: 3,
            map: mapInstanceRef.current
        });

        // Also add a solid thin line underneath for visibility
        const backgroundLine = new window.google.maps.Polyline({
          path: decodedPath,
          strokeColor: '#F59E0B',
          strokeOpacity: 0.3,
          strokeWeight: 5,
          map: mapInstanceRef.current
        });

        // Store both to clear them later (modify transitPathRef to be array or handle cleanup)
        transitPathRef.current.background = backgroundLine;

        // Extend bounds to include transit path
        decodedPath.forEach(point => bounds.extend(point));
    }

    // Add markers
    addMarker(driverOrigin, "נהג", bounds, 'S');
    addMarker(commonDestination, "יעד משותף", bounds, 'D');
    if (friendOrigin) {
        addMarker(friendOrigin, "חבר", bounds, 'P');
    }

    parsedMeetingPoints.forEach((point, index) => {
      const pointLatLng = new window.google.maps.LatLng(point.lat, point.lng);
      addMarker(pointLatLng, point.label, bounds, (index + 1).toString(), index === highlightedIndex, point);
    });

    if (!bounds.isEmpty()) {
       mapInstanceRef.current.fitBounds(bounds, 100);
    }

  }, [mapApiLoaded, driverOrigin, friendOrigin, commonDestination, stableMeetingPoints, highlightedIndex, clearMapElements, addMarker, transitRoutePolyline]);

  if (!mapApiLoaded) {
    return (
      <div className="w-full h-[600px] flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 dark:text-blue-400" />
          <p className="text-gray-600 dark:text-gray-400">טוען מפה...</p>
        </div>
      </div>
    );
  }

  return (
    <div ref={mapRef} className="w-full h-[600px]" />
  );
}