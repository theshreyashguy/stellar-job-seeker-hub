import { Opportunity } from "@/hooks/useJobOpportunities";
import { profile } from "console";

interface RawOpportunity {
  ID: string;
  Role: string;
  CompanyName: string;
  CompanyPhotoURL: string;
  Location: string;
  Salary: string;
  Duration: string;
  Mode: string;
  StartDate: string;
  OfficeLocation: string;
  ApplyBy: string;
  PostedAgo: string;
  Type: string;
  ApplyURL: string;
  Skills: string[];
  Level: string;
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
    duration: item.Duration,
    mode: item.Mode,
    startDate: item.StartDate,
    officeLocation: item.OfficeLocation,
    applyBy: item.ApplyBy,
    postedAgo: item.PostedAgo,
    skills: item.Skills,
    level: item.Level,
    applyUrl: item.ApplyURL,
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
  formData.append("html", file);

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
  const response = await fetch(`${API_BASE_URL}/analytics`, {
    headers: {
      Authorization: getAuthToken(),
    },
  });
  return handleResponse(response);
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

export const getProfile = async () => {
  const response = await fetch(`${API_BASE_URL}/profile`, {
    headers: {
      Authorization: getAuthToken(),
    },
  });
  return handleResponse(response);
};

export const updateProfile = async (profileData) => {
  const response = await fetch(`${API_BASE_URL}/profile`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: getAuthToken(),
    },
    body: JSON.stringify(profileData),
  });
  return handleResponse(response);
};

export const createApplication = async (applicationData) => {
  const response = await fetch(`${API_BASE_URL}/applications`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: getAuthToken(),
    },
    body: JSON.stringify(applicationData),
  });
  return handleResponse(response);
};
