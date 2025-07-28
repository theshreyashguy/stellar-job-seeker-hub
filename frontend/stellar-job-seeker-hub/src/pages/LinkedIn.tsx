import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Upload, ExternalLink, Send, Loader, CheckCircle, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useJobOpportunities, Opportunity } from "@/hooks/useJobOpportunities";
import { useSidebar } from "@/components/ui/sidebar";
import { scrapeLinkedIn } from "@/lib/api";

const LinkedIn = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { linkedinOpportunities, setLinkedinOpportunities, removeLinkedinOpportunity } = useJobOpportunities();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setIsUploading(true);

    try {
      const mapped = await scrapeLinkedIn(selectedFile);
      setLinkedinOpportunities(mapped);
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
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
            LinkedIn Opportunities
          </h1>
          <p className="text-gray-300 text-lg">
            Upload your LinkedIn job search HTML file to extract opportunities
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
              <div className="border-2 border-dashed border-stellar-purple/30 rounded-xl p-12 hover:border-stellar-purple/50 transition-colors duration-300">
                {isUploading ? (
                  <div className="flex flex-col items-center space-y-4">
                    <Loader className="w-12 h-12 text-stellar-purple animate-spin" />
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
                    <Upload className="w-12 h-12 text-stellar-purple" />
                    <p className="text-white font-medium">
                      Click to upload HTML file
                    </p>
                    <p className="text-gray-400">
                      Support for LinkedIn job search exports
                    </p>
                  </div>
                )}
              </div>
            </label>
          </div>
        </div>

        {linkedinOpportunities.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-white mb-6">
              Found {linkedinOpportunities.length} Opportunities
            </h2>
            {linkedinOpportunities.map((opportunity) => (
              <div key={opportunity.id} className="glass rounded-xl p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-2">
                      {opportunity.name}
                    </h3>
                    <p className="text-stellar-cyan font-medium mb-1">
                      {opportunity.company}
                    </p>
                    <div className="flex flex-wrap gap-4 text-gray-300">
                      <span>💰 {opportunity.salary}</span>
                      <span>📍 {opportunity.location}</span>
                    </div>
                  </div>
                  <div className="flex space-x-3 ml-4">
                    <a
                      href={`https://www.linkedin.com/jobs/view/${opportunity.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => {
                        navigate(
                          `/apply?company=${encodeURIComponent(
                            opportunity.company
                          )}&role=${encodeURIComponent(
                            opportunity.name
                          )}&platform=linkedin`
                        );
                      }}
                      className="bg-stellar-purple hover:bg-stellar-purple/80 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors duration-300"
                    >
                      <ExternalLink size={16} />
                      <span>Apply</span>
                    </a>
                    <a
                      href={`https://www.linkedin.com/company/${opportunity.company
                        .toLocaleLowerCase()
                        .split(" ")
                        .join("-")}/people/`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => {
                        //

                        navigate(
                          `/cold-email?company=${encodeURIComponent(
                            opportunity.company
                          )}&role=${encodeURIComponent(opportunity.name)}`
                        );
                      }}
                      className="bg-stellar-cyan hover:bg-stellar-cyan/80 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors duration-300"
                    >
                      <ExternalLink size={16} />
                      <span>Cold Email</span>
                    </a>
                    <button
                      onClick={() => removeLinkedinOpportunity(opportunity.id)}
                      className="text-gray-400 hover:text-white transition-colors duration-300"
                    >
                      <X size={20} />
                    </button>
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

export default LinkedIn;
