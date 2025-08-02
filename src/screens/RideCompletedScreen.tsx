import { useNavigate, useLocation as useRouterLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Star, MapPin, Clock } from "lucide-react";

const RideCompletedScreen = () => {
  const navigate = useNavigate();
  const routerLocation = useRouterLocation();
  
  // Get ride details from navigation state
  const rideDetails = routerLocation.state?.rideDetails || {
    id: "auto",
    name: "Auto",
    price: "₹81.84",
  };
  
  const currentLocation = routerLocation.state?.currentLocation;
  const destination = routerLocation.state?.destination;

  return (
    <div className="min-h-screen bg-[#F2F4F7] p-4 flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center space-y-6">
        {/* Success Icon */}
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
          <CheckCircle className="w-12 h-12 text-green-600" />
        </div>

        {/* Success Message */}
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[#1A1A1A] mb-2">
            Thank you for riding with us!
          </h1>
          <p className="text-muted-foreground">
            Your ride has been completed successfully.
          </p>
        </div>

        {/* Trip Summary */}
        <Card className="w-full max-w-md bg-background shadow-sm">
          <CardContent className="p-4">
            <h2 className="text-lg font-semibold text-[#1A1A1A] mb-4">Trip Summary</h2>
            
            <div className="space-y-3">
              {currentLocation && (
                <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                  <MapPin className="w-4 h-4 text-green-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-green-600 font-medium">Pickup</p>
                    <p className="text-sm text-gray-700">{currentLocation.address}</p>
                  </div>
                </div>
              )}
              
              {destination && (
                <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg">
                  <MapPin className="w-4 h-4 text-red-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-red-600 font-medium">Drop-off</p>
                    <p className="text-sm text-gray-700">{destination.address}</p>
                  </div>
                </div>
              )}
              
              <div className="flex items-center justify-between">
                <span className="text-[#1A1A1A]">Ride Type</span>
                <span className="font-medium text-[#1A1A1A]">{rideDetails.name}</span>
              </div>
              
              <div className="border-t border-border pt-3">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-[#1A1A1A]">Total Fare</span>
                  <span className="font-semibold text-[#1E90FF] text-lg">{rideDetails.price}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Rating Section */}
        <Card className="w-full max-w-md bg-background shadow-sm">
          <CardContent className="p-4">
            <h3 className="text-lg font-semibold text-[#1A1A1A] mb-3">Rate Your Ride</h3>
            
            <div className="flex justify-center gap-2 mb-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <button key={star} className="p-1">
                  <Star className="w-8 h-8 text-yellow-400 fill-yellow-400" />
                </button>
              ))}
            </div>
            
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">
                Thanks for riding with us!
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Actions */}
      <div className="space-y-3">
        <Button
          onClick={() => navigate("/home")}
          className="w-full h-12 bg-[#1E90FF] hover:bg-[#1E90FF]/90 text-white rounded-xl font-semibold"
        >
          Back to Home
        </Button>
        
        <Button
          variant="outline"
          onClick={() => navigate("/ride-history")}
          className="w-full h-12 rounded-xl"
        >
          View Ride History
        </Button>
      </div>
    </div>
  );
};

export default RideCompletedScreen;