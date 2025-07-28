import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const ProfileScreen = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="text-center space-y-6">
        <h1 className="text-3xl font-bold text-foreground">Profile Screen</h1>
        <div className="space-y-4">
          <Button 
            onClick={() => navigate("/support")}
            className="w-full"
          >
            Contact Support
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

export default ProfileScreen;