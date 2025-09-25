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
      <div className="min-h-screen bg-gradient-surface flex items-center justify-center relative overflow-hidden">
        {/* Background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 -left-12 w-64 h-64 bg-primary/5 rounded-full animate-float"></div>
          <div className="absolute bottom-1/4 -right-12 w-80 h-80 bg-success/5 rounded-full animate-float" style={{animationDelay: '1.5s'}}></div>
        </div>
        
        <div className="glass-card p-12 animate-scale-in relative z-10">
          <div className="text-center space-y-6">
            <div className="w-16 h-16 mx-auto bg-gradient-primary rounded-full flex items-center justify-center animate-pulse-glow">
              <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Loading Assessment</h2>
              <p className="text-muted-foreground font-light">Preparing your sustainability questionnaire...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-surface relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 -left-16 w-96 h-96 bg-success/5 rounded-full animate-float"></div>
        <div className="absolute bottom-1/3 -right-20 w-80 h-80 bg-primary/5 rounded-full animate-float" style={{animationDelay: '2s'}}></div>
      </div>

      <div className="container mx-auto px-6 py-12 relative z-10">
        <div className="flex justify-between items-center mb-16 animate-fade-in">
          <div>
            <h1 className="text-5xl font-bold text-gradient mb-4 animate-bounce-in">
              ESG Assessment
            </h1>
            <p className="text-xl text-muted-foreground font-light">
              Choose your assessment focus area
            </p>
          </div>
          <LogoutButton />
        </div>
        
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 animate-fade-in" style={{animationDelay: '0.2s'}}>
            <p className="text-2xl text-muted-foreground max-w-4xl mx-auto font-light leading-relaxed">
              Select a section to begin your Environmental, Social, and Governance assessment. 
              Each section contains targeted questions to evaluate your organization's sustainability practices.
            </p>
          </div>

          <div className="grid md:grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
            {sections.map((section, index) => {
              const IconComponent = sectionIcons[section.section as keyof typeof sectionIcons] || Building2;
              const displayTitle = sectionTitles[section.section as keyof typeof sectionTitles] || section.section;
              const colors = [
                { color: "text-success", bgColor: "bg-success/10", gradientFrom: "from-success/10", gradientTo: "to-success/20" },
                { color: "text-primary", bgColor: "bg-primary/10", gradientFrom: "from-primary/10", gradientTo: "to-primary/20" },
                { color: "text-foreground", bgColor: "bg-muted", gradientFrom: "from-muted", gradientTo: "to-muted/80" }
              ];
              const colorSet = colors[index % colors.length];
              
              return (
                <div 
                  key={section.section}
                  className="glass-card p-8 interactive-lift cursor-pointer group animate-fade-in"
                  style={{animationDelay: `${0.3 + index * 0.1}s`}}
                  onClick={() => handleSectionSelect(section.section)}
                >
                  <div className="text-center space-y-6">
                    <div className={`w-20 h-20 ${colorSet.bgColor} rounded-3xl flex items-center justify-center mx-auto group-hover:scale-110 transition-all duration-300 animate-float`}>
                      <IconComponent className={`w-10 h-10 ${colorSet.color}`} />
                    </div>
                    
                    <div className="space-y-3">
                      <h3 className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors duration-200">
                        {displayTitle}
                      </h3>
                      <p className="text-muted-foreground font-light">
                        {section.count} comprehensive questions to assess your {displayTitle.toLowerCase()} practices
                      </p>
                    </div>

                    <div className="pt-4">
                      <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                        <span>Assessment Questions</span>
                        <span className="font-bold text-lg text-foreground">{section.count}</span>
                      </div>
                      
                      <Button 
                        className="w-full h-12 bg-gradient-primary text-white font-semibold rounded-2xl transition-all duration-200 hover:scale-[1.02] hover:shadow-xl group-hover:shadow-glow"
                      >
                        Start Assessment
                        <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="text-center animate-fade-in" style={{animationDelay: '0.8s'}}>
            <Button 
              variant="outline" 
              onClick={() => navigate("/")}
              className="h-12 px-8 bg-white/50 hover:bg-white/70 border-white/20 backdrop-blur-sm transition-all duration-200 hover:scale-105 rounded-2xl font-medium"
            >
              <ChevronRight className="w-4 h-4 mr-2 rotate-180" />
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sections;