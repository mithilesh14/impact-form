import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Edit, Save, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface Company {
  id: string;
  name: string;
  code: string;
}

interface Submission {
  id: string;
  company_id: string;
  reporting_year: number;
  deadline: string | null;
  status: string;
  company: Company;
}

const DeadlineManager = () => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingDeadline, setEditingDeadline] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const { toast } = useToast();

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      const { data, error } = await supabase
        .from('submissions')
        .select(`
          id,
          company_id,
          reporting_year,
          deadline,
          status,
          company:companies (
            id,
            name,
            code
          )
        `)
        .order('reporting_year', { ascending: false });

      if (error) throw error;
      setSubmissions(data || []);
    } catch (error) {
      console.error('Error fetching submissions:', error);
      toast({
        title: "Error",
        description: "Failed to fetch submissions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateDeadline = async (submissionId: string, newDeadline: Date, companyId: string) => {
    try {
      const deadlineStr = newDeadline.toISOString().split('T')[0];
      
      const { error } = await supabase
        .from('submissions')
        .update({ deadline: deadlineStr })
        .eq('id', submissionId);

      if (error) throw error;

      // Send email notification
      try {
        const { error: emailError } = await supabase.functions.invoke('send-deadline-notification', {
          body: {
            companyId: companyId,
            deadline: deadlineStr
          }
        });

        if (emailError) {
          console.error('Error sending email notification:', emailError);
          toast({
            title: "Warning",
            description: "Deadline updated but email notification failed",
            variant: "default",
          });
        } else {
          toast({
            title: "Success", 
            description: "Deadline updated and notifications sent",
          });
        }
      } catch (emailError) {
        console.error('Error calling email function:', emailError);
        toast({
          title: "Success",
          description: "Deadline updated (email notification unavailable)",
        });
      }

      // Update local state
      setSubmissions(submissions.map(submission => 
        submission.id === submissionId 
          ? { ...submission, deadline: deadlineStr }
          : submission
      ));

      setEditingDeadline(null);
      setSelectedDate(undefined);
    } catch (error) {
      console.error('Error updating deadline:', error);
      toast({
        title: "Error",
        description: "Failed to update deadline",
        variant: "destructive",
      });
    }
  };

  const startEditing = (submissionId: string, currentDeadline: string | null) => {
    setEditingDeadline(submissionId);
    setSelectedDate(currentDeadline ? new Date(currentDeadline) : undefined);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Submission Deadlines</h2>
        <p className="text-muted-foreground">Manage submission deadlines for companies</p>
      </div>

      <div className="space-y-4">
        {submissions.map((submission) => (
          <Card key={submission.id} className="glass-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">{submission.company.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {submission.company.code} • {submission.reporting_year} • {submission.status}
                  </p>
                </div>
                
                <div className="flex items-center gap-4">
                  {editingDeadline === submission.id ? (
                    <div className="flex items-center gap-2">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-[240px] justify-start text-left font-normal",
                              !selectedDate && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={setSelectedDate}
                            initialFocus
                            className="p-3 pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
                      
                      <Button
                        size="sm"
                        onClick={() => selectedDate && updateDeadline(submission.id, selectedDate, submission.company_id)}
                        disabled={!selectedDate}
                      >
                        <Save className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingDeadline(null);
                          setSelectedDate(undefined);
                        }}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-medium">
                          {submission.deadline 
                            ? format(new Date(submission.deadline), "PPP")
                            : "No deadline set"
                          }
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => startEditing(submission.id, submission.deadline)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default DeadlineManager;