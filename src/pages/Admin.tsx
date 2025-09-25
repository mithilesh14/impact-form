import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Building2 } from "lucide-react";
import LogoutButton from "@/components/LogoutButton";

const Admin = () => {
  return (
    <div className="min-h-screen bg-gradient-surface relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 -left-12 w-64 h-64 bg-primary/5 rounded-full animate-float"></div>
        <div className="absolute bottom-1/4 -right-12 w-80 h-80 bg-success/5 rounded-full animate-float" style={{animationDelay: '1.5s'}}></div>
      </div>

      <div className="container mx-auto px-6 py-12 relative z-10">
        <div className="flex justify-between items-center mb-16 animate-fade-in">
          <div>
            <h1 className="text-5xl font-bold text-gradient animate-bounce-in">Admin Dashboard</h1>
            <p className="text-xl text-muted-foreground font-light">Manage your ESG assessment platform</p>
          </div>
          <LogoutButton />
        </div>
        
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="glass-card p-8 interactive-lift animate-fade-in cursor-pointer group">
              <div className="text-center space-y-6">
                <div className="w-16 h-16 bg-primary-light rounded-3xl flex items-center justify-center mx-auto group-hover:scale-110 transition-all duration-300 animate-float">
                  <Users className="w-8 h-8 text-primary" />
                </div>
                <div className="space-y-3">
                  <h3 className="text-2xl font-bold text-foreground">Manage Questions</h3>
                  <p className="text-muted-foreground font-light">Add, edit, or remove ESG assessment questions</p>
                </div>
                <div className="pt-4">
                  <div className="px-4 py-2 bg-warning-light text-warning font-medium rounded-xl text-sm">
                    Coming Soon
                  </div>
                </div>
              </div>
            </div>
            
            <div className="glass-card p-8 interactive-lift animate-fade-in cursor-pointer group" style={{animationDelay: '0.1s'}}>
              <div className="text-center space-y-6">
                <div className="w-16 h-16 bg-success-light rounded-3xl flex items-center justify-center mx-auto group-hover:scale-110 transition-all duration-300 animate-float" style={{animationDelay: '1s'}}>
                  <Building2 className="w-8 h-8 text-success" />
                </div>
                <div className="space-y-3">
                  <h3 className="text-2xl font-bold text-foreground">Manage Sections</h3>
                  <p className="text-muted-foreground font-light">Configure assessment sections and categories</p>
                </div>
                <div className="pt-4">
                  <div className="px-4 py-2 bg-warning-light text-warning font-medium rounded-xl text-sm">
                    Coming Soon
                  </div>
                </div>
              </div>
            </div>
            
            <div className="glass-card p-8 interactive-lift animate-fade-in cursor-pointer group" style={{animationDelay: '0.2s'}}>
              <div className="text-center space-y-6">
                <div className="w-16 h-16 bg-primary-light rounded-3xl flex items-center justify-center mx-auto group-hover:scale-110 transition-all duration-300 animate-float" style={{animationDelay: '2s'}}>
                  <Users className="w-8 h-8 text-primary" />
                </div>
                <div className="space-y-3">
                  <h3 className="text-2xl font-bold text-foreground">Manage Users</h3>
                  <p className="text-muted-foreground font-light">Add or modify user accounts and permissions</p>
                </div>
                <div className="pt-4">
                  <div className="px-4 py-2 bg-warning-light text-warning font-medium rounded-xl text-sm">
                    Coming Soon
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

export default Admin;