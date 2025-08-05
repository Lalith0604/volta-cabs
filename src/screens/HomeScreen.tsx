import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { DestinationAutocomplete } from "@/components/ui/destination-autocomplete";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "@/contexts/LocationContext";
import travelIllustration from "@/assets/travel-illustration.png";

const MAPBOX_TOKEN = "pk.eyJ1IjoibGFsaXRoMDYwNCIsImEiOiJjbWRqeGV0ZHEwb3k2Mm1zNTJud2ZzN2cxIn0.UQDq7MJMhKskfLD3B7li6Q";

const HomeScreen = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { currentLocation, destination, setCurrentLocation, setDestination } = useLocation();
  const [activeTab, setActiveTab] = useState("book");
  const [currentLocationDisplay, setCurrentLocationDisplay] = useState("");
  const [destinationDisplay, setDestinationDisplay] = useState("");
  const [isLocationLoading, setIsLocationLoading] = useState(false);

  // Reverse geocoding function
  const reverseGeocode = async (longitude: number, latitude: number): Promise<string> => {
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${MAPBOX_TOKEN}`
      );
      const data = await response.json();
      
      if (data.features && data.features.length > 0) {
        return data.features[0].place_name;
      }
      return `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
    } catch (error) {
      console.error('Reverse geocoding failed:', error);
      return `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
    }
  };

  const getCurrentLocation = async () => {
    if (!navigator.geolocation) {
      toast({
        title: "Geolocation not supported",
        description: "Your browser doesn't support geolocation. Please enter your location manually.",
        variant: "destructive",
      });
      return;
    }

    setIsLocationLoading(true);
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        try {
          const address = await reverseGeocode(longitude, latitude);
          setCurrentLocationDisplay(address);
          setCurrentLocation({
            coordinates: [longitude, latitude],
            address: address
          });
          
          toast({
            title: "Location detected",
            description: "Your current location has been found successfully.",
          });
        } catch (error) {
          console.error('Reverse geocoding failed:', error);
          const fallbackAddress = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
          setCurrentLocationDisplay(fallbackAddress);
          setCurrentLocation({
            coordinates: [longitude, latitude],
            address: fallbackAddress
          });
          
          toast({
            title: "Location found",
            description: "Using coordinates as we couldn't resolve the address.",
          });
        }
        
        setIsLocationLoading(false);
      },
      (error) => {
        setIsLocationLoading(false);
        let errorMessage = "Unable to retrieve your location.";
        let errorTitle = "Location Error";
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorTitle = "Location Permission Denied";
            errorMessage = "Please enable location permissions in your browser settings and try again.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information is unavailable. Please check your GPS settings.";
            break;
          case error.TIMEOUT:
            errorMessage = "Location request timed out. Please try again.";
            break;
        }
        
        toast({
          title: errorTitle,
          description: errorMessage,
          variant: "destructive",
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 15000, // Increased timeout
        maximumAge: 60000, // Cache for 1 minute
      }
    );
  };

  const handleDestinationSelect = (suggestion: any) => {
    setDestinationDisplay(suggestion.place_name);
    setDestination({
      coordinates: suggestion.coordinates,
      address: suggestion.place_name
    });
    
    toast({
      title: "Destination selected",
      description: `Selected: ${suggestion.place_name}`,
    });
  };

  const handleStartBooking = () => {
    if (!currentLocation) {
      toast({
        title: "Location Required",
        description: "Please allow location access or enter your current location.",
        variant: "destructive",
      });
      return;
    }
    
    if (!destination) {
      toast({
        title: "Destination Required", 
        description: "Please select a destination to continue.",
        variant: "destructive",
      });
      return;
    }
    
    navigate("/booking");
  };

  useEffect(() => {
    // Auto-detect location when component mounts
    getCurrentLocation();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-foreground">VOLTA CABS</h1>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate("/support")}
          >
            Support
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="book">Book Ride</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>

          <TabsContent value="book" className="space-y-6">
            <div className="flex flex-col lg:flex-row gap-8 items-start">
              {/* Form Section */}
              <div className="flex-1 space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentLocation" className="text-foreground font-medium">
                      Current Location
                    </Label>
                    <div className="relative">
                      <Input
                        id="currentLocation"
                        placeholder={isLocationLoading ? "Detecting your location..." : "Location not detected"}
                        value={currentLocationDisplay}
                        className="h-12 pr-10 bg-muted/50"
                        disabled={true}
                        readOnly
                      />
                      {isLocationLoading && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
                        </div>
                      )}
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={getCurrentLocation}
                      disabled={isLocationLoading}
                      className="text-xs w-full sm:w-auto"
                    >
                      {isLocationLoading ? "Detecting Location..." : "📍 Detect My Location"}
                    </Button>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="destination" className="text-foreground font-medium">
                    Destination
                  </Label>
                  <DestinationAutocomplete
                    value={destinationDisplay}
                    onChange={setDestinationDisplay}
                    onSelect={handleDestinationSelect}
                    placeholder="🔍 Search for destination..."
                    className="h-12"
                  />
                </div>
                </div>
                
              <Button 
                onClick={handleStartBooking}
                className="w-full h-12 text-base font-medium"
                size="lg"
                disabled={!currentLocation || !destination || isLocationLoading}
              >
                {!currentLocation ? "🔍 Detecting Location..." : 
                 !destination ? "📍 Select Destination" : 
                 "🚗 Start & See Price"}
                </Button>
              </div>
              
              {/* Image Section */}
              <div className="flex-1 flex justify-center lg:justify-end">
                <img 
                  src={travelIllustration} 
                  alt="Travel illustration" 
                  className="w-full max-w-md h-auto object-contain"
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="history" className="text-center space-y-4">
            <h2 className="text-xl font-semibold">History Tab</h2>
            <Button onClick={() => navigate("/ride-history")}>
              View Full History
            </Button>
          </TabsContent>

          <TabsContent value="profile" className="text-center space-y-4">
            <h2 className="text-xl font-semibold">Profile Tab</h2>
            <Button onClick={() => navigate("/profile")}>
              View Full Profile
            </Button>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default HomeScreen;