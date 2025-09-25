import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft, ChevronRight, Save, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import LogoutButton from "@/components/LogoutButton";
import * as XLSX from 'xlsx';

const sectionTitles = {
  "general": "General Information",
  "governance": "Governance", 
  "environmental": "Environmental",
  "social": "Social",
};

interface Question {
  id: string;
  question_text: string;
  input_type: string;
  code: string;
}

const Form = () => {
  const { sectionId } = useParams<{ sectionId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { profile } = useAuth();
  
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, { current: string; lastYear: string; comments: string }>>({});
  const [loading, setLoading] = useState(true);
  const [submissionId, setSubmissionId] = useState<string | null>(null);

  useEffect(() => {
    if (profile?.company_id && sectionId) {
      fetchQuestionsAndSubmission();
    }
  }, [profile?.company_id, sectionId]);

  const fetchQuestionsAndSubmission = async () => {
    try {
      // Decode the section ID from URL
      const decodedSectionId = decodeURIComponent(sectionId || '');
      
      // Fetch questions for the section with timeout
      const questionsPromise = supabase
        .from('questions')
        .select('*')
        .eq('section', decodedSectionId)
        .order('code');

      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Questions query timeout')), 10000)
      );

      const { data: questionsData, error: questionsError } = await Promise.race([
        questionsPromise,
        timeoutPromise
      ]) as any;

      if (questionsError) throw questionsError;
      
      if (!questionsData || questionsData.length === 0) {
        console.log('No questions found for section:', decodedSectionId);
        setQuestions([]);
        setLoading(false);
        return;
      }
      
      setQuestions(questionsData || []);

      // Fetch or create submission FIRST
      const currentYear = new Date().getFullYear();
      let { data: submission, error: submissionError } = await supabase
        .from('submissions')
        .select('*')
        .eq('company_id', profile?.company_id)
        .eq('reporting_year', currentYear)
        .eq('status', 'draft')
        .maybeSingle();

      if (submissionError && submissionError.code !== 'PGRST116') {
        throw submissionError;
      }

      if (!submission) {
        // Create new submission for current year
        const { data: newSubmission, error: createError } = await supabase
          .from('submissions')
          .insert({
            company_id: profile?.company_id,
            reporting_year: currentYear,
            status: 'draft'
          })
          .select()
          .single();

        if (createError) throw createError;
        submission = newSubmission;
      }

      setSubmissionId(submission.id);

      // Now fetch existing responses for current year
      const { data: responsesData, error: responsesError } = await supabase
        .from('responses')
        .select('*')
        .eq('submission_id', submission.id);

      if (responsesError) throw responsesError;

      // Fetch historical data - query 2024 approved responses directly
      const { data: historyData, error: historyError } = await supabase
        .from('responses')
        .select(`
          value_text,
          question_id,
          submissions!inner(reporting_year, status, company_id)
        `)
        .eq('submissions.company_id', profile?.company_id)
        .eq('submissions.reporting_year', currentYear - 1)
        .eq('submissions.status', 'approved');

      if (historyError) {
        console.error('Error fetching history:', historyError);
      }

      // Map responses and history to answers
      const answersMap: Record<string, { current: string; lastYear: string; comments: string }> = {};
      
      questionsData?.forEach(question => {
        const response = responsesData?.find(r => r.question_id === question.id);
        const history = historyData?.find(h => h.question_id === question.id);
        
        answersMap[question.id] = {
          current: response?.value_text || '',
          lastYear: history?.value_text || '',
          comments: ''
        };
      });

      setAnswers(answersMap);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to load form data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const currentQuestion = questions[currentQuestionIndex];
  const progress = questions.length > 0 ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0;

  const handleAnswerChange = (field: 'current' | 'lastYear' | 'comments', value: string) => {
    if (!currentQuestion) return;
    
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: {
        ...prev[currentQuestion.id],
        [field]: value
      }
    }));
  };

  const currentAnswer = answers[currentQuestion?.id] || { current: '', lastYear: '', comments: '' };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const exportToExcel = () => {
    const exportData = questions.map(question => ({
      'Question Code': question.code,
      'Section': sectionId,
      'Question': question.question_text,
      'Response': answers[question.id]?.current || '',
      'Comments': answers[question.id]?.comments || '',
      'Input Type': question.input_type
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, sectionTitle || 'Assessment');
    XLSX.writeFile(wb, `${sectionTitle || 'Assessment'}_draft.xlsx`);

    toast({
      title: "Success",
      description: "Draft exported successfully",
    });
  };

  const handleSave = async () => {
    if (!submissionId) return;
    
    try {
      const responses = Object.entries(answers).map(([questionId, answer]) => ({
        submission_id: submissionId,
        question_id: questionId,
        value_text: answer.current
      }));

      for (const response of responses) {
        if (!response.value_text) continue;
        
        await supabase
          .from('responses')
          .upsert(response, {
            onConflict: 'submission_id,question_id'
          });
      }

      toast({
        title: "Success",
        description: "Progress saved successfully",
      });
    } catch (error) {
      console.error('Error saving:', error);
      toast({
        title: "Error",
        description: "Failed to save progress",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async () => {
    await handleSave();
    
    try {
      await supabase
        .from('submissions')
        .update({ 
          status: 'submitted',
          submitted_at: new Date().toISOString()
        })
        .eq('id', submissionId);

      toast({
        title: "Success",
        description: "Assessment submitted successfully",
      });
      
      navigate("/sections");
    } catch (error) {
      console.error('Error submitting:', error);
      toast({
        title: "Error", 
        description: "Failed to submit assessment",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!currentQuestion || questions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background flex items-center justify-center">
        <Card className="p-8">
          <CardContent className="text-center">
            <h2 className="text-2xl font-bold mb-4">Section not found</h2>
            <Button onClick={() => navigate("/sections")}>Back to Sections</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const sectionTitle = sectionTitles[sectionId as keyof typeof sectionTitles] || sectionId?.charAt(0).toUpperCase() + sectionId?.slice(1);

  return (
    <div className="min-h-screen bg-gradient-surface relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 -left-12 w-64 h-64 bg-primary/5 rounded-full animate-float"></div>
        <div className="absolute bottom-1/4 -right-12 w-80 h-80 bg-success/5 rounded-full animate-float" style={{animationDelay: '1.5s'}}></div>
      </div>

      <div className="container mx-auto px-6 py-12 relative z-10">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-12 animate-fade-in">
            <div className="flex items-center gap-6 mb-8">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate("/sections")}
                className="h-12 px-6 bg-white/50 hover:bg-white/70 border border-white/20 backdrop-blur-sm transition-all duration-200 hover:scale-105 rounded-2xl font-medium"
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Back to Sections
              </Button>
              <div className="flex-1">
                <h1 className="text-4xl font-bold text-gradient mb-2">{sectionTitle} Assessment</h1>
                <p className="text-xl text-muted-foreground font-light">Question {currentQuestionIndex + 1} of {questions.length}</p>
              </div>
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleSave}
                  className="h-12 px-6 bg-white/50 hover:bg-white/70 border border-white/20 backdrop-blur-sm transition-all duration-200 hover:scale-105 rounded-2xl font-medium"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Progress
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={exportToExcel}
                  className="h-12 px-6 bg-white/50 hover:bg-white/70 border border-white/20 backdrop-blur-sm transition-all duration-200 hover:scale-105 rounded-2xl font-medium"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export Draft
                </Button>
                <LogoutButton />
              </div>
            </div>
            <div className="w-full bg-secondary/30 rounded-full h-3 overflow-hidden">
              <div 
                className="bg-gradient-primary h-full rounded-full transition-all duration-1000 shadow-glow" 
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Question Form */}
          <div className="glass-card p-10 interactive-lift animate-scale-in">
            <div className="mb-8">
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <div className="inline-block px-4 py-2 bg-primary-light text-primary font-medium rounded-xl text-sm mb-4">
                    {currentQuestion.code}
                  </div>
                  <h2 className="text-2xl font-bold text-foreground leading-relaxed">{currentQuestion.question_text}</h2>
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <Label htmlFor="current" className="text-sm font-semibold text-foreground">Current Year Response</Label>
                  {currentQuestion.input_type === 'textarea' ? (
                    <Textarea
                      id="current"
                      placeholder="Enter your detailed response..."
                      value={currentAnswer.current}
                      onChange={(e) => handleAnswerChange('current', e.target.value)}
                      className="min-h-[120px] bg-white/50 border-white/20 backdrop-blur-sm transition-all duration-200 focus:bg-white/70 focus:border-primary/50 focus:shadow-glow rounded-2xl"
                    />
                  ) : (
                    <Input
                      id="current"
                      type={currentQuestion.input_type === 'number' ? 'number' : 'text'}
                      placeholder="Enter value..."
                      value={currentAnswer.current}
                      onChange={(e) => handleAnswerChange('current', e.target.value)}
                      className="h-12 bg-white/50 border-white/20 backdrop-blur-sm transition-all duration-200 focus:bg-white/70 focus:border-primary/50 focus:shadow-glow rounded-2xl"
                    />
                  )}
                </div>
                
                <div className="space-y-3">
                  <Label htmlFor="lastYear" className="text-sm font-semibold text-muted-foreground">Previous Year (Reference)</Label>
                  {currentQuestion.input_type === 'textarea' ? (
                    <Textarea
                      id="lastYear"
                      placeholder="Previous year's response"
                      value={currentAnswer.lastYear}
                      disabled
                      className="min-h-[120px] bg-muted/30 border-muted/50 text-muted-foreground rounded-2xl"
                    />
                  ) : (
                    <Input
                      id="lastYear"
                      type={currentQuestion.input_type === 'number' ? 'number' : 'text'}
                      placeholder="Previous year's value"
                      value={currentAnswer.lastYear}
                      disabled
                      className="h-12 bg-muted/30 border-muted/50 text-muted-foreground rounded-2xl"
                    />
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <Label htmlFor="comments" className="text-sm font-semibold text-foreground">Additional Context <span className="font-normal text-muted-foreground">(Optional)</span></Label>
                <Textarea
                  id="comments"
                  placeholder="Provide methodology, context, or additional details..."
                  value={currentAnswer.comments}
                  onChange={(e) => handleAnswerChange('comments', e.target.value)}
                  className="min-h-[100px] bg-white/50 border-white/20 backdrop-blur-sm transition-all duration-200 focus:bg-white/70 focus:border-primary/50 focus:shadow-glow rounded-2xl"
                />
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between pt-8 border-t border-white/20">
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentQuestionIndex === 0}
                  className="h-12 px-6 bg-white/50 hover:bg-white/70 border border-white/20 backdrop-blur-sm transition-all duration-200 hover:scale-105 rounded-2xl font-medium disabled:opacity-50"
                >
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Previous
                </Button>

                <div className="text-center">
                  <div className="text-lg font-semibold text-foreground">{currentQuestionIndex + 1} of {questions.length}</div>
                  <div className="text-sm text-muted-foreground font-light">Questions</div>
                </div>

                {currentQuestionIndex === questions.length - 1 ? (
                  <Button 
                    onClick={handleSubmit}
                    className="h-12 px-8 bg-gradient-to-r from-success to-primary text-white font-semibold rounded-2xl transition-all duration-200 hover:scale-[1.02] hover:shadow-xl"
                  >
                    Complete Assessment
                  </Button>
                ) : (
                  <Button
                    onClick={handleNext}
                    className="h-12 px-6 bg-gradient-primary text-white font-semibold rounded-2xl transition-all duration-200 hover:scale-[1.02] hover:shadow-xl"
                  >
                    Next Question
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Form;