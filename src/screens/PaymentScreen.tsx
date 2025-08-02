import { useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Check } from "lucide-react";

const PaymentScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showConfirmation, setShowConfirmation] = useState(false);
  
  // Get ride details from navigation state
  const rideDetails = location.state?.rideDetails || {
    name: "Auto",
    price: "₹81.84",
  };

  const paymentMethods = [
    { id: "gpay", name: "Google Pay", icon: "💳" },
    { id: "phonepe", name: "PhonePe", icon: "📱" },
    { id: "card", name: "Pay with Card", icon: "💸" },
    { id: "qr", name: "QR Code", icon: "📱" },
  ];

  const handlePaymentSelect = (method: string) => {
    setShowConfirmation(true);
    
    // Auto-navigate to ride completed after 2 seconds
    setTimeout(() => {
      navigate("/ride-completed", {
        state: {
          rideDetails,
          currentLocation: location.state?.currentLocation,
          destination: location.state?.destination
        }
      });
    }, 2000);
  };

  const handleConfirmationDone = () => {
    navigate("/ride-completed", {
      state: {
        rideDetails,
        currentLocation: location.state?.currentLocation,
        destination: location.state?.destination
      }
    });
  };

  if (showConfirmation) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="bg-card rounded-2xl p-8 w-full max-w-sm text-center border border-border shadow-lg">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Payment Successful</h2>
          <p className="text-muted-foreground mb-6">Thank you! Your ride has been completed.</p>
          <Button 
            onClick={handleConfirmationDone}
            className="w-full"
          >
            Done
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border p-4">
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-semibold text-foreground">Complete Your Payment</h1>
        </div>
      </div>

      {/* Ride Summary */}
      <div className="p-4 bg-muted/30">
        <div className="bg-card rounded-xl p-4 border border-border">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-foreground">{rideDetails.name}</h3>
              <p className="text-sm text-muted-foreground">Ride fare</p>
            </div>
            <p className="text-xl font-bold text-primary">{rideDetails.price}</p>
          </div>
        </div>
      </div>

      {/* Payment Methods */}
      <div className="p-4 space-y-4">
        <h2 className="text-lg font-semibold text-foreground mb-4">Choose Payment Method</h2>
        
        {paymentMethods.map((method) => (
          <button
            key={method.id}
            onClick={() => handlePaymentSelect(method.id)}
            className="w-full bg-card border border-border rounded-xl p-4 flex items-center gap-3 hover:bg-accent transition-colors"
          >
            <span className="text-2xl">{method.icon}</span>
            <span className="font-medium text-foreground">{method.name}</span>
            {method.id === "qr" && (
              <div className="ml-auto w-8 h-8 bg-muted rounded border flex items-center justify-center">
                <span className="text-xs">QR</span>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default PaymentScreen;