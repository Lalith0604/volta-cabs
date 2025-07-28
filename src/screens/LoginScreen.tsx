import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const LoginScreen = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="text-center space-y-6">
        <h1 className="text-3xl font-bold text-foreground">Login Screen</h1>
        <div className="space-y-4">
          <Button 
            onClick={() => navigate("/home")}
            className="w-full"
          >
            Login (Skip to Home)
          </Button>
          <Button 
            variant="outline"
            onClick={() => navigate("/signup")}
            className="w-full"
          >
            Go to Signup
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;