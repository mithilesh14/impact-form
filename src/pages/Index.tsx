import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { BarChart3, TrendingUp, Users, Leaf } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-foreground mb-4">ESG Portal</h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Comprehensive Environmental, Social, and Governance reporting platform for sustainable business practices
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <Card className="border-0 bg-card/80 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Assessments</CardTitle>
                <BarChart3 className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">3</div>
                <p className="text-xs text-muted-foreground">Environmental, Social, Governance</p>
              </CardContent>
            </Card>
            <Card className="border-0 bg-card/80 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
                <TrendingUp className="h-4 w-4 text-success" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0%</div>
                <p className="text-xs text-muted-foreground">Start your first assessment</p>
              </CardContent>
            </Card>
            <Card className="border-0 bg-card/80 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Questions</CardTitle>
                <Users className="h-4 w-4 text-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">65</div>
                <p className="text-xs text-muted-foreground">Across all sections</p>
              </CardContent>
            </Card>
          </div>

          {/* Main Actions */}
          <div className="text-center space-y-6">
            <Card className="max-w-2xl mx-auto border-0 bg-card/80 backdrop-blur-sm shadow-lg">
              <CardHeader>
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Leaf className="w-8 h-8 text-primary" />
                </div>
                <CardTitle className="text-2xl">Ready to Start Your ESG Assessment?</CardTitle>
                <CardDescription className="text-base">
                  Begin your comprehensive sustainability reporting journey. Select from Environmental, 
                  Social, and Governance sections to evaluate your organization's impact.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  size="lg"
                  className="w-full h-12 bg-primary hover:bg-primary-hover text-lg"
                  onClick={() => navigate("/sections")}
                >
                  Start Assessment
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  className="w-full h-12 hover:bg-secondary/50"
                  onClick={() => navigate("/login")}
                >
                  Go to Login
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
