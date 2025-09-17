import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Sidebar from "@/components/layout/sidebar";
import Dashboard from "@/pages/dashboard";
import Clients from "@/pages/clients";
import Projects from "@/pages/projects";
import Subscriptions from "@/pages/subscriptions";
import Proposals from "@/pages/proposals";
import Kanban from "@/pages/kanban";
import NotFound from "@/pages/not-found";
import Login from "@/pages/login";
import { AuthProvider, useAuth } from "@/hooks/use-auth";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-primary">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Switch>
        <Route path="/login" component={Login} />
        <Route component={() => <Login />} />
      </Switch>
    );
  }

  return (
    <div className="flex min-h-screen bg-bg-primary">
      <Sidebar />
      <div className="flex-1 flex flex-col lg:ml-0 ml-0">
        <Switch>
          <Route path="/" component={Dashboard} />
          <Route path="/clients" component={Clients} />
          <Route path="/projetos" component={Projects} />
          <Route path="/projetos/:projectId" component={Projects} />
          <Route path="/subscriptions" component={Subscriptions} />
          <Route path="/propostas" component={Proposals} />
          
          {/* Redirects from old English URLs to new Portuguese URLs */}
          <Route path="/projects" component={() => { window.location.replace('/projetos'); return null; }} />
          <Route path="/projects/:projectId" component={({ params }: { params?: any }) => { window.location.replace(`/projetos/${params?.projectId || ''}`); return null; }} />
          <Route path="/proposals" component={() => { window.location.replace('/propostas'); return null; }} />
          <Route path="/kanban" component={Kanban} />
          <Route path="/login" component={() => <Login />} />
          <Route component={NotFound} />
        </Switch>
      </div>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
