import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { Car, Bike, Truck, Zap } from "lucide-react";

const rideOptions = [
  { id: "auto", name: "Auto", price: "₹60", icon: Truck },
  { id: "cab", name: "Cab", price: "₹100", icon: Car },
  { id: "bike", name: "Bike", price: "₹50", icon: Bike },
  { id: "ev", name: "EV Car", price: "₹120", icon: Zap },
];

const BookingScreen = () => {
  const navigate = useNavigate();
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [selectedRide, setSelectedRide] = useState("auto");
  const [currentLocation, setCurrentLocation] = useState<[number, number] | null>(null);
  const [destinationLocation, setDestinationLocation] = useState<[number, number] | null>(null);
  const currentMarker = useRef<mapboxgl.Marker | null>(null);
  const destinationMarker = useRef<mapboxgl.Marker | null>(null);

  useEffect(() => {
    // Get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords: [number, number] = [position.coords.longitude, position.coords.latitude];
          setCurrentLocation(coords);
          initializeMap(coords);
        },
        (error) => {
          console.error("Error getting location:", error);
          // Default to a location if geolocation fails
          const defaultCoords: [number, number] = [77.5946, 12.9716]; // Bangalore
          setCurrentLocation(defaultCoords);
          initializeMap(defaultCoords);
        }
      );
    }
  }, []);

  const initializeMap = (coords: [number, number]) => {
    if (!mapContainer.current) return;

    mapboxgl.accessToken = "pk.eyJ1IjoibGFsaXRoMDYwNCIsImEiOiJjbWRqeGV0ZHEwb3k2Mm1zNTJud2ZzN2cxIn0.UQDq7MJMhKskfLD3B7li6Q";

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: coords,
      zoom: 14,
    });

    // Add current location marker
    currentMarker.current = new mapboxgl.Marker({ color: "#1E90FF" })
      .setLngLat(coords)
      .addTo(map.current);

    // Add click listener for destination selection
    map.current.on("click", (e) => {
      const destination: [number, number] = [e.lngLat.lng, e.lngLat.lat];
      setDestinationLocation(destination);

      // Remove existing destination marker
      if (destinationMarker.current) {
        destinationMarker.current.remove();
      }

      // Add new destination marker
      destinationMarker.current = new mapboxgl.Marker({ color: "#FF6B6B" })
        .setLngLat(destination)
        .addTo(map.current!);
    });
  };

  return (
    <div className="min-h-screen bg-secondary flex flex-col">
      {/* Map Container */}
      <div className="flex-1 relative">
        <div ref={mapContainer} className="absolute inset-0" />
        
        {/* Back Button */}
        <Button
          variant="outline"
          onClick={() => navigate("/home")}
          className="absolute top-4 left-4 z-10 bg-background shadow-lg"
        >
          ← Back
        </Button>
      </div>

      {/* Ride Options */}
      <div className="bg-background p-5 border-t border-border">
        <h3 className="text-lg font-semibold text-foreground mb-4">Choose your ride</h3>
        
        <div className="flex gap-3 overflow-x-auto pb-2">
          {rideOptions.map((option) => {
            const Icon = option.icon;
            return (
              <button
                key={option.id}
                onClick={() => setSelectedRide(option.id)}
                className={`flex-shrink-0 p-4 rounded-xl border-2 transition-all min-w-[120px] ${
                  selectedRide === option.id
                    ? "border-primary bg-primary/10"
                    : "border-border bg-background"
                }`}
              >
                <div className="flex flex-col items-center gap-2">
                  <Icon className={`w-8 h-8 ${
                    selectedRide === option.id ? "text-primary" : "text-muted-foreground"
                  }`} />
                  <span className={`text-sm font-medium ${
                    selectedRide === option.id ? "text-primary" : "text-foreground"
                  }`}>
                    {option.name}
                  </span>
                  <span className={`text-lg font-bold ${
                    selectedRide === option.id ? "text-primary" : "text-foreground"
                  }`}>
                    {option.price}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        <Button
          onClick={() => navigate("/ride-details")}
          className="w-full mt-4"
          disabled={!destinationLocation}
        >
          {destinationLocation ? "Continue to Ride Details" : "Select destination on map"}
        </Button>
      </div>
    </div>
  );
};

export default BookingScreen;