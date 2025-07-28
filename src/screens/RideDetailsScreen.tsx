import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const RideDetailsScreen = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="text-center space-y-6">
        <h1 className="text-3xl font-bold text-foreground">Ride Details Screen</h1>
        <div className="space-y-4">
          <Button 
            onClick={() => navigate("/payment")}
            className="w-full"
          >
            Proceed to Payment
          </Button>
          <Button 
            variant="outline"
            onClick={() => navigate("/booking")}
            className="w-full"
          >
            Back to Booking
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RideDetailsScreen;