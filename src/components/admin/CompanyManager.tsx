import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2, Edit, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Company {
  id: string;
  name: string;
  code: string;
  region?: string;
  sector?: string;
}

const CompanyManager = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [showForm, setShowForm] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    region: '',
    sector: ''
  });

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .order('name');

      if (error) throw error;
      setCompanies(data || []);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingCompany) {
        const { error } = await supabase
          .from('companies')
          .update(formData)
          .eq('id', editingCompany.id);

        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Company updated successfully",
        });
      } else {
        const { error } = await supabase
          .from('companies')
          .insert([formData]);

        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Company created successfully",
        });
      }

      setFormData({ name: '', code: '', region: '', sector: '' });
      setEditingCompany(null);
      setShowForm(false);
      fetchCompanies();
    } catch (error) {
      console.error('Error saving company:', error);
      toast({
        title: "Error",
        description: "Failed to save company",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (company: Company) => {
    setEditingCompany(company);
    setFormData({
      name: company.name,
      code: company.code,
      region: company.region || '',
      sector: company.sector || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this company?')) return;

    try {
      const { error } = await supabase
        .from('companies')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Company deleted successfully",
      });
      
      fetchCompanies();
    } catch (error) {
      console.error('Error deleting company:', error);
      toast({
        title: "Error",
        description: "Failed to delete company",
        variant: "destructive",
      });
    }
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
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Manage Companies</h2>
        <Button onClick={() => setShowForm(true)} className="bg-gradient-primary text-white">
          <Plus className="w-4 h-4 mr-2" />
          Add Company
        </Button>
      </div>

      {showForm && (
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>{editingCompany ? 'Edit Company' : 'Add New Company'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Company Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="code">Company Code</Label>
                  <Input
                    id="code"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="region">Region</Label>
                  <Input
                    id="region"
                    value={formData.region}
                    onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="sector">Sector</Label>
                  <Input
                    id="sector"
                    value={formData.sector}
                    onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit" className="bg-gradient-primary text-white">
                  {editingCompany ? 'Update' : 'Create'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false);
                    setEditingCompany(null);
                    setFormData({ name: '', code: '', region: '', sector: '' });
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {companies.map((company) => (
          <Card key={company.id} className="glass-card">
            <CardContent className="p-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-semibold text-lg">{company.name}</h3>
                  <p className="text-muted-foreground">Code: {company.code}</p>
                  {company.region && <p className="text-sm text-muted-foreground">Region: {company.region}</p>}
                  {company.sector && <p className="text-sm text-muted-foreground">Sector: {company.sector}</p>}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(company)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(company.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default CompanyManager;