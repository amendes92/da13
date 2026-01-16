
import React, { useEffect, useRef } from 'react';
import { RouteStatus, FreightJob, JobStatus } from '../types';

interface MapSimulationProps {
  routeStatus: RouteStatus;
  jobs?: FreightJob[];
  showRoute?: boolean;
}

// Clean "Silver" Map Style - Modern & Minimalist
const mapStyle = [
  {
    "elementType": "geometry",
    "stylers": [{ "color": "#f5f5f5" }]
  },
  {
    "elementType": "labels.icon",
    "stylers": [{ "visibility": "off" }]
  },
  {
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#616161" }]
  },
  {
    "elementType": "labels.text.stroke",
    "stylers": [{ "color": "#f5f5f5" }]
  },
  {
    "featureType": "administrative.land_parcel",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#bdbdbd" }]
  },
  {
    "featureType": "poi",
    "elementType": "geometry",
    "stylers": [{ "color": "#eeeeee" }]
  },
  {
    "featureType": "poi",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#757575" }]
  },
  {
    "featureType": "poi.park",
    "elementType": "geometry",
    "stylers": [{ "color": "#e5e5e5" }]
  },
  {
    "featureType": "poi.park",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#9e9e9e" }]
  },
  {
    "featureType": "road",
    "elementType": "geometry",
    "stylers": [{ "color": "#ffffff" }]
  },
  {
    "featureType": "road.arterial",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#757575" }]
  },
  {
    "featureType": "road.highway",
    "elementType": "geometry",
    "stylers": [{ "color": "#dadada" }]
  },
  {
    "featureType": "road.highway",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#616161" }]
  },
  {
    "featureType": "road.local",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#9e9e9e" }]
  },
  {
    "featureType": "transit.line",
    "elementType": "geometry",
    "stylers": [{ "color": "#e5e5e5" }]
  },
  {
    "featureType": "transit.station",
    "elementType": "geometry",
    "stylers": [{ "color": "#eeeeee" }]
  },
  {
    "featureType": "water",
    "elementType": "geometry",
    "stylers": [{ "color": "#c9c9c9" }]
  },
  {
    "featureType": "water",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#9e9e9e" }]
  }
];

export const MapSimulation: React.FC<MapSimulationProps> = ({ routeStatus, jobs = [], showRoute = true }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapInstance = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const markerInstance = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const directionsRendererInstance = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const jobMarkersRef = useRef<any[]>([]);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const google = (window as any).google;

    if (!google || !mapRef.current) return;

    if (!mapInstance.current) {
      mapInstance.current = new google.maps.Map(mapRef.current, {
        center: routeStatus.currentLocation,
        zoom: 13,
        disableDefaultUI: true,
        styles: mapStyle,
        zoomControl: false,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
      });

      directionsRendererInstance.current = new google.maps.DirectionsRenderer({
        map: mapInstance.current,
        suppressMarkers: true,
        polylineOptions: {
          strokeColor: "#EA580C", // Brand Orange (matches Tailwind brand-orange)
          strokeOpacity: 0.9,
          strokeWeight: 5,
        }
      });

      // SEMI-TRUCK / CARRETA Icon
      const truckIcon = {
        url: "https://cdn-icons-png.flaticon.com/512/679/679922.png", // Heavy Truck Icon
        scaledSize: new google.maps.Size(64, 64),
        anchor: new google.maps.Point(32, 32),
      };

      markerInstance.current = new google.maps.Marker({
        position: routeStatus.currentLocation,
        map: mapInstance.current,
        icon: truckIcon,
        title: "Carreta",
        zIndex: 2000,
      });
    }
  }, []);

  useEffect(() => {
    if (directionsRendererInstance.current) {
        if (showRoute && routeStatus.directionsResult) {
            directionsRendererInstance.current.setDirections(routeStatus.directionsResult);
            directionsRendererInstance.current.setMap(mapInstance.current);
        } else {
            directionsRendererInstance.current.setMap(null);
        }
    }
  }, [routeStatus.directionsResult, showRoute]);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const google = (window as any).google;
    if (!google || !mapInstance.current) return;

    jobMarkersRef.current.forEach(m => m.setMap(null));
    jobMarkersRef.current = [];

    jobs.forEach((job, index) => {
      let bgColor = "#FFFFFF"; 
      let textColor = "#0F172A"; 
      let strokeColor = "#EA580C"; 
      let scale = 10;

      if (job.status === JobStatus.IN_TRANSIT) {
        bgColor = "#EA580C"; 
        textColor = "#FFFFFF";
        strokeColor = "#C2410C";
      } else if (job.status === JobStatus.DELIVERED) {
        bgColor = "#64748B"; 
        textColor = "#CBD5E1";
        strokeColor = "#475569";
        scale = 8;
      }

      const marker = new google.maps.Marker({
        position: { lat: job.lat, lng: job.lng },
        map: mapInstance.current,
        title: job.clientName,
        label: {
            text: (index + 1).toString(),
            color: textColor,
            fontWeight: "bold",
            fontSize: "12px",
        },
        icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: scale,
            fillColor: bgColor,
            fillOpacity: 1,
            strokeWeight: 2,
            strokeColor: strokeColor,
        },
        zIndex: 1000 - index,
      });
      jobMarkersRef.current.push(marker);
    });

  }, [jobs]);

  useEffect(() => {
    if (mapInstance.current && markerInstance.current) {
      const newPos = routeStatus.currentLocation;
      markerInstance.current.setPosition(newPos);
      
      if (routeStatus.isActive) {
         mapInstance.current.panTo(newPos);
      }
    }
  }, [routeStatus.currentLocation, routeStatus.isActive]);

  return (
    <div className="relative w-full h-full bg-slate-200 overflow-hidden">
      <div ref={mapRef} className="w-full h-full" />
    </div>
  );
};
