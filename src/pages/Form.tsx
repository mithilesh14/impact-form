import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft, ChevronRight, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Sample questions for each section
const sectionQuestions = {
  environmental: [
    {
      id: 1,
      question: "What is your organization's total carbon footprint (CO2 equivalent tonnes)?",
      type: "number",
      category: "Carbon Emissions"
    },
    {
      id: 2,
      question: "Percentage of energy consumption from renewable sources",
      type: "percentage",
      category: "Energy Usage"
    },
    {
      id: 3,
      question: "Total water consumption (cubic meters)",
      type: "number",
      category: "Resource Usage"
    },
    {
      id: 4,
      question: "Describe your waste reduction initiatives and their impact",
      type: "text",
      category: "Waste Management"
    },
    {
      id: 5,
      question: "Number of environmental compliance violations in the reporting period",
      type: "number",
      category: "Compliance"
    }
  ],
  social: [
    {
      id: 1,
      question: "Total number of employees",
      type: "number",
      category: "Employment"
    },
    {
      id: 2,
      question: "Employee turnover rate (%)",
      type: "percentage",
      category: "Employee Retention"
    },
    {
      id: 3,
      question: "Hours of training provided per employee",
      type: "number",
      category: "Training & Development"
    },
    {
      id: 4,
      question: "Describe your diversity and inclusion initiatives",
      type: "text",
      category: "Diversity & Inclusion"
    },
    {
      id: 5,
      question: "Community investment amount ($)",
      type: "number",
      category: "Community Impact"
    }
  ],
  governance: [
    {
      id: 1,
      question: "Number of independent board members",
      type: "number",
      category: "Board Composition"
    },
    {
      id: 2,
      question: "Frequency of board meetings per year",
      type: "number",
      category: "Board Operations"
    },
    {
      id: 3,
      question: "Describe your anti-corruption policies and procedures",
      type: "text",
      category: "Ethics & Compliance"
    },
    {
      id: 4,
      question: "Number of ethics violations reported",
      type: "number",
      category: "Ethics Violations"
    },
    {
      id: 5,
      question: "Percentage of executives with variable compensation tied to ESG metrics",
      type: "percentage",
      category: "Executive Compensation"
    }
  ]
};

const Form = () => {
  const { sectionId } = useParams<{ sectionId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const questions = sectionQuestions[sectionId as keyof typeof sectionQuestions] || [];
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, { current: string; lastYear: string; comments: string }>>({});
  
  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  const handleAnswerChange = (field: 'current' | 'lastYear' | 'comments', value: string) => {
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

  const handleSave = () => {
    toast({
      title: "Progress saved",
      description: "Your responses have been saved successfully.",
    });
  };

  const handleSubmit = () => {
    toast({
      title: "Assessment completed",
      description: "Your ESG assessment has been submitted for review.",
    });
    navigate("/sections");
  };

  if (!currentQuestion) {
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

  const sectionTitle = sectionId?.charAt(0).toUpperCase() + sectionId?.slice(1);

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
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleSave}
                className="hover:bg-secondary/50"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Progress
              </Button>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Question Form */}
          <Card className="shadow-lg border-0 bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="text-sm text-primary font-medium mb-2">{currentQuestion.category}</div>
                  <CardTitle className="text-xl leading-relaxed">{currentQuestion.question}</CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="current">Current Year Value</Label>
                  {currentQuestion.type === 'text' ? (
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
                      type={currentQuestion.type === 'number' ? 'number' : 'text'}
                      placeholder={currentQuestion.type === 'percentage' ? 'e.g., 75%' : 'Enter value...'}
                      value={currentAnswer.current}
                      onChange={(e) => handleAnswerChange('current', e.target.value)}
                      className="h-11"
                    />
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="lastYear">Last Year Value</Label>
                  {currentQuestion.type === 'text' ? (
                    <Textarea
                      id="lastYear"
                      placeholder="Enter last year's response..."
                      value={currentAnswer.lastYear}
                      onChange={(e) => handleAnswerChange('lastYear', e.target.value)}
                      className="min-h-[100px]"
                    />
                  ) : (
                    <Input
                      id="lastYear"
                      type={currentQuestion.type === 'number' ? 'number' : 'text'}
                      placeholder={currentQuestion.type === 'percentage' ? 'e.g., 70%' : 'Enter last year value...'}
                      value={currentAnswer.lastYear}
                      onChange={(e) => handleAnswerChange('lastYear', e.target.value)}
                      className="h-11"
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