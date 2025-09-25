import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Edit, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface User {
  id: string;
  email: string;
  role: string;
  company_id?: string;
  created_at: string;
}

interface Company {
  id: string;
  name: string;
  code: string;
}

const UserManager = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showForm, setShowForm] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    email: '',
    role: 'Submitter',
    company_id: ''
  });

  const roles = ['Submitter', 'Reviewer', 'Admin'];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [usersResult, companiesResult] = await Promise.all([
        supabase.from('users').select('*').order('email'),
        supabase.from('companies').select('id, name, code').order('name')
      ]);

      if (usersResult.error) throw usersResult.error;
      if (companiesResult.error) throw companiesResult.error;

      setUsers(usersResult.data || []);
      setCompanies(companiesResult.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const userData = {
        email: formData.email,
        role: formData.role,
        company_id: formData.company_id || null
      };

      if (editingUser) {
        const { error } = await supabase
          .from('users')
          .update(userData)
          .eq('id', editingUser.id);

        if (error) throw error;
        
        toast({
          title: "Success",
          description: "User updated successfully",
        });
      } else {
        const { error } = await supabase
          .from('users')
          .insert([userData]);

        if (error) throw error;
        
        toast({
          title: "Success",
          description: "User created successfully",
        });
      }

      setFormData({ email: '', role: 'Submitter', company_id: '' });
      setEditingUser(null);
      setShowForm(false);
      fetchData();
    } catch (error) {
      console.error('Error saving user:', error);
      toast({
        title: "Error",
        description: "Failed to save user",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      email: user.email,
      role: user.role,
      company_id: user.company_id || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast({
        title: "Success",
        description: "User deleted successfully",
      });
      
      fetchData();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        title: "Error",
        description: "Failed to delete user",
        variant: "destructive",
      });
    }
  };

  const getCompanyName = (companyId?: string) => {
    if (!companyId) return 'No Company';
    const company = companies.find(c => c.id === companyId);
    return company ? company.name : 'Unknown Company';
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
        <h2 className="text-2xl font-bold">Manage Users</h2>
        <Button onClick={() => setShowForm(true)} className="bg-gradient-primary text-white">
          <Plus className="w-4 h-4 mr-2" />
          Add User
        </Button>
      </div>

      {showForm && (
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>{editingUser ? 'Edit User' : 'Add New User'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="role">Role</Label>
                  <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map((role) => (
                        <SelectItem key={role} value={role}>
                          {role}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="company">Company (Optional)</Label>
                  <Select value={formData.company_id} onValueChange={(value) => setFormData({ ...formData, company_id: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select company" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">No Company</SelectItem>
                      {companies.map((company) => (
                        <SelectItem key={company.id} value={company.id}>
                          {company.name} ({company.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button type="submit" className="bg-gradient-primary text-white">
                  {editingUser ? 'Update' : 'Create'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false);
                    setEditingUser(null);
                    setFormData({ email: '', role: 'Submitter', company_id: '' });
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {roles.map((role) => {
          const roleUsers = users.filter(u => u.role === role);
          if (roleUsers.length === 0) return null;
          
          return (
            <Card key={role} className="glass-card">
              <CardHeader>
                <CardTitle className="text-lg">{role}s ({roleUsers.length})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {roleUsers.map((user) => (
                  <div key={user.id} className="border border-border/50 rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-medium">{user.email}</h4>
                        <p className="text-sm text-muted-foreground">
                          Company: {getCompanyName(user.company_id)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Created: {new Date(user.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(user)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(user.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default UserManager;