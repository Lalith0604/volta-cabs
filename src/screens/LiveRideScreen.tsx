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
  const routeCoordinates = useRef<[number, number][]>([]);
  
  // Get ride details from navigation state
  const rideDetails = routerLocation.state?.rideDetails || {
    id: "auto",
    name: "Auto",
    price: "₹81.84",
  };
  
  // States for driver animation and start ride
  const [showStartRide, setShowStartRide] = useState(false);
  
  useEffect(() => {
    // Show "Start Ride" button after 3 seconds (simulating driver arrival)
    const timer = setTimeout(() => {
      setShowStartRide(true);
    }, 3000);
    
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (currentLocation && destination) {
      initializeMap();
    }
  }, [currentLocation, destination]);

  const fetchAndDrawRoute = async () => {
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
      }
    } catch (error) {
      console.error('Error fetching route:', error);
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
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{rideIcons[rideDetails.id as keyof typeof rideIcons] || '🚗'}</span>
                <div>
                  <h3 className="font-semibold text-[#1A1A1A]">{rideDetails.name}</h3>
                  <p className="text-sm text-muted-foreground">Driver has arrived</p>
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