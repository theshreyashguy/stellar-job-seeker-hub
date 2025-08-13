import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import Index from "./pages/Index";
import LinkedIn from "./pages/LinkedIn";
import Cuvette from "./pages/Cuvette";
import Wellfound from "./pages/Wellfound";
import Gmail from "./pages/Gmail";
import Apply from "./pages/Apply";
import ColdEmail from "./pages/ColdEmail";
import ColdEmailer from "./pages/ColdEmailer";
import Analysis from "./pages/Analysis";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import { JobOpportunitiesProvider } from "./hooks/useJobOpportunities";
import { useAuth } from "./hooks/useAuth";
import { UserProvider } from "./components/UserProvider";

const queryClient = new QueryClient();

const PrivateRoute = ({
  children,
  isSignedIn,
}: {
  children: JSX.Element;
  isSignedIn: boolean;
}) => {
  return isSignedIn ? children : <Navigate to="/auth" />;
};

const App = () => {
  const { isSignedIn, user } = useAuth();
  return (
    <QueryClientProvider client={queryClient}>
      <JobOpportunitiesProvider>
        <UserProvider value={user}>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <Routes>
              <Route
                path="/*"
                element={
                  <PrivateRoute isSignedIn={isSignedIn}>
                    <Layout>
                      <Routes>
                        <Route path="/" element={<Index />} />
                        <Route path="/linkedin" element={<LinkedIn />} />
                        <Route path="/cuvette" element={<Cuvette />} />
                        <Route path="/wellfound" element={<Wellfound />} />
                        <Route path="/gmail" element={<Gmail />} />
                        <Route path="/apply" element={<Apply />} />
                        <Route path="/cold-email" element={<ColdEmail />} />
                        <Route path="/cold-emailer" element={<ColdEmailer />} />
                        <Route path="/analysis" element={<Analysis />} />
                        <Route path="/profile" element={<Profile />} />
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </Layout>
                  </PrivateRoute>
                }
              />
              <Route path="/auth" element={<Auth />} />
            </Routes>
          </TooltipProvider>
        </UserProvider>
      </JobOpportunitiesProvider>
    </QueryClientProvider>
  );
};

export default App;
