import { useNavigate, useLocation as useRouterLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useLocation } from "@/contexts/LocationContext";
import { MapPin, Clock, ArrowRight, Car, Bike, Truck, Package } from "lucide-react";

const rideIcons = {
  auto: Truck,
  moto: Bike,
  "uber-go": Car,
  courier: Package,
};

const RideDetailsScreen = () => {
  const navigate = useNavigate();
  const routerLocation = useRouterLocation();
  const { currentLocation, destination } = useLocation();
  
  // Get ride details from navigation state
  const rideDetails = routerLocation.state?.rideDetails || {
    id: "auto",
    name: "Auto",
    price: "₹81.84",
    seats: 3,
    eta: "2 mins away - 10:56 AM"
  };

  const RideIcon = rideIcons[rideDetails.id as keyof typeof rideIcons] || Car;

  return (
    <div className="min-h-screen bg-[#F2F4F7] p-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Button
          variant="outline"
          onClick={() => navigate("/booking")}
          className="bg-background shadow-sm"
        >
          ← Back
        </Button>
        <h1 className="text-xl font-semibold text-[#1A1A1A]">Ride Details</h1>
      </div>

      <div className="space-y-4">
        {/* Trip Summary Card */}
        <Card className="bg-background shadow-sm">
          <CardContent className="p-4">
            <h2 className="text-lg font-semibold text-[#1A1A1A] mb-4">Trip Summary</h2>
            
            <div className="space-y-3">
              {/* From */}
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-[#1E90FF] mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">From</p>
                  <p className="font-medium text-[#1A1A1A]">
                    {currentLocation?.address || "Current Location"}
                  </p>
                </div>
              </div>
              
              {/* To */}
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-destructive mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">To</p>
                  <p className="font-medium text-[#1A1A1A]">
                    {destination?.address || "Destination"}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Distance & Time */}
            <div className="flex items-center gap-6 mt-4 pt-4 border-t border-border">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-[#1E90FF] rounded-full"></div>
                <span className="text-sm text-muted-foreground">6.2 km</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">18 min</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Selected Ride Details */}
        <Card className="bg-background shadow-sm">
          <CardContent className="p-4">
            <h2 className="text-lg font-semibold text-[#1A1A1A] mb-4">Selected Ride</h2>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                  <RideIcon className="w-6 h-6 text-[#1E90FF]" />
                </div>
                <div>
                  <h3 className="font-semibold text-[#1A1A1A]">{rideDetails.name}</h3>
                  <p className="text-sm text-muted-foreground">{rideDetails.eta}</p>
                  {rideDetails.seats && (
                    <p className="text-sm text-muted-foreground">
                      👤 {rideDetails.seats} seats
                    </p>
                  )}
                </div>
              </div>
              <div className="text-right">
                <span className="text-xl font-bold text-[#1E90FF]">{rideDetails.price}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Fare Breakdown */}
        <Card className="bg-background shadow-sm">
          <CardContent className="p-4">
            <h2 className="text-lg font-semibold text-[#1A1A1A] mb-4">Fare Summary</h2>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[#1A1A1A]">Base Fare</span>
                <span className="text-[#1A1A1A]">₹40.00</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#1A1A1A]">Distance Fare</span>
                <span className="text-[#1A1A1A]">₹41.84</span>
              </div>
              <div className="border-t border-border pt-3">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-[#1A1A1A]">Total</span>
                  <span className="font-semibold text-[#1E90FF] text-lg">{rideDetails.price}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Method */}
        <Card className="bg-background shadow-sm">
          <CardContent className="p-4">
            <button 
              onClick={() => navigate("/payment")}
              className="flex items-center justify-between w-full text-left"
            >
              <div>
                <p className="font-medium text-[#1A1A1A]">Pay via UPI</p>
                <p className="text-sm text-[#1E90FF]">Change</p>
              </div>
              <ArrowRight className="w-5 h-5 text-muted-foreground" />
            </button>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Action Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t border-border">
        <Button
          onClick={() => navigate("/payment", { state: { rideDetails } })}
          className="w-full h-12 bg-[#1E90FF] hover:bg-[#1E90FF]/90 text-white rounded-xl font-semibold"
        >
          Confirm & Pay {rideDetails.price}
        </Button>
      </div>

      {/* Bottom padding to account for fixed button */}
      <div className="h-20"></div>
    </div>
  );
};

export default RideDetailsScreen;