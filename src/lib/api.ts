import { Opportunity } from "@/hooks/useJobOpportunities";
import { profile } from "console";

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
const API_AUTH_URL = "http://localhost:8090";

const getAuthToken = () => {
  const token = localStorage.getItem("auth_token");
  return token ? `Bearer ${token}` : "";
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

export const register = async (name, email, password) => {
  console.log(
    "Registering user:",
    JSON.stringify({ username: name, email, password, profile: "." })
  );
  console.log("url:", `${API_AUTH_URL}/register`);
  const response = await fetch(`${API_AUTH_URL}/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username: name, email, password, profile: "." }),
  });
  return handleResponse(response);
};

export const login = async (email, password) => {
  const response = await fetch(`${API_AUTH_URL}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });
  return handleResponse(response);
};

export const loginWithGoogle = async (token) => {
  console.log("Logging in with Google token:", token);
  const response = await fetch(`${API_AUTH_URL}/google`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ token }),
  });

  return handleResponse(response);
};
