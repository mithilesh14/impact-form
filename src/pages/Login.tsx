import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { signIn } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    const { error } = await signIn(email, password);
    
    setIsLoading(false);
    
    if (error) {
      console.error("Login error:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-4 -left-4 w-72 h-72 bg-primary/10 rounded-full animate-float"></div>
        <div className="absolute top-1/3 -right-16 w-96 h-96 bg-success/5 rounded-full animate-float" style={{animationDelay: '1s'}}></div>
        <div className="absolute -bottom-8 left-1/3 w-80 h-80 bg-primary/5 rounded-full animate-float" style={{animationDelay: '2s'}}></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-12 animate-fade-in">
          <div className="relative mb-6">
            <h1 className="text-7xl font-bold text-white drop-shadow-2xl animate-bounce-in relative z-10">
              ESG Portal
            </h1>
            <div className="absolute inset-0 text-7xl font-bold bg-gradient-to-r from-white via-primary-light to-success bg-clip-text text-transparent animate-bounce-in opacity-90 blur-sm">
              ESG Portal
            </div>
            <div className="absolute inset-0 text-7xl font-bold bg-gradient-to-r from-primary to-success bg-clip-text text-transparent animate-bounce-in" style={{animationDelay: '0.2s'}}>
              ESG Portal
            </div>
          </div>
          <p className="text-2xl text-white font-medium drop-shadow-lg bg-black/20 backdrop-blur-sm rounded-2xl px-6 py-3 inline-block">
            Sustainable reporting made simple
          </p>
        </div>
        
        <div className="glass-card p-8 animate-scale-in interactive-lift">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-semibold text-foreground mb-2">Welcome back</h2>
            <p className="text-muted-foreground font-light">
              Sign in to access your sustainability dashboard
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-foreground">
                Email address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-12 bg-white/50 border-white/20 backdrop-blur-sm transition-all duration-200 focus:bg-white/70 focus:border-primary/50 focus:shadow-glow"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-foreground">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-12 bg-white/50 border-white/20 backdrop-blur-sm transition-all duration-200 focus:bg-white/70 focus:border-primary/50 focus:shadow-glow"
              />
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 bg-gradient-primary text-white font-medium rounded-2xl transition-all duration-200 hover:scale-[1.02] hover:shadow-xl active:scale-[0.98] disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-full bg-white/20 rounded-full h-1">
                    <div className="bg-white h-1 rounded-full animate-pulse" style={{ width: '70%' }}></div>
                  </div>
                  <span className="text-sm">Signing in...</span>
                </div>
              ) : (
                'Sign in'
              )}
            </Button>
          </form>

          <div className="mt-8 text-center">
            <a href="#" className="text-sm text-primary hover:text-primary-hover transition-colors duration-200 font-medium">
              Forgot your password?
            </a>
          </div>
        </div>

        <p className="text-center text-white/60 text-sm mt-6 font-light">
          Secure • Compliant • Sustainable
        </p>
      </div>
    </div>
  );
};

export default Login;