import { useNavigate, useLocation as useRouterLocation } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { Car, Bike, Truck, Package, MapPin } from "lucide-react";
import { useLocation } from "@/contexts/LocationContext";
import { Button } from "@/components/ui/button";

const rideIcons = {
  auto: "🛺",
  moto: "🏍️", 
  "uber-go": "🚗",
  courier: "📦",
};

const LiveRideScreen = () => {
  const navigate = useNavigate();
  const routerLocation = useRouterLocation();
  const { currentLocation, destination } = useLocation();

  // Map and marker refs
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const vehicleMarker = useRef<mapboxgl.Marker | null>(null);
  const destinationMarker = useRef<mapboxgl.Marker | null>(null);
  const animationRef = useRef<NodeJS.Timeout | null>(null);
  
  // Get ride details from navigation state
  const rideDetails = routerLocation.state?.rideDetails || {
    id: "auto",
    name: "Auto",
    price: "₹81.84",
  };
  
  // Animation states
  const [showStartRide, setShowStartRide] = useState(false);
  const [driverStatus, setDriverStatus] = useState("Driver on the way");
  const [currentVehiclePosition, setCurrentVehiclePosition] = useState<[number, number] | null>(null);
  const [rideStage, setRideStage] = useState<'driver-to-pickup' | 'pickup-to-destination'>('driver-to-pickup');
  const [animationStarted, setAnimationStarted] = useState(false);
  
  // Utility: Generate simulated driver starting position (about 1000m away)
  const getSimulatedDriverPosition = (pickupLocation: [number, number]): [number, number] => {
    const offsetLat = 0.009; // approximately 1000m in latitude
    const offsetLng = 0.012; // approximately 1000m in longitude
    return [
      pickupLocation[0] + offsetLng,
      pickupLocation[1] + offsetLat
    ];
  };
  
  // Utility: Calculate bearing between two coordinates for vehicle rotation
  const calculateBearing = (start: [number, number], end: [number, number]): number => {
    const [startLng, startLat] = start;
    const [endLng, endLat] = end;
    
    const dLng = (endLng - startLng) * Math.PI / 180;
    const lat1 = startLat * Math.PI / 180;
    const lat2 = endLat * Math.PI / 180;
    
    const y = Math.sin(dLng) * Math.cos(lat2);
    const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
    
    const bearing = Math.atan2(y, x) * 180 / Math.PI;
    return (bearing + 360) % 360; // Normalize to 0-360
  };

  // Core Animation: Vehicle movement with 15-second duration
  const animateVehicle = (
    start: [number, number],
    end: [number, number],
    onArrive: () => void
  ) => {
    if (!vehicleMarker.current) return;
    
    console.log(`🚗 Starting vehicle animation from [${start[0].toFixed(6)}, ${start[1].toFixed(6)}] to [${end[0].toFixed(6)}, ${end[1].toFixed(6)}]`);
    
    const duration = 15000; // 15 seconds
    const interval = 100; // Update every 100ms for smooth animation
    const totalSteps = duration / interval;
    let currentStep = 0;

    // Calculate bearing for vehicle rotation
    const bearing = calculateBearing(start, end);

    // Animation using setInterval
    animationRef.current = setInterval(() => {
      currentStep++;
      const progress = Math.min(currentStep / totalSteps, 1);
      
      // Linear interpolation between start and end
      const lng = start[0] + (end[0] - start[0]) * progress;
      const lat = start[1] + (end[1] - start[1]) * progress;
      const position: [number, number] = [lng, lat];

      // Update vehicle marker position
      vehicleMarker.current!.setLngLat(position);
      setCurrentVehiclePosition(position);

      // Rotate vehicle to face direction
      const vehicleEl = vehicleMarker.current!.getElement();
      if (vehicleEl) {
        vehicleEl.style.transform = `rotate(${bearing}deg)`;
        vehicleEl.style.transition = 'transform 0.2s ease-out';
      }

      // Follow vehicle with camera
      if (map.current) {
        map.current.easeTo({
          center: position,
          duration: interval,
          easing: (t) => t // Linear easing
        });
      }

      // Log progress every 20%
      if (currentStep % Math.floor(totalSteps / 5) === 0) {
        console.log(`🚗 Animation progress: ${Math.round(progress * 100)}%`);
      }

      // Animation complete
      if (progress >= 1) {
        clearInterval(animationRef.current!);
        console.log('🎯 Vehicle arrived at destination!');
        onArrive();
      }
    }, interval);

    // Return cleanup function
    return () => {
      if (animationRef.current) {
        clearInterval(animationRef.current);
        console.log('🛑 Animation stopped');
      }
    };
  };

  // Route Management: Fetch and draw route from driver to pickup (black line)
  const fetchAndDrawDriverToPickupRoute = async () => {
    if (!map.current || !currentLocation || !currentVehiclePosition) return;

    try {
      const driverPosition = currentVehiclePosition || getSimulatedDriverPosition(currentLocation.coordinates);
      const response = await fetch(
        `https://api.mapbox.com/directions/v5/mapbox/driving/${driverPosition[0]},${driverPosition[1]};${currentLocation.coordinates[0]},${currentLocation.coordinates[1]}?geometries=geojson&access_token=${mapboxgl.accessToken}`
      );
      
      const data = await response.json();
      
      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        
        // Remove existing route if present
        if (map.current.getSource('route')) {
          map.current.removeLayer('route');
          map.current.removeSource('route');
        }
        
        // Add route source and layer (black for driver to pickup)
        map.current.addSource('route', {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: route.geometry
          }
        });
        
        map.current.addLayer({
          id: 'route',
          type: 'line',
          source: 'route',
          layout: {
            'line-join': 'round',
            'line-cap': 'round'
          },
          paint: {
            'line-color': '#000000',
            'line-width': 4,
            'line-opacity': 0.8
          }
        });
      }
    } catch (error) {
      console.error('Error fetching driver to pickup route:', error);
    }
  };

  // Route Management: Fetch and draw route from pickup to destination (blue line)
  const fetchAndDrawPickupToDestinationRoute = async () => {
    if (!map.current || !currentLocation || !destination) return;

    try {
      const response = await fetch(
        `https://api.mapbox.com/directions/v5/mapbox/driving/${currentLocation.coordinates[0]},${currentLocation.coordinates[1]};${destination.coordinates[0]},${destination.coordinates[1]}?geometries=geojson&access_token=${mapboxgl.accessToken}`
      );
      
      const data = await response.json();
      
      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        
        // Remove existing route if present
        if (map.current.getSource('route')) {
          map.current.removeLayer('route');
          map.current.removeSource('route');
        }
        
        // Add route source and layer (blue for pickup to destination)
        map.current.addSource('route', {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: route.geometry
          }
        });
        
        map.current.addLayer({
          id: 'route',
          type: 'line',
          source: 'route',
          layout: {
            'line-join': 'round',
            'line-cap': 'round'
          },
          paint: {
            'line-color': '#1E90FF',
            'line-width': 4,
            'line-opacity': 0.8
          }
        });
      }
    } catch (error) {
      console.error('Error fetching pickup to destination route:', error);
    }
  };

  // Map Initialization
  const initializeMap = () => {
    if (!mapContainer.current || !currentLocation || !destination) return;

    mapboxgl.accessToken = "pk.eyJ1IjoibGFsaXRoMDYwNCIsImEiOiJjbWRqeGV0ZHEwb3k2Mm1zNTJud2ZzN2cxIn0.UQDq7MJMhKskfLD3B7li6Q";

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: currentLocation.coordinates,
      zoom: 15,
    });

    map.current.on('load', () => {
      // Create vehicle marker with emoji
      const vehicleEl = document.createElement('div');
      vehicleEl.innerHTML = rideIcons[rideDetails.id as keyof typeof rideIcons] || '🚗';
      vehicleEl.style.fontSize = '24px';
      vehicleEl.style.filter = 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))';
      
      // Start vehicle at simulated driver position
      const startPosition = currentVehiclePosition || getSimulatedDriverPosition(currentLocation.coordinates);
      vehicleMarker.current = new mapboxgl.Marker({ element: vehicleEl })
        .setLngLat(startPosition)
        .addTo(map.current!);

      // Always show pickup point marker
      const pickupEl = document.createElement('div');
      pickupEl.innerHTML = '📍';
      pickupEl.style.fontSize = '20px';
      pickupEl.style.filter = 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))';
      
      const pickupPopup = new mapboxgl.Popup({ offset: 25 }).setHTML(
        '<div style="padding: 8px; font-weight: bold; color: #22c55e;">📍 Pickup Point</div>'
      );
      
      new mapboxgl.Marker({ element: pickupEl })
        .setLngLat(currentLocation.coordinates)
        .setPopup(pickupPopup)
        .addTo(map.current!);

      // Only show destination marker in stage 2
      if (rideStage === 'pickup-to-destination') {
        const destinationEl = document.createElement('div');
        destinationEl.innerHTML = '🎯';
        destinationEl.style.fontSize = '20px';
        destinationEl.style.filter = 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))';
        
        const destinationPopup = new mapboxgl.Popup({ offset: 25 }).setHTML(
          '<div style="padding: 8px; font-weight: bold; color: #ef4444;">🎯 Destination</div>'
        );
        
        destinationMarker.current = new mapboxgl.Marker({ element: destinationEl })
          .setLngLat(destination.coordinates)
          .setPopup(destinationPopup)
          .addTo(map.current!);
      }

      // Fetch and draw appropriate route based on stage
      if (rideStage === 'driver-to-pickup') {
        fetchAndDrawDriverToPickupRoute();
      } else {
        fetchAndDrawPickupToDestinationRoute();
      }
    });
  };

  // Initialize vehicle position when component loads
  useEffect(() => {
    if (!currentLocation) return;
    const driverStartPosition = getSimulatedDriverPosition(currentLocation.coordinates);
    setCurrentVehiclePosition(driverStartPosition);
  }, [currentLocation]);

  // Initialize map when locations are available
  useEffect(() => {
    if (currentLocation && destination) {
      initializeMap();
    }
  }, [currentLocation, destination, rideStage]);

  // Handle stage change: Add destination marker and update route
  useEffect(() => {
    if (map.current && rideStage === 'pickup-to-destination') {
      // Add destination marker when stage changes
      if (destination && !destinationMarker.current) {
        const destinationEl = document.createElement('div');
        destinationEl.innerHTML = '🎯';
        destinationEl.style.fontSize = '20px';
        destinationEl.style.filter = 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))';
        
        const destinationPopup = new mapboxgl.Popup({ offset: 25 }).setHTML(
          '<div style="padding: 8px; font-weight: bold; color: #ef4444;">🎯 Destination</div>'
        );
        
        destinationMarker.current = new mapboxgl.Marker({ element: destinationEl })
          .setLngLat(destination.coordinates)
          .setPopup(destinationPopup)
          .addTo(map.current!);
      }
      
      // Update route to show pickup to destination
      fetchAndDrawPickupToDestinationRoute();
    }
  }, [rideStage, destination]);

  // Animation Phase 1: Driver to pickup point
  useEffect(() => {
    if (
      rideStage === "driver-to-pickup" &&
      currentVehiclePosition &&
      currentLocation &&
      !animationStarted
    ) {
      setAnimationStarted(true);
      const cleanup = animateVehicle(
        currentVehiclePosition,
        currentLocation.coordinates,
        () => {
          setDriverStatus("Driver has arrived");
          setRideStage("pickup-to-destination");
          setShowStartRide(true);
          setAnimationStarted(false);
        }
      );
      return cleanup;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rideStage, currentVehiclePosition, currentLocation, animationStarted]);

  // Animation Phase 2: Pickup to destination
  useEffect(() => {
    if (
      rideStage === "pickup-to-destination" &&
      currentLocation &&
      destination &&
      !animationStarted
    ) {
      setAnimationStarted(true);
      const cleanup = animateVehicle(
        currentLocation.coordinates,
        destination.coordinates,
        () => {
          setDriverStatus("Arrived at destination");
          setAnimationStarted(false);
        }
      );
      return cleanup;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rideStage, currentLocation, destination, animationStarted]);

  // Cleanup animation on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        clearTimeout(animationRef.current);
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#F2F4F7] flex flex-col">
      {/* Map Container */}
      <div className="flex-1 relative">
        <div ref={mapContainer} className="absolute inset-0" />
        
        {/* Top overlay with ride info */}
        <div className="absolute top-4 left-4 right-4 z-10">
          <div className="bg-background rounded-xl p-4 shadow-lg border border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{rideIcons[rideDetails.id as keyof typeof rideIcons] || '🚗'}</span>
                <div>
                  <h3 className="font-semibold text-[#1A1A1A]">{rideDetails.name}</h3>
                  <p className="text-sm text-muted-foreground">{driverStatus}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-primary">{rideDetails.price}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Destination info */}
        <div className="absolute bottom-20 left-4 right-4 z-10">
          <div className="bg-background rounded-xl p-4 shadow-lg border border-border">
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-destructive" />
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Heading to</p>
                <p className="font-medium text-[#1A1A1A]">
                  {destination?.address || "Destination"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom action */}
      <div className="p-4 bg-background border-t border-border space-y-3">
        {showStartRide && (
          <Button
            onClick={() => navigate("/payment", {
              state: {
                rideDetails,
                currentLocation: routerLocation.state?.currentLocation || currentLocation,
                destination: routerLocation.state?.destination || destination
              }
            })}
            className="w-full h-12 bg-[#1E90FF] hover:bg-[#1E90FF]/90 text-white rounded-xl font-semibold animate-fade-in"
          >
            Start Ride
          </Button>
        )}
        <Button
          variant="outline"
          onClick={() => navigate("/booking")}
          className="w-full"
        >
          Back to Booking
        </Button>
      </div>
    </div>
  );
};

export default LiveRideScreen;