import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const SignupScreen = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="text-center space-y-6">
        <h1 className="text-3xl font-bold text-foreground">Signup Screen</h1>
        <div className="space-y-4">
          <Button 
            onClick={() => navigate("/home")}
            className="w-full"
          >
            Signup (Skip to Home)
          </Button>
          <Button 
            variant="outline"
            onClick={() => navigate("/login")}
            className="w-full"
          >
            Back to Login
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SignupScreen;