import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Leaf, Users, Building2, ChevronRight } from "lucide-react";

const sections = [
  {
    id: "environmental",
    title: "Environmental",
    description: "Climate impact, resource usage, and environmental sustainability metrics",
    icon: Leaf,
    color: "text-success",
    bgColor: "bg-success/10",
    questions: 25
  },
  {
    id: "social",
    title: "Social",
    description: "Employee welfare, community impact, and stakeholder relations",
    icon: Users,
    color: "text-primary",
    bgColor: "bg-primary/10",
    questions: 18
  },
  {
    id: "governance",
    title: "Governance",
    description: "Corporate governance, ethics, and risk management practices",
    icon: Building2,
    color: "text-foreground",
    bgColor: "bg-muted",
    questions: 22
  }
];

const Sections = () => {
  const navigate = useNavigate();

  const handleSectionSelect = (sectionId: string) => {
    navigate(`/form/${sectionId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-foreground mb-4">ESG Assessment</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Select a section to begin your Environmental, Social, and Governance assessment. 
              Each section contains targeted questions to evaluate your organization's sustainability practices.
            </p>
          </div>

          <div className="grid md:grid-cols-1 lg:grid-cols-3 gap-6">
            {sections.map((section) => {
              const IconComponent = section.icon;
              return (
                <Card 
                  key={section.id}
                  className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-0 bg-card/80 backdrop-blur-sm hover:scale-105"
                  onClick={() => handleSectionSelect(section.id)}
                >
                  <CardHeader className="pb-4">
                    <div className={`w-16 h-16 ${section.bgColor} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                      <IconComponent className={`w-8 h-8 ${section.color}`} />
                    </div>
                    <CardTitle className="text-2xl flex items-center justify-between">
                      {section.title}
                      <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    </CardTitle>
                    <CardDescription className="text-base leading-relaxed">
                      {section.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        {section.questions} questions
                      </span>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="text-primary hover:text-primary-hover hover:bg-primary/10"
                      >
                        Start Assessment
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="mt-12 text-center">
            <Button 
              variant="outline" 
              onClick={() => navigate("/")}
              className="hover:bg-secondary/50"
            >
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sections;