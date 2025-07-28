import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const BookingScreen = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="text-center space-y-6">
        <h1 className="text-3xl font-bold text-foreground">Booking Screen</h1>
        <div className="space-y-4">
          <Button 
            onClick={() => navigate("/ride-details")}
            className="w-full"
          >
            Continue to Ride Details
          </Button>
          <Button 
            variant="outline"
            onClick={() => navigate("/home")}
            className="w-full"
          >
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BookingScreen;