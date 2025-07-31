import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Car, Bike, Truck, Package } from "lucide-react";

interface RideRequestOverlayProps {
  isVisible: boolean;
  onCancel: () => void;
  selectedRide: {
    id: string;
    name: string;
    price: string;
    icon: any;
  };
  currentLocation?: {
    address: string;
    coordinates: [number, number];
  };
  destination?: {
    address: string;
    coordinates: [number, number];
  };
}

const RideRequestOverlay = ({ 
  isVisible, 
  onCancel, 
  selectedRide,
  currentLocation,
  destination 
}: RideRequestOverlayProps) => {
  const navigate = useNavigate();
  const [animationPhase, setAnimationPhase] = useState(0);
  const [vehiclePosition, setVehiclePosition] = useState(0);

  useEffect(() => {
    if (!isVisible) return;

    const timer1 = setTimeout(() => setAnimationPhase(1), 1500);
    const timer2 = setTimeout(() => setAnimationPhase(2), 3000);
    const timer3 = setTimeout(() => {
      navigate("/ride-details", { 
        state: { 
          rideDetails: selectedRide,
          currentLocation,
          destination
        } 
      });
    }, 5000);

    // Vehicle animation
    const vehicleAnimation = setInterval(() => {
      setVehiclePosition(prev => {
        if (prev >= 100) return 0;
        return prev + 2;
      });
    }, 100);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearInterval(vehicleAnimation);
    };
  }, [isVisible, navigate, selectedRide, currentLocation, destination]);

  if (!isVisible) return null;

  const getAnimatedText = () => {
    if (animationPhase === 0) return "Finding a nearby driver";
    if (animationPhase === 1) return "Driver found! Getting ready";
    return "Your ride is on the way";
  };

  const RideIcon = selectedRide.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Blurred backdrop */}
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
      
      {/* Main overlay content */}
      <div className="relative z-10 bg-background/95 backdrop-blur-md rounded-3xl p-8 mx-4 max-w-sm w-full border border-border/50 shadow-2xl">
        {/* Vehicle animation area */}
        <div className="relative h-32 mb-8 overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5">
          {/* Route line */}
          <div className="absolute top-1/2 left-4 right-4 h-1 bg-primary/30 rounded-full transform -translate-y-1/2" />
          
          {/* Pickup location (user) */}
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
            <div className="w-4 h-4 bg-green-500 rounded-full animate-pulse" />
            <div className="w-8 h-8 bg-green-500/20 rounded-full absolute -top-2 -left-2 animate-ping" />
          </div>
          
          {/* Moving vehicle */}
          <div 
            className="absolute top-1/2 transform -translate-y-1/2 transition-all duration-300 ease-out"
            style={{ left: `${Math.min(vehiclePosition, 85)}%` }}
          >
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-lg">
              <RideIcon className="w-5 h-5 text-white" />
            </div>
          </div>
          
          {/* Destination */}
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
            <div className="w-4 h-4 bg-red-500 rounded-full" />
          </div>
        </div>

        {/* Status text */}
        <div className="text-center mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-2">
            {getAnimatedText()}
            <span className="inline-block w-4">
              <span className="animate-[bounce_1s_infinite] inline-block">.</span>
              <span className="animate-[bounce_1s_infinite_0.1s] inline-block">.</span>
              <span className="animate-[bounce_1s_infinite_0.2s] inline-block">.</span>
            </span>
          </h2>
          
          <div className="flex items-center justify-center gap-3 p-3 bg-muted/50 rounded-lg">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <RideIcon className="w-5 h-5 text-white" />
            </div>
            <div className="text-left">
              <p className="font-medium text-foreground">{selectedRide.name}</p>
              <p className="text-sm text-muted-foreground">
                Arriving in 2-3 mins
              </p>
            </div>
            <div className="ml-auto">
              <p className="font-bold text-primary">{selectedRide.price}</p>
            </div>
          </div>
        </div>

        {/* Progress indicator */}
        <div className="mb-6">
          <div className="flex justify-between text-xs text-muted-foreground mb-2">
            <span>Searching</span>
            <span>Confirmed</span>
            <span>Arriving</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${Math.min((animationPhase + 1) * 33.33, 100)}%` }}
            />
          </div>
        </div>

        {/* Cancel button */}
        <Button
          variant="outline"
          onClick={onCancel}
          className="w-full"
        >
          Cancel Request
        </Button>
      </div>
    </div>
  );
};

export default RideRequestOverlay;