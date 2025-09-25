import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import LogoutButton from "@/components/LogoutButton";

const Admin = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-foreground">Admin Dashboard</h1>
          <LogoutButton />
        </div>
        
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer border-0 bg-card/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Manage Questions</CardTitle>
                <CardDescription>Add, edit, or remove ESG questions</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">In Development</p>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer border-0 bg-card/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Manage Sections</CardTitle>
                <CardDescription>Configure assessment sections</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">In Development</p>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer border-0 bg-card/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Manage Users</CardTitle>
                <CardDescription>Add or modify user accounts</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">In Development</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;