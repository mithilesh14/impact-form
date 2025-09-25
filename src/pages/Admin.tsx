import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Building2, FileQuestion } from "lucide-react";
import LogoutButton from "@/components/LogoutButton";
import CompanyManager from "@/components/admin/CompanyManager";
import QuestionManager from "@/components/admin/QuestionManager";
import UserManager from "@/components/admin/UserManager";

const Admin = () => {
  return (
    <div className="min-h-screen bg-gradient-surface relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 -left-12 w-64 h-64 bg-primary/5 rounded-full"></div>
        <div className="absolute bottom-1/4 -right-12 w-80 h-80 bg-success/5 rounded-full"></div>
      </div>

      <div className="container mx-auto px-6 py-12 relative z-10">
        <div className="flex justify-between items-center mb-12 animate-fade-in">
          <div>
            <h1 className="text-5xl font-bold text-gradient">Admin Dashboard</h1>
            <p className="text-xl text-muted-foreground font-light">Manage your ESG assessment platform</p>
          </div>
          <LogoutButton />
        </div>
        
        <div className="max-w-7xl mx-auto">
          <Tabs defaultValue="companies" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 glass-card">
              <TabsTrigger value="companies" className="flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                Companies
              </TabsTrigger>
              <TabsTrigger value="questions" className="flex items-center gap-2">
                <FileQuestion className="w-4 h-4" />
                Questions
              </TabsTrigger>
              <TabsTrigger value="users" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Users
              </TabsTrigger>
            </TabsList>

            <TabsContent value="companies">
              <CompanyManager />
            </TabsContent>

            <TabsContent value="questions">
              <QuestionManager />
            </TabsContent>

            <TabsContent value="users">
              <UserManager />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Admin;