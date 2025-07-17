import { createContext, useContext, useState, ReactNode } from "react";

export interface Opportunity {
  id: string;
  name: string;
  company: string;
  salary: string;
  location: string;
  imageUrl?: string;
}

interface JobOpportunitiesContextType {
  opportunities: Opportunity[];
  setOpportunities: (opportunities: Opportunity[]) => void;
}

const JobOpportunitiesContext = createContext<
  JobOpportunitiesContextType | undefined
>(undefined);

export const JobOpportunitiesProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);

  return (
    <JobOpportunitiesContext.Provider
      value={{ opportunities, setOpportunities }}
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
