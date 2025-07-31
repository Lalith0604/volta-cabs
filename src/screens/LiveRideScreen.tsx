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
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const vehicleMarker = useRef<mapboxgl.Marker | null>(null);
  const destinationMarker = useRef<mapboxgl.Marker | null>(null);
  const animationRef = useRef<NodeJS.Timeout | null>(null);
  const routeCoordinates = useRef<[number, number][]>([]);
  
  const [timeLeft, setTimeLeft] = useState(120); // 2 minutes in seconds
  const [currentProgress, setCurrentProgress] = useState(0);

  // Get ride details from navigation state
  const rideDetails = routerLocation.state?.rideDetails || {
    id: "auto",
    name: "Auto",
    price: "₹81.84",
  };

  useEffect(() => {
    if (currentLocation && destination) {
      initializeMap();
    }
  }, [currentLocation, destination]);

  useEffect(() => {
    // Start countdown timer
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // Navigate to ride completed screen after animation
          navigate("/ride-completed", { state: { rideDetails } });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate, rideDetails]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const fetchAndDrawRoute = async () => {
    if (!map.current || !currentLocation || !destination) return;

    try {
      const response = await fetch(
        `https://api.mapbox.com/directions/v5/mapbox/driving/${currentLocation.coordinates[0]},${currentLocation.coordinates[1]};${destination.coordinates[0]},${destination.coordinates[1]}?geometries=geojson&access_token=${mapboxgl.accessToken}`
      );
      
      const data = await response.json();
      
      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        routeCoordinates.current = route.geometry.coordinates;
        
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
        
        // Add route layer
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

        // Start vehicle animation
        startVehicleAnimation();
      }
    } catch (error) {
      console.error('Error fetching route:', error);
    }
  };

  const startVehicleAnimation = () => {
    if (!map.current || routeCoordinates.current.length === 0) return;

    const totalSteps = routeCoordinates.current.length;
    let currentStep = 0;
    const animationDuration = 120000; // 2 minutes
    const stepDuration = animationDuration / totalSteps;

    const animateVehicle = () => {
      if (currentStep >= totalSteps - 1) {
        return; // Animation complete
      }

      const currentCoord = routeCoordinates.current[currentStep];
      const nextCoord = routeCoordinates.current[currentStep + 1];

      // Update vehicle position
      if (vehicleMarker.current) {
        vehicleMarker.current.setLngLat(currentCoord);
      }

      // Calculate bearing for vehicle rotation
      if (nextCoord) {
        const bearing = calculateBearing(currentCoord, nextCoord);
        // Update vehicle marker rotation if needed
      }

      // Update progress
      setCurrentProgress((currentStep / (totalSteps - 1)) * 100);

      // Center map on vehicle
      map.current?.easeTo({
        center: currentCoord,
        duration: stepDuration * 0.8
      });

      currentStep++;
      animationRef.current = setTimeout(animateVehicle, stepDuration);
    };

    animateVehicle();
  };

  const calculateBearing = (from: [number, number], to: [number, number]) => {
    const [fromLng, fromLat] = from;
    const [toLng, toLat] = to;
    
    const dLng = toLng - fromLng;
    const y = Math.sin(dLng) * Math.cos(toLat);
    const x = Math.cos(fromLat) * Math.sin(toLat) - Math.sin(fromLat) * Math.cos(toLat) * Math.cos(dLng);
    
    return (Math.atan2(y, x) * 180) / Math.PI;
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
      
      vehicleMarker.current = new mapboxgl.Marker({ element: vehicleEl })
        .setLngLat(currentLocation.coordinates)
        .addTo(map.current!);

      // Add destination marker
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

      // Fetch and draw route
      fetchAndDrawRoute();
    });
  };

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
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{rideIcons[rideDetails.id as keyof typeof rideIcons] || '🚗'}</span>
                <div>
                  <h3 className="font-semibold text-[#1A1A1A]">{rideDetails.name}</h3>
                  <p className="text-sm text-muted-foreground">On the way</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Arriving in</p>
                <p className="text-xl font-bold text-[#1E90FF]">{formatTime(timeLeft)}</p>
              </div>
            </div>
            
            {/* Progress bar */}
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-[#1E90FF] h-2 rounded-full transition-all duration-1000"
                style={{ width: `${currentProgress}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {Math.round(currentProgress)}% complete
            </p>
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
      <div className="p-4 bg-background border-t border-border">
        <Button
          variant="outline"
          onClick={() => navigate("/ride-details")}
          className="w-full"
        >
          Back to Ride Details
        </Button>
      </div>
    </div>
  );
};

export default LiveRideScreen;