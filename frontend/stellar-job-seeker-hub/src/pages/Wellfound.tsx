import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Upload,
  ExternalLink,
  Send,
  Loader,
  CheckCircle,
  X,
  CodeSquare,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useJobOpportunities, Opportunity } from "@/hooks/useJobOpportunities";
import { scrapeWellfound } from "@/lib/api";

const Wellfound = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { wellfoundOpportunities, setWellfoundOpportunities, removeWellfoundOpportunity } = useJobOpportunities();
  const { toast } = useToast();

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setIsUploading(true);

    try {
      const data = await scrapeWellfound(selectedFile);
      console.log("Scraped Wellfound data:", data);
      const opportunities: Opportunity[] = data.map((job: any) => ({
          id: job.ID,
          name: job.Role,
          company: job.CompanyName,
          salary: job.Salary,
          location: job.Location,
          imageUrl: job.CompanyPhotoURL,
          applyUrl: job.CompanyURL,
      }));
      setWellfoundOpportunities(opportunities);
      toast({
        title: "Success!",
        description: `Found ${opportunities.length} opportunities`,
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
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">
            Wellfound Opportunities
          </h1>
          <p className="text-gray-300 text-lg">
            Upload your Wellfound job search HTML file to extract opportunities
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
              <div className="border-2 border-dashed border-purple-500/30 rounded-xl p-12 hover:border-purple-500/50 transition-colors duration-300">
                {isUploading ? (
                  <div className="flex flex-col items-center space-y-4">
                    <Loader className="w-12 h-12 text-purple-500 animate-spin" />
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
                    <Upload className="w-12 h-12 text-purple-500" />
                    <p className="text-white font-medium">
                      Click to upload HTML file
                    </p>
                    <p className="text-gray-400">
                      Support for Wellfound job search exports
                    </p>
                  </div>
                )}
              </div>
            </label>
          </div>
        </div>

        {wellfoundOpportunities.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-white mb-6">
              Found {wellfoundOpportunities.length} Opportunities
            </h2>
            {wellfoundOpportunities.map((opportunity) => (
              <div key={opportunity.id} className="glass rounded-xl p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1 flex items-center gap-6">
                    {opportunity.imageUrl && (
                      <img
                        src={opportunity.imageUrl}
                        alt={opportunity.company}
                        className="w-16 h-16 rounded-lg object-cover border border-purple-500"
                      />
                    )}
                    <div>
                      <h3 className="text-xl font-bold text-white mb-2">
                        {opportunity.name}
                      </h3>
                      <p className="text-purple-400 font-medium mb-1">
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
                      href={
                        opportunity.applyUrl ||
                        `https://wellfound.com/company/${opportunity.company
                          .toLowerCase()
                          .replace(/ /g, "-")}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors duration-300"
                    >
                      <ExternalLink size={16} />
                      <span>Apply</span>
                    </a>
                    <a
                      href={`/cold-email?company=${encodeURIComponent(
                        opportunity.company
                      )}&role=${encodeURIComponent(opportunity.name)}`}
                      className="bg-stellar-cyan hover:bg-stellar-cyan/80 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors duration-300"
                    >
                      <Send size={16} />
                      <span>Cold Email</span>
                    </a>
                    <button
                      onClick={() => removeWellfoundOpportunity(opportunity.id)}
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

export default Wellfound;