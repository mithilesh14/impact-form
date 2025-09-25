import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Target,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Clock
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import LogoutButton from "@/components/LogoutButton";

const Index = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [progressStats, setProgressStats] = useState({
    totalQuestions: 0,
    answeredQuestions: 0,
    completionPercentage: 0,
    sectionsCount: 0
  });
  
  useEffect(() => {
    if (profile?.company_id) {
      fetchProgressStats();
    }
  }, [profile?.company_id]);

  // Refetch progress stats when the page becomes visible (e.g., when navigating back)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && profile?.company_id) {
        fetchProgressStats();
      }
    };

    const handleFocus = () => {
      if (profile?.company_id) {
        fetchProgressStats();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [profile?.company_id]);

  const fetchProgressStats = async () => {
    try {
      // Get total questions count
      const { data: questions, error: questionsError } = await supabase
        .from('questions')
        .select('id, section');

      if (questionsError) throw questionsError;

      // Get current year submission and responses
      const currentYear = new Date().getFullYear();
      const { data: submission } = await supabase
        .from('submissions')
        .select('id')
        .eq('company_id', profile?.company_id)
        .eq('reporting_year', currentYear)
        .eq('status', 'draft')
        .single();

      let answeredCount = 0;
      if (submission) {
        const { data: responses } = await supabase
          .from('responses')
          .select('question_id')
          .eq('submission_id', submission.id)
          .not('value_text', 'is', null)
          .neq('value_text', '');

        answeredCount = responses?.length || 0;
      }

      const totalQuestions = questions?.length || 0;
      const sectionsCount = new Set(questions?.map(q => q.section)).size;
      
      setProgressStats({
        totalQuestions,
        answeredQuestions: answeredCount,
        completionPercentage: totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0,
        sectionsCount
      });
    } catch (error) {
      console.error('Error fetching progress stats:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-5xl font-bold text-foreground mb-4 bg-gradient-to-r from-primary via-primary-hover to-primary bg-clip-text text-transparent">
                ESG Portal
              </h1>
              <p className="text-xl text-muted-foreground">
                Welcome back, {profile?.email}
              </p>
            </div>
            <LogoutButton />
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-card/80 backdrop-blur-sm hover:scale-105">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Questions
                </CardTitle>
                <Target className="h-5 w-5 text-primary group-hover:scale-110 transition-transform duration-300" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground mb-1">{progressStats.totalQuestions}</div>
                <div className="flex items-center">
                  <Badge variant="secondary" className="text-xs">
                    {progressStats.sectionsCount} sections
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-card/80 backdrop-blur-sm hover:scale-105">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Answered Questions
                </CardTitle>
                <CheckCircle2 className="h-5 w-5 text-success group-hover:scale-110 transition-transform duration-300" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground mb-1">{progressStats.answeredQuestions}</div>
                <div className="flex items-center">
                  <Badge variant="default" className="text-xs bg-success">
                    {progressStats.completionPercentage}% complete
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-card/80 backdrop-blur-sm hover:scale-105">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Remaining
                </CardTitle>
                <Clock className="h-5 w-5 text-warning group-hover:scale-110 transition-transform duration-300" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground mb-1">{progressStats.totalQuestions - progressStats.answeredQuestions}</div>
                <div className="flex items-center">
                  <Badge variant="secondary" className="text-xs">
                    Questions left
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-card/80 backdrop-blur-sm hover:scale-105">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Current Year
                </CardTitle>
                <Calendar className="h-5 w-5 text-primary group-hover:scale-110 transition-transform duration-300" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground mb-1">{new Date().getFullYear()}</div>
                <div className="flex items-center">
                  <Badge variant="secondary" className="text-xs">
                    Reporting period
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Actions */}
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-card/80 backdrop-blur-sm">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <BarChart3 className="w-8 h-8 text-primary" />
                </div>
                <CardTitle className="text-2xl">Start ESG Assessment</CardTitle>
                <CardDescription className="text-base leading-relaxed">
                  Begin your comprehensive sustainability reporting. Evaluate your Environmental, Social, and Governance impact.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center space-y-3">
                  <Button 
                    onClick={() => navigate("/sections")}
                    className="w-full bg-primary hover:bg-primary-hover transition-colors"
                  >
                    Continue Assessment
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-card/80 backdrop-blur-sm">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-success/10 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <TrendingUp className="w-8 h-8 text-success" />
                </div>
                <CardTitle className="text-2xl">Progress Overview</CardTitle>
                <CardDescription className="text-base leading-relaxed">
                  Track your completion status and view detailed analytics of your ESG performance.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Completion</span>
                    <span className="font-medium">{progressStats.completionPercentage}%</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-500" 
                      style={{ width: `${progressStats.completionPercentage}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;