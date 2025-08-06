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

  // Test console log to confirm navigation worked
  console.log("✅ Successfully navigated to LiveRideScreen!");
  console.log("Ride data received:", routerLocation.state);
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
  
  // States for driver animation and start ride
  const [showStartRide, setShowStartRide] = useState(false);
  const [driverStatus, setDriverStatus] = useState("Driver on the way");
  const [currentVehiclePosition, setCurrentVehiclePosition] = useState<[number, number] | null>(null);
  const [rideStage, setRideStage] = useState<'driver-to-pickup' | 'pickup-to-destination'>('driver-to-pickup');
  const [routeCoordinates, setRouteCoordinates] = useState<[number, number][]>([]);
  
  // Generate simulated driver starting position (about 1000m away)
  const getSimulatedDriverPosition = (pickupLocation: [number, number]): [number, number] => {
    const offsetLat = 0.009; // approximately 1000m in latitude
    const offsetLng = 0.012; // approximately 1000m in longitude
    return [
      pickupLocation[0] + offsetLng,
      pickupLocation[1] + offsetLat
    ];
  };
  
  // Get position along route path based on progress
  const getPositionAlongRoute = (coordinates: [number, number][], progress: number): [number, number] => {
    if (coordinates.length === 0) return [0, 0];
    if (progress <= 0) return coordinates[0];
    if (progress >= 1) return coordinates[coordinates.length - 1];
    
    const totalSegments = coordinates.length - 1;
    const segmentProgress = progress * totalSegments;
    const segmentIndex = Math.floor(segmentProgress);
    const segmentFraction = segmentProgress - segmentIndex;
    
    if (segmentIndex >= coordinates.length - 1) {
      return coordinates[coordinates.length - 1];
    }
    
    const start = coordinates[segmentIndex];
    const end = coordinates[segmentIndex + 1];
    
    return [
      start[0] + (end[0] - start[0]) * segmentFraction,
      start[1] + (end[1] - start[1]) * segmentFraction
    ];
  };

  // Start vehicle animation when route coordinates are available
  useEffect(() => {
    if (!currentLocation || routeCoordinates.length === 0) {
      console.log("❌ Animation not starting:", { 
        hasCurrentLocation: !!currentLocation, 
        routeCoordinatesLength: routeCoordinates.length 
      });
      return;
    }
    
    console.log("🚗 Starting vehicle animation with", routeCoordinates.length, "route coordinates");
    
    // Animation duration: 18 seconds
    const animationDuration = 18000;
    const updateInterval = 250; // Update every 250ms
    const totalSteps = animationDuration / updateInterval;
    let currentStep = 0;
    
    const animationTimer = setInterval(() => {
      currentStep++;
      const progress = currentStep / totalSteps;
      
      console.log(`🎯 Animation progress: ${(progress * 100).toFixed(1)}% (step ${currentStep}/${totalSteps})`);
      
      if (progress >= 1) {
        // Animation complete - driver arrived at pickup
        console.log("✅ Animation complete - driver arrived at pickup");
        setCurrentVehiclePosition(currentLocation.coordinates);
        setDriverStatus("Driver has arrived");
        setRideStage('pickup-to-destination');
        setShowStartRide(true);
        clearInterval(animationTimer);
      } else {
        // Update vehicle position along the route
        const newPosition = getPositionAlongRoute(routeCoordinates, progress);
        console.log(`📍 Vehicle position: [${newPosition[0].toFixed(6)}, ${newPosition[1].toFixed(6)}]`);
        setCurrentVehiclePosition(newPosition);
      }
    }, updateInterval);
    
    // Store animation ref for cleanup
    animationRef.current = animationTimer;
    
    return () => {
      console.log("🛑 Cleaning up animation timer");
      clearInterval(animationTimer);
      if (animationRef.current) {
        clearInterval(animationRef.current);
        animationRef.current = null;
      }
    };
  }, [routeCoordinates, currentLocation]);

  // Initialize vehicle position when component loads
  useEffect(() => {
    if (!currentLocation) return;
    const driverStartPosition = getSimulatedDriverPosition(currentLocation.coordinates);
    setCurrentVehiclePosition(driverStartPosition);
  }, [currentLocation]);

  useEffect(() => {
    if (currentLocation && destination) {
      initializeMap();
    }
  }, [currentLocation, destination, rideStage]);

  // Effect to update map when stage changes
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
        
        // Store route coordinates for animation
        const coordinates: [number, number][] = route.geometry.coordinates;
        setRouteCoordinates(coordinates);
        
        // Add route source
        if (map.current.getSource('route')) {
          map.current.removeLayer('route');
          map.current.removeSource('route');
        }
        
        map.current.addSource('route', {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: route.geometry
          }
        });
        
        // Add route layer (black for driver to pickup)
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

  const fetchAndDrawPickupToDestinationRoute = async () => {
    if (!map.current || !currentLocation || !destination) return;

    try {
      const response = await fetch(
        `https://api.mapbox.com/directions/v5/mapbox/driving/${currentLocation.coordinates[0]},${currentLocation.coordinates[1]};${destination.coordinates[0]},${destination.coordinates[1]}?geometries=geojson&access_token=${mapboxgl.accessToken}`
      );
      
      const data = await response.json();
      
      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        
        // Add route source
        if (map.current.getSource('route')) {
          map.current.removeLayer('route');
          map.current.removeSource('route');
        }
        
        map.current.addSource('route', {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: route.geometry
          }
        });
        
        // Add route layer (blue for pickup to destination)
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
        // Draw route from vehicle current position to pickup
        fetchAndDrawDriverToPickupRoute();
      } else {
        fetchAndDrawPickupToDestinationRoute();
      }
    });
  };

  // Update vehicle marker position when currentVehiclePosition changes
  useEffect(() => {
    if (vehicleMarker.current && currentVehiclePosition) {
      vehicleMarker.current.setLngLat(currentVehiclePosition);
    }
  }, [currentVehiclePosition]);

  // Draw initial route when vehicle position is set and map is ready
  useEffect(() => {
    if (map.current && currentVehiclePosition && currentLocation && rideStage === 'driver-to-pickup') {
      fetchAndDrawDriverToPickupRoute();
    }
  }, [currentVehiclePosition, currentLocation, rideStage]);

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