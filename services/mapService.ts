import { Location, FreightJob } from "../types";

export const calculateRoute = async (startLocation: Location, jobs: FreightJob[]): Promise<any> => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const google = (window as any).google;
  
  if (!google) {
    throw new Error("Google Maps API not loaded");
  }

  const directionsService = new google.maps.DirectionsService();

  // Route through all job locations
  const waypoints = jobs.map(j => ({
    location: { lat: j.lat, lng: j.lng },
    stopover: true
  }));

  const request = {
    origin: startLocation,
    destination: jobs[jobs.length - 1] ? { lat: jobs[jobs.length - 1].lat, lng: jobs[jobs.length - 1].lng } : startLocation,
    waypoints: waypoints.slice(0, -1), // All except last as waypoints
    optimizeWaypoints: true,
    travelMode: google.maps.TravelMode.DRIVING,
  };

  return new Promise((resolve, reject) => {
    directionsService.route(request, (result: any, status: any) => {
      if (status === google.maps.DirectionsStatus.OK) {
        resolve(result);
      } else {
        reject(new Error(`Directions request failed: ${status}`));
      }
    });
  });
};