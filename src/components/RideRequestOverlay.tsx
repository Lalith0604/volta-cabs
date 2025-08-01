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
  const [showConfirmation, setShowConfirmation] = useState(false);

  useEffect(() => {
    if (!isVisible) return;

    // Phase 0: Finding driver (0-5s)
    const timer1 = setTimeout(() => setAnimationPhase(1), 5000);
    
    // Phase 1: Driver found (5-5.5s)
    const timer2 = setTimeout(() => setAnimationPhase(2), 5500);
    
    // Phase 2: Driver arriving (5.5-15s) - Vehicle moves to pickup
    const timer3 = setTimeout(() => setAnimationPhase(3), 15000);
    
    // Phase 3: Show confirmation after full animation (after 15s)
    const timer4 = setTimeout(() => {
      setShowConfirmation(true);
    }, 15000);

    // Vehicle animation - moves toward pickup point over 9.5 seconds
    const vehicleAnimation = setInterval(() => {
      setVehiclePosition(prev => {
        // Vehicle starts moving in phase 2 (arriving) - 9.5 seconds to complete
        if (animationPhase >= 2) {
          if (prev >= 85) return 85; // Stop at pickup point
          return prev + 0.9; // Adjusted speed for 9.5 second duration
        }
        return prev;
      });
    }, 50);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
      clearInterval(vehicleAnimation);
    };
  }, [isVisible, navigate, selectedRide, currentLocation, destination, animationPhase, showConfirmation]);

  if (!isVisible) return null;

  const getAnimatedText = () => {
    if (animationPhase === 0) return "Finding a nearby driver";
    if (animationPhase === 1) return "Driver found! Getting ready";
    if (animationPhase === 2) return "Driver is arriving";
    return "Driver has arrived!";
  };

  const handleConfirmAndPay = () => {
    navigate("/payment", { 
      state: { 
        rideDetails: selectedRide,
        currentLocation,
        destination
      } 
    });
  };

  const RideIcon = selectedRide.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Blurred backdrop */}
      <div className={`absolute inset-0 backdrop-blur-sm transition-all duration-300 ${
        showConfirmation ? 'bg-background/90' : 'bg-background/80'
      }`} />
      
      {showConfirmation ? (
        // Confirmation box
        <div className="relative z-10 bg-card rounded-3xl p-8 mx-4 max-w-sm w-full border border-border shadow-2xl animate-fade-in">
          <div className="text-center space-y-6">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto">
              <span className="text-2xl">✅</span>
            </div>
            
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Driver Has Arrived</h2>
              <p className="text-muted-foreground">Your ride is ready. Please confirm to continue.</p>
            </div>

            <div className="space-y-3">
              <Button
                onClick={handleConfirmAndPay}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold"
              >
                Confirm & Go to Payment
              </Button>
              <Button
                variant="outline"
                onClick={onCancel}
                className="w-full"
              >
                Cancel Request
              </Button>
            </div>
          </div>
        </div>
      ) : (
        // Main overlay content (animation)
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
                  {animationPhase >= 3 ? "Ready to start!" : animationPhase >= 2 ? "Arriving now..." : "Arriving in 5-8 mins"}
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
              <span>Found</span>
              <span>Arriving</span>
              <span>Ready</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${Math.min((animationPhase + 1) * 25, 100)}%` }}
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
      )}
    </div>
  );
};

export default RideRequestOverlay;