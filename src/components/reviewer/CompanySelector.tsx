import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, FileText, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Company {
  id: string;
  name: string;
  code: string;
  region?: string;
  sector?: string;
}

interface CompanySelectorProps {
  onCompanySelect: (companyId: string, companyName: string) => void;
}

const CompanySelector = ({ onCompanySelect }: CompanySelectorProps) => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [submissionCounts, setSubmissionCounts] = useState<Record<string, number>>({});
  const { toast } = useToast();

  useEffect(() => {
    fetchCompaniesWithSubmissions();
  }, []);

  const fetchCompaniesWithSubmissions = async () => {
    try {
      // Fetch companies
      const { data: companiesData, error: companiesError } = await supabase
        .from('companies')
        .select('*')
        .order('name');

      if (companiesError) throw companiesError;

      // Fetch submission counts for each company
      const { data: submissionsData, error: submissionsError } = await supabase
        .from('submissions')
        .select('company_id, status')
        .in('status', ['submitted', 'approved', 'rejected']);

      if (submissionsError) throw submissionsError;

      // Count submissions per company
      const counts: Record<string, number> = {};
      submissionsData?.forEach(submission => {
        counts[submission.company_id] = (counts[submission.company_id] || 0) + 1;
      });

      setCompanies(companiesData || []);
      setSubmissionCounts(counts);
    } catch (error) {
      console.error('Error fetching companies:', error);
      toast({
        title: "Error",
        description: "Failed to fetch companies",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-surface flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 -left-16 w-96 h-96 bg-success/5 rounded-full"></div>
          <div className="absolute bottom-1/3 -right-20 w-80 h-80 bg-primary/5 rounded-full"></div>
        </div>
        
        <div className="glass-card p-12 animate-scale-in relative z-10">
          <div className="text-center space-y-6">
            <div className="w-16 h-16 mx-auto bg-gradient-primary rounded-full flex items-center justify-center animate-pulse-glow">
              <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Loading Companies</h2>
              <p className="text-muted-foreground font-light">Preparing company data for review...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-surface relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 -left-16 w-96 h-96 bg-success/5 rounded-full"></div>
        <div className="absolute bottom-1/3 -right-20 w-80 h-80 bg-primary/5 rounded-full"></div>
      </div>

      <div className="container mx-auto px-6 py-12 relative z-10">
        <div className="text-center mb-16 animate-fade-in">
          <h1 className="text-5xl font-bold text-gradient mb-4">
            Review Dashboard
          </h1>
          <p className="text-xl text-muted-foreground font-light max-w-3xl mx-auto">
            Select a company to review their ESG submissions and assessments
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {companies.map((company, index) => {
              const submissionCount = submissionCounts[company.id] || 0;
              const hasSubmissions = submissionCount > 0;
              
              return (
                <Card 
                  key={company.id} 
                  className={`glass-card interactive-lift cursor-pointer animate-fade-in ${
                    hasSubmissions ? 'hover:border-primary/30' : 'opacity-60'
                  }`}
                  style={{animationDelay: `${index * 0.1}s`}}
                  onClick={() => hasSubmissions && onCompanySelect(company.id, company.name)}
                >
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
                        <Building2 className="w-6 h-6 text-primary" />
                      </div>
                      {hasSubmissions && (
                        <div className="bg-success/20 text-success px-2 py-1 rounded-full text-xs font-medium">
                          {submissionCount} submission{submissionCount !== 1 ? 's' : ''}
                        </div>
                      )}
                    </div>
                    <CardTitle className="text-xl font-bold text-foreground">
                      {company.name}
                    </CardTitle>
                    <p className="text-muted-foreground text-sm">
                      Code: {company.code}
                    </p>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {company.region && (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Users className="w-4 h-4 mr-2" />
                        Region: {company.region}
                      </div>
                    )}
                    
                    {company.sector && (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <FileText className="w-4 h-4 mr-2" />
                        Sector: {company.sector}
                      </div>
                    )}

                    <div className="pt-4">
                      <Button 
                        className={`w-full ${
                          hasSubmissions 
                            ? 'bg-gradient-primary text-white hover:scale-[1.02]' 
                            : 'bg-muted text-muted-foreground cursor-not-allowed'
                        }`}
                        disabled={!hasSubmissions}
                      >
                        {hasSubmissions ? 'Review Submissions' : 'No Submissions'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {companies.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center mb-4">
                <Building2 className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">No Companies Found</h3>
              <p className="text-muted-foreground">
                No companies are available for review at the moment.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompanySelector;