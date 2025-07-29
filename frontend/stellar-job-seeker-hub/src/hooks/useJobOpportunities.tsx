
import { createContext, useContext, useState, ReactNode } from "react";

export interface Opportunity {
  id: string;
  name: string;
  company: string;
  salary: string;
  location: string;
  imageUrl?: string;
  applyUrl?: string;
  duration?: string;
  mode?: string;
  startDate?: string;
  officeLocation?: string;
  applyBy?: string;
  postedAgo?: string;
  skills?: string[];
  level?: string;
}

interface JobOpportunitiesContextType {
  linkedinOpportunities: Opportunity[];
  setLinkedinOpportunities: (opportunities: Opportunity[]) => void;
  removeLinkedinOpportunity: (id: string) => void;
  wellfoundOpportunities: Opportunity[];
  setWellfoundOpportunities: (opportunities: Opportunity[]) => void;
  removeWellfoundOpportunity: (id: string) => void;
  cuvetteOpportunities: Opportunity[];
  setCuvetteOpportunities: (opportunities: Opportunity[]) => void;
  removeCuvetteOpportunity: (id: string, name: string, company: string) => void;
}

const JobOpportunitiesContext = createContext<
  JobOpportunitiesContextType | undefined
>(undefined);

export const JobOpportunitiesProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [linkedinOpportunities, setLinkedinOpportunities] = useState<
    Opportunity[]
  >([]);
  const [wellfoundOpportunities, setWellfoundOpportunities] = useState<
    Opportunity[]
  >([]);
  const [cuvetteOpportunities, setCuvetteOpportunities] = useState<
    Opportunity[]
  >([]);

  const removeLinkedinOpportunity = (id: string) => {
    setLinkedinOpportunities((prev) => prev.filter((opp) => opp.id !== id));
  };

  const removeWellfoundOpportunity = (id: string) => {
    setWellfoundOpportunities((prev) => prev.filter((opp) => opp.id !== id));
  };

  const removeCuvetteOpportunity = (id: string, name: string, company: string) => {
    setCuvetteOpportunities((prev) =>
      prev.filter(
        (opp) =>
          opp.id !== id || opp.name !== name || opp.company !== company
      )
    );
  };

  return (
    <JobOpportunitiesContext.Provider
      value={{
        linkedinOpportunities,
        setLinkedinOpportunities,
        removeLinkedinOpportunity,
        wellfoundOpportunities,
        setWellfoundOpportunities,
        removeWellfoundOpportunity,
        cuvetteOpportunities,
        setCuvetteOpportunities,
        removeCuvetteOpportunity,
      }}
    >
      {children}
    </JobOpportunitiesContext.Provider>
  );
};

export const useJobOpportunities = () => {
  const context = useContext(JobOpportunitiesContext);
  if (context === undefined) {
    throw new Error(
      "useJobOpportunities must be used within a JobOpportunitiesProvider"
    );
  }
  return context;
};

