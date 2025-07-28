import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import travelIllustration from "@/assets/travel-illustration.png";

const HomeScreen = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("book");
  const [currentLocation, setCurrentLocation] = useState("");
  const [destination, setDestination] = useState("");
  const [isLocationLoading, setIsLocationLoading] = useState(false);

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast({
        title: "Geolocation not supported",
        description: "Your browser doesn't support geolocation.",
        variant: "destructive",
      });
      return;
    }

    setIsLocationLoading(true);
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        // For demo purposes, showing coordinates. In production, use reverse geocoding service
        setCurrentLocation(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
        setIsLocationLoading(false);
        toast({
          title: "Location found",
          description: "Your current location has been detected.",
        });
      },
      (error) => {
        setIsLocationLoading(false);
        let errorMessage = "Unable to retrieve your location.";
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Location access denied. Please enable location permissions.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information is unavailable.";
            break;
          case error.TIMEOUT:
            errorMessage = "Location request timed out.";
            break;
        }
        
        toast({
          title: "Location Error",
          description: errorMessage,
          variant: "destructive",
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes
      }
    );
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
          <h1 className="text-2xl font-bold text-foreground">GoSwift</h1>
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
                        placeholder="Detecting your location..."
                        value={currentLocation}
                        onChange={(e) => setCurrentLocation(e.target.value)}
                        className="h-12 pr-10"
                        disabled={isLocationLoading}
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
                      className="text-xs"
                    >
                      {isLocationLoading ? "Detecting..." : "Use Current Location"}
                    </Button>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="destination" className="text-foreground font-medium">
                      Destination
                    </Label>
                    <Input
                      id="destination"
                      placeholder="Where to?"
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                      className="h-12"
                    />
                  </div>
                </div>
                
                <Button 
                  onClick={() => navigate("/booking")}
                  className="w-full h-12 text-base font-medium"
                  size="lg"
                  disabled={!currentLocation || !destination}
                >
                  Start & See Price
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