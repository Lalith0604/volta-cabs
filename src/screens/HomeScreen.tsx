import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import travelIllustration from "@/assets/travel-illustration.png";

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

          <TabsContent value="book" className="space-y-6">
            <div className="flex flex-col lg:flex-row gap-8 items-start">
              {/* Form Section */}
              <div className="flex-1 space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentLocation" className="text-foreground font-medium">
                      Current Location
                    </Label>
                    <Input
                      id="currentLocation"
                      placeholder="Enter your pickup location"
                      className="h-12"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="destination" className="text-foreground font-medium">
                      Destination
                    </Label>
                    <Input
                      id="destination"
                      placeholder="Where to?"
                      className="h-12"
                    />
                  </div>
                </div>
                
                <Button 
                  onClick={() => navigate("/booking")}
                  className="w-full h-12 text-base font-medium"
                  size="lg"
                >
                  Start & See Price
                </Button>
              </div>
              
              {/* Image Section */}
              <div className="flex-1 flex justify-center lg:justify-end">
                <img 
                  src={travelIllustration} 
                  alt="Travel illustration" 
                  className="w-full max-w-md h-auto object-contain"
                />
              </div>
            </div>
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