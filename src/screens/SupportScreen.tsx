import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const SupportScreen = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="text-center space-y-6">
        <h1 className="text-3xl font-bold text-foreground">Support Screen</h1>
        <div className="space-y-4">
          <Button 
            variant="outline"
            onClick={() => navigate("/home")}
            className="w-full"
          >
            Back to Home
          </Button>
          <Button 
            variant="outline"
            onClick={() => navigate("/profile")}
            className="w-full"
          >
            Back to Profile
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SupportScreen;