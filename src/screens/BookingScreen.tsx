import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { Car, Bike, Truck, Zap, MapPin, User, Clock, Package } from "lucide-react";
import { useLocation } from "@/contexts/LocationContext";
import RideRequestOverlay from "@/components/RideRequestOverlay";

const rideOptions = [
  { 
    id: "auto", 
    name: "Auto", 
    price: "₹81.84", 
    icon: Truck, 
    seats: 3, 
    eta: "2 mins away - 10:56 AM",
    tag: "Faster"
  },
  { 
    id: "moto", 
    name: "Moto", 
    price: "₹59.51", 
    icon: Bike, 
    seats: 1, 
    eta: "2 mins away - 10:56 AM"
  },
  { 
    id: "uber-go", 
    name: "Uber Go", 
    price: "₹159.99", 
    icon: Car, 
    seats: 4, 
    eta: "3 mins away - 10:59 AM"
  },
  { 
    id: "courier", 
    name: "Courier", 
    price: "₹78.00", 
    icon: Package, 
    seats: null, 
    eta: "2 mins away - 10:56 AM"
  },
];

const BookingScreen = () => {
  const navigate = useNavigate();
  const { currentLocation, destination } = useLocation();
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [selectedRide, setSelectedRide] = useState("auto");
  const [showRequestOverlay, setShowRequestOverlay] = useState(false);
  const currentMarker = useRef<mapboxgl.Marker | null>(null);
  const destinationMarker = useRef<mapboxgl.Marker | null>(null);

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
        
        // Remove existing route if present
        if (map.current.getSource('route')) {
          map.current.removeLayer('route');
          map.current.removeSource('route');
        }
        
        // Add route source
        map.current.addSource('route', {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: route.geometry
          }
        });
        
        // Add route layer with blue styling and rounded edges
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
        '<div style="padding: 8px; font-weight: bold; color: #22c55e;">📍 Pickup</div>'
      );
      
      currentMarker.current = new mapboxgl.Marker({ color: "#22c55e" })
        .setLngLat(currentLocation.coordinates)
        .setPopup(pickupPopup)
        .addTo(map.current!);

      // Add drop-off marker with popup
      const dropoffPopup = new mapboxgl.Popup({ offset: 25 }).setHTML(
        '<div style="padding: 8px; font-weight: bold; color: #ef4444;">🎯 Drop-off</div>'
      );
      
      destinationMarker.current = new mapboxgl.Marker({ color: "#ef4444" })
        .setLngLat(destination.coordinates)
        .setPopup(dropoffPopup)
        .addTo(map.current!);

      // Draw route between pickup and destination
      fetchAndDrawRoute();


      // Fit map to show both markers
      const bounds = new mapboxgl.LngLatBounds();
      bounds.extend(currentLocation.coordinates);
      bounds.extend(destination.coordinates);
      
      map.current!.fitBounds(bounds, {
        padding: 80,
        maxZoom: 15
      });
    });
  };

  return (
    <div className="min-h-screen bg-[#F2F4F7] flex flex-col">
      {/* Map Container - 60-70% of screen */}
      <div className="h-[65vh] relative">
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

      {/* Bottom Section - Location Info & Ride Selection */}
      <div className="flex-1 bg-background p-5 rounded-t-3xl -mt-6 relative z-10 shadow-lg">
        {/* Location Info */}
        {currentLocation && destination ? (
          <div className="mb-6 space-y-3">
            <div className="flex items-center gap-3 p-3 bg-primary/5 rounded-lg border border-primary/20">
              <MapPin className="w-5 h-5 text-primary" />
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Pickup</p>
                <p className="font-medium text-[#1A1A1A]">{currentLocation.address}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-destructive/5 rounded-lg border border-destructive/20">
              <MapPin className="w-5 h-5 text-destructive" />
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Drop-off</p>
                <p className="font-medium text-[#1A1A1A]">{destination.address}</p>
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

        {/* Choose a Ride Section */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-[#1A1A1A]">Choose a Ride</h3>
          
          {/* Ride Options List */}
          <div className="space-y-3">
            {rideOptions.map((option) => {
              const Icon = option.icon;
              
              return (
                <button
                  key={option.id}
                  onClick={() => setSelectedRide(option.id)}
                  className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                    selectedRide === option.id
                      ? "border-[#1E90FF] bg-[#1E90FF]/5"
                      : "border-border bg-background hover:bg-muted/50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    {/* Left side: Icon, Name, Details */}
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                        <Icon className={`w-6 h-6 ${
                          selectedRide === option.id ? "text-[#1E90FF]" : "text-muted-foreground"
                        }`} />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`font-semibold ${
                            selectedRide === option.id ? "text-[#1E90FF]" : "text-[#1A1A1A]"
                          }`}>
                            {option.name}
                          </span>
                          {option.tag && (
                            <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full font-medium">
                              {option.tag}
                            </span>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          {option.seats && (
                            <div className="flex items-center gap-1">
                              <User className="w-4 h-4" />
                              <span>{option.seats}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>{option.eta}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Right side: Price */}
                    <div className="text-right">
                      <span className={`text-lg font-bold ${
                        selectedRide === option.id ? "text-[#1E90FF]" : "text-[#1A1A1A]"
                      }`}>
                        {option.price}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
          
          {/* Action Section */}
          <div className="pt-4 border-t border-border">
            <p className="text-sm font-medium text-muted-foreground mb-3">Economy</p>
            
            <button className="text-[#1E90FF] text-sm font-medium hover:underline mb-4 block">
              Add Payment Method
            </button>
            
            {/* Request Button */}
            <Button
              onClick={() => {
                // Validate locations are available
                if (!currentLocation || !destination) {
                  alert("Please select both pickup and destination locations.");
                  return;
                }
                
                const selectedRideDetails = rideOptions.find(ride => ride.id === selectedRide) || rideOptions[0];
                
                // Create serializable ride data (remove React components)
                const serializableRideDetails = {
                  id: selectedRideDetails.id,
                  name: selectedRideDetails.name,
                  price: selectedRideDetails.price,
                  seats: selectedRideDetails.seats,
                  eta: selectedRideDetails.eta,
                  tag: selectedRideDetails.tag
                };
                
                // Navigate immediately to live-ride screen
                navigate("/live-ride", {
                  state: {
                    rideDetails: serializableRideDetails,
                    currentLocation,
                    destination
                  }
                });
              }}
              className="w-full h-12 bg-[#1E90FF] hover:bg-[#1E90FF]/90 text-white rounded-xl font-semibold transition-all duration-300"
              disabled={!currentLocation || !destination}
            >
              {currentLocation && destination ? "Book Ride" : "Location required"}
            </Button>
          </div>
        </div>
      </div>

      {/* Ride Request Overlay */}
      <RideRequestOverlay
        isVisible={showRequestOverlay}
        onCancel={() => setShowRequestOverlay(false)}
        selectedRide={rideOptions.find(ride => ride.id === selectedRide) || rideOptions[0]}
        currentLocation={currentLocation}
        destination={destination}
      />
    </div>
  );
};

export default BookingScreen;