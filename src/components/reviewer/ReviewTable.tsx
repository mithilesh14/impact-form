import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Check, X, FileText, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ReviewResponse {
  id: string;
  value_text: string;
  review_status: string;
  question_id: string;
  question_text: string;
  question_code: string;
  section: string;
  input_type: string;
}

interface Submission {
  id: string;
  reporting_year: number;
  status: string;
  submitted_at: string;
  approved_at?: string;
}

interface ReviewTableProps {
  companyId: string;
  companyName: string;
  onBack: () => void;
}

const ReviewTable = ({ companyId, companyName, onBack }: ReviewTableProps) => {
  const [responses, setResponses] = useState<ReviewResponse[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [selectedSubmission, setSelectedSubmission] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [checkedResponses, setCheckedResponses] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  useEffect(() => {
    fetchSubmissions();
  }, [companyId]);

  useEffect(() => {
    if (selectedSubmission) {
      fetchResponses();
    }
  }, [selectedSubmission]);

  const fetchSubmissions = async () => {
    try {
      const { data, error } = await supabase
        .from('submissions')
        .select('*')
        .eq('company_id', companyId)
        .in('status', ['submitted', 'approved', 'rejected'])
        .order('reporting_year', { ascending: false });

      if (error) throw error;
      
      setSubmissions(data || []);
      if (data && data.length > 0) {
        setSelectedSubmission(data[0].id);
      }
    } catch (error) {
      console.error('Error fetching submissions:', error);
      toast({
        title: "Error",
        description: "Failed to fetch submissions",
        variant: "destructive",
      });
    }
  };

  const fetchResponses = async () => {
    if (!selectedSubmission) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('responses')
        .select(`
          id,
          value_text,
          review_status,
          question_id,
          questions (
            question_text,
            code,
            section,
            input_type
          )
        `)
        .eq('submission_id', selectedSubmission)
        .order('questions(section)', { ascending: true });

      if (error) throw error;

      const formattedResponses = data?.map(response => ({
        id: response.id,
        value_text: response.value_text || '',
        review_status: response.review_status || 'pending',
        question_id: response.question_id,
        question_text: (response.questions as any)?.question_text || '',
        question_code: (response.questions as any)?.code || '',
        section: (response.questions as any)?.section || '',
        input_type: (response.questions as any)?.input_type || ''
      })) || [];

      setResponses(formattedResponses);
      
      // Set already approved responses as checked
      const approvedIds = new Set(
        formattedResponses
          .filter(r => r.review_status === 'approved')
          .map(r => r.id)
      );
      setCheckedResponses(approvedIds);
    } catch (error) {
      console.error('Error fetching responses:', error);
      toast({
        title: "Error",
        description: "Failed to fetch responses",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResponseCheck = (responseId: string, checked: boolean) => {
    const newChecked = new Set(checkedResponses);
    if (checked) {
      newChecked.add(responseId);
    } else {
      newChecked.delete(responseId);
    }
    setCheckedResponses(newChecked);
  };

  const saveReviewStatus = async () => {
    try {
      // Get current user first
      const { data: { user } } = await supabase.auth.getUser();
      
      // Update all responses with their review status
      const updates = responses.map(response => ({
        id: response.id,
        review_status: checkedResponses.has(response.id) ? 'approved' : 'pending',
        reviewed_at: new Date().toISOString(),
        reviewed_by: user?.id
      }));

      for (const update of updates) {
        const { error } = await supabase
          .from('responses')
          .update({
            review_status: update.review_status,
            reviewed_at: update.reviewed_at,
            reviewed_by: update.reviewed_by
          })
          .eq('id', update.id);

        if (error) throw error;
      }

      toast({
        title: "Success",
        description: "Review status saved successfully",
      });

      // Refresh the data
      fetchResponses();
    } catch (error) {
      console.error('Error saving review status:', error);
      toast({
        title: "Error",
        description: "Failed to save review status",
        variant: "destructive",
      });
    }
  };

  const approveSubmission = async () => {
    if (!selectedSubmission) return;

    try {
      const { error } = await supabase
        .from('submissions')
        .update({
          status: 'approved',
          approved_at: new Date().toISOString()
        })
        .eq('id', selectedSubmission);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Submission approved successfully",
      });

      fetchSubmissions();
    } catch (error) {
      console.error('Error approving submission:', error);
      toast({
        title: "Error",
        description: "Failed to approve submission",
        variant: "destructive",
      });
    }
  };

  const rejectSubmission = async () => {
    if (!selectedSubmission) return;

    try {
      const { error } = await supabase
        .from('submissions')
        .update({
          status: 'rejected'
        })
        .eq('id', selectedSubmission);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Submission rejected",
      });

      fetchSubmissions();
    } catch (error) {
      console.error('Error rejecting submission:', error);
      toast({
        title: "Error",
        description: "Failed to reject submission",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-success/20 text-success border-success/30">Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-destructive/20 text-destructive border-destructive/30">Rejected</Badge>;
      default:
        return <Badge className="bg-warning/20 text-warning border-warning/30">Submitted</Badge>;
    }
  };

  const currentSubmission = submissions.find(s => s.id === selectedSubmission);
  const groupedResponses = responses.reduce((acc, response) => {
    if (!acc[response.section]) {
      acc[response.section] = [];
    }
    acc[response.section].push(response);
    return acc;
  }, {} as Record<string, ReviewResponse[]>);

  return (
    <div className="min-h-screen bg-gradient-surface relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 -left-16 w-96 h-96 bg-success/5 rounded-full"></div>
        <div className="absolute bottom-1/3 -right-20 w-80 h-80 bg-primary/5 rounded-full"></div>
      </div>

      <div className="container mx-auto px-6 py-12 relative z-10">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={onBack}
              className="bg-white/50 border-white/20 backdrop-blur-sm hover:bg-white/70"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Companies
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gradient">{companyName}</h1>
              <p className="text-muted-foreground">ESG Assessment Review</p>
            </div>
          </div>

          {currentSubmission && (
            <div className="flex items-center gap-4">
              {getStatusBadge(currentSubmission.status)}
              <div className="text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Year: {currentSubmission.reporting_year}
                </div>
              </div>
            </div>
          )}
        </div>

        {submissions.length > 1 && (
          <Card className="glass-card mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Select Submission</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 flex-wrap">
                {submissions.map((submission) => (
                  <Button
                    key={submission.id}
                    variant={selectedSubmission === submission.id ? "default" : "outline"}
                    onClick={() => setSelectedSubmission(submission.id)}
                    className={selectedSubmission === submission.id ? "bg-gradient-primary text-white" : ""}
                  >
                    {submission.reporting_year} {getStatusBadge(submission.status)}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedResponses).map(([section, sectionResponses]) => (
              <Card key={section} className="glass-card">
                <CardHeader>
                  <CardTitle className="capitalize flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    {section} ({sectionResponses.length} questions)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">✓</TableHead>
                        <TableHead className="w-24">Code</TableHead>
                        <TableHead>Question</TableHead>
                        <TableHead>Response</TableHead>
                        <TableHead className="w-24">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sectionResponses.map((response) => (
                        <TableRow key={response.id} className="hover:bg-muted/30">
                          <TableCell>
                            <Checkbox
                              checked={checkedResponses.has(response.id)}
                              onCheckedChange={(checked) => 
                                handleResponseCheck(response.id, checked as boolean)
                              }
                            />
                          </TableCell>
                          <TableCell className="font-mono text-sm">
                            {response.question_code}
                          </TableCell>
                          <TableCell className="font-medium">
                            {response.question_text}
                          </TableCell>
                          <TableCell>
                            <div className="max-w-md truncate" title={response.value_text}>
                              {response.value_text || <span className="text-muted-foreground italic">No response</span>}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={response.review_status === 'approved' ? 'default' : 'secondary'}
                              className={
                                response.review_status === 'approved' 
                                  ? 'bg-success/20 text-success border-success/30' 
                                  : 'bg-muted text-muted-foreground'
                              }
                            >
                              {response.review_status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            ))}

            <div className="flex justify-center gap-4">
              <Button onClick={saveReviewStatus} className="bg-gradient-primary text-white">
                Save Review Status
              </Button>
              
              {currentSubmission?.status === 'submitted' && (
                <>
                  <Button onClick={approveSubmission} className="bg-success text-white">
                    <Check className="w-4 h-4 mr-2" />
                    Approve Submission
                  </Button>
                  <Button onClick={rejectSubmission} variant="destructive">
                    <X className="w-4 h-4 mr-2" />
                    Reject Submission
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewTable;