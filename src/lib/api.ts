import { Opportunity } from "@/hooks/useJobOpportunities";

interface RawOpportunity {
  ID: string;
  Role: string;
  CompanyName: string;
  Salary: string;
  Location: string;
  CompanyPhotoURL?: string;
  Company: string;
}

const API_BASE_URL = "http://localhost:8090/api";

const getAuthToken = () => {
  // In a real app, you'd get this from local storage or a cookie
  return "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3NTI5MDcyMjYsInN1YiI6IiJ9.WDlJKYiuqvKWpP3y11Xnd9P-uHOj5bLKSjt4RgleSCs";
};

const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Something went wrong");
  }
  return response.json();
};

export const scrapeCuvette = async (file: File): Promise<Opportunity[]> => {
  const formData = new FormData();
  formData.append("html", file);

  const response = await fetch(`${API_BASE_URL}/scrape/cuvette`, {
    method: "POST",
    headers: {
      Authorization: getAuthToken(),
    },
    body: formData,
  });

  const data: RawOpportunity[] = await handleResponse(response);
  return data.map((item) => ({
    id: item.ID,
    name: item.Role,
    company: item.CompanyName,
    salary: item.Salary,
    location: item.Location,
    imageUrl: item.CompanyPhotoURL,
  }));
};

export const scrapeLinkedIn = async (file: File): Promise<Opportunity[]> => {
  const formData = new FormData();
  formData.append("html", file);

  const response = await fetch(`${API_BASE_URL}/scrape/linkedin`, {
    method: "POST",
    headers: {
      Authorization: getAuthToken(),
    },
    body: formData,
  });

  const data: RawOpportunity[] = await handleResponse(response);
  return data.map((item) => ({
    id: item.ID,
    name: item.Role,
    company: item.Company,
    salary: item.Salary,
    location: item.Location,
  }));
};

export const scrapeWellfound = async (file: File): Promise<Opportunity[]> => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_BASE_URL}/scrape/wellfound`, {
    method: "POST",
    headers: {
      Authorization: getAuthToken(),
    },
    body: formData,
  });

  return handleResponse(response);
};

export const fetchAnalytics = async () => {
  // In a real app, you would fetch this from the backend
  // For now, we'll simulate the API call
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        totalApplications: 47,
        coldEmailsSent: 23,
        platformBreakdown: [
          { platform: "LinkedIn", applications: 18, coldEmails: 12 },
          { platform: "Cuvette", applications: 15, coldEmails: 6 },
          { platform: "Wellfound", applications: 14, coldEmails: 5 },
        ],
        monthlyStats: [
          { month: "Jan", applications: 8, emails: 4 },
          { month: "Feb", applications: 12, emails: 7 },
          { month: "Mar", applications: 15, emails: 8 },
          { month: "Apr", applications: 12, emails: 4 },
        ],
      });
    }, 1000);
  });
};
