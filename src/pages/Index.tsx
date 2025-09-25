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
  Clock,
  ChevronRight
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
    <div className="min-h-screen bg-gradient-surface relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 -left-12 w-64 h-64 bg-primary/5 rounded-full animate-float"></div>
        <div className="absolute bottom-1/4 -right-12 w-80 h-80 bg-success/5 rounded-full animate-float" style={{animationDelay: '1.5s'}}></div>
      </div>

      <div className="container mx-auto px-6 py-12 relative z-10">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-16 animate-fade-in">
            <div>
              <h1 className="text-6xl font-bold mb-4 text-gradient animate-bounce-in">
                ESG Portal
              </h1>
              <p className="text-2xl text-muted-foreground font-light">
                Welcome back, <span className="font-medium text-foreground">{profile?.email}</span>
              </p>
            </div>
            <LogoutButton />
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            <div className="glass-card p-6 interactive-lift animate-fade-in">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-primary-light rounded-2xl">
                  <Target className="h-6 w-6 text-primary" />
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-foreground">{progressStats.totalQuestions}</div>
                  <div className="text-sm text-muted-foreground font-light">Questions</div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-sm font-medium text-foreground">Total Questions</div>
                <div className="text-xs text-muted-foreground">
                  Across {progressStats.sectionsCount} sections
                </div>
              </div>
            </div>

            <div className="glass-card p-6 interactive-lift animate-fade-in" style={{animationDelay: '0.1s'}}>
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-success-light rounded-2xl">
                  <CheckCircle2 className="h-6 w-6 text-success" />
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-foreground">{progressStats.answeredQuestions}</div>
                  <div className="text-sm text-muted-foreground font-light">Completed</div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-sm font-medium text-foreground">Answered Questions</div>
                <div className="text-xs text-success font-medium">
                  {progressStats.completionPercentage}% complete
                </div>
              </div>
            </div>

            <div className="glass-card p-6 interactive-lift animate-fade-in" style={{animationDelay: '0.2s'}}>
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-warning-light rounded-2xl">
                  <Clock className="h-6 w-6 text-warning" />
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-foreground">{progressStats.totalQuestions - progressStats.answeredQuestions}</div>
                  <div className="text-sm text-muted-foreground font-light">Remaining</div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-sm font-medium text-foreground">Questions Left</div>
                <div className="text-xs text-muted-foreground">
                  Keep going!
                </div>
              </div>
            </div>

            <div className="glass-card p-6 interactive-lift animate-fade-in" style={{animationDelay: '0.3s'}}>
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-primary-light rounded-2xl">
                  <Calendar className="h-6 w-6 text-primary" />
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-foreground">{new Date().getFullYear()}</div>
                  <div className="text-sm text-muted-foreground font-light">Reporting</div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-sm font-medium text-foreground">Current Year</div>
                <div className="text-xs text-muted-foreground">
                  Reporting period
                </div>
              </div>
            </div>
          </div>

          {/* Main Actions */}
          <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
            <div className="glass-card p-10 interactive-lift animate-fade-in" style={{animationDelay: '0.4s'}}>
              <div className="text-center space-y-6">
                <div className="p-6 bg-gradient-primary rounded-3xl inline-block animate-float">
                  <BarChart3 className="w-12 h-12 text-white" />
                </div>
                <div className="space-y-3">
                  <h3 className="text-3xl font-bold text-foreground">Start Assessment</h3>
                  <p className="text-lg text-muted-foreground font-light leading-relaxed">
                    Begin your comprehensive sustainability reporting. Evaluate your Environmental, Social, and Governance impact with our structured framework.
                  </p>
                </div>
                <Button 
                  onClick={() => navigate("/sections")}
                  className="w-full h-14 bg-gradient-primary text-white font-semibold text-lg rounded-2xl transition-all duration-200 hover:scale-[1.02] hover:shadow-xl"
                >
                  Continue Assessment
                  <ChevronRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </div>

            <div className="glass-card p-10 interactive-lift animate-fade-in" style={{animationDelay: '0.5s'}}>
              <div className="text-center space-y-6">
                <div className="p-6 bg-gradient-to-br from-success to-primary rounded-3xl inline-block animate-float" style={{animationDelay: '1s'}}>
                  <TrendingUp className="w-12 h-12 text-white" />
                </div>
                <div className="space-y-3">
                  <h3 className="text-3xl font-bold text-foreground">Progress Overview</h3>
                  <p className="text-lg text-muted-foreground font-light leading-relaxed">
                    Track your completion status and view detailed analytics of your ESG performance metrics and reporting progress.
                  </p>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-muted-foreground">Overall Progress</span>
                    <span className="text-2xl font-bold text-foreground">{progressStats.completionPercentage}%</span>
                  </div>
                  <div className="w-full bg-secondary/50 rounded-full h-3 overflow-hidden">
                    <div 
                      className="bg-gradient-primary h-full rounded-full transition-all duration-1000 shadow-glow" 
                      style={{ width: `${progressStats.completionPercentage}%` }}
                    />
                  </div>
                  <div className="text-sm text-muted-foreground font-light">
                    {progressStats.answeredQuestions} of {progressStats.totalQuestions} questions completed
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;