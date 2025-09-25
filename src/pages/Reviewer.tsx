import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import LogoutButton from "@/components/LogoutButton";
import { 
  ClipboardCheck, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Building2,
  FileText,
  Calendar
} from "lucide-react";

interface Submission {
  id: string;
  reporting_year: number;
  status: string;
  created_at: string;
  submitted_at: string | null;
  approved_at: string | null;
  companies: {
    name: string;
    code: string;
  };
}

const Reviewer = () => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("pending");
  const { toast } = useToast();
  const { profile } = useAuth();

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      const { data, error } = await supabase
        .from('submissions')
        .select(`
          id,
          reporting_year,
          status,
          created_at,
          submitted_at,
          approved_at,
          companies (
            name,
            code
          )
        `)
        .order('submitted_at', { ascending: false });

      if (error) throw error;
      setSubmissions(data || []);
    } catch (error) {
      console.error('Error fetching submissions:', error);
      toast({
        title: "Error",
        description: "Failed to load submissions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (submissionId: string, newStatus: string) => {
    try {
      const updateData: any = { status: newStatus };
      if (newStatus === 'approved') {
        updateData.approved_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('submissions')
        .update(updateData)
        .eq('id', submissionId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Submission ${newStatus} successfully`,
      });

      fetchSubmissions();
    } catch (error) {
      console.error('Error updating submission:', error);
      toast({
        title: "Error",
        description: "Failed to update submission",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Draft</Badge>;
      case 'submitted':
        return <Badge variant="outline"><ClipboardCheck className="w-3 h-3 mr-1" />Submitted</Badge>;
      case 'approved':
        return <Badge variant="default"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const filterSubmissions = (status: string) => {
    switch (status) {
      case 'pending':
        return submissions.filter(s => s.status === 'submitted');
      case 'approved':
        return submissions.filter(s => s.status === 'approved');
      case 'rejected':
        return submissions.filter(s => s.status === 'rejected');
      default:
        return submissions;
    }
  };

  const getStats = () => {
    const pending = submissions.filter(s => s.status === 'submitted').length;
    const approved = submissions.filter(s => s.status === 'approved').length;
    const rejected = submissions.filter(s => s.status === 'rejected').length;
    const total = submissions.length;

    return { pending, approved, rejected, total };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const stats = getStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-foreground">Reviewer Dashboard</h1>
          <LogoutButton />
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="shadow-lg border-0 bg-card/80 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-card/80 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-card/80 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approved</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-card/80 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rejected</CardTitle>
              <XCircle className="h-4 w-4 text-muted-foregreen" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
            </CardContent>
          </Card>
        </div>

        {/* Submissions Tabs */}
        <Card className="shadow-lg border-0 bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-2xl">Submission Reviews</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="pending">
                  Pending ({stats.pending})
                </TabsTrigger>
                <TabsTrigger value="approved">
                  Approved ({stats.approved})
                </TabsTrigger>
                <TabsTrigger value="rejected">
                  Rejected ({stats.rejected})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="pending" className="space-y-4">
                {filterSubmissions('pending').length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No pending submissions to review
                  </p>
                ) : (
                  filterSubmissions('pending').map((submission) => (
                    <Card key={submission.id} className="border border-border/50">
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                          <div className="space-y-2">
                            <div className="flex items-center gap-3">
                              <Building2 className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">{submission.companies.name}</span>
                              <span className="text-sm text-muted-foreground">({submission.companies.code})</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-muted-foreground">
                              <Calendar className="h-4 w-4" />
                              <span>Reporting Year: {submission.reporting_year}</span>
                              <span>•</span>
                              <span>Submitted: {new Date(submission.submitted_at!).toLocaleDateString()}</span>
                            </div>
                            {getStatusBadge(submission.status)}
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleStatusUpdate(submission.id, 'rejected')}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleStatusUpdate(submission.id, 'approved')}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>

              <TabsContent value="approved" className="space-y-4">
                {filterSubmissions('approved').map((submission) => (
                  <Card key={submission.id} className="border border-border/50">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-3">
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{submission.companies.name}</span>
                            <span className="text-sm text-muted-foreground">({submission.companies.code})</span>
                          </div>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            <span>Reporting Year: {submission.reporting_year}</span>
                            <span>•</span>
                            <span>Approved: {new Date(submission.approved_at!).toLocaleDateString()}</span>
                          </div>
                          {getStatusBadge(submission.status)}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="rejected" className="space-y-4">
                {filterSubmissions('rejected').map((submission) => (
                  <Card key={submission.id} className="border border-border/50">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-3">
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{submission.companies.name}</span>
                            <span className="text-sm text-muted-foreground">({submission.companies.code})</span>
                          </div>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            <span>Reporting Year: {submission.reporting_year}</span>
                          </div>
                          {getStatusBadge(submission.status)}
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStatusUpdate(submission.id, 'submitted')}
                        >
                          Review Again
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Reviewer;