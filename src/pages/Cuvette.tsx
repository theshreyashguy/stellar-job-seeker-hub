import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Upload, ExternalLink, Send, Loader, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useJobOpportunities, Opportunity } from "@/hooks/useJobOpportunities";

const Cuvette = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { opportunities, setOpportunities } = useJobOpportunities();
  const { toast } = useToast();

  // Dummy data for Cuvette opportunities
  const dummyOpportunities: Opportunity[] = [
    {
      id: "1",
      name: "Backend Developer",
      company: "GreenTech Startup",
      salary: "₹8,00,000 - ₹12,00,000",
      location: "Bangalore, India",
    },
    {
      id: "2",
      name: "Mobile App Developer",
      company: "FinanceFlow",
      salary: "₹6,00,000 - ₹10,00,000",
      location: "Mumbai, India",
    },
    {
      id: "3",
      name: "DevOps Engineer",
      company: "CloudFirst",
      salary: "₹10,00,000 - ₹15,00,000",
      location: "Remote",
    },
  ];

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setIsUploading(true);

    const formData = new FormData();
    formData.append("html", selectedFile);

    try {
      const response = await fetch("http://localhost:8090/api/scrape/cuvette", {
        method: "POST",
        headers: {
          Authorization:
            "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3NTI2NTk0NjAsInN1YiI6IiJ9.5x5EHmXkaq9QI_78SXVLmf7s7p5wKotXiNbIhMOMAqI",
          // Do NOT set 'Content-Type' when using FormData
        },
        // Do NOT set 'Content-Type' when using FormData
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to scrape jobs");
      }

      const data = await response.json();
      // Map backend response to Opportunity type, including imageUrl
      const mapped = data.map((item: any) => ({
        id: item.ID,
        name: item.Role,
        company: item.CompanyName,
        salary: item.Salary,
        location: item.Location,
        imageUrl: item.CompanyPhotoURL,
      }));
      setOpportunities(mapped);
      toast({
        title: "Success!",
        description: `Found ${mapped.length} opportunities`,
      });
    } catch (error) {
      toast({
        title: "Error!",
        description: "Failed to scrape jobs. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-green-400 to-green-600 bg-clip-text text-transparent">
            Cuvette Opportunities
          </h1>
          <p className="text-gray-300 text-lg">
            Upload your Cuvette job search HTML file to extract opportunities
          </p>
        </div>

        <div className="glass rounded-2xl p-8 mb-8">
          <div className="text-center">
            <label className="cursor-pointer block">
              <input
                type="file"
                accept=".html"
                onChange={handleFileUpload}
                className="hidden"
                disabled={isUploading}
              />
              <div className="border-2 border-dashed border-green-500/30 rounded-xl p-12 hover:border-green-500/50 transition-colors duration-300">
                {isUploading ? (
                  <div className="flex flex-col items-center space-y-4">
                    <Loader className="w-12 h-12 text-green-500 animate-spin" />
                    <p className="text-white font-medium">Processing file...</p>
                  </div>
                ) : file ? (
                  <div className="flex flex-col items-center space-y-4">
                    <CheckCircle className="w-12 h-12 text-green-500" />
                    <p className="text-white font-medium">{file.name}</p>
                    <p className="text-gray-400">
                      Click to upload a different file
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center space-y-4">
                    <Upload className="w-12 h-12 text-green-500" />
                    <p className="text-white font-medium">
                      Click to upload HTML file
                    </p>
                    <p className="text-gray-400">
                      Support for Cuvette job search exports
                    </p>
                  </div>
                )}
              </div>
            </label>
          </div>
        </div>

        {opportunities.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-white mb-6">
              Found {opportunities.length} Opportunities
            </h2>
            {opportunities.map((opportunity) => (
              <div
                key={opportunity.id + opportunity.name + opportunity.company}
                className="glass rounded-xl p-6"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1 flex items-center gap-6">
                    {opportunity.imageUrl && (
                      <img
                        src={opportunity.imageUrl}
                        alt={opportunity.company}
                        className="w-16 h-16 rounded-lg object-cover border border-green-500"
                      />
                    )}
                    <div>
                      <h3 className="text-xl font-bold text-white mb-2">
                        {opportunity.name}
                      </h3>
                      <p className="text-green-400 font-medium mb-1">
                        {opportunity.company}
                      </p>
                      <div className="flex flex-wrap gap-4 text-gray-300">
                        <span>💰 {opportunity.salary}</span>
                        <span>📍 {opportunity.location}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-3 ml-4">
                    <a
                      href={`https://www.linkedin.com/jobs/view/${opportunity.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors duration-300"
                    >
                      <ExternalLink size={16} />
                      <span>Apply</span>
                    </a>
                    <a
                      href={`https://www.linkedin.com/company/${opportunity.company
                        .toLowerCase()
                        .replace(/ /g, "-")}/people/`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-stellar-cyan hover:bg-stellar-cyan/80 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors duration-300"
                    >
                      <Send size={16} />
                      <span>Cold Email</span>
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Cuvette;
