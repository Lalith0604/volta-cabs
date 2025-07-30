import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { Car, Bike, Truck, Zap, MapPin } from "lucide-react";
import { useLocation } from "@/contexts/LocationContext";

const rideOptions = [
  { id: "auto", name: "Auto", price: "₹60", icon: Truck },
  { id: "cab", name: "Cab", price: "₹100", icon: Car },
  { id: "bike", name: "Bike", price: "₹50", icon: Bike },
  { id: "ev", name: "EV Car", price: "₹120", icon: Zap },
];

const BookingScreen = () => {
  const navigate = useNavigate();
  const { currentLocation, destination } = useLocation();
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [selectedRide, setSelectedRide] = useState("auto");
  const currentMarker = useRef<mapboxgl.Marker | null>(null);
  const destinationMarker = useRef<mapboxgl.Marker | null>(null);

  useEffect(() => {
    if (currentLocation && destination) {
      initializeMap();
    }
  }, [currentLocation, destination]);

  const initializeMap = () => {
    if (!mapContainer.current || !currentLocation || !destination) return;

    mapboxgl.accessToken = "pk.eyJ1IjoibGFsaXRoMDYwNCIsImEiOiJjbWRqeGV0ZHEwb3k2Mm1zNTJud2ZzN2cxIn0.UQDq7MJMhKskfLD3B7li6Q";

    // Calculate center point between current location and destination
    const centerLng = (currentLocation.coordinates[0] + destination.coordinates[0]) / 2;
    const centerLat = (currentLocation.coordinates[1] + destination.coordinates[1]) / 2;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [centerLng, centerLat],
      zoom: 12,
    });

    map.current.on('load', () => {
      // Add pickup marker with popup
      const pickupPopup = new mapboxgl.Popup({ offset: 25 }).setHTML(
        '<div style="padding: 8px; font-weight: bold; color: #1E90FF;">📍 Pickup</div>'
      );
      
      currentMarker.current = new mapboxgl.Marker({ color: "#1E90FF" })
        .setLngLat(currentLocation.coordinates)
        .setPopup(pickupPopup)
        .addTo(map.current!);

      // Add drop-off marker with popup
      const dropoffPopup = new mapboxgl.Popup({ offset: 25 }).setHTML(
        '<div style="padding: 8px; font-weight: bold; color: #FF6B6B;">🎯 Drop-off</div>'
      );
      
      destinationMarker.current = new mapboxgl.Marker({ color: "#FF6B6B" })
        .setLngLat(destination.coordinates)
        .setPopup(dropoffPopup)
        .addTo(map.current!);

      // Fit map to show both markers
      const bounds = new mapboxgl.LngLatBounds();
      bounds.extend(currentLocation.coordinates);
      bounds.extend(destination.coordinates);
      
      map.current!.fitBounds(bounds, {
        padding: 50,
        maxZoom: 15
      });
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

      {/* Location Info & Ride Options */}
      <div className="bg-background p-5 border-t border-border">
        {/* Display current location and destination */}
        {currentLocation && destination ? (
          <div className="mb-6 space-y-3">
            <div className="flex items-center gap-3 p-3 bg-primary/5 rounded-lg border border-primary/20">
              <MapPin className="w-5 h-5 text-primary" />
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Pickup</p>
                <p className="font-medium text-foreground">{currentLocation.address}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-destructive/5 rounded-lg border border-destructive/20">
              <MapPin className="w-5 h-5 text-destructive" />
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Drop-off</p>
                <p className="font-medium text-foreground">{destination.address}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="mb-6 p-4 bg-muted rounded-lg text-center">
            <p className="text-muted-foreground">Location info not available. Please go back and select locations.</p>
            <Button 
              variant="outline" 
              onClick={() => navigate("/home")} 
              className="mt-2"
            >
              Go Back
            </Button>
          </div>
        )}

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
          disabled={!currentLocation || !destination}
        >
          {currentLocation && destination ? "Continue to Ride Details" : "Location required"}
        </Button>
      </div>
    </div>
  );
};

export default BookingScreen;