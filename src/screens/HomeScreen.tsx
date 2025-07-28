import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const HomeScreen = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("book");

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-foreground">GoSwift</h1>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate("/support")}
          >
            Support
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="book">Book Ride</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>

          <TabsContent value="book" className="text-center space-y-4">
            <h2 className="text-xl font-semibold">Book Ride Tab</h2>
            <Button onClick={() => navigate("/booking")}>
              Start Booking
            </Button>
          </TabsContent>

          <TabsContent value="history" className="text-center space-y-4">
            <h2 className="text-xl font-semibold">History Tab</h2>
            <Button onClick={() => navigate("/ride-history")}>
              View Full History
            </Button>
          </TabsContent>

          <TabsContent value="profile" className="text-center space-y-4">
            <h2 className="text-xl font-semibold">Profile Tab</h2>
            <Button onClick={() => navigate("/profile")}>
              View Full Profile
            </Button>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default HomeScreen;