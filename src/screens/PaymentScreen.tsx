import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const PaymentScreen = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="text-center space-y-6">
        <h1 className="text-3xl font-bold text-foreground">Payment Screen</h1>
        <div className="space-y-4">
          <Button 
            onClick={() => navigate("/home")}
            className="w-full"
          >
            Complete Payment & Go Home
          </Button>
          <Button 
            variant="outline"
            onClick={() => navigate("/ride-details")}
            className="w-full"
          >
            Back to Ride Details
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PaymentScreen;