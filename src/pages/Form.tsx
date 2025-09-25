import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft, ChevronRight, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import LogoutButton from "@/components/LogoutButton";

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

  const handleSave = async () => {
    if (!submissionId || !currentQuestion) return;

    try {
      const { error } = await supabase
        .from('responses')
        .upsert({
          submission_id: submissionId,
          question_id: currentQuestion.id,
          value_text: currentAnswer.current,
        });

      if (error) throw error;

      toast({
        title: "Progress saved",
        description: "Your responses have been saved successfully.",
      });
    } catch (error) {
      console.error('Error saving:', error);
      toast({
        title: "Error",
        description: "Failed to save progress.",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async () => {
    if (!submissionId) return;

    try {
      // Save all answers
      const responses = questions.map(question => ({
        submission_id: submissionId,
        question_id: question.id,
        value_text: answers[question.id]?.current || '',
      }));

      const { error } = await supabase
        .from('responses')
        .upsert(responses);

      if (error) throw error;

      // Update submission status
      const { error: updateError } = await supabase
        .from('submissions')
        .update({ 
          status: 'submitted',
          submitted_at: new Date().toISOString()
        })
        .eq('id', submissionId);

      if (updateError) throw updateError;

      toast({
        title: "Assessment completed",
        description: "Your ESG assessment has been submitted for review.",
      });
      navigate("/sections");
    } catch (error) {
      console.error('Error submitting:', error);
      toast({
        title: "Error",
        description: "Failed to submit assessment.",
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
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate("/sections")}
                className="hover:bg-secondary/50"
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Back to Sections
              </Button>
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-foreground">{sectionTitle} Assessment</h1>
                <p className="text-muted-foreground">Question {currentQuestionIndex + 1} of {questions.length}</p>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleSave}
                  className="hover:bg-secondary/50"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Progress
                </Button>
                <LogoutButton />
              </div>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Question Form */}
          <Card className="shadow-lg border-0 bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="text-sm text-primary font-medium mb-2">{currentQuestion.code}</div>
                  <CardTitle className="text-xl leading-relaxed">{currentQuestion.question_text}</CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="current">Current Year Value</Label>
                  {currentQuestion.input_type === 'textarea' ? (
                    <Textarea
                      id="current"
                      placeholder="Enter your response..."
                      value={currentAnswer.current}
                      onChange={(e) => handleAnswerChange('current', e.target.value)}
                      className="min-h-[100px]"
                    />
                  ) : (
                    <Input
                      id="current"
                      type={currentQuestion.input_type === 'number' ? 'number' : 'text'}
                      placeholder="Enter value..."
                      value={currentAnswer.current}
                      onChange={(e) => handleAnswerChange('current', e.target.value)}
                      className="h-11"
                    />
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="lastYear">Last Year Value</Label>
                  {currentQuestion.input_type === 'textarea' ? (
                    <Textarea
                      id="lastYear"
                      placeholder="Last year's value (auto-populated)"
                      value={currentAnswer.lastYear}
                      disabled
                      className="min-h-[100px] bg-muted"
                    />
                  ) : (
                    <Input
                      id="lastYear"
                      type={currentQuestion.input_type === 'number' ? 'number' : 'text'}
                      placeholder="Last year's value (auto-populated)"
                      value={currentAnswer.lastYear}
                      disabled
                      className="h-11 bg-muted"
                    />
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="comments">Additional Comments (Optional)</Label>
                <Textarea
                  id="comments"
                  placeholder="Provide context, methodology, or additional details..."
                  value={currentAnswer.comments}
                  onChange={(e) => handleAnswerChange('comments', e.target.value)}
                  className="min-h-[80px]"
                />
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentQuestionIndex === 0}
                  className="hover:bg-secondary/50"
                >
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Previous
                </Button>

                <div className="text-sm text-muted-foreground">
                  {currentQuestionIndex + 1} of {questions.length}
                </div>

                {currentQuestionIndex === questions.length - 1 ? (
                  <Button 
                    onClick={handleSubmit}
                    className="bg-success hover:bg-success/90 text-success-foreground"
                  >
                    Complete Assessment
                  </Button>
                ) : (
                  <Button
                    onClick={handleNext}
                    className="bg-primary hover:bg-primary-hover"
                  >
                    Next
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Form;