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
  const [animationStarted, setAnimationStarted] = useState(false);
  
  // Generate simulated driver starting position (about 1000m away)
  const getSimulatedDriverPosition = (pickupLocation: [number, number]): [number, number] => {
    const offsetLat = 0.009; // approximately 1000m in latitude
    const offsetLng = 0.012; // approximately 1000m in longitude
    return [
      pickupLocation[0] + offsetLng,
      pickupLocation[1] + offsetLat
    ];
  };
  
  // Calculate bearing between two coordinates for vehicle rotation
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

<<<<<<< HEAD
  // Animate vehicle in a straight line from start to end using setInterval
  const animateVehicleStraightLine = (
    start: [number, number],
    end: [number, number],
    durationMs: number,
    onArrive: () => void
  ) => {
    if (!vehicleMarker.current) return;
    let startTime = Date.now();
    const interval = 100; // ms
    const totalSteps = Math.floor(durationMs / interval);
    let step = 0;

    // Calculate bearing once
    const bearing = calculateBearing(start, end);

    // Animation interval
    animationRef.current = setInterval(() => {
      step++;
      const t = Math.min(step / totalSteps, 1); // progress 0..1
      // Linear interpolation
      const lng = start[0] + (end[0] - start[0]) * t;
      const lat = start[1] + (end[1] - start[1]) * t;
      const position: [number, number] = [lng, lat];

      // Move marker
      vehicleMarker.current!.setLngLat(position);

      // Rotate marker to face direction
      const vehicleEl = vehicleMarker.current!.getElement();
      if (vehicleEl) {
        vehicleEl.style.transform = `rotate(${bearing}deg)`;
      }

      // Move camera to follow vehicle
      if (map.current) {
        map.current.easeTo({
          center: position,
          duration: interval,
          easing: n => n, // linear
        });
      }

      // End animation
      if (t >= 1) {
        clearInterval(animationRef.current!);
        onArrive();
      }
    }, interval);

    // Cleanup
    return () => {
      if (animationRef.current) clearInterval(animationRef.current);
    };
  };

  // Smoothly animate marker between coordinates using requestAnimationFrame
  // (This is now only used for the pickup-to-destination stage, not for driver-to-pickup)
=======
  // Realistic vehicle animation along actual route coordinates - Uber/Ola style
>>>>>>> c3f3815cb75929bcd0179bba1a05116a3c4a8992
  const animateMarkerSmoothly = (
    coordinates: [number, number][],
    onArrive: () => void
  ) => {
    if (!vehicleMarker.current || coordinates.length < 2) {
      console.log('❌ Cannot animate: missing marker or insufficient coordinates');
      return;
    }
    
    console.log(`🚗 Starting realistic vehicle movement with ${coordinates.length} route points`);
    
    let currentIndex = 0;
    let animationId: number;
    let startTime: number | null = null;
    const totalDuration = 50000; // 50 seconds for realistic timing
    const totalSegments = coordinates.length - 1;
    
    function animate(timestamp: number) {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const overallProgress = Math.min(elapsed / totalDuration, 1);
      
      // Calculate which segment we should be on
      const segmentIndex = Math.min(Math.floor(overallProgress * totalSegments), totalSegments - 1);
      const segmentProgress = (overallProgress * totalSegments) % 1;
      
      if (segmentIndex >= totalSegments) {
        // Animation complete
        vehicleMarker.current!.setLngLat(coordinates[coordinates.length - 1]);
        setCurrentVehiclePosition(coordinates[coordinates.length - 1]);
        console.log('🎯 Vehicle arrived at pickup point successfully!');
        onArrive();
        return;
      }
      
      // Get current and next coordinates
      const currentCoord = coordinates[segmentIndex];
      const nextCoord = coordinates[segmentIndex + 1];
      
      // Linear interpolation for smooth movement
      const lng = currentCoord[0] + (nextCoord[0] - currentCoord[0]) * segmentProgress;
      const lat = currentCoord[1] + (nextCoord[1] - currentCoord[1]) * segmentProgress;
      const interpolatedPosition: [number, number] = [lng, lat];
      
      // Update vehicle position
      vehicleMarker.current!.setLngLat(interpolatedPosition);
      setCurrentVehiclePosition(interpolatedPosition);
      
      // Calculate and apply bearing for realistic vehicle rotation
      if (segmentIndex !== currentIndex) {
        const bearing = calculateBearing(currentCoord, nextCoord);
        const vehicleEl = vehicleMarker.current!.getElement();
        if (vehicleEl) {
          vehicleEl.style.transform = `rotate(${bearing}deg)`;
          vehicleEl.style.transition = 'transform 0.3s ease-out';
        }
        currentIndex = segmentIndex;
        
        // Log progress every ~10%
        if (segmentIndex % Math.max(1, Math.floor(totalSegments / 10)) === 0) {
          console.log(`🚗 Vehicle progress: ${Math.round(overallProgress * 100)}% (Segment ${segmentIndex + 1}/${totalSegments})`);
        }
      }
      
      // Continue animation
      animationId = requestAnimationFrame(animate);
    }
    
    // Start animation
    animationId = requestAnimationFrame(animate);
    
    // Return cleanup function
    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
        console.log('🛑 Vehicle animation stopped');
      }
    };
  };

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

  // Effect to animate vehicle in a straight line from driver to pickup
  useEffect(() => {
    if (
      rideStage === "driver-to-pickup" &&
      currentVehiclePosition &&
      currentLocation &&
      !animationStarted
    ) {
      setAnimationStarted(true);
      const cleanup = animateVehicleStraightLine(
        currentVehiclePosition,
        currentLocation.coordinates,
        50000, // 50 seconds
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

  // Effect to animate vehicle along route for pickup-to-destination (if needed)
  useEffect(() => {
    if (
      rideStage === "pickup-to-destination" &&
      routeCoordinates.length > 0 &&
      !animationStarted
    ) {
      setAnimationStarted(true);
      let cleanup: (() => void) | undefined;
      cleanup = animateMarkerSmoothly(routeCoordinates, () => {
        setDriverStatus("Arrived at destination");
        setAnimationStarted(false);
      });
      return () => {
        if (cleanup) cleanup();
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rideStage, routeCoordinates, animationStarted]);

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