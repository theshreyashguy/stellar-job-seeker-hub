import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Upload,
  ExternalLink,
  Send,
  Loader,
  CheckCircle,
  X,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useJobOpportunities, Opportunity } from "@/hooks/useJobOpportunities";
import { scrapeCuvette } from "@/lib/api";
import placeholder from "../../public/branch-svgrepo-com.svg";

const Cuvette = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const {
    cuvetteOpportunities,
    setCuvetteOpportunities,
    removeCuvetteOpportunity,
  } = useJobOpportunities();
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
      const mapped = await scrapeCuvette(selectedFile);
      setCuvetteOpportunities(mapped);
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

        {cuvetteOpportunities.length > 0 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white mb-6">
              Found {cuvetteOpportunities.length} Opportunities
            </h2>
            {cuvetteOpportunities.map((opportunity) => (
              <div
                key={
                  opportunity.id || `${opportunity.name}-${opportunity.company}`
                }
                className="glass rounded-xl p-6 border border-green-500/20 hover:border-green-500/50 transition-all duration-300"
              >
                <div className="flex items-start gap-6">
                  {/* Company Logo */}
                  <div className="flex-shrink-0">
                    {opportunity.imageUrl &&
                    opportunity.imageUrl.startsWith("http") ? (
                      <img
                        src={opportunity.imageUrl}
                        alt={opportunity.company}
                        className="w-20 h-20 rounded-lg object-cover border-2 border-green-500/50"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "/placeholder.svg";
                        }}
                      />
                    ) : (
                      <img
                        src={placeholder}
                        alt="No Logo"
                        className="w-20 h-20 rounded-lg object-cover border-2 border-green-500/30 opacity-60"
                      />
                    )}
                  </div>

                  {/* Job Details */}
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-2xl font-bold text-white mb-1">
                          {opportunity.name}
                        </h3>
                        <p className="text-green-400 font-medium text-lg mb-3">
                          {opportunity.company}
                        </p>
                      </div>
                      <div className="flex items-center space-x-3 ml-4">
                        <a
                          href={opportunity.applyUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => {
                            console.log(
                              `Navigating to apply URL: ${opportunity.applyUrl}`
                            );
                            navigate(
                              `/apply?company=${encodeURIComponent(
                                opportunity.company
                              )}&role=${encodeURIComponent(
                                opportunity.name
                              )}&platform=cuvette`
                            );
                          }}
                          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors duration-300 text-sm"
                        >
                          <ExternalLink size={16} />
                          <span>Apply</span>
                        </a>
                        <a
                          href={`/cold-email?company=${encodeURIComponent(
                            opportunity.company
                          )}&role=${encodeURIComponent(opportunity.name)}`}
                          onClick={(e) => {
                            e.preventDefault();
                            navigate(
                              `/cold-email?company=${encodeURIComponent(
                                opportunity.company
                              )}&role=${encodeURIComponent(opportunity.name)}`
                            );
                          }}
                          className="bg-stellar-cyan hover:bg-stellar-cyan/80 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors duration-300 text-sm"
                        >
                          <Send size={16} />
                          <span>Cold Email</span>
                        </a>
                        <button
                          onClick={() =>
                            removeCuvetteOpportunity(
                              opportunity.id,
                              opportunity.name,
                              opportunity.company
                            )
                          }
                          className="text-gray-400 hover:text-red-500 transition-colors duration-300"
                        >
                          <X size={20} />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 text-gray-300 mt-4">
                      <div className="flex flex-col">
                        <span className="text-sm text-gray-400">Salary</span>
                        <span className="font-semibold">
                          💰 {opportunity.salary || "N/A"}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm text-gray-400">Location</span>
                        <span className="font-semibold">
                          📍 {opportunity.location || "N/A"}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm text-gray-400">Duration</span>
                        <span className="font-semibold">
                          ⏳ {opportunity.duration || "N/A"}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm text-gray-400">Mode</span>
                        <span className="font-semibold">
                          {opportunity.mode || "N/A"}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm text-gray-400">
                          Start Date
                        </span>
                        <span className="font-semibold">
                          📅 {opportunity.startDate || "N/A"}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm text-gray-400">
                          Office Location
                        </span>
                        <span className="font-semibold">
                          🏢 {opportunity.officeLocation || "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="border-t border-green-500/20 mt-4 pt-3 flex justify-between items-center text-sm text-gray-400">
                  <span>
                    <strong>Apply By:</strong> {opportunity.applyBy || "N/A"}
                  </span>
                  <span>
                    <strong>Posted:</strong> {opportunity.postedAgo || "N/A"}
                  </span>
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
