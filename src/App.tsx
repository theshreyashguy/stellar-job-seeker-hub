
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Index from "./pages/Index";
import LinkedIn from "./pages/LinkedIn";
import Cuvette from "./pages/Cuvette";
import Wellfound from "./pages/Wellfound";
import Gmail from "./pages/Gmail";
import Apply from "./pages/Apply";
import ColdEmail from "./pages/ColdEmail";
import Analysis from "./pages/Analysis";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import { JobOpportunitiesProvider } from "./hooks/useJobOpportunities";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <JobOpportunitiesProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Layout>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/linkedin" element={<LinkedIn />} />
              <Route path="/cuvette" element={<Cuvette />} />
              <Route path="/wellfound" element={<Wellfound />} />
              <Route path="/gmail" element={<Gmail />} />
              <Route path="/apply" element={<Apply />} />
              <Route path="/cold-email" element={<ColdEmail />} />
              <Route path="/analysis" element={<Analysis />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>
        </BrowserRouter>
      </TooltipProvider>
    </JobOpportunitiesProvider>
  </QueryClientProvider>
);

export default App;
