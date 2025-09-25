import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Leaf, Users, Building2, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import LogoutButton from "@/components/LogoutButton";
import { useAuth } from "@/hooks/useAuth";

interface Section {
  section: string;
  count: number;
}

const sectionIcons = {
  "general": Building2,
  "governance": Users,
  "environmental": Leaf,
  "social": Users,
};

const sectionTitles = {
  "general": "General Information",
  "governance": "Governance",
  "environmental": "Environmental", 
  "social": "Social",
};

const Sections = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSections();
  }, []);

  const fetchSections = async () => {
    try {
      const { data, error } = await supabase
        .from('questions')
        .select('section')
        .order('section');

      if (error) throw error;

      if (!data || data.length === 0) {
        setSections([]);
        return;
      }

      // Count questions per section
      const sectionCounts = data.reduce((acc: Record<string, number>, question) => {
        acc[question.section] = (acc[question.section] || 0) + 1;
        return acc;
      }, {});

      const sectionsArray = Object.entries(sectionCounts).map(([section, count]) => ({
        section,
        count: count as number
      }));

      setSections(sectionsArray);
    } catch (error) {
      console.error('Error fetching sections:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSectionSelect = (sectionName: string) => {
    // Use the exact section name from database, not lowercase
    navigate(`/form/${encodeURIComponent(sectionName)}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-foreground">ESG Assessment</h1>
          <LogoutButton />
        </div>
        
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Select a section to begin your Environmental, Social, and Governance assessment. 
              Each section contains targeted questions to evaluate your organization's sustainability practices.
            </p>
          </div>

          <div className="grid md:grid-cols-1 lg:grid-cols-3 gap-6">
            {sections.map((section, index) => {
              const IconComponent = sectionIcons[section.section as keyof typeof sectionIcons] || Building2;
              const displayTitle = sectionTitles[section.section as keyof typeof sectionTitles] || section.section;
              const colors = [
                { color: "text-success", bgColor: "bg-success/10" },
                { color: "text-primary", bgColor: "bg-primary/10" },
                { color: "text-foreground", bgColor: "bg-muted" }
              ];
              const colorSet = colors[index % colors.length];
              
              return (
                <Card 
                  key={section.section}
                  className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-0 bg-card/80 backdrop-blur-sm hover:scale-105"
                  onClick={() => handleSectionSelect(section.section)}
                >
                  <CardHeader className="pb-4">
                    <div className={`w-16 h-16 ${colorSet.bgColor} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                      <IconComponent className={`w-8 h-8 ${colorSet.color}`} />
                    </div>
                    <CardTitle className="text-2xl flex items-center justify-between">
                      {displayTitle}
                      <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        {section.count} questions
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