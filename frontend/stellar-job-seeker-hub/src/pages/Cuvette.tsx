import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
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

interface JsonEntry {
  _id: string;
}

const extractIdAndType = (url: string) => {
  const match = url.match(/\/(internship|job)\/([a-zA-Z0-9]+)/i);
  return match ? { type: match[1], id: match[2] } : { type: "", id: "" };
};

const Cuvette = () => {
  const [htmlFile, setHtmlFile] = useState<File | null>(null);
  const [jsonFile, setJsonFile] = useState<File | null>(null);
  const [jsonData, setJsonData] = useState<JsonEntry[]>([]);
  const [selectedType, setSelectedType] = useState<"job" | "internship">("job");
  const [isUploading, setIsUploading] = useState(false);
  const {
    cuvetteOpportunities,
    setCuvetteOpportunities,
    removeCuvetteOpportunity,
  } = useJobOpportunities();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Fetch opportunities from HTML
  const handleHtmlUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setHtmlFile(file);
    setIsUploading(true);
    try {
      const rawOps: Opportunity[] = await scrapeCuvette(file);
      setCuvetteOpportunities(rawOps);
      toast({
        title: "HTML processed",
        description: `Found ${rawOps.length} opportunities`,
      });
    } catch {
      toast({ title: "Error processing HTML", variant: "destructive" });
    } finally {
      setIsUploading(false);
    }
  };

  // Parse JSON locally
  const handleJsonSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setJsonFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result as string);
        setJsonData(parsed.data || []);
        toast({ title: "JSON loaded" });
      } catch {
        toast({ title: "Invalid JSON", variant: "destructive" });
      }
    };
    reader.readAsText(file);
  };

  // Attach IDs once user confirms
  const handleApplyJson = () => {
    if (!jsonData.length) {
      toast({ title: "No JSON data", variant: "destructive" });
      return;
    }
    const jsonIds = jsonData.map((d) => d._id);
    console.log("JSON IDs:", jsonIds);
    let index = 0;
    const enriched = cuvetteOpportunities.map((op) => {
      console.log("Processing Opportunity:", jsonIds[index]);
      if (index >= jsonIds.length) {
        return { ...op, type: selectedType };
      }
      const opp = {
        ...op,
        id: jsonIds[index],
        type: selectedType,
        applyUrl: `https://cuvette.tech/${selectedType}/${jsonIds[index]}`,
      };
      index = index + 1;
      return opp;
    });
    setCuvetteOpportunities(enriched);
    toast({ title: "JSON applied", description: `Tagged as ${selectedType}s` });
  };

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-green-400 to-green-600 bg-clip-text text-transparent">
            Cuvette Opportunities
          </h1>
          <p className="text-gray-300 text-lg">
            Upload HTML to fetch opportunities, then JSON and select type before
            applying.
          </p>
        </div>

        {/* Uploads */}
        <div className="glass rounded-2xl p-8 flex flex-col md:flex-row gap-8">
          {/* HTML */}
          <label className="cursor-pointer flex-1">
            <input
              type="file"
              accept=".html"
              onChange={handleHtmlUpload}
              className="hidden"
              disabled={isUploading}
            />
            <div className="border-2 border-dashed border-green-500/30 rounded-xl p-12 hover:border-green-500/50 transition">
              {isUploading ? (
                <Loader className="w-12 h-12 text-green-500 animate-spin mx-auto" />
              ) : htmlFile ? (
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto" />
              ) : (
                <Upload className="w-12 h-12 text-green-500 mx-auto" />
              )}
              <p className="text-center mt-2 text-white">
                {htmlFile?.name || "Upload HTML"}
              </p>
            </div>
          </label>

          {/* JSON + Type selector */}
          <div className="flex-1 space-y-4">
            <label className="cursor-pointer block">
              <input
                type="file"
                accept=".json"
                onChange={handleJsonSelect}
                className="hidden"
              />
              <div className="border-2 border-dashed border-green-500/30 rounded-xl p-12 hover:border-green-500/50 transition text-center">
                <Upload className="w-12 h-12 text-green-500 mx-auto" />
                <p className="text-white mt-2">
                  {jsonFile?.name || "Select JSON"}
                </p>
              </div>
            </label>
            <div className="flex items-center space-x-4">
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value as any)}
                className="bg-gray-800 text-white px-4 py-2 rounded-lg"
              >
                <option value="internship">Internships</option>
                <option value="job">Jobs</option>
              </select>
              <button
                onClick={handleApplyJson}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg"
              >
                Apply JSON
              </button>
            </div>
          </div>
        </div>

        {/* Render Opportunities */}
        {cuvetteOpportunities.length > 0 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">
              Found {cuvetteOpportunities.length} Opportunities
            </h2>
            {cuvetteOpportunities.map((op) => (
              <div
                key={op.id || `${op.name}-${op.company}`}
                className="glass rounded-xl p-6 border border-green-500/20 hover:border-green-500/50 transition-all duration-300"
              >
                <div className="flex items-start gap-6">
                  {/* Company Logo */}
                  <div className="flex-shrink-0">
                    {op.imageUrl && op.imageUrl.startsWith("http") ? (
                      <img
                        src={op.imageUrl}
                        alt={op.company}
                        className="w-20 h-20 rounded-lg object-cover border-2 border-green-500/50"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = placeholder;
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

                  {/* Details */}
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-2xl font-bold text-white mb-1">
                          {op.name}
                        </h3>
                        <p className="text-green-400 font-medium text-lg mb-3">
                          {op.company}
                        </p>
                      </div>
                      <div className="flex items-center space-x-3 ml-4">
                        <a
                          href={op.applyUrl || `https://cuvette.tech`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() =>
                            navigate(
                              `/apply?company=${encodeURIComponent(
                                op.company
                              )}&role=${encodeURIComponent(
                                op.name
                              )}&platform=cuvette`
                            )
                          }
                          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors duration-300 text-sm"
                        >
                          <ExternalLink size={16} />
                          <span>Apply</span>
                        </a>
                        <a
                          href={`https://www.linkedin.com/company/${op.company
                            .toLocaleLowerCase()
                            .split(" ")
                            .join("-")}/people/`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => {
                            navigate(
                              `/cold-email?company=${encodeURIComponent(
                                op.company
                              )}&role=${encodeURIComponent(op.name)}&platform=cuvette`
                            );
                          }}
                          className="bg-stellar-cyan hover:bg-stellar-cyan/80 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors duration-300 text-sm"
                        >
                          <ExternalLink size={16} />
                          <span>Cold Email</span>
                        </a>
                        <button
                          onClick={() =>
                            removeCuvetteOpportunity(op.id, op.name, op.company)
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
                          💰 {op.salary || "N/A"}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm text-gray-400">Location</span>
                        <span className="font-semibold">
                          📍 {op.location || "N/A"}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm text-gray-400">Duration</span>
                        <span className="font-semibold">
                          ⏳ {op.duration || "N/A"}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm text-gray-400">Mode</span>
                        <span className="font-semibold">
                          {op.type === "job" ? op.mode || "N/A" : "N/A"}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm text-gray-400">
                          Start Date
                        </span>
                        <span className="font-semibold">
                          📅 {op.startDate || "N/A"}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm text-gray-400">Office</span>
                        <span className="font-semibold">
                          🏢 {op.officeLocation || "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="border-t border-green-500/20 mt-4 pt-3 flex justify-between items-center text-sm text-gray-400">
                  <span>
                    <strong>Apply By:</strong> {op.applyBy || "N/A"}
                  </span>
                  <span>
                    <strong>Posted:</strong> {op.postedAgo || "N/A"}
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
