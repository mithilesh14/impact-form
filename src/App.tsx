import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./hooks/useAuth";
import ProtectedRoute from "./components/ProtectedRoute";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Sections from "./pages/Sections";
import Form from "./pages/Form";
import Admin from "./pages/Admin";
import Reviewer from "./pages/Reviewer";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AppRoutes = () => {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={!user ? <Login /> : <Navigate to={getRoleBasedRedirect(profile?.role)} replace />} />
      
      <Route path="/" element={
        <ProtectedRoute allowedRoles={['Submitter']}>
          <Index />
        </ProtectedRoute>
      } />
      
      <Route path="/sections" element={
        <ProtectedRoute allowedRoles={['Submitter']}>
          <Sections />
        </ProtectedRoute>
      } />
      
      <Route path="/form/:sectionId" element={
        <ProtectedRoute allowedRoles={['Submitter']}>
          <Form />
        </ProtectedRoute>
      } />
      
      <Route path="/admin" element={
        <ProtectedRoute allowedRoles={['Admin']}>
          <Admin />
        </ProtectedRoute>
      } />
      
      <Route path="/reviewer" element={
        <ProtectedRoute allowedRoles={['Reviewer']}>
          <Reviewer />
        </ProtectedRoute>
      } />
      
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const getRoleBasedRedirect = (role?: string) => {
  switch (role) {
    case 'Submitter': return '/'; // Go to dashboard first, not sections
    case 'Admin': return '/admin';
    case 'Reviewer': return '/reviewer';
    default: return '/login';
  }
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
