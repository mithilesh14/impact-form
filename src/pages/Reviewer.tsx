import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import LogoutButton from "@/components/LogoutButton";

const Reviewer = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-foreground">Reviewer Dashboard</h1>
          <LogoutButton />
        </div>
        
        <div className="max-w-2xl mx-auto">
          <Card className="shadow-lg border-0 bg-card/80 backdrop-blur-sm">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Reviewer Portal</CardTitle>
            </CardHeader>
            <CardContent className="text-center py-12">
              <h2 className="text-xl font-semibold text-muted-foreground mb-4">
                In Development
              </h2>
              <p className="text-muted-foreground">
                The reviewer functionality is currently under development and will be available soon.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Reviewer;